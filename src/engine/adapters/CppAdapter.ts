import type {
  LanguageAdapter,
  TraceRequest,
  TraceResult,
  ValidationResult,
} from '../TraceTypes';
import { transpileCppToJs } from '../transpilers/CppTranspiler';
import { parseDriverArgs } from '../ModeDetector';

export class CppAdapter implements LanguageAdapter {
  readonly language = 'cpp';
  readonly phase = 2;
  readonly executionEnvironment = 'browser' as const;

  private worker: Worker | null = null;

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../../workers/js-tracer.worker.ts', import.meta.url),
        { type: 'module' },
      );
    }
    return this.worker;
  }

  detectMode(code: string): 'function' | 'full-program' {
    if (/\bint\s+main\s*\(/.test(code)) {
      return 'full-program';
    }
    return 'function';
  }

  async validate(code: string): Promise<ValidationResult> {
    try {
      const transpiled = transpileCppToJs(code);
      const { parse } = await import('@babel/parser');
      parse(transpiled.code, {
        sourceType: 'script',
        plugins: ['jsx'],
        errorRecovery: true,
      });
      return { valid: true, errors: [] };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const lineMatch = msg.match(/\((\d+):/);
      const line = lineMatch ? parseInt(lineMatch[1]) : 1;
      return { valid: false, errors: [{ line, message: msg }] };
    }
  }

  trace(request: TraceRequest): Promise<TraceResult> {
    return new Promise((resolve, reject) => {
      try {
        const mode =
          request.mode === 'auto' ? this.detectMode(request.code) : request.mode;

        const transpiled = transpileCppToJs(request.code);
        let runnableJs = transpiled.code;

        if (mode === 'function') {
          const args = parseDriverArgs(request.input);
          if (transpiled.isClassSolution) {
            const mName = transpiled.methodName || 'twoSum';
            runnableJs += `\n\n// ─── AlgoLens Auto Driver ───\ntry {\n  const __sol = new Solution();\n  const __ret = __sol.${mName}(${args.join(', ')});\n  if (__ret !== undefined) console.log('Return value:', JSON.stringify(__ret));\n} catch(e) { console.error(e); }`;
          } else {
            // Find first function defined
            const fnMatch = runnableJs.match(/function\s+([a-zA-Z_]\w*)\s*\(/);
            const fnName = fnMatch ? fnMatch[1] : 'solution';
            runnableJs += `\n\n// ─── AlgoLens Auto Driver ───\ntry {\n  const __ret = ${fnName}(${args.join(', ')});\n  if (__ret !== undefined) console.log('Return value:', JSON.stringify(__ret));\n} catch(e) { console.error(e); }`;
          }
        } else {
          // Full program mode: invoke main()
          if (/function\s+main\s*\(/.test(runnableJs)) {
            runnableJs += '\n\ntry { main(); } catch(e) { console.error(e); }';
          }
        }

        const worker = this.getWorker();
        const timeout = setTimeout(() => {
          reject(new Error('C++ execution worker timed out'));
        }, request.timeoutMs + 2000);

        const handler = (e: MessageEvent) => {
          if (e.data.type === 'result') {
            clearTimeout(timeout);
            worker.removeEventListener('message', handler);
            const res = e.data.result as TraceResult;
            res.language = 'cpp';
            resolve(res);
          }
        };

        worker.addEventListener('message', handler);
        worker.postMessage({ ...request, code: runnableJs, mode });
      } catch (err) {
        resolve({
          steps: [],
          language: 'cpp',
          mode: 'function',
          truncated: false,
          totalSteps: 0,
          stdout: '',
          stderr: String(err),
          error: String(err),
        });
      }
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
  }
}
