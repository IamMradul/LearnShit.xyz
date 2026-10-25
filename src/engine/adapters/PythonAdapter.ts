import type {
  LanguageAdapter,
  TraceRequest,
  TraceResult,
  ValidationResult,
} from '../TraceTypes';
import { detectMode, buildDriver } from '../ModeDetector';
import { useTraceStore } from '../../store/traceStore';

export class PythonAdapter implements LanguageAdapter {
  readonly language = 'python';
  readonly phase = 1;
  readonly executionEnvironment = 'browser' as const;

  private worker: Worker | null = null;
  private pyodideReady = false;
  private readyCallbacks: Array<() => void> = [];

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../../workers/pyodide-runner.worker.ts', import.meta.url),
        { type: 'module' },
      );
      this.worker.addEventListener('message', (e: MessageEvent) => {
        if (e.data.type === 'loading') {
          useTraceStore.getState().setPyodideLoading(true);
        }
      });
    }
    return this.worker;
  }

  detectMode(code: string) {
    return detectMode(code, 'python');
  }

  async validate(code: string): Promise<ValidationResult> {
    // Basic Python syntax heuristics (full parse needs Pyodide)
    const errors: ValidationResult['errors'] = [];

    // Check for unmatched brackets
    let depth = 0;
    for (const ch of code) {
      if ('([{'.includes(ch)) depth++;
      if (')]}'.includes(ch)) depth--;
      if (depth < 0) {
        errors.push({ line: 1, message: 'Unmatched bracket' });
        break;
      }
    }

    // Check for tab/space mix
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith('\t') && l.includes('    ')) {
        errors.push({
          line: i + 1,
          message: 'Mixed tabs and spaces',
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  trace(request: TraceRequest): Promise<TraceResult> {
    return new Promise((resolve, reject) => {
      const mode =
        request.mode === 'auto' ? this.detectMode(request.code) : request.mode;

      const code = buildDriver(request.code, request.input, 'python', mode);

      const worker = this.getWorker();

      const timeout = setTimeout(() => {
        this.dispose(); // kill and reset worker
        reject(new Error('Execution timed out. The worker was terminated.'));
      }, request.timeoutMs + 30000); // extra slack for Pyodide loading

      const handler = (e: MessageEvent) => {
        if (e.data.type === 'result') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          useTraceStore.getState().setPyodideLoading(false);
          resolve(e.data.result as TraceResult);
        }
      };

      worker.addEventListener('message', handler);
      worker.postMessage({ ...request, code, mode });
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.pyodideReady = false;
  }
}
