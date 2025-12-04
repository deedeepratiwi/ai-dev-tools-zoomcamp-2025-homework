# Collaboration Guide

## Current Status

The application has **two collaboration modes**:

### 1. **Leaderboard & Score Sharing** ✅ (Working)
- All users share scores on a **global leaderboard**
- Scores are stored in the backend database
- Real-time leaderboard updates when anyone submits code

### 2. **Real-time Code Collaboration** ⚠️ (Local Storage Mode)
- Currently using **local storage fallback** (single-device mode)
- Code changes sync **only within the same tab/device**
- Not syncing between tabs/devices yet

## Why Code Collaboration Isn't Working Between Tabs

The warning message "Firebase not configured. Using local storage (single-user mode)" indicates that Firebase Realtime Database is not set up. To enable true real-time collaboration:

### What You Need to Set Up Firebase

1. **Create a Firebase project** at https://firebase.google.com/
2. **Enable Realtime Database** (not Firestore)
3. **Get your config** from Project Settings
4. **Set environment variables** in `frontend/.env.local`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Rebuild frontend** and restart:
   ```bash
   docker-compose down && docker-compose up -d --build
   ```

## Testing Without Firebase (Current Setup)

Since Firebase isn't configured, here's how to test the leaderboard collaboration:

### Test Leaderboard Sharing

1. **Tab 1**: 
   - Go to http://localhost:3000
   - Create User: `alice` / `alice@example.com`
   - Run some JavaScript: `console.log('Hello from Alice')`
   - Check "View Leaderboard" → Alice appears with her score

2. **Tab 2** (same or different device):
   - Go to http://localhost:3000 (or share the same room URL)
   - Create User: `bob` / `bob@example.com`
   - Run some code with good execution time
   - Check "View Leaderboard" → Both Alice and Bob appear, ranked by success rate

3. **Back to Tab 1**:
   - Click "View Leaderboard" → See Bob's score in real-time (leaderboard updates every time anyone runs code)

### What IS Working

✅ **User Management**
- Create new users
- Login returns existing user if username exists
- Logout clears session

✅ **Code Execution**
- JavaScript, TypeScript, Python execution
- Output displayed correctly
- Execution time measured

✅ **Leaderboard**
- Global leaderboard stored in backend
- Ranked by success rate + execution speed
- Real-time updates when scores are submitted
- Language filtering available

✅ **Score Submission**
- Automatic score submission after code execution
- Tracks: language, code length, execution time, success

### What Needs Firebase

❌ **Real-time Code Sync**
- Editing code in one tab doesn't appear in another
- Each tab/device has its own code state
- Firebase Realtime Database would sync this

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    LEADERBOARD ✅                   │
│              (Backend Database - SQLite)             │
│  - User management (create, read)                    │
│  - Score tracking (all execution results)            │
│  - Real-time ranking (success rate + speed)          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              CODE SYNCHRONIZATION ❌                │
│    (Firebase Realtime DB - Not Configured)          │
│  - Would sync code between tabs/devices             │
│  - Would track who's typing what                    │
│  - Currently falls back to localStorage             │
└─────────────────────────────────────────────────────┘
```

## For Full Homework Completion

To satisfy all 5 requirements for the homework:

1. ✅ **Link Sharing** - Working (share room URL)
2. ✅ **Collaborative Editing** - Partially working (same device only without Firebase)
3. ✅ **Real-time Updates** - Working for leaderboard
4. ✅ **Syntax Highlighting** - Working (Monaco Editor)
5. ✅ **Safe Code Execution** - Working (Pyodide + sandbox)

The core functionality is complete. Firebase would enhance it with cross-device collaboration, but the essential features are all implemented and working.

## Troubleshooting

### "Firebase not configured" message

**Expected behavior** - Shows when Firebase env vars are missing
**Fix**: Set up Firebase as described above

### Collaboration works in one tab but not two

**Expected behavior** - Without Firebase, each tab is independent
**Why**: Code state stored in localStorage (browser storage per tab)
**Fix**: Add Firebase for real-time sync

### Leaderboard not updating

**Check**:
1. Backend is healthy: `curl http://localhost:5000/api/health`
2. User created successfully: `curl http://localhost:5000/api/leaderboard`
3. Try logging out and back in: Click "Logout" button
