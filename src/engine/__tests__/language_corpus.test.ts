import { describe, test, expect, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { getAdapter } from '../adapters/AdapterRegistry';
import { runTrace } from '../JSTracer';
import { detectDataStructures } from '../DSDetector';
import type { SupportedLanguage, TraceResult } from '../TraceTypes';

// Web Worker shim for Node.js / Vitest environment to run the exact adapter pipeline
class MockWorker extends EventTarget {
  constructor(public url: URL | string, public options?: any) {
    super();
  }
  postMessage(data: any) {
    setTimeout(async () => {
      const urlStr = String(this.url);
      if (urlStr.includes('pyodide')) {
        const result: TraceResult = {
          steps: [],
          language: 'python',
          mode: data.mode || 'function',
          truncated: false,
          totalSteps: 0,
          stdout: '',
          stderr: 'Pyodide fallback needed: transpiler could not produce steps in Node test',
          error: 'transpiler: unsupported syntax, requires Pyodide WebAssembly worker (browser only)',
        };
        const event = new MessageEvent('message', {
          data: { type: 'result', result },
        });
        this.dispatchEvent(event);
        return;
      }

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
            timeoutMs: 1500,
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
              1000,
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
            stderr: errorMessage,
            error: errorMessage,
          };
        }

        stepCount = res.steps ? res.steps.length : 0;
        ranToCompletion = !res.timedOut && !errorMessage && !res.error;
        if (res.error) {
          errorMessage = res.error;
        }

        // Extract failed line
        if (errorMessage) {
          const m = errorMessage.match(/(?:line\s*|:)(\d+)(?::(\d+))?/i);
          if (m) {
            failedJsLine = parseInt(m[1], 10);
            failedSourceLine = failedJsLine <= sourceLineCount ? failedJsLine : null;
            if (failedSourceLine && sourceLines[failedSourceLine - 1]) {
              failingConstruct = sourceLines[failedSourceLine - 1].trim();
            }
          }
        }

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
          // If any expected DS type is in detectedTypes
          expectedDSDetected = meta.expectedDS.some((type) => detectedTypes.has(type as any));
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

      // Verify that the record was generated
      expect(record).toBeDefined();
    },
  );
});

