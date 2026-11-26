import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Activity,
  Layout,
  Sparkles,
  Check,
} from 'lucide-react';
import { useTraceStore } from '../../store/traceStore';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { identifyPlatform } from '../../engine/PlatformDetector';
import { inferDefaultInput } from '../../engine/ModeDetector';
import { detectLanguage } from '../../engine/LanguageDetector';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';

const LINE_HEIGHT = 24; // px per code line

// Simple fast syntax highlighting tokenizer for user code display
function highlightCodeLine(text: string, lang: string, isLight: boolean): React.ReactNode {
  if (!text) return '\u00A0';

  const commentIdx = lang === 'python' ? text.indexOf('#') : text.indexOf('//');

  if (commentIdx !== -1) {
    const codePart = text.slice(0, commentIdx);
    const commentPart = text.slice(commentIdx);
    return (
      <>
        {tokenizeCode(codePart, lang, isLight)}
        <span style={{ color: isLight ? '#6b7280' : '#6e7681', fontStyle: 'italic' }}>
          {commentPart}
        </span>
      </>
    );
  }

  return tokenizeCode(text, lang, isLight);
}

function tokenizeCode(text: string, _lang: string, isLight: boolean): React.ReactNode[] {
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
      tokens.push(<span key={key} style={{ color: isLight ? '#0a3069' : '#a5d6ff' }}>{part}</span>);
    } else if (/^\d/.test(part)) {
      tokens.push(<span key={key} style={{ color: isLight ? '#0550ae' : '#79c0ff' }}>{part}</span>);
    } else if (keywords.has(part)) {
      tokens.push(
        <span key={key} style={{ color: isLight ? '#cf222e' : '#ff7b72', fontWeight: 600 }}>
          {part}
        </span>,
      );
    } else if (/^[A-Z]\w*$/.test(part)) {
      tokens.push(<span key={key} style={{ color: isLight ? '#953800' : '#ffa657' }}>{part}</span>);
    } else if (/^[a-z_]\w*$/.test(part)) {
      tokens.push(<span key={key} style={{ color: isLight ? '#1f2328' : '#e6edf3' }}>{part}</span>);
    } else {
      tokens.push(<span key={key} style={{ color: isLight ? '#57606a' : '#8b949e' }}>{part}</span>);
    }
  }

  return tokens.length > 0 ? tokens : [text];
}

interface AnimatedCodeVisualizerProps {
  layoutMode?: 'center' | 'split' | 'docked' | 'overlay';
  onToggleLayout?: () => void;
  onRunTrace?: (customInput?: string) => Promise<void> | void;
}

export const AnimatedCodeVisualizer: React.FC<AnimatedCodeVisualizerProps> = ({
  layoutMode = 'center',
  onToggleLayout,
  onRunTrace,
}) => {
  const isLight = useUIStore((s) => s.theme === 'light');
  const {
    code,
    input,
    setInput,
    stdin,
    language,
    setLanguage,
    modeOverride,
  } = useEditorStore();
  const {
    steps,
    currentIndex,
    result,
    status,
    setResult,
    setStatus,
    setRunning,
    setError,
    isRunning,
    setPyodideLoading,
  } = useTraceStore();

  const isEnd = steps.length > 0 && (currentIndex >= steps.length - 1 || status === 'done');

  const finalReturnValue = useMemo(() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].returnValue !== undefined) {
        const val = steps[i].returnValue;
        return typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
      }
    }
    return undefined;
  }, [steps]);

  const [isExpanded, setIsExpanded] = useState(true);
  const [showLiveBadges, setShowLiveBadges] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Split strictly the user-entered code
  const lines = useMemo(() => (code ? code.split('\n') : []), [code]);
  const userLineCount = lines.length;

  const currentStep = steps[currentIndex] ?? null;

  // Identified platform metadata
  const platformInfo = useMemo(() => identifyPlatform(code, language), [code, language]);

  // Trace execution runner
  const executeTrace = useCallback(
    async (customInput?: string) => {
      const inputToUse = customInput !== undefined ? customInput : input;
      if (!code.trim() || isRunning) return;

      if (customInput !== undefined && customInput !== input) {
        setInput(customInput);
      }

      if (onRunTrace) {
        await onRunTrace(inputToUse);
        return;
      }

      let effectiveLang = language;
      const langDetect = detectLanguage(code);
      if (langDetect.confidence >= 0.4 && langDetect.language !== language) {
        effectiveLang = langDetect.language;
        setLanguage(effectiveLang);
      }

      setRunning(true);
      setError(null);

      try {
        const adapter = getAdapter(effectiveLang);
        const res = await adapter.trace({
          code,
          input: inputToUse,
          stdin,
          mode: modeOverride,
          maxSteps: 5000,
          timeoutMs: 10000,
          language: effectiveLang,
        });

        setResult(res);
        useTraceStore.getState().setTraceSource('user');
        if (res.steps.length > 0) {
          setStatus('playing');
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setRunning(false);
        setPyodideLoading(false);
      }
    },
    [code, input, stdin, isRunning, language, modeOverride, onRunTrace, setError, setLanguage, setPyodideLoading, setResult, setRunning, setStatus, setInput],
  );

  // Auto-populate input and execute if code exists but has no input or no steps
  useEffect(() => {
    if (code.trim().length > 10 && steps.length === 0 && !isRunning) {
      const fallbackInput =
        input.trim() || platformInfo.defaultInput || inferDefaultInput(code) || '[[2, 7, 11, 15], 9]';
      if (!input.trim() || input !== fallbackInput) {
        setInput(fallbackInput);
      }
      executeTrace(fallbackInput);
    }
  }, [code, steps.length]);

  // Determine active line strictly within 1..userLineCount
  const activeLine = useMemo(() => {
    if (!currentStep) return -1;
    const l = currentStep.line;
    if (typeof l === 'number' && l >= 1 && l <= userLineCount) {
      return l;
    }
    return -1;
  }, [currentStep, userLineCount]);

  // Compute execution frequency per line up to currentIndex
  const lineExecCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 0; i <= currentIndex && i < steps.length; i++) {
      const stepLine = steps[i].line;
      if (typeof stepLine === 'number' && stepLine >= 1 && stepLine <= userLineCount) {
        counts[stepLine] = (counts[stepLine] || 0) + 1;
      }
    }
    return counts;
  }, [steps, currentIndex, userLineCount]);

  // Smooth auto-scroll to the currently executing user line
  useEffect(() => {
    if (activeLine >= 1 && containerRef.current) {
      const container = containerRef.current;
      const targetTop = (activeLine - 1) * LINE_HEIGHT;
      const containerHeight = container.clientHeight;
      const desiredScroll = targetTop - containerHeight / 2 + LINE_HEIGHT / 2;
      container.scrollTo({
        top: Math.max(0, desiredScroll),
        behavior: 'smooth',
      });
    }
  }, [activeLine]);

  // Extract variables relevant to the active line
  const activeLineVariables = useMemo(() => {
    if (!currentStep || activeLine < 1 || activeLine > lines.length) return [];
    const lineText = lines[activeLine - 1] || '';
    const vars = currentStep.variables || {};
    const relevant: Array<{ name: string; val: string }> = [];

    for (const [k, v] of Object.entries(vars)) {
      const regex = new RegExp(`\\b${k}\\b`);
      if (regex.test(lineText) && k !== 'self' && !k.startsWith('__')) {
        const repr =
          v.repr ||
          (typeof v.value === 'object' && v.value !== null
            ? JSON.stringify(v.value)
            : String(v.value));
        relevant.push({ name: k, val: repr });
      }
    }
    return relevant.slice(0, 4);
  }, [currentStep, activeLine, lines]);

  // Mutation description for active line
  const activeMutation = useMemo(() => {
    if (!currentStep || !currentStep.mutations?.length) return null;
    const m = currentStep.mutations[0];
    if (m.description) return m.description;
    if (m.op === 'swap' && m.highlightIndices?.length === 2) {
      return `swap(${m.varName}[${m.highlightIndices[0]}], ${m.varName}[${m.highlightIndices[1]}])`;
    }
    if (m.op === 'compare') {
      return `compare indices [${m.highlightIndices?.join(', ')}]`;
    }
    return `${m.op.toUpperCase()} on ${m.varName}`;
  }, [currentStep]);

  if (lines.length === 0) return null;

  const badgeColor = platformInfo.badgeColor || '#D6523A';
  const isCenterMode = layoutMode === 'center';
  const isSplitMode = layoutMode === 'split';

  return (
    <div
      style={{
        width: isCenterMode
          ? '100%'
          : isSplitMode
            ? '100%'
            : layoutMode === 'docked'
              ? 380
              : 360,
        maxWidth: isCenterMode ? 960 : isSplitMode ? '100%' : undefined,
        height: isCenterMode || isSplitMode || layoutMode === 'docked' ? '100%' : 'auto',
        maxHeight: isCenterMode
          ? 'calc(100vh - 240px)'
          : isSplitMode
            ? 'calc(100vh - 240px)'
            : layoutMode === 'docked'
              ? '100%'
              : 'calc(100vh - 160px)',
        minHeight: isCenterMode ? 460 : 340,
        background: 'var(--surface-glass-strong)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: layoutMode === 'docked' ? 0 : 16,
        boxShadow: isCenterMode
          ? '0 14px 36px rgba(0, 0, 0, 0.2), 0 0 1px var(--border)'
          : '0 10px 28px rgba(0, 0, 0, 0.16)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 35,
        margin: isCenterMode ? '0 auto' : undefined,
      }}
    >
      {/* ── Top Header: Platform Badge, Problem Name & Live Progress ──────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isCenterMode ? '12px 18px' : '9px 14px',
          background: 'var(--border-subtle)',
          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            style={{
              padding: '3px 9px',
              borderRadius: 8,
              background: `${badgeColor}22`,
              border: `1px solid ${badgeColor}55`,
              color: badgeColor,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: isCenterMode ? 11 : 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
            }}
          >
            <span>{platformInfo.badgeIcon}</span>
            <span>{platformInfo.platformName}</span>
          </div>

          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: isCenterMode ? 14 : 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={platformInfo.problemName || 'Code Execution'}
          >
            {platformInfo.problemName || 'Line-by-Line Execution'}
          </div>

          <div
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>•</span>
            <span style={{ color: activeLine !== -1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {activeLine !== -1 ? `Executing Line ${activeLine}` : 'Idle'}
            </span>
            <span>•</span>
            <span style={{ color: badgeColor, fontWeight: 600 }}>
              Step {steps.length > 0 ? currentIndex + 1 : 0} of {steps.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowLiveBadges(!showLiveBadges)}
            style={{
              background: showLiveBadges ? `${badgeColor}20` : 'transparent',
              border: showLiveBadges ? `1px solid ${badgeColor}40` : '1px solid var(--border)',
              color: showLiveBadges ? badgeColor : 'var(--text-muted)',
              fontSize: 10.5,
              padding: '3px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.15s ease',
            }}
            title="Toggle inline variable values beside executing code line"
          >
            {showLiveBadges ? 'Live Values ON' : 'Live Values OFF'}
          </button>

          {onToggleLayout && (
            <button
              onClick={onToggleLayout}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Toggle Layout View"
            >
              <Layout size={13} />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px 5px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* ── Mutation / Comparison Pill Banner ────────────────────────────── */}
          {activeMutation && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 18px',
                background: 'rgba(214, 82, 58, 0.12)',
                borderBottom: '1px solid rgba(214, 82, 58, 0.25)',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: isLight ? '#b91c1c' : '#ff7b72',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Activity size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeMutation}
              </span>
            </div>
          )}

          {/* ── Main Code Execution Viewer with Sliding Laser Indicator ──────── */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'auto',
              flex: 1,
              background: 'var(--bg-secondary)',
              padding: '8px 0',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: isCenterMode ? 12.5 : 11.5,
              lineHeight: `${LINE_HEIGHT}px`,
            }}
          >
            {/* Smooth Animated Sliding Execution Laser Indicator */}
            {activeLine >= 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: (activeLine - 1) * LINE_HEIGHT + 8,
                  height: LINE_HEIGHT,
                  background: `linear-gradient(90deg, ${badgeColor}30 0%, ${badgeColor}0A 75%, transparent 100%)`,
                  borderLeft: `4px solid ${badgeColor}`,
                  boxShadow: `0 0 16px ${badgeColor}66`,
                  transition: 'top 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            )}

            {lines.map((lineText, idx) => {
              const lineNo = idx + 1;
              const isActive = lineNo === activeLine;
              const execCount = lineExecCounts[lineNo] || 0;

              return (
                <div
                  key={lineNo}
                  ref={isActive ? activeLineRef : undefined}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: LINE_HEIGHT,
                    paddingRight: 16,
                    zIndex: isActive ? 3 : 1,
                    background: isActive
                      ? isLight
                        ? 'rgba(0, 0, 0, 0.03)'
                        : 'rgba(255, 255, 255, 0.03)'
                      : 'transparent',
                  }}
                >
                  {/* Line Number & Execution Heat Indicator */}
                  <div
                    style={{
                      width: isCenterMode ? 58 : 50,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      paddingRight: 12,
                      userSelect: 'none',
                      color: isActive ? badgeColor : isLight ? '#64748b' : '#6e7681',
                      fontWeight: isActive ? 700 : 400,
                      fontSize: 10.5,
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          fontSize: 10,
                          color: badgeColor,
                          animation: 'pulse 1s infinite ease-in-out',
                        }}
                      >
                        ▶
                      </span>
                    )}

                    <span>{lineNo}</span>

                    {/* Heat counter if executed multiple times */}
                    {execCount > 1 && (
                      <span
                        style={{
                          fontSize: 9,
                          padding: '1px 4px',
                          borderRadius: 3,
                          background:
                            execCount > 10
                              ? 'rgba(214, 82, 58, 0.22)'
                              : 'rgba(88, 166, 255, 0.18)',
                          color:
                            execCount > 10
                              ? isLight
                                ? '#b91c1c'
                                : '#ff7b72'
                              : isLight
                                ? '#0550ae'
                                : '#79c0ff',
                          lineHeight: 1,
                          fontWeight: 600,
                        }}
                        title={`Executed ${execCount} times`}
                      >
                        ×{execCount}
                      </span>
                    )}
                  </div>

                  {/* Code Line Text with Syntax Highlighting */}
                  <div
                    style={{
                      flex: 1,
                      whiteSpace: 'pre',
                      color: isActive
                        ? isLight
                          ? '#0f172a'
                          : '#FFFFFF'
                        : isLight
                          ? '#1f2328'
                          : '#c9d1d9',
                      fontWeight: isActive ? 600 : 400,
                      textShadow: isActive && !isLight ? `0 0 14px ${badgeColor}66` : 'none',
                    }}
                  >
                    {highlightCodeLine(lineText, language, isLight)}
                  </div>

                  {/* Inline Live Variable Badges on the Executing Line */}
                  {isActive && showLiveBadges && activeLineVariables.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginLeft: 12,
                        flexShrink: 0,
                        animation: 'fadeIn 0.2s ease',
                      }}
                    >
                      {activeLineVariables.map((v) => (
                        <span
                          key={v.name}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 5,
                            background: isLight
                              ? 'rgba(21, 128, 61, 0.12)'
                              : 'rgba(46, 213, 115, 0.20)',
                            border: isLight
                              ? '1px solid rgba(21, 128, 61, 0.35)'
                              : '1px solid rgba(46, 213, 115, 0.45)',
                            color: isLight ? '#15803d' : '#2ed573',
                            fontSize: 10.5,
                            lineHeight: 1.3,
                            boxShadow: isLight
                              ? '0 1px 4px rgba(0,0,0,0.08)'
                              : '0 2px 8px rgba(0,0,0,0.4)',
                          }}
                        >
                          <strong style={{ opacity: 0.9 }}>{v.name}:</strong>
                          <span
                            style={{
                              color: 'var(--text-primary)',
                              maxWidth: 120,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {v.val}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── End of Visualization Output Banner ────────────────────────────── */}
          {isEnd && (
            <div
              style={{
                padding: isCenterMode ? '12px 18px' : '10px 14px',
                background: 'var(--green-subtle)',
                borderTop: isLight
                  ? '1px solid rgba(21, 128, 61, 0.3)'
                  : '1px solid rgba(46, 213, 115, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                animation: 'fadeIn 0.25s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} style={{ color: isLight ? '#15803d' : '#2ed573' }} />
                  <span
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 11.5,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: isLight ? '#15803d' : '#2ed573',
                      fontWeight: 700,
                    }}
                  >
                    Visualization Completed — Output
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Finished in {steps.length} steps
                </span>
              </div>

              {result?.stdout ? (
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11.5,
                    color: isLight ? '#15803d' : '#2ed573',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 90,
                    overflowY: 'auto',
                    lineHeight: 1.5,
                    background: 'var(--bg-primary)',
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: isLight
                      ? '1px solid rgba(21, 128, 61, 0.2)'
                      : '1px solid rgba(46, 213, 115, 0.15)',
                  }}
                >
                  {result.stdout}
                </pre>
              ) : finalReturnValue === undefined ? (
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontStyle: 'italic',
                  }}
                >
                  Execution completed with no stdout output.
                </span>
              ) : null}

              {finalReturnValue !== undefined && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 2,
                  }}
                >
                  <span style={{ color: isLight ? '#b45309' : '#ffa502', fontWeight: 600 }}>
                    Return Value:
                  </span>
                  <span
                    style={{
                      background: isLight
                        ? 'rgba(21, 128, 61, 0.12)'
                        : 'rgba(46, 213, 115, 0.15)',
                      border: isLight
                        ? '1px solid rgba(21, 128, 61, 0.35)'
                        : '1px solid rgba(46, 213, 115, 0.4)',
                      color: isLight ? '#15803d' : '#2ed573',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {finalReturnValue}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Footer: Algorithm Signature, User Lines & Guidance ────────────── */}
          <div
            style={{
              padding: isCenterMode ? '8px 18px' : '6px 14px',
              background: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{userLineCount} lines in user code</span>
              <span>•</span>
              <span style={{ color: badgeColor }}>
                {platformInfo.patternType || 'Step-by-Step Line Tracer'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={11} style={{ color: badgeColor }} />
              <span>Edit code or inputs in the left drawer</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
