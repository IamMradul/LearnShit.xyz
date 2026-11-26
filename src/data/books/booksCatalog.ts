import catalogJson from './booksCatalog.json';
import { BOOKS_CONFIG } from './booksConfig';
import {
  buildDirectPdfUrl as buildDirectUrl,
  buildGithubBlobUrl as buildBlobUrl,
  type BookCatalogEntry,
  type BookCategory,
  type BooksCatalogPayload,
} from './bookParser.mjs';

export type { BookCatalogEntry, BookCategory, BooksCatalogPayload };

export const REPO_BASE_URL = `https://github.com/${BOOKS_CONFIG.repository.owner}/${BOOKS_CONFIG.repository.repo}`;

export function buildGithubBlobUrl(repoPath: string): string {
  return buildBlobUrl(repoPath, BOOKS_CONFIG);
}

export function buildGithubRawUrl(repoPath: string): string {
  return buildDirectUrl(repoPath, BOOKS_CONFIG);
}

export const BOOK_CATEGORIES: BookCategory[] = BOOKS_CONFIG.categories;

const STATIC_PAYLOAD = catalogJson as BooksCatalogPayload;

export const BOOKS_CATALOG_META = {
  generatedAt: STATIC_PAYLOAD.generatedAt,
  repository: STATIC_PAYLOAD.repository,
  branch: STATIC_PAYLOAD.branch,
  totalCount: STATIC_PAYLOAD.books.length,
};

export const BOOKS_CATALOG: BookCatalogEntry[] = STATIC_PAYLOAD.books;
