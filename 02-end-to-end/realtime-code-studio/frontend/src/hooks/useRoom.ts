import { useState, useEffect, useCallback, useRef } from 'react';
import {
  rtdb, ref, set, onValue, update, onDisconnect, remove,
  isFirebaseConfigured, push, get
} from '@/lib/firebase';

export interface UserPresence {
  id: string;
  username: string;
  color: string;
  cursor?: { lineNumber: number; column: number };
  lastActive: number;
}

const DEFAULT_CODE: Record<string, string> = {
  javascript: `// Welcome to CodeCollab! 🚀
// Start coding and collaborate in real-time

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`,
  python: `# Welcome to CodeCollab! 🚀
# Start coding and collaborate in real-time

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
`,
  typescript: `// Welcome to CodeCollab! 🚀
// Start coding and collaborate in real-time

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`,
};

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#FF9999', '#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8'
];

export const useRoom = (roomId: string | null, currentUser: { username: string } | null) => {
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);

  const userIdRef = useRef<string>(crypto.randomUUID());
  const userColorRef = useRef<string>(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const isLocalUpdate = useRef(false);
  const lastSyncedCode = useRef(code);

  const localStorageKey = roomId ? `room_${roomId}` : null;

  // Local storage fallback
  const saveToLocalStorage = useCallback((data: any) => {
    if (!localStorageKey) return;
    const existing = localStorage.getItem(localStorageKey);
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem(localStorageKey, JSON.stringify({ ...parsed, ...data, lastUpdated: Date.now() }));
  }, [localStorageKey]);

  // Sync Room Data (Code & Language)
  useEffect(() => {
    if (!roomId || !isFirebaseConfigured || !rtdb) {
      if (!isFirebaseConfigured) {
        // Load from local storage if firebase not available
        const saved = localStorageKey ? localStorage.getItem(localStorageKey) : null;
        if (saved) {
          const data = JSON.parse(saved);
          if (data.code) setCode(data.code);
          if (data.language) setLanguage(data.language);
        }
        setIsConnected(true);
      }
      return;
    }

    const roomRef = ref(rtdb, `rooms/${roomId}`);

    // Subscribe to room changes
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        if (!isLocalUpdate.current && data.code && data.code !== lastSyncedCode.current) {
          setCode(data.code);
          lastSyncedCode.current = data.code;
        }
        if (data.language && data.language !== language) {
          setLanguage(data.language);
        }
      } else {
        // Initialize if empty
        set(roomRef, {
          code: DEFAULT_CODE.javascript,
          language: 'javascript',
          createdAt: Date.now()
        });
      }
      setIsConnected(true);
      setIsSyncing(false);
    }, (err) => {
      console.error('RTDB Error:', err);
      setError('Connection lost. Working offline.');
      setIsConnected(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Handle Presence
  useEffect(() => {
    if (!roomId || !currentUser || !isFirebaseConfigured || !rtdb) return;

    const userRef = ref(rtdb, `rooms/${roomId}/users/${userIdRef.current}`);
    const connectedRef = ref(rtdb, '.info/connected');

    const handlePresence = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected)!
        const presence: UserPresence = {
          id: userIdRef.current,
          username: currentUser.username,
          color: userColorRef.current,
          lastActive: Date.now()
        };

        // When I disconnect, remove this device
        onDisconnect(userRef).remove();

        // Add this device to my connections list
        set(userRef, presence);
      }
    });

    // Subscribe to other users
    const usersRef = ref(rtdb, `rooms/${roomId}/users`);
    const handleUsers = onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const usersList = Object.values(data) as UserPresence[];
        setActiveUsers(usersList.filter(u => u.id !== userIdRef.current));
      } else {
        setActiveUsers([]);
      }
    });

    return () => {
      handlePresence();
      handleUsers();
      remove(userRef);
    };
  }, [roomId, currentUser]);

  // Update Code
  const updateCode = useCallback(async (newCode: string) => {
    setCode(newCode);

    if (!roomId) return;

    // Use a small timeout to debounce slightly but keep it snappy
    isLocalUpdate.current = true;
    lastSyncedCode.current = newCode;

    if (!isFirebaseConfigured || !rtdb) {
      saveToLocalStorage({ code: newCode });
      return;
    }

    try {
      setIsSyncing(true);
      await update(ref(rtdb, `rooms/${roomId}`), {
        code: newCode,
        lastUpdated: Date.now()
      });
    } catch (err) {
      console.error('Failed to update code:', err);
    } finally {
      setIsSyncing(false);
      // Reset local update flag after a short delay to allow echo
      setTimeout(() => { isLocalUpdate.current = false; }, 100);
    }
  }, [roomId, saveToLocalStorage]);

  // Update Language
  const updateLanguage = useCallback(async (newLanguage: string) => {
    setLanguage(newLanguage);

    // Check if we should reset code to default for this language
    const isDefaultCode = Object.values(DEFAULT_CODE).some(c => c.trim() === code.trim());
    let codeToUpdate = code;

    if (isDefaultCode && DEFAULT_CODE[newLanguage]) {
      codeToUpdate = DEFAULT_CODE[newLanguage];
      setCode(codeToUpdate);
    }

    if (!roomId) return;

    if (!isFirebaseConfigured || !rtdb) {
      saveToLocalStorage({ language: newLanguage, code: codeToUpdate });
      return;
    }

    await update(ref(rtdb, `rooms/${roomId}`), {
      language: newLanguage,
      code: codeToUpdate,
      lastUpdated: Date.now()
    });
  }, [roomId, code, saveToLocalStorage]);

  // Update Cursor
  const updateCursor = useCallback((position: { lineNumber: number; column: number } | null) => {
    if (!roomId || !currentUser || !isFirebaseConfigured || !rtdb) return;

    const userRef = ref(rtdb, `rooms/${roomId}/users/${userIdRef.current}`);
    update(userRef, {
      cursor: position || null,
      lastActive: Date.now()
    });
  }, [roomId, currentUser]);

  return {
    code,
    language,
    isConnected,
    isSyncing,
    error,
    activeUsers,
    updateCode,
    updateLanguage,
    updateCursor,
    isFirebaseConfigured,
    currentUserColor: userColorRef.current
  };
};
