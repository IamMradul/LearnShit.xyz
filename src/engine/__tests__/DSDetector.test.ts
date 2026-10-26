import { describe, it, expect } from 'vitest';
import { detectDataStructures } from '../DSDetector';
import type { TraceStep } from '../TraceTypes';

function makeStep(variables: Record<string, unknown>, mutations: TraceStep['mutations'] = []): TraceStep {
  const vars: TraceStep['variables'] = {};
  for (const [k, v] of Object.entries(variables)) {
    vars[k] = { type: typeof v, repr: JSON.stringify(v), value: v };
  }
  return {
    index: 0,
    line: 1,
    event: 'line',
    variables: vars,
    callStack: [{ name: 'test', line: 1, locals: vars }],
    mutations,
  };
}

describe('DSDetector', () => {
  it('detects 1D numeric array', () => {
    const steps = [
      makeStep({ arr: [1, 2, 3] }),
      makeStep({ arr: [2, 1, 3] }),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'arr');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('array');
  });

  it('detects 2D array as grid', () => {
    const steps = [
      makeStep({ matrix: [[1, 2], [3, 4]] }),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'matrix');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('grid');
  });

  it('detects binary tree by node structure (val, left, right)', () => {
    const rootNode = { val: 10, left: { val: 5, left: null, right: null }, right: null };
    const steps = [makeStep({ root: rootNode })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'root');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('binaryTree');
  });

  it('detects linked list by node structure (val, next)', () => {
    const listNode = { val: 1, next: { val: 2, next: null } };
    const steps = [makeStep({ head: listNode })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'head');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('linkedList');
  });

  it('detects hash map by key/value keys', () => {
    const steps = [makeStep({ entry: { key: 'a', value: 1 } })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'entry');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('hashMap');
  });

  it('ignores primitive scalars (numbers, strings, booleans)', () => {
    const steps = [makeStep({ counter: 42, flag: true, name: 'AlgoLens' })];
    const ds = detectDataStructures(steps);
    expect(ds.length).toBe(0);
  });

  it('incorporates explicit mutations emitted by tracer', () => {
    const steps = [
      makeStep({}, [{ dsId: 'customList', dsType: 'linkedList', op: 'write', args: ['head'] }]),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'customList');
    expect(found).toBeDefined();
    expect(found?.confidence).toBe(1.0);
  });

  it('detects 2D points as geometry', () => {
    const steps = [makeStep({ points: [[1, 1], [2, 5], [3, 3], [5, 3]] })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'points');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('geometry');
  });

  it('detects square distance matrix as graph', () => {
    const steps = [
      makeStep({
        dist: [
          [0, 10, 15],
          [10, 0, 35],
          [15, 35, 0],
        ],
      }),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'dist');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('graph');
  });

  it('detects suffix list as array', () => {
    const steps = [makeStep({ suffixes: [['banana', 0], ['anana', 1]] })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'suffixes');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('array');
  });
});
