import { detectDataStructures } from './DSDetector';
import type { TraceResult, TraceStep } from './TraceTypes';

const SKIP_VAR = /^(Solution|console|arguments|undefined|NaN|Infinity)$/;

/**
 * Adapter: keep TraceStep shape the renderers already consume, attach dsHint
 * so several structures (e.g. nums + map) can be shown in one frame, and drop
 * noisy function/class bindings from the variable panel.
 */
export function normalizeTraceResult(result: TraceResult): TraceResult {
  const cleanedSteps = result.steps.map((step) => sanitizeStep(step));
  const detected = detectDataStructures(cleanedSteps);
  const byName = new Map(detected.map((d) => [d.varName, d.dsType]));

  for (const step of cleanedSteps) {
    for (const [name, tv] of Object.entries(step.variables)) {
      const hint = byName.get(name);
      if (hint) tv.dsHint = hint;
    }
  }

  return { ...result, steps: cleanedSteps };
}

function sanitizeStep(step: TraceStep): TraceStep {
  const variables: TraceStep['variables'] = {};
  for (const [name, tv] of Object.entries(step.variables)) {
    if (SKIP_VAR.test(name) || name.startsWith('__')) continue;
    if (tv.type === 'function') continue;
    if (typeof tv.repr === 'string' && tv.repr.startsWith('class ')) continue;
    variables[name] = tv;
  }

  const callStack = (step.callStack ?? []).map((frame, idx, arr) => ({
    ...frame,
    name: frame.name === 'anonymous' ? inferFrameName(frame.name, idx, arr) : frame.name,
    locals:
      frame.locals && Object.keys(frame.locals).length > 0
        ? frame.locals
        : idx === arr.length - 1
          ? variables
          : frame.locals ?? {},
  }));

  return { ...step, variables, callStack };
}

function inferFrameName(name: string, _idx: number, _arr: TraceStep['callStack']): string {
  return name;
}
