import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { DsaTopic } from '../../data/dsa/dsaData';
import { useUIStore } from '../../store/uiStore';

interface DsaDetailModalProps {
  topic: DsaTopic;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  getComplexityColor: (comp: string) => string;
}

function renderTopicEtching(topicId: string, ink: string, accent: string): React.ReactNode {
  switch (topicId) {
    case 'dynamic-array':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect
                x={26 + i * 42}
                y={82}
                width={36}
                height={42}
                rx={3}
                stroke={i === 3 ? accent : ink}
                strokeOpacity={i === 3 ? 0.9 : 0.45}
                strokeWidth={i === 3 ? 1.5 : 1.1}
              />
              <text
                x={44 + i * 42}
                y={107}
                textAnchor="middle"
                fill={i === 3 ? accent : ink}
                fillOpacity={0.65}
                fontSize={10}
                fontFamily="'JetBrains Mono', monospace"
              >
                a[{i}]
              </text>
            </g>
          ))}
          <path d="M44 62 V78 M152 62 V78" stroke={ink} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 3" />
          <path d="M152 132 C152 158 194 158 194 132" stroke={accent} strokeOpacity={0.65} strokeWidth={1.15} />
          <text x="130" y="182" textAnchor="middle" fill={ink} fillOpacity={0.45} fontSize={9.5} fontFamily="'JetBrains Mono', monospace">
            base + i · sizeof(T)
          </text>
        </svg>
      );

    case 'linked-list':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          {[28, 102, 176].map((x, idx) => (
            <g key={x}>
              <rect
                x={x}
                y={90}
                width={50}
                height={34}
                rx={4}
                stroke={idx === 1 ? accent : ink}
                strokeOpacity={idx === 1 ? 0.9 : 0.45}
                strokeWidth={1.2}
              />
              <line x1={x + 33} y1={90} x2={x + 33} y2={124} stroke={ink} strokeOpacity={0.35} strokeWidth={1} />
              <circle cx={x + 41.5} cy={107} r={2.2} fill={ink} fillOpacity={0.65} />
              {idx < 2 && (
                <path
                  d={`M${x + 44} 107 H${x + 71}`}
                  stroke={idx === 0 ? accent : ink}
                  strokeOpacity={0.7}
                  strokeWidth={1.2}
                />
              )}
            </g>
          ))}
          <path d="M53 60 C53 40 127 40 127 86" stroke={ink} strokeOpacity={0.32} strokeWidth={1} strokeDasharray="3 3" />
          <text x="236" y="110" fill={ink} fillOpacity={0.45} fontSize={9.5} fontFamily="'JetBrains Mono', monospace">
            ∅
          </text>
        </svg>
      );

    case 'stack':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <path d="M88 46 V176 H172 V46" stroke={ink} strokeOpacity={0.45} strokeWidth={1.25} />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={98}
              y={140 - i * 32}
              width={64}
              height={24}
              rx={3}
              stroke={i === 2 ? accent : ink}
              strokeOpacity={i === 2 ? 0.9 : 0.42}
              strokeWidth={1.2}
            />
          ))}
          <path d="M130 34 V70 M124 62 L130 70 L136 62" stroke={accent} strokeOpacity={0.85} strokeWidth={1.25} />
          <text x="198" y="88" fill={ink} fillOpacity={0.5} fontSize={9.5} fontFamily="'JetBrains Mono', monospace">
            top
          </text>
        </svg>
      );

    case 'queue-deque':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <circle cx="130" cy="110" r="64" stroke={ink} strokeOpacity={0.28} strokeWidth={1.1} />
          <circle cx="130" cy="110" r="36" stroke={ink} strokeOpacity={0.22} strokeWidth={1} strokeDasharray="3 3" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={130 + 36 * Math.cos(rad)}
                y1={110 + 36 * Math.sin(rad)}
                x2={130 + 64 * Math.cos(rad)}
                y2={110 + 64 * Math.sin(rad)}
                stroke={idx === 1 || idx === 6 ? accent : ink}
                strokeOpacity={idx === 1 || idx === 6 ? 0.85 : 0.3}
                strokeWidth={1.15}
              />
            );
          })}
          <text x="40" y="54" fill={ink} fillOpacity={0.5} fontSize={9.5} fontFamily="'JetBrains Mono', monospace">
            head
          </text>
          <text x="196" y="172" fill={accent} fillOpacity={0.8} fontSize={9.5} fontFamily="'JetBrains Mono', monospace">
            tail
          </text>
        </svg>
      );

    case 'hash-table':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={122} y={48 + i * 34} width={44} height={24} rx={2} stroke={i === 1 ? accent : ink} strokeOpacity={0.48} strokeWidth={1.1} />
              <line x1={166} y1={60 + i * 34} x2={198} y2={60 + i * 34} stroke={ink} strokeOpacity={0.35} strokeWidth={1} />
              <circle cx={206} cy={60 + i * 34} r={7} stroke={i === 1 ? accent : ink} strokeOpacity={0.48} strokeWidth={1.1} />
            </g>
          ))}
          <text x="36" y="102" fill={ink} fillOpacity={0.65} fontSize={10.5} fontFamily="'JetBrains Mono', monospace">
            h(key)
          </text>
          <path d="M78 98 C98 98 96 94 118 94" stroke={accent} strokeOpacity={0.85} strokeWidth={1.25} />
        </svg>
      );

    case 'bst':
    case 'balanced-bst':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <line x1="130" y1="48" x2="78" y2="98" stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <line x1="130" y1="48" x2="182" y2="98" stroke={accent} strokeOpacity={0.75} strokeWidth={1.3} />
          <line x1="78" y1="98" x2="52" y2="152" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          <line x1="78" y1="98" x2="104" y2="152" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          <line x1="182" y1="98" x2="156" y2="152" stroke={accent} strokeOpacity={0.65} strokeWidth={1.2} />
          <line x1="182" y1="98" x2="208" y2="152" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          {[
            { x: 130, y: 48, r: 13, hl: true },
            { x: 78, y: 98, r: 12, hl: false },
            { x: 182, y: 98, r: 12, hl: true },
            { x: 52, y: 152, r: 10, hl: false },
            { x: 104, y: 152, r: 10, hl: false },
            { x: 156, y: 152, r: 10, hl: true },
            { x: 208, y: 152, r: 10, hl: false },
          ].map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} stroke={n.hl ? accent : ink} strokeOpacity={n.hl ? 0.9 : 0.45} strokeWidth={1.2} fill="none" />
          ))}
          {topicId === 'balanced-bst' && (
            <path d="M110 38 C124 22 142 22 152 38" stroke={accent} strokeOpacity={0.65} strokeWidth={1} strokeDasharray="2.5 2.5" />
          )}
        </svg>
      );

    case 'binary-heap':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <line x1="130" y1="42" x2="86" y2="88" stroke={accent} strokeOpacity={0.75} strokeWidth={1.25} />
          <line x1="130" y1="42" x2="174" y2="88" stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <circle cx="130" cy="42" r="13" stroke={accent} strokeOpacity={0.9} strokeWidth={1.3} />
          <circle cx="86" cy="88" r="11" stroke={accent} strokeOpacity={0.65} strokeWidth={1.15} />
          <circle cx="174" cy="88" r="11" stroke={ink} strokeOpacity={0.45} strokeWidth={1.1} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={42 + i * 36}
              y={144}
              width={32}
              height={26}
              rx={2}
              stroke={i === 0 ? accent : ink}
              strokeOpacity={0.45}
              strokeWidth={1.1}
            />
          ))}
        </svg>
      );

    case 'trie':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <line x1="130" y1="36" x2="82" y2="88" stroke={ink} strokeOpacity={0.42} strokeWidth={1.1} />
          <line x1="130" y1="36" x2="178" y2="88" stroke={accent} strokeOpacity={0.75} strokeWidth={1.25} />
          <line x1="82" y1="88" x2="64" y2="144" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          <line x1="178" y1="88" x2="152" y2="144" stroke={accent} strokeOpacity={0.7} strokeWidth={1.25} />
          <line x1="178" y1="88" x2="204" y2="144" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          {[
            { x: 130, y: 36, lbl: '*' },
            { x: 82, y: 88, lbl: 'a' },
            { x: 178, y: 88, lbl: 't' },
            { x: 64, y: 144, lbl: 'n' },
            { x: 152, y: 144, lbl: 'r' },
            { x: 204, y: 144, lbl: 'o' },
          ].map((n, i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={11} stroke={i === 2 || i === 4 ? accent : ink} strokeOpacity={0.6} strokeWidth={1.15} fill="none" />
              <text x={n.x} y={n.y + 3.5} textAnchor="middle" fill={ink} fillOpacity={0.72} fontSize={10} fontFamily="'JetBrains Mono', monospace">
                {n.lbl}
              </text>
            </g>
          ))}
        </svg>
      );

    case 'dsu-union-find':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <circle cx="88" cy="110" r="48" stroke={ink} strokeOpacity={0.28} strokeWidth={1.1} strokeDasharray="3 3" />
          <circle cx="172" cy="110" r="42" stroke={accent} strokeOpacity={0.55} strokeWidth={1.15} strokeDasharray="4 3" />
          <circle cx="84" cy="96" r="10" stroke={ink} strokeOpacity={0.55} strokeWidth={1.2} />
          <circle cx="64" cy="128" r="8" stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <circle cx="108" cy="128" r="8" stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <line x1="68" y1="121" x2="79" y2="104" stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <line x1="103" y1="121" x2="90" y2="104" stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <circle cx="172" cy="96" r="10" stroke={accent} strokeOpacity={0.85} strokeWidth={1.25} />
          <circle cx="172" cy="132" r="8" stroke={accent} strokeOpacity={0.6} strokeWidth={1.1} />
          <line x1="172" y1="124" x2="172" y2="106" stroke={accent} strokeOpacity={0.7} strokeWidth={1.15} />
        </svg>
      );

    case 'segment-fenwick-tree':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <rect x="44" y="48" width="172" height="22" rx={3} stroke={ink} strokeOpacity={0.45} strokeWidth={1.1} />
          <rect x="44" y="84" width="82" height="22" rx={3} stroke={accent} strokeOpacity={0.85} strokeWidth={1.25} />
          <rect x="134" y="84" width="82" height="22" rx={3} stroke={ink} strokeOpacity={0.45} strokeWidth={1.1} />
          <rect x="44" y="120" width="38" height="22" rx={3} stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <rect x="88" y="120" width="38" height="22" rx={3} stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <rect x="134" y="120" width="38" height="22" rx={3} stroke={accent} strokeOpacity={0.85} strokeWidth={1.25} />
          <rect x="178" y="120" width="38" height="22" rx={3} stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <line x1="44" y1="164" x2="216" y2="164" stroke={ink} strokeOpacity={0.28} strokeWidth={1} />
        </svg>
      );

    case 'merge-sort':
    case 'quick-sort':
    case 'elementary-sorts':
    case 'counting-radix-sort':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          {[32, 68, 46, 98, 54, 118, 82].map((h, i) => (
            <rect
              key={i}
              x={38 + i * 27}
              y={172 - h}
              width={18}
              height={h}
              rx={2}
              stroke={i === 3 || i === 5 ? accent : ink}
              strokeOpacity={i === 3 || i === 5 ? 0.9 : 0.42}
              strokeWidth={1.2}
            />
          ))}
          <path d="M96 42 C116 26 146 26 164 42" stroke={accent} strokeOpacity={0.65} strokeWidth={1.1} strokeDasharray="3 3" />
          <line x1="30" y1="176" x2="230" y2="176" stroke={ink} strokeOpacity={0.25} strokeWidth={1} />
        </svg>
      );

    case 'binary-search':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <line x1="28" y1="112" x2="232" y2="112" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          {[36, 76, 130, 184, 224].map((x, i) => (
            <line key={x} x1={x} y1={104} x2={x} y2={120} stroke={i === 2 ? accent : ink} strokeOpacity={0.6} strokeWidth={1.2} />
          ))}
          <circle cx="130" cy="112" r="14" stroke={accent} strokeOpacity={0.85} strokeWidth={1.3} />
          <path d="M130 56 V92" stroke={accent} strokeOpacity={0.8} strokeWidth={1.2} />
          <text x="130" y="48" textAnchor="middle" fill={accent} fontSize={10} fontFamily="'JetBrains Mono', monospace">
            mid
          </text>
        </svg>
      );

    case 'graph-bfs-dfs':
    case 'shortest-paths':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <line x1="48" y1="110" x2="108" y2="56" stroke={accent} strokeOpacity={0.8} strokeWidth={1.3} />
          <line x1="48" y1="110" x2="108" y2="164" stroke={ink} strokeOpacity={0.38} strokeWidth={1.1} />
          <line x1="108" y1="56" x2="172" y2="56" stroke={accent} strokeOpacity={0.8} strokeWidth={1.3} />
          <line x1="108" y1="164" x2="172" y2="164" stroke={ink} strokeOpacity={0.38} strokeWidth={1.1} />
          <line x1="172" y1="56" x2="212" y2="110" stroke={accent} strokeOpacity={0.8} strokeWidth={1.3} />
          <line x1="172" y1="164" x2="212" y2="110" stroke={ink} strokeOpacity={0.38} strokeWidth={1.1} />
          <line x1="108" y1="56" x2="172" y2="164" stroke={ink} strokeOpacity={0.25} strokeWidth={1} strokeDasharray="3 3" />
          {[
            { x: 48, y: 110, hl: true },
            { x: 108, y: 56, hl: true },
            { x: 108, y: 164, hl: false },
            { x: 172, y: 56, hl: true },
            { x: 172, y: 164, hl: false },
            { x: 212, y: 110, hl: true },
          ].map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="10" stroke={p.hl ? accent : ink} strokeOpacity={p.hl ? 0.9 : 0.45} strokeWidth={1.25} fill="none" />
          ))}
        </svg>
      );

    case 'dynamic-programming':
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => {
              const active = (r === 2 && c === 2) || (r === 1 && c === 2) || (r === 2 && c === 1);
              return (
                <rect
                  key={`${r}-${c}`}
                  x={58 + c * 36}
                  y={42 + r * 34}
                  width={32}
                  height={30}
                  rx={2}
                  stroke={active ? accent : ink}
                  strokeOpacity={active ? 0.85 : 0.35}
                  strokeWidth={active ? 1.35 : 1}
                />
              );
            }),
          )}
          <path d="M126 125 L140 125 M146 104 L146 116" stroke={accent} strokeOpacity={0.85} strokeWidth={1.2} />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 260 220" width="100%" height="100%" fill="none">
          <circle cx="130" cy="46" r="10" stroke={accent} strokeOpacity={0.85} strokeWidth={1.25} />
          <line x1="130" y1="56" x2="78" y2="104" stroke={accent} strokeOpacity={0.75} strokeWidth={1.2} />
          <line x1="130" y1="56" x2="182" y2="104" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          <circle cx="78" cy="112" r="9" stroke={accent} strokeOpacity={0.75} strokeWidth={1.2} />
          <circle cx="182" cy="112" r="9" stroke={ink} strokeOpacity={0.4} strokeWidth={1.1} />
          <line x1="78" y1="121" x2="52" y2="164" stroke={ink} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 3" />
          <line x1="78" y1="121" x2="106" y2="164" stroke={accent} strokeOpacity={0.85} strokeWidth={1.25} />
          <circle cx="52" cy="172" r="8" stroke={ink} strokeOpacity={0.35} strokeWidth={1.1} />
          <circle cx="106" cy="172" r="8" stroke={accent} strokeOpacity={0.9} strokeWidth={1.3} />
        </svg>
      );
  }
}

export const DsaDetailModal: React.FC<DsaDetailModalProps> = ({
  topic,
  currentIndex,
  totalCount,
  onClose,
  onPrev,
  onNext,
  getComplexityColor,
}) => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onPrev, onNext]);

  const cardBg = isLight ? '#F4F2EC' : '#12141A';
  const ink = isLight ? '#181A1F' : '#EAE6DC';
  const subInk = isLight ? '#5E5D58' : '#9B9992';
  const monogramBg = isLight ? '#14161B' : '#F4F2EC';
  const monogramFg = isLight ? '#F7F5EF' : '#101216';
  const ctaBg = isLight ? '#141716' : '#F4F2EC';
  const ctaFg = isLight ? '#F7F5EF' : '#101216';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={topic.name}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        background: isLight ? 'rgba(20, 22, 27, 0.34)' : 'rgba(5, 6, 9, 0.72)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'dsaBackdropFade 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <div
        key={topic.id}
        onClick={(e) => e.stopPropagation()}
        className="dsa-popup-card"
        style={{
          width: '100%',
          maxWidth: 940,
          background: cardBg,
          border: '1px solid var(--border)',
          borderRadius: 18,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isLight
            ? '0 28px 70px rgba(16, 18, 22, 0.16), 0 4px 16px rgba(16, 18, 22, 0.06)'
            : '0 32px 80px rgba(0, 0, 0, 0.65)',
          animation: 'dsaCardFadeIn 0.36s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
      >
        <style>{`
          .dsa-popup-grid {
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            align-items: stretch;
          }
          @media (max-width: 760px) {
            .dsa-popup-grid {
              grid-template-columns: 1fr;
            }
          }
          @keyframes dsaBackdropFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes dsaCardFadeIn {
            from {
              opacity: 0;
              transform: translateY(14px) scale(0.975);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes dsaContentFade {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Close Button */}
        <button
          type="button"
          aria-label="Close card"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            zIndex: 4,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: subInk,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={15} />
        </button>

        <div className="dsa-popup-grid">
          {/* ── Left Editorial Column ── */}
          <div
            style={{
              padding: 'clamp(26px, 4vw, 42px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              animation: 'dsaContentFade 0.42s cubic-bezier(0.16, 1, 0.3, 1) 50ms both',
            }}
          >
            {/* Title */}
            <div>
              <h2
                style={{
                  margin: '0 0 14px',
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontSize: 'clamp(1.65rem, 2.5vw, 2.15rem)',
                  fontWeight: 500,
                  lineHeight: 1.12,
                  letterSpacing: '-0.02em',
                  color: ink,
                }}
              >
                {topic.name}
              </h2>

              {/* Monogram + Category mark (mirroring crisp editorial badge) */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: monogramBg,
                    color: monogramFg,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {topic.monogram}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 500,
                    color: ink,
                  }}
                >
                  {topic.category}
                </span>
                <span style={{ color: subInk, fontSize: 12 }}>·</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: subInk,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {topic.kind === 'data-structure' ? 'Structure' : 'Algorithm'}
                </span>
              </div>
            </div>

            {/* Serif Insight Pull-Quote */}
            <p
              style={{
                margin: 0,
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: 17.5,
                lineHeight: 1.54,
                color: ink,
                opacity: 0.9,
              }}
            >
              “{topic.insight}”
            </p>

            {/* Operations Table: Time & Space for each basic operation */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 0.9fr',
                  gap: 10,
                  paddingBottom: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: subInk,
                }}
              >
                <span>Basic Operation</span>
                <span>Time</span>
                <span style={{ textAlign: 'right' }}>Space</span>
              </div>

              {topic.operations.map((op, i) => (
                <div
                  key={op.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 0.9fr',
                    gap: 10,
                    padding: '6.5px 0',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: 12.5,
                    alignItems: 'baseline',
                    borderBottom: i === topic.operations.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <span style={{ color: ink, opacity: 0.85, fontWeight: 500 }}>{op.name}</span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: getComplexityColor(op.time),
                    }}
                  >
                    {op.time}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11.5,
                      color: ink,
                      textAlign: 'right',
                    }}
                  >
                    {op.space}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer Attribution + Pill CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginTop: 'auto',
                paddingTop: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: ink }}>
                  Aux Space: {topic.spaceComplexity}
                </div>
                <div style={{ fontSize: 11, color: subInk }}>
                  Worst: {topic.timeComplexity.worst} · Best: {topic.timeComplexity.best}
                </div>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  aria-label="Previous topic"
                  onClick={onPrev}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: ink,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 18px',
                    borderRadius: 999,
                    border: 'none',
                    background: ctaBg,
                    color: ctaFg,
                    fontFamily: "'Inter Tight', 'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                  }}
                >
                  <span>Next ({currentIndex + 1}/{totalCount})</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Architectural Line-Art Etching Column ── */}
          <div
            style={{
              padding: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: isLight
                ? 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.45) 0%, rgba(244,242,236,0) 75%)'
                : 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.03) 0%, rgba(18,20,26,0) 75%)',
              animation: 'dsaContentFade 0.52s cubic-bezier(0.16, 1, 0.3, 1) 110ms both',
            }}
          >
            <div style={{ width: '100%', maxWidth: 280, height: 240 }}>
              {renderTopicEtching(topic.id, ink, 'var(--accent)')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
