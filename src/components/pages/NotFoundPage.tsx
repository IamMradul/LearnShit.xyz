import React from 'react';
import { Breadcrumbs } from '../seo/Breadcrumbs';
import { Terminal, Home, BookOpen, Layers, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <main
      id="main-content"
      style={{
        paddingTop: 100,
        paddingBottom: 100,
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(5rem, 15vw, 8rem)',
            fontWeight: 800,
            lineHeight: 1,
            color: 'var(--accent, #D6523A)',
            letterSpacing: '-0.04em',
            marginBottom: 16,
          }}
        >
          404
        </div>

        <h1
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            margin: '0 0 16px 0',
            color: 'var(--text-primary)',
          }}
        >
          Page Not Found | LearnShit
        </h1>

        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'rgba(247, 245, 239, 0.7)',
            maxWidth: 520,
            margin: '0 auto 36px auto',
          }}
        >
          The page or algorithmic resource you are looking for does not exist or may have been relocated.
          Choose a section below to get back to interactive learning:
        </p>

        <nav
          aria-label="Navigation suggestions"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Home size={16} aria-hidden="true" />
            <span>Return Home</span>
          </a>

          <a
            href="/visualizer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              background: 'var(--accent, #D6523A)',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Terminal size={16} aria-hidden="true" />
            <span>Launch Code Visualizer</span>
          </a>

          <a
            href="/playgrounds"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Layers size={16} aria-hidden="true" />
            <span>Algorithm Playgrounds</span>
          </a>

          <a
            href="/dsa"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 8,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <BookOpen size={16} aria-hidden="true" />
            <span>DSA Guides</span>
          </a>
        </nav>
      </div>
    </main>
  );
};
