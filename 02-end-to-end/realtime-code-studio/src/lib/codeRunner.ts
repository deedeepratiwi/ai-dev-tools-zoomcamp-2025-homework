export interface RunResult {
  output: string;
  error: boolean;
  executionTime: number;
}

const EXECUTION_TIMEOUT = 30000; // 30 seconds

// Create a timeout promise
const createTimeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Code execution timed out after ${ms}ms`));
    }, ms);
  });
};

// Simple TypeScript transpilation (remove type annotations)
const transpileTypeScript = (code: string): string => {
  let result = code;
  
  // Remove interface declarations completely
  result = result.replace(/interface\s+\w+\s*{[\s\S]*?(?=\n(?:interface|type|class|function|const|let|var|async|import|export|\/\/)|\Z)}/g, '');
  
  // Remove type declarations completely
  result = result.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // Remove 'as' type assertions (e.g., "x as string")
  result = result.replace(/\s+as\s+[\w<>[\],\s|&]+(?=[,;)\]\}])/g, '');
  
  // Remove generic type parameters from function/class declarations
  result = result.replace(/<[\w\s,|&?]*>/g, '');
  
  // Remove type annotations from function parameters - handles complex types
  result = result.replace(/:\s*[\w[\]{}<>,|&\s?:!"'`\-+*/.()]+(?=[,)])/g, '');
  
  // Remove type annotations from variable declarations
  result = result.replace(/:\s*[\w[\]{}<>,|&\s?:!"'`\-+*/.()]+(?=[=;])/g, '');
  
  // Remove readonly keyword
  result = result.replace(/readonly\s+/g, '');
  
  // Remove type-only imports
  result = result.replace(/import\s+type\s+/g, 'import ');
  
  return result;
};

// Safe JavaScript execution using Function constructor
export const runJavaScript = async (code: string): Promise<RunResult> => {
  const startTime = performance.now();
  const logs: string[] = [];
  
  // Transpile TypeScript if needed
  let executableCode = code;
  if (code.includes(':') && (code.includes('interface') || code.includes('type ') || code.includes(' as '))) {
    executableCode = transpileTypeScript(code);
  }
  
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
    table: (...args: any[]) => {
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    },
  };

  try {
    // Create an async function that executes the user code with custom console
    const fn = new Function('console', `
      return (async function() {
        ${executableCode}
      })();
    `);
    
    const result = await fn(customConsole);
    
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
      output: err?.message || 'Unknown error occurred',
      error: true,
      executionTime,
    };
  }
};

// Python execution using Pyodide (WebAssembly)
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
  
  pyodideLoadPromise = (async () => {
    try {
      // Load Pyodide script if not already loaded
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise<void>((res, rej) => {
          script.onload = () => res();
          script.onerror = () => rej(new Error('Failed to load Pyodide CDN'));
        });
      }
      
      // Initialize Pyodide with WASM runtime
      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        fullStdLib: false,
      });
      
      // Initialize output capture
      pyodideInstance.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
_stderr_capture = StringIO()
      `);
      
      return pyodideInstance;
    } catch (error) {
      pyodideLoading = false;
      pyodideLoadPromise = null;
      throw error;
    }
  })();
  
  return pyodideLoadPromise;
};

export const runPython = async (code: string): Promise<RunResult> => {
  const startTime = performance.now();
  
  try {
    const pyodide = await Promise.race([
      loadPyodide(),
      createTimeoutPromise(EXECUTION_TIMEOUT),
    ]);
    
    // Reset output capture
    pyodide.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
    `);
    
    // Execute code with timeout
    await Promise.race([
      pyodide.runPythonAsync(code),
      createTimeoutPromise(EXECUTION_TIMEOUT),
    ]);
    
    // Get captured output
    const stdout = pyodide.runPython('_stdout_capture.getvalue()') as string;
    const stderr = pyodide.runPython('_stderr_capture.getvalue()') as string;
    
    // Reset for next execution
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
    `);
    
    const executionTime = performance.now() - startTime;
    const output = (stdout || stderr || 'Code executed successfully (no output)').trim();
    
    return {
      output: output,
      error: Boolean(stderr && !stdout),
      executionTime,
    };
  } catch (err: any) {
    const executionTime = performance.now() - startTime;
    const errorMessage = err?.message || 'Unknown error occurred during Python execution';
    
    return {
      output: errorMessage,
      error: true,
      executionTime,
    };
  }
};

export const runCode = async (code: string, language: string): Promise<RunResult> => {
  // Validate code is not empty
  if (!code || !code.trim()) {
    return {
      output: 'Please enter some code to execute.',
      error: false,
      executionTime: 0,
    };
  }

  switch (language) {
    case 'javascript':
    case 'typescript':
      return runJavaScript(code);
    case 'python':
      return runPython(code);
    default:
      return {
        output: `Language "${language}" execution is not supported yet. Supported: JavaScript, TypeScript, Python`,
        error: true,
        executionTime: 0,
      };
  }
};
