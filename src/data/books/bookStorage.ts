import { BOOKS_CONFIG } from './booksConfig';
import {
  buildDirectPdfUrl as buildDirectUrlFromConfig,
  buildGithubBlobUrl as buildBlobUrlFromConfig,
  normalizeRepoPath,
  type BookCatalogEntry,
  type BooksConfig,
} from './bookParser.mjs';

export interface BookStorageProvider {
  providerId: BooksConfig['storageProvider'];
  getDirectPdfUrl(repoPath: string): string;
  getReaderPdfUrl(book: Pick<BookCatalogEntry, 'repoPath' | 'path' | 'pdfUrl'>): string;
  getDownloadPdfUrl(book: Pick<BookCatalogEntry, 'repoPath' | 'path' | 'pdfUrl'>): string;
  getRepositoryBrowseUrl(repoPath: string): string;
}

/**
 * Modular book storage resolver.
 *
 * Uses same-origin `/api/pdf?path=...` for reading so PDF.js can stream large
 * PDFs via HTTP Range (206 Partial Content) without GitHub raw CORS preflight
 * blocks, while cleanly falling back or switching directly to Cloudflare R2 /
 * custom object storage when configured.
 */
export function createBookStorageProvider(config: BooksConfig = BOOKS_CONFIG): BookStorageProvider {
  return {
    providerId: config.storageProvider,

    getDirectPdfUrl(repoPath: string): string {
      return buildDirectUrlFromConfig(repoPath, config);
    },

    getReaderPdfUrl(book): string {
      const repoPath = normalizeRepoPath(book.repoPath || book.path);
      if (config.storageProvider === 'r2' || config.storageProvider === 'custom') {
        const direct = book.pdfUrl || (repoPath ? buildDirectUrlFromConfig(repoPath, config) : '');
        if (config.publicBaseUrl && direct) return direct;
      }

      if (repoPath && config.pdfProxyEndpoint) {
        return `${config.pdfProxyEndpoint}?path=${encodeURIComponent(repoPath)}`;
      }
      return book.pdfUrl || (repoPath ? buildDirectUrlFromConfig(repoPath, config) : '');
    },

    getDownloadPdfUrl(book): string {
      const repoPath = normalizeRepoPath(book.repoPath || book.path);
      if (config.storageProvider === 'r2' || config.storageProvider === 'custom') {
        if (config.publicBaseUrl && repoPath) {
          return buildDirectUrlFromConfig(repoPath, config);
        }
      }
      if (repoPath && config.pdfProxyEndpoint) {
        return `${config.pdfProxyEndpoint}?path=${encodeURIComponent(repoPath)}&download=1`;
      }
      return book.pdfUrl || (repoPath ? buildDirectUrlFromConfig(repoPath, config) : '');
    },

    getRepositoryBrowseUrl(repoPath: string): string {
      return buildBlobUrlFromConfig(repoPath, config);
    },
  };
}

export const bookStorage = createBookStorageProvider();
