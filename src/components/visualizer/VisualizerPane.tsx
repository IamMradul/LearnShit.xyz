import React, { useMemo, useEffect, useState } from 'react';
import { useTraceStore } from '../../store/traceStore';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import { detectDataStructures } from '../../engine/DSDetector';
import { ArrayRenderer } from './renderers/ArrayRenderer';
import { TreeRenderer } from './renderers/TreeRenderer';
import { LinkedListRenderer } from './renderers/LinkedListRenderer';
import { GridRenderer } from './renderers/GridRenderer';
import { RecursionTreeRenderer } from './renderers/RecursionTreeRenderer';
import { PlaybackControls } from './playback/PlaybackControls';
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
    case 'array':
    case 'heap':
    case 'stack':
    case 'queue':
      return <ArrayRenderer step={step} varName={varName} height={height} />;
    case 'binaryTree':
    case 'bst':
    case 'avl':
      return <TreeRenderer step={step} varName={varName} height={height} />;
    case 'linkedList':
    case 'doublyLinkedList':
      return <LinkedListRenderer step={step} varName={varName} height={height} />;
    case 'grid':
      return <GridRenderer step={step} varName={varName} height={height} />;
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

export const VisualizerPane: React.FC = () => {
  const { steps, currentIndex, status, result, setResult, setRunning, setError } =
    useTraceStore();
  const {
    activeVisualizerTab,
    setActiveVisualizerTab,
    visualizerZoom,
    isVariablesWatchOpen,
    toggleVariablesWatch,
  } = useUIStore();
  const { code, input, language, modeOverride, setCode, setInput } = useEditorStore();

  const [isCodeTrackerOpen, setIsCodeTrackerOpen] = useState(true);

  // Auto-initialize first trace on mount if code is present
  useEffect(() => {
    if (steps.length === 0 && code.trim().length > 0) {
      const runInit = async () => {
        setRunning(true);
        try {
          const adapter = getAdapter(language);
          const res = await adapter.trace({
            code,
            input,
            mode: modeOverride,
            maxSteps: 5000,
            timeoutMs: 10000,
            language,
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

  // Recursion detection & view mode
  const hasRecursion = useMemo(() => {
    return steps.some((s) => (s.callStack?.length ?? 0) > 1);
  }, [steps]);

  const [visualizerMode, setVisualizerMode] = useState<'ds' | 'recursion'>('ds');

  useEffect(() => {
    if (hasRecursion && detectedDS.length === 0) {
      setVisualizerMode('recursion');
    }
  }, [hasRecursion, detectedDS.length]);

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
  const codeLines = useMemo(() => code.split('\n'), [code]);
  const activeLineNum = currentStep?.line ?? 1;

  // Extract snippet around active line (e.g. 5 lines)
  const codeSnippet = useMemo(() => {
    const start = Math.max(0, activeLineNum - 3);
    const end = Math.min(codeLines.length, activeLineNum + 2);
    return codeLines.slice(start, end).map((text, i) => ({
      lineNo: start + i + 1,
      text,
      isActive: start + i + 1 === activeLineNum,
    }));
  }, [codeLines, activeLineNum]);

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
      {/* ── Top Floating Operation HUD Banner (staying.fun signature) ──────── */}
      {currentStep && (
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 35,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 18px',
            background: 'rgba(16, 18, 22, 0.85)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(247, 245, 239, 0.1)',
            borderRadius: 30,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxWidth: '90%',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              background: 'rgba(214, 82, 58, 0.2)',
              color: 'var(--accent)',
              padding: '2px 6px',
              borderRadius: 4,
              fontWeight: 700,
            }}
          >
            L{activeLineNum}
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
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

      {/* ── Top Tabs: Mode Switcher & Multiple Data Structures ───────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 20,
          zIndex: 35,
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {/* If recursion is detected, allow switching between Data Structure and Call Tree */}
        {hasRecursion && (
          <div
            style={{
              display: 'flex',
              gap: 2,
              background: 'rgba(16, 18, 22, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 20,
              padding: 2,
            }}
          >
            <button
              onClick={() => setVisualizerMode('ds')}
              style={{
                background: visualizerMode === 'ds' ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 16,
                padding: '4px 10px',
                color: visualizerMode === 'ds' ? '#F7F5EF' : 'var(--text-secondary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Data Structure
            </button>
            <button
              onClick={() => setVisualizerMode('recursion')}
              style={{
                background: visualizerMode === 'recursion' ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: 16,
                padding: '4px 10px',
                color: visualizerMode === 'recursion' ? '#F7F5EF' : 'var(--text-secondary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Call Tree
            </button>
          </div>
        )}

        {/* Data Structure tabs */}
        {visualizerMode === 'ds' && detectedDS.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: 4,
              background: 'rgba(16, 18, 22, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              borderRadius: 20,
              padding: 3,
            }}
          >
            {detectedDS.map((ds) => (
              <button
                key={ds.varName}
                onClick={() => setActiveVisualizerTab(ds.varName)}
                style={{
                  background: activeVisualizerTab === ds.varName ? 'var(--accent)' : 'transparent',
                  border: 'none',
                  borderRadius: 16,
                  padding: '4px 10px',
                  color: activeVisualizerTab === ds.varName ? '#F7F5EF' : 'var(--text-secondary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {ds.varName} ({ds.dsType})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Top Right: Empirical Big-O Complexity HUD ───────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 20,
          zIndex: 35,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(16, 18, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(247, 245, 239, 0.12)',
          borderRadius: 20,
          padding: '4px 12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
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

      {/* ── Center Canvas Stage with Zoom ──────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px 24px 100px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            transform: `scale(${visualizerZoom / 100})`,
            transformOrigin: 'center center',
            transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            width: '100%',
            maxWidth: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
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
          ) : hasRecursion ? (
            <RecursionTreeRenderer steps={steps} currentIndex={currentIndex} height={340} />
          ) : (
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
          )}
        </div>
      </div>

      {/* ── Floating Variables Watch Card (Bottom-Left) ─────────────────────── */}
      {currentStep && Object.keys(currentStep.variables).length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 20,
            zIndex: 35,
            width: isVariablesWatchOpen ? 230 : 'auto',
            background: 'rgba(16, 18, 22, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={toggleVariablesWatch}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'rgba(247, 245, 239, 0.04)',
              cursor: 'pointer',
              borderBottom: isVariablesWatchOpen ? '1px solid rgba(247, 245, 239, 0.08)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={13} style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 11,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#F7F5EF',
                }}
              >
                Variables Watch
              </span>
            </div>
            {isVariablesWatchOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>

          {isVariablesWatchOpen && (
            <div
              style={{
                padding: '8px 12px',
                maxHeight: 140,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              {Object.entries(currentStep.variables).map(([name, v]) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: 'var(--accent)' }}>{name}</span>
                  <span
                    style={{
                      color: '#F7F5EF',
                      maxWidth: 130,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Array.isArray(v.value)
                      ? `[${v.value.slice(0, 5).join(', ')}${v.value.length > 5 ? '…' : ''}]`
                      : String(v.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Floating Active Code Tracker (Top-Right) ───────────────────────── */}
      {currentStep && steps.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 20,
            zIndex: 35,
            width: isCodeTrackerOpen ? 270 : 'auto',
            background: 'rgba(16, 18, 22, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setIsCodeTrackerOpen(!isCodeTrackerOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: 'rgba(247, 245, 239, 0.04)',
              cursor: 'pointer',
              borderBottom: isCodeTrackerOpen ? '1px solid rgba(247, 245, 239, 0.08)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Code2 size={13} style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 11,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#F7F5EF',
                }}
              >
                Execution Tracker
              </span>
            </div>
            {isCodeTrackerOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>

          {isCodeTrackerOpen && (
            <div
              style={{
                padding: '6px 8px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                lineHeight: 1.5,
                background: '#0d0f12',
              }}
            >
              {codeSnippet.map((line) => (
                <div
                  key={line.lineNo}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: line.isActive ? 'rgba(214, 82, 58, 0.22)' : 'transparent',
                    borderLeft: line.isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    color: line.isActive ? '#F7F5EF' : 'var(--text-muted)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: line.isActive ? 'var(--accent)' : 'var(--text-muted)',
                      minWidth: 16,
                      textAlign: 'right',
                      userSelect: 'none',
                    }}
                  >
                    {line.lineNo}
                  </span>
                  <span
                    style={{
                      whiteSpace: 'pre',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: line.isActive ? 600 : 400,
                    }}
                  >
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Floating Playback Media Bar ──────────────────────────────── */}
      <PlaybackControls />
    </div>
  );
};
