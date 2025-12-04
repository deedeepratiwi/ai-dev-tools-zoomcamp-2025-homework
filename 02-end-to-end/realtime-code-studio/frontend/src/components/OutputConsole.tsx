import { Terminal, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ConsoleOutput {
  id: string;
  content: string;
  type: 'output' | 'error' | 'info';
  timestamp: number;
  executionTime?: number;
}

interface OutputConsoleProps {
  outputs: ConsoleOutput[];
  onClear: () => void;
  isRunning: boolean;
}

export const OutputConsole = ({ outputs, onClear, isRunning }: OutputConsoleProps) => {
  return (
    <div className="h-full flex flex-col console-container">
      <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border bg-toolbar">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Console</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={outputs.length === 0}
          className="h-7 px-2 hover:bg-secondary"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {outputs.length === 0 && !isRunning ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <p>Run your code to see output here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {outputs.map((output) => (
              <div
                key={output.id}
                className="code-output animate-fade-in"
              >
                <div className="flex items-center gap-2 mb-1">
                  {output.executionTime !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {output.executionTime.toFixed(2)}ms
                    </span>
                  )}
                </div>
                <pre
                  className={`whitespace-pre-wrap break-words font-mono text-sm ${
                    output.type === 'error'
                      ? 'code-output-error'
                      : output.type === 'info'
                      ? 'code-output-info'
                      : 'code-output-success'
                  }`}
                >
                  {output.content}
                </pre>
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <span className="text-sm">Running...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
