import React, { useState, useEffect } from 'react';
import {
  Code2,
  BookOpen,
  Layers,
  Play,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

/* ─── Crisp Inline GitHub SVG ────────────────────────────────────────────────── */
function GithubIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

/* ─── Accent Mark Gyroscope SVG ─────────────────────────────────────────────── */
function AccentMark() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: 17, height: 17, overflow: 'visible' }}
    >
      <circle
        cx="26"
        cy="26"
        r="23"
        stroke="#D6523A"
        strokeWidth="2.2"
        strokeDasharray="98.3 46.3"
        transform="rotate(2.5 26 26)"
      />
      <g stroke="#D6523A" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="26.5" cy="26.1" r="2.3" />
        <path d="M28.9 27.6C31.6 29 32.9 31.2 31.8 33.3 30.7 35.4 27.2 36.1 24.2 35.1" />
      </g>
    </svg>
  );
}

interface NavbarProps {
  onOpenVisualizer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVisualizer }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'ide' | 'gallery' | 'resources'>('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active section detection
      const scrollY = window.scrollY;
      const ideEl = document.getElementById('ide-anchor');
      const galleryEl = document.getElementById('gallery-anchor');
      const resourcesEl = document.getElementById('resources-anchor');

      if (resourcesEl && scrollY >= resourcesEl.offsetTop - 150) {
        setActiveSection('resources');
      } else if (galleryEl && scrollY >= galleryEl.offsetTop - 150) {
        setActiveSection('gallery');
      } else if (ideEl && scrollY >= ideEl.offsetTop - 150) {
        setActiveSection('ide');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAnchor = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchVisualizer = () => {
    setMobileMenuOpen(false);
    if (onOpenVisualizer) {
      onOpenVisualizer();
    } else {
      scrollToAnchor('ide-anchor');
    }
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 62,
          zIndex: 100,
          background: scrolled ? 'rgba(8, 10, 13, 0.88)' : 'rgba(10, 11, 14, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${scrolled ? 'rgba(247, 245, 239, 0.1)' : 'rgba(247, 245, 239, 0.06)'}`,
          transition: 'all 0.25s ease',
        }}
      >
        {/* Subtle accent glow line at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(214, 82, 58, 0.45) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1600,
            height: '100%',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* ── Brand Logo & Title (Left) ── */}
          <div
            onClick={() => scrollToAnchor('top')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#14161c',
                border: '1px solid rgba(247, 245, 239, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(214, 82, 58, 0.25)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.16)';
              }}
            >
              <AccentMark />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  color: '#F7F5EF',
                  textTransform: 'uppercase',
                }}
              >
                LEARNSHIT<span style={{ color: 'var(--accent, #D6523A)' }}>.XYZ</span>
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'var(--accent, #D6523A)',
                  background: 'rgba(214, 82, 58, 0.12)',
                  border: '1px solid rgba(214, 82, 58, 0.3)',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                v2.4
              </span>
            </div>
          </div>

          {/* ── Desktop Navigation Links (Center) ── */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            className="navbar-desktop-nav"
          >
            {/* Visualizer / IDE */}
            <button
              onClick={() => scrollToAnchor('ide-anchor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 14px',
                borderRadius: 8,
                background: activeSection === 'ide' ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: activeSection === 'ide' ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: activeSection === 'ide' ? '#F7F5EF' : 'rgba(247, 245, 239, 0.75)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'ide') {
                  e.currentTarget.style.color = '#F7F5EF';
                  e.currentTarget.style.background = 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'ide') {
                  e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Code2 size={15} style={{ color: activeSection === 'ide' ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>Visualizer</span>
            </button>

            {/* Algorithm Playgrounds / Catalog */}
            <button
              onClick={() => scrollToAnchor('gallery-anchor')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 14px',
                borderRadius: 8,
                background: activeSection === 'gallery' ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: activeSection === 'gallery' ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: activeSection === 'gallery' ? '#F7F5EF' : 'rgba(247, 245, 239, 0.75)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'gallery') {
                  e.currentTarget.style.color = '#F7F5EF';
                  e.currentTarget.style.background = 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'gallery') {
                  e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Layers size={15} style={{ color: activeSection === 'gallery' ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>Playgrounds</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'rgba(247, 245, 239, 0.45)',
                  background: 'rgba(247, 245, 239, 0.08)',
                  padding: '1px 5px',
                  borderRadius: 4,
                }}
              >
                26
              </span>
            </button>

            {/* Resources Section Link */}
            <button
              onClick={() => scrollToAnchor('resources-anchor')}
              id="navbar-resources-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 14px',
                borderRadius: 8,
                background: activeSection === 'resources' ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: activeSection === 'resources' ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: activeSection === 'resources' ? '#F7F5EF' : 'rgba(247, 245, 239, 0.75)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'resources') {
                  e.currentTarget.style.color = '#F7F5EF';
                  e.currentTarget.style.background = 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== 'resources') {
                  e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <BookOpen size={15} style={{ color: activeSection === 'resources' ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>Resources</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  color: 'var(--accent, #D6523A)',
                  background: 'rgba(214, 82, 58, 0.15)',
                  border: '1px solid rgba(214, 82, 58, 0.3)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Toolkit
              </span>
            </button>
          </nav>

          {/* ── Action Buttons (Right) ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            className="navbar-desktop-actions"
          >
            {/* GitHub Repo Pill Button */}
            <a
              href="https://github.com/IamMradul/LearnShit.xyz"
              target="_blank"
              rel="noopener noreferrer"
              title="Star LearnShit.xyz on GitHub"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 13px',
                borderRadius: 8,
                background: '#12141a',
                border: '1px solid rgba(247, 245, 239, 0.12)',
                color: '#F7F5EF',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.45)';
                e.currentTarget.style.background = '#181b22';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.12)';
                e.currentTarget.style.background = '#12141a';
              }}
            >
              <GithubIcon size={15} />
              <span>GitHub</span>
              <ExternalLink size={11} style={{ opacity: 0.55 }} />
            </a>

            {/* Launch Visualizer Primary CTA */}
            <button
              onClick={handleLaunchVisualizer}
              id="navbar-launch-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #D6523A 0%, #E2583E 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 2px 14px rgba(214, 82, 58, 0.35)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(214, 82, 58, 0.55)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #E2583E 0%, #FF684D 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 14px rgba(214, 82, 58, 0.35)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #D6523A 0%, #E2583E 100%)';
              }}
            >
              <Play size={13} fill="#FFFFFF" />
              <span>Launch IDE</span>
            </button>
          </div>

          {/* ── Mobile Hamburger Toggle ── */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              background: '#12141a',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 7,
              padding: 7,
              color: '#F7F5EF',
              cursor: 'pointer',
            }}
            className="navbar-mobile-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer Menu ── */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 62,
            left: 0,
            right: 0,
            background: 'rgba(9, 11, 14, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(247, 245, 239, 0.12)',
            padding: '20px 24px',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          }}
        >
          <button
            onClick={() => scrollToAnchor('ide-anchor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: '#12141a',
              border: '1px solid rgba(247, 245, 239, 0.08)',
              color: '#F7F5EF',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Code2 size={16} color="var(--accent, #D6523A)" />
              <span>Visualizer (IDE)</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </button>

          <button
            onClick={() => scrollToAnchor('gallery-anchor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: '#12141a',
              border: '1px solid rgba(247, 245, 239, 0.08)',
              color: '#F7F5EF',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={16} color="var(--accent, #D6523A)" />
              <span>Algorithm Playgrounds (26)</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </button>

          <button
            onClick={() => scrollToAnchor('resources-anchor')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: 'rgba(214, 82, 58, 0.1)',
              border: '1px solid rgba(214, 82, 58, 0.3)',
              color: '#F7F5EF',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={16} color="var(--accent, #D6523A)" />
              <span>Resources &amp; Toolkit</span>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--accent, #D6523A)',
                fontWeight: 700,
              }}
            >
              NEW
            </span>
          </button>

          <a
            href="https://github.com/IamMradul/LearnShit.xyz"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              background: '#14161f',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              color: '#F7F5EF',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              marginTop: 4,
            }}
          >
            <GithubIcon size={16} />
            <span>GitHub Repository</span>
            <ExternalLink size={13} style={{ opacity: 0.5 }} />
          </a>

          <button
            onClick={handleLaunchVisualizer}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--accent, #D6523A)',
              border: 'none',
              color: '#FFFFFF',
              fontFamily: "'Oswald', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(214, 82, 58, 0.4)',
            }}
          >
            <Play size={14} fill="#FFFFFF" />
            <span>Launch Visualizer</span>
          </button>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 860px) {
          .navbar-desktop-nav {
            display: none !important;
          }
          .navbar-desktop-actions {
            display: none !important;
          }
          .navbar-mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};
