import React, { useState, useEffect, useRef } from 'react';
import { useTraceStore } from '../../store/traceStore';
import {
  Volume2,
  VolumeX,
  Sparkles,
  BarChart2,
  MoreHorizontal,
} from 'lucide-react';
import { ProfilerModal } from '../profiler/ProfilerModal';

export const WalkthroughExplainer: React.FC = () => {
  const { steps, currentIndex } = useTraceStore();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isProfilerOpen, setIsProfilerOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(currentIndex);

  // Close overflow menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentStep = steps[currentIndex] || null;

  // Generate intelligent explanation of the current step
  const explanation = React.useMemo(() => {
    if (!currentStep) return 'Press Play or Step forward to trace the algorithm execution.';

    if (currentStep.mutations && currentStep.mutations.length > 0) {
      const m = currentStep.mutations[0];
      if (m.description) return m.description;

      if (m.op === 'compare') {
        const idxStr = m.highlightIndices ? m.highlightIndices.join(' and ') : 'elements';
        return `Comparing values at index ${idxStr} to determine ordering.`;
      }
      if (m.op === 'swap') {
        const idxStr = m.highlightIndices ? m.highlightIndices.join(' and ') : 'elements';
        return `Condition met: swapping values at index ${idxStr} to adjust sequence.`;
      }
      if (m.op === 'set') {
        return `Writing updated value to array index or variable ${m.varName || ''}.`;
      }
      return `Executing ${m.op} operation on structure ${m.varName || ''}.`;
    }

    if (currentStep.event === 'call') {
      const frame = currentStep.callStack?.[currentStep.callStack.length - 1];
      const fn = frame?.name || 'function';
      return `Invoking stack frame '${fn}' at line ${currentStep.line}.`;
    }

    if (currentStep.event === 'return') {
      return `Exiting stack frame: returning control to parent caller at line ${currentStep.line}.`;
    }

    return `Executing statement on line ${currentStep.line}.`;
  }, [currentStep]);

  // Audio narration with Web Speech API
  useEffect(() => {
    if (!isAudioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (prevIndexRef.current !== currentIndex && explanation) {
      window.speechSynthesis.cancel(); // cancel previous utterance
      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.rate = 1.15;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex, isAudioEnabled, explanation]);

  const toggleAudio = () => {
    if (isAudioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '8px 14px',
          background: 'rgba(16, 18, 22, 0.92)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(247, 245, 239, 0.08)',
          fontSize: 12,
          color: '#F7F5EF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Sparkles size={14} style={{ color: '#D6523A', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: 'rgba(247, 245, 239, 0.9)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {explanation}
          </span>
        </div>

        {/* Overflow Menu: Voice & Profiler */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="More Options (Voice Narration & Runtime Profiler)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 8px',
              borderRadius: 6,
              background: showMenu ? 'rgba(247, 245, 239, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                right: 0,
                background: '#14161b',
                border: '1px solid rgba(247, 245, 239, 0.15)',
                borderRadius: 8,
                padding: '4px 0',
                minWidth: 165,
                zIndex: 60,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            >
              {/* Voice Walkthrough Toggle */}
              <button
                onClick={() => {
                  toggleAudio();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: isAudioEnabled ? 'var(--accent)' : '#F7F5EF',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {isAudioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span>Voice Walkthrough</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 9.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: isAudioEnabled ? 'rgba(214, 82, 58, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isAudioEnabled ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {isAudioEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Runtime Profiler Trigger */}
              <button
                onClick={() => {
                  setIsProfilerOpen(true);
                  setShowMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#F7F5EF',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <BarChart2 size={13} style={{ color: '#2ed573' }} />
                <span>Runtime Profiler</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfilerModal isOpen={isProfilerOpen} onClose={() => setIsProfilerOpen(false)} />
    </>
  );
};
