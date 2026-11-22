import React, { useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { getParsedArgumentsInfo } from '../../engine/ModeDetector';

const TABS = [
  { id: 'input', label: 'Input' },
  { id: 'output', label: 'Output' },
  { id: 'console', label: 'Console' },
  { id: 'variables', label: 'Variables' },
  { id: 'callstack', label: 'Call Stack' },
] as const;

export const BottomPanel: React.FC = () => {
  const { activeBottomTab, setActiveBottomTab, bottomPanelOpen, setBottomPanelOpen, bottomPanelHeight, setBottomPanelHeight } =
    useUIStore();
  const {
    input,
    setInput,
    stdin,
    setStdin,
    code,
    language,
    inputHighlighted,
    setInputHighlighted,
  } = useEditorStore();
  const { result, steps, currentIndex, status } = useTraceStore();

  const isEnd = steps.length === 0 || currentIndex >= steps.length - 1 || status === 'done';

  const finalReturnValue = useMemo(() => {
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].returnValue !== undefined) {
        return steps[i].returnValue;
      }
    }
    return undefined;
  }, [steps]);

  // Highlight input area when new code is added for visualization
  useEffect(() => {
    if (inputHighlighted) {
      setActiveBottomTab('input');
      const timer = setTimeout(() => {
        setInputHighlighted(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [inputHighlighted, setActiveBottomTab, setInputHighlighted]);

  // Show output automatically after end of visualization
  useEffect(() => {
    if (status === 'done' && steps.length > 0) {
      setActiveBottomTab('output');
      if (!bottomPanelOpen) {
        setBottomPanelOpen(true);
      }
    }
  }, [status, steps.length, setActiveBottomTab, setBottomPanelOpen, bottomPanelOpen]);

  const parsedInfo = useMemo(
    () => getParsedArgumentsInfo(code, input, language),
    [code, input, language],
  );

  const step = steps[currentIndex] ?? null;

  // ── Vertical resize ───────────────────────────────────────────────────────
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = bottomPanelHeight;

    const move = (me: MouseEvent) => {
      const delta = startY - me.clientY;
      setBottomPanelHeight(Math.max(120, Math.min(500, startH + delta)));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      style={{
        height: bottomPanelOpen ? bottomPanelHeight : 36,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        transition: 'height 0.15s ease',
        position: 'relative',
      }}
    >
      {/* Resize handle */}
      {bottomPanelOpen && (
        <div
          className="resizer vertical"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
          onMouseDown={handleResizeStart}
        />
      )}

      {/* Tab strip + collapse toggle */}
      <div
        className="tab-strip"
        style={{ borderBottom: bottomPanelOpen ? undefined : 'none' }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeBottomTab === t.id ? 'active' : ''}`}
            onClick={() => {
              setActiveBottomTab(t.id);
              if (!bottomPanelOpen) setBottomPanelOpen(true);
            }}
            id={`bottom-tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-icon"
          onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
          style={{ padding: '4px', border: 'none', background: 'transparent' }}
          id="bottom-panel-toggle"
          data-tooltip={bottomPanelOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {bottomPanelOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>
      </div>

      {/* Tab content */}
      {bottomPanelOpen && (
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {activeBottomTab === 'input' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 12,
                height: '100%',
                minHeight: 120,
              }}
            >
              {/* Test Input (function arguments) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 8,
                  padding: inputHighlighted ? 8 : 0,
                  transition: 'all 0.3s ease',
                }}
                className={inputHighlighted ? 'input-highlight-pulse' : ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label
                      htmlFor="input-textarea"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: 11,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                        fontWeight: 600,
                      }}
                    >
                      Test Input (function arguments)
                    </label>
                    {inputHighlighted && (
                      <span
                        style={{
                          fontSize: 9.5,
                          background: 'rgba(214, 82, 58, 0.25)',
                          border: '1px solid var(--accent)',
                          color: '#F7F5EF',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                          animation: 'pulse 1.5s infinite ease-in-out',
                        }}
                      >
                        ✨ New Code Added
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>JSON format</span>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (inputHighlighted) setInputHighlighted(false);
                  }}
                  onFocus={() => {
                    if (inputHighlighted) setInputHighlighted(false);
                  }}
                  id="input-textarea"
                  placeholder="e.g. [[2, 7, 11, 15], 9] or [1, 2, 3, 4, 5]"
                  style={{
                    flex: 1,
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontSize: 12.5,
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: 8,
                    resize: 'none',
                    outline: 'none',
                  }}
                />
                {parsedInfo.mismatchError ? (
                  <div
                    style={{
                      marginTop: 6,
                      padding: '4px 8px',
                      borderRadius: 4,
                      background: 'rgba(214, 82, 58, 0.15)',
                      border: '1px solid rgba(214, 82, 58, 0.35)',
                      color: '#ff7b72',
                      fontSize: 10.5,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ⚠️ {parsedInfo.mismatchError}
                  </div>
                ) : parsedInfo.args.length > 0 ? (
                  <div
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                      Args:
                    </span>
                    {parsedInfo.args.map((a, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 10,
                          fontFamily: "'JetBrains Mono', monospace",
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border)',
                          padding: '1px 6px',
                          borderRadius: 4,
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
              </div>

              {/* Custom Input (stdin) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 8,
                  padding: inputHighlighted ? 8 : 0,
                  transition: 'all 0.3s ease',
                }}
                className={inputHighlighted ? 'input-highlight-pulse' : ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <label
                      htmlFor="stdin-textarea"
                      style={{
                        fontFamily: "'Oswald', sans-serif",
                        fontSize: 11,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: '#2ed573',
                        fontWeight: 600,
                      }}
                    >
                      Custom Input (stdin)
                    </label>
                    {inputHighlighted && (
                      <span
                        style={{
                          fontSize: 9.5,
                          background: 'rgba(46, 213, 115, 0.25)',
                          border: '1px solid #2ed573',
                          color: '#F7F5EF',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                          animation: 'pulse 1.5s infinite ease-in-out',
                        }}
                      >
                        ✨ New Code Added
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Raw text stream</span>
                </div>
                <textarea
                  value={stdin}
                  onChange={(e) => {
                    setStdin(e.target.value);
                    if (inputHighlighted) setInputHighlighted(false);
                  }}
                  onFocus={() => {
                    if (inputHighlighted) setInputHighlighted(false);
                  }}
                  id="stdin-textarea"
                  placeholder="Standard input lines for prompt, readline, fs.readFileSync(0), cin, or input()"
                  style={{
                    flex: 1,
                    width: '100%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    fontSize: 12.5,
                    fontFamily: 'JetBrains Mono, monospace',
                    padding: 8,
                    resize: 'none',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {activeBottomTab === 'output' && (
            <div>
              {!isEnd && steps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffa502', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                    <Loader2 size={14} className="spin" />
                    <span>Visualization in progress (Step {currentIndex + 1} of {steps.length})</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
                    Output will be shown after the end of visualization.
                  </p>
                  <div>
                    <button
                      onClick={() => {
                        useTraceStore.getState().setCurrentIndex(Math.max(0, steps.length - 1));
                        useTraceStore.getState().setStatus('done');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(247, 245, 239, 0.08)',
                        border: '1px solid rgba(247, 245, 239, 0.16)',
                        borderRadius: 6,
                        padding: '5px 12px',
                        color: '#F7F5EF',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <span>Skip to End to View Output ⏭</span>
                    </button>
                  </div>
                </div>
              ) : result?.stdout ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 11, fontWeight: 600, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    <Check size={13} />
                    <span>Visualization Completed — Program Output</span>
                  </div>
                  <pre
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      color: 'var(--green)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      margin: 0,
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid rgba(46, 213, 115, 0.2)',
                    }}
                  >
                    {result.stdout}
                  </pre>
                  {finalReturnValue !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                      <span style={{ color: '#ffa502', fontWeight: 600 }}>Return Value:</span>
                      <span style={{ background: 'rgba(46, 213, 115, 0.15)', border: '1px solid rgba(46, 213, 115, 0.4)', color: '#2ed573', padding: '2px 8px', borderRadius: 4 }}>
                        {typeof finalReturnValue === 'object' ? JSON.stringify(finalReturnValue) : String(finalReturnValue)}
                      </span>
                    </div>
                  )}
                </div>
              ) : finalReturnValue !== undefined ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 11, fontWeight: 600, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    <Check size={13} />
                    <span>Visualization Completed — Return Value</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: '#ffa502', fontWeight: 600 }}>Return Value:</span>
                    <span style={{ background: 'rgba(46, 213, 115, 0.15)', border: '1px solid rgba(46, 213, 115, 0.4)', color: '#2ed573', padding: '3px 10px', borderRadius: 4 }}>
                      {typeof finalReturnValue === 'object' ? JSON.stringify(finalReturnValue) : String(finalReturnValue)}
                    </span>
                  </div>
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {steps.length > 0
                    ? 'Visualization completed with no stdout output.'
                    : 'No output yet. Run the code to see results.'}
                </span>
              )}
            </div>
          )}

          {activeBottomTab === 'console' && (
            <div>
              {result?.error || result?.stderr ? (
                <pre
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    color: 'var(--red)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {result.stderr || result.error}
                </pre>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  No errors or warnings.
                </span>
              )}
            </div>
          )}

          {activeBottomTab === 'variables' && (
            <div>
              {step && Object.keys(step.variables).length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Name', 'Type', 'Value'].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: 'left',
                            padding: '4px 8px',
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            borderBottom: '1px solid var(--border)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(step.variables).map(([name, tv]) => (
                      <tr key={name} className="var-row">
                        <td className="var-name" style={{ padding: '4px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>{name}</td>
                        <td className="var-type" style={{ padding: '4px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--orange)' }}>{tv.type}</td>
                        <td className="var-value" style={{ padding: '4px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{tv.repr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {steps.length ? 'No variables in scope at this step.' : 'Run code to see variables.'}
                </span>
              )}
            </div>
          )}

          {activeBottomTab === 'callstack' && (
            <div>
              {step && step.callStack.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[...step.callStack].reverse().map((frame, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        background: i === 0 ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
                        border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: 6,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: 'var(--purple)' }}>{frame.name}</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                        line {frame.line}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {steps.length ? 'No call stack info at this step.' : 'Run code to see call stack.'}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
