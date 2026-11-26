import React from 'react';
import { GallerySection } from '../gallery/GallerySection';
import { Breadcrumbs } from '../seo/Breadcrumbs';
import { Sparkles, Terminal, BookOpen, Layers } from 'lucide-react';

export const PlaygroundsPage: React.FC = () => {
  return (
    <main
      id="main-content"
      style={{
        paddingTop: 80,
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Playgrounds', url: '/playgrounds' },
          ]}
        />

        <header style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 20,
              background: 'rgba(214, 82, 58, 0.12)',
              border: '1px solid rgba(214, 82, 58, 0.3)',
              color: '#D6523A',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            <Sparkles size={13} aria-hidden="true" />
            <span>Interactive Data Structure Lab</span>
          </div>

          <h1
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
              margin: '0 0 12px 0',
              color: 'var(--text-primary)',
            }}
          >
            Interactive Algorithm Playgrounds &amp; Visualizations
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: 820,
              margin: 0,
            }}
          >
            Explore, customize, and simulate fundamental algorithms and data structures in real time.
            Step through sorting routines (Bubble, Selection, Insertion, Merge, Quick Sort), Binary Search Trees,
            and Graph traversals with automated pointer highlighting and step-by-step state mutations.
          </p>

          <nav
            aria-label="Related tools"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 20,
            }}
          >
            <a
              href="/visualizer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
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
              <Terminal size={14} aria-hidden="true" />
              <span>Launch Full Code Visualizer</span>
            </a>
            <a
              href="/dsa"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
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
              <BookOpen size={14} aria-hidden="true" />
              <span>DSA Curriculum &amp; Patterns</span>
            </a>
            <a
              href="/resources?tab=sheets"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
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
              <Layers size={14} aria-hidden="true" />
              <span>Curated Practice Sheets</span>
            </a>
          </nav>
        </header>

        {/* Gallery visualization cards */}
        <section aria-label="Algorithm Playground Modules" style={{ paddingBottom: 60 }}>
          <GallerySection />
        </section>
      </div>
    </main>
  );
};
