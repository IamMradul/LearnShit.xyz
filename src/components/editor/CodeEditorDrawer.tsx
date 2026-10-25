import React, { useState } from 'react';
import { X, Code2, Sliders, Terminal, Play, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { CodeEditor } from './CodeEditor';
import { detectMode } from '../../engine/ModeDetector';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';

export const CodeEditorDrawer: React.FC = () => {
  const { isCodeEditorOpen, toggleCodeEditor } = useUIStore();
  const {
    language,
    code,
    input,
    setInput,
    modeOverride,
    setModeOverride,
    isAutoDetecting,
    setIsAutoDetecting,
  } = useEditorStore();
  const { setResult, setRunning, setError, isRunning, error } = useTraceStore();

  const [activeTab, setActiveTab] = useState<'input' | 'console'>('input');

  const detected = detectMode(code, language);
  const effectiveMode = modeOverride === 'auto' ? detected : modeOverride;

  const handleRun = async () => {
    if (isRunning) return;
    if (!code.trim()) {
      setError('Please paste or write your algorithm code in the editor.');
      return;
    }
    setRunning(true);
    setError(null);
    try {
      const adapter = getAdapter(language);
      const result = await adapter.trace({
        code,
        input,
        mode: modeOverride,
        maxSteps: 5000,
        timeoutMs: 10000,
        language,
      });
      setResult(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setRunning(false);
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
            Source Code
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
          maxHeight: 220,
        }}
      >
        {/* Tab Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
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
              background: 'rgba(247, 245, 239, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
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

        {/* Input Textarea */}
        <div style={{ padding: '8px 14px', flex: 1 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. [[64, 34, 25, 12, 22, 11, 90]]"
            style={{
              width: '100%',
              height: 70,
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
        </div>

        {/* Action Button */}
        <div style={{ padding: '0 14px 10px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
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
              cursor: 'pointer',
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
            }}
          >
            <Play size={12} fill="#F7F5EF" />
            TRACE & VISUALIZE
          </button>
        </div>
      </div>
    </div>
  );
};
