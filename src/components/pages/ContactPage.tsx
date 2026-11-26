import React from 'react';
import { Breadcrumbs } from '../seo/Breadcrumbs';
import { Mail, MessageSquare, Bug, ExternalLink } from 'lucide-react';
import { AUTHOR_NAME_PLACEHOLDER } from '../../seo/seoConfig';

export const ContactPage: React.FC = () => {
  return (
    <main
      id="main-content"
      style={{
        paddingTop: 80,
        paddingBottom: 80,
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Contact', url: '/contact' },
          ]}
        />

        <header style={{ marginBottom: 36 }}>
          <h1
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
              fontWeight: 700,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
              margin: '0 0 16px 0',
              color: 'var(--text-primary)',
            }}
          >
            Contact &amp; Community Support
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.1rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            Have feedback on the algorithm visualizer, found an edge-case bug, or want to contribute a new data structure renderer?
            We'd love to hear from you.
          </p>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 48 }}>
          {/* GitHub Issues */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 12,
              padding: 24,
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(214, 82, 58, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D6523A',
                  marginBottom: 16,
                }}
              >
                <Bug size={20} aria-hidden="true" />
              </div>
              <h2
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 8px 0',
                }}
              >
                Report a Bug
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                Notice a miscalculated state or an error in a transpiler? Open a detailed GitHub issue with sample code.
              </p>
            </div>
            <a
              href="https://github.com/IamMradul/LearnShit.xyz/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 20,
                color: '#D6523A',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>GitHub Issues</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>

          {/* Direct Email */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 12,
              padding: 24,
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34D399',
                  marginBottom: 16,
                }}
              >
                <Mail size={20} aria-hidden="true" />
              </div>
              <h2
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 8px 0',
                }}
              >
                Direct Contact
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                Reach out to the maintainers directly for partnerships, educational licensing inquiries, or press questions.
              </p>
            </div>
            <a
              href="mailto:learnshit.xyz@gmail.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 20,
                color: '#34D399',
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Email learnshit.xyz@gmail.com</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section style={{ borderTop: '1px solid rgba(247, 245, 239, 0.1)', paddingTop: 32 }}>
          <h2
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}
          >
            Project Maintainer Details
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(247, 245, 239, 0.7)',
            }}
          >
            Maintained by Md Dilshan (Co-Founder &amp; CEO) and Mradul (Co-Founder &amp; CTO).
            Repository hosted publicly under the LearnShit organization on GitHub.
          </p>
        </section>
      </div>
    </main>
  );
};
