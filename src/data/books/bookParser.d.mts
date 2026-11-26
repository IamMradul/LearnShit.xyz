export type BookCategory =
  | 'All'
  | 'Algorithms'
  | 'Interview'
  | 'Systems'
  | 'Databases'
  | 'C / C++'
  | 'Python'
  | 'Web & JS'
  | 'ML & Math'
  | 'Core & Langs';

export type StorageProviderType = 'github' | 'r2' | 'custom';

export interface BooksConfig {
  storageProvider: StorageProviderType;
  repository: {
    owner: string;
    repo: string;
    branch: string;
    rootFolder: string;
  };
  publicBaseUrl: string;
  pdfProxyEndpoint: string;
  catalogApiEndpoint: string;
  catalogJsonPath: string;
  catalogCacheTtlMs: number;
  githubApiBaseUrl: string;
  githubRawBaseUrl: string;
  categories: BookCategory[];
  folderDomainMap: Record<string, Exclude<BookCategory, 'All'>>;
}

export interface BookCatalogEntry {
  id: string;
  catalogNo: string;
  title: string;
  author: string;
  category: string;
  domain: Exclude<BookCategory, 'All'>;
  folder: string;
  path: string;
  repoPath: string;
  fileSize: number;
  sizeLabel: string;
  lastUpdated: string;
  pdfUrl: string;
  sha?: string;
  shortTitle: string;
  editionBadge: string;
  presetId?: string;
  presetLabel?: string;
  summary: string;
  artVariant: number;
  paletteIndex: number;
}

export interface BooksCatalogPayload {
  generatedAt: string;
  repository: string;
  branch: string;
  storageProvider: StorageProviderType;
  totalCount: number;
  books: BookCatalogEntry[];
}

export interface CuratedBookOverride {
  title?: string;
  shortTitle?: string;
  author?: string;
  editionBadge?: string;
  presetId?: string;
  presetLabel?: string;
  summary?: string;
  domain?: Exclude<BookCategory, 'All'>;
}

export interface GithubTreeEntry {
  path: string;
  type: string;
  sha?: string;
  size?: number;
}

export function encodeRepoPath(repoPath: string): string;
export function normalizeRepoPath(rawPath: string): string | null;
export function buildDirectPdfUrl(repoPath: string, config: BooksConfig): string;
export function buildGithubBlobUrl(repoPath: string, config: BooksConfig): string;
export function slugifyBookId(repoPath: string, sha: string | undefined, usedIds: Set<string>): string;
export function cleanDirectoryCategory(folder: string): string;
export function extractCategoryFromPath(
  repoPath: string,
  folderDomainMap?: Record<string, Exclude<BookCategory, 'All'>>,
): { folder: string; category: string; domain: Exclude<BookCategory, 'All'> };
export function extractTitleFromFilename(filename: string): string;
export function extractAuthorFromFilename(filename: string): string;
export function formatFileSizeLabel(bytes?: number): string;
export function buildCatalogFromTreeEntries(params: {
  treeEntries: GithubTreeEntry[];
  config: BooksConfig;
  curatedOverrides?: Record<string, CuratedBookOverride>;
  cachedBooksByPath?: Map<string, Partial<BookCatalogEntry>>;
  commitDatesByPath?: Map<string, string>;
  fallbackDate?: string;
}): BookCatalogEntry[];
export function discoverRepositoryPdfs(params: {
  config: BooksConfig;
  githubToken?: string;
  curatedOverrides?: Record<string, CuratedBookOverride>;
  cachedCatalog?: Partial<BooksCatalogPayload> | null;
  fetchCommitDates?: boolean;
  onWarn?: (msg: string) => void;
}): Promise<BooksCatalogPayload>;
