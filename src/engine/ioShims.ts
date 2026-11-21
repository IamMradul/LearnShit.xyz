/**
 * Browser-sandbox stand-ins for Node/CP stdin APIs.
 * All reads are backed by the Custom Input (stdin) string.
 */

export interface IoShims {
  prompt: (msg?: string) => string;
  input: (msg?: string) => string;
  sys: {
    stdin: {
      readline: () => string;
      read: () => string;
      readlines: () => string[];
      [Symbol.iterator]: () => Generator<string, void, unknown>;
    };
  };
  process: {
    argv: string[];
    stdin: {
      fd: number;
      isTTY: boolean;
      setEncoding: (enc?: string) => unknown;
      pipe: () => unknown;
      pause: () => unknown;
      on: (event: string, cb: (chunk?: string) => void) => unknown;
      once: (event: string, cb: (chunk?: string) => void) => unknown;
      resume: () => unknown;
    };
    stdout: { write: (chunk: string) => boolean };
    exit: (code?: number) => void;
    env: Record<string, string>;
    cwd: () => string;
  };
  require: (id: string) => unknown;
  flush: () => Promise<void>;
}

function splitStdinLines(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized) return [];
  const lines = normalized.split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

export function createIoShims(stdinText: string, onStdout: (s: string) => void): IoShims {
  const raw = typeof stdinText === 'string' ? stdinText : '';
  const lines = splitStdinLines(raw);
  let promptIndex = 0;

  const dataListeners: Array<(chunk?: string) => void> = [];
  const endListeners: Array<(chunk?: string) => void> = [];
  const lineListeners: Array<(chunk?: string) => void> = [];
  const closeListeners: Array<(chunk?: string) => void> = [];
  let flushed = false;

  const prompt = (_msg?: string) => {
    if (promptIndex < lines.length) return lines[promptIndex++];
    return '';
  };

  const stdinObj = {
    fd: 0,
    isTTY: false,
    setEncoding(_enc?: string) {
      return stdinObj;
    },
    pipe() {
      return stdinObj;
    },
    pause() {
      return stdinObj;
    },
    on(event: string, cb: (chunk?: string) => void) {
      if (event === 'data') dataListeners.push(cb);
      else if (event === 'end' || event === 'close') endListeners.push(cb);
      scheduleFlush();
      return stdinObj;
    },
    once(event: string, cb: (chunk?: string) => void) {
      return stdinObj.on(event, cb);
    },
    resume() {
      scheduleFlush();
      return stdinObj;
    },
  };

  const readlineInterface = {
    on(event: string, cb: (chunk?: string) => void) {
      if (event === 'line') lineListeners.push(cb);
      else if (event === 'close') closeListeners.push(cb);
      scheduleFlush();
      return readlineInterface;
    },
    once(event: string, cb: (chunk?: string) => void) {
      return readlineInterface.on(event, cb);
    },
    prompt() {
      return readlineInterface;
    },
    question(query: string, cb: (answer: string) => void) {
      cb(prompt(query));
      return readlineInterface;
    },
    close() {
      for (const cb of closeListeners) cb();
    },
    async *[Symbol.asyncIterator]() {
      for (const line of lines) yield line;
    },
  };

  function scheduleFlush() {
    queueMicrotask(() => {
      if (flushed) return;
      flushed = true;
      for (const cb of dataListeners) cb(raw);
      for (const cb of endListeners) cb();
      for (const line of lines) {
        for (const cb of lineListeners) cb(line);
      }
      for (const cb of closeListeners) cb();
    });
  }

  const requireFn = (id: string) => {
    const name = String(id).replace(/^node:/, '');
    if (name === 'readline') {
      return {
        createInterface(_opts?: unknown) {
          scheduleFlush();
          return readlineInterface;
        },
      };
    }
    if (name === 'fs') {
      return {
        readFileSync(fdOrPath: unknown, _enc?: unknown) {
          if (
            fdOrPath === 0 ||
            fdOrPath === '0' ||
            fdOrPath === '/dev/stdin' ||
            fdOrPath === 'stdin'
          ) {
            return raw;
          }
          throw new Error(`fs.readFileSync is only available for stdin (got ${String(fdOrPath)})`);
        },
      };
    }
    throw new Error(`require('${id}') is not available in the visualizer`);
  };

  return {
    prompt,
    input: prompt,
    sys: {
      stdin: {
        readline: () => {
          if (promptIndex >= lines.length) return '';
          return `${prompt()}\n`;
        },
        read: () => raw,
        readlines: () => lines.map((l) => `${l}\n`),
        *[Symbol.iterator]() {
          while (promptIndex < lines.length) {
            yield `${lines[promptIndex++]}\n`;
          }
        },
      },
    },
    process: {
      argv: ['node', 'program.js'],
      stdin: stdinObj,
      stdout: {
        write(chunk: string) {
          onStdout(String(chunk ?? ''));
          return true;
        },
      },
      exit(_code?: number) {
        // Safe exit
      },
      env: {},
      cwd: () => '/',
    },
    require: requireFn,
    flush: () =>
      new Promise<void>((resolve) => {
        scheduleFlush();
        queueMicrotask(() => setTimeout(resolve, 0));
      }),
  };
}
