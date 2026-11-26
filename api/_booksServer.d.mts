import type {
  BooksCatalogPayload,
  BooksConfig,
  CuratedBookOverride,
} from '../src/data/books/bookParser.mjs';

export function resolveBooksConfig(
  baseConfig: BooksConfig,
  env?: Record<string, string | undefined>,
): BooksConfig;

export function handlePdfProxyRequest(
  request: Request,
  options: {
    baseConfig: BooksConfig;
    env?: Record<string, string | undefined>;
  },
): Promise<Response>;

export function handleBooksCatalogRequest(
  request: Request,
  options: {
    baseConfig: BooksConfig;
    curatedOverrides?: Record<string, CuratedBookOverride>;
    staticCatalog?: BooksCatalogPayload | null;
    env?: Record<string, string | undefined>;
  },
): Promise<Response>;
