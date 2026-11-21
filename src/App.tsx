import React, { useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MainLayout } from './components/layout/MainLayout';
import { GallerySection } from './components/gallery/GallerySection';
import { ResourcesSection } from './components/resources/ResourcesSection';
import { HeroSection } from './components/landing/HeroSection';
import { Footer } from './components/layout/Footer';
import { useUIStore } from './store/uiStore';
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  const { theme } = useUIStore();
  const ideRef = useRef<HTMLDivElement>(null);

  // Apply theme class to <html> on mount and whenever it changes
  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  const handleEnterApp = useCallback(() => {
    ideRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <Navbar onOpenVisualizer={handleEnterApp} />

      {/* ── Hero landing (100vh) ── */}
      <HeroSection onEnterApp={handleEnterApp} />

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

      {/* ── Developer Resources & Cheatsheet ── */}
      <div id="resources-anchor">
        <ResourcesSection onOpenVisualizer={handleEnterApp} />
      </div>

      {/* ── Platform Footer & Contact ── */}
      <Footer />

      <Analytics />
    </div>
  );
}
