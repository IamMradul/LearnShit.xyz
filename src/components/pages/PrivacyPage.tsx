import React from 'react';
import { Breadcrumbs } from '../seo/Breadcrumbs';
import { ShieldCheck, Lock, EyeOff, ServerOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <main
      id="main-content"
      style={{
        paddingTop: 80,
        paddingBottom: 80,
        minHeight: '100vh',
        background: '#0a0b0c',
        color: '#F7F5EF',
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
            { name: 'Privacy Policy', url: '/privacy' },
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
                color: '#F7F5EF',
              }}
            >
              Privacy Policy &amp; Client-Side Security
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: 'rgba(247, 245, 239, 0.75)',
                margin: 0,
              }}
            >
              Effective Date: January 1, 2026. Last updated: November 2026.
              LearnShit is engineered with a strict local-first, privacy-by-design architecture.
            </p>
          </header>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#F7F5EF',
                borderBottom: '1px solid rgba(247, 245, 239, 0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              1. Local-Only Code Execution
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(247, 245, 239, 0.75)',
                marginBottom: 12,
              }}
            >
              When you write, debug, or step through algorithms on LearnShit, all execution occurs directly within your web browser
              using Web Workers and local transpilers. At no point is your code, custom input, or trace output transmitted to our servers
              or any third-party computing platform.
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(247, 245, 239, 0.75)',
              }}
            >
              You can verify this in your browser's Developer Tools Network tab: zero POST requests are dispatched during code execution.
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#F7F5EF',
                borderBottom: '1px solid rgba(247, 245, 239, 0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              2. Analytics &amp; Performance Telemetry
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(247, 245, 239, 0.75)',
                marginBottom: 12,
              }}
            >
              To maintain site uptime and optimize Web Vitals performance (such as Core Web Vitals and First Contentful Paint),
              we use lightweight, privacy-focused Vercel Analytics and Speed Insights. These tools:
            </p>
            <ul
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(247, 245, 239, 0.75)',
                paddingLeft: 24,
              }}
            >
              <li>Do NOT use advertising cookies or cross-site tracking fingerprints.</li>
              <li>Do NOT collect personally identifiable information (PII).</li>
              <li>Aggregate aggregate pageview counts and asset loading timings.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#F7F5EF',
                borderBottom: '1px solid rgba(247, 245, 239, 0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              3. Local Storage Usage
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(247, 245, 239, 0.75)',
              }}
            >
              LearnShit uses standard browser <code style={{ color: '#D6523A' }}>localStorage</code> exclusively to preserve your
              editor settings (theme choice, selected programming language, and active layout tabs) across page refreshes.
              This data remains strictly on your local device and can be cleared at any time via your browser settings.
            </p>
          </section>

          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#F7F5EF',
                borderBottom: '1px solid rgba(247, 245, 239, 0.1)',
                paddingBottom: 8,
                marginBottom: 16,
              }}
            >
              4. Contact Us
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'rgba(247, 245, 239, 0.75)',
              }}
            >
              If you have any questions or security disclosures regarding this policy, please open a discussion on our GitHub repository
              or email the maintainers at <a href="mailto:learnshit.xyz@gmail.com" style={{ color: '#D6523A' }}>learnshit.xyz@gmail.com</a>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
};
