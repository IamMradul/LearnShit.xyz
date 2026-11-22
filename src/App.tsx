import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MainLayout } from './components/layout/MainLayout';
import { GallerySection } from './components/gallery/GallerySection';
import { ResourcesSection, type ResourceTab } from './components/resources/ResourcesSection';
import { HeroSection } from './components/landing/HeroSection';
import { Footer } from './components/layout/Footer';
import { useUIStore } from './store/uiStore';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const { theme } = useUIStore();
  const [showResources, setShowResources] = useState(false);
  const [resourceTab, setResourceTab] = useState<ResourceTab>('sheets');
  const ideRef = useRef<HTMLDivElement>(null);

  // Apply theme class to <html> on mount and whenever it changes
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  const handleEnterApp = useCallback(() => {
    if (showResources) {
      setShowResources(false);
      setTimeout(() => {
        ideRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      ideRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResources]);

  const handleOpenPlaygrounds = useCallback(() => {
    if (showResources) {
      setShowResources(false);
      setTimeout(() => {
        document.getElementById('gallery-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById('gallery-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResources]);

  const handleGoHome = useCallback(() => {
    setShowResources(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const handleOpenResources = useCallback((tab: ResourceTab = 'sheets') => {
    setResourceTab(tab);
    setShowResources(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

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
        onGoHome={handleGoHome}
        isResourcesView={showResources}
        currentResourceTab={resourceTab}
      />

      {showResources ? (
        <div style={{ paddingTop: 62, minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column' }}>
          <ResourcesSection
            initialTab={resourceTab}
            onTabChange={setResourceTab}
            onBack={handleGoHome}
          />
          <Footer onOpenResources={handleOpenResources} />
        </div>
      ) : (
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
          <Footer onOpenResources={handleOpenResources} />
        </>
      )}

      {/* ── Vercel Web Analytics ── */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
