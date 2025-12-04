import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

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

export const CodeEditor = ({ code, language, onChange }: CodeEditorProps) => {
  return (
    <div className="h-full w-full editor-container">
      <Editor
        height="100%"
        language={languageMap[language] || 'javascript'}
        value={code}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-editor">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </div>
  );
};
