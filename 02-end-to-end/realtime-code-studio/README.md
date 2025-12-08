# Realtime Code Studio

A professional-grade, collaborative real-time code editor with live execution and leaderboard. Multiple users can create rooms, share links, edit code simultaneously, and compete on a live leaderboard.

## 🎯 Key Features

✅ **Create & Share Room Links** — Generate shareable links to collaborate  
✅ **Real-time Collaborative Editing** — Multiple users edit simultaneously with live sync  
✅ **Real-time Updates** — Firebase Realtime Database or local sync  
✅ **Multi-language Syntax Highlighting** — JavaScript, TypeScript, Python with Monaco Editor  
✅ **Safe Browser-side Code Execution** — Pyodide (Python WASM) + Native JS execution  
✅ **Live Leaderboard** — Track scores, execution speed, and success rates  
✅ **Production-Ready** — Full-stack containerization with docker-compose  

## 📁 Project Structure

```
realtime-code-studio/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # React UI components
│   │   ├── hooks/               # Custom React hooks (useRoom, useLeaderboard)
│   │   ├── lib/                 # Utilities (codeRunner, firebase)
│   │   ├── pages/               # Page components
│   │   └── __tests__/           # Frontend tests
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── Dockerfile               # Frontend container
│   └── README.md                # Frontend documentation
│
├── backend/                     # Flask REST API
│   ├── app.py                   # Flask application with SQLAlchemy models
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Backend container
│   ├── .env.example             # Environment variables template
│   └── README.md                # Backend API documentation
│
├── docker-compose.yml           # Orchestration: frontend + backend
├── README.md                    # This file - project overview
└── AGENTS.md                    # AI agent configuration
```

### Why This Structure?

**Industry Best Practice:**
- ✅ **Separation of Concerns** — Frontend and backend are independently deployable
- ✅ **Clear Boundaries** — Each service has its own dependencies and configuration
- ✅ **Team Scalability** — Different teams can work on frontend/backend separately
- ✅ **Microservices Ready** — Easy to scale services independently
- ✅ **Clean Root** — Root contains only orchestration files (docker-compose, README)
- ✅ **CI/CD Friendly** — Can build images separately or together

## Prerequisites

- Docker & Docker Compose
- Node.js (v18+) or Bun (for local frontend development)
- Python 3.11+ (for local backend development)
- Firebase project with Realtime Database enabled (optional, for real-time sync)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for backend development)

### Run Full Stack (Recommended)

```bash
# Start both frontend and backend
docker-compose up -d

# View logs
docker-compose logs -f

# Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

### Run Locally (Development)

**Terminal 1 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

## Installation

1. Clone the repository:
```bash
cd /workspaces/ai-dev-tools-zoomcamp-2025-homework/02-end-to-end/realtime-code-studio
```

2. **For Frontend** (local development):
```bash
cd frontend
npm install
```

3. **For Backend** (local development):
```bash
cd backend
pip install -r requirements.txt
```

4. Configure Firebase (optional, for real-time sync):
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Realtime Database in your project
   - Copy your Firebase configuration
   - Update `frontend/src/lib/firebase.ts` with your Firebase credentials

## ✅ Requirements Compliance

### 1. ✅ Create a link and share it with candidates
- **Implementation**: Frontend generates `roomId` → shareable URL with query param
- **Location**: `frontend/src/pages/Index.tsx` (room creation)
- **Example**: `http://localhost:3000/room/abc123def456`

### 2. ✅ Allow everyone who connects to edit code in the code panel
- **Implementation**: Firebase Realtime Database syncs code across clients
- **Location**: `frontend/src/hooks/useRoom.ts` (real-time sync logic)
- **Alternative**: Local sync for non-Firebase mode
- **UI**: `frontend/src/components/CodeEditor.tsx` (Monaco Editor)

### 3. ✅ Show real-time updates to all connected users
- **Implementation**: Firebase listeners trigger on code changes
- **Location**: `frontend/src/hooks/useRoom.ts`
- **Features**: Shows connection status, sync indicator, execution results

### 4. ✅ Support syntax highlighting for multiple languages
- **Implementation**: Monaco Editor with language-specific configurations
- **Languages**: JavaScript, TypeScript, Python
- **Location**: `frontend/src/components/CodeEditor.tsx`
- **Features**: Semantic highlighting, bracket pair colorization, minimap

### 5. ✅ Execute code safely in the browser
- **Implementation**:
  - **JavaScript/TypeScript**: Native Function constructor with sandboxed console
  - **Python**: Pyodide (compiled to WebAssembly) loaded from CDN
- **Location**: `frontend/src/lib/codeRunner.ts`
- **Safety**: 30-second timeout, no server code execution, zero networking

## Testing

### Frontend Tests

Execute the complete test suite:

```bash
cd frontend
npm run test
```

Run tests in watch mode:

```bash
cd frontend
npm run test -- --watch
```

Generate coverage report:

```bash
cd frontend
npm run test:coverage
```

### Run Integration Tests Only

Run only the client-server integration tests:

```bash
npm run test src/__tests__/integration.test.ts
```

### Run Tests with Coverage

Generate a code coverage report:

```bash
npm run test:coverage
```

### Run Tests in UI Mode

Interactive test UI with real-time results:

```bash
npm run test:ui
```

## Linting

Check code quality with ESLint:

```bash
npm run lint
```

## Project Structure

```
realtime-code-studio/
├── src/
│   ├── components/            # React UI components
│   │   ├── CodeEditor.tsx     # Main code editor
│   │   ├── EditorToolbar.tsx  # Toolbar with actions
│   │   ├── OutputConsole.tsx  # Code execution output
│   │   ├── NavLink.tsx        # Navigation component
│   │   └── ui/                # Shadcn UI components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useRoom.ts         # Room state management
│   │   └── use-toast.ts       # Toast notifications
│   ├── lib/                   # Utilities and services
│   │   ├── firebase.ts        # Firebase configuration
│   │   ├── codeRunner.ts      # Code execution engine
│   │   └── utils.ts           # Helper functions
│   ├── pages/                 # Page components
│   │   ├── Index.tsx          # Home page
│   │   ├── Room.tsx           # Collaboration room
│   │   └── NotFound.tsx       # 404 page
│   ├── __tests__/             # Test files
│   │   └── integration.test.ts # Client-server integration tests
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── public/                    # Static assets
├── package.json               # Project dependencies and scripts
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── README.md                  # This file
```

## Backend Setup

The application includes a Flask REST API backend for user management and leaderboard tracking.

### Backend Features
- User registration and profile management
- Score tracking with execution metrics
- Leaderboard with rankings and statistics
- SQLAlchemy ORM for database management
- CORS support for frontend communication

### Starting the Backend

#### Development Mode
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

#### Production Mode with Gunicorn
```bash
cd backend
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

### API Endpoints

#### Leaderboard
```bash
GET /api/leaderboard              # Get all users ranked by performance
GET /api/leaderboard?language=javascript  # Filter by language
```

#### Users
```bash
POST /api/users                   # Create/register user
GET /api/users/<user_id>          # Get user profile
GET /api/users/by-username/<username>  # Get user by username
```

#### Scores
```bash
POST /api/scores                  # Submit execution score
GET /api/scores/<user_id>         # Get user's score history
```

See [backend/README.md](./backend/README.md) for detailed API documentation.

### Backend Configuration

Set environment variables in `backend/.env`:
```
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///users.db
```

For production with PostgreSQL:
```
DATABASE_URL=postgresql://user:password@postgres:5432/leaderboard
```

## Firebase Setup

### Prerequisites
- Firebase project created at https://console.firebase.google.com
- Realtime Database enabled

### Configuration Steps

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Navigate to **Build → Realtime Database**
4. Click **Create Database**
5. Start in **test mode** (for development only)
6. Copy your Firebase config from **Project Settings → General**
7. Update `src/lib/firebase.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Database Rules (Development)

For development/testing, use these permissive rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt"]
      }
    }
  }
}
```

⚠️ **Note:** This allows all read/write access. Before production, implement proper authentication and security rules.

## Usage Guide

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Create a new room** — Enter a room code or generate one

3. **Share the room URL** — Invite collaborators to join

4. **Edit code together** — Changes sync in real-time across all clients

5. **Execute code** — Click "Run" to execute JavaScript

6. **View output** — Results appear in the Output Console

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run all tests |
| `npm run test -- --watch` | Run tests in watch mode |
| `npm run test:ui` | Run tests in interactive UI mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint code with ESLint |

## Integration Tests

The integration test suite (`src/__tests__/integration.test.ts`) verifies:

- ✅ Firebase Realtime Database connection
- ✅ Writing and reading code to/from a room
- ✅ Real-time code synchronization across clients
- ✅ Multi-user collaboration in the same room
- ✅ Code execution results handling
- ✅ Room metadata persistence
- ✅ Room cleanup and deletion

## Docker Deployment

### Building the Docker Image

```bash
# Build the image
docker build -t realtime-code-studio:latest .

# View image details
docker images | grep realtime-code-studio
```

### Running with Docker

#### Frontend Only
```bash
# Run the frontend container
docker run -p 3000:3000 realtime-code-studio:latest

# Access the app at http://localhost:3000
```

#### Full Stack (Frontend + Backend)

Using Docker Compose (recommended):
```bash
# Start both frontend and backend
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop the application
docker-compose down
```

The services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Docker Environment Variables

To enable Firebase real-time sync in Docker, add environment variables to `docker-compose.yml`:

```yaml
services:
  frontend:
    environment:
      VITE_API_URL: http://backend:5000/api
      VITE_FIREBASE_API_KEY: your_api_key
      VITE_FIREBASE_PROJECT_ID: your_project_id
      # ... other Firebase variables
```

## Dev Container Setup

If you are running in a VS Code Dev Container, use the **"Ports"** view to access services:
- **Frontend**: Port 3000
- **Backend**: Port 5000

If accessing via curl inside the container:
```bash
curl http://localhost:3000
curl http://localhost:5000/api/health
```

Troubleshooting:
- If "This site can't be reached", check `docker-compose ps`.
- Ensure `VITE_API_URL` matches the backend service name or localhost depending on your access context.

### Docker Image Specifications

**Frontend:**
- **Base Image**: `node:20-alpine`
- **Total Size**: ~148MB
- **Port**: 3000
- **Multi-stage Build**: Optimized for minimal production image

**Backend:**
- **Base Image**: `python:3.11-slim`
- **Total Size**: ~200MB (estimated)
- **Port**: 5000
- **Production Server**: Gunicorn with 2 workers

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | Frontend UI library |
| **Vite** | Frontend build tool and dev server |
| **TypeScript** | Type safety for both frontend and backend |
| **Flask** | Backend REST API framework |
| **SQLAlchemy** | Database ORM |
| **Firebase Realtime Database** | Real-time code synchronization |
| **Tailwind CSS** | Styling |
| **Shadcn UI** | React component library |
| **Vitest** | Frontend testing framework |
| **Monaco Editor** | Advanced code editor with syntax highlighting |
| **Pyodide** | Python compiled to WebAssembly for browser execution |

## Troubleshooting

### Port Already in Use

If port 5173 is busy, specify a different port:

```bash
npm run dev -- --port 3000
```

### Firebase Connection Errors

- Verify Firebase credentials in `src/lib/firebase.ts`
- Ensure Realtime Database is enabled in Firebase Console
- Check database rules allow read/write access
- Verify internet connection and Firebase project is active

### Tests Fail or Timeout

Run tests with verbose output:

```bash
npm run test -- --reporter=verbose
```

Increase timeout for slow environments:

```bash
npm run test -- --testTimeout=10000
```

### Hot Module Replacement (HMR) Issues

Clear cache and restart:

```bash
rm -rf node_modules/.vite
npm run dev
```

### Build Errors

Clean and rebuild:

```bash
npm run build -- --force
```

## Development Tips

- **Debug mode**: Check browser DevTools for network requests and console logs
- **Firebase Emulator**: Use Firebase Local Emulator Suite for offline testing
- **Component hot reload**: Vite provides instant HMR for React components
- **Type checking**: Run `npx tsc --noEmit` to check types without building

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support & Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- Check `AGENTS.md` for AI agent configuration

## Additional Resources

- Real-time collaboration best practices
- Firebase security best practices: https://firebase.google.com/docs/database/security
- Performance optimization: https://firebase.google.com/docs/database/usage/optimize

---

## 🚀 Deployment

### Deploy to Render

The easiest way to deploy this full-stack application is to use [Render](https://render.com).

1. **Note**: A `render.yaml` Blueprint has been placed at the **root of your repository** to handle this project's subfolder structure automatically.

2. Click the button below to start deployment:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

2. **Configuration Steps**:
   - Render will ask for a **Service Name** (you can keep the defaults).
   - **Environment Variables**: You will be prompted to input your Firebase configuration keys (`VITE_FIREBASE_API_KEY`, etc.).
   - The **Database** will be created automatically (Free plan).

### Manual Deployment

#### Backend
1. Create a **Web Service** on Render.
2. Connect your repo.
3. Root Directory: `backend`
4. Runtime: **Docker**
5. Add `DATABASE_URL` environment variable.

#### Frontend
1. Create a **Static Site** on Render.
2. Connect your repo.
3. Root Directory: `frontend`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`
6. Add `VITE_API_URL` environment variable pointing to your backend URL (e.g., `https://my-backend.onrender.com/api`).
7. Add your Firebase environment variables.

---

**Last Updated:** December 2025  
**Version:** 1.0.0

