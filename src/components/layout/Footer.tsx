import React, { useState } from 'react';
import { Mail, ExternalLink, ArrowUp, Heart } from 'lucide-react';
import { navigate } from '../../utils/router';

/* ─── GitHub Icon (Crisp inline SVG) ────────────────────────────────────────── */
function GithubIcon({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
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

/* ─── Accent Mark SVG ───────────────────────────────────────────────────────── */
function AccentMark() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: 16, height: 16, overflow: 'visible' }}
    >
      <circle
        cx="26"
        cy="26"
        r="23"
        stroke="#D6523A"
        strokeWidth="2"
        strokeDasharray="98.3 46.3"
        transform="rotate(2.5 26 26)"
      />
      <g stroke="#D6523A" strokeWidth="2" strokeLinecap="round">
        <circle cx="26.5" cy="26.1" r="2.3" />
        <path d="M28.9 27.6C31.6 29 32.9 31.2 31.8 33.3 30.7 35.4 27.2 36.1 24.2 35.1" />
      </g>
    </svg>
  );
}

interface Creator {
  name: string;
  handle: string;
  role: string;
  github: string;
  email?: string;
  localAvatar: string;
  remoteAvatar: string;
  initials: string;
  fallbackBg: string;
}

const CREATORS: Creator[] = [
  {
    name: 'Mradul',
    handle: 'IamMradul',
    role: 'Co-Founder & CTO',
    github: 'https://github.com/IamMradul',
    email: 'mradulg306@gmail.com',
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
    // If local asset fails to load, fall back to GitHub CDN directly
    if (avatarSources[handle] !== remoteAvatar) {
      setAvatarSources((prev: Record<string, string>) => ({ ...prev, [handle]: remoteAvatar }));
    } else {
      setImgErrors((prev: Record<string, boolean>) => ({ ...prev, [handle]: true }));
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToAnchor = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      style={{
        background: '#07080a',
        borderTop: '1px solid rgba(247, 245, 239, 0.08)',
        color: '#F7F5EF',
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
          width: '70%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(214, 82, 58, 0.45) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '18px 24px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Main Row: Brand + Creators + Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* ── Brand ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: '#13151b',
                  border: '1px solid rgba(247, 245, 239, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(214, 82, 58, 0.2)',
                }}
              >
                
              </div> */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: '#14161c',
                  border: '1px solid rgba(247, 245, 239, 0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(214, 82, 58, 0.2)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/learnshit.svg"
                  alt="LearnShit Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#F7F5EF',
                  textTransform: 'uppercase',
                }}
              >
                LEARNSHIT<span style={{ color: 'var(--accent, #D6523A)' }}>.XYZ</span>
              </span>
            </div>

            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: 'rgba(247, 245, 239, 0.4)',
                display: 'inline-block',
              }}
            >
              |
            </span>

            {/* Quick anchors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => navigate('/visualizer')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: 'rgba(247, 245, 239, 0.65)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)')}
              >
                Visualizer
              </button>
              <button
                onClick={() => {
                  if (window.location.pathname === '/') {
                    scrollToAnchor('gallery-anchor');
                  } else {
                    navigate('/#gallery-anchor');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: 'rgba(247, 245, 239, 0.65)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)')}
              >
                Playgrounds
              </button>
              <button
                onClick={() => (onOpenDsa ? onOpenDsa() : navigate('/dsa'))}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: 'rgba(247, 245, 239, 0.65)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)')}
              >
                DSA Guide
              </button>
              <button
                onClick={() => (onOpenResources ? onOpenResources('sheets') : navigate('/resources?tab=sheets'))}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: 'rgba(247, 245, 239, 0.65)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)')}
              >
                Resources
              </button>
              <button
                onClick={() => (onOpenResources ? onOpenResources('books') : navigate('/resources?tab=books'))}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: 'rgba(247, 245, 239, 0.65)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)')}
              >
                Books
              </button>
            </div>
          </div>

          {/* ── Creators Contact Cards (Compact) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(247, 245, 239, 0.45)',
                marginRight: 2,
              }}
            >
              Created by
            </span>

            {CREATORS.map((c) => {
              const currentSrc = avatarSources[c.handle] || c.localAvatar;
              const hasFailed = imgErrors[c.handle];

              return (
                <div
                  key={c.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '4px 12px 4px 6px',
                    borderRadius: 22,
                    background: '#0d0f14',
                    border: '1px solid rgba(247, 245, 239, 0.08)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.4)';
                    e.currentTarget.style.background = '#13151b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.08)';
                    e.currentTarget.style.background = '#0d0f14';
                  }}
                >
                  {/* Creator Profile Photo */}
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
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      textDecoration: 'none',
                      border: '1.5px solid rgba(247, 245, 239, 0.15)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    {!hasFailed ? (
                      <img
                        src={currentSrc}
                        alt={`${c.name} profile`}
                        width={28}
                        height={28}
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
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                    <a
                      href={c.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#F7F5EF',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                    >
                      {c.name}
                    </a>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'rgba(247, 245, 239, 0.45)',
                      }}
                    >
                      {c.role}
                    </span>
                  </div>

                  {/* Actions (GitHub + Email) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 2 }}>
                    <a
                      href={c.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${c.name} on GitHub`}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(247, 245, 239, 0.65)',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent, #D6523A)';
                        e.currentTarget.style.background = 'rgba(214, 82, 58, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <GithubIcon size={14} />
                    </a>

                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        title={`Email ${c.name} (${c.email})`}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(247, 245, 239, 0.65)',
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--accent, #D6523A)';
                          e.currentTarget.style.background = 'rgba(214, 82, 58, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(247, 245, 239, 0.65)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Mail size={14} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Right: Repo Link & Back to Top ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href="https://github.com/IamMradul/LearnShit.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 7,
                background: '#12141a',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                color: '#F7F5EF',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.5)';
                e.currentTarget.style.background = '#181b22';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.1)';
                e.currentTarget.style.background = '#12141a';
              }}
            >
              <GithubIcon size={14} />
              <span>GitHub</span>
              <ExternalLink size={11} style={{ opacity: 0.6 }} />
            </a>

            <button
              onClick={scrollToTop}
              title="Back to Top"
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: '#12141a',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                color: 'rgba(247, 245, 239, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.5)';
                e.currentTarget.style.color = '#F7F5EF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.1)';
                e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)';
              }}
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* ── Sub-row: Micro Credits ── */}
        <div
          style={{
            paddingTop: 10,
            borderTop: '1px solid rgba(247, 245, 239, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            fontFamily: "'Inter', sans-serif",
            fontSize: 11,
            color: 'rgba(247, 245, 239, 0.4)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} <strong style={{ color: '#F7F5EF', fontWeight: 600 }}>LearnShit.xyz</strong>. Built with{' '}
            <Heart size={11} style={{ display: 'inline', color: 'var(--accent, #D6523A)', verticalAlign: 'middle' }} />{' '}
            by{' '}
            <a
              href="https://github.com/IamMradul"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#F7F5EF', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#F7F5EF')}
            >
              Mradul
            </a>{' '}
            &amp;{' '}
            <a
              href="https://github.com/Imdilshan"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#F7F5EF', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #D6523A)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#F7F5EF')}
            >
              Md Dilshan
            </a>
            .
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>MIT License</span>
            <span>&bull;</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Client-Side Tracer</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
