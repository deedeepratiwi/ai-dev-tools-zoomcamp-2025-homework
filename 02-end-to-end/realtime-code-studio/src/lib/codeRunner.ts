export interface RunResult {
  output: string;
  error: boolean;
  executionTime: number;
}

// Safe JavaScript execution using Function constructor
export const runJavaScript = async (code: string): Promise<RunResult> => {
  const startTime = performance.now();
  const logs: string[] = [];
  
  // Create a custom console that captures output
  const customConsole = {
    log: (...args: any[]) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    },
    error: (...args: any[]) => {
      logs.push(`[Error] ${args.map(arg => String(arg)).join(' ')}`);
    },
    warn: (...args: any[]) => {
      logs.push(`[Warn] ${args.map(arg => String(arg)).join(' ')}`);
    },
    info: (...args: any[]) => {
      logs.push(`[Info] ${args.map(arg => String(arg)).join(' ')}`);
    },
  };

  try {
    const wrappedCode = `
      (function(console) {
        ${code}
      })
    `;
    
    const fn = new Function('return ' + wrappedCode)();
    const result = fn(customConsole);
    
    if (result !== undefined) {
      logs.push(`→ ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`);
    }
    
    const executionTime = performance.now() - startTime;
    
    return {
      output: logs.join('\n') || 'Code executed successfully (no output)',
      error: false,
      executionTime,
    };
  } catch (err: any) {
    const executionTime = performance.now() - startTime;
    return {
      output: err?.message || 'Unknown error',
      error: true,
      executionTime,
    };
  }
};

// Python execution using Pyodide
let pyodideInstance: any = null;
let pyodideLoading = false;
let pyodideLoadPromise: Promise<any> | null = null;

declare global {
  interface Window {
    loadPyodide: (config: any) => Promise<any>;
  }
}

const loadPyodide = async (): Promise<any> => {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoading && pyodideLoadPromise) return pyodideLoadPromise;
  
  pyodideLoading = true;
  
  pyodideLoadPromise = new Promise(async (resolve, reject) => {
    try {
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);
        
        await new Promise<void>((res, rej) => {
          script.onload = () => res();
          script.onerror = () => rej(new Error('Failed to load Pyodide'));
        });
      }
      
      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });
      
      resolve(pyodideInstance);
    } catch (error) {
      pyodideLoading = false;
      reject(error);
    }
  });
  
  return pyodideLoadPromise;
};

export const runPython = async (code: string): Promise<RunResult> => {
  const startTime = performance.now();
  
  try {
    const pyodide = await loadPyodide();
    
    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);
    
    await pyodide.runPythonAsync(code);
    
    const stdout = pyodide.runPython('sys.stdout.getvalue()') as string;
    const stderr = pyodide.runPython('sys.stderr.getvalue()') as string;
    
    pyodide.runPython(`
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);
    
    const executionTime = performance.now() - startTime;
    const output = stdout || stderr || 'Code executed successfully (no output)';
    
    return {
      output: output.trim(),
      error: Boolean(stderr && !stdout),
      executionTime,
    };
  } catch (err: any) {
    const executionTime = performance.now() - startTime;
    return {
      output: err?.message || 'Unknown error',
      error: true,
      executionTime,
    };
  }
};

export const runCode = async (code: string, language: string): Promise<RunResult> => {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return runJavaScript(code);
    case 'python':
      return runPython(code);
    default:
      return {
        output: `Language "${language}" execution is not supported yet.`,
        error: true,
        executionTime: 0,
      };
  }
};
