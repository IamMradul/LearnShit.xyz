import React, { useState, useEffect, useRef } from 'react';
import type { VisuAlgoItem } from './visuAlgoData';
import { getInteractiveSteps, type InteractiveStep } from './interactiveStepsData';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, GraduationCap, Code2, Sparkles } from 'lucide-react';

interface InteractivePlaygroundCardProps {
  item: VisuAlgoItem;
  onOpenDetail: (item: VisuAlgoItem, mode: 'overview' | 'training') => void;
  onQuickLoad: (item: VisuAlgoItem) => void;
}

export const InteractivePlaygroundCard: React.FC<InteractivePlaygroundCardProps> = ({
  item,
  onOpenDetail,
  onQuickLoad,
}) => {
  const theme = item.themeColor || 'var(--accent)';
  const steps: InteractiveStep[] = getInteractiveSteps(item.id, theme);

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[stepIdx] || steps[0];

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIdx((prev) => (prev + 1) % steps.length);
      }, 1600);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#111216',
        borderRadius: 14,
        border: '1px solid rgba(247, 245, 239, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.45)';
        e.currentTarget.style.boxShadow = `0 16px 36px rgba(0, 0, 0, 0.7), 0 0 20px ${theme}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.08)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.45)';
      }}
    >
      {/* ── Top Blueprint Stage (Live Interactive Step Visualizer) ───────────── */}
      <div
        style={{
          width: '100%',
          height: 145,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 50% 50%, ${theme}20 0%, #090a0e 85%)`,
          borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.07,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #F7F5EF 1px, transparent 0)',
            backgroundSize: '16px 16px',
            pointerEvents: 'none',
          }}
        />

        {/* Category Pill Tag */}
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            fontSize: 9.5,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '2.5px 7px',
            borderRadius: 4,
            background: 'rgba(10, 11, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            color: theme,
            border: `1px solid ${theme}40`,
            zIndex: 2,
          }}
        >
          {item.category}
        </span>

        {/* Complexity Chip */}
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            padding: '2.5px 8px',
            borderRadius: 4,
            background: 'rgba(10, 11, 15, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#F7F5EF',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            zIndex: 2,
          }}
        >
          {item.complexity}
        </span>

        {/* SVG Step Visual */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentStep ? currentStep.render() : item.renderThumbnail()}
        </div>
      </div>

      {/* ── Interactive Player Control Strip ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '7px 14px',
          background: 'rgba(20, 23, 30, 0.7)',
          borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isPlaying ? '#38A169' : theme,
              boxShadow: isPlaying ? '0 0 8px #38A169' : 'none',
            }}
          />
          <span style={{ color: '#F7F5EF', fontWeight: 700 }}>
            STEP {stepIdx + 1}/{steps.length}:
          </span>
          <span style={{ color: 'var(--text-secondary)', maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentStep.title}
          </span>
        </div>

        {/* Step Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={handlePrev}
            title="Previous step"
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              color: '#F7F5EF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={13} />
          </button>

          <button
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause animation' : 'Play interactive animation'}
            style={{
              width: 26,
              height: 24,
              borderRadius: 4,
              background: isPlaying ? '#38A169' : 'var(--accent)',
              border: 'none',
              color: '#F7F5EF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {isPlaying ? <Pause size={11} fill="#F7F5EF" /> : <Play size={11} fill="#F7F5EF" />}
          </button>

          <button
            onClick={handleNext}
            title="Next step"
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              color: '#F7F5EF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={13} />
          </button>

          <button
            onClick={handleReset}
            title="Reset step to beginning"
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(247, 245, 239, 0.08)',
              color: '#9B9A95',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>

      {/* ── Active Step Explanation Banner ─────────────────────────────────── */}
      <div
        style={{
          padding: '8px 14px',
          background: 'rgba(10, 11, 15, 0.5)',
          borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
          fontSize: 11.5,
          lineHeight: 1.4,
          fontFamily: "'Inter', sans-serif",
          color: '#d4d2cc',
          minHeight: 38,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {currentStep.description}
      </div>

      {/* ── Card Content Body ────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Title */}
        <h4
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            fontFamily: "'Oswald', sans-serif",
            color: '#F7F5EF',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.title}
        </h4>

        {/* Clamped description */}
        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.45,
            color: 'var(--text-secondary)',
            fontFamily: "'Inter', sans-serif",
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 35,
          }}
        >
          {item.description}
        </p>

        {/* Tags Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(247, 245, 239, 0.08)',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(247, 245, 239, 0.7)',
              fontWeight: 600,
            }}
          >
            S: {item.spaceComplexity}
          </span>
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              style={{
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(247, 245, 239, 0.06)',
                fontSize: 9.5,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-muted)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Button Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            paddingTop: 10,
            borderTop: '1px solid rgba(247, 245, 239, 0.06)',
          }}
        >
          {/* Primary Visualize CTA */}
          <button
            onClick={() => onQuickLoad(item)}
            title={`Visualize ${item.title} in main stage`}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'var(--accent)',
              border: 'none',
              color: '#F7F5EF',
              fontSize: 12,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.boxShadow = '0 0 14px rgba(214, 82, 58, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Play size={11} fill="#F7F5EF" />
            <span>Visualize</span>
          </button>

          {/* Training Quiz CTA */}
          <button
            onClick={() => onOpenDetail(item, 'training')}
            title={`Practice ${item.title} checkpoint quiz`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '8px 10px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              color: '#F7F5EF',
              fontSize: 11,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.12)';
            }}
          >
            <GraduationCap size={13} />
            <span>Training</span>
          </button>

          {/* Quick Code & Details button */}
          <button
            onClick={() => onOpenDetail(item, 'overview')}
            title="Inspect source code & complexity breakdown"
            style={{
              width: 33,
              height: 33,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              color: '#9B9A95',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F7F5EF';
              e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9B9A95';
              e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.12)';
            }}
          >
            <Code2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
