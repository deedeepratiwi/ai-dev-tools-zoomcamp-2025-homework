import { useState, useEffect, useCallback, useRef } from 'react';
import { db, doc, setDoc, onSnapshot, updateDoc, isFirebaseConfigured } from '@/lib/firebase';

export interface RoomData {
  code: string;
  language: string;
  createdAt: number;
  lastUpdated: number;
  users: number;
}

const DEFAULT_CODE: Record<string, string> = {
  javascript: `// Welcome to CodeCollab! 🚀
// Start coding and collaborate in real-time

function greet(name) {
  return \`Hello, \${name}! Welcome to collaborative coding.\`;
}

console.log(greet('World'));

// Try adding some calculations
const sum = (a, b) => a + b;
console.log('2 + 3 =', sum(2, 3));
`,
  python: `# Welcome to CodeCollab! 🚀
# Start coding and collaborate in real-time

def greet(name):
    return f"Hello, {name}! Welcome to collaborative coding."

print(greet("World"))

# Try adding some calculations
numbers = [1, 2, 3, 4, 5]
print("Sum:", sum(numbers))
print("Average:", sum(numbers) / len(numbers))
`,
  typescript: `// Welcome to CodeCollab! 🚀
// Start coding and collaborate in real-time

interface User {
  name: string;
  role: string;
}

function greet(user: User): string {
  return \`Hello, \${user.name}! You are a \${user.role}.\`;
}

const developer: User = { name: 'World', role: 'Developer' };
console.log(greet(developer));

// TypeScript will be executed as JavaScript
const numbers: number[] = [1, 2, 3, 4, 5];
console.log('Numbers:', numbers);
`,
};

export const useRoom = (roomId: string | null) => {
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [language, setLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isLocalUpdate = useRef(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedCode = useRef(code);

  // Local storage fallback for when Firebase is not configured
  const localStorageKey = roomId ? `room_${roomId}` : null;

  const saveToLocalStorage = useCallback((data: Partial<RoomData>) => {
    if (!localStorageKey) return;
    const existing = localStorage.getItem(localStorageKey);
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem(localStorageKey, JSON.stringify({ ...parsed, ...data, lastUpdated: Date.now() }));
  }, [localStorageKey]);

  const loadFromLocalStorage = useCallback(() => {
    if (!localStorageKey) return null;
    const data = localStorage.getItem(localStorageKey);
    return data ? JSON.parse(data) : null;
  }, [localStorageKey]);

  // Initialize room
  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      if (!isFirebaseConfigured || !db) {
        // Use local storage fallback
        const localData = loadFromLocalStorage();
        if (localData) {
          setCode(localData.code || DEFAULT_CODE.javascript);
          setLanguage(localData.language || 'javascript');
        } else {
          saveToLocalStorage({
            code: DEFAULT_CODE.javascript,
            language: 'javascript',
            createdAt: Date.now(),
          });
        }
        setIsConnected(true);
        setError('Firebase not configured. Using local storage (single-user mode).');
        return;
      }

      try {
        const roomRef = doc(db, 'rooms', roomId);
        
        // Listen for real-time updates
        const unsubscribe = onSnapshot(roomRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as RoomData;
            
            // Only update if it's not a local update
            if (!isLocalUpdate.current && data.code !== lastSyncedCode.current) {
              setCode(data.code);
              setLanguage(data.language);
              lastSyncedCode.current = data.code;
            }
            isLocalUpdate.current = false;
          } else {
            // Create new room
            setDoc(roomRef, {
              code: DEFAULT_CODE.javascript,
              language: 'javascript',
              createdAt: Date.now(),
              lastUpdated: Date.now(),
              users: 1,
            });
          }
          setIsConnected(true);
        }, (err) => {
          console.error('Firestore error:', err);
          setError('Connection error. Changes may not sync.');
          setIsConnected(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Room initialization error:', err);
        setError('Failed to connect to room.');
      }
    };

    const cleanup = initRoom();
    return () => {
      cleanup?.then(unsub => unsub?.());
    };
  }, [roomId, loadFromLocalStorage, saveToLocalStorage]);

  // Update code with debouncing
  const updateCode = useCallback((newCode: string) => {
    setCode(newCode);
    
    if (!roomId) return;

    // Clear existing timeout
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    // Debounce updates to Firestore
    updateTimeout.current = setTimeout(async () => {
      setIsSyncing(true);
      isLocalUpdate.current = true;
      lastSyncedCode.current = newCode;

      if (!isFirebaseConfigured || !db) {
        saveToLocalStorage({ code: newCode });
        setIsSyncing(false);
        return;
      }

      try {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          code: newCode,
          lastUpdated: Date.now(),
        });
      } catch (err) {
        console.error('Failed to update code:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 300);
  }, [roomId, saveToLocalStorage]);

  // Update language
  const updateLanguage = useCallback(async (newLanguage: string) => {
    setLanguage(newLanguage);
    
    // Set default code for the new language if current code is default
    const isDefaultCode = Object.values(DEFAULT_CODE).some(defaultCode => 
      code.trim() === defaultCode.trim()
    );
    
    if (isDefaultCode && DEFAULT_CODE[newLanguage]) {
      setCode(DEFAULT_CODE[newLanguage]);
    }

    if (!roomId) return;

    if (!isFirebaseConfigured || !db) {
      saveToLocalStorage({ 
        language: newLanguage,
        code: isDefaultCode ? DEFAULT_CODE[newLanguage] : code 
      });
      return;
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        language: newLanguage,
        ...(isDefaultCode && DEFAULT_CODE[newLanguage] ? { code: DEFAULT_CODE[newLanguage] } : {}),
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error('Failed to update language:', err);
    }
  }, [roomId, code, saveToLocalStorage]);

  return {
    code,
    language,
    isConnected,
    isSyncing,
    error,
    updateCode,
    updateLanguage,
    isFirebaseConfigured,
  };
};
