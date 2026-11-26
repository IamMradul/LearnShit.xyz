import rawConfig from '../../../books.config.json';
import type { BooksConfig, StorageProviderType } from './bookParser.mjs';

const envProvider = import.meta.env.VITE_BOOKS_STORAGE_PROVIDER as StorageProviderType | undefined;
const envPublicBaseUrl = import.meta.env.VITE_BOOKS_STORAGE_BASE_URL as string | undefined;
const envProxyEndpoint = import.meta.env.VITE_BOOKS_PROXY_ENDPOINT as string | undefined;

export const BOOKS_CONFIG: BooksConfig = {
  ...(rawConfig as BooksConfig),
  storageProvider: envProvider || (rawConfig as BooksConfig).storageProvider,
  publicBaseUrl: envPublicBaseUrl ?? (rawConfig as BooksConfig).publicBaseUrl,
  pdfProxyEndpoint: envProxyEndpoint || (rawConfig as BooksConfig).pdfProxyEndpoint,
};
