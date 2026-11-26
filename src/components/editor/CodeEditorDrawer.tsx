import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Code2, Sliders, Play, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { CodeEditor } from './CodeEditor';
import { detectMode, inferDefaultInput, getParsedArgumentsInfo } from '../../engine/ModeDetector';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import { detectLanguage } from '../../engine/LanguageDetector';
import { identifyPlatform } from '../../engine/PlatformDetector';

export const CodeEditorDrawer: React.FC = () => {
  const { isCodeEditorOpen, toggleCodeEditor } = useUIStore();
  const {
    language,
    setLanguage,
    code,
    input,
    stdin,
    setInput,
    modeOverride,
    setModeOverride,
    isAutoDetecting,
    inputHighlighted,
    setInputHighlighted,
  } = useEditorStore();
  const {
    setResult,
    setStatus,
    setRunning,
    setError,
    isRunning,
    error,
    pyodideLoading,
    setPyodideLoading,
  } = useTraceStore();

  const [activeTab, setActiveTab] = useState<'input' | 'console'>('input');

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toastVisible, setToastVisible] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = () => {
    setToastExiting(true);
    setTimeout(() => { setToastVisible(false); setToastExiting(false); }, 240);
  };

  useEffect(() => {
    if (!inputHighlighted) return;
    // Show toast whenever new code is pasted
    setToastExiting(false);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(dismissToast, 4000);
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, [inputHighlighted]);

  const parsedInfo = useMemo(
    () => getParsedArgumentsInfo(code, input, language),
    [code, input, language],
  );

  const detected = detectMode(code, language);
  const effectiveMode = modeOverride === 'auto' ? detected : modeOverride;
  const platformInfo = React.useMemo(() => identifyPlatform(code, language), [code, language]);

  const handleRun = async () => {
    if (isRunning) return;
    if (!code.trim()) {
      setError('Please paste or write your algorithm code in the editor.');
      return;
    }
    // Auto-correct language if code syntax definitively belongs to another language
    let effectiveLang = language;
    const langDetect = detectLanguage(code);
    if (langDetect.confidence >= 0.35 && langDetect.language !== language) {
      if (
        (language === 'python' && (/class\s+\w+\s*\{/.test(code) || /#include\b|public\s+class\b|\bfunction\b|\b(?:const|let|var)\b/.test(code))) ||
        (language === 'javascript' && (/def\s+\w+\s*\(|class\s+Solution.*:/.test(code)))
      ) {
        effectiveLang = langDetect.language;
        setLanguage(effectiveLang);
      }
    }

    setRunning(true);
    setError(null);
    try {
      const adapter = getAdapter(effectiveLang);
      const inferred = inferDefaultInput(code);
      let effectiveInput = input.trim();
      if (!effectiveInput) {
        effectiveInput = inferred ?? '[[64, 34, 25, 12, 22, 11, 90]]';
        setInput(effectiveInput);
      } else if (
        inferred &&
        (
          ((code.includes('addTwoNumbers') || code.includes('add_two_numbers') || code.includes('mergeTwoLists')) &&
            !effectiveInput.includes('], [') && !effectiveInput.includes('l2')) ||
          ((code.includes('twoSum') || code.includes('two_sum')) &&
            effectiveInput.startsWith('[[['))
        )
      ) {
        effectiveInput = inferred;
        setInput(effectiveInput);
      }

      const result = await adapter.trace({
        code,
        input: effectiveInput,
        stdin,
        mode: effectiveMode,
        maxSteps: 5000,
        timeoutMs: 10000,
        language: effectiveLang,
      });

      setResult(result);
      if (result.steps.length > 0) {
        setStatus('playing');
        const el = document.getElementById('ide-anchor') || document.getElementById('visualizer');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (typeof e === 'object' && e ? JSON.stringify(e) : String(e));
      setError(msg === '{}' ? 'Runtime execution error' : msg);
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  };

  if (!isCodeEditorOpen) return null;

  return (
    <div
      style={{
        width: 440,
        flexShrink: 0,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 20,
        animation: 'slideInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── Drawer Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--bg-tertiary)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code2 size={16} style={{ color: 'var(--accent)' }} />
          <span
            style={{
              fontFamily: "'Oswald', 'Display', sans-serif",
              fontSize: 14,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
          >
            Source Code
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              borderRadius: 4,
              background: isAutoDetecting ? 'rgba(88, 166, 255, 0.18)' : 'var(--bg-tertiary)',
              color: isAutoDetecting ? '#2563eb' : 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {isAutoDetecting ? `AUTO: ${language}` : language}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              borderRadius: 4,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            {effectiveMode}
          </span>
        </div>

        <button
          onClick={toggleCodeEditor}
          title="Close code drawer"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Platform & Problem Auto-Identification Banner ───────────────────── */}
      {code.trim().length > 10 && (
        <div
          style={{
            padding: '7px 14px',
            background: `${platformInfo.badgeColor}12`,
            borderBottom: `1px solid ${platformInfo.badgeColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span>{platformInfo.badgeIcon}</span>
            <span style={{ fontWeight: 700, color: platformInfo.badgeColor }}>
              {platformInfo.platformName}
            </span>
            {platformInfo.problemName && (
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                • {platformInfo.problemName}
              </span>
            )}
          </div>
          <span style={{ fontSize: 9.5, color: 'var(--text-muted)', flexShrink: 0 }}>
            {platformInfo.patternType || 'Ready to Run'}
          </span>
        </div>
      )}

      {/* ── Monaco Editor ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <CodeEditor />
      </div>

      {/* ── Error Banner if any ────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '8px 14px',
            background: 'rgba(214, 82, 58, 0.15)',
            borderTop: '1px solid var(--accent)',
            color: '#FF6B6B',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {error}
          </span>
        </div>
      )}

      {/* ── Bottom Input & Config Panel ────────────────────────────────────── */}
      <div
        className={inputHighlighted ? 'input-panel-highlighted' : ''}
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'background 0.3s ease, border-top-color 0.3s ease',
        }}
      >
        {/* Tab Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setActiveTab('input')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'input' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 0',
              }}
            >
              <Sliders size={12} />
              INPUT ARGUMENTS (JSON)
            </button>
          </div>

          {/* Mode switch */}
          <select
            value={modeOverride}
            onChange={(e) => setModeOverride(e.target.value as 'auto' | 'function' | 'full-program')}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              outline: 'none',
            }}
          >
            <option value="auto">Auto-detect mode</option>
            <option value="function">Function only</option>
            <option value="full-program">Full program</option>
          </select>
        </div>

        {/* Scrollable Input + Parsed Arguments Area */}
        <div style={{ maxHeight: 170, overflowY: 'auto' }}>
          {/* Input Textarea */}
          <div
            style={{ padding: '8px 14px', transition: 'all 0.3s ease' }}
            className={inputHighlighted ? 'input-highlight-pulse' : ''}
          >
            {inputHighlighted && (
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 9.5,
                    background: 'rgba(214, 82, 58, 0.22)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    animation: 'pulse 1.5s infinite ease-in-out',
                  }}
                >
                  <AlertTriangle size={10} />
                  New code pasted — verify your input below
                </span>
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputHighlighted) setInputHighlighted(false);
              }}
              onFocus={() => {
                if (inputHighlighted) setInputHighlighted(false);
              }}
              placeholder="e.g. [[64, 34, 25, 12, 22, 11, 90]]"
              style={{
                width: '100%',
                height: 64,
                background: inputHighlighted
                  ? 'rgba(214, 82, 58, 0.06)'
                  : 'var(--bg-tertiary)',
                border: inputHighlighted
                  ? '1px solid rgba(214, 82, 58, 0.65)'
                  : '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                padding: 8,
                outline: 'none',
                resize: 'none',
                transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: inputHighlighted
                  ? '0 0 0 3px rgba(214, 82, 58, 0.18)'
                  : 'none',
              }}
            />
          </div>

          {/* Parsed Arguments Preview */}
          {parsedInfo.mismatchError ? (
            <div
              style={{
                margin: '0 14px 8px',
                padding: '6px 10px',
                borderRadius: 6,
                background: 'rgba(214, 82, 58, 0.15)',
                border: '1px solid rgba(214, 82, 58, 0.35)',
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
                margin: '0 14px 8px',
                padding: '6px 10px',
                borderRadius: 6,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 9.5,
                  fontFamily: "'Oswald', sans-serif",
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                Passed Arguments:
              </span>
              {parsedInfo.args.map((a, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 10.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    background: 'var(--bg-primary)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{a.name}</span>
                  <span style={{ color: '#58a6ff' }}> ({a.type})</span>
                  <span style={{ color: 'var(--text-secondary)' }}> = </span>
                  <span style={{ color: '#2da44e' }}>{a.formatted}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Action Button */}
        <div
          style={{
            padding: '6px 14px 10px',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            id="drawer-trace-btn"
            onClick={handleRun}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 6,
              color: '#F7F5EF',
              fontSize: 12,
              fontWeight: 700,
              cursor: isRunning ? 'wait' : 'pointer',
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
              opacity: isRunning ? 0.75 : 1,
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            {isRunning ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>{pyodideLoading ? 'LOADING PYODIDE…' : 'TRACING…'}</span>
              </>
            ) : (
              <>
                <Play size={12} fill="#F7F5EF" />
                <span>TRACE & VISUALIZE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Toast: "Check input & code" notification ──────────────────────── */}
      {toastVisible && (
        <div
          className={toastExiting ? 'toast-exit' : 'toast-enter'}
          onClick={dismissToast}
          style={{
            position: 'fixed',
            bottom: 88,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px',
            background: 'var(--bg-elevated)',
            border: '1px solid rgba(214, 82, 58, 0.55)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 0 0 1px rgba(214,82,58,0.14)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            cursor: 'pointer',
            userSelect: 'none',
            minWidth: 260,
            maxWidth: 340,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(214, 82, 58, 0.15)',
              border: '1px solid rgba(214, 82, 58, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                lineHeight: 1.2,
              }}
            >
              New Code Pasted
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                marginTop: 2,
              }}
            >
              Check your <strong style={{ color: 'var(--text-primary)' }}>input arguments</strong> before visualizing
            </div>
          </div>
          {/* Progress bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              borderRadius: '0 0 10px 10px',
              background: 'rgba(214, 82, 58, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'var(--accent)',
                animation: 'toastProgress 4s linear forwards',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
