import Editor, { useMonaco } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface RemoteCursor {
  id: string;
  username: string;
  color: string;
  position: { lineNumber: number; column: number };
}

export interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onCursorChange?: (position: { lineNumber: number; column: number } | null) => void;
  activeUsers?: Array<{ id: string; username: string; color: string; cursor?: { lineNumber: number; column: number } }>;
  isDarkMode?: boolean;
}

const languageMap: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
};

// Language-specific themes and configurations
const languageConfig = {
  javascript: {
    theme: 'vs-dark',
    keywords: ['const', 'let', 'var', 'function', 'async', 'await', 'import', 'export'],
  },
  typescript: {
    theme: 'vs-dark',
    keywords: ['const', 'let', 'var', 'function', 'async', 'await', 'import', 'export', 'interface', 'type'],
  },
  python: {
    theme: 'vs-dark',
    keywords: ['def', 'class', 'import', 'from', 'async', 'await', 'if', 'else', 'for', 'while'],
  },
};

export const CodeEditor = ({ code, language, onChange, onCursorChange, activeUsers = [], isDarkMode = true }: CodeEditorProps) => {
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    if (monaco) {
      // Define custom tokens for Python syntax highlighting (omitted for brevity, assume existing)
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'python')) {
        monaco.languages.register({ id: 'python' });
        // ... (keep existing monarch definition if needed, or assume it's fine)
      }

      // Define custom themes
      monaco.editor.defineTheme('codecollab-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e293b', // Matches --editor-bg (approx)
        }
      });

      monaco.editor.defineTheme('codecollab-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#ffffff',
        }
      });
    }
  }, [monaco]);

  // Handle remote cursors
  useEffect(() => {
    if (!editorRef.current || !monaco) return;

    const editor = editorRef.current;

    // Create decorations for remote cursors
    const newDecorations = activeUsers
      .filter(user => user.cursor)
      .map(user => {
        const { lineNumber, column } = user.cursor!;
        return {
          range: new monaco.Range(lineNumber, column, lineNumber, column),
          options: {
            className: `remote-cursor-${user.id}`,
            hoverMessage: { value: `${user.username}` },
            beforeContentClassName: `remote-cursor-label-${user.id}`,
          },
        };
      });

    // Inject CSS for dynamic cursor colors
    const styleId = 'remote-cursor-styles';
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const cssRules = activeUsers.map(user => `
      .remote-cursor-${user.id} {
        border-left: 2px solid ${user.color};
      }
      .remote-cursor-label-${user.id}::before {
        content: '${user.username}';
        position: absolute;
        top: -22px;
        left: 0;
        background-color: ${user.color};
        color: white;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        pointer-events: none;
        white-space: nowrap;
        z-index: 50;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    `).join('\n');

    styleElement.innerHTML = cssRules;

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

  }, [activeUsers, monaco]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange?.(e.position);
    });

    editor.onDidBlurEditorWidget(() => {
      onCursorChange?.(null); // Optional: clear cursor when inactive
    });
  };

  return (
    <div className="h-full w-full editor-container rounded-lg overflow-hidden border border-border shadow-lg">
      <Editor
        height="100%"
        language={languageMap[language] || 'javascript'}
        value={code}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        theme={isDarkMode ? 'codecollab-dark' : 'codecollab-light'}
        // ... (keep existing loading prop)
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          fontLigatures: true,
          minimap: { enabled: true, size: 'proportional', side: 'right' },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: language === 'python' ? 4 : 2,
          insertSpaces: true,
          trimAutoWhitespace: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
            highlightActiveIndentation: true,
          },

          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
          showUnused: true,
          showDeprecated: true,
          // inlineHints handled by basic config
        }}
      />
    </div>
  );
};
