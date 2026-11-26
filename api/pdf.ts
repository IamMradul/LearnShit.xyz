import baseConfig from '../books.config.json';
import { handlePdfProxyRequest } from './_booksServer.mjs';
import type { BooksConfig } from '../src/data/books/bookParser.mjs';

const typedConfig = baseConfig as unknown as BooksConfig;

export async function GET(request: Request): Promise<Response> {
  return handlePdfProxyRequest(request, {
    baseConfig: typedConfig,
    env: process.env,
  });
}

export async function HEAD(request: Request): Promise<Response> {
  return handlePdfProxyRequest(request, {
    baseConfig: typedConfig,
    env: process.env,
  });
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handlePdfProxyRequest(request, {
    baseConfig: typedConfig,
    env: process.env,
  });
}
