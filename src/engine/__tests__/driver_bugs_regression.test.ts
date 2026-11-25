import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildDriver, detectMode, effectiveStdin, parseDesignProblemInput } from '../ModeDetector';
import { runTrace } from '../JSTracer';
import { canFastTranspilePython, transpilePythonToJs } from '../transpilers/PythonTranspiler';
import { createIoShims } from '../ioShims';

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

  py.globals.set('__tracer_code__', tracerPythonCode);
  await py.runPythonAsync(tracerPythonCode);
});

describe('Browser Bugs Regression Tests', () => {
  // ─── Bug 1: Python Full Program Stray Bracket & Stdin ─────────────────────
  describe('Bug 1: Python full program driver and leftover input handling', () => {
    const pythonCode = `t = int(input())
for _ in range(t):
    a, b = map(int, input().split())
    print(a + b)`;

    const customInput = '3\n1 2\n3 4\n10 20';
    const leftoverInput = '[[2,7,11,15],9]';

    test('transpiles and traces Python full program on fast path without syntax error', async () => {
      expect(canFastTranspilePython(pythonCode)).toBe(true);
      const transpiled = transpilePythonToJs(pythonCode);
      expect(transpiled.code).toContain('let [a, b] = prompt().trim().split(/\\s+/).filter(Boolean).map(Number);');

      const res = await runTrace({
        code: transpiled.code,
        input: leftoverInput,
        stdin: customInput,
        mode: 'full-program',
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });
      expect(res.error).toBeFalsy();
      expect(res.stdout).toBe('3\n7\n30\n');
    });

    test('detectMode classifies competitive stdin Python code as full-program', () => {
      expect(detectMode(pythonCode, 'python')).toBe('full-program');
    });

    test('buildDriver ignores leftover Test Input for full programs and does not prepend stray bracket', () => {
      const driverWithLeftover = buildDriver(pythonCode, leftoverInput, 'python', 'auto');
      expect(driverWithLeftover.startsWith(']')).toBe(false);
      expect(driverWithLeftover).toBe(pythonCode);

      const driverWithEmpty = buildDriver(pythonCode, '', 'python', 'auto');
      expect(driverWithEmpty.startsWith(']')).toBe(false);
      expect(driverWithEmpty).toBe(pythonCode);

      const driverDefaultMode = buildDriver(pythonCode, leftoverInput, 'python');
      expect(driverDefaultMode.startsWith(']')).toBe(false);
      expect(driverDefaultMode).toBe(pythonCode);
    });

    test('effectiveStdin does not leak leftover input into stdin for full programs', () => {
      // When stdin is provided
      const stdinResult = effectiveStdin({
        stdin: customInput,
        input: leftoverInput,
        mode: 'auto',
      });
      expect(stdinResult).toBe(customInput);

      // When stdin is empty, leftover test input must NOT become stdin
      const emptyStdinResult = effectiveStdin({
        stdin: '',
        input: leftoverInput,
        mode: 'full-program',
      });
      expect(emptyStdinResult).toBe('');
    });

    test('Python full program compiles and executes cleanly in Pyodide with custom input and leftover input', async () => {
      const driver = buildDriver(pythonCode, leftoverInput, 'python', 'auto');
      const stdin = effectiveStdin({
        stdin: customInput,
        input: leftoverInput,
        mode: 'auto',
      });

      py.globals.set('__test_code__', driver);
      await expect(
        py.runPythonAsync('compile(__test_code__, "<algolens>", "exec")')
      ).resolves.toBeDefined();

      py.globals.set('__user_code__', driver);
      py.globals.set('__user_input__', stdin);
      const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 4)');
      const res = JSON.parse(rawJson);

      expect(res.error).toBeFalsy();
      expect(res.stdout).toBe('3\n7\n30\n');
    });

    test('Python full program compiles and executes cleanly with empty Test Input', async () => {
      const driver = buildDriver(pythonCode, '', 'python', 'auto');
      const stdin = effectiveStdin({
        stdin: customInput,
        input: '',
        mode: 'auto',
      });

      py.globals.set('__user_code__', driver);
      py.globals.set('__user_input__', stdin);
      const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 4)');
      const res = JSON.parse(rawJson);

      expect(res.error).toBeFalsy();
      expect(res.stdout).toBe('3\n7\n30\n');
    });
  });

  // ─── Bug 2: JavaScript readFileSync(0) Stdin Pipeline ─────────────────────
  describe('Bug 2: JavaScript readFileSync(0) stdin pipeline & newline handling', () => {
    const jsCode = `const lines = require('fs').readFileSync(0,'utf8').trim().split('\\n');
const t = parseInt(lines[0]);
for (let i = 1; i <= t; i++) {
  const [a, b] = lines[i].split(' ').map(Number);
  console.log(a + b);
}`;

    const customInput = '3\n1 2\n3 4\n10 20';
    const leftoverInput = '[[2,7,11,15],9]';

    test('ioShims normalizes CRLF and preserves stdin lines without trailing CR', () => {
      let out = '';
      const shims = createIoShims('3\r\n1 2\r\n3 4\r\n10 20', (s) => {
        out += s;
      });
      const fsShim = shims.require('fs') as { readFileSync: (fd: number, enc: string) => string };
      const raw = fsShim.readFileSync(0, 'utf8');
      expect(raw).toBe('3\n1 2\n3 4\n10 20');
      const lines = raw.trim().split('\n');
      expect(lines).toEqual(['3', '1 2', '3 4', '10 20']);
      expect(lines[1].split(' ')).toEqual(['1', '2']);
    });

    test('traces JS readFileSync(0) with Custom Input and leftover Test Input intact', async () => {
      const mode = detectMode(jsCode, 'javascript');
      const driver = buildDriver(jsCode, leftoverInput, 'javascript', mode);
      const stdin = effectiveStdin({
        stdin: customInput,
        input: leftoverInput,
        mode,
      });

      const res = await runTrace({
        code: driver,
        input: leftoverInput,
        stdin,
        mode,
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });

      expect(res.error).toBeFalsy();
      expect(res.stdout).toBe('3\n7\n30\n');
    });

    test('traces JS readFileSync(0) with CRLF newlines (Windows textarea)', async () => {
      const crlfInput = '3\r\n1 2\r\n3 4\r\n10 20';
      const mode = detectMode(jsCode, 'javascript');
      const driver = buildDriver(jsCode, '', 'javascript', mode);
      const stdin = effectiveStdin({
        stdin: crlfInput,
        input: '',
        mode,
      });

      const res = await runTrace({
        code: driver,
        input: '',
        stdin,
        mode,
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });

      expect(res.error).toBeFalsy();
      expect(res.stdout).toBe('3\n7\n30\n');
    });

    test('traces JS readFileSync(0) when stdin has no trailing newline', async () => {
      const noTrailingNewlineInput = '3\n1 2\n3 4\n10 20';
      const mode = detectMode(jsCode, 'javascript');
      const driver = buildDriver(jsCode, '', 'javascript', mode);
      const stdin = effectiveStdin({
        stdin: noTrailingNewlineInput,
        input: '',
        mode,
      });

      const res = await runTrace({
        code: driver,
        input: '',
        stdin,
        mode,
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });

      expect(res.error).toBeFalsy();
      expect(res.stdout).toBe('3\n7\n30\n');
    });
  });

  // ─── Bug 3: LeetCode Design Problems Replay ──────────────────────────────
  describe('Bug 3: LeetCode design problem replay (prototype-style and class-style)', () => {
    const input2Lines = `["LRUCache","put","put","get"]\n[[2],[1,1],[2,2],[1]]`;
    const input1Array = `[["LRUCache","put","put","get"], [[2],[1,1],[2,2],[1]]]`;

    test('parseDesignProblemInput parses both 2-line and 1-array formats', () => {
      const p1 = parseDesignProblemInput(input2Lines);
      expect(p1).not.toBeNull();
      expect(p1?.ops).toEqual(['LRUCache', 'put', 'put', 'get']);
      expect(p1?.args).toEqual([[2], [1, 1], [2, 2], [1]]);

      const p2 = parseDesignProblemInput(input1Array);
      expect(p2).not.toBeNull();
      expect(p2?.ops).toEqual(['LRUCache', 'put', 'put', 'get']);
      expect(p2?.args).toEqual([[2], [1, 1], [2, 2], [1]]);

      // Existing single input "[2]" must NOT be parsed as design problem
      expect(parseDesignProblemInput('[2]')).toBeNull();
      // Two Sum input must NOT be parsed as design problem
      expect(parseDesignProblemInput('[[2, 7, 11, 15], 9]')).toBeNull();
    });

    const jsClassCode = `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    this.map.set(key, value);
  }
}`;

    const jsProtoCode = `var LRUCache = function(capacity) {
  this.capacity = capacity;
  this.map = new Map();
};
LRUCache.prototype.get = function(key) {
  if (!this.map.has(key)) return -1;
  const val = this.map.get(key);
  this.map.delete(key);
  this.map.set(key, val);
  return val;
};
LRUCache.prototype.put = function(key, value) {
  if (this.map.has(key)) this.map.delete(key);
  else if (this.map.size >= this.capacity) {
    const firstKey = this.map.keys().next().value;
    this.map.delete(firstKey);
  }
  this.map.set(key, value);
};`;

    const pythonClassCode = `class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        val = self.cache.pop(key)
        self.cache[key] = val
        return val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.capacity:
            first_key = next(iter(self.cache))
            del self.cache[first_key]
        self.cache[key] = value`;

    test('JS Class-style replaying design problem with 2-line input', async () => {
      const driver = buildDriver(jsClassCode, input2Lines, 'javascript', 'auto');
      const res = await runTrace({
        code: driver,
        input: input2Lines,
        mode: 'function',
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });

      expect(res.error).toBeFalsy();
      expect(res.stdout.trim()).toBe('[null,null,null,1]');
    });

    test('JS Class-style replaying design problem with 1-line array input', async () => {
      const driver = buildDriver(jsClassCode, input1Array, 'javascript', 'auto');
      const res = await runTrace({
        code: driver,
        input: input1Array,
        mode: 'function',
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });

      expect(res.error).toBeFalsy();
      expect(res.stdout.trim()).toBe('[null,null,null,1]');
    });

    test('JS Prototype-style replaying design problem with 2-line input', async () => {
      const driver = buildDriver(jsProtoCode, input2Lines, 'javascript', 'auto');
      const res = await runTrace({
        code: driver,
        input: input2Lines,
        mode: 'function',
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });

      expect(res.error).toBeFalsy();
      expect(res.stdout.trim()).toBe('[null,null,null,1]');
    });

    test('JS Prototype-style replaying design problem with 1-line array input', async () => {
      const driver = buildDriver(jsProtoCode, input1Array, 'javascript', 'auto');
      const res = await runTrace({
        code: driver,
        input: input1Array,
        mode: 'function',
        maxSteps: 5000,
        timeoutMs: 5000,
        language: 'javascript',
      });

      expect(res.error).toBeFalsy();
      expect(res.stdout.trim()).toBe('[null,null,null,1]');
    });

    test('Python Class-style replaying design problem with 2-line input in Pyodide', async () => {
      const driver = buildDriver(pythonClassCode, input2Lines, 'python', 'auto');
      py.globals.set('__test_code__', driver);
      await expect(
        py.runPythonAsync('compile(__test_code__, "<test_lru>", "exec")')
      ).resolves.toBeDefined();

      py.globals.set('__user_code__', driver);
      py.globals.set('__user_input__', input2Lines);
      const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 20)');
      const res = JSON.parse(rawJson);

      expect(res.error).toBeFalsy();
      expect(res.stdout.trim()).toBe('[null, null, null, 1]');
    });

    test('Python Class-style replaying design problem with 1-line array input in Pyodide', async () => {
      const driver = buildDriver(pythonClassCode, input1Array, 'python', 'auto');
      py.globals.set('__test_code__', driver);
      await expect(
        py.runPythonAsync('compile(__test_code__, "<test_lru_arr>", "exec")')
      ).resolves.toBeDefined();

      py.globals.set('__user_code__', driver);
      py.globals.set('__user_input__', input1Array);
      const rawJson = await py.runPythonAsync('run_with_trace(__user_code__, 5000, __user_input__, 20)');
      const res = JSON.parse(rawJson);

      expect(res.error).toBeFalsy();
      expect(res.stdout.trim()).toBe('[null, null, null, 1]');
    });
  });
});
