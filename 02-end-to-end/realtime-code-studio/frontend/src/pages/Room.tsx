import { useState, useCallback, useEffect } from 'react';
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

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const {
    code,
    language,
    isConnected,
    isSyncing,
    error,
    updateCode,
    updateLanguage,
    isFirebaseConfigured,
  } = useRoom(roomId || null);

  const [outputs, setOutputs] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Initialize user on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedEmail = localStorage.getItem('email');
    
    if (!savedUsername || !savedEmail) {
      setShowUserDialog(true);
    } else {
      setUsername(savedUsername);
      setEmail(savedEmail);
    }
  }, []);

  // Add current user to online users and handle cleanup
  useEffect(() => {
    if (username && roomId) {
      setOnlineUsers(prev => {
        if (!prev.includes(username)) {
          return [...prev, username];
        }
        return prev;
      });
      
      return () => {
        // Could add leave notification here if Firebase is configured
      };
    }
  }, [username, roomId]);

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
        type: result.error ? 'error' : 'output',
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

  const isLoggedIn = !!username && !!email;

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`} style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}>
      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
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

      <EditorToolbar
        language={language}
        onLanguageChange={updateLanguage}
        onRun={handleRun}
        isRunning={isRunning}
        isConnected={isConnected}
        isSyncing={isSyncing}
        roomId={roomId || null}
      />

      {/* Header Bar */}
      <div className="px-4 pt-2 flex justify-between items-center gap-4 border-b">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-sm text-muted-foreground">
            {isLoggedIn && `${username}`}
          </div>
          {/* Online Users */}
          {isLoggedIn && onlineUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Online:</span>
              <div className="flex items-center gap-1">
                {onlineUsers.map((user) => (
                  <div
                    key={user}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white cursor-help"
                    title={user}
                  >
                    {user.substring(0, 1).toUpperCase()}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={isLoggedIn ? handleLogout : () => setShowUserDialog(true)}
          >
            <LogOut className="h-4 w-4" />
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </div>
      </div>

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
    </div>
  );
};

export default Room;
