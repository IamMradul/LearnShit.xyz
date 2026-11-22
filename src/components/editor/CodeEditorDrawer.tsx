import React, { useState, useMemo } from 'react';
import { X, Code2, Sliders, Play, AlertCircle, Loader2 } from 'lucide-react';
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
    setStdin,
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

  const [inputTab, setInputTab] = useState<'test-input' | 'stdin'>('test-input');

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
        background: '#101216',
        borderRight: '1px solid rgba(247, 245, 239, 0.1)',
        display: 'flex',
        flexDirection: 'column',
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
          background: '#14161b',
          borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
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
              color: '#F7F5EF',
            }}
          >
            Code Editor
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              borderRadius: 4,
              background: isAutoDetecting ? 'rgba(88, 166, 255, 0.18)' : 'rgba(247, 245, 239, 0.08)',
              color: isAutoDetecting ? '#58a6ff' : 'var(--text-secondary)',
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
              background: 'rgba(247, 245, 239, 0.06)',
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
        style={{
          borderTop: '1px solid rgba(247, 245, 239, 0.08)',
          background: '#0e1014',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 240,
        }}
      >
        {/* Tab Header & Mode Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setInputTab('test-input')}
              style={{
                background: 'transparent',
                border: 'none',
                color: inputTab === 'test-input' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: inputTab === 'test-input' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 0',
                borderBottom: inputTab === 'test-input' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Sliders size={12} />
              <span>Test Input</span>
            </button>

            <button
              onClick={() => setInputTab('stdin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: inputTab === 'stdin' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: inputTab === 'stdin' ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 0',
                borderBottom: inputTab === 'stdin' ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <span>Custom Input (stdin)</span>
            </button>
          </div>

          {/* Mode switch */}
          <select
            value={modeOverride}
            onChange={(e) => setModeOverride(e.target.value as 'auto' | 'function' | 'full-program')}
            style={{
              background: 'rgba(247, 245, 239, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              fontSize: 10.5,
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

        {/* Input Textarea */}
        <div
          style={{ padding: '8px 14px', flex: 1, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}
          className={inputHighlighted ? 'input-highlight-pulse' : ''}
        >
          {inputHighlighted && (
            <div style={{ marginBottom: 4 }}>
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
                ✨ New Code Added — Configure Input
              </span>
            </div>
          )}

          {inputTab === 'test-input' ? (
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputHighlighted) setInputHighlighted(false);
              }}
              onFocus={() => {
                if (inputHighlighted) setInputHighlighted(false);
              }}
              placeholder="e.g. [[2, 7, 11, 15], 9] or [1, 2, 3, 4]"
              style={{
                width: '100%',
                height: 65,
                background: '#14161b',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                borderRadius: 6,
                color: '#F7F5EF',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                padding: 8,
                outline: 'none',
                resize: 'none',
              }}
            />
          ) : (
            <textarea
              value={stdin}
              onChange={(e) => {
                setStdin(e.target.value);
                if (inputHighlighted) setInputHighlighted(false);
              }}
              onFocus={() => {
                if (inputHighlighted) setInputHighlighted(false);
              }}
              placeholder="e.g. 3\n1 2\n3 4"
              style={{
                width: '100%',
                height: 65,
                background: '#14161b',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                borderRadius: 6,
                color: '#F7F5EF',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                padding: 8,
                outline: 'none',
                resize: 'none',
              }}
            />
          )}
        </div>

        {/* Parsed Arguments Preview (shown once) */}
        {inputTab === 'test-input' && (
          <>
            {parsedInfo.mismatchError ? (
              <div
                style={{
                  margin: '0 14px 6px',
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'rgba(214, 82, 58, 0.15)',
                  border: '1px solid rgba(214, 82, 58, 0.35)',
                  color: '#ff7b72',
                  fontSize: 10.5,
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
                  margin: '0 14px 6px',
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'rgba(247, 245, 239, 0.04)',
                  border: '1px solid rgba(247, 245, 239, 0.08)',
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
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      border: '1px solid rgba(247, 245, 239, 0.1)',
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
          </>
        )}

        {/* Action Button (Secondary run button) */}
        <div style={{ padding: '0 14px 8px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="drawer-trace-btn"
            onClick={handleRun}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 14px',
              background: 'rgba(247, 245, 239, 0.07)',
              border: '1px solid rgba(247, 245, 239, 0.16)',
              borderRadius: 6,
              color: '#F7F5EF',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: isRunning ? 'wait' : 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.15s ease',
            }}
          >
            {isRunning ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>{pyodideLoading ? 'Loading Pyodide…' : 'Tracing…'}</span>
              </>
            ) : (
              <>
                <Play size={11} fill="#F7F5EF" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
