import React, { useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MainLayout } from './components/layout/MainLayout';
import { GallerySection } from './components/gallery/GallerySection';
import { ResourcesSection, type ResourceTab } from './components/resources/ResourcesSection';
import { HeroSection } from './components/landing/HeroSection';
import { Footer } from './components/layout/Footer';
import { DsaHub } from './components/dsa/DsaHub';
import { BooksPage } from './components/books/BooksPage';
import { PlaygroundsPage } from './components/pages/PlaygroundsPage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { useUIStore } from './store/uiStore';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useRouter, navigate } from './utils/router';
import { useDocumentHead } from './seo/useDocumentHead';

export default function App() {
  const { theme } = useUIStore();
  const { route, pathname, tab, hash } = useRouter();
  const ideRef = useRef<HTMLDivElement>(null);

  // Sync SEO metadata and JSON-LD on route transitions
  useDocumentHead(route, pathname);

  // Apply theme class to <html> on mount and whenever it changes
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  // Handle hash scrolling on home page (e.g. /#gallery-anchor)
  useEffect(() => {
    if (route === 'home' && hash) {
      const anchorId = hash.replace(/^#/, '');
      const el = document.getElementById(anchorId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60);
      }
    }
  }, [route, hash]);

  const handleEnterApp = useCallback(() => {
    navigate('/visualizer');
  }, []);

  const handleOpenPlaygrounds = useCallback(() => {
    navigate('/playgrounds');
  }, []);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, []);

  const handleOpenResources = useCallback((targetTab: ResourceTab = 'sheets') => {
    navigate(`/resources?tab=${targetTab}`);
  }, []);

  const handleOpenDsa = useCallback(() => {
    navigate('/dsa');
  }, []);

  const handleOpenBooks = useCallback(() => {
    navigate('/books');
  }, []);

  const isResourcesView = route === 'resources';
  const isVisualizerView = route === 'visualizer';
  const isDsaView = route === 'dsa';
  const isBooksView = route === 'books';
  const isPlaygroundsView = route === 'playgrounds';
  const currentResourceTab: ResourceTab =
    tab === 'books' || tab === 'learnshit-sheet' ? tab : 'sheets';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* ── Skip to Main Content Link for Accessibility ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 9999,
          padding: '8px 16px',
          background: 'var(--accent, #D6523A)',
          color: '#ffffff',
          fontWeight: 700,
          borderRadius: 6,
          textDecoration: 'none',
        }}
      >
        Skip to main content
      </a>

      {/* ── Global Persistent Navigation Bar ── */}
      <Navbar
        onOpenVisualizer={handleEnterApp}
        onOpenPlaygrounds={handleOpenPlaygrounds}
        onOpenResources={handleOpenResources}
        onOpenDsa={handleOpenDsa}
        onOpenBooks={handleOpenBooks}
        onGoHome={handleGoHome}
        isResourcesView={isResourcesView}
        isVisualizerView={isVisualizerView}
        isDsaView={isDsaView}
        isBooksView={isBooksView}
        isPlaygroundsView={isPlaygroundsView}
        currentResourceTab={currentResourceTab}
      />

      {isResourcesView && (
        <main id="main-content" style={{ paddingTop: 62, minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column' }}>
          <ResourcesSection
            initialTab={currentResourceTab}
            onTabChange={(nextTab) => navigate(`/resources?tab=${nextTab}`, { scroll: false })}
            onBack={handleGoHome}
          />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </main>
      )}

      {isDsaView && (
        <main id="main-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <DsaHub onBackToHome={handleGoHome} />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </main>
      )}

      {isBooksView && (
        <main id="main-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <BooksPage />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </main>
      )}

      {isVisualizerView && (
        <main
          id="main-content"
          style={{
            marginTop: 62,
            height: 'calc(100vh - 62px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--bg-primary)',
          }}
        >
          <MainLayout />
        </main>
      )}

      {route === 'playgrounds' && (
        <>
          <PlaygroundsPage />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </>
      )}

      {route === 'about' && (
        <>
          <AboutPage />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </>
      )}

      {route === 'contact' && (
        <>
          <ContactPage />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </>
      )}

      {route === 'privacy' && (
        <>
          <PrivacyPage />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </>
      )}

      {route === 'not-found' && (
        <>
          <NotFoundPage />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </>
      )}

      {route === 'home' && (
        <main id="main-content">
          {/* ── Hero landing (100vh) ── */}
          <HeroSection
            onEnterApp={handleEnterApp}
            onOpenResources={handleOpenResources}
          />

          {/* ── IDE workspace (100vh) ── */}
          <section
            ref={ideRef}
            id="ide-anchor"
            aria-label="Code Visualizer Editor"
            style={{
              height: '100vh',
              flexShrink: 0,
              background: 'var(--bg-primary)',
            }}
          >
            <MainLayout />
          </section>

          {/* ── Algorithm gallery below ── */}
          <section id="gallery-anchor" aria-label="Algorithm Gallery">
            <GallerySection />
          </section>

          {/* ── Platform Footer & Contact ── */}
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </main>
      )}

      {/* ── Vercel Web Analytics ── */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
