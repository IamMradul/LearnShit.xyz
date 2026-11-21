import React from 'react';
import {
  Mail,
  ExternalLink,
  Code2,
  Heart,
  ArrowUp,
  Sparkles,
  Terminal,
  Layers,
  MessageSquare,
} from 'lucide-react';

/* ─── GitHub Icon (Crisp inline SVG) ────────────────────────────────────────── */
function GithubIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
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
      style={{ width: 22, height: 22, overflow: 'visible' }}
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

/* ─── Team Members Data ─────────────────────────────────────────────────────── */
interface TeamMember {
  name: string;
  handle: string;
  role: string;
  github: string;
  email?: string;
  avatarBg: string;
  initials: string;
  bio: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Mradul',
    handle: 'IamMradul',
    role: 'Lead Architect & Developer',
    github: 'https://github.com/IamMradul',
    email: 'mradulg306@gmail.com',
    avatarBg: 'linear-gradient(135deg, #D6523A 0%, #FF7854 100%)',
    initials: 'M',
    bio: 'Creator of LearnShit.xyz. Building next-gen visual debugging & algorithmic learning experiences.',
  },
  {
    name: 'Md Dilshan',
    handle: 'Imdilshan',
    role: 'Core Contributor',
    github: 'https://github.com/Imdilshan',
    avatarBg: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    initials: 'MD',
    bio: 'Core collaborator & software engineer. Passionate about developer tools and interactive algorithms.',
  },
];

export const Footer: React.FC = () => {
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
        overflow: 'hidden',
      }}
    >
      {/* Subtle background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(214, 82, 58, 0.5) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: '15%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(214, 82, 58, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Container */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '64px 32px 32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Grid: 3 Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 48,
            marginBottom: 56,
          }}
        >
          {/* ── Column 1: Brand & Mission ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#13151b',
                  border: '1px solid rgba(247, 245, 239, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(214, 82, 58, 0.25)',
                }}
              >
                <AccentMark />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: '#F7F5EF',
                    textTransform: 'uppercase',
                  }}
                >
                  LEARNSHIT
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    color: 'var(--accent, #D6523A)',
                    fontWeight: 700,
                  }}
                >
                  .XYZ
                </span>
              </div>
            </div>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
                color: 'rgba(247, 245, 239, 0.65)',
                margin: 0,
                maxWidth: 380,
              }}
            >
              Interactive algorithm execution visualizer & code stepping engine.
              Step through LeetCode, Codeforces, and custom algorithms with synchronized line stepping
              and real-time data structure animations.
            </p>

            {/* Client-side badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 20,
                background: 'rgba(56, 161, 105, 0.1)',
                border: '1px solid rgba(56, 161, 105, 0.25)',
                color: '#4ADE80',
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                width: 'fit-content',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#4ADE80',
                  boxShadow: '0 0 8px #4ADE80',
                }}
              />
              100% In-Browser AST & WebAssembly Sandbox
            </div>

            {/* GitHub Repo Button */}
            <a
              href="https://github.com/IamMradul/LearnShit.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderRadius: 8,
                background: '#12141a',
                border: '1px solid rgba(247, 245, 239, 0.12)',
                color: '#F7F5EF',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                width: 'fit-content',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.6)';
                e.currentTarget.style.background = '#181b22';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.12)';
                e.currentTarget.style.background = '#12141a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <GithubIcon size={16} />
              <span>Star on GitHub</span>
              <ExternalLink size={13} style={{ opacity: 0.6 }} />
            </a>
          </div>

          {/* ── Column 2: Core Team & Contacts (Highlighted) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent, #D6523A)',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Sparkles size={15} />
                CREATORS & CONTACT
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: 'rgba(247, 245, 239, 0.55)',
                  margin: 0,
                }}
              >
                Connect directly with the minds building LearnShit.
              </p>
            </div>

            {/* Team Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  style={{
                    background: '#0d0f14',
                    border: '1px solid rgba(247, 245, 239, 0.08)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.4)';
                    e.currentTarget.style.background = '#12141a';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.08)';
                    e.currentTarget.style.background = '#0d0f14';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Avatar initials */}
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: member.avatarBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                          color: '#FFFFFF',
                          fontFamily: "'Oswald', sans-serif",
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                          flexShrink: 0,
                        }}
                      >
                        {member.initials}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 15,
                              fontWeight: 700,
                              color: '#F7F5EF',
                            }}
                          >
                            {member.name}
                          </span>
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 11,
                              color: 'rgba(247, 245, 239, 0.45)',
                            }}
                          >
                            @{member.handle}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                            color: 'var(--accent, #D6523A)',
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {member.role}
                        </div>
                      </div>
                    </div>

                    {/* Social Quick Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${member.name} on GitHub`}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: '#181b22',
                          border: '1px solid rgba(247, 245, 239, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#F7F5EF',
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--accent, #D6523A)';
                          e.currentTarget.style.borderColor = 'var(--accent, #D6523A)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#F7F5EF';
                          e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.12)';
                        }}
                      >
                        <GithubIcon size={15} />
                      </a>

                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          title={`Email ${member.name} (${member.email})`}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#181b22',
                            border: '1px solid rgba(247, 245, 239, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#F7F5EF',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--accent, #D6523A)';
                            e.currentTarget.style.borderColor = 'var(--accent, #D6523A)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#F7F5EF';
                            e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.12)';
                          }}
                        >
                          <Mail size={15} />
                        </a>
                      )}
                    </div>
                  </div>

                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: 'rgba(247, 245, 239, 0.6)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>

            {/* Direct Message CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 8,
                background: 'rgba(214, 82, 58, 0.08)',
                border: '1px solid rgba(214, 82, 58, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={16} color="var(--accent, #D6523A)" />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#F7F5EF',
                  }}
                >
                  Questions or collaboration inquiries?
                </span>
              </div>
              <a
                href="mailto:mradulg306@gmail.com?subject=LearnShit.xyz%20Inquiry"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--accent, #D6523A)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Send Message &rarr;
              </a>
            </div>
          </div>

          {/* ── Column 3: Navigation & Quick Links ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent, #D6523A)',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Terminal size={15} />
                PLATFORM NAVIGATION
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: 'rgba(247, 245, 239, 0.55)',
                  margin: 0,
                }}
              >
                Quick jump to visualizers, stages, and sources.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 20,
              }}
            >
              {/* Product Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(247, 245, 239, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Features
                </span>
                <button
                  onClick={() => scrollToAnchor('ide-anchor')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(247, 245, 239, 0.75)',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)')}
                >
                  &rarr; IDE Workspace
                </button>
                <button
                  onClick={() => scrollToAnchor('gallery-anchor')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(247, 245, 239, 0.75)',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)')}
                >
                  &rarr; Algorithm Gallery (26)
                </button>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(247, 245, 239, 0.75)',
                  }}
                >
                  &rarr; JavaScript & Python 3.12
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(247, 245, 239, 0.75)',
                  }}
                >
                  &rarr; LeetCode & Codeforces Fast-IO
                </span>
              </div>

              {/* Open Source / Community */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'rgba(247, 245, 239, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Community
                </span>
                <a
                  href="https://github.com/IamMradul/LearnShit.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(247, 245, 239, 0.75)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)')}
                >
                  &rarr; Source Code
                </a>
                <a
                  href="https://github.com/IamMradul/LearnShit.xyz/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(247, 245, 239, 0.75)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)')}
                >
                  &rarr; Report an Issue
                </a>
                <a
                  href="https://github.com/IamMradul/LearnShit.xyz/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: 'rgba(247, 245, 239, 0.75)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F5EF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(247, 245, 239, 0.75)')}
                >
                  &rarr; MIT License
                </a>
              </div>
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              style={{
                marginTop: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 8,
                background: '#12141a',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                color: 'rgba(247, 245, 239, 0.8)',
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: 'fit-content',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(214, 82, 58, 0.5)';
                e.currentTarget.style.color = '#F7F5EF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.1)';
                e.currentTarget.style.color = 'rgba(247, 245, 239, 0.8)';
              }}
            >
              <ArrowUp size={14} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div
          style={{
            paddingTop: 28,
            borderTop: '1px solid rgba(247, 245, 239, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: 'rgba(247, 245, 239, 0.45)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()}{' '}
            <strong style={{ color: '#F7F5EF', fontWeight: 600 }}>LearnShit.xyz</strong>. Made with{' '}
            <Heart size={13} style={{ display: 'inline', color: 'var(--accent, #D6523A)', verticalAlign: 'middle' }} />{' '}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
              MIT Open Source
            </span>
            <span>&bull;</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
