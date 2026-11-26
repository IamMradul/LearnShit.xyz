import React, { useState, useEffect, useRef } from 'react';
import type { VisuAlgoItem } from './visuAlgoData';
import { getInteractiveSteps, type InteractiveStep } from './interactiveStepsData';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, GraduationCap, Code2, Shuffle, Loader2 } from 'lucide-react';

interface InteractivePlaygroundCardProps {
  item: VisuAlgoItem;
  isLoading?: boolean;
  onOpenDetail: (item: VisuAlgoItem, mode: 'overview' | 'training') => void;
  onQuickLoad: (item: VisuAlgoItem, customInput?: string) => void;
}

export const InteractivePlaygroundCard: React.FC<InteractivePlaygroundCardProps> = ({
  item,
  isLoading = false,
  onOpenDetail,
  onQuickLoad,
}) => {
  const accentColor = item.themeColor || 'var(--accent)';
  const [currentInput, setCurrentInput] = useState(item.sampleInput);
  const steps: InteractiveStep[] = getInteractiveSteps(item.id, accentColor);

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[stepIdx] || steps[0];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((prev) => (prev + 1) % steps.length);
      }, 1600);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setStepIdx((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setStepIdx((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setStepIdx(0);
  };

  const handleRandomizeInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    let newInput = item.sampleInput;
    if (item.category === 'Sorting' || item.id === 'array') {
      const arr = Array.from({ length: 4 }, () => Math.floor(Math.random() * 80 + 10));
      newInput = item.sampleInput.startsWith('[[') ? `[[${arr.join(', ')}]]` : `[${arr.join(', ')}]`;
    } else if (item.id === 'bitmask') {
      const n = Math.floor(Math.random() * 2 + 3);
      newInput = `[${n}]`;
    } else if (item.category === 'Trees' || item.id === 'binary-heap' || item.id === 'binary-search-tree') {
      const arr = [50, 25, 75, Math.floor(Math.random() * 20 + 5), Math.floor(Math.random() * 20 + 80)];
      newInput = `[${arr.join(', ')}]`;
    } else if (item.category === 'Strings' || item.id === 'suffix-tree' || item.id === 'suffix-array') {
      const words = ['BANANA', 'MISSISSIPPI', 'ALGORITHM', 'ABRACADABRA', 'CODELAB'];
      newInput = `["${words[Math.floor(Math.random() * words.length)]}"]`;
    } else if (item.category === 'Geometry' || item.id === 'convex-hull' || item.id === 'geometry-polygon') {
      const pts = Array.from({ length: 4 }, () => [Math.floor(Math.random() * 8 + 1), Math.floor(Math.random() * 8 + 1)]);
      newInput = JSON.stringify([pts]);
    } else if (item.id === 'linked-list') {
      const vals = Array.from({ length: 4 }, () => Math.floor(Math.random() * 50 + 1));
      newInput = `[${vals.join(', ')}]`;
    } else {
      const vals = Array.from({ length: 4 }, () => Math.floor(Math.random() * 40 + 2));
      newInput = `[${vals.join(', ')}]`;
    }
    setCurrentInput(newInput);
    setStepIdx(0);
    setIsPlaying(false);
  };

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08)',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* ── Architectural Blueprint Stage ──────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: 152,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Subtle fine dot paper backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.45,
            backgroundImage: 'radial-gradient(var(--grid-dot) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            pointerEvents: 'none',
          }}
        />

        {/* Quiet domain label */}
        <span
          style={{
            position: 'absolute',
            top: 11,
            left: 14,
            fontSize: 9.5,
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: accentColor,
            zIndex: 2,
          }}
        >
          {item.category}
        </span>

        {/* Complexity metric */}
        <span
          style={{
            position: 'absolute',
            top: 11,
            right: 14,
            fontSize: 10.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            color: 'var(--text-muted)',
            zIndex: 2,
          }}
        >
          {item.complexity}
        </span>

        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentStep ? currentStep.render() : item.renderThumbnail()}
        </div>
      </div>

      {/* ── Card Body: Clean Editorial Layout ──────────────────────────────── */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 600,
              fontFamily: "'Newsreader', Georgia, serif",
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.title}
          </h3>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 12.5,
              lineHeight: 1.48,
              color: 'var(--text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 37,
            }}
          >
            {stepIdx > 0 || isPlaying ? currentStep.description : item.description}
          </p>
        </div>

        {/* Unified Input + Frame Stepper Control Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 10px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
          }}
        >
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') onQuickLoad(item, currentInput);
            }}
            placeholder="Input..."
            aria-label={`Input for ${item.title}`}
            style={{
              flex: 1,
              minWidth: 0,
              color: 'var(--text-primary)',
              background: 'transparent',
              border: 'none',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
            }}
          />

          <button
            type="button"
            onClick={handleRandomizeInput}
            title="Randomize input"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Shuffle size={11} />
          </button>

          <div style={{ width: 1, height: 14, background: 'var(--border)' }} />

          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: 'var(--text-muted)',
              padding: '0 2px',
              whiteSpace: 'nowrap',
            }}
          >
            {stepIdx + 1}/{steps.length}
          </span>

          <button
            type="button"
            onClick={handlePrev}
            title="Previous frame"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={13} />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause preview' : 'Play preview'}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: isPlaying ? '#276749' : 'var(--accent)',
              border: 'none',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={10} fill="#FFFFFF" /> : <Play size={10} fill="#FFFFFF" />}
          </button>

          <button
            type="button"
            onClick={handleNext}
            title="Next frame"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={13} />
          </button>

          {stepIdx > 0 && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset preview"
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={10} />
            </button>
          )}
        </div>

        {/* Clean Action Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 'auto',
            paddingTop: 4,
          }}
        >
          <button
            type="button"
            onClick={() => onQuickLoad(item, currentInput)}
            disabled={isLoading}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'var(--accent)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 11.5,
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: isLoading ? 'wait' : 'pointer',
              opacity: isLoading ? 0.75 : 1,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Tracing…</span>
              </>
            ) : (
              <>
                <Play size={10} fill="#FFFFFF" />
                <span>Visualize</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenDetail(item, 'training')}
            title={`Practice ${item.title} checkpoint quiz`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '8px 12px',
              borderRadius: 999,
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: 11.5,
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <GraduationCap size={13} />
            <span>Quiz</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDetail(item, 'overview')}
            title="Inspect code & complexity"
            style={{
              width: 34,
              height: 34,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Code2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};
