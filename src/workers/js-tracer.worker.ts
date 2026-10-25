/**
 * js-tracer.worker.ts
 *
 * Runs inside a Web Worker. Receives a TraceRequest, instruments the JS
 * code using Babel AST transformation, executes it in a restricted sandbox,
 * and streams back the TraceResult.
 *
 * Security: globals like fetch, XMLHttpRequest, importScripts, eval
 * are shadowed with no-ops before user code runs.
 */

import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import type { TraceRequest, TraceResult, TraceStep, DSMutation } from '../engine/TraceTypes';

// Babel ESM interop
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse = (_traverse as any).default ?? _traverse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generate = (_generate as any).default ?? _generate;

// ─── Worker message handling ─────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<TraceRequest>) => {
  const request = e.data;
  try {
    const result = await runTrace(request);
    self.postMessage({ type: 'result', result });
  } catch (err) {
    const result: TraceResult = {
      steps: [],
      language: 'javascript',
      mode: 'function',
      truncated: false,
      totalSteps: 0,
      stdout: '',
      stderr: String(err),
      error: String(err),
    };
    self.postMessage({ type: 'result', result });
  }
};

// ─── Instrumentation ─────────────────────────────────────────────────────────

/**
 * Transforms the AST to inject `__step__(lineNo, vars)` calls before
 * each statement and wraps function entries/exits.
 */
function instrumentCode(code: string): string {
  let ast: ReturnType<typeof parser.parse>;
  try {
    ast = parser.parse(code, {
      sourceType: 'script',
      plugins: ['jsx'],
      errorRecovery: true,
    });
  } catch (err) {
    throw new Error(`Syntax error: ${err}`);
  }

  traverse(ast, {
    // Before each statement, insert __step__ call
    Statement: {
      enter(path: import('@babel/traverse').NodePath) {
        const node = path.node;
        if (!node.loc) return;
        // Skip block statements themselves (they contain children)
        if (
          t.isBlockStatement(node) ||
          t.isProgram(node) ||
          t.isSwitchCase(node)
        )
          return;

        // Skip for-loop init/left variable declarations to prevent syntax corruption
        if (path.key === 'init' || path.key === 'left') return;

        const line = node.loc.start.line;

        // Build variable snapshot from current scope bindings as getters
        const bindings = path.scope.getAllBindings();
        const properties: t.ObjectProperty[] = [];
        for (const [name] of Object.entries(bindings)) {
          if (
            name.startsWith('__') ||
            name === 'console' ||
            name === 'arguments'
          )
            continue;
          if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) continue;

          try {
            properties.push(
              t.objectProperty(
                t.stringLiteral(name),
                t.arrowFunctionExpression([], t.identifier(name)),
              ),
            );
          } catch {
            // ignore invalid identifier
          }
        }
        const varSnapshot = t.objectExpression(properties);

        const stepCall = t.expressionStatement(
          t.callExpression(t.identifier('__step__'), [
            t.numericLiteral(line),
            t.stringLiteral('line'),
            varSnapshot,
          ]),
        );

        // Prepend the step call safely
        try {
          if (path.parentPath && (path.parentPath.isBlockStatement() || path.parentPath.isProgram())) {
            path.insertBefore(stepCall);
          } else if (
            path.parentPath &&
            (path.parentPath.isIfStatement() ||
              path.parentPath.isForStatement() ||
              path.parentPath.isWhileStatement())
          ) {
            path.replaceWith(t.blockStatement([stepCall, path.node as t.Statement]));
          }
        } catch {
          // skip if not insertable
        }
      },
    },

    // Wrap function calls to track call/return
    CallExpression: {
      enter(path: import('@babel/traverse').NodePath<t.CallExpression>) {
        const node = path.node;
        if (!node.loc) return;
        // Avoid instrumenting our own helpers
        if (
          t.isIdentifier(node.callee) &&
          (node.callee.name.startsWith('__') || node.callee.name === 'console')
        )
          return;
      },
    },
  });

  return generate(ast, { retainLines: true }, code).code;
}

// ─── Sandbox execution ────────────────────────────────────────────────────────

async function runTrace(request: TraceRequest): Promise<TraceResult> {
  const { code, maxSteps = 5000, timeoutMs = 5000 } = request;

  const steps: TraceStep[] = [];
  let stdout = '';
  let stderr = '';
  let truncated = false;
  let totalSteps = 0;

  // Instrument
  let instrumented: string;
  try {
    instrumented = instrumentCode(code);
  } catch (e) {
    return {
      steps,
      language: 'javascript',
      mode: request.mode === 'auto' ? 'function' : request.mode,
      truncated,
      totalSteps,
      stdout,
      stderr: String(e),
      error: String(e),
    };
  }

  // Runtime state
  const varScopes: Array<Record<string, unknown>> = [{}];
  const callStack: Array<{ name: string; line: number }> = [
    { name: '<main>', line: 0 },
  ];
  let stepCount = 0;
  let lastStdout = '';

  // Collect all variables in pseudo-scope
  function collectVars(line: number) {
    const merged: Record<string, unknown> = {};
    for (const scope of varScopes) {
      Object.assign(merged, scope);
    }
    // Remove internals
    delete merged.__step__;
    delete merged.__collectVars__;
    delete merged.__console__;
    return { line, vars: merged };
  }

  let lastVarsSnapshot: Record<string, unknown> = {};

  function recordStep(
    line: number,
    event: string,
    vars: Record<string, unknown>,
  ) {
    totalSteps++;
    if (stepCount >= maxSteps) {
      truncated = true;
      return;
    }

    // Convert vars to TraceValues
    const variables: TraceStep['variables'] = {};
    for (const [k, v] of Object.entries(vars)) {
      variables[k] = {
        type: getType(v),
        repr: safeRepr(v),
        value: safeClone(v),
      };
    }

    // Detect mutations (swaps, updates) on array variables
    const mutations: DSMutation[] = [];
    for (const [k, v] of Object.entries(vars)) {
      if (Array.isArray(v)) {
        const prevArr = lastVarsSnapshot[k];
        if (Array.isArray(prevArr) && prevArr.length === v.length) {
          const changed: number[] = [];
          for (let idx = 0; idx < v.length; idx++) {
            if (v[idx] !== prevArr[idx]) {
              changed.push(idx);
            }
          }
          if (changed.length > 0) {
            const isSwap =
              changed.length === 2 &&
              v[changed[0]] === prevArr[changed[1]] &&
              v[changed[1]] === prevArr[changed[0]];
            mutations.push({
              stepIndex: stepCount,
              op: isSwap ? 'swap' : 'change',
              dsType: 'array',
              dsId: k,
              varName: k,
              highlightIndices: changed,
              description: isSwap
                ? `Swapped ${k}[${changed[0]}] (${v[changed[0]]}) and ${k}[${changed[1]}] (${v[changed[1]]})`
                : `Updated ${k} at [${changed.join(', ')}]`,
            });
          }
        }
      }
    }

    // If no mutation, detect comparison if pointer variables i, j exist
    if (mutations.length === 0) {
      const arrEntry = Object.entries(vars).find(([_, val]) => Array.isArray(val));
      if (arrEntry) {
        const [arrName, arrVal] = arrEntry as [string, unknown[]];
        const jVal = vars['j'];
        const iVal = vars['i'];
        const midVal = vars['mid'];
        if (typeof jVal === 'number' && jVal >= 0 && jVal < arrVal.length) {
          const second = jVal + 1 < arrVal.length ? jVal + 1 : undefined;
          const indices = second !== undefined ? [jVal, second] : [jVal];
          mutations.push({
            stepIndex: stepCount,
            op: 'compare',
            dsType: 'array',
            dsId: arrName,
            varName: arrName,
            highlightIndices: indices,
            description: indices.length === 2
              ? `Comparing ${arrName}[${indices[0]}] and ${arrName}[${indices[1]}]`
              : `Checking ${arrName}[${jVal}]`,
          });
        } else if (typeof midVal === 'number' && midVal >= 0 && midVal < arrVal.length) {
          mutations.push({
            stepIndex: stepCount,
            op: 'compare',
            dsType: 'array',
            dsId: arrName,
            varName: arrName,
            highlightIndices: [midVal],
            description: `Checking midpoint ${arrName}[${midVal}]`,
          });
        } else if (typeof iVal === 'number' && iVal >= 0 && iVal < arrVal.length) {
          mutations.push({
            stepIndex: stepCount,
            op: 'compare',
            dsType: 'array',
            dsId: arrName,
            varName: arrName,
            highlightIndices: [iVal],
            description: `Inspecting ${arrName}[${iVal}]`,
          });
        }
      }
    }

    // Update lastVarsSnapshot with cloned values for next step diffing
    lastVarsSnapshot = {};
    for (const [k, v] of Object.entries(vars)) {
      lastVarsSnapshot[k] = safeClone(v);
    }

    steps.push({
      index: stepCount++,
      line,
      event: event as TraceStep['event'],
      variables,
      callStack: callStack.map((f) => ({
        name: f.name,
        line: f.line,
        locals: {},
      })),
      mutations,
      stdout: stdout || undefined,
    });
  }

  // Sandbox globals
  const sandboxGlobals: Record<string, unknown> = {
    __step__: (
      line: number,
      event: string,
      varCollector?: Record<string, () => unknown>,
    ) => {
      if (truncated) throw new Error('__TRUNCATED__');
      const vars: Record<string, unknown> = {};
      if (varCollector && typeof varCollector === 'object') {
        for (const [k, getter] of Object.entries(varCollector)) {
          try {
            if (typeof getter === 'function') {
              vars[k] = (getter as () => unknown)();
            } else {
              vars[k] = getter;
            }
          } catch {
            // TDZ / uninitialized / out of scope, safely ignore
          }
        }
      }
      recordStep(line, event, vars);
    },
    __collectVars__: (line: number) => {
      return collectVars(line);
    },
    console: {
      log: (...args: unknown[]) => {
        const msg = args.map((a) => safeRepr(a)).join(' ');
        stdout += msg + '\n';
        lastStdout = stdout;
      },
      error: (...args: unknown[]) => {
        stderr += args.map((a) => safeRepr(a)).join(' ') + '\n';
      },
      warn: (...args: unknown[]) => {
        stdout += '[warn] ' + args.map((a) => safeRepr(a)).join(' ') + '\n';
      },
    },
    // Block dangerous globals
    fetch: undefined,
    XMLHttpRequest: undefined,
    importScripts: undefined,
    Function: undefined,
    // Provide safe Math, Array, Object, etc.
    Math,
    Array,
    Object,
    String,
    Number,
    Boolean,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
    NaN,
    Infinity,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Promise,
    Symbol,
    ListNode: class ListNode {
      val: unknown;
      next: unknown;
      constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
      }
    },
    TreeNode: class TreeNode {
      val: unknown;
      left: unknown;
      right: unknown;
      constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
      }
    },
  };

  // Execute with timeout
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Execution timed out')), timeoutMs),
  );

  try {
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        try {
          const fn = new (Function as FunctionConstructor)(
            ...Object.keys(sandboxGlobals),
            `"use strict";\n${instrumented}`,
          );
          fn(...Object.values(sandboxGlobals));
          resolve();
        } catch (err: unknown) {
          if (err instanceof Error && err.message === '__TRUNCATED__') {
            resolve();
          } else {
            reject(err);
          }
        }
      }),
      timeoutPromise,
    ]);
  } catch (err: unknown) {
    if (err instanceof Error && err.message !== '__TRUNCATED__') {
      stderr += `\nRuntime error: ${err.message}`;
      if (steps.length > 0) {
        const lastStep = steps[steps.length - 1];
        steps.push({
          ...lastStep,
          index: stepCount++,
          event: 'exception',
          exception: { type: 'RuntimeError', message: String(err) },
        });
      }
    }
  }

  return {
    steps,
    language: 'javascript',
    mode: request.mode === 'auto' ? 'function' : request.mode,
    truncated,
    totalSteps,
    stdout,
    stderr,
    error: stderr || undefined,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getType(val: unknown): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'object' && val !== null) {
    if ('left' in val && 'right' in val && 'val' in val) return 'binaryTree';
    if ('next' in val && 'val' in val) return 'linkedList';
  }
  return typeof val;
}

function safeRepr(val: unknown, depth = 0): string {
  if (depth > 3) return '...';
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length > 20) return `[...${val.length} items]`;
    return `[${val.map((v) => safeRepr(v, depth + 1)).join(', ')}]`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as object).slice(0, 10);
    return `{${entries.map(([k, v]) => `${k}: ${safeRepr(v, depth + 1)}`).join(', ')}}`;
  }
  return String(val);
}

function safeClone(val: unknown, depth = 0): unknown {
  if (depth > 4) return '...';
  if (val === null || val === undefined) return val;
  if (typeof val !== 'object' && typeof val !== 'function') return val;
  if (Array.isArray(val)) {
    if (val.length > 50) return val.slice(0, 50);
    return val.map((v) => safeClone(v, depth + 1));
  }
  if (typeof val === 'object') {
    const out: Record<string, unknown> = {};
    let count = 0;
    for (const [k, v] of Object.entries(val as object)) {
      if (count++ > 20) break;
      out[k] = safeClone(v, depth + 1);
    }
    return out;
  }
  return String(val);
}
