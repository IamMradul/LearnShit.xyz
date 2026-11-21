import type { TraceResult } from './TraceTypes';

export const PARTIAL_LANG_NOTICE =
  'This language is only partially supported in the visualizer';

export function partialLangResult(
  language: string,
  err: unknown,
  line = 1,
): TraceResult {
  const message = err instanceof Error ? err.message : String(err);
  return {
    steps: [
      {
        index: 0,
        line: Math.max(1, line),
        event: 'exception',
        variables: {},
        callStack: [],
        mutations: [],
        exception: { type: 'TranspileError', message },
      },
    ],
    language,
    mode: 'function',
    truncated: false,
    totalSteps: 1,
    stdout: '',
    stderr: `${PARTIAL_LANG_NOTICE}\n${message}`,
    error: `${PARTIAL_LANG_NOTICE}: ${message}`,
  };
}

export function extractErrorLine(msg: string): number {
  const m = msg.match(/\((\d+):/);
  return m ? parseInt(m[1], 10) : 1;
}

export async function parseOrPartial(
  js: string,
  language: string,
): Promise<TraceResult | null> {
  try {
    const { parse } = await import('@babel/parser');
    parse(js, { sourceType: 'script', plugins: ['jsx'], errorRecovery: false });
    return null;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return partialLangResult(language, e, extractErrorLine(msg));
  }
}
