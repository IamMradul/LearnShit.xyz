import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { parseRoute } from './utils/router';
import { SEO_PAGES, type PageSeoConfig } from './seo/seoConfig';

export interface RenderResult {
  appHtml: string;
  seo: PageSeoConfig;
  route: string;
}

export function render(url: string): RenderResult {
  const parsedUrl = new URL(url, 'https://learnshit.xyz');

  // Provide SSR mock window object
  const mockWindow = {
    location: {
      pathname: parsedUrl.pathname,
      search: parsedUrl.search,
      hash: parsedUrl.hash,
      href: `https://learnshit.xyz${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    scrollTo: () => {},
    history: {
      pushState: () => {},
      replaceState: () => {},
    },
  };

  (globalThis as unknown as { window: typeof mockWindow }).window = mockWindow;

  // Mock minimal document if needed
  if (typeof (globalThis as unknown as { document: unknown }).document === 'undefined') {
    (globalThis as unknown as { document: { documentElement: { className: string } } }).document = {
      documentElement: {
        className: '',
      },
    };
  }

  const routeState = parseRoute(parsedUrl.pathname, parsedUrl.search, parsedUrl.hash);
  const pageSeo = SEO_PAGES[routeState.route] || SEO_PAGES['not-found'] || SEO_PAGES.home;

  const appHtml = renderToString(<App />);

  return {
    appHtml,
    seo: pageSeo,
    route: routeState.route,
  };
}
