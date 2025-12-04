import Editor, { useMonaco } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
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

export const CodeEditor = ({ code, language, onChange }: CodeEditorProps) => {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      // Define custom tokens for Python syntax highlighting
      monaco.languages.register({ id: 'python' });
      
      // Ensure Python language is properly loaded
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'python')) {
        monaco.languages.setMonarchTokensProvider('python', {
          tokenizer: {
            root: [
              [/^(\s*)(@\w[\w\d.]*)(\s*)(\()?/, ['', 'tag', '', 'delimiter.parenthesis']],
              [/^(\s*)(async )?(def )([\w_]\w*)/, ['', 'keyword', 'keyword', 'function.declaration']],
              [/^(\s*)(class )([\w_]\w*)/, ['', 'keyword', 'class.name']],
              [/(import|from|as)/, 'keyword'],
              [/\b(True|False|None)\b/, 'constant.language'],
              [/"""[\s\S]*?"""/, 'string.doc'],
              [/'''[\s\S]*?'''/, 'string.doc'],
              [/"(?:\\.|[^"\\])*"/, 'string'],
              [/'(?:\\.|[^'\\])*'/, 'string'],
              [/#.*$/, 'comment'],
            ],
          },
        });
      }
    }
  }, [monaco]);

  return (
    <div className="h-full w-full editor-container rounded-lg overflow-hidden border border-border shadow-lg">
      <Editor
        height="100%"
        language={languageMap[language] || 'javascript'}
        value={code}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-secondary">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading {language} editor...</span>
            </div>
          </div>
        }
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
          semanticHighlighting: { enabled: true },
          'editor.tokenColorCustomizations': true,
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
          showUnused: true,
          showDeprecated: true,
          inlineHints: {
            enabled: true,
            fontSize: 11,
          },
        }}
      />
    </div>
  );
};
