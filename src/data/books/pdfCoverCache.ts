import { useEffect, useState } from 'react';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { CSBook } from './csBooksData';
import { bookStorage } from './bookStorage';

const DB_NAME = 'learnshit-book-covers-v1';
const STORE_NAME = 'covers';
const MAX_CONCURRENT = 2;

const memoryCoverCache = new Map<string, string>();
const failedCache = new Set<string>();
const inFlightMap = new Map<string, Promise<string | null>>();

interface QueueTask {
  key: string;
  book: CSBook;
  priority: number;
  resolve: (url: string | null) => void;
}

const taskQueue: QueueTask[] = [];
let activeCount = 0;

function getCoverCacheKey(book: Pick<CSBook, 'id' | 'sha' | 'path'>): string {
  return `${book.id}:${book.sha || book.path}`;
}

function openCoverDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readCoverFromDb(key: string): Promise<string | null> {
  const db = await openCoverDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeCoverToDb(key: string, dataUrl: string): Promise<void> {
  const db = await openCoverDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function renderFirstPageThumbnail(book: CSBook): Promise<string | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const primaryUrl = book.readerUrl || bookStorage.getReaderPdfUrl(book);
  const fallbackUrl = book.pdfUrl || bookStorage.getDirectPdfUrl(book.repoPath || book.path);

  const loadWithUrl = async (url: string, useRange: boolean) => {
    const task = pdfjsLib.getDocument({
      url,
      rangeChunkSize: 65536,
      disableAutoFetch: useRange,
      disableStream: false,
      disableRange: !useRange,
      withCredentials: false,
    });
    try {
      const doc = await task.promise;
      try {
        const page = await doc.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = 360;
        const scale = Math.min(2, Math.max(0.25, targetWidth / baseViewport.width));
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        // Detect blank or nearly blank Page 1 renders so graphic cover fallback stays visible
        try {
          const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const stepX = Math.max(1, Math.floor(canvas.width / 16));
          const stepY = Math.max(1, Math.floor(canvas.height / 16));
          let inkPixels = 0;
          for (let y = stepY; y < canvas.height - stepY; y += stepY) {
            for (let x = stepX; x < canvas.width - stepX; x += stepX) {
              const idx = (y * canvas.width + x) * 4;
              if (data[idx] < 242 || data[idx + 1] < 242 || data[idx + 2] < 242) {
                inkPixels++;
              }
            }
          }
          if (inkPixels < 3) {
            return null;
          }
        } catch {
          // Ignore pixel sampling errors and return rendered data URL
        }

        return canvas.toDataURL('image/jpeg', 0.86);
      } finally {
        await doc.cleanup().catch(() => {});
      }
    } finally {
      await task.destroy().catch(() => {});
    }
  };

  try {
    const isRangeProxy = primaryUrl.startsWith('/api/');
    return await loadWithUrl(primaryUrl, isRangeProxy);
  } catch {
    if (fallbackUrl && fallbackUrl !== primaryUrl) {
      try {
        return await loadWithUrl(fallbackUrl, false);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function drainQueue() {
  while (activeCount < MAX_CONCURRENT && taskQueue.length > 0) {
    taskQueue.sort((a, b) => b.priority - a.priority);
    const next = taskQueue.shift();
    if (!next) break;

    activeCount++;
    (async () => {
      try {
        const fromDb = await readCoverFromDb(next.key);
        if (fromDb) {
          memoryCoverCache.set(next.key, fromDb);
          next.resolve(fromDb);
          return;
        }
        const rendered = await renderFirstPageThumbnail(next.book);
        if (rendered) {
          memoryCoverCache.set(next.key, rendered);
          await writeCoverToDb(next.key, rendered);
          next.resolve(rendered);
        } else {
          failedCache.add(next.key);
          next.resolve(null);
        }
      } catch {
        failedCache.add(next.key);
        next.resolve(null);
      } finally {
        inFlightMap.delete(next.key);
        activeCount--;
        drainQueue();
      }
    })();
  }
}

function requestBookCover(book: CSBook, priority: number): Promise<string | null> {
  const key = getCoverCacheKey(book);
  const memHit = memoryCoverCache.get(key);
  if (memHit) return Promise.resolve(memHit);
  if (failedCache.has(key)) return Promise.resolve(null);

  const existing = inFlightMap.get(key);
  if (existing) {
    const queued = taskQueue.find((t) => t.key === key);
    if (queued && priority > queued.priority) queued.priority = priority;
    return existing;
  }

  const promise = new Promise<string | null>((resolve) => {
    taskQueue.push({ key, book, priority, resolve });
    drainQueue();
  });
  inFlightMap.set(key, promise);
  return promise;
}

/**
 * Lazily retrieves and caches the actual Page 1 cover image of a book PDF,
 * reading from in-memory + IndexedDB caches first and streaming via HTTP Range
 * chunks on first view.
 */
export function usePdfBookCover(
  book: CSBook,
  shouldLoad: boolean,
  priority = 1,
): string | null {
  const key = getCoverCacheKey(book);
  const memUrl = memoryCoverCache.get(key) ?? null;
  const [resolved, setResolved] = useState<{ key: string; url: string | null }>({
    key,
    url: memUrl,
  });

  useEffect(() => {
    if (memoryCoverCache.has(key)) return;

    let cancelled = false;

    if (!shouldLoad) {
      readCoverFromDb(key).then((cached) => {
        if (!cancelled && cached) {
          memoryCoverCache.set(key, cached);
          setResolved({ key, url: cached });
        }
      });
      return () => {
        cancelled = true;
      };
    }

    requestBookCover(book, priority).then((url) => {
      if (!cancelled && url) {
        setResolved({ key, url });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [book, key, shouldLoad, priority]);

  if (memUrl) return memUrl;
  return resolved.key === key ? resolved.url : null;
}
