# Realtime Code Studio

A collaborative, real-time code editor built with React, Vite, Firebase, and TypeScript. Multiple users can write, edit, and execute code together in real-time.

## Features

- **Real-time Collaboration** — Multiple users can edit code simultaneously with live synchronization
- **Live Code Execution** — Run JavaScript code and see output instantly in the output console
- **Firebase Backend** — Seamless real-time database synchronization across clients
- **Modern UI** — Built with Shadcn UI and Tailwind CSS for a polished user experience
- **TypeScript** — Fully typed for safety and excellent developer experience
- **Room-based Sharing** — Create and join rooms to collaborate with others

## Prerequisites

- Node.js (v18+) or Bun
- npm, yarn, pnpm, or Bun package manager
- Firebase project with Realtime Database enabled

## Installation

1. Clone the repository:
```bash
cd /workspaces/ai-dev-tools-zoomcamp-2025-homework/02-end-to-end/realtime-code-studio
```

2. Install dependencies using npm, yarn, pnpm, or Bun:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Realtime Database in your project
   - Copy your Firebase configuration
   - Update `src/lib/firebase.ts` with your Firebase credentials

## Running the Application

### Development Server

Start the Vite development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

Open in browser:
```bash
$BROWSER http://localhost:5173
```

### Production Build

Build the application for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

Then open in browser:
```bash
$BROWSER http://localhost:4173
```

## Testing

### Run All Tests

Execute the complete test suite:

```bash
npm run test
```

### Run Tests in Watch Mode

Tests will re-run on file changes:

```bash
npm run test -- --watch
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

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **Vite** | Build tool and dev server |
| **TypeScript** | Type safety |
| **Firebase Realtime Database** | Real-time backend |
| **Tailwind CSS** | Styling |
| **Shadcn UI** | Component library |
| **Vitest** | Testing framework |

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

**Last Updated:** December 2025  
**Version:** 1.0.0
