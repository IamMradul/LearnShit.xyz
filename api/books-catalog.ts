import baseConfig from '../books.config.json';
import curatedOverrides from '../src/data/books/curatedMetadata.json';
import staticCatalog from '../src/data/books/booksCatalog.json';
import { handleBooksCatalogRequest } from './_booksServer.mjs';
import type {
  BooksCatalogPayload,
  BooksConfig,
  CuratedBookOverride,
} from '../src/data/books/bookParser.mjs';

export async function GET(request: Request): Promise<Response> {
  return handleBooksCatalogRequest(request, {
    baseConfig: baseConfig as unknown as BooksConfig,
    curatedOverrides: curatedOverrides as Record<string, CuratedBookOverride>,
    staticCatalog: staticCatalog as unknown as BooksCatalogPayload,
    env: process.env,
  });
}
