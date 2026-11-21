import { describe, it, expect } from 'vitest';
import { runTrace } from '../JSTracer';
import { buildDriver, detectMode } from '../ModeDetector';
import { detectDataStructures } from '../DSDetector';
import { PythonAdapter } from '../adapters/PythonAdapter';

describe('Approved Plan Comprehensive Verification', () => {
  // 1. Two Sum as var twoSum = function
  it('handles Two Sum as var twoSum = function', async () => {
    const code = `var twoSum = function(nums, target) {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    };`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, '[[2, 7, 11, 15], 9]', 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: '[[2, 7, 11, 15], 9]',
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);
    expect(res.stdout).toContain('[0,1]');
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.varName === 'nums' && d.dsType === 'array')).toBe(true);
    expect(ds.some((d) => d.varName === 'map' && d.dsType === 'hashMap')).toBe(true);
  });

  // 2. Two Sum as arrow function
  it('handles Two Sum as arrow function', async () => {
    const code = `const twoSum = (nums, target) => {
      const map = new Map();
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
      }
      return [];
    };`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, '[[3, 2, 4], 6]', 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: '[[3, 2, 4], 6]',
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);
    expect(res.stdout).toContain('[1,2]');
  });

  // 3. Two Sum as class Solution
  it('handles Two Sum as class Solution', async () => {
    const code = `class Solution {
      twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const comp = target - nums[i];
          if (map.has(comp)) return [map.get(comp), i];
          map.set(nums[i], i);
        }
        return [];
      }
    }`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, '[[2, 7, 11, 15], 9]', 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: '[[2, 7, 11, 15], 9]',
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);
    // Call stack class method should have name twoSum, not anonymous
    const frames = res.steps.flatMap((s) => s.callStack.map((f) => f.name));
    expect(frames).toContain('twoSum');
    expect(frames).not.toContain('anonymous');
  });

  // 4. Reverse Linked List
  it('handles Reverse Linked List with ListNode conversion', async () => {
    const code = `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
var reverseList = function(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    let nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
};`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, '[[1, 2, 3, 4, 5]]', 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: '[[1, 2, 3, 4, 5]]',
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(10);
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'linkedList')).toBe(true);
  });

  // 5. Valid Parentheses
  it('handles Valid Parentheses', async () => {
    const code = `var isValid = function(s) {
      const stack = [];
      const map = { ')': '(', '}': '{', ']': '[' };
      for (const ch of s) {
        if (ch === '(' || ch === '{' || ch === '[') {
          stack.push(ch);
        } else if (stack.pop() !== map[ch]) {
          return false;
        }
      }
      return stack.length === 0;
    };`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, '["()[]{}"]', 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: '["()[]{}"]',
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);
    expect(res.stdout).toContain('true');
  });

  // 6. Binary Tree Inorder
  it('handles Binary Tree Inorder with TreeNode conversion', async () => {
    const code = `var inorderTraversal = function(root) {
      const res = [];
      function inorder(node) {
        if (!node) return;
        inorder(node.left);
        res.push(node.val);
        inorder(node.right);
      }
      inorder(root);
      return res;
    };`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, '[[1, null, 2, 3]]', 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: '[[1, null, 2, 3]]',
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);
    expect(res.stdout).toContain('[1,3,2]');
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'binaryTree' || d.dsType === 'bst' || d.dsType === 'array')).toBe(true);
  });

  // 7. Number of Islands
  it('handles Number of Islands (Grid)', async () => {
    const code = `var numIslands = function(grid) {
      if (!grid || grid.length === 0) return 0;
      let count = 0;
      const m = grid.length, n = grid[0].length;
      function dfs(r, c) {
        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;
        grid[r][c] = '0';
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
      }
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          if (grid[i][j] === '1') {
            count++;
            dfs(i, j);
          }
        }
      }
      return count;
    };`;
    const gridInput = '[[["1","1","0"],["0","1","0"],["0","0","1"]]]';
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, gridInput, 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: gridInput,
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('2');
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'grid')).toBe(true);
  });

  // 8. Full program: readline / require('readline')
  it('handles full program with require("readline")', async () => {
    const code = `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let sum = 0;
rl.on('line', (line) => {
  sum += Number(line.trim());
});
rl.on('close', () => {
  console.log("SUM:" + sum);
});`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('full-program');

    const res = await runTrace({
      code,
      input: '',
      stdin: '10\n20\n30\n',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('SUM:60');
    expect(res.steps.length).toBeGreaterThan(5);
  });

  // 9. Full program: fs.readFileSync(0)
  it('handles full program with require("fs").readFileSync(0)', async () => {
    const code = `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
let total = 0;
for (const x of input) {
  total += parseInt(x, 10);
}
console.log("TOTAL:" + total);`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('full-program');

    const res = await runTrace({
      code,
      input: '',
      stdin: '5\n15\n25\n',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('TOTAL:45');
  });

  // 10. Full program: prompt()
  it('handles full program with prompt()', async () => {
    const code = `const count = parseInt(prompt(), 10);
let acc = 0;
for (let i = 0; i < count; i++) {
  acc += parseInt(prompt(), 10);
}
console.log("ACC:" + acc);`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('full-program');

    const res = await runTrace({
      code,
      input: '',
      stdin: '3\n100\n200\n300\n',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('ACC:600');
  });

  // 11. Full program: process.stdin
  it('handles full program with process.stdin data/end listeners', async () => {
    const code = `let buffer = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
});
process.stdin.on('end', () => {
  const nums = buffer.trim().split(/\\s+/).map(Number);
  const max = Math.max(...nums);
  console.log("MAX:" + max);
});`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('full-program');

    const res = await runTrace({
      code,
      input: '',
      stdin: '4 19 8 3 42 12',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('MAX:42');
  });

  // 12. Multi-testcase Codeforces style
  it('handles multi-testcase Codeforces style', async () => {
    const code = `const fs = require('fs');
const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
const t = parseInt(lines[0], 10);
for (let i = 1; i <= t; i++) {
  const [a, b] = lines[i].trim().split(/\\s+/).map(Number);
  console.log("ANS:" + (a + b));
}`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('full-program');

    const res = await runTrace({
      code,
      input: '',
      stdin: '3\n1 2\n5 10\n100 200\n',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('ANS:3');
    expect(res.stdout).toContain('ANS:15');
    expect(res.stdout).toContain('ANS:300');
  });

  // 13. Python with input()
  it('handles Python with input() on fast transpile path', async () => {
    const pyCode = `n = int(input())
total = 0
for i in range(n):
    x = int(input())
    total += x
print("PY_TOTAL:", total)
`;
    const adapter = new PythonAdapter();
    const mode = adapter.detectMode(pyCode);
    expect(mode).toBe('full-program');

    const res = await adapter.trace({
      code: pyCode,
      input: '',
      stdin: '3\n10\n20\n30\n',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'python',
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('PY_TOTAL');
    expect(res.stdout).toContain('60');
    expect(res.steps.length).toBeGreaterThan(5);
  });

  // 14. Infinite loop stops safely
  it('stops safely on an infinite loop with timeout / truncation', async () => {
    const code = `let i = 0;
while (true) {
  i++;
}`;
    const res = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 500,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.truncated).toBe(true);
    expect(res.steps.length).toBeGreaterThan(0);
    // User can replay up to the failing / stopped line
    const lastStep = res.steps[res.steps.length - 1];
    expect(lastStep.line).toBeGreaterThanOrEqual(1);
  });

  // 15. Odd case triggering Trace view
  it('records execution steps for unrecognised structures (Trace view fallback)', async () => {
    const code = `let alpha = 10;
let beta = 20;
let gamma = alpha * beta + 5;
console.log("GAMMA:", gamma);`;
    const res = await runTrace({
      code,
      input: '',
      mode: 'full-program',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('GAMMA: 205');
    // No specific visual data structure recognized
    const ds = detectDataStructures(res.steps);
    expect(ds.length).toBe(0);
    // But execution steps, scope variables, and line numbers are intact for Trace View
    expect(res.steps.length).toBeGreaterThan(2);
    expect(res.steps[res.steps.length - 1].variables.gamma.value).toBe(205);
  });

  // 16. Bubble Sort behaves exactly as before
  it('ensures Bubble Sort looks and behaves exactly as before', async () => {
    const code = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`;
    const mode = detectMode(code, 'javascript');
    expect(mode).toBe('function');

    const runnable = buildDriver(code, '[[64, 34, 25, 12, 22, 11, 90]]', 'javascript', mode);
    const res = await runTrace({
      code: runnable,
      input: '[[64, 34, 25, 12, 22, 11, 90]]',
      mode,
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: code.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('[11,12,22,25,34,64,90]');
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.varName === 'arr' && d.dsType === 'array')).toBe(true);

    // Verify mutations (swap / compare) are recorded
    const allMutations = res.steps.flatMap((s) => s.mutations);
    expect(allMutations.some((m) => m.op === 'swap' || m.op === 'set')).toBe(true);
  });

  // 17. C++/Java/Go/Rust partial language notice on transpile/parse failure
  it('returns partial support notice and fallback step on unsupported syntax', async () => {
    const { CppAdapter } = await import('../adapters/CppAdapter');
    const { JavaAdapter } = await import('../adapters/JavaAdapter');
    const { GoAdapter } = await import('../adapters/GoAdapter');
    const { RustAdapter } = await import('../adapters/RustAdapter');

    const cpp = new CppAdapter();
    const cppRes = await cpp.trace({
      code: `template<typename T> struct Foo { T x; }; int main() { Foo<int> f; }`,
      input: '',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'cpp',
    });
    expect(cppRes.error).toContain('This language is only partially supported in the visualizer');
    expect(cppRes.steps.length).toBe(1);
    expect(cppRes.steps[0].event).toBe('exception');

    const java = new JavaAdapter();
    const javaRes = await java.trace({
      code: `public class Main { public static <T extends Comparable<T>> void sort(T[] a) {} }`,
      input: '',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'java',
    });
    expect(javaRes.error).toContain('This language is only partially supported in the visualizer');
    expect(javaRes.steps.length).toBe(1);

    const go = new GoAdapter();
    const goRes = await go.trace({
      code: `package main\ntype Any interface{}\nfunc main() {}`,
      input: '',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'go',
    });
    expect(goRes.error).toContain('This language is only partially supported in the visualizer');
    expect(goRes.steps.length).toBe(1);

    const rust = new RustAdapter();
    const rustRes = await rust.trace({
      code: `macro_rules! say_hello { () => { println!("Hello"); }; }\nfn main() { say_hello!(); }`,
      input: '',
      mode: 'full-program',
      maxSteps: 1000,
      timeoutMs: 3000,
      language: 'rust',
    });
    expect(rustRes.error).toContain('This language is only partially supported in the visualizer');
    expect(rustRes.steps.length).toBe(1);
  });
});
