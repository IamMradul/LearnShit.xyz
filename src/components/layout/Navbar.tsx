import React, { useState, useEffect } from 'react';
import {
  Code2,
  Layers,
  Play,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  FileText,
  Cpu,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';
import type { ResourceTab } from '../resources/ResourcesSection';
import { navigate } from '../../utils/router';
import { useUIStore } from '../../store/uiStore';

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

export interface NavbarProps {
  onOpenVisualizer?: () => void;
  onOpenPlaygrounds?: () => void;
  onOpenResources?: (tab?: ResourceTab) => void;
  onOpenDsa?: () => void;
  onOpenBooks?: () => void;
  onGoHome?: () => void;
  isResourcesView?: boolean;
  isVisualizerView?: boolean;
  isDsaView?: boolean;
  isBooksView?: boolean;
  isPlaygroundsView?: boolean;
  currentResourceTab?: ResourceTab;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVisualizer,
  onOpenPlaygrounds,
  onOpenResources,
  onOpenDsa,
  onOpenBooks,
  onGoHome,
  isResourcesView = false,
  isVisualizerView = false,
  isDsaView = false,
  isBooksView = false,
  isPlaygroundsView = false,
  currentResourceTab = 'sheets',
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'ide' | 'gallery'>('home');
  const { theme, toggleTheme } = useUIStore();
  const isLight = theme === 'light';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);

      if (isResourcesView) return;

      const scrollY = window.scrollY;
      const ideEl = document.getElementById('ide-anchor');
      const galleryEl = document.getElementById('gallery-anchor');

      if (galleryEl && scrollY >= galleryEl.offsetTop - 180) {
        setActiveSection('gallery');
      } else if (ideEl && scrollY >= ideEl.offsetTop - 180) {
        setActiveSection('ide');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isResourcesView]);

  const handleBrandClick = () => {
    setMobileMenuOpen(false);
    if (onGoHome) {
      onGoHome();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleVisualizerClick = () => {
    setMobileMenuOpen(false);
    if (onOpenVisualizer) {
      onOpenVisualizer();
    } else {
      const el = document.getElementById('ide-anchor');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlaygroundsClick = () => {
    setMobileMenuOpen(false);
    if (onOpenPlaygrounds) {
      onOpenPlaygrounds();
    } else {
      const el = document.getElementById('gallery-anchor');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResourcesClick = (tab: ResourceTab = 'sheets') => {
    setMobileMenuOpen(false);
    if (onOpenResources) {
      onOpenResources(tab);
    } else {
      const el = document.getElementById('resources-anchor');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDsaClick = () => {
    setMobileMenuOpen(false);
    if (onOpenDsa) {
      onOpenDsa();
    } else {
      navigate('/dsa');
    }
  };

  const handleBooksClick = () => {
    setMobileMenuOpen(false);
    if (onOpenBooks) {
      onOpenBooks();
    } else {
      navigate('/books');
    }
  };

  const isSheetsActive = isResourcesView && (currentResourceTab === 'sheets' || currentResourceTab === 'learnshit-sheet');
  const isDsaActive = isDsaView;
  const isBooksActive = isBooksView;
  const isIdeActive =
    isVisualizerView ||
    (!isResourcesView && !isDsaView && !isBooksView && !isPlaygroundsView && activeSection === 'ide');
  const isGalleryActive =
    isPlaygroundsView ||
    (!isResourcesView && !isDsaView && !isBooksView && !isVisualizerView && activeSection === 'gallery');

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
          background: isLight
            ? scrolled
              ? 'rgba(247, 245, 239, 0.94)'
              : 'rgba(247, 245, 239, 0.84)'
            : scrolled
              ? 'rgba(8, 10, 13, 0.92)'
              : 'rgba(10, 11, 14, 0.78)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${
            isLight
              ? scrolled
                ? 'rgba(16, 18, 22, 0.14)'
                : 'rgba(16, 18, 22, 0.08)'
              : scrolled
                ? 'rgba(247, 245, 239, 0.12)'
                : 'rgba(247, 245, 239, 0.07)'
          }`,
          transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: scrolled
            ? isLight
              ? '0 4px 20px rgba(0, 0, 0, 0.08)'
              : '0 4px 20px rgba(0, 0, 0, 0.45)'
            : 'none',
        }}
      >
        {/* Subtle accent highlight line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '65%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(214, 82, 58, 0.5) 50%, transparent 100%)',
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
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleBrandClick();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
              textDecoration: 'none',
            }}
            title="Go to LearnShit Home"
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
                overflow: 'hidden',
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
              <img
                src="/learnshit.svg"
                alt="LearnShit Logo"
                width={32}
                height={32}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                }}
              >
                LEARNSHIT<span style={{ color: 'var(--accent, #D6523A)' }}>.XYZ</span>
              </span>
            </div>
          </a>

          {/* ── Desktop Navigation Links (Center) ── */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            className="navbar-desktop-nav"
            aria-label="Main Navigation"
          >
            {/* Visualizer / IDE */}
            <a
              href="/visualizer"
              onClick={(e) => {
                e.preventDefault();
                handleVisualizerClick();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 8,
                background: isIdeActive ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: isIdeActive ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: isIdeActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!isIdeActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.06)' : 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isIdeActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Code2 size={15} style={{ color: isIdeActive ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>Visualizer</span>
            </a>

            {/* Algorithm Playgrounds / Catalog */}
            <a
              href="/playgrounds"
              onClick={(e) => {
                e.preventDefault();
                handlePlaygroundsClick();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 8,
                background: isGalleryActive ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: isGalleryActive ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: isGalleryActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!isGalleryActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.06)' : 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGalleryActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Layers size={15} style={{ color: isGalleryActive ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>Playgrounds</span>
            </a>

            {/* DSA Guide (Data Structures & Algorithms Encyclopedia) */}
            <a
              href="/dsa"
              onClick={(e) => {
                e.preventDefault();
                handleDsaClick();
              }}
              id="navbar-dsa-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 8,
                background: isDsaActive ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: isDsaActive ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: isDsaActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!isDsaActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.06)' : 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDsaActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Cpu size={15} style={{ color: isDsaActive ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>DSA Guide</span>
            </a>

            {/* CS Books Library */}
            <a
              href="/books"
              onClick={(e) => {
                e.preventDefault();
                handleBooksClick();
              }}
              id="navbar-books-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 8,
                background: isBooksActive ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: isBooksActive ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: isBooksActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!isBooksActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.06)' : 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isBooksActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <BookOpen size={15} style={{ color: isBooksActive ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>Books</span>
            </a>

            {/* Resources (Problem Sheets) */}
            <a
              href="/resources?tab=sheets"
              onClick={(e) => {
                e.preventDefault();
                handleResourcesClick('sheets');
              }}
              id="navbar-resources-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 8,
                background: isSheetsActive ? 'rgba(214, 82, 58, 0.14)' : 'transparent',
                border: isSheetsActive ? '1px solid rgba(214, 82, 58, 0.35)' : '1px solid transparent',
                color: isSheetsActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSheetsActive) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.06)' : 'rgba(247, 245, 239, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSheetsActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <FileText size={15} style={{ color: isSheetsActive ? 'var(--accent, #D6523A)' : 'inherit' }} />
              <span>Resources</span>
            </a>
          </nav>

          {/* ── Action Buttons (Right) ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
            className="navbar-desktop-actions"
          >
            {/* Theme Toggler */}
            <button
              type="button"
              id="navbar-theme-toggle"
              onClick={toggleTheme}
              title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '7px 11px',
                borderRadius: 8,
                background: isLight ? 'rgba(16, 18, 22, 0.06)' : '#12141a',
                border: `1px solid ${isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.12)'}`,
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.45)';
                e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.1)' : '#181b22';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.12)';
                e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.06)' : '#12141a';
              }}
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} />}
              <span>{isLight ? 'Dark' : 'Light'}</span>
            </button>

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
                background: isLight ? 'rgba(16, 18, 22, 0.06)' : '#12141a',
                border: `1px solid ${isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.12)'}`,
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.45)';
                e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.1)' : '#181b22';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.12)';
                e.currentTarget.style.background = isLight ? 'rgba(16, 18, 22, 0.06)' : '#12141a';
              }}
            >
              <GithubIcon size={15} />
              <span>GitHub</span>
              <ExternalLink size={11} style={{ opacity: 0.55 }} />
            </a>
          </div>

          {/* ── Mobile Controls (Theme + Hamburger) ── */}
          <div style={{ display: 'none', alignItems: 'center', gap: 8 }} className="navbar-mobile-toggle">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
              style={{
                background: isLight ? 'rgba(16, 18, 22, 0.06)' : '#12141a',
                border: `1px solid ${isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.12)'}`,
                borderRadius: 7,
                padding: 7,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{
                background: isLight ? 'rgba(16, 18, 22, 0.06)' : '#12141a',
                border: `1px solid ${isLight ? 'rgba(16, 18, 22, 0.14)' : 'rgba(247, 245, 239, 0.12)'}`,
                borderRadius: 7,
                padding: 7,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
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
            background: 'var(--surface-glass-strong)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            padding: '20px 24px',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <a
            href="/visualizer"
            onClick={(e) => {
              e.preventDefault();
              handleVisualizerClick();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Code2 size={16} color="var(--accent, #D6523A)" />
              <span>Visualizer (IDE)</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </a>

          <a
            href="/playgrounds"
            onClick={(e) => {
              e.preventDefault();
              handlePlaygroundsClick();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Layers size={16} color="var(--accent, #D6523A)" />
              <span>Algorithm Playgrounds (26)</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </a>

          <a
            href="/dsa"
            onClick={(e) => {
              e.preventDefault();
              handleDsaClick();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: isDsaActive ? 'rgba(214, 82, 58, 0.15)' : 'var(--bg-tertiary)',
              border: isDsaActive ? '1px solid rgba(214, 82, 58, 0.4)' : '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Cpu size={16} color="var(--accent, #D6523A)" />
              <span>Data Structures &amp; Algorithms Guide</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </a>

          <a
            href="/books"
            onClick={(e) => {
              e.preventDefault();
              handleBooksClick();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: isBooksActive ? 'rgba(214, 82, 58, 0.15)' : 'var(--bg-tertiary)',
              border: isBooksActive ? '1px solid rgba(214, 82, 58, 0.4)' : '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={16} color="var(--accent, #D6523A)" />
              <span>CS Books Library</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </a>

          <a
            href="/resources?tab=sheets"
            onClick={(e) => {
              e.preventDefault();
              handleResourcesClick('sheets');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 8,
              background: isSheetsActive ? 'rgba(214, 82, 58, 0.15)' : 'var(--bg-tertiary)',
              border: isSheetsActive ? '1px solid rgba(214, 82, 58, 0.4)' : '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={16} color="var(--accent, #D6523A)" />
              <span>Resources &amp; Problem Sheets</span>
            </div>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
          </a>

          <a
            href="/visualizer"
            onClick={(e) => {
              e.preventDefault();
              handleVisualizerClick();
            }}
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
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(214, 82, 58, 0.4)',
            }}
          >
            <Play size={14} fill="#FFFFFF" />
            <span>Launch Visualizer</span>
          </a>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 960px) {
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
