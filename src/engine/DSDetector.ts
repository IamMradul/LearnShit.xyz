import type { DSType, TraceStep, DetectedDS } from './TraceTypes';

/**
 * Analyses a snapshot of variables in a TraceStep and returns
 * detected data-structure instances with confidence scores.
 */
export function detectDataStructures(steps: TraceStep[]): DetectedDS[] {
  if (!steps.length) return [];

  // Accumulate all variable snapshots
  const varMap: Record<string, unknown[]> = {};

  for (const step of steps) {
    for (const [name, tv] of Object.entries(step.variables)) {
      if (!varMap[name]) varMap[name] = [];
      varMap[name].push(tv.value);
    }
  }

  const results: DetectedDS[] = [];

  for (const [varName, snapshots] of Object.entries(varMap)) {
    // Skip primitives / empty
    const lastVal = snapshots[snapshots.length - 1];
    if (lastVal === null || lastVal === undefined) continue;
    if (typeof lastVal !== 'object' && !Array.isArray(lastVal)) continue;

    const dsType = heuristicDetect(varName, snapshots as unknown[]);
    if (dsType) {
      results.push({ varName, dsType, confidence: 0.8 });
    }
  }

  // Also look for mutations emitted by adapters
  const mutationTypes = new Set<string>();
  for (const step of steps) {
    for (const m of step.mutations) {
      mutationTypes.add(`${m.dsId}:${m.dsType}`);
    }
  }
  for (const key of mutationTypes) {
    const [dsId, dsType] = key.split(':') as [string, DSType];
    if (!results.find((r) => r.varName === dsId)) {
      results.push({ varName: dsId, dsType: dsType as DSType, confidence: 1.0 });
    }
  }

  return results;
}

function heuristicDetect(name: string, snapshots: unknown[]): DSType | null {
  const last = snapshots[snapshots.length - 1];

  // Array / list
  if (Array.isArray(last)) {
    const inner = last[0];
    if (Array.isArray(inner)) return 'grid';

    // Linked list node shape
    if (isLinkedListNode(last)) return 'linkedList';

    // Default: array
    return 'array';
  }

  // Object / dict
  if (typeof last === 'object' && last !== null) {
    const obj = last as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (hasAll(keys, ['val', 'next'])) return 'linkedList';
    if (hasAll(keys, ['val', 'left', 'right'])) return 'binaryTree';
    if (hasAll(keys, ['key', 'value'])) return 'hashMap';
    if (hasAll(keys, ['parent']) && Array.isArray(obj['parent'])) return 'unionFind';

    // Adjacency list: all values are arrays
    const allArrayVals = Object.values(obj).every((v) => Array.isArray(v));
    if (allArrayVals && keys.length > 0) return 'graph';
  }

  // Name-based hints (low specificity)
  const lname = name.toLowerCase();
  if (/stack|stk/.test(lname)) return 'stack';
  if (/queue|que/.test(lname)) return 'queue';
  if (/heap|pq/.test(lname)) return 'heap';
  if (/graph|adj/.test(lname)) return 'graph';
  if (/tree|root|node/.test(lname)) return 'binaryTree';

  return null;
}

function hasAll(keys: string[], required: string[]) {
  return required.every((k) => keys.includes(k));
}

function isLinkedListNode(arr: unknown[]): boolean {
  if (!arr.length) return false;
  const node = arr[0];
  if (typeof node !== 'object' || node === null) return false;
  const keys = Object.keys(node as object);
  return keys.includes('next') || keys.includes('val');
}
