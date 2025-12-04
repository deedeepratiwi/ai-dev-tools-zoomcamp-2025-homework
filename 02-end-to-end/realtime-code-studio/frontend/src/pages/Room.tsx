import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputConsole, ConsoleOutput } from '@/components/OutputConsole';
import { EditorToolbar } from '@/components/EditorToolbar';
import { Leaderboard } from '@/components/Leaderboard';
import { useRoom } from '@/hooks/useRoom';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { runCode } from '@/lib/codeRunner';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { AlertCircle, Medal, LogOut } from 'lucide-react';
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const { currentUser, getOrCreateUser, submitScore } = useLeaderboard();

  // Initialize user on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedEmail = localStorage.getItem('email');
    
    if (!savedUsername || !savedEmail) {
      setShowUserDialog(true);
    } else {
      setUsername(savedUsername);
      setEmail(savedEmail);
      getOrCreateUser(savedUsername, savedEmail);
    }
  }, [getOrCreateUser]);

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

      // Submit score to leaderboard if user exists
      if (currentUser && !result.error) {
        try {
          await submitScore(
            currentUser.id,
            language,
            code.length,
            result.executionTime,
            !result.error
          );
          toast.success('Score submitted! Check the leaderboard.', { duration: 2000 });
        } catch (err) {
          console.error('Failed to submit score:', err);
        }
      }
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
  }, [code, language, currentUser, submitScore]);

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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join the Challenge</DialogTitle>
            <DialogDescription>
              Enter your details to compete on the leaderboard
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

      {/* Leaderboard and Logout Buttons */}
      <div className="px-4 pt-2 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {isLoggedIn && `Logged in as: ${username}`}
        </div>
        <div className="flex gap-2">
          {isLoggedIn && (
            <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Medal className="h-4 w-4" />
                  View Leaderboard
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Leaderboard</DialogTitle>
                  <DialogDescription>
                    Top performers by execution success and speed
                  </DialogDescription>
                </DialogHeader>
                <Leaderboard />
              </DialogContent>
            </Dialog>
          )}
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
