import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputConsole, ConsoleOutput } from '@/components/OutputConsole';
import { EditorToolbar } from '@/components/EditorToolbar';
import { useRoom } from '@/hooks/useRoom';
import { runCode } from '@/lib/codeRunner';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    
    try {
      if (language === 'python') {
        toast.info('Loading Python runtime...', { duration: 2000 });
      }
      
      const result = await runCode(code, language);
      
      setOutputs((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: result.output,
          type: result.error ? 'error' : 'output',
          timestamp: Date.now(),
          executionTime: result.executionTime,
        },
      ]);
    } catch (err) {
      setOutputs((prev) => [
        ...prev,
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

  return (
    <div className="h-screen flex flex-col bg-background">
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
