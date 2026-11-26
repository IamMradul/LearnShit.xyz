import { useState, useEffect } from 'react';

export type AppRoute =
  | 'home'
  | 'visualizer'
  | 'resources'
  | 'dsa'
  | 'books'
  | 'playgrounds'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'not-found';

export interface RouteState {
  route: AppRoute;
  pathname: string;
  search: string;
  tab?: string;
  hash?: string;
}

export function parseRoute(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/',
  search: string = typeof window !== 'undefined' ? window.location.search : '',
  hash: string = typeof window !== 'undefined' ? window.location.hash : ''
): RouteState {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(search);
  const tab = searchParams.get('tab') || undefined;

  if (cleanPath === '/' || cleanPath === '') {
    return { route: 'home', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/books' || cleanPath.startsWith('/books/')) {
    return { route: 'books', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/playgrounds' || cleanPath.startsWith('/playgrounds/')) {
    return { route: 'playgrounds', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/about' || cleanPath.startsWith('/about/')) {
    return { route: 'about', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/contact' || cleanPath.startsWith('/contact/')) {
    return { route: 'contact', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/privacy' || cleanPath.startsWith('/privacy/')) {
    return { route: 'privacy', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/404') {
    return { route: 'not-found', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/resources' || cleanPath.startsWith('/resources/')) {
    return { route: 'resources', pathname: cleanPath, search, tab, hash };
  }
  if (cleanPath === '/visualizer' || cleanPath === '/ide' || cleanPath.startsWith('/visualizer/')) {
    return { route: 'visualizer', pathname: cleanPath, search, tab, hash };
  }
  if (
    cleanPath === '/dsa' ||
    cleanPath === '/algorithms' ||
    cleanPath === '/data-structures' ||
    cleanPath.startsWith('/dsa/')
  ) {
    return { route: 'dsa', pathname: cleanPath, search, tab, hash };
  }

  return { route: 'not-found', pathname: cleanPath, search, tab, hash };
}

export function navigate(to: string, options: { replace?: boolean; scroll?: boolean } = {}) {
  if (typeof window === 'undefined') return;

  const { replace = false, scroll = true } = options;
  if (replace) {
    window.history.replaceState(null, '', to);
  } else {
    window.history.pushState(null, '', to);
  }

  // Notify active router subscribers
  window.dispatchEvent(new Event('popstate'));

  if (scroll) {
    if (to.includes('#')) {
      const anchorId = to.split('#')[1];
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }
  }
}

export function useRouter(): RouteState & { navigate: typeof navigate } {
  const [routeState, setRouteState] = useState<RouteState>(() => parseRoute());

  useEffect(() => {
    const handleLocationChange = () => {
      setRouteState(parseRoute(window.location.pathname, window.location.search, window.location.hash));
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return {
    ...routeState,
    navigate,
  };
}
