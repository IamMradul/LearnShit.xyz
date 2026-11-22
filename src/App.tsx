import React, { useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MainLayout } from './components/layout/MainLayout';
import { GallerySection } from './components/gallery/GallerySection';
import { ResourcesSection, type ResourceTab } from './components/resources/ResourcesSection';
import { HeroSection } from './components/landing/HeroSection';
import { Footer } from './components/layout/Footer';
import { DsaHub } from './components/dsa/DsaHub';
import { useUIStore } from './store/uiStore';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useRouter, navigate } from './utils/router';

export default function App() {
  const { theme } = useUIStore();
  const { route, tab, hash } = useRouter();
  const ideRef = useRef<HTMLDivElement>(null);

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
    if (route === 'home') {
      document.getElementById('gallery-anchor')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#gallery-anchor');
    }
  }, [route]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, []);

  const handleOpenResources = useCallback((targetTab: ResourceTab = 'sheets') => {
    navigate(`/resources?tab=${targetTab}`);
  }, []);

  const handleOpenDsa = useCallback(() => {
    navigate('/dsa');
  }, []);

  const isResourcesView = route === 'resources';
  const isVisualizerView = route === 'visualizer';
  const isDsaView = route === 'dsa';
  const currentResourceTab: ResourceTab =
    tab === 'books' || tab === 'learnshit-sheet' ? tab : 'sheets';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#0a0b0c',
      }}
    >
      {/* ── Global Persistent Navigation Bar ── */}
      <Navbar
        onOpenVisualizer={handleEnterApp}
        onOpenPlaygrounds={handleOpenPlaygrounds}
        onOpenResources={handleOpenResources}
        onOpenDsa={handleOpenDsa}
        onGoHome={handleGoHome}
        isResourcesView={isResourcesView}
        isVisualizerView={isVisualizerView}
        isDsaView={isDsaView}
        currentResourceTab={currentResourceTab}
      />

      {isResourcesView && (
        <div style={{ paddingTop: 62, minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column' }}>
          <ResourcesSection
            initialTab={currentResourceTab}
            onTabChange={(nextTab) => navigate(`/resources?tab=${nextTab}`, { scroll: false })}
            onBack={handleGoHome}
          />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </div>
      )}

      {isDsaView && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <DsaHub onBackToHome={handleGoHome} />
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </div>
      )}

      {isVisualizerView && (
        <div
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
        </div>
      )}

      {route === 'home' && (
        <>
          {/* ── Hero landing (100vh) ── */}
          <HeroSection
            onEnterApp={handleEnterApp}
            onOpenResources={handleOpenResources}
          />

          {/* ── IDE workspace (100vh) ── */}
          <div
            ref={ideRef}
            id="ide-anchor"
            style={{
              height: '100vh',
              flexShrink: 0,
              background: 'var(--bg-primary)',
            }}
          >
            <MainLayout />
          </div>

          {/* ── Algorithm gallery below ── */}
          <div id="gallery-anchor">
            <GallerySection />
          </div>

          {/* ── Platform Footer & Contact ── */}
          <Footer onOpenResources={handleOpenResources} onOpenDsa={handleOpenDsa} />
        </>
      )}

      {/* ── Vercel Web Analytics ── */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
