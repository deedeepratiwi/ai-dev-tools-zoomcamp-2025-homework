import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputConsole, ConsoleOutput } from '@/components/OutputConsole';
import { EditorToolbar } from '@/components/EditorToolbar';
import { useRoom } from '@/hooks/useRoom';
import { runCode } from '@/lib/codeRunner';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { AlertCircle, LogOut, Moon, Sun } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getOrCreateUser } from '@/lib/api';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  // Local state for user
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Derive currentUser object
  const currentUser = useMemo(() => {
    return username ? { username } : null;
  }, [username]);

  const {
    code,
    language,
    isConnected,
    isSyncing,
    error,
    activeUsers = [],
    updateCode,
    updateLanguage,
    updateCursor,
    isFirebaseConfigured,
    currentUserColor = '#ccc',
  } = useRoom(roomId || null, currentUser) || {};

  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize user dialog
  useEffect(() => {
    if (!username || !email) {
      setShowUserDialog(true);
    }
  }, [username, email]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleSetUser = async () => {
    if (!username || !email) {
      toast.error('Please enter username and email');
      return;
    }

    try {
      await getOrCreateUser(username, email);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);
      setShowUserDialog(false);
      toast.success('User created/logged in successfully');
    } catch (err) {
      toast.error('Failed to create user');
    }
  };

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutputs([]); // Clear outputs on each new run

    try {
      if (language === 'python') {
        toast.info('Loading Python runtime...', { duration: 2000 });
      }

      const result = await runCode(code, language);

      const output = {
        id: uuidv4(),
        content: result.output,
        type: (result.error ? 'error' : 'output') as 'error' | 'output',
        timestamp: Date.now(),
        executionTime: result.executionTime,
      };

      setOutputs([output]);
    } catch (err) {
      setOutputs([
        {
          id: uuidv4(),
          content: 'Failed to execute code',
          type: 'error',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const clearConsole = useCallback(() => {
    setOutputs([]);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setUsername('');
    setEmail('');
    setShowUserDialog(true);
    toast.success('Logged out successfully');
  }, []);

  const handleLeaveRoom = useCallback(() => {
    // Keep user session - just navigate away
    // localStorage.removeItem('username');
    // localStorage.removeItem('email');

    // Attempt to remove user from presence if connected (optional, as onDisconnect handles this usually)
    // For now, just reload to root which effectively leaves
    window.location.href = '/';
  }, []);

  const isLoggedIn = !!username && !!email;

  return (
    <div className={`h-screen flex flex-col`}>
      {/* ... (keep user dialog) ... */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          {/* ... Dialog Content ... */}
          <DialogHeader>
            <DialogTitle>Join Session</DialogTitle>
            <DialogDescription>
              Enter your username to join this coding session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleSetUser} className="w-full">
              Start Coding
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header Bar - Always Visible */}
      <div className="px-4 pt-2 flex justify-between items-center gap-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isLoggedIn && (
              <>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentUserColor || '#ccc' }}
                />
                {username}
              </>
            )}
          </div>
          {/* Online Users */}
          {activeUsers?.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">Online:</span>
              <div className="flex items-center gap-1">
                {activeUsers?.map((user) => (
                  <div
                    key={user.id}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-help border-2 border-background"
                    style={{ backgroundColor: user.color }}
                    title={user.username}
                  >
                    {user.username?.substring(0, 1).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="gap-2"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          {!isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowUserDialog(true)}
            >
              <LogOut className="h-4 w-4" />
              Login
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={handleLeaveRoom}
              >
                <LogOut className="h-4 w-4 rotate-180" />
                Leave Room
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>

      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Welcome to CodeCollab</h2>
            <p className="text-muted-foreground">Please login to join the session</p>
            <Button onClick={() => setShowUserDialog(true)}>Login to Join</Button>
          </div>
        </div>
      ) : (
        <>
          <EditorToolbar
            language={language}
            onLanguageChange={updateLanguage}
            onRun={handleRun}
            isRunning={isRunning}
            isConnected={isConnected}
            isSyncing={isSyncing}
            roomId={roomId || null}
          />


          {!isFirebaseConfigured && (
            <Alert className="mx-4 mt-2 border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                Firebase not configured. Add VITE_FIREBASE_* environment variables to enable real-time sync.
                Currently running in local-only mode.
              </AlertDescription>
            </Alert>
          )}

          {error && isFirebaseConfigured && (
            <Alert className="mx-4 mt-2 border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex-1 flex overflow-hidden p-4 gap-4">
            <div className="flex-1 min-w-0">
              <CodeEditor
                code={code}
                language={language}
                onChange={updateCode}
                onCursorChange={updateCursor}
                activeUsers={activeUsers}
                isDarkMode={isDarkMode}
              />
            </div>
            <div className="w-96 flex-shrink-0">
              <OutputConsole
                outputs={outputs}
                onClear={clearConsole}
                isRunning={isRunning}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Room;
