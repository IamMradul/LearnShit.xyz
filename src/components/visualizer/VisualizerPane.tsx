import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useTraceStore } from '../../store/traceStore';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import { detectDataStructures } from '../../engine/DSDetector';
import { detectLanguage } from '../../engine/LanguageDetector';
import { RendererErrorBoundary } from './RendererErrorBoundary';
import { ArrayRenderer } from './renderers/ArrayRenderer';
import { TreeRenderer } from './renderers/TreeRenderer';
import { LinkedListRenderer } from './renderers/LinkedListRenderer';
import { GridRenderer } from './renderers/GridRenderer';
import { GraphRenderer } from './renderers/GraphRenderer';
import { RecursionTreeRenderer } from './renderers/RecursionTreeRenderer';
import { HashMapRenderer } from './renderers/HashMapRenderer';
import { GeometryRenderer } from './renderers/GeometryRenderer';
import { BitmaskRenderer } from './renderers/BitmaskRenderer';
import { PlaybackControls } from './playback/PlaybackControls';
import { WalkthroughExplainer } from './WalkthroughExplainer';
import { AnimatedCodeVisualizer } from './AnimatedCodeVisualizer';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import { ALGORITHM_PRESETS } from '../../engine/presets';
import {
  Info,
  AlertTriangle,
  Code2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  ArrowLeft,
  Loader2,
  Layout,
} from 'lucide-react';
import type { DSType } from '../../engine/TraceTypes';

function DSRenderer({
  dsType,
  step,
  varName,
  height,
}: {
  dsType: DSType;
  step: ReturnType<typeof useTraceStore.getState>['steps'][0] | null;
  varName: string;
  height: number;
}) {
  if (!step) return null;

  switch (dsType) {
    case 'bitmask':
      return <BitmaskRenderer step={step} varName={varName} height={height} />;
    case 'array':
    case 'stack':
    case 'queue':
    case 'fenwickTree':
      return <ArrayRenderer step={step} varName={varName} height={height} />;
    case 'binaryTree':
    case 'bst':
    case 'avl':
    case 'segmentTree':
    case 'heap':
      return <TreeRenderer step={step} varName={varName} height={height} />;
    case 'linkedList':
    case 'doublyLinkedList':
      return <LinkedListRenderer step={step} varName={varName} height={height} />;
    case 'grid':
      return <GridRenderer step={step} varName={varName} height={height} />;
    case 'graph':
    case 'unionFind':
      return <GraphRenderer step={step} varName={varName} height={height} />;
    case 'hashMap':
    case 'hashSet':
      return <HashMapRenderer step={step} varName={varName} height={height} />;
    case 'geometry':
      return <GeometryRenderer step={step} varName={varName} height={height} />;
    default:
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height,
            color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          <Info size={14} style={{ marginRight: 6 }} />
          Visualizer for "{dsType}"
        </div>
      );
  }
}

function FallbackStateRenderer({
  step,
  currentIndex,
  totalSteps,
  steps,
  code,
  language: _language,
  result,
  onSelectStep,
}: {
  step: ReturnType<typeof useTraceStore.getState>['steps'][0] | null;
  currentIndex: number;
  totalSteps: number;
  steps: ReturnType<typeof useTraceStore.getState>['steps'];
  code: string;
  language: string;
  result: ReturnType<typeof useTraceStore.getState>['result'];
  onSelectStep?: (idx: number) => void;
}) {
  const vars = step?.variables ?? {};
  const entries = Object.entries(vars);
  const stack = step?.callStack ?? [];
  const lines = useMemo(() => (code ? code.split('\n') : []), [code]);
  const activeLineNum = step?.line ?? 1;
  const activeLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeLineNum]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: 960,
        maxHeight: '100%',
        gap: 14,
        padding: '20px 24px',
        background: 'rgba(16, 18, 22, 0.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: 16,
        border: '1px solid rgba(247, 245, 239, 0.12)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
          paddingBottom: 12,
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
              }}
            >
              Trace View • Execution State Inspector
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Tracking source lines, runtime variables, call stack, output, and step progression
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

      {/* Grid: Left = Code & Output, Right = Variables & Call Stack */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 14,
          minHeight: 0,
        }}
      >
        {/* Left column: Code + Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Source Code */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
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
                gap: 6,
                fontSize: 11,
                color: '#F7F5EF',
                fontFamily: "'Oswald', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 6,
              }}
            >
              <Code2 size={13} style={{ color: 'var(--accent)' }} />
              <span>Source Code (Active Line Highlighted)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
              {lines.map((ln, idx) => {
                const lineNum = idx + 1;
                const isCurrent = lineNum === activeLineNum;
                return (
                  <div
                    key={idx}
                    ref={isCurrent ? activeLineRef : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: isCurrent ? 'rgba(214, 82, 58, 0.22)' : 'transparent',
                      borderLeft: isCurrent ? '3px solid var(--accent)' : '3px solid transparent',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: isCurrent ? '#F7F5EF' : 'var(--text-secondary)',
                      fontWeight: isCurrent ? 600 : 400,
                      whiteSpace: 'pre',
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        flexShrink: 0,
                        color: isCurrent ? 'var(--accent)' : 'var(--text-muted)',
                        userSelect: 'none',
                        fontSize: 10,
                      }}
                    >
                      {lineNum}
                    </span>
                    <span>{ln || ' '}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Program Output (stdout / stderr) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(247, 245, 239, 0.06)',
              borderRadius: 10,
              padding: '10px 12px',
              minHeight: 80,
              maxHeight: 140,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: '#F7F5EF',
                fontFamily: "'Oswald', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Terminal size={13} style={{ color: '#2ed573' }} />
              <span>Program Output (stdout / console)</span>
            </div>
            {result?.stdout ? (
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#2ed573',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.45,
                }}
              >
                {result.stdout}
              </pre>
            ) : result?.error || step?.exception ? (
              <pre
                style={{
                  margin: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--accent)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.45,
                }}
              >
                {result?.error || step?.exception?.message}
              </pre>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No stdout produced at this point.
              </span>
            )}
          </div>
        </div>

        {/* Right column: Variables & Call Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Scope Variables */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(247, 245, 239, 0.06)',
              borderRadius: 10,
              padding: '10px 12px',
              maxHeight: 180,
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
                <span>Scope Variables ({entries.length})</span>
              </div>
              <span style={{ fontSize: 9.5, color: '#2ed573' }}>● green = mutated</span>
            </div>
            {entries.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                No local variables in scope at this step
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {entries.map(([name, v]) => {
                  const isMutated = step?.mutations?.some((m) => m.varName === name);
                  return (
                    <div
                      key={name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: isMutated ? 'rgba(46, 213, 115, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        border: isMutated ? '1px solid rgba(46, 213, 115, 0.4)' : '1px solid rgba(247, 245, 239, 0.04)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                      }}
                    >
                      <span style={{ color: isMutated ? '#2ed573' : 'var(--accent)', fontWeight: 600 }}>
                        {name}
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>
                          ({v.type})
                        </span>
                      </span>
                      <span
                        style={{
                          color: '#F7F5EF',
                          maxWidth: 160,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {v.repr || (typeof v.value === 'object' && v.value !== null ? JSON.stringify(v.value) : String(v.value))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call Stack */}
          {stack.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(247, 245, 239, 0.06)',
                borderRadius: 10,
                padding: '10px 12px',
                maxHeight: 140,
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: '#F7F5EF',
                  fontFamily: "'Oswald', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Layers size={13} style={{ color: 'var(--accent)' }} />
                <span>Call Stack ({stack.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {stack.map((frame, idx) => {
                  const isTop = idx === stack.length - 1;
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
                      <span style={{ color: isTop ? 'var(--accent)' : '#F7F5EF', fontWeight: 600 }}>
                        {frame.name || 'anonymous'}()
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>line {frame.line}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Clickable Step List */}
      {steps.length > 0 && onSelectStep && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            borderTop: '1px solid rgba(247, 245, 239, 0.08)',
            paddingTop: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: 'var(--text-muted)',
              fontFamily: "'Oswald', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <span>Execution Step Timeline (click any step to jump)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{steps.length} total steps</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              overflowX: 'auto',
              paddingBottom: 4,
            }}
          >
            {steps.map((s, idx) => {
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
                    borderRadius: 6,
                    padding: '3px 8px',
                    color: isSelected ? '#F7F5EF' : 'var(--text-secondary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 400,
                    transition: 'all 0.12s ease',
                  }}
                >
                  #{idx + 1} L{s.line}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const VisualizerPane: React.FC = () => {
  const {
    steps,
    currentIndex,
    setCurrentIndex,
    status,
    result,
    setResult,
    setRunning,
    setError,
    isRunning,
    error,
    pyodideLoading,
  } = useTraceStore();
  const {
    activeVisualizerTab,
    setActiveVisualizerTab,
    visualizerZoom,
    centerViewMode,
    setCenterViewMode,
  } = useUIStore();
  const { code, input, stdin, language, setLanguage, modeOverride, setCode, setInput } = useEditorStore();

  // Auto-initialize first trace on mount if code is present
  useEffect(() => {
    if (steps.length === 0 && code.trim().length > 0) {
      const runInit = async () => {
        let effectiveLang = language;
        const langDetect = detectLanguage(code);
        if (langDetect.confidence >= 0.4 && langDetect.language !== language) {
          effectiveLang = langDetect.language;
          setLanguage(effectiveLang);
        }
        setRunning(true);
        try {
          const adapter = getAdapter(effectiveLang);
          const res = await adapter.trace({
            code,
            input,
            stdin,
            mode: modeOverride,
            maxSteps: 5000,
            timeoutMs: 10000,
            language: effectiveLang,
          });
          setResult(res);
        } catch {
          // ignore init error
        } finally {
          setRunning(false);
        }
      };
      runInit();
    }
  }, []);

  const currentStep = steps[currentIndex] ?? null;
  const detectedDS = useMemo(() => detectDataStructures(steps), [steps]);
  const activeDS = detectedDS.find((d) => d.varName === activeVisualizerTab) ?? detectedDS[0];



  // Recursion detection & view mode (only genuine recursive calls or multiple non-module frames)
  const hasRecursion = useMemo(() => {
    return steps.some((s) => {
      if (!s.callStack || s.callStack.length <= 1) return false;
      const userFrames = s.callStack.filter(
        (f) =>
          !f.name.startsWith('__') &&
          f.name !== '<module>' &&
          f.name !== 'Solution' &&
          f.name !== 'run_with_trace' &&
          f.name !== 'anonymous',
      );
      const names = userFrames.map((f) => f.name);
      return new Set(names).size < names.length;
    });
  }, [steps]);

  const [visualizerMode, setVisualizerMode] = useState<'ds' | 'recursion'>('ds');

  useEffect(() => {
    const isOnlyHelperDS = detectedDS.every((d) =>
      ['memo', 'cache', 'seen', 'visited', 'dp', 'table'].includes(d.varName.toLowerCase()) || d.dsType === 'hashMap',
    );
    if (hasRecursion && (detectedDS.length === 0 || isOnlyHelperDS)) {
      setVisualizerMode('recursion');
    }
  }, [hasRecursion, detectedDS]);

  // Empirical Big-O & Profile metrics
  const profileMetrics = useMemo(() => {
    const totalSteps = steps.length;
    let totalMutations = 0;
    let maxStackDepth = 1;
    for (const s of steps) {
      totalMutations += s.mutations.length;
      if (s.callStack && s.callStack.length > maxStackDepth) {
        maxStackDepth = s.callStack.length;
      }
    }

    let bigO = 'O(1)';
    if (totalSteps > 150) bigO = 'O(N²)';
    else if (totalSteps > 40) bigO = 'O(N log N)';
    else if (totalSteps > 10) bigO = 'O(N)';
    else if (totalSteps > 3) bigO = 'O(log N)';

    return { totalSteps, totalMutations, maxStackDepth, bigO };
  }, [steps]);

  // Extract executing code lines for code tracker
  const codeLines = useMemo(() => (code ? code.split('\n') : []), [code]);
  const activeLineNum = useMemo(() => {
    if (!currentStep) return 1;
    const l = currentStep.line;
    if (typeof l === 'number' && l >= 1 && l <= codeLines.length) {
      return l;
    }
    return 1;
  }, [currentStep, codeLines.length]);

  // Extract event description
  const eventDesc = useMemo(() => {
    if (!currentStep) return 'Ready';
    if (currentStep.mutations.length > 0) {
      const m = currentStep.mutations[0];
      if (m.description) return m.description;
      if (m.op === 'compare') return `Comparing elements at indices [${m.highlightIndices?.join(', ')}]`;
      if (m.op === 'swap') return `Swapping elements at indices [${m.highlightIndices?.join(', ')}]`;
      return `${m.op.toUpperCase()} operation on ${m.varName}`;
    }
    return `Executing line ${currentStep.line}`;
  }, [currentStep]);

  return (
    <div
      id="visualizer"
      className="visualizer-stage"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#0a0b0d',
        backgroundImage: 'radial-gradient(rgba(247, 245, 239, 0.07) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Prominent Execution Error Alert ─────────────────────────────────── */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '12px 20px',
            background: 'rgba(28, 12, 14, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(214, 82, 58, 0.55)',
            borderRadius: 12,
            boxShadow: '0 12px 36px rgba(0,0,0,0.7)',
            maxWidth: '85%',
            minWidth: 320,
          }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 12,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontWeight: 700,
                marginBottom: 3,
              }}
            >
              Execution Error
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11.5,
                color: '#F7F5EF',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}
            >
              {typeof error === 'string' && error.trim() === '{}' ? 'Runtime execution error' : error}
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
            title="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Truncated / Timeout Alert Notice ─────────────────────────────────── */}
      {result?.truncated && (
        <div
          style={{
            position: 'absolute',
            top: error ? 116 : 60,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 49,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            background: 'rgba(28, 20, 10, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 165, 2, 0.55)',
            borderRadius: 12,
            boxShadow: '0 8px 28px rgba(0,0,0,0.6)',
            maxWidth: '85%',
          }}
        >
          <Info size={16} style={{ color: '#ffa502', flexShrink: 0 }} />
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11.5,
              color: '#F7F5EF',
              lineHeight: 1.4,
            }}
          >
            {result.timedOut || result.truncatedReason === 'timeout'
              ? `Execution timed out (limit exceeded). Trace paused at step ${steps.length}.`
              : `Trace truncated at ${result.totalSteps || steps.length} steps (limit reached).`}
          </div>
        </div>
      )}

      {/* ── Loading Overlay ─────────────────────────────────────────────────── */}
      {isRunning && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 11, 13, 0.65)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              padding: '24px 32px',
              background: 'rgba(16, 18, 22, 0.92)',
              border: '1px solid rgba(214, 82, 58, 0.35)',
              borderRadius: 16,
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            }}
          >
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 14,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: '#F7F5EF',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {pyodideLoading ? 'Loading Python Runtime (Pyodide)…' : 'Tracing Algorithm Execution…'}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11.5,
                  color: 'var(--text-muted)',
                }}
              >
                Simulating execution steps in sandbox worker
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Top Unified Primary Bar (Mode Switcher, Operation Banner, Complexity HUD) ── */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          zIndex: 35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        {/* Left: Mode Switcher Pills */}
        <div
          style={{
            display: 'flex',
            gap: 2,
            background: 'rgba(16, 18, 22, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            borderRadius: 20,
            padding: 3,
            pointerEvents: 'auto',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={() => setCenterViewMode('code')}
            style={{
              background: centerViewMode === 'code' ? 'var(--accent)' : 'transparent',
              border: 'none',
              borderRadius: 16,
              padding: '4px 12px',
              color: centerViewMode === 'code' ? '#F7F5EF' : 'var(--text-secondary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: centerViewMode === 'code' ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Code2 size={12} />
            <span>Code Execution</span>
          </button>

          {/* Data Structure Pill: ALWAYS VISIBLE */}
          <button
            onClick={() => {
              if (detectedDS.length > 0) {
                setCenterViewMode('ds');
              }
            }}
            disabled={detectedDS.length === 0}
            title={
              detectedDS.length === 0
                ? 'No recognized data structures detected. Viewing execution in Trace view.'
                : 'Data Structure Visualizer'
            }
            data-tooltip={
              detectedDS.length === 0
                ? 'No data structures detected'
                : 'Data Structure Visualizer'
            }
            style={{
              background:
                centerViewMode === 'ds' && detectedDS.length > 0 ? 'var(--accent)' : 'transparent',
              border: 'none',
              borderRadius: 16,
              padding: '4px 12px',
              color:
                centerViewMode === 'ds' && detectedDS.length > 0
                  ? '#F7F5EF'
                  : detectedDS.length === 0
                    ? 'rgba(247, 245, 239, 0.35)'
                    : 'var(--text-secondary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              cursor: detectedDS.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: centerViewMode === 'ds' && detectedDS.length > 0 ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              opacity: detectedDS.length === 0 ? 0.45 : 1,
            }}
          >
            <Layers size={12} />
            <span>Data Structure</span>
          </button>

          {/* Trace View Pill */}
          <button
            onClick={() => setCenterViewMode('trace')}
            style={{
              background:
                centerViewMode === 'trace' || (centerViewMode === 'ds' && detectedDS.length === 0)
                  ? 'var(--accent)'
                  : 'transparent',
              border: 'none',
              borderRadius: 16,
              padding: '4px 12px',
              color:
                centerViewMode === 'trace' || (centerViewMode === 'ds' && detectedDS.length === 0)
                  ? '#F7F5EF'
                  : 'var(--text-secondary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              cursor: 'pointer',
              fontWeight:
                centerViewMode === 'trace' || (centerViewMode === 'ds' && detectedDS.length === 0)
                  ? 600
                  : 400,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Activity size={12} />
            <span>Trace View</span>
          </button>

          {detectedDS.length > 0 && (
            <button
              onClick={() => setCenterViewMode('split')}
              style={{
                background: centerViewMode === 'split' ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 16,
                padding: '4px 12px',
                color: centerViewMode === 'split' ? '#F7F5EF' : 'var(--text-secondary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: centerViewMode === 'split' ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Layout size={12} />
              <span>Split View</span>
            </button>
          )}

          {hasRecursion && (
            <button
              onClick={() => {
                setCenterViewMode('ds');
                setVisualizerMode('recursion');
              }}
              style={{
                background: centerViewMode === 'ds' && visualizerMode === 'recursion' ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 16,
                padding: '4px 12px',
                color: centerViewMode === 'ds' && visualizerMode === 'recursion' ? '#F7F5EF' : 'var(--text-secondary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: centerViewMode === 'ds' && visualizerMode === 'recursion' ? 600 : 400,
              }}
            >
              Call Tree
            </button>
          )}
        </div>

        {/* Center: Operation HUD Banner */}
        {currentStep && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              background: 'rgba(16, 18, 22, 0.85)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              borderRadius: 30,
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
              minWidth: 0,
              overflow: 'hidden',
              pointerEvents: 'auto',
              flexShrink: 1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 6px var(--accent)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                background: 'rgba(214, 82, 58, 0.2)',
                color: 'var(--accent)',
                padding: '1px 5px',
                borderRadius: 4,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              L{activeLineNum}
            </span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11.5,
                fontWeight: 500,
                color: '#F7F5EF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {eventDesc}
            </span>
          </div>
        )}

        {/* Right: Empirical Big-O Complexity HUD */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(16, 18, 22, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            borderRadius: 20,
            padding: '4px 12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Activity size={12} color="#D6523A" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time:</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#D6523A', fontFamily: "'JetBrains Mono', monospace" }}>{profileMetrics.bigO}</span>
          </div>
          <div style={{ width: 1, height: 12, background: 'rgba(247, 245, 239, 0.15)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Layers size={12} color="#2ed573" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Steps:</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#F7F5EF', fontFamily: "'JetBrains Mono', monospace" }}>
              {steps.length > 0 ? currentIndex + 1 : 0}/{profileMetrics.totalSteps}
            </span>
          </div>
          {profileMetrics.maxStackDepth > 1 && (
            <>
              <div style={{ width: 1, height: 12, background: 'rgba(247, 245, 239, 0.15)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stack:</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#ffa502', fontFamily: "'JetBrains Mono', monospace" }}>
                  {currentStep?.callStack?.length ?? 1}/{profileMetrics.maxStackDepth}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Secondary Bar: Data Structure Sub-Tabs (when in DS/Split mode & multiple DS detected) ── */}
      {(centerViewMode === 'ds' || centerViewMode === 'split') && detectedDS.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 54,
            left: 16,
            zIndex: 34,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(16, 18, 22, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(247, 245, 239, 0.1)',
            borderRadius: 20,
            padding: 3,
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          <button
            onClick={() => setActiveVisualizerTab('all')}
            style={{
              background: activeVisualizerTab === 'all' ? 'var(--accent)' : 'transparent',
              border: 'none',
              borderRadius: 16,
              padding: '3px 10px',
              color: activeVisualizerTab === 'all' ? '#F7F5EF' : 'var(--text-secondary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            All ({detectedDS.length})
          </button>
          {detectedDS.map((ds) => {
            const isSelected =
              (!activeVisualizerTab && ds.varName === detectedDS[0]?.varName) ||
              activeVisualizerTab === ds.varName;
            return (
              <button
                key={ds.varName}
                onClick={() => setActiveVisualizerTab(ds.varName)}
                style={{
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  border: 'none',
                  borderRadius: 16,
                  padding: '3px 10px',
                  color: isSelected ? '#F7F5EF' : 'var(--text-secondary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                {ds.varName}
                <span style={{ opacity: 0.65, fontSize: 9.5, marginLeft: 3 }}>
                  ({ds.dsType})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Center Canvas Stage with Zoom & Docked Code Visualizer ────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding:
              centerViewMode === 'code'
                ? '56px 20px 80px'
                : (centerViewMode === 'ds' || centerViewMode === 'split') && detectedDS.length > 1
                  ? '92px 24px 100px'
                  : '56px 24px 100px',
            overflow: 'auto',
            minWidth: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              transform: centerViewMode === 'code' ? undefined : `scale(${visualizerZoom / 100})`,
              transformOrigin: 'center center',
              transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%',
              maxWidth: centerViewMode === 'split' ? 1280 : 1060,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {code.trim().length === 0 && steps.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  maxWidth: 440,
                  padding: '36px 28px',
                  background: 'rgba(16, 18, 22, 0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: 16,
                  border: '1px solid rgba(247, 245, 239, 0.1)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: 'rgba(214, 82, 58, 0.15)',
                    border: '1px solid rgba(214, 82, 58, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Code2 size={26} style={{ color: 'var(--accent)' }} />
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 18,
                      color: '#F7F5EF',
                      margin: '0 0 6px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Ready to Visualize
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      color: '#9B9A95',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Type or paste your code in the open editor on the left, then click{' '}
                    <strong style={{ color: 'var(--accent)' }}>Run Code</strong> to watch your
                    algorithm execute step by step.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const preset = ALGORITHM_PRESETS[0];
                    const langData = preset.languages[language] ?? preset.languages.javascript;
                    if (langData) {
                      setCode(langData.code);
                      setInput(langData.input);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(247, 245, 239, 0.08)',
                    border: '1px solid rgba(247, 245, 239, 0.16)',
                    borderRadius: 20,
                    padding: '7px 16px',
                    color: '#F7F5EF',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <Sparkles size={12} style={{ color: 'var(--accent)' }} />
                  <span>Load Sample (Bubble Sort)</span>
                </button>
              </div>
            ) : centerViewMode === 'code' ? (
              <AnimatedCodeVisualizer layoutMode="center" />
            ) : centerViewMode === 'trace' || (centerViewMode === 'ds' && detectedDS.length === 0) ? (
              <FallbackStateRenderer
                step={currentStep}
                currentIndex={currentIndex}
                totalSteps={steps.length}
                steps={steps}
                code={code}
                language={language}
                result={result}
                onSelectStep={setCurrentIndex}
              />
            ) : centerViewMode === 'split' && detectedDS.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  width: '100%',
                  height: '100%',
                  alignItems: 'stretch',
                }}
              >
                <AnimatedCodeVisualizer layoutMode="split" />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(16, 18, 22, 0.75)',
                    borderRadius: 16,
                    border: '1px solid rgba(247, 245, 239, 0.1)',
                    padding: 16,
                    overflow: 'hidden',
                  }}
                >
                  <RendererErrorBoundary
                    fallback={
                      <FallbackStateRenderer
                        step={currentStep}
                        currentIndex={currentIndex}
                        totalSteps={steps.length}
                        steps={steps}
                        code={code}
                        language={language}
                        result={result}
                        onSelectStep={setCurrentIndex}
                      />
                    }
                  >
                    {visualizerMode === 'recursion' ? (
                      <RecursionTreeRenderer steps={steps} currentIndex={currentIndex} height={340} />
                    ) : activeDS ? (
                      <DSRenderer
                        dsType={activeDS.dsType}
                        step={currentStep}
                        varName={activeDS.varName}
                        height={340}
                      />
                    ) : null}
                  </RendererErrorBoundary>
                </div>
              </div>
            ) : centerViewMode === 'ds' && activeDS ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <RendererErrorBoundary
                  fallback={
                    <FallbackStateRenderer
                      step={currentStep}
                      currentIndex={currentIndex}
                      totalSteps={steps.length}
                      steps={steps}
                      code={code}
                      language={language}
                      result={result}
                      onSelectStep={setCurrentIndex}
                    />
                  }
                >
                  {activeVisualizerTab === 'all' && detectedDS.length > 1 ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          detectedDS.length === 2 ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr',
                        gap: 20,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {detectedDS.map((ds) => (
                        <div
                          key={ds.varName}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                          }}
                        >
                          <DSRenderer
                            dsType={ds.dsType}
                            step={currentStep}
                            varName={ds.varName}
                            height={detectedDS.length > 2 ? 260 : 320}
                          />
                        </div>
                      ))}
                    </div>
                  ) : visualizerMode === 'recursion' ? (
                    <RecursionTreeRenderer steps={steps} currentIndex={currentIndex} height={340} />
                  ) : (
                    <DSRenderer
                      dsType={activeDS.dsType}
                      step={currentStep}
                      varName={activeDS.varName}
                      height={340}
                    />
                  )}
                </RendererErrorBoundary>
              </div>
            ) : steps.length > 0 && detectedDS.length === 0 ? (
              <FallbackStateRenderer
                step={currentStep}
                currentIndex={currentIndex}
                totalSteps={steps.length}
                steps={steps}
                code={code}
                language={language}
                result={result}
                onSelectStep={setCurrentIndex}
              />
            ) : (
              /* DEFAULT / PRIMARY: Animated Code Visualizer Centered */
              <AnimatedCodeVisualizer layoutMode="center" />
            )}
          </div>
        </div>
      </div>

      {/* ── Step-by-Step AI Walkthrough Narration & Profiler Trigger ────────── */}
      <WalkthroughExplainer />

      {/* ── Bottom Floating Playback Media Bar ──────────────────────────────── */}
      <PlaybackControls />
    </div>
  );
};
