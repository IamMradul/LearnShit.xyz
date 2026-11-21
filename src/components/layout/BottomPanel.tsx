import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';

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
  const { input, setInput, stdin, setStdin } = useEditorStore();
  const { result, steps, currentIndex } = useTraceStore();

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
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
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
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>JSON format</span>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
              </div>

              {/* Custom Input (stdin) */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
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
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Raw text stream</span>
                </div>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
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
              {result?.stdout ? (
                <pre
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    color: 'var(--green)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {result.stdout}
                </pre>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  No output yet. Run the code to see results.
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
