# Firebase Setup Guide

Enable real-time code collaboration by connecting Firebase Realtime Database.

## Step 1: Create Firebase Project

1. Go to https://firebase.google.com/
2. Click **"Go to console"** (top right)
3. Click **"Create a project"**
4. Enter project name: `CodeCollab` (or any name)
5. Accept default settings and **Create project**
6. Wait for provisioning (~1 minute)

## Step 2: Enable Realtime Database

1. In Firebase console, go to **Build → Realtime Database** (left sidebar)
2. Click **"Create Database"**
3. Choose region closest to you (e.g., `us-central1`)
4. For **security rules**, choose **"Start in test mode"** (for development)
5. Click **"Enable"**

> ⚠️ **Important**: Test mode has no security. For production, configure proper rules!

## Step 3: Get Your Firebase Config

1. In Firebase console, go to **Project Settings** (gear icon, top right)
2. Scroll down to **"Your apps"** section
3. Click on **Web app** icon (looks like `</>`), or add one if needed
4. Copy the entire `firebaseConfig` object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefg123456"
};
```

## Step 4: Add to Frontend

### Option A: Using `.env.local` File (Recommended for Dev)

1. Create `frontend/.env.local`:

```bash
cd /workspaces/ai-dev-tools-zoomcamp-2025-homework/02-end-to-end/realtime-code-studio/frontend
echo 'VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefg123456' > .env.local
```

2. Replace the values with your actual Firebase config

### Option B: Using Docker (For Container Environment)

1. Create `frontend/.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `docker-compose.yml` to pass these env vars:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      VITE_API_URL: http://localhost:5000/api
      VITE_FIREBASE_API_KEY: ${VITE_FIREBASE_API_KEY}
      VITE_FIREBASE_AUTH_DOMAIN: ${VITE_FIREBASE_AUTH_DOMAIN}
      # ... repeat for all FIREBASE vars
  environment:
    VITE_FIREBASE_API_KEY: ${VITE_FIREBASE_API_KEY}
    # ... repeat for all FIREBASE vars
```

## Step 5: Rebuild and Test

```bash
cd /workspaces/ai-dev-tools-zoomcamp-2025-homework/02-end-to-end/realtime-code-studio

# If using .env.local (local dev)
npm run dev --prefix frontend

# If using Docker (container)
docker-compose down
docker-compose up -d --build
```

## Step 6: Verify Firebase is Connected

1. Open `http://localhost:3000`
2. Look for the alert message at the top
3. Should say: **"Firebase configured"** (instead of "Firebase not configured")
4. Try opening the app in 2 tabs:
   - Tab 1: Type code in editor
   - Tab 2: You should see it appear instantly! ✅

## What Changes When Firebase is Enabled

### Before (Without Firebase):
```
Tab 1: User types "console.log('hello')"
Tab 2: Nothing happens (local storage mode)
```

### After (With Firebase):
```
Tab 1: User types "console.log('hello')"
  ↓
Firebase Realtime Database updates
  ↓
Tab 2: Instantly sees "console.log('hello')" ✅
```

## Troubleshooting

### "Firebase not configured" message still shows

**Check 1**: Environment variables loaded?
```bash
# Inside container
docker-compose exec frontend env | grep VITE_FIREBASE
```

**Check 2**: Variables in frontend code?
```bash
# Check if used correctly
grep -r "VITE_FIREBASE_API_KEY" frontend/src/
```

**Check 3**: Rebuild needed?
```bash
docker-compose down -v
docker-compose up -d --build
```

### Real-time sync not working

1. Check browser console for errors (F12)
2. Verify all env vars are set correctly
3. Check Firebase console - database should show data
4. In Firebase console, go to **Database → Data tab**
5. Should see `rooms/` with room IDs and code

### Permission Denied Errors

**Cause**: Test mode security rules need adjustment
**Fix**: In Firebase console → Realtime Database → Rules tab:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> ⚠️ Only use this for development! Production needs proper auth.

## Production Deployment

When deploying to production, **update security rules**:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "root.child('activeUsers').child(auth.uid).exists()"
      }
    }
  }
}
```

See [Firebase Rules Documentation](https://firebase.google.com/docs/database/security) for complete setup.

## Reference Files

- **Firebase config loading**: `frontend/src/lib/firebase.ts`
- **Real-time sync**: `frontend/src/hooks/useRoom.ts`
- **Environment setup**: `frontend/.env.local` or `frontend/.env`

## Questions?

See `COLLABORATION_GUIDE.md` for more details on testing and features.
