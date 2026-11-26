import React from 'react';
import { Breadcrumbs } from '../seo/Breadcrumbs';
import { Cpu, ShieldCheck, Code2, Globe, Heart, ExternalLink, Terminal } from 'lucide-react';
import { AUTHOR_NAME_PLACEHOLDER } from '../../seo/seoConfig';

export const AboutPage: React.FC = () => {
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
          maxWidth: 900,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'About', url: '/about' },
          ]}
        />

        <article>
          <header style={{ marginBottom: 40 }}>
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
              About LearnShit: Demystifying Code Execution
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: 'rgba(247, 245, 239, 0.8)',
                margin: 0,
              }}
            >
              LearnShit is an open-source, interactive computer science and data structures learning platform.
              Our goal is to make invisible execution state tangible through real-time code visualizers,
              recursion tree builders, and memory inspection.
            </p>
          </header>

          <section style={{ marginBottom: 44 }}>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                borderBottom: '1px solid rgba(247, 245, 239, 0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              Our Mission
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
              }}
            >
              Computer science students and software engineers frequently struggle with abstract algorithmic concepts—pointers,
              call stacks, tree traversals, and dynamic programming state transitions. Traditional IDEs show only terminal outputs,
              leaving the internal mental model up to guesswork. LearnShit was created to bridge this gap by rendering exact
              step-by-step memory mutations right as code executes.
            </p>
          </section>

          <section style={{ marginBottom: 44 }}>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                borderBottom: '1px solid rgba(247, 245, 239, 0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              In-Browser Client-Side Architecture
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                marginBottom: 16,
              }}
            >
              Unlike traditional online judges that send your code to remote containerized servers, LearnShit executes your code
              entirely within your browser's local sandbox:
            </p>
            <ul
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'var(--text-secondary)',
                paddingLeft: 24,
                marginBottom: 20,
              }}
            >
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Zero Server Latency:</strong> Code compiles and traces inside Web Workers,
                providing instantaneous stepping controls without queue times.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Total Privacy:</strong> Your source code, test inputs, and custom data never leave
                your device or touch external servers.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Multi-Language AST Instrumentation:</strong> Python programs execute with real-time
                frame introspection, while JavaScript, C++, Java, Go, and Rust are transpiled or shimmed with precise source mapping.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 44 }}>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                borderBottom: '1px solid rgba(247, 245, 239, 0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              The Team &amp; Open Source Community
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                marginBottom: 16,
              }}
            >
              LearnShit is maintained by Mradul ({AUTHOR_NAME_PLACEHOLDER}) and Md Dilshan, alongside contributors from the global open-source
              community. The codebase is fully open source under the MIT License on GitHub.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/IamMradul/LearnShit.xyz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span>View on GitHub</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <a
                href="/visualizer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'var(--accent, #D6523A)',
                  color: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Terminal size={14} aria-hidden="true" />
                <span>Try the Visualizer</span>
              </a>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
};
