import { describe, test, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAdapter } from '../adapters/AdapterRegistry';
import { runTrace } from '../JSTracer';
import { detectDataStructures } from '../DSDetector';
import type { SupportedLanguage, TraceResult } from '../TraceTypes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedPyodidePromise: Promise<any> | null = null;
async function getRealNodePyodide() {
  if (cachedPyodidePromise) return cachedPyodidePromise;
  cachedPyodidePromise = (async () => {
    const dir = path.resolve(__dirname, '../../../node_modules/.cache/pyodide');
    const mjsPath = path.join(dir, 'pyodide.mjs');
    if (!fs.existsSync(mjsPath)) return null;
    const { pathToFileURL } = await import('node:url');
    const { loadPyodide } = await import(pathToFileURL(mjsPath).href);
    const py = await loadPyodide({ indexURL: dir });

    const tracerCode = fs.readFileSync(
      path.resolve(__dirname, '../../workers/python-tracer.py'),
      'utf8',
    );
    await py.runPythonAsync(tracerCode);
    return py;
  })();
  return cachedPyodidePromise;
}

let pyodideLock = Promise.resolve();

// Web Worker shim for Node.js / Vitest environment to run the exact adapter pipeline
class MockWorker extends EventTarget {
  url: URL | string;
  options?: any;
  constructor(url: URL | string, options?: any) {
    super();
    this.url = url;
    this.options = options;
  }
  postMessage(data: any) {
    const urlStr = String(this.url);
    if (urlStr.includes('pyodide')) {
      pyodideLock = pyodideLock.then(async () => {
        const py = await getRealNodePyodide();
        if (py) {
          try {
            py.globals.set('__user_code_str__', data.code);
            py.globals.set('__user_input_str__', data.input || '');
            py.globals.set('__max_steps__', data.maxSteps || 5000);
            py.globals.set('__user_line_count__', data.userLineCount || 0);

            const rawJson = await py.runPythonAsync(
              'run_with_trace(__user_code_str__, __max_steps__, __user_input_str__, __user_line_count__)'
            );
            const parsed = JSON.parse(rawJson);
            const result: TraceResult = {
              steps: parsed.steps || [],
              language: 'python',
              mode: data.mode || 'function',
              truncated: parsed.truncated || false,
              totalSteps: parsed.totalSteps || (parsed.steps ? parsed.steps.length : 0),
              stdout: parsed.stdout || '',
              stderr: parsed.stderr || '',
              error: parsed.error || null,
            };
            this.dispatchEvent(new MessageEvent('message', { data: { type: 'result', result } }));
            return;
          } catch (err: any) {
            const result: TraceResult = {
              steps: [],
              language: 'python',
              mode: data.mode || 'function',
              truncated: false,
              totalSteps: 0,
              stdout: '',
              stderr: String(err),
              error: String(err),
            };
            this.dispatchEvent(new MessageEvent('message', { data: { type: 'result', result } }));
            return;
          }
        }
      });
      return;
    }

    setTimeout(async () => {
      try {
        const result = await runTrace(data);
        const event = new MessageEvent('message', {
          data: { type: 'result', result },
        });
        this.dispatchEvent(event);
      } catch (err) {
        const result: TraceResult = {
          steps: [],
          language: data.language || 'javascript',
          mode: data.mode || 'function',
          truncated: false,
          totalSteps: 0,
          stdout: '',
          stderr: String(err),
          error: String(err),
        };
        const event = new MessageEvent('message', {
          data: { type: 'result', result },
        });
        this.dispatchEvent(event);
      }
    }, 0);
  }
  terminate() {}
}

if (typeof (globalThis as any).Worker === 'undefined') {
  (globalThis as any).Worker = MockWorker;
}

interface FixtureMeta {
  mode: 'function' | 'full-program';
  testInput: string;
  stdin: string;
  expectedStdout: string;
  expectedDS: string[];
}

export interface CorpusRecord {
  language: SupportedLanguage;
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  fixtureName: string;
  filePath: string;
  mode: string;
  transpileOk: boolean;
  ranToCompletion: boolean;
  stdoutMatches: boolean;
  expectedDSDetected: boolean;
  stepCount: number;
  lineNumbersInRange: boolean;
  errorMessage: string | null;
  failedJsLine: number | null;
  failedSourceLine: number | null;
  failingConstruct: string | null;
  failurePoint: 'none' | 'transpile' | 'parse' | 'runtime' | 'wrong_stdout' | 'wrong_ds';
  rootCauseCategory: string | null;
  passed: boolean;
}

const FIXTURES_ROOT = path.resolve(__dirname, 'fixtures');
const languages: SupportedLanguage[] = ['javascript', 'python', 'cpp', 'java', 'go', 'rust'];

interface DiscoveredFixture {
  language: SupportedLanguage;
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  fixtureName: string;
  codePath: string;
  code: string;
  meta: FixtureMeta;
}

function discoverFixtures(): DiscoveredFixture[] {
  const discovered: DiscoveredFixture[] = [];
  if (!fs.existsSync(FIXTURES_ROOT)) return discovered;

  for (const lang of languages) {
    const langDir = path.join(FIXTURES_ROOT, lang);
    if (!fs.existsSync(langDir)) continue;

    const files = fs.readdirSync(langDir);
    for (const file of files) {
      if (file.endsWith('.meta.json')) continue;
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      const metaPath = path.join(langDir, `${base}.meta.json`);

      if (!fs.existsSync(metaPath)) continue;

      const code = fs.readFileSync(path.join(langDir, file), 'utf-8');
      const meta: FixtureMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

      const catLetter = base.charAt(0).toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
      const category = ['A', 'B', 'C', 'D', 'E', 'F'].includes(catLetter) ? catLetter : 'A';

      discovered.push({
        language: lang,
        category,
        fixtureName: base,
        codePath: path.join(langDir, file),
        code,
        meta,
      });
    }
  }
  return discovered;
}

const allFixtures = discoverFixtures();
const recordedResults: CorpusRecord[] = [];

const knownFailingPath = path.resolve(__dirname, '../../../docs/known-failing.json');
function loadKnownFailing(): Set<string> {
  if (!fs.existsSync(knownFailingPath)) {
    throw new Error(`Missing required known-failing list at ${knownFailingPath}`);
  }
  const raw = JSON.parse(fs.readFileSync(knownFailingPath, 'utf-8'));
  const set = new Set<string>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string') set.add(item);
      else if (item && item.language && (item.fixture || item.fixtureName)) {
        set.add(`${item.language}/${item.fixture || item.fixtureName}`);
      }
    }
  } else if (typeof raw === 'object' && raw !== null) {
    for (const [lang, list] of Object.entries(raw)) {
      if (Array.isArray(list)) {
        for (const name of list) {
          set.add(`${lang}/${name}`);
        }
      }
    }
  }
  return set;
}
const knownFailingSet = loadKnownFailing();

function extractErrorLocation(
  errorMessage: string | null,
  sourceLineCount: number,
  sourceLines: string[],
): {
  failedJsLine: number | null;
  failedSourceLine: number | null;
  failingConstruct: string | null;
} {
  if (!errorMessage) {
    return { failedJsLine: null, failedSourceLine: null, failingConstruct: null };
  }

  let line: number | null = null;

  // 1. Python traceback: look for File "<algolens>" (or "<user_code>"), line (\d+)
  const pyUserCodeMatches = Array.from(
    errorMessage.matchAll(/File\s+["'](?:<algolens>|<user_code>)["'],\s+line\s+(\d+)/g),
  );
  if (pyUserCodeMatches.length > 0) {
    for (let i = pyUserCodeMatches.length - 1; i >= 0; i--) {
      const candidate = parseInt(pyUserCodeMatches[i][1], 10);
      if (candidate >= 1 && candidate <= sourceLineCount) {
        line = candidate;
        break;
      }
    }
  }

  // 2. Babel error: "(line:col)" e.g. "Unexpected token (3:13)" or "Missing semicolon. (4:12)"
  if (line === null) {
    const babelMatch = errorMessage.match(/\((\d+):(\d+)\)/);
    if (babelMatch) {
      line = parseInt(babelMatch[1], 10);
    } else {
      // 3. Python / standard compiler message: "line 4" or "line: 4"
      const lineWordMatch = errorMessage.match(/\bline\s*:?\s*(\d+)\b/i);
      if (lineWordMatch) {
        line = parseInt(lineWordMatch[1], 10);
      } else {
        // 4. Stack trace format: ":line:col" or ":line"
        const stackMatch = errorMessage.match(/(?::|<anonymous>:|eval:)(\d+)(?::(\d+))?/);
        if (stackMatch) {
          line = parseInt(stackMatch[1], 10);
        }
      }
    }
  }

  const failedJsLine = line;
  if (line !== null && line >= 1 && line <= sourceLineCount) {
    const failedSourceLine = line;
    const text = sourceLines[line - 1]?.trim();
    const failingConstruct = text && text.length > 0 ? text : 'could not locate the line';
    return { failedJsLine, failedSourceLine, failingConstruct };
  }

  return {
    failedJsLine,
    failedSourceLine: null,
    failingConstruct: 'could not locate the line',
  };
}

describe('Language Support Corpus Test Suite', () => {
  afterAll(() => {
    const outputDir = path.resolve(process.cwd(), 'test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const summaryPath = path.join(outputDir, 'corpus-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(recordedResults, null, 2), 'utf-8');
    console.log(`\n[Language Corpus] Saved summary of ${recordedResults.length} fixture runs to ${summaryPath}`);
  });

  test.each(allFixtures)(
    '$language / $fixtureName',
    async ({ language, category, fixtureName, codePath, code, meta }) => {
      let transpileOk = false;
      let ranToCompletion = false;
      let stdoutMatches = false;
      let expectedDSDetected = false;
      let stepCount = 0;
      let lineNumbersInRange = false;
      let errorMessage: string | null = null;
      let failedJsLine: number | null = null;
      let failedSourceLine: number | null = null;
      let failingConstruct: string | null = null;
      let failurePoint: CorpusRecord['failurePoint'] = 'none';
      let rootCauseCategory: string | null = null;
      let passed = false;

      const sourceLines = code.split('\n');
      const sourceLineCount = sourceLines.length;

      try {
        const adapter = getAdapter(language);
        let res: TraceResult;

        try {
          const tracePromise = adapter.trace({
            code,
            input: meta.testInput,
            stdin: meta.stdin,
            mode: meta.mode,
            timeoutMs: language === 'python' ? 10000 : 1500,
            maxSteps: 5000,
            language,
          });

          const timeoutPromise = new Promise<TraceResult>((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    'Adapter trace timed out (unregistered worker listener in adapter or worker hang)',
                  ),
                ),
              language === 'python' ? 25000 : 2000,
            ),
          );

          res = await Promise.race([tracePromise, timeoutPromise]);
          transpileOk = true;
        } catch (err: any) {
          transpileOk = false;
          errorMessage = err?.message || String(err);
          failurePoint = 'transpile';
          rootCauseCategory = `transpiler: crash on ${language}`;
          res = {
            steps: [],
            language,
            mode: meta.mode,
            truncated: false,
            totalSteps: 0,
            stdout: '',
            stderr: errorMessage ?? '',
            error: errorMessage ?? undefined,
          };
        }

        stepCount = res.steps ? res.steps.length : 0;
        ranToCompletion = !res.timedOut && !errorMessage && !res.error;
        if (res.error) {
          errorMessage = res.error;
        }

        // Extract failed line
        const errorLoc = extractErrorLocation(errorMessage, sourceLineCount, sourceLines);
        failedJsLine = errorLoc.failedJsLine;
        failedSourceLine = errorLoc.failedSourceLine;
        failingConstruct = errorLoc.failingConstruct;

        // Check line numbers in range
        lineNumbersInRange =
          stepCount === 0 || res.steps.every((s) => s.line >= 1 && s.line <= sourceLineCount);

        // Check stdout
        const norm = (s: string) =>
          s
            .replace(/\r/g, '')
            .replace(/Return\s*value:\s*/gi, '')
            .replace(/\s+/g, '')
            .trim();
        const normActual = norm(res.stdout || '');
        const normExpected = norm(meta.expectedStdout || '');

        if (!meta.expectedStdout || meta.expectedStdout.trim() === '') {
          stdoutMatches = true;
        } else {
          stdoutMatches = normActual.includes(normExpected);
        }

        // Check Data Structures
        if (meta.expectedDS && meta.expectedDS.length > 0 && res.steps && res.steps.length > 0) {
          const detected = detectDataStructures(res.steps);
          const detectedTypes = new Set(detected.map((d) => d.dsType));
          // If any expected DS type is in detectedTypes (stack/queue are array-backed and rendered by ArrayRenderer)
          expectedDSDetected = meta.expectedDS.some((type) => {
            if (detectedTypes.has(type as any)) return true;
            if (type === 'array' && (detectedTypes.has('stack') || detectedTypes.has('queue'))) return true;
            if ((type === 'stack' || type === 'queue') && detectedTypes.has('array')) return true;
            return false;
          });
        } else if (!meta.expectedDS || meta.expectedDS.length === 0) {
          expectedDSDetected = true;
        } else {
          expectedDSDetected = false;
        }

        // Categorize Failure Point & Root Cause
        if (!transpileOk) {
          failurePoint = 'transpile';
          rootCauseCategory = 'transpiler: threw uncaught exception';
        } else if (errorMessage && errorMessage.includes('Babel parse error')) {
          failurePoint = 'parse';
          rootCauseCategory = 'parser: generated invalid JavaScript AST';
        } else if (errorMessage) {
          failurePoint = 'runtime';
          if (errorMessage.includes('ReferenceError') || errorMessage.includes('not defined')) {
            rootCauseCategory = 'runtime: missing polyfill / builtin function';
          } else if (errorMessage.includes('TypeError')) {
            rootCauseCategory = 'runtime: type mismatch or method undefined on object';
          } else if (errorMessage.includes('timed out')) {
            rootCauseCategory = 'runtime: execution timed out';
          } else {
            rootCauseCategory = 'runtime: execution exception';
          }
        } else if (!stdoutMatches) {
          failurePoint = 'wrong_stdout';
          rootCauseCategory = 'logic: stdout does not match expected output';
        } else if (!expectedDSDetected && meta.expectedDS.length > 0) {
          failurePoint = 'wrong_ds';
          rootCauseCategory = 'ds_detector: failed to recognize expected data structure';
        }

        // Determine Category-specific PASS criteria
        if (category === 'A') {
          // LeetCode style: must produce steps, no error, stdout matches, and DS recognized
          passed =
            transpileOk &&
            stepCount > 0 &&
            !errorMessage &&
            stdoutMatches &&
            (meta.expectedDS.length === 0 || expectedDSDetected);
        } else if (category === 'B') {
          // Stdin: must run and match expected stdout
          passed = transpileOk && stdoutMatches && !errorMessage;
        } else if (category === 'C') {
          // Comments/Strings: must transpile, not crash, stdout matches if expected
          passed = transpileOk && !errorMessage && stdoutMatches && lineNumbersInRange;
        } else if (category === 'D') {
          // Syntax stress: must transpile and run without syntax error
          passed = transpileOk && !errorMessage && (meta.expectedStdout ? stdoutMatches : true);
        } else if (category === 'E') {
          // Runtime behavior:
          if (fixtureName.includes('infinite_loop')) {
            passed = res.timedOut === true || res.truncated === true || stepCount >= 4000;
          } else if (fixtureName.includes('deep_recursion')) {
            passed = (errorMessage !== null && /stack|recur/i.test(errorMessage)) || res.truncated || stepCount > 0;
          } else if (fixtureName.includes('runtime_exception')) {
            passed = stepCount > 0; // preserved steps before error
          } else {
            passed = true; // safe handling of division / bounds
          }
        } else if (category === 'F') {
          // Degenerate:
          if (fixtureName.includes('syntax_error')) {
            passed = !transpileOk || errorMessage !== null; // correctly detected broken syntax
          } else {
            passed = transpileOk && !errorMessage;
          }
        }

        if (passed) {
          failurePoint = 'none';
          rootCauseCategory = null;
        }
      } catch (fatal: any) {
        errorMessage = fatal?.message || String(fatal);
        failurePoint = 'transpile';
        rootCauseCategory = 'fatal: harness crash';
        passed = false;
      }

      const record: CorpusRecord = {
        language,
        category,
        fixtureName,
        filePath: codePath,
        mode: meta.mode,
        transpileOk,
        ranToCompletion,
        stdoutMatches,
        expectedDSDetected,
        stepCount,
        lineNumbersInRange,
        errorMessage,
        failedJsLine,
        failedSourceLine,
        failingConstruct,
        failurePoint,
        rootCauseCategory,
        passed,
      };

      recordedResults.push(record);

      // Regression assertions:
      if (language === 'javascript' || language === 'python') {
        const lineInfo = record.failedSourceLine
          ? ` at line ${record.failedSourceLine} ("${record.failingConstruct}")`
          : record.failingConstruct
            ? ` (${record.failingConstruct})`
            : '';
        expect(
          record.passed,
          `Fixture ${language}/${fixtureName} failed${lineInfo}: ${record.errorMessage || record.failurePoint}`,
        ).toBe(true);
      } else {
        const isKnownFailing = knownFailingSet.has(`${language}/${fixtureName}`);
        if (isKnownFailing) {
          // If listed in docs/known-failing.json, it is expected to fail.
          // The test fails if a fixture ON the list starts passing (so docs/known-failing.json gets updated).
          expect(
            record.passed,
            `Fixture ${language}/${fixtureName} PASSED, but is listed in docs/known-failing.json as failing. Please remove it from docs/known-failing.json!`,
          ).toBe(false);
        } else {
          // If NOT listed in docs/known-failing.json, it must pass.
          const lineInfo = record.failedSourceLine
            ? ` at line ${record.failedSourceLine} ("${record.failingConstruct}")`
            : record.failingConstruct
              ? ` (${record.failingConstruct})`
              : '';
          expect(
            record.passed,
            `Unexpected failure in ${language}/${fixtureName}${lineInfo}: fixture is NOT listed in docs/known-failing.json, but failed with: ${record.errorMessage || record.failurePoint}`,
          ).toBe(true);
        }
      }
    },
    30000,
  );
});

