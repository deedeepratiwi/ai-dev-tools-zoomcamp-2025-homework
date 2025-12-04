import { Play, Copy, Check, Link, Users, Loader2, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (language: string) => void;
  onRun: () => void;
  isRunning: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  roomId: string | null;
}

const languages = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
];

export const EditorToolbar = ({
  language,
  onLanguageChange,
  onRun,
  isRunning,
  isConnected,
  isSyncing,
  roomId,
}: EditorToolbarProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="toolbar-container px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gradient-primary">CodeCollab</span>
            {roomId && (
              <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                #{roomId.slice(0, 8)}
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-border" />

          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-40 h-8 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.icon}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 text-sm">
            {isSyncing ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : isConnected ? (
              <Cloud className="w-4 h-4 text-success" />
            ) : (
              <CloudOff className="w-4 h-4 text-destructive" />
            )}
            <span className="text-muted-foreground text-xs">
              {isSyncing ? 'Syncing...' : isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          {roomId && (
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="h-8 gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Link className="w-4 h-4" />
              )}
              {copied ? 'Copied!' : 'Share'}
            </Button>
          )}

          <Button
            onClick={onRun}
            disabled={isRunning}
            size="sm"
            className="h-8 gap-2 glow-primary-hover"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run
          </Button>
        </div>
      </div>
    </div>
  );
};
