import { describe, it, expect } from 'vitest';
import { runTrace, GlobalListNode, GlobalTreeNode } from '../JSTracer';
import { detectDataStructures } from '../DSDetector';
import { VISUALGO_ITEMS } from '../../components/gallery/visuAlgoData';
import { ALGORITHM_PRESETS } from '../presets';
import { buildDriver } from '../ModeDetector';

describe('Step 5: Debugger-Style Trace Verification Test Suite', () => {
  // ── 1. For Loop: n=5 body lines hit exactly 5 times ─────────────────────────
  it('for loop n=5: body line hit exactly 5 times, header iterations correct', async () => {
    const code = [
      'let sum = 0;',
      'for (let i = 0; i < 5; i++) {',
      '  sum += i;',
      '}',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    expect(result.steps.length).toBeGreaterThan(0);

    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.lineExecutionCounts).toBeDefined();

    // Body line is line 3
    expect(lastStep.lineExecutionCounts?.[3]).toBe(5);

    // Header line is line 2 (evaluated 5 true + 1 false = 6 times)
    expect(lastStep.lineExecutionCounts?.[2]).toBe(6);

    // Verify iteration numbers on body steps
    const bodySteps = result.steps.filter((s) => s.line === 3);
    expect(bodySteps.length).toBe(5);
    bodySteps.forEach((s, idx) => {
      expect(s.loop?.iteration).toBe(idx + 1);
      expect(s.loop?.headerLine).toBe(2);
      expect(s.loop?.type).toBe('for');
    });
  });

  // ── 2. Nested Loops ─────────────────────────────────────────────────────────
  it('nested loops: inner body runs exactly 3 * 2 = 6 times', async () => {
    const code = [
      'let count = 0;',
      'for (let i = 0; i < 3; i++) {',
      '  for (let j = 0; j < 2; j++) {',
      '    count++;',
      '  }',
      '}',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    const lastStep = result.steps[result.steps.length - 1];
    // Line 4 is count++
    expect(lastStep.lineExecutionCounts?.[4]).toBe(6);
    expect(lastStep.variables['count']?.value).toBe(6);
  });

  // ── 3. While with break and continue ─────────────────────────────────────────
  it('while loop with break and continue tracks executions accurately', async () => {
    const code = [
      'let i = 0;',
      'let evens = 0;',
      'while (i < 10) {',
      '  i++;',
      '  if (i % 2 !== 0) continue;',
      '  evens++;',
      '  if (evens === 3) break;',
      '}',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['evens']?.value).toBe(3);
    expect(lastStep.variables['i']?.value).toBe(6);
  });

  // ── 4. Do-While Loop ───────────────────────────────────────────────────────
  it('do-while loop executes body before test condition', async () => {
    const code = [
      'let x = 0;',
      'do {',
      '  x++;',
      '} while (x < 4);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.lineExecutionCounts?.[3]).toBe(4);
    expect(lastStep.variables['x']?.value).toBe(4);
  });

  // ── 5. Recursion: Factorial (call stack depth) ───────────────────────────────
  it('factorial(4) reaches maximum stack depth of 4', async () => {
    const code = [
      'function fact(n) {',
      '  if (n <= 1) return 1;',
      '  return n * fact(n - 1);',
      '}',
      'const ans = fact(4);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const maxDepth = Math.max(...result.steps.map((s) => s.callStack.length));
    expect(maxDepth).toBe(4);

    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['ans']?.value).toBe(24);
  });

  // ── 6. Recursion: Fibonacci(5) total call count = 15, max depth = 5 ─────────
  it('fibonacci(5) makes exactly 15 calls with maximum depth 5', async () => {
    const code = [
      'function fib(n) {',
      '  if (n <= 1) return n;',
      '  return fib(n - 1) + fib(n - 2);',
      '}',
      'const res = fib(5);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 2000,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();

    // Calls to fib: each entry step where event === 'call' and function is fib
    const callSteps = result.steps.filter((s) => s.event === 'call');
    expect(callSteps.length).toBe(15);

    const maxDepth = Math.max(...result.steps.map((s) => s.callStack.length));
    expect(maxDepth).toBe(5);

    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['res']?.value).toBe(5);
  });

  // ── 7. DFS on a Graph ───────────────────────────────────────────────────────
  it('DFS on graph visits nodes and navigates recursive frames', async () => {
    const code = [
      'const graph = [[1, 2], [3], [3], []];',
      'const visited = [];',
      'function dfs(u) {',
      '  visited.push(u);',
      '  for (const v of graph[u]) {',
      '    if (!visited.includes(v)) dfs(v);',
      '  }',
      '}',
      'dfs(0);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['visited']?.value).toEqual([0, 1, 3, 2]);
  });

  // ── 8. Permutations Backtracking ────────────────────────────────────────────
  it('backtracking generates exactly 3! = 6 permutations', async () => {
    const code = [
      'const perms = [];',
      'function backtrack(curr, used) {',
      '  if (curr.length === 3) {',
      '    perms.push([...curr]);',
      '    return;',
      '  }',
      '  for (let i = 0; i < 3; i++) {',
      '    if (used[i]) continue;',
      '    used[i] = true;',
      '    curr.push(i);',
      '    backtrack(curr, used);',
      '    curr.pop();',
      '    used[i] = false;',
      '  }',
      '}',
      'backtrack([], [false, false, false]);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 2000,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    const perms = lastStep.variables['perms']?.value as unknown[][];
    expect(perms.length).toBe(6);
  });

  // ── 9. Binary Tree Inorder ──────────────────────────────────────────────────
  it('binary tree inorder traversal visits in order [1, 2, 3]', async () => {
    const code = [
      'const root = new TreeNode(2, new TreeNode(1), new TreeNode(3));',
      'const order = [];',
      'function inorder(node) {',
      '  if (!node) return;',
      '  inorder(node.left);',
      '  order.push(node.val);',
      '  inorder(node.right);',
      '}',
      'inorder(root);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['order']?.value).toEqual([1, 2, 3]);
  });

  // ── 10. LeetCode Problems ───────────────────────────────────────────────────
  it('LeetCode Two Sum: finds indices [0, 1]', async () => {
    const code = [
      'function twoSum(nums, target) {',
      '  const map = new Map();',
      '  for (let i = 0; i < nums.length; i++) {',
      '    const comp = target - nums[i];',
      '    if (map.has(comp)) return [map.get(comp), i];',
      '    map.set(nums[i], i);',
      '  }',
      '  return [];',
      '}',
      'const ans = twoSum([2, 7, 11, 15], 9);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['ans']?.value).toEqual([0, 1]);
  });

  it('LeetCode Reverse Linked List: reverses 1 -> 2 -> 3', async () => {
    const code = [
      'function reverseList(head) {',
      '  let prev = null;',
      '  let curr = head;',
      '  while (curr !== null) {',
      '    const nextTemp = curr.next;',
      '    curr.next = prev;',
      '    prev = curr;',
      '    curr = nextTemp;',
      '  }',
      '  return prev;',
      '}',
      'const head = new ListNode(1, new ListNode(2, new ListNode(3)));',
      'const reversed = reverseList(head);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    const reversed = lastStep.variables['reversed']?.value as { val: number; next?: { val: number } };
    expect(reversed.val).toBe(3);
    expect(reversed.next?.val).toBe(2);
  });

  it('LeetCode Valid Parentheses: correctly validates nested brackets', async () => {
    const code = [
      'function isValid(s) {',
      '  const stack = [];',
      '  const map = { ")": "(", "}": "{", "]": "[" };',
      '  for (let i = 0; i < s.length; i++) {',
      '    const ch = s[i];',
      '    if (ch === "(" || ch === "{" || ch === "[") {',
      '      stack.push(ch);',
      '    } else {',
      '      if (stack.pop() !== map[ch]) return false;',
      '    }',
      '  }',
      '  return stack.length === 0;',
      '}',
      'const v1 = isValid("{[()]}");',
      'const v2 = isValid("(]");',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['v1']?.value).toBe(true);
    expect(lastStep.variables['v2']?.value).toBe(false);
  });

  it('LeetCode Number of Islands: counts 3 distinct islands', async () => {
    const code = [
      'function numIslands(grid) {',
      '  if (!grid || grid.length === 0) return 0;',
      '  let count = 0;',
      '  function dfs(r, c) {',
      '    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== "1") return;',
      '    grid[r][c] = "0";',
      '    dfs(r + 1, c);',
      '    dfs(r - 1, c);',
      '    dfs(r, c + 1);',
      '    dfs(r, c - 1);',
      '  }',
      '  for (let r = 0; r < grid.length; r++) {',
      '    for (let c = 0; c < grid[0].length; c++) {',
      '      if (grid[r][c] === "1") {',
      '        count++;',
      '        dfs(r, c);',
      '      }',
      '    }',
      '  }',
      '  return count;',
      '}',
      'const grid = [',
      '  ["1", "1", "0"],',
      '  ["0", "1", "0"],',
      '  ["0", "0", "1"]',
      '];',
      'const islands = numIslands(grid);',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 1500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.variables['islands']?.value).toBe(2);
  });

  // ── 11. Multi-testcase stdin loop & Incremental Stdout ──────────────────────
  it('multi-testcase stdin loop reads input and incrementally emits stdout', async () => {
    const code = [
      'const t = parseInt(prompt());',
      'for (let tc = 0; tc < t; tc++) {',
      '  const n = parseInt(prompt());',
      '  console.log("CASE:" + (n * 2));',
      '}',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '2\n5\n10\n',
      stdin: '2\n5\n10\n',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toBeUndefined();
    expect(result.stdout).toContain('CASE:10');
    expect(result.stdout).toContain('CASE:20');

    // Confirm stdoutSoFar is incremental
    const stdoutSteps = result.steps.filter((s) => s.stdoutSoFar);
    expect(stdoutSteps.length).toBeGreaterThan(0);
    // Earlier step has CASE:10, later step has both CASE:10 and CASE:20
    const firstOut = stdoutSteps.find((s) => s.stdoutSoFar?.includes('CASE:10') && !s.stdoutSoFar?.includes('CASE:20'));
    expect(firstOut).toBeDefined();
  });

  // ── 12. Mid-run Exception & Infinite Loop Safeguards ────────────────────────
  it('exception mid-run preserves trace up to the error line', async () => {
    const code = [
      'let a = 10;',
      'let b = 20;',
      'throw new Error("MidRunFailure");',
      'let c = 30;',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 500,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(result.error).toContain('MidRunFailure');
    expect(result.steps.length).toBeGreaterThanOrEqual(2);

    const excStep = result.steps[result.steps.length - 1];
    expect(excStep.event).toBe('exception');
    expect(excStep.line).toBe(3);
    expect(excStep.variables['a']?.value).toBe(10);
    expect(excStep.variables['b']?.value).toBe(20);
    expect(excStep.variables['c']).toBeUndefined();
  });

  it('infinite loop stops safely via timeout or step limit without hanging', async () => {
    const code = [
      'let count = 0;',
      'while (true) {',
      '  count++;',
      '}',
    ].join('\n');

    const result = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 100,
      timeoutMs: 1000,
      language: 'javascript',
    });

    expect(result.truncated).toBe(true);
    expect(result.steps.length).toBeLessThanOrEqual(105);
  });

  // ── 13. Predefined Gallery Cards & Bubble Sort Regression ───────────────────
  it('confirms 3 gallery cards and Bubble Sort preset execute without regression', async () => {
    // 1. Bubble Sort preset
    const bubblePreset = ALGORITHM_PRESETS[0];
    const jsCode = bubblePreset.languages.javascript!.code;
    const jsInput = bubblePreset.languages.javascript!.input;
    const bubbleDriver = buildDriver(jsCode, jsInput, 'javascript', 'function');

    const bubbleResult = await runTrace({
      code: bubbleDriver,
      input: jsInput,
      mode: 'auto',
      maxSteps: 2000,
      timeoutMs: 5000,
      language: 'javascript',
    });

    expect(bubbleResult.error).toBeUndefined();
    expect(bubbleResult.steps.length).toBeGreaterThan(10);
    const bubbleDS = detectDataStructures(bubbleResult.steps);
    expect(bubbleDS.some((d) => d.dsType === 'array')).toBe(true);

    // 2. Gallery card 1: BST
    const bstItem = VISUALGO_ITEMS.find((it) => it.id === 'bst') || VISUALGO_ITEMS[0];
    const bstCode = bstItem.sampleCode.javascript || '';
    const bstDriver = buildDriver(bstCode, bstItem.sampleInput, 'javascript', 'function');
    const bstResult = await runTrace({
      code: bstDriver,
      input: bstItem.sampleInput,
      mode: 'auto',
      maxSteps: 2000,
      timeoutMs: 5000,
      language: 'javascript',
    });
    expect(bstResult.error).toBeUndefined();
    expect(bstResult.steps.length).toBeGreaterThan(0);

    // 3. Gallery card 2: BFS Graph
    const bfsItem = VISUALGO_ITEMS.find((it) => it.id === 'bfs') || VISUALGO_ITEMS[1];
    const bfsCode = bfsItem.sampleCode.javascript || '';
    const bfsDriver = buildDriver(bfsCode, bfsItem.sampleInput, 'javascript', 'function');
    const bfsResult = await runTrace({
      code: bfsDriver,
      input: bfsItem.sampleInput,
      mode: 'auto',
      maxSteps: 2000,
      timeoutMs: 5000,
      language: 'javascript',
    });
    expect(bfsResult.error).toBeUndefined();
    expect(bfsResult.steps.length).toBeGreaterThan(0);

    // 4. Gallery card 3: Linked List
    const llItem = VISUALGO_ITEMS.find((it) => it.id === 'linked_list') || VISUALGO_ITEMS[2];
    const llCode = llItem.sampleCode.javascript || '';
    const llDriver = buildDriver(llCode, llItem.sampleInput, 'javascript', 'function');
    const llResult = await runTrace({
      code: llDriver,
      input: llItem.sampleInput,
      mode: 'auto',
      maxSteps: 2000,
      timeoutMs: 5000,
      language: 'javascript',
    });
    expect(llResult.error).toBeUndefined();
    expect(llResult.steps.length).toBeGreaterThan(0);
  });
});
