import type { DSType, TraceStep, DetectedDS } from './TraceTypes';

const TYPE_PRIORITY: Record<DSType, number> = {
  graph: 10,
  unionFind: 9,
  linkedList: 8,
  doublyLinkedList: 8,
  binaryTree: 7,
  bst: 7,
  avl: 7,
  grid: 6,
  heap: 5,
  stack: 4,
  queue: 4,
  array: 3,
  hashMap: 2,
  hashSet: 2,
  string: 1,
  segmentTree: 1,
  fenwickTree: 1,
  recursionTree: 1,
};

/**
 * Analyses a snapshot of variables in a TraceStep and returns
 * detected data-structure instances with confidence scores.
 */
export function detectDataStructures(steps: TraceStep[]): DetectedDS[] {
  if (!steps.length) return [];

  // Accumulate all variable snapshots and reported types
  const varMap: Record<string, { snapshots: unknown[]; types: string[] }> = {};

  for (const step of steps) {
    for (const [name, tv] of Object.entries(step.variables)) {
      if (!varMap[name]) varMap[name] = { snapshots: [], types: [] };
      varMap[name].snapshots.push(tv.value);
      if (tv.type && !varMap[name].types.includes(tv.type)) {
        varMap[name].types.push(tv.type);
      }
    }
  }

  const results: DetectedDS[] = [];

  for (const [varName, info] of Object.entries(varMap)) {
    // Pick the most informative non-null snapshot
    const sampleVal =
      info.snapshots.slice().reverse().find((s) => s !== null && s !== undefined && typeof s === 'object') ??
      info.snapshots[info.snapshots.length - 1];

    if (sampleVal === null || sampleVal === undefined) continue;
    if (typeof sampleVal !== 'object' && !Array.isArray(sampleVal)) continue;

    const dsType = heuristicDetect(varName, sampleVal, info.snapshots, info.types);
    if (dsType) {
      results.push({ varName, dsType, confidence: 0.8 });
    }
  }

  // Also look for explicit mutations emitted by adapters
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

  // Sort by visual data structure priority so primary structures (graph, linked list, tree)
  // appear as the active tab instead of helper temporary variables (like visited, queue, res)
  results.sort((a, b) => {
    const prioA = TYPE_PRIORITY[a.dsType] ?? 0;
    const prioB = TYPE_PRIORITY[b.dsType] ?? 0;
    if (prioB !== prioA) return prioB - prioA;

    // Prefer standard primary variable names (head, adj, edges, root) over transient helpers
    const isPrimaryName = (name: string) => /^(head|adj|edges|graph|root|arr|nums)$/i.test(name);
    const primA = isPrimaryName(a.varName) ? 1 : 0;
    const primB = isPrimaryName(b.varName) ? 1 : 0;
    return primB - primA;
  });

  return results;
}

function heuristicDetect(
  name: string,
  sample: unknown,
  _snapshots: unknown[],
  types: string[] = [],
): DSType | null {
  const lname = name.toLowerCase();

  // 1. Explicit tracer type hints
  if (types.some((t) => t === 'linkedList' || t === 'ListNode')) return 'linkedList';
  if (types.some((t) => t === 'binaryTree' || t === 'TreeNode')) return 'binaryTree';
  if (types.some((t) => t === 'graph')) return 'graph';

  // 2. Linked list inspection
  if (isLinkedListNode(sample)) return 'linkedList';
  if (/^(head|curr|prev|nxt|next|node|slow|fast)$/i.test(lname)) {
    if (typeof sample === 'object' && sample !== null) return 'linkedList';
  }

  // 3. Graph inspection (adjacency list or edge list)
  if (/^(graph|adj|edges|adj_list|edge_list|network)$/i.test(lname) || lname.includes('adj') || lname.includes('edge')) {
    return 'graph';
  }

  // 4. Array / List structures
  if (Array.isArray(sample)) {
    if (sample.length === 0) {
      if (/stack|stk/.test(lname)) return 'stack';
      if (/queue|que/.test(lname)) return 'queue';
      if (/heap|pq/.test(lname)) return 'heap';
      return 'array';
    }

    const inner = sample[0];

    // Explicit grid / matrix variable names
    if (/matrix|grid|board/i.test(lname)) return 'grid';

    // Check if edge list: e.g. [[0, 1], [1, 2]] or [[0, 1, 1], [1, 2, 2]]
    if (Array.isArray(inner)) {
      const isEdgeList =
        sample.length > 0 &&
        (/edge|graph|mst|links|connections/i.test(lname) ||
          (sample.every(
            (row) =>
              Array.isArray(row) &&
              (row.length === 2 || row.length === 3) &&
              typeof row[0] === 'number' &&
              typeof row[1] === 'number',
          ) && !/matrix|grid|board|table/i.test(lname) && sample.length > 2));
      if (isEdgeList) return 'graph';

      // Check if adjacency list where all items are arrays of numbers: e.g. [[1, 2], [0, 2, 3]]
      const isAdjList =
        sample.every(
          (row) =>
            Array.isArray(row) &&
            row.every((v) => typeof v === 'number' || (Array.isArray(v) && v.length === 2)),
        ) && /adj|graph|neighbors|edges/i.test(lname);
      if (isAdjList) return 'graph';

      return 'grid';
    }

    // Default: array
    if (/stack|stk/.test(lname)) return 'stack';
    if (/queue|que/.test(lname)) return 'queue';
    if (/heap|pq/.test(lname)) return 'heap';
    return 'array';
  }

  // 5. Object / dict structures
  if (typeof sample === 'object' && sample !== null) {
    const obj = sample as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (hasAll(keys, ['val', 'next'])) return 'linkedList';
    if (hasAll(keys, ['val', 'left', 'right'])) return 'binaryTree';
    if (hasAll(keys, ['key', 'value'])) return 'hashMap';
    if (hasAll(keys, ['parent']) && Array.isArray(obj['parent'])) return 'unionFind';

    // Adjacency list: all values are arrays
    const allArrayVals = keys.length > 0 && Object.values(obj).every((v) => Array.isArray(v));
    if (allArrayVals) return 'graph';
  }

  // Name-based hints
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

function isLinkedListNode(val: unknown): boolean {
  if (!val) return false;
  if (Array.isArray(val)) {
    if (!val.length) return false;
    const node = val[0];
    if (typeof node !== 'object' || node === null) return false;
    const keys = Object.keys(node as object);
    return keys.includes('next') || keys.includes('val');
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val as object);
    return keys.includes('next') && keys.includes('val');
  }
  return false;
}
