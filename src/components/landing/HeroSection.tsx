import React, { useState, useEffect } from 'react';
import { HeroAnimatedBG } from './HeroAnimatedBG';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { useUIStore } from '../../store/uiStore';
import { ALGORITHM_PRESETS } from '../../engine/presets';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import { Code2, Activity, ArrowDown } from 'lucide-react';

/* ─── Accent Mark SVG (Industrial Gyroscope) ─────────────────────── */
function AccentMark() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <circle
        cx="26"
        cy="26"
        r="23"
        stroke="#D6523A"
        strokeWidth="1.6"
        strokeDasharray="98.3 46.3"
        transform="rotate(2.5 26 26)"
      />
      <g stroke="#D6523A" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="26.5" cy="26.1" r="2.3" />
        <path d="M28.9 27.6C31.6 29 32.9 31.2 31.8 33.3 30.7 35.4 27.2 36.1 24.2 35.1" />
      </g>
    </svg>
  );
}

/* ─── HeroSection ────────────────────────────────────────────────── */
export function HeroSection({
  onEnterApp,
  onOpenResources: _onOpenResources,
}: {
  onEnterApp: () => void;
  onOpenResources?: (tab?: 'sheets' | 'books') => void;
}) {
  const { setCode, setInput, language } = useEditorStore();
  const { setResult, setRunning, setError } = useTraceStore();
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  // Mini live preview animation state
  const [activeBarIndex, setActiveBarIndex] = useState(2);
  const [comparingIndex, setComparingIndex] = useState(3);

  // Cycle a small animation on the right card preview
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBarIndex((prev) => (prev + 1) % 7);
      setComparingIndex((prev) => ((prev + 1) % 6) + 1);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPreset = async (presetId: string) => {
    const preset = ALGORITHM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const langData = preset.languages[language] ?? preset.languages.javascript;
    if (langData) {
      setCode(langData.code);
      setInput(langData.input);
      useUIStore.getState().setCenterViewMode('ds');

      setRunning(true);
      setError(null);
      try {
        const adapter = getAdapter(language);
        const res = await adapter.trace({
          code: langData.code,
          input: langData.input,
          mode: 'auto',
          maxSteps: 5000,
          timeoutMs: 10000,
          language,
        });
        setResult(res);
      } catch (err) {
        setError(String(err));
      } finally {
        setRunning(false);
      }
    }
    onEnterApp();
  };

  const cardInnerBg = isLight ? '#F8F6F0' : '#0d0f13';
  const cardSpecBg = isLight ? '#FDFBF7' : '#101216';
  const cardBorder = isLight ? 'rgba(16, 18, 22, 0.12)' : 'rgba(247, 245, 239, 0.1)';
  const cardRowBorder = isLight ? 'rgba(16, 18, 22, 0.08)' : 'rgba(247, 245, 239, 0.08)';
  const greenTone = isLight ? '#237A4B' : '#38A169';
  const amberTone = isLight ? '#B7791F' : '#E5A93C';

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Display';
          src: local('Impact'), local('Oswald ExtraBold'), local('Bebas Neue');
          font-weight: 800;
          font-display: swap;
        }

        .hero-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: ${isLight ? '#F7F5EF' : '#0a0b0d'};
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 32px 32px;
          box-sizing: border-box;
          transition: background 0.3s ease;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background: ${
            isLight
              ? 'radial-gradient(ellipse 46% 38% at 50% 42%, rgba(247, 245, 239, 0.62) 0%, rgba(247, 245, 239, 0.22) 62%, rgba(236, 234, 227, 0.45) 100%), linear-gradient(to bottom, rgba(247,245,239,0.78) 0%, rgba(247,245,239,0.06) 26%, rgba(247,245,239,0.16) 80%, #F7F5EF 100%)'
              : 'radial-gradient(circle at 50% 50%, rgba(10, 11, 13, 0.4) 0%, rgba(10, 11, 13, 0.92) 80%), linear-gradient(to bottom, rgba(10,11,13,0.85) 0%, rgba(10,11,13,0.3) 25%, rgba(10,11,13,0.6) 80%, #0a0b0d 100%)'
          };
        }

        .hero-nav-ticker {
          display: flex;
          align-items: center;
          gap: 10px;
          background: ${isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(16, 18, 22, 0.7)'};
          border: 1px solid ${isLight ? 'rgba(16, 18, 22, 0.12)' : 'rgba(247, 245, 239, 0.08)'};
          border-radius: 20px;
          padding: 6px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-secondary);
          backdrop-filter: blur(10px);
          box-shadow: ${isLight ? '0 2px 10px rgba(16, 18, 22, 0.05)' : 'none'};
        }

        .hero-nav-ticker .pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${greenTone};
          box-shadow: 0 0 8px ${greenTone};
        }

        /* ── Main Widescreen Grid ── */
        .hero-widescreen-grid {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: 340px 1fr 340px;
          gap: 32px;
          align-items: center;
          width: 100%;
          max-width: 1600px;
          margin: auto;
          padding: 10px 0;
        }

        @media (max-width: 1380px) {
          .hero-widescreen-grid {
            grid-template-columns: 290px 1fr 290px;
            gap: 20px;
          }
        }

        @media (max-width: 1100px) {
          .hero-widescreen-grid {
            grid-template-columns: 1fr;
            max-width: 640px;
            text-align: center;
          }
          .hero-flank-card {
            display: none !important;
          }
        }

        /* ── Flank Cards (Left & Right) ── */
        .hero-flank-card {
          background: ${isLight ? '#FCFBF8' : 'rgba(16, 18, 22, 0.85)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${cardBorder};
          border-radius: 14px;
          overflow: hidden;
          box-shadow: ${
            isLight
              ? '0 14px 36px rgba(16, 18, 22, 0.08), 0 2px 6px rgba(16, 18, 22, 0.04)'
              : '0 20px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.03)'
          };
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
        }

        .hero-flank-card:hover {
          transform: translateY(-4px);
          border-color: ${isLight ? 'rgba(16, 18, 22, 0.22)' : 'rgba(247, 245, 239, 0.25)'};
        }

        .card-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: ${isLight ? 'rgba(16, 18, 22, 0.03)' : 'rgba(247, 245, 239, 0.03)'};
          border-bottom: 1px solid ${cardRowBorder};
        }

        .window-dots {
          display: flex;
          gap: 6px;
        }

        .window-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .card-title-pill {
          font-family: "'JetBrains Mono', monospace";
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-badge {
          font-family: "'JetBrains Mono', monospace";
          font-size: 9px;
          background: rgba(214, 82, 58, 0.14);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        /* ── Center Stage ── */
        .hero-center-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 16px;
        }

        .hero-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-eyebrow::before,
        .hero-eyebrow::after {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: ${isLight ? 'rgba(16, 18, 22, 0.22)' : 'rgba(247, 245, 239, 0.25)'};
        }

        .hero-headline-title {
          font-family: 'Display', 'Oswald', sans-serif;
          font-size: clamp(48px, 6.2vw, 84px);
          line-height: 0.95;
          font-weight: 800;
          letter-spacing: -0.015em;
          text-transform: uppercase;
          color: ${isLight ? '#101216' : '#F7F5EF'};
          margin: 0;
          text-shadow: ${isLight ? 'none' : '0 16px 40px rgba(0, 0, 0, 0.8)'};
        }

        .hero-headline-title span {
          display: block;
        }

        .hero-accent-mark-wrapper {
          width: 48px;
          height: 48px;
          margin: 18px 0;
          animation: gyroSpin 20s linear infinite;
        }

        @keyframes gyroSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-main-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: #FFFFFF;
          border: 1px solid ${isLight ? 'rgba(214, 82, 58, 0.4)' : 'rgba(255, 255, 255, 0.2)'};
          border-radius: 40px;
          padding: 13px 34px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: ${
            isLight
              ? '0 10px 26px rgba(214, 82, 58, 0.28)'
              : '0 8px 28px rgba(214, 82, 58, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          };
          transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-main-cta:hover {
          transform: translateY(-2px) scale(1.02);
          background: #e05e46;
          box-shadow: ${
            isLight
              ? '0 14px 32px rgba(214, 82, 58, 0.36)'
              : '0 12px 36px rgba(214, 82, 58, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          };
        }

        .hero-hint-shortcuts {
          font-family: "'JetBrains Mono', monospace";
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kbd-chip {
          background: ${isLight ? 'rgba(16, 18, 22, 0.06)' : 'rgba(247, 245, 239, 0.08)'};
          border: 1px solid ${isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.15)'};
          border-radius: 4px;
          padding: 1px 6px;
          color: var(--text-secondary);
          font-size: 10px;
        }

        /* ── Bottom Ribbon ── */
        .hero-bottom-shelf {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid ${cardRowBorder};
        }

        .shelf-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .shelf-presets {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }

        .preset-pill {
          background: ${isLight ? 'rgba(255, 255, 255, 0.78)' : 'rgba(16, 18, 22, 0.7)'};
          border: 1px solid ${isLight ? 'rgba(16, 18, 22, 0.12)' : 'rgba(247, 245, 239, 0.1)'};
          border-radius: 20px;
          padding: 5px 14px;
          color: var(--text-secondary);
          font-family: "'JetBrains Mono', monospace";
          font-size: 11px;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preset-pill:hover {
          background: ${isLight ? '#FFFFFF' : 'rgba(247, 245, 239, 0.1)'};
          color: var(--text-primary);
          border-color: ${isLight ? 'rgba(16, 18, 22, 0.28)' : 'rgba(247, 245, 239, 0.3)'};
          transform: translateY(-1px);
          box-shadow: ${isLight ? '0 4px 12px rgba(16, 18, 22, 0.08)' : 'none'};
        }
      `}</style>

      <div className="hero-root">
        {/* Animated Sorting Background across full canvas */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <HeroAnimatedBG />
        </div>

        {/* Ambient Gradient Layer */}
        <div className="hero-bg-overlay" />

        {/* ── 3-Column Full-Widescreen Stage ── */}
        <main className="hero-widescreen-grid">
          {/* LEFT FLANK: Live Interactive Code Terminal */}
          <aside className="hero-flank-card">
            <div className="card-header-bar">
              <div className="window-dots">
                <span className="window-dot" style={{ background: '#FF5F56' }} />
                <span className="window-dot" style={{ background: '#FFBD2E' }} />
                <span className="window-dot" style={{ background: '#27C93F' }} />
              </div>
              <div className="card-title-pill">
                <Code2 size={12} style={{ color: 'var(--accent)' }} />
                <span>bubble_sort.js</span>
              </div>
              <span className="card-badge">JS ES2024</span>
            </div>

            {/* Code Content */}
            <div
              style={{
                padding: '14px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                lineHeight: 1.6,
                background: cardInnerBg,
                color: isLight ? '#24292f' : '#F7F5EF',
              }}
            >
              <div style={{ color: 'var(--text-muted)' }}>// Zero-backend AST execution</div>
              <div>
                <span style={{ color: '#D6523A' }}>function</span>{' '}
                <span style={{ color: amberTone }}>bubbleSort</span>(
                <span>arr</span>) &#123;
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: '#D6523A' }}>const</span> n = arr.length;
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: '#D6523A' }}>for</span> (
                <span style={{ color: '#D6523A' }}>let</span> i = 0; i &lt; n; i++) &#123;
              </div>
              <div style={{ paddingLeft: 24 }}>
                <span style={{ color: '#D6523A' }}>for</span> (
                <span style={{ color: '#D6523A' }}>let</span> j = 0; j &lt; n - i - 1; j++) &#123;
              </div>
              {/* Highlighted swap line */}
              <div
                style={{
                  paddingLeft: 36,
                  background: isLight ? 'rgba(214, 82, 58, 0.14)' : 'rgba(214, 82, 58, 0.22)',
                  borderLeft: '2px solid var(--accent)',
                  margin: '2px -16px 2px -14px',
                  paddingRight: 16,
                  color: isLight ? '#101216' : '#F7F5EF',
                  fontWeight: 600,
                }}
              >
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
              </div>
              <div style={{ paddingLeft: 24 }}>&#125;</div>
              <div style={{ paddingLeft: 12 }}>&#125;</div>
              <div>&#125;</div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: isLight ? 'rgba(16, 18, 22, 0.025)' : 'rgba(247, 245, 239, 0.03)',
                borderTop: `1px solid ${cardRowBorder}`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--text-muted)',
              }}
            >
              <span>AST Latency: 0.02ms</span>
              <span style={{ color: greenTone }}>● 100% Client-Side</span>
            </div>
          </aside>

          {/* CENTER FLANK: Headline, Accent Mark, and Core CTA */}
          <section className="hero-center-column">
            <div className="hero-nav-ticker" style={{ margin: '0 auto 12px' }}>
              <span className="pulse" />
              <span>AST PARSER · D3 VECTOR CANVAS · CLIENT-SIDE WORKER</span>
            </div>
            <div className="hero-eyebrow">Algorithm Execution Engine</div>

            <h1 className="hero-headline-title">
              <span>SEE EXACTLY</span>
              <span>WHAT YOUR</span>
              <span style={{ color: 'var(--accent)' }}>CODE DOES.</span>
            </h1>

            <div className="hero-accent-mark-wrapper">
              <AccentMark />
            </div>

            <div style={{ height: 26 }} />

            <button className="hero-main-cta" onClick={onEnterApp}>
              Launch Visualizer
              <ArrowDown size={14} />
            </button>

            <div className="hero-hint-shortcuts">
              <span>Press</span>
              <span className="kbd-chip">Space</span>
              <span>to play</span>
              <span>·</span>
              <span className="kbd-chip">← / →</span>
              <span>to scrub</span>
            </div>
          </section>

          {/* RIGHT FLANK: Live Vector Visualizer Preview Card */}
          <aside className="hero-flank-card">
            <div className="card-header-bar">
              <div className="card-title-pill">
                <Activity size={12} style={{ color: greenTone }} />
                <span>Vector Canvas</span>
              </div>
              <span
                className="card-badge"
                style={{
                  background: isLight ? 'rgba(35, 122, 75, 0.14)' : 'rgba(56, 161, 105, 0.2)',
                  color: greenTone,
                }}
              >
                60 FPS D3
              </span>
            </div>

            {/* Mini Visualizer Canvas */}
            <div
              style={{
                padding: '24px 16px 14px',
                background: cardInnerBg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Array Bars Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 8,
                  height: 110,
                  width: '100%',
                }}
              >
                {[45, 18, 72, 34, 88, 52, 90].map((val, idx) => {
                  const isActive = idx === activeBarIndex;
                  const isComp = idx === comparingIndex;
                  let bg = isLight ? '#DDD9CE' : 'rgba(247, 245, 239, 0.16)';
                  let border = isLight ? '1px solid rgba(16, 18, 22, 0.12)' : '1px solid rgba(247, 245, 239, 0.1)';

                  if (isActive) {
                    bg = 'var(--accent)';
                    border = '1px solid #FF5A36';
                  } else if (isComp) {
                    bg = isLight ? '#D99B26' : '#E5A93C';
                    border = isLight ? '1px solid #B7791F' : '1px solid #F6E05E';
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${(val / 95) * 100}%`,
                        background: bg,
                        border,
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isActive || isComp ? (isLight ? '#FFFFFF' : '#101215') : isLight ? '#181A20' : '#F7F5EF',
                          fontWeight: 700,
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Pointers under bars */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'var(--text-secondary)',
                  padding: '0 4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>i:</span>
                  <span>{activeBarIndex}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: amberTone, fontWeight: 700 }}>j:</span>
                  <span>{comparingIndex}</span>
                </div>
                <div style={{ color: greenTone }}>Comparing</div>
              </div>
            </div>

            {/* Complexity Specs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                background: cardRowBorder,
                borderTop: `1px solid ${cardRowBorder}`,
              }}
            >
              <div style={{ background: cardSpecBg, padding: '8px 12px' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Time
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>
                  O(n²)
                </div>
              </div>
              <div style={{ background: cardSpecBg, padding: '8px 12px' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Space
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>
                  O(1) Aux
                </div>
              </div>
            </div>
          </aside>
        </main>

        {/* ── Bottom Ribbon: Algorithm Quick Jump ── */}
        <footer className="hero-bottom-shelf">
          <div className="shelf-label">Instant Presets · Click to Load &amp; Trace</div>
          <div className="shelf-presets">
            {ALGORITHM_PRESETS.slice(0, 7).map((p) => (
              <button
                key={p.id}
                className="preset-pill"
                onClick={() => handleSelectPreset(p.id)}
              >
                <span>{p.title}</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{p.timeComplexity}</span>
              </button>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
