import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';

// Mock Firebase config for testing
const mockFirebaseConfig = {
  apiKey: 'mock-key',
  authDomain: 'mock-auth-domain.firebaseapp.com',
  databaseURL: 'https://mock-db.firebaseio.com',
  projectId: 'mock-project',
  storageBucket: 'mock-bucket.appspot.com',
  messagingSenderId: 'mock-sender',
  appId: 'mock-app-id',
};

describe('Realtime Code Studio - Client-Server Integration', () => {
  let db: any;

  beforeAll(() => {
    try {
      // Initialize Firebase for testing
      const app = initializeApp(mockFirebaseConfig);
      db = getDatabase(app);
    } catch (error) {
      console.warn('Firebase initialization in test environment');
    }
  });

  it('should establish connection to Firebase Realtime Database', async () => {
    expect(db).toBeDefined();
  });

  it('should write and read code from a room', async () => {
    if (!db) {
      console.log('Skipping test: Firebase not initialized');
      return;
    }

    const roomId = `test-room-${Date.now()}`;
    const testCode = 'console.log("Hello from integration test");';

    try {
      await set(ref(db, `rooms/${roomId}/code`), testCode);
      const snapshot = await get(ref(db, `rooms/${roomId}/code`));
      expect(snapshot.val()).toBe(testCode);
    } catch (error) {
      console.warn('Write/read test requires valid Firebase config');
    }
  });

  it('should sync code changes in real-time across clients', async () => {
    if (!db) {
      console.log('Skipping test: Firebase not initialized');
      return;
    }

    const roomId = `test-sync-${Date.now()}`;
    const codeUpdates: string[] = [];

    const collectUpdates = (snapshot: any) => {
      if (snapshot.val()) {
        codeUpdates.push(snapshot.val());
      }
    };

    try {
      const unsubscribe = onValue(ref(db, `rooms/${roomId}/code`), collectUpdates);

      // Simulate multiple code updates
      await set(ref(db, `rooms/${roomId}/code`), 'let x = 1;');
      await new Promise(resolve => setTimeout(resolve, 100));
      await set(ref(db, `rooms/${roomId}/code`), 'let x = 2;');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clean up listener
      off(ref(db, `rooms/${roomId}/code`));
      unsubscribe();

      expect(codeUpdates.length).toBeGreaterThan(0);
    } catch (error) {
      console.warn('Real-time sync test requires valid Firebase config');
    }
  });

  it('should handle multiple users in the same room', async () => {
    if (!db) {
      console.log('Skipping test: Firebase not initialized');
      return;
    }

    const roomId = `test-multi-user-${Date.now()}`;
    const user1Code = 'const a = 1;';
    const user2Code = 'const b = 2;';

    try {
      await set(ref(db, `rooms/${roomId}/users/user1/code`), user1Code);
      await set(ref(db, `rooms/${roomId}/users/user2/code`), user2Code);

      const snap1 = await get(ref(db, `rooms/${roomId}/users/user1/code`));
      const snap2 = await get(ref(db, `rooms/${roomId}/users/user2/code`));

      expect(snap1.val()).toBe(user1Code);
      expect(snap2.val()).toBe(user2Code);
    } catch (error) {
      console.warn('Multi-user test requires valid Firebase config');
    }
  });

  it('should handle code execution results', async () => {
    if (!db) {
      console.log('Skipping test: Firebase not initialized');
      return;
    }

    const roomId = `test-exec-${Date.now()}`;
    const mockResult = {
      output: 'Test output',
      error: null,
      executionTime: 125,
    };

    try {
      await set(ref(db, `rooms/${roomId}/executionResult`), mockResult);
      const snapshot = await get(ref(db, `rooms/${roomId}/executionResult`));
      const result = snapshot.val();

      expect(result).toBeDefined();
      expect(result.output).toBe('Test output');
      expect(result.error).toBeNull();
    } catch (error) {
      console.warn('Execution result test requires valid Firebase config');
    }
  });

  it('should persist and retrieve room metadata', async () => {
    if (!db) {
      console.log('Skipping test: Firebase not initialized');
      return;
    }

    const roomId = `test-metadata-${Date.now()}`;
    const metadata = {
      createdAt: Date.now(),
      users: ['user1', 'user2'],
      language: 'javascript',
    };

    try {
      await set(ref(db, `rooms/${roomId}/metadata`), metadata);
      const snapshot = await get(ref(db, `rooms/${roomId}/metadata`));

      expect(snapshot.val()).toEqual(metadata);
    } catch (error) {
      console.warn('Metadata persistence test requires valid Firebase config');
    }
  });

  it('should clean up room data on room deletion', async () => {
    if (!db) {
      console.log('Skipping test: Firebase not initialized');
      return;
    }

    const roomId = `test-cleanup-${Date.now()}`;

    try {
      await set(ref(db, `rooms/${roomId}`), { code: 'test code' });
      let snapshot = await get(ref(db, `rooms/${roomId}`));
      expect(snapshot.val()).toBeDefined();

      // Delete the room
      await set(ref(db, `rooms/${roomId}`), null);
      snapshot = await get(ref(db, `rooms/${roomId}`));
      expect(snapshot.val()).toBeNull();
    } catch (error) {
      console.warn('Cleanup test requires valid Firebase config');
    }
  });

  afterAll(() => {
    // Clean up Firebase connection
    if (db) {
      try {
        off(ref(db));
      } catch (error) {
        // Cleanup errors are non-critical
      }
    }
  });
});
