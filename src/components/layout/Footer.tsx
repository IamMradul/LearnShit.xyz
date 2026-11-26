import React, { useState } from 'react';
import { Mail, ExternalLink, ArrowUp, Heart } from 'lucide-react';
import { navigate } from '../../utils/router';

/* ─── GitHub Icon (Crisp inline SVG) ────────────────────────────────────────── */
function GithubIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
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

interface Creator {
  name: string;
  handle: string;
  role: string;
  github: string;
  email: string;
  localAvatar: string;
  remoteAvatar: string;
  initials: string;
  fallbackBg: string;
}

const OFFICIAL_EMAIL = 'learnshit.xyz@gmail.com';

const CREATORS: Creator[] = [
  {
    name: 'Mradul',
    handle: 'IamMradul',
    role: 'Co-Founder & CTO',
    github: 'https://github.com/IamMradul',
    email: OFFICIAL_EMAIL,
    localAvatar: '/avatars/mradul.jpg',
    remoteAvatar: 'https://avatars.githubusercontent.com/u/108190254?v=4',
    initials: 'MG',
    fallbackBg: 'linear-gradient(135deg, #D6523A 0%, #FF7854 100%)',
  },
  {
    name: 'Md Dilshan',
    handle: 'Imdilshan',
    role: 'Co-Founder & CEO',
    github: 'https://github.com/Imdilshan',
    email: OFFICIAL_EMAIL,
    localAvatar: '/avatars/dilshan.jpg',
    remoteAvatar: 'https://avatars.githubusercontent.com/u/158074772?v=4',
    initials: 'MD',
    fallbackBg: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
  },
];

interface FooterProps {
  onOpenResources?: (tab?: 'sheets' | 'books') => void;
  onOpenDsa?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenResources, onOpenDsa }) => {
  const [avatarSources, setAvatarSources] = useState<Record<string, string>>({
    IamMradul: '/avatars/mradul.jpg',
    Imdilshan: '/avatars/dilshan.jpg',
  });
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (handle: string, remoteAvatar: string) => {
    if (avatarSources[handle] !== remoteAvatar) {
      setAvatarSources((prev: Record<string, string>) => ({ ...prev, [handle]: remoteAvatar }));
    } else {
      setImgErrors((prev: Record<string, boolean>) => ({ ...prev, [handle]: true }));
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-primary)',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Top subtle highlight line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(214, 82, 58, 0.45) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '36px 28px 22px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        {/* ── Top Main Grid: Brand + Nav Columns + Maintainers ── */}
        <div
          className="footer-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(250px, 1.3fr) repeat(2, minmax(130px, 0.9fr)) minmax(260px, 1.2fr)',
            gap: 28,
            alignItems: 'start',
          }}
        >
          {/* ── Column 1: Brand & Contact Email ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                textDecoration: 'none',
                width: 'fit-content',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(214, 82, 58, 0.22)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/learnshit.svg"
                  alt="LearnShit Logo"
                  width={30}
                  height={30}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
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
            </a>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: 0,
                maxWidth: 320,
              }}
            >
              Interactive algorithm &amp; data structure visualizer. Step through code, inspect memory mutations,
              and master computer science concepts locally in your browser.
            </p>

            {/* Official Email Pill */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-secondary)',
                }}
              >
                Official Support
              </span>
              <a
                href={`mailto:${OFFICIAL_EMAIL}`}
                title={`Email ${OFFICIAL_EMAIL}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 12px',
                  borderRadius: 7,
                  background: 'rgba(214, 82, 58, 0.08)',
                  border: '1px solid rgba(214, 82, 58, 0.24)',
                  color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: 'none',
                  width: 'fit-content',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.55)';
                  e.currentTarget.style.background = 'rgba(214, 82, 58, 0.16)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.24)';
                  e.currentTarget.style.background = 'rgba(214, 82, 58, 0.08)';
                }}
              >
                <Mail size={13} style={{ color: 'var(--accent, #D6523A)', flexShrink: 0 }} />
                <span>{OFFICIAL_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* ── Column 2: Platform Links ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
              }}
            >
              Platform
            </span>
            <nav
              aria-label="Platform Links"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <a
                href="/visualizer"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/visualizer');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Code Visualizer
              </a>
              <a
                href="/playgrounds"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/playgrounds');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Algorithm Playgrounds
              </a>
              <a
                href="/dsa"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenDsa) onOpenDsa();
                  else navigate('/dsa');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                DSA Guides &amp; Patterns
              </a>
              <a
                href="/resources?tab=sheets"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenResources) onOpenResources('sheets');
                  else navigate('/resources?tab=sheets');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Practice Problem Sheets
              </a>
              <a
                href="/resources?tab=books"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenResources) onOpenResources('books');
                  else navigate('/resources?tab=books');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Curated Books
              </a>
            </nav>
          </div>

          {/* ── Column 3: Company & Information ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
              }}
            >
              LearnShit
            </span>
            <nav
              aria-label="Company Links"
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/about');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                About Our Mission
              </a>
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/contact');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Contact &amp; Support
              </a>
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/privacy');
                }}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                Privacy &amp; Local Sandbox
              </a>
              <a
                href="https://github.com/IamMradul/LearnShit.xyz/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                <span>Report an Issue</span>
                <ExternalLink size={10} style={{ opacity: 0.5 }} />
              </a>
            </nav>
          </div>

          {/* ── Column 4: Maintainers & GitHub ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
              }}
            >
              Maintained By
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CREATORS.map((c) => {
                const currentSrc = avatarSources[c.handle] || c.localAvatar;
                const hasFailed = imgErrors[c.handle];

                return (
                  <div
                    key={c.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 12px 6px 8px',
                      borderRadius: 10,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.4)';
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Creator Avatar */}
                      <a
                        href={c.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`View ${c.name} on GitHub`}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          textDecoration: 'none',
                          border: '1.5px solid var(--border)',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                        }}
                      >
                        {!hasFailed ? (
                          <img
                            src={currentSrc}
                            alt={`Portrait of ${c.name}, ${c.role}`}
                            width={30}
                            height={30}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() => handleImgError(c.handle, c.remoteAvatar)}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                              borderRadius: '50%',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: c.fallbackBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: "'Oswald', sans-serif",
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#FFFFFF',
                              letterSpacing: '0.02em',
                            }}
                          >
                            {c.initials}
                          </div>
                        )}
                      </a>

                      {/* Name and Role */}
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <a
                          href={c.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            transition: 'color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                        >
                          {c.name}
                        </a>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {c.role}
                        </span>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <a
                        href={c.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${c.name} on GitHub`}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          background: 'var(--border-subtle)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--accent, #D6523A)';
                          e.currentTarget.style.background = 'rgba(214, 82, 58, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.background = 'var(--border-subtle)';
                        }}
                      >
                        <GithubIcon size={13} />
                      </a>
                      <a
                        href={`mailto:${c.email}`}
                        title={`Email ${c.name} (${c.email})`}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          background: 'var(--border-subtle)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--accent, #D6523A)';
                          e.currentTarget.style.background = 'rgba(214, 82, 58, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.background = 'var(--border-subtle)';
                        }}
                      >
                        <Mail size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* GitHub Repo Pill Button */}
            <a
              href="https://github.com/IamMradul/LearnShit.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 7,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.18s ease',
                marginTop: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.5)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
            >
              <GithubIcon size={14} />
              <span>Star on GitHub</span>
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>
          </div>
        </div>

        {/* ── Bottom Sub-Row: Copyright, Badges & Back to Top ── */}
        <div
          style={{
            paddingTop: 18,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11.5,
            color: 'var(--text-secondary)',
          }}
        >
          {/* Copyright notice */}
          <div>
            &copy; {new Date().getFullYear()} <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>LearnShit.xyz</strong>. Built with{' '}
            <Heart size={11} style={{ display: 'inline', color: 'var(--accent, #D6523A)', verticalAlign: 'middle' }} />{' '}
            by{' '}
            <a
              href="https://github.com/IamMradul"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              Mradul
            </a>{' '}
            &amp;{' '}
            <a
              href="https://github.com/Imdilshan"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            >
              Md Dilshan
            </a>
            .
          </div>

          {/* Badges / Tech details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                background: 'var(--border-subtle)',
                padding: '2px 7px',
                borderRadius: 4,
                color: 'var(--text-secondary)',
              }}
            >
              MIT License
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                background: 'var(--border-subtle)',
                padding: '2px 7px',
                borderRadius: 4,
                color: 'var(--text-secondary)',
              }}
            >
              Client Sandbox
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10.5,
                background: 'var(--border-subtle)',
                padding: '2px 7px',
                borderRadius: 4,
                color: 'var(--text-secondary)',
              }}
            >
              Zero Telemetry
            </span>

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              title="Back to Top"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 11.5,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.5)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <span>Top</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Styles for Footer */}
      <style>{`
        @media (max-width: 960px) {
          .footer-grid-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 600px) {
          .footer-grid-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </footer>
  );
};
