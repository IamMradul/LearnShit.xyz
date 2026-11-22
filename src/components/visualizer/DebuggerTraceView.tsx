import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Layers,
  Terminal,
  Code2,
  Repeat,
  CornerDownLeft,
} from 'lucide-react';
import type { TraceStep, TraceResult, TraceValue } from '../../engine/TraceTypes';
import { usePlayback } from '../../engine/playback/usePlayback';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { getParsedArgumentsInfo } from '../../engine/ModeDetector';

interface DebuggerTraceViewProps {
  step: TraceStep | null;
  currentIndex: number;
  totalSteps: number;
  steps: TraceStep[];
  code: string;
  language: string;
  result: TraceResult | null;
  onSelectStep: (idx: number) => void;
}

// ─── Syntax Highlighting Tokenizer ──────────────────────────────────────────

function tokenizeCode(text: string): React.ReactNode[] {
  const tokenRegex =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:def|class|return|if|elif|else|for|while|in|import|from|as|and|or|not|is|None|True|False|function|const|let|var|new|null|undefined|try|catch|finally|throw|typeof|instanceof|switch|case|default|break|continue|void|int|long|double|float|bool|char|string|auto|vector|unordered_map|unordered_set|set|map|pair|queue|stack|public|private|protected|static|cin|cout|endl)\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_]\w*|[{}()[\]+\-*/%=<>!&|^~?:,;.]|\s+)/g;

  const keywords = new Set([
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import',
    'from', 'as', 'and', 'or', 'not', 'is', 'None', 'True', 'False', 'function',
    'const', 'let', 'var', 'new', 'null', 'undefined', 'try', 'catch', 'finally',
    'throw', 'typeof', 'instanceof', 'switch', 'case', 'default', 'break', 'continue',
    'void', 'int', 'long', 'double', 'float', 'bool', 'char', 'string', 'auto',
    'vector', 'unordered_map', 'unordered_set', 'set', 'map', 'pair', 'queue', 'stack',
    'public', 'private', 'protected', 'static', 'cin', 'cout', 'endl',
  ]);

  const tokens: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    const part = match[0];
    const key = `tok_${idx++}`;

    if (/^["'`]/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#a5d6ff' }}>{part}</span>);
    } else if (/^\d/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#79c0ff' }}>{part}</span>);
    } else if (keywords.has(part)) {
      tokens.push(
        <span key={key} style={{ color: '#ff7b72', fontWeight: 600 }}>
          {part}
        </span>,
      );
    } else if (/^[A-Z]\w*$/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#ffa657' }}>{part}</span>);
    } else if (/^[a-z_]\w*$/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#e6edf3' }}>{part}</span>);
    } else {
      tokens.push(<span key={key} style={{ color: '#8b949e' }}>{part}</span>);
    }
  }

  return tokens.length > 0 ? tokens : [text];
}

function highlightLine(text: string, lang: string): React.ReactNode {
  if (!text) return '\u00A0';
  const commentIdx = lang === 'python' ? text.indexOf('#') : text.indexOf('//');
  if (commentIdx !== -1) {
    const codePart = text.slice(0, commentIdx);
    const commentPart = text.slice(commentIdx);
    return (
      <>
        {tokenizeCode(codePart)}
        <span style={{ color: '#6e7681', fontStyle: 'italic' }}>{commentPart}</span>
      </>
    );
  }
  return tokenizeCode(text);
}

// ─── Collapsible Variable Value Component ───────────────────────────────────

interface CollapsibleValueProps {
  name?: string;
  val: unknown;
  type?: string;
  depth?: number;
  isMutated?: boolean;
}

const CollapsibleValue: React.FC<CollapsibleValueProps> = ({
  name: _name,
  val,
  type,
  depth = 0,
  isMutated: _isMutated = false,
}) => {
  const [expanded, setExpanded] = useState(depth < 1);

  if (val === null || val === undefined) {
    return (
      <span style={{ color: '#8b949e', fontStyle: 'italic' }}>
        {String(val)}
      </span>
    );
  }

  if (typeof val === 'number') {
    return <span style={{ color: '#79c0ff' }}>{val}</span>;
  }
  if (typeof val === 'boolean') {
    return <span style={{ color: '#ff7b72' }}>{String(val)}</span>;
  }
  if (typeof val === 'string') {
    return <span style={{ color: '#a5d6ff' }}>"{val}"</span>;
  }

  // Handle arrays
  if (Array.isArray(val)) {
    if (val.length === 0) return <span>[]</span>;
    if (val.length <= 4 && depth > 0) {
      return (
        <span>
          [{val.map((item, i) => (
            <React.Fragment key={i}>
              <CollapsibleValue val={item} depth={depth + 1} />
              {i < val.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}]
        </span>
      );
    }

    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ color: '#58a6ff' }}>Array({val.length})</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>
            {expanded ? '▼' : '▶'}
          </span>
        </button>
        {expanded && (
          <div
            style={{
              paddingLeft: 12,
              borderLeft: '1px solid rgba(247, 245, 239, 0.1)',
              marginTop: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {val.slice(0, 30).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>[{i}]:</span>
                <CollapsibleValue val={item} depth={depth + 1} />
              </div>
            ))}
            {val.length > 30 && (
              <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                ... +{val.length - 30} more items
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle objects / maps / trees / linked lists
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;

    // Linked List Node
    if (obj.__type === 'linkedList' || ('val' in obj && 'next' in obj)) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#58a6ff' }}>Node({String(obj.val)})</span>
          {obj.next ? (
            <>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <CollapsibleValue val={obj.next} depth={depth + 1} />
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>→ null</span>
          )}
        </span>
      );
    }

    // Binary Tree Node
    if (obj.__type === 'binaryTree' || ('val' in obj && ('left' in obj || 'right' in obj))) {
      return (
        <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              cursor: 'pointer',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ color: '#ffa657' }}>TreeNode({String(obj.val)})</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>
              {expanded ? '▼' : '▶'}
            </span>
          </button>
          {expanded && (
            <div
              style={{
                paddingLeft: 12,
                borderLeft: '1px solid rgba(247, 245, 239, 0.1)',
                marginTop: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>L: </span>
                <CollapsibleValue val={obj.left} depth={depth + 1} />
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>R: </span>
                <CollapsibleValue val={obj.right} depth={depth + 1} />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Hash Map / Plain Object
    const entries = Object.entries(obj).filter(([k]) => !k.startsWith('__'));
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ color: '#58a6ff' }}>{type || 'Object'} ({entries.length})</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>
            {expanded ? '▼' : '▶'}
          </span>
        </button>
        {expanded && (
          <div
            style={{
              paddingLeft: 12,
              borderLeft: '1px solid rgba(247, 245, 239, 0.1)',
              marginTop: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {entries.slice(0, 20).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{k}:</span>
                <CollapsibleValue val={v} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span>{String(val)}</span>;
};

// ─── Main Debugger Trace View Component ─────────────────────────────────────

export const DebuggerTraceView: React.FC<DebuggerTraceViewProps> = ({
  step,
  currentIndex,
  totalSteps,
  steps,
  code,
  language,
  result,
  onSelectStep,
}) => {
  const {
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    stepOver,
    stepOut,
    skipToNextIteration,
    runToEndOfLoop,
    jumpToNextLineExecution,
    setSpeed,
  } = usePlayback();
  const { speed } = useTraceStore();

  const [deepStackExpanded, setDeepStackExpanded] = useState(false);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  const { input } = useEditorStore();
  const parsedInfo = useMemo(
    () => getParsedArgumentsInfo(code, input, language as any),
    [code, input, language],
  );

  const lines = useMemo(() => (code ? code.split('\n') : []), [code]);
  const activeLineNum = step?.line ?? 1;

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && codeContainerRef.current) {
      const container = codeContainerRef.current;
      const target = activeLineRef.current;
      const targetOffset = target.offsetTop - container.offsetTop;
      const desiredScroll = targetOffset - container.clientHeight / 2 + target.clientHeight / 2;
      container.scrollTo({
        top: Math.max(0, desiredScroll),
        behavior: 'smooth',
      });
    }
  }, [activeLineNum]);

  // Variables in current scope
  const variables = step?.variables || {};
  const varEntries = Object.entries(variables);

  // Call stack
  const callStack = step?.callStack || [];

  // Line execution counts up to current step
  const lineExecCounts = step?.lineExecutionCounts || {};

  // Active loop info
  const loopInfo = step?.loop;

  const isEnd = totalSteps === 0 || currentIndex >= totalSteps - 1;

  // Incremental stdout
  const currentStdout = step?.stdoutSoFar ?? step?.stdout ?? '';

  // Return value
  const returnValue = step?.returnValue;
  const returnFrom = step?.returnFrom;

  // Windowed step list for bottom scrubber (shows up to 30 steps centered around currentIndex)
  const windowedSteps = useMemo(() => {
    if (totalSteps <= 30) {
      return steps.map((s, idx) => ({ step: s, idx }));
    }
    const start = Math.max(0, Math.min(currentIndex - 14, totalSteps - 30));
    const end = Math.min(totalSteps, start + 30);
    const window: Array<{ step: TraceStep; idx: number }> = [];
    for (let i = start; i < end; i++) {
      window.push({ step: steps[i], idx: i });
    }
    return window;
  }, [steps, currentIndex, totalSteps]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        maxWidth: 1100,
        height: '100%',
        maxHeight: 'calc(100vh - 200px)',
        minHeight: 460,
        background: 'rgba(12, 14, 18, 0.94)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        padding: '16px 20px',
        border: '1px solid rgba(247, 245, 239, 0.12)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
        overflowY: 'auto',
      }}
    >
      {/* ── Top Bar: Title, Step Counter, Line Badge & Loop Indicator ────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
          paddingBottom: 10,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(88, 166, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#58a6ff',
            }}
          >
            <Activity size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 15,
                color: '#F7F5EF',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Trace View • Step Debugger</span>
              {result?.truncated && (
                <span
                  style={{
                    fontSize: 10,
                    background: 'rgba(255, 165, 2, 0.18)',
                    color: '#ffa502',
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Truncated at {totalSteps} steps ({result.truncatedReason || 'max-steps'})
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Synchronized line pointer, execution counters, call stack & variable inspector
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Loop iteration badge if inside a loop */}
          {loopInfo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255, 165, 2, 0.15)',
                border: '1px solid rgba(255, 165, 2, 0.35)',
                padding: '3px 10px',
                borderRadius: 6,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: '#ffa502',
                fontWeight: 600,
              }}
            >
              <Repeat size={12} />
              <span>
                {loopInfo.type} loop • Iteration {loopInfo.iteration}
                {loopInfo.isHeader ? ' (checking condition)' : ''}
              </span>
              <button
                onClick={skipToNextIteration}
                title="Skip to next iteration"
                style={{
                  background: 'rgba(255, 165, 2, 0.25)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '1px 6px',
                  color: '#fff',
                  fontSize: 10,
                  cursor: 'pointer',
                  marginLeft: 4,
                }}
              >
                Next Iter ⏭
              </button>
              <button
                onClick={runToEndOfLoop}
                title="Run to end of loop"
                style={{
                  background: 'rgba(255, 165, 2, 0.25)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '1px 6px',
                  color: '#fff',
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                End Loop ⏩
              </button>
            </div>
          )}

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--accent)',
              background: 'rgba(214, 82, 58, 0.15)',
              padding: '3px 8px',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            Step {currentIndex + 1} of {totalSteps}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: '#58a6ff',
              background: 'rgba(88, 166, 255, 0.15)',
              padding: '3px 8px',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            Line {activeLineNum}
          </div>
        </div>
      </div>

      {/* ── Stepping Toolbar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(247, 245, 239, 0.03)',
          border: '1px solid rgba(247, 245, 239, 0.08)',
          borderRadius: 8,
          padding: '6px 12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={jumpToStart}
          disabled={currentIndex === 0}
          title="Restart from beginning"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentIndex === 0 ? 'var(--text-muted)' : '#F7F5EF',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            padding: '4px 6px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>

        <button
          onClick={stepBackward}
          disabled={currentIndex === 0}
          title="Step back"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentIndex === 0 ? 'var(--text-muted)' : '#F7F5EF',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            padding: '4px 6px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <ChevronLeft size={15} />
          <span>Back</span>
        </button>

        <button
          onClick={togglePlay}
          title="Play / Pause (Space)"
          style={{
            background: 'var(--accent)',
            border: 'none',
            color: '#F7F5EF',
            cursor: 'pointer',
            padding: '4px 10px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
          }}
        >
          <Play size={13} />
          <span>Play</span>
        </button>

        <button
          onClick={stepForward}
          disabled={currentIndex >= totalSteps - 1}
          title="Step into (advance one execution step)"
          style={{
            background: 'rgba(88, 166, 255, 0.15)',
            border: '1px solid rgba(88, 166, 255, 0.3)',
            color: '#58a6ff',
            cursor: currentIndex >= totalSteps - 1 ? 'not-allowed' : 'pointer',
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
          }}
        >
          <span>Step Into</span>
          <ChevronRight size={15} />
        </button>

        <button
          onClick={stepOver}
          disabled={currentIndex >= totalSteps - 1}
          title="Step over (step without diving deeper into callee)"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            color: '#F7F5EF',
            cursor: currentIndex >= totalSteps - 1 ? 'not-allowed' : 'pointer',
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <ArrowDownRight size={14} style={{ color: '#ffa502' }} />
          <span>Step Over</span>
        </button>

        <button
          onClick={stepOut}
          disabled={currentIndex >= totalSteps - 1 || (step?.callStack?.length ?? 1) <= 1}
          title="Step out (run until current function returns)"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            color: '#F7F5EF',
            cursor:
              currentIndex >= totalSteps - 1 || (step?.callStack?.length ?? 1) <= 1
                ? 'not-allowed'
                : 'pointer',
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <ArrowUpRight size={14} style={{ color: '#2ed573' }} />
          <span>Step Out</span>
        </button>

        <button
          onClick={jumpToEnd}
          disabled={currentIndex >= totalSteps - 1}
          title="Run to end"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentIndex >= totalSteps - 1 ? 'var(--text-muted)' : '#F7F5EF',
            cursor: currentIndex >= totalSteps - 1 ? 'not-allowed' : 'pointer',
            padding: '4px 6px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <ChevronsRight size={15} />
          <span>End</span>
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Speed:</span>
          {[
            { label: '0.25×', ms: 2400 },
            { label: '0.5×', ms: 1600 },
            { label: '1×', ms: 1000 },
            { label: '2×', ms: 500 },
            { label: '4×', ms: 200 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setSpeed(sp.ms)}
              style={{
                background: speed === sp.ms ? 'rgba(214, 82, 58, 0.22)' : 'rgba(247, 245, 239, 0.06)',
                border: speed === sp.ms ? '1px solid var(--accent)' : '1px solid rgba(247, 245, 239, 0.1)',
                borderRadius: 4,
                padding: '2px 6px',
                color: speed === sp.ms ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 10,
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: speed === sp.ms ? 700 : 400,
              }}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Arguments Banner ── */}
      {parsedInfo.mismatchError ? (
        <div
          style={{
            padding: '6px 12px',
            background: 'rgba(214, 82, 58, 0.15)',
            border: '1px solid rgba(214, 82, 58, 0.35)',
            borderRadius: 6,
            color: '#ff7b72',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>⚠️</span>
          <span>{parsedInfo.mismatchError}</span>
        </div>
      ) : parsedInfo.args.length > 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            padding: '6px 12px',
            background: 'rgba(247, 245, 239, 0.03)',
            border: '1px solid rgba(247, 245, 239, 0.08)',
            borderRadius: 6,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Input Arguments:
          </span>
          {parsedInfo.args.map((a, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                padding: '2px 8px',
                borderRadius: 4,
                color: '#F7F5EF',
              }}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{a.name}</span>
              <span style={{ color: '#58a6ff' }}> ({a.type})</span>
              <span style={{ color: '#8b949e' }}> = </span>
              <span style={{ color: '#7ee787' }}>{a.formatted}</span>
            </span>
          ))}
        </div>
      ) : null}

      {/* ── Main Two-Column Layout ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: 14,
          minHeight: 0,
          flex: 1,
        }}
      >
        {/* Left Column: Source Code + Incremental Output + Return Value */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          {/* Source Code Panel */}
          <div
            ref={codeContainerRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(247, 245, 239, 0.06)',
              borderRadius: 10,
              padding: '10px 12px',
              minHeight: 180,
              maxHeight: 260,
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#F7F5EF',
                fontFamily: "'Oswald', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 size={13} style={{ color: 'var(--accent)' }} />
                <span>Source Code (Click line to jump to next run)</span>
              </div>
              <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                Pointer: ▶ • Gutter: ×Count
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
              }}
            >
              {lines.map((ln, idx) => {
                const lineNum = idx + 1;
                const isCurrent = lineNum === activeLineNum;
                const execCount = lineExecCounts[lineNum] || 0;
                const isLoopHeader = loopInfo && loopInfo.headerLine === lineNum;

                return (
                  <div
                    key={idx}
                    ref={isCurrent ? activeLineRef : undefined}
                    onClick={() => jumpToNextLineExecution(lineNum)}
                    title={`Line ${lineNum}: executed ${execCount} time${execCount === 1 ? '' : 's'}. Click to jump to next execution.`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: isCurrent ? 'rgba(214, 82, 58, 0.22)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid var(--accent)' : '3px solid transparent',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: isCurrent ? '#F7F5EF' : 'var(--text-secondary)',
                      fontWeight: isCurrent ? 600 : 400,
                      cursor: 'pointer',
                      whiteSpace: 'pre',
                      position: 'relative',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    {/* Line Pointer Indicator */}
                    <span
                      style={{
                        width: 14,
                        flexShrink: 0,
                        color: 'var(--accent)',
                        fontWeight: 900,
                        fontSize: 10,
                      }}
                    >
                      {isCurrent ? '▶' : ''}
                    </span>

                    {/* Line Number */}
                    <span
                      style={{
                        width: 28,
                        flexShrink: 0,
                        color: isCurrent ? 'var(--accent)' : 'var(--text-muted)',
                        userSelect: 'none',
                        fontSize: 10,
                      }}
                    >
                      {lineNum}
                    </span>

                    {/* Execution count in gutter */}
                    <span
                      style={{
                        width: 32,
                        flexShrink: 0,
                        fontSize: 9.5,
                        color: execCount > 0 ? (isCurrent ? 'var(--accent)' : '#ffa502') : 'transparent',
                        fontWeight: 700,
                        userSelect: 'none',
                      }}
                    >
                      {execCount > 0 ? `×${execCount}` : ''}
                    </span>

                    {/* Code text with syntax tokens */}
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {highlightLine(ln, language)}
                    </span>

                    {/* Loop Iteration Header Tag */}
                    {isLoopHeader && (
                      <span
                        style={{
                          fontSize: 9,
                          background: 'rgba(255, 165, 2, 0.2)',
                          color: '#ffa502',
                          padding: '1px 5px',
                          borderRadius: 3,
                          fontWeight: 700,
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                      >
                        iter {loopInfo.iteration}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Program Output (Shown after end of visualization or when ended) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(247, 245, 239, 0.06)',
              borderRadius: 10,
              padding: '8px 12px',
              minHeight: 70,
              maxHeight: 110,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10.5,
                color: '#F7F5EF',
                fontFamily: "'Oswald', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Terminal size={12} style={{ color: isEnd ? '#2ed573' : '#ffa502' }} />
              <span>{isEnd ? 'Program Output (Execution Complete)' : 'Program Output'}</span>
            </div>
            {!isEnd && totalSteps > 0 ? (
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Output will be displayed after visualization ends (Step {currentIndex + 1} of {totalSteps}).
              </span>
            ) : (result?.stdout || currentStdout) ? (
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#2ed573',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.4,
                }}
              >
                {result?.stdout || currentStdout}
              </pre>
            ) : (
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No stdout output produced by program.
              </span>
            )}
          </div>

          {/* Return Value Panel (Kept strictly separate from stdout) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(247, 245, 239, 0.06)',
              borderRadius: 10,
              padding: '8px 12px',
              minHeight: 50,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10.5,
                color: '#F7F5EF',
                fontFamily: "'Oswald', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <CornerDownLeft size={12} style={{ color: '#ffa502' }} />
              <span>Return Value Inspector</span>
            </div>
            {returnValue !== undefined ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                }}
              >
                {returnFrom && (
                  <span style={{ color: '#ffa502', fontWeight: 600 }}>
                    {returnFrom}():
                  </span>
                )}
                <span
                  style={{
                    background: 'rgba(46, 213, 115, 0.15)',
                    border: '1px solid rgba(46, 213, 115, 0.4)',
                    color: '#2ed573',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 700,
                  }}
                >
                  {typeof returnValue === 'object' && returnValue !== null
                    ? JSON.stringify(returnValue)
                    : String(returnValue)}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No return value recorded yet.
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Variables Inspector + Call Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
          {/* Variables Inspector */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(247, 245, 239, 0.06)',
              borderRadius: 10,
              padding: '10px 12px',
              minHeight: 140,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#F7F5EF',
                fontFamily: "'Oswald', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Terminal size={13} style={{ color: '#58a6ff' }} />
                <span>Scope Variables ({varEntries.length})</span>
              </div>
              <span style={{ fontSize: 9.5, color: '#2ed573' }}>● green = mutated</span>
            </div>

            {varEntries.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                No local variables in scope at this step
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {varEntries.map(([name, v]) => {
                  const isMutated = step?.mutations?.some((m) => m.varName === name);
                  return (
                    <div
                      key={name}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: isMutated ? 'rgba(46, 213, 115, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        border: isMutated ? '1px solid rgba(46, 213, 115, 0.4)' : '1px solid rgba(247, 245, 239, 0.04)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        gap: 8,
                      }}
                    >
                      <span style={{ color: isMutated ? '#2ed573' : 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>
                        {name}
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>
                          ({v.type})
                        </span>
                      </span>

                      <div style={{ color: '#F7F5EF', textAlign: 'right', minWidth: 0 }}>
                        <CollapsibleValue
                          name={name}
                          val={v.value !== undefined ? v.value : v.repr}
                          type={v.type}
                          isMutated={isMutated}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call Stack Panel with Virtualization/Collapsing for Deep Stacks */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(247, 245, 239, 0.06)',
              borderRadius: 10,
              padding: '10px 12px',
              minHeight: 120,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#F7F5EF',
                fontFamily: "'Oswald', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={13} style={{ color: 'var(--accent)' }} />
                <span>Call Stack ({callStack.length} frame{callStack.length === 1 ? '' : 's'})</span>
              </div>
              {callStack.length > 12 && (
                <button
                  onClick={() => setDeepStackExpanded(!deepStackExpanded)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(247, 245, 239, 0.1)',
                    borderRadius: 4,
                    padding: '1px 6px',
                    color: 'var(--text-secondary)',
                    fontSize: 9.5,
                    cursor: 'pointer',
                  }}
                >
                  {deepStackExpanded ? 'Collapse' : 'Expand all'}
                </button>
              )}
            </div>

            {callStack.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                Global context
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(() => {
                  const framesToRender =
                    callStack.length <= 12 || deepStackExpanded
                      ? callStack.map((f, i) => ({ frame: f, index: i }))
                      : [
                          ...callStack.slice(0, 4).map((f, i) => ({ frame: f, index: i })),
                          { isCollapsedNotice: true, hiddenCount: callStack.length - 8 },
                          ...callStack.slice(-4).map((f, i) => ({ frame: f, index: callStack.length - 4 + i })),
                        ];

                  return framesToRender.map((item, idx) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((item as any).isCollapsedNotice) {
                      return (
                        <div
                          key="collapsed"
                          onClick={() => setDeepStackExpanded(true)}
                          style={{
                            textAlign: 'center',
                            fontSize: 10,
                            color: '#ffa502',
                            background: 'rgba(255, 165, 2, 0.08)',
                            padding: '4px 8px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          ... {(item as any).hiddenCount} recursive calls collapsed (click to expand) ...
                        </div>
                      );
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const frame = (item as any).frame;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const isTop = (item as any).index === callStack.length - 1;
                    const argsStr = frame.args
                      ? Object.entries(frame.args)
                          .map(([k, tv]) => `${k}=${(tv as TraceValue).repr || JSON.stringify((tv as TraceValue).value)}`)
                          .join(', ')
                      : '';

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: isTop ? 'rgba(214, 82, 58, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: isTop ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ color: isTop ? 'var(--accent)' : '#F7F5EF', fontWeight: 600 }}>
                            {frame.name || 'anonymous'}({argsStr})
                          </span>
                          {frame.returnValue && (
                            <span style={{ color: '#2ed573', fontSize: 9.5 }}>
                              ↳ returns {frame.returnValue.repr}
                            </span>
                          )}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 10, flexShrink: 0, marginLeft: 6 }}>
                          d:{frame.depth ?? idx + 1} • L{frame.line}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Scrubber Timeline ─────────────────────────────────────────── */}
      {totalSteps > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            borderTop: '1px solid rgba(247, 245, 239, 0.08)',
            paddingTop: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10,
              color: 'var(--text-muted)',
              fontFamily: "'Oswald', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <span>Timeline Scrubber (jump to any step)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {currentIndex + 1} / {totalSteps}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
            {currentIndex > 15 && totalSteps > 30 && (
              <button
                onClick={jumpToStart}
                style={{
                  flexShrink: 0,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(247, 245, 239, 0.08)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  color: 'var(--text-secondary)',
                  fontSize: 9.5,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                « #1
              </button>
            )}

            {windowedSteps.map(({ step: s, idx }) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectStep(idx)}
                  title={`Step ${idx + 1}: Line ${s.line} (${s.event})`}
                  style={{
                    flexShrink: 0,
                    background: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid rgba(247, 245, 239, 0.08)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    color: isSelected ? '#F7F5EF' : 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9.5,
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  #{idx + 1} L{s.line}
                </button>
              );
            })}

            {totalSteps > 30 && currentIndex < totalSteps - 15 && (
              <button
                onClick={jumpToEnd}
                style={{
                  flexShrink: 0,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(247, 245, 239, 0.08)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  color: 'var(--text-secondary)',
                  fontSize: 9.5,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                #{totalSteps} »
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
