import React from 'react';
import type { VisuAlgoItem } from './visuAlgoData';
import { Play, GraduationCap, Code2, Sparkles } from 'lucide-react';

interface VisuAlgoCardProps {
  item: VisuAlgoItem;
  onOpenDetail: (item: VisuAlgoItem, mode: 'overview' | 'training') => void;
  onQuickLoad: (item: VisuAlgoItem) => void;
}

export const VisuAlgoCard: React.FC<VisuAlgoCardProps> = ({
  item,
  onOpenDetail,
  onQuickLoad,
}) => {
  const theme = item.themeColor || 'var(--accent)';

  return (
    <div
      onClick={() => onOpenDetail(item, 'overview')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRadius: 14,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.14)',
        cursor: 'pointer',
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 28px rgba(0, 0, 0, 0.22), 0 0 18px ${theme}22`;
        e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.14)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* ── Visual Blueprint Canvas (Dark Industrial) ────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: 145,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 50% 50%, ${theme}18 0%, var(--bg-tertiary) 88%)`,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Subtle background tech grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)',
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
            background: 'var(--surface-glass-strong)',
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
            background: 'var(--surface-glass-strong)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            zIndex: 2,
          }}
        >
          {item.complexity}
        </span>

        {/* SVG Graphic Thumbnail */}
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.renderThumbnail()}
        </div>
      </div>

      {/* ── Card Content Body ────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Title */}
        <h4
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            fontFamily: "'Oswald', sans-serif",
            color: 'var(--text-primary)',
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
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-secondary)',
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
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                fontSize: 9.5,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-secondary)',
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
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Primary Visualize CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickLoad(item);
            }}
            title={`Visualize ${item.title} in editor`}
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
              color: '#FFFFFF',
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
            <Play size={11} fill="#FFFFFF" />
            <span>Visualize</span>
          </button>

          {/* Training Quiz CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(item, 'training');
            }}
            title={`Practice ${item.title} training checkpoint`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '8px 10px',
              borderRadius: 6,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: 11,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-elevated)';
              e.currentTarget.style.borderColor = 'var(--text-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <GraduationCap size={13} />
            <span>Training</span>
          </button>

          {/* Quick Code & Details button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(item, 'overview');
            }}
            title="Inspect source code & complexity breakdown"
            style={{
              width: 33,
              height: 33,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--text-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <Code2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
