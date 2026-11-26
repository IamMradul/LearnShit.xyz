import { useEffect, useState } from 'react';
import { CS_BOOKS, mapCatalogEntryToCSBook, type CSBook } from './csBooksData';
import { BOOKS_CONFIG } from './booksConfig';
import type { BookCatalogEntry, BooksCatalogPayload } from './bookParser.mjs';

const CATALOG_CACHE_KEY = 'learnshit-books-catalog-v1';

interface CachedCatalogRecord {
  fetchedAt: number;
  generatedAt?: string;
  books: BookCatalogEntry[];
}

function readCachedCatalog(): CachedCatalogRecord | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCatalogRecord;
    if (!parsed || !Array.isArray(parsed.books) || parsed.books.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedCatalog(books: BookCatalogEntry[], generatedAt?: string) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const record: CachedCatalogRecord = {
      fetchedAt: Date.now(),
      generatedAt,
      books,
    };
    window.localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

function catalogSignature(books: Pick<BookCatalogEntry, 'id' | 'sha' | 'path'>[]): string {
  return books.map((b) => `${b.id}:${b.sha || b.path}`).join('|');
}

/**
 * Provides the book catalog immediately from pre-built SSG data while refreshing
 * cleanly from `/api/books-catalog` (with `/books-catalog.json` fallback) under
 * a client-side cache TTL so visitor loads never hammer the GitHub API.
 */
export function useBooksCatalog(): { books: CSBook[]; isRefreshing: boolean } {
  const [books, setBooks] = useState<CSBook[]>(CS_BOOKS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const cached = readCachedCatalog();
    if (cached && cached.books.length > 0) {
      const cachedMapped = cached.books.map(mapCatalogEntryToCSBook);
      setBooks((prev) =>
        catalogSignature(prev) === catalogSignature(cachedMapped) ? prev : cachedMapped,
      );
    }

    const ttlMs = BOOKS_CONFIG.catalogCacheTtlMs || 1800000;
    if (cached && Date.now() - cached.fetchedAt < ttlMs) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function refreshCatalog() {
      setIsRefreshing(true);
      const endpoints = [BOOKS_CONFIG.catalogApiEndpoint, BOOKS_CONFIG.catalogJsonPath].filter(Boolean);

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, { signal: controller.signal });
          if (!res.ok) continue;
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json') && !endpoint.endsWith('.json')) {
            continue;
          }
          const payload = (await res.json()) as Partial<BooksCatalogPayload>;
          if (!payload || !Array.isArray(payload.books) || payload.books.length === 0) {
            continue;
          }

          if (!cancelled) {
            writeCachedCatalog(payload.books, payload.generatedAt);
            const nextMapped = payload.books.map(mapCatalogEntryToCSBook);
            setBooks((prev) =>
              catalogSignature(prev) === catalogSignature(nextMapped) ? prev : nextMapped,
            );
          }
          break;
        } catch {
          // Try next endpoint cleanly
        }
      }

      if (!cancelled) {
        setIsRefreshing(false);
      }
    }

    refreshCatalog();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { books, isRefreshing };
}
