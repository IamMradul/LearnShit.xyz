import { useEffect } from 'react';
import { SEO_PAGES, SITE_NAME, DEFAULT_OG_IMAGE, SITE_URL } from './seoConfig';
import type { AppRoute } from '../utils/router';

function updateMetaTag(attributeName: string, attributeValue: string, content: string) {
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function useDocumentHead(route: AppRoute, pathname: string) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const pageSeo = SEO_PAGES[route] || SEO_PAGES['not-found'] || SEO_PAGES.home;

    // Document Title
    document.title = pageSeo.title;

    // Meta Description
    updateMetaTag('name', 'description', pageSeo.description);

    // Meta Robots
    updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large');

    // Canonical Link
    updateLinkTag('canonical', pageSeo.canonicalUrl);

    // Open Graph
    updateMetaTag('property', 'og:site_name', SITE_NAME);
    updateMetaTag('property', 'og:type', pageSeo.ogType || 'website');
    updateMetaTag('property', 'og:title', pageSeo.title);
    updateMetaTag('property', 'og:description', pageSeo.description);
    updateMetaTag('property', 'og:url', pageSeo.canonicalUrl);
    updateMetaTag('property', 'og:image', pageSeo.ogImage || DEFAULT_OG_IMAGE);

    // Twitter Card
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', pageSeo.title);
    updateMetaTag('name', 'twitter:description', pageSeo.description);
    updateMetaTag('name', 'twitter:image', pageSeo.ogImage || DEFAULT_OG_IMAGE);

    // Structured Data (JSON-LD)
    if (pageSeo.structuredData && pageSeo.structuredData.length > 0) {
      let script = document.getElementById('seo-structured-data') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(
        pageSeo.structuredData.length === 1 ? pageSeo.structuredData[0] : pageSeo.structuredData
      );
    }
  }, [route, pathname]);
}
