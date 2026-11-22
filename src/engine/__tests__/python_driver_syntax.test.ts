import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildDriver } from '../ModeDetector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let py: any = null;
let tracerPythonCode = '';

beforeAll(async () => {
  const dir = path.resolve(__dirname, '../../../node_modules/.cache/pyodide');
  const mjsPath = path.join(dir, 'pyodide.mjs');
  const { loadPyodide } = await import(pathToFileURL(mjsPath).href);
  py = await loadPyodide({ indexURL: dir });

  const tracerPath = path.resolve(__dirname, '../../workers/python-tracer.py');
  tracerPythonCode = fs.readFileSync(tracerPath, 'utf8');

  // Verify tracer code itself compiles cleanly in Pyodide
  py.globals.set('__tracer_code__', tracerPythonCode);
  await py.runPythonAsync('compile(__tracer_code__, "<python-tracer.py>", "exec")');
  await py.runPythonAsync(tracerPythonCode);
});

describe('Python Driver Syntax & Pyodide Execution Regression Tests', () => {
  test('python-tracer.py compiles without syntax errors', async () => {
    expect(tracerPythonCode.length).toBeGreaterThan(0);
    // Line 514 check: ensure no raw unescaped newlines inside string literals
    expect(tracerPythonCode).toContain('if "\\n" in str(user_input):');
    expect(tracerPythonCode).toContain("if line.endswith('\\n'):");
  });

  test('Case 1: 3-line addBinary case compiles and runs cleanly in Pyodide', async () => {
    const userCode = `class Solution:
    def addBinary(self, a: str, b: str) -> str:
        return bin(int(a,2)+int(b,2))[2:]`;

    const input = '["11","1"]';
    const driverText = buildDriver(userCode, input, 'python', 'function');

    // 1. Must compile cleanly in Python compile()
    py.globals.set('__test_code__', driverText);
    await expect(
      py.runPythonAsync('compile(__test_code__, "<test_add_binary>", "exec")')
    ).resolves.toBeDefined();

    // 2. Execute via run_with_trace
    py.globals.set('__user_code__', driverText);
    py.globals.set('__user_input__', input);
    const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 3)');
    const res = JSON.parse(rawJson);

    expect(res.error).toBeNull();
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.stdout).toContain('100');
  });

  test('Case 2: Two Sum with class Solution and List[int] compiles and runs cleanly', async () => {
    const userCode = `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen:
                return [seen[diff], i]
            seen[n] = i
        return []`;

    const input = '[[2, 7, 11, 15], 9]';
    const driverText = buildDriver(userCode, input, 'python', 'function');

    py.globals.set('__test_code__', driverText);
    await expect(
      py.runPythonAsync('compile(__test_code__, "<test_two_sum>", "exec")')
    ).resolves.toBeDefined();

    py.globals.set('__user_code__', driverText);
    py.globals.set('__user_input__', input);
    const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 11)');
    const res = JSON.parse(rawJson);

    expect(res.error).toBeNull();
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.stdout).toContain('0');
    expect(res.stdout).toContain('1');
  });

  test('Case 3: Recursion (fib) compiles and tracks call stack frames', async () => {
    const userCode = `def fib(n: int) -> int:
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`;

    const input = '5';
    const driverText = buildDriver(userCode, input, 'python', 'function');

    py.globals.set('__test_code__', driverText);
    await expect(
      py.runPythonAsync('compile(__test_code__, "<test_fib>", "exec")')
    ).resolves.toBeDefined();

    py.globals.set('__user_code__', driverText);
    py.globals.set('__user_input__', input);
    const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 4)');
    const res = JSON.parse(rawJson);

    expect(res.error).toBeNull();
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.stdout).toContain('5');

    // Verify recursion depth in call stack
    const maxDepth = Math.max(...res.steps.map((s: any) => (s.callStack ? s.callStack.length : 0)));
    expect(maxDepth).toBeGreaterThanOrEqual(4);
  });

  test('Case 4: Stdin program with input() compiles and runs with multi-line input', async () => {
    const userCode = `n = int(input())
total = 0
for _ in range(n):
    total += int(input())
print(f"Total: {total}")`;

    const stdin = '3\n10\n20\n30\n';
    const driverText = buildDriver(userCode, '', 'python', 'full-program');

    py.globals.set('__test_code__', driverText);
    await expect(
      py.runPythonAsync('compile(__test_code__, "<test_stdin>", "exec")')
    ).resolves.toBeDefined();

    py.globals.set('__user_code__', driverText);
    py.globals.set('__user_input__', stdin);
    const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 5)');
    const res = JSON.parse(rawJson);

    expect(res.error).toBeNull();
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.stdout).toContain('Total: 60');
  });

  test('Case 5: Program printing strings containing newlines and quotes compiles and runs', async () => {
    const userCode = `s = "hello\\nworld \\"quoted\\" 'single'"
print(s)
print('line 1\\nline 2\\t"tabs and quotes"')`;

    const driverText = buildDriver(userCode, '', 'python', 'full-program');

    py.globals.set('__test_code__', driverText);
    await expect(
      py.runPythonAsync('compile(__test_code__, "<test_quotes>", "exec")')
    ).resolves.toBeDefined();

    py.globals.set('__user_code__', driverText);
    py.globals.set('__user_input__', '');
    const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 3)');
    const res = JSON.parse(rawJson);

    expect(res.error).toBeNull();
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.stdout).toContain('hello');
    expect(res.stdout).toContain('world');
    expect(res.stdout).toContain('quoted');
  });
});
