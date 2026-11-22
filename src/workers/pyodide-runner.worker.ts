/**
 * pyodide-runner.worker.ts
 *
 * Loads Pyodide (WebAssembly Python) in a Web Worker, installs a
 * sys.settrace-based tracer, executes user code, and returns a TraceResult.
 *
 * The worker never has DOM access, fetch is not available inside Pyodide's
 * runtime by default, providing a reasonable security boundary.
 */

import type { TraceRequest, TraceResult } from '../engine/TraceTypes';
import { normalizeTraceResult } from '../engine/normalizeTrace';

declare function importScripts(...urls: string[]): void;
declare const _loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>;

interface PyodideInterface {
    runPythonAsync(code: string): Promise<unknown>;
    globals: {
        get(key: string): unknown;
        set(key: string, value: unknown): void;
    };
    toPy(obj: unknown): unknown;
    pyimport(mod: string): unknown;
}

let pyodide: PyodideInterface | null = null;

async function initPyodide() {
    if (pyodide) return pyodide;

    // Load Pyodide ES module in an ES module worker
    // @ts-ignore
    const { loadPyodide: loader } = await import('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.mjs');
    pyodide = await loader({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/',
    });
    if (!pyodide) throw new Error('Failed to initialize Pyodide');
    return pyodide;
}

self.onmessage = async (e: MessageEvent<TraceRequest>) => {
    const request = e.data;

    // Signal loading state
    self.postMessage({ type: 'loading' });

    try {
        const py = await initPyodide();
        const result = await runPythonTrace(py, request);
        self.postMessage({ type: 'result', result });
    } catch (err) {
        const result: TraceResult = {
            steps: [],
            language: 'python',
            mode: 'function',
            truncated: false,
            totalSteps: 0,
            stdout: '',
            stderr: String(err),
            error: String(err),
        };
        self.postMessage({ type: 'result', result });
    }
};

// ─── Python sys.settrace tracer (injected into Pyodide) ──────────────────────
import TRACER_PYTHON_CODE from './python-tracer.py?raw';

export { TRACER_PYTHON_CODE, runPythonTrace };

async function runPythonTrace(
    py: PyodideInterface,
    request: TraceRequest & { userLineCount?: number },
): Promise<TraceResult> {
    // Install tracer once
    await py.runPythonAsync(TRACER_PYTHON_CODE);

    py.globals.set('__user_code_str__', request.code);
    py.globals.set('__user_input_str__', request.stdin !== undefined ? request.stdin : (request.input || ''));
    py.globals.set('__max_steps__', request.maxSteps ?? 5000);
    py.globals.set('__user_line_count__', request.userLineCount ?? 0);

    let rawJson: string;
    try {
        rawJson = (await py.runPythonAsync(
            'run_with_trace(__user_code_str__, __max_steps__, __user_input_str__, __user_line_count__)',
        )) as string;
    } catch (e) {
        return {
            steps: [],
            language: 'python',
            mode: request.mode === 'auto' ? 'function' : request.mode,
            truncated: false,
            totalSteps: 0,
            stdout: '',
            stderr: String(e),
            error: String(e),
        };
    }

    const sanitized = (rawJson as string)
        .replace(/:\s*Infinity\b/g, ': "Infinity"')
        .replace(/:\s*-Infinity\b/g, ': "-Infinity"')
        .replace(/:\s*NaN\b/g, ': "NaN"');
    const data = JSON.parse(sanitized) as {
        steps: TraceResult['steps'];
        stdout: string;
        stderr: string;
        error: string | null;
        truncated: boolean;
        totalSteps: number;
    };

    return normalizeTraceResult({
        steps: data.steps,
        language: 'python',
        mode: request.mode === 'auto' ? 'function' : request.mode,
        truncated: data.truncated,
        totalSteps: data.totalSteps,
        stdout: data.stdout,
        stderr: data.stderr,
        error: data.error ?? undefined,
    });
}
