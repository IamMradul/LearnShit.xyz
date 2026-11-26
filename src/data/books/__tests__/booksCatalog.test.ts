import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BOOKS_CATALOG,
  BOOK_CATEGORIES,
  buildGithubBlobUrl,
  buildGithubRawUrl,
} from '../booksCatalog';
import { CS_BOOKS } from '../csBooksData';
import { BOOKS_CONFIG } from '../booksConfig';
import { createBookStorageProvider } from '../bookStorage';
import {
  buildCatalogFromTreeEntries,
  cleanDirectoryCategory,
  discoverRepositoryPdfs,
  extractAuthorFromFilename,
  extractCategoryFromPath,
  extractTitleFromFilename,
  formatFileSizeLabel,
  normalizeRepoPath,
  slugifyBookId,
} from '../bookParser.mjs';
import { handlePdfProxyRequest, handleBooksCatalogRequest } from '../../../../api/_booksServer.mjs';

describe('CS Books Dynamic Catalog & Parser', () => {
  it('loads all discovered books with unique IDs and required schema fields', () => {
    expect(BOOKS_CATALOG.length).toBeGreaterThanOrEqual(100);
    const ids = new Set(BOOKS_CATALOG.map((b) => b.id));
    expect(ids.size).toBe(BOOKS_CATALOG.length);

    for (const book of BOOKS_CATALOG) {
      expect(book.id).toBeTruthy();
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
      expect(book.category).toBeTruthy();
      expect(BOOK_CATEGORIES).toContain(book.domain);
      expect(typeof book.fileSize).toBe('number');
      expect(book.fileSize).toBeGreaterThan(0);
      expect(book.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(book.pdfUrl).toMatch(/^https:\/\//);
      expect(book.path).toMatch(/\.pdf$/i);
    }

    expect(CS_BOOKS.length).toBe(BOOKS_CATALOG.length);
  });

  it('handles duplicate filenames across different folders without duplicate IDs', () => {
    const usedIds = new Set<string>();
    const id1 = slugifyBookId('Algorithms/Notes.pdf', 'aaaa1111', usedIds);
    const id2 = slugifyBookId('Databases/Notes.pdf', 'bbbb2222', usedIds);
    const id3 = slugifyBookId('Algorithms/Notes.pdf', 'cccc3333', usedIds);

    expect(id1).not.toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id2).not.toBe(id3);

    const built = buildCatalogFromTreeEntries({
      config: BOOKS_CONFIG,
      fallbackDate: '2026-11-26',
      treeEntries: [
        { path: 'Algorithms/Notes.pdf', type: 'blob', sha: '111111', size: 120000 },
        { path: 'Python/Notes.pdf', type: 'blob', sha: '222222', size: 340000 },
        { path: 'Algorithms/README.md', type: 'blob', sha: '333333', size: 500 },
      ],
    });

    expect(built).toHaveLength(2);
    expect(built[0].id).not.toBe(built[1].id);
    expect(built[0].category).toBe('Algorithms');
    expect(built[1].category).toBe('Python');
    expect(built[0].domain).toBe('Algorithms');
    expect(built[1].domain).toBe('Python');
  });

  it('extracts clean titles, authors, categories, and sizes cleanly', () => {
    expect(extractTitleFromFilename('iOSNotesForProfessionals.pdf')).toBe(
      'iOS Notes for Professionals',
    );
    expect(extractTitleFromFilename('TypeScriptNotesForProfessionals.pdf')).toBe(
      'TypeScript Notes for Professionals',
    );
    expect(extractTitleFromFilename('Data_Structures-Manual [Alice Smith] (2).PDF')).toBe(
      'Data Structures Manual',
    );
    expect(extractAuthorFromFilename('Book [Donald_E._Knuth] (3).pdf')).toBe('Donald E. Knuth');
    expect(extractAuthorFromFilename('PythonNotesForProfessionals.pdf')).toBe(
      'GoalKicker Community',
    );
    expect(extractAuthorFromFilename('StandaloneBook.pdf')).toBe('Unknown');

    expect(cleanDirectoryCategory('System Design 💻')).toBe('System Design');
    expect(cleanDirectoryCategory('C-C++')).toBe('C / C++');
    expect(extractCategoryFromPath('Operating system/OSTEP.pdf', BOOKS_CONFIG.folderDomainMap)).toEqual({
      folder: 'Operating system',
      category: 'Operating System',
      domain: 'Systems',
    });

    expect(formatFileSizeLabel(43832)).toBe('43 KB');
    expect(formatFileSizeLabel(5458571)).toBe('5.2 MB');
    expect(formatFileSizeLabel(0)).toBe('Unknown size');
  });

  it('validates repo paths safely and supports GitHub & Cloudflare R2 storage switching', () => {
    expect(normalizeRepoPath('../secret.pdf')).toBeNull();
    expect(normalizeRepoPath('https://evil.com/x.pdf')).toBeNull();
    expect(normalizeRepoPath('Algorithm/notes.txt')).toBeNull();
    expect(normalizeRepoPath('/Algorithm/CLRS.pdf')).toBe('Algorithm/CLRS.pdf');

    const githubStorage = createBookStorageProvider(BOOKS_CONFIG);
    const sampleBook = {
      repoPath: 'Algorithm/Introduction to Algorithms.pdf',
      path: 'Algorithm/Introduction to Algorithms.pdf',
      pdfUrl: buildGithubRawUrl('Algorithm/Introduction to Algorithms.pdf'),
    };
    expect(githubStorage.providerId).toBe('github');
    expect(githubStorage.getReaderPdfUrl(sampleBook)).toBe(
      '/api/pdf?path=Algorithm%2FIntroduction%20to%20Algorithms.pdf',
    );
    expect(githubStorage.getDownloadPdfUrl(sampleBook)).toBe(
      '/api/pdf?path=Algorithm%2FIntroduction%20to%20Algorithms.pdf&download=1',
    );
    expect(buildGithubBlobUrl('Algorithm/CLRS.pdf')).toContain('/blob/main/Algorithm/CLRS.pdf');

    const r2Storage = createBookStorageProvider({
      ...BOOKS_CONFIG,
      storageProvider: 'r2',
      publicBaseUrl: 'https://cdn.example.com/books',
    });
    expect(r2Storage.getDirectPdfUrl('Algorithm/CLRS.pdf')).toBe(
      'https://cdn.example.com/books/Algorithm/CLRS.pdf',
    );
    expect(
      r2Storage.getReaderPdfUrl({
        repoPath: 'Algorithm/CLRS.pdf',
        path: 'Algorithm/CLRS.pdf',
        pdfUrl: 'https://cdn.example.com/books/Algorithm/CLRS.pdf',
      }),
    ).toBe('https://cdn.example.com/books/Algorithm/CLRS.pdf');
  });
});

describe('GitHub Discovery & Proxy API Handlers', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('discovers PDFs dynamically and reflects additions, removals, and renames', async () => {
    globalThis.fetch = vi.fn(async (url: string | URL | Request) => {
      const u = String(url);
      if (u.endsWith('/repos/IamMradul/CS-and-Programming-Books')) {
        return new Response(JSON.stringify({ pushed_at: '2026-11-26T12:00:00Z' }), {
          status: 200,
          headers: { 'x-ratelimit-remaining': '50' },
        });
      }
      if (u.includes('/git/trees/')) {
        return new Response(
          JSON.stringify({
            truncated: false,
            tree: [
              { path: 'Algorithm/NewBook.pdf', type: 'blob', sha: 'newsha1', size: 1024000 },
              { path: 'README.md', type: 'blob', sha: 'mdsha', size: 200 },
            ],
          }),
          { status: 200, headers: { 'x-ratelimit-remaining': '49' } },
        );
      }
      if (u.includes('/commits?')) {
        return new Response(
          JSON.stringify([{ commit: { committer: { date: '2026-11-25T10:00:00Z' } } }]),
          { status: 200 },
        );
      }
      return new Response('Not found', { status: 404 });
    }) as typeof fetch;

    const payload = await discoverRepositoryPdfs({
      config: BOOKS_CONFIG,
      cachedCatalog: { books: [{ path: 'Algorithm/OldRemoved.pdf', sha: 'oldsha' } as never] },
      fetchCommitDates: true,
    });

    expect(payload.books).toHaveLength(1);
    expect(payload.books[0].title).toBe('New Book');
    expect(payload.books[0].fileSize).toBe(1024000);
    expect(payload.books[0].lastUpdated).toBe('2026-11-25');
  });

  it('forwards Range requests and returns clean errors from /api/pdf handler', async () => {
    const badReq = new Request('http://localhost/api/pdf?path=../etc/passwd');
    const badRes = await handlePdfProxyRequest(badReq, { baseConfig: BOOKS_CONFIG });
    expect(badRes.status).toBe(400);

    globalThis.fetch = vi.fn(async (_url, init) => {
      const reqHeaders = new Headers(init?.headers);
      expect(reqHeaders.get('range')).toBe('bytes=0-1023');
      return new Response(new Uint8Array([37, 80, 68, 70]), {
        status: 206,
        headers: {
          'accept-ranges': 'bytes',
          'content-range': 'bytes 0-1023/5458571',
          'content-length': '1024',
        },
      });
    }) as typeof fetch;

    const rangeReq = new Request(
      'http://localhost/api/pdf?path=Algorithm%2FIntroduction%20to%20Algorithms.pdf',
      { headers: { Range: 'bytes=0-1023' } },
    );
    const rangeRes = await handlePdfProxyRequest(rangeReq, { baseConfig: BOOKS_CONFIG });
    expect(rangeRes.status).toBe(206);
    expect(rangeRes.headers.get('content-type')).toBe('application/pdf');
    expect(rangeRes.headers.get('content-range')).toBe('bytes 0-1023/5458571');
    expect(rangeRes.headers.get('accept-ranges')).toBe('bytes');

    globalThis.fetch = vi.fn(async () => new Response('Missing', { status: 404 })) as typeof fetch;
    const missingReq = new Request('http://localhost/api/pdf?path=Algorithm/Deleted.pdf');
    const missingRes = await handlePdfProxyRequest(missingReq, { baseConfig: BOOKS_CONFIG });
    expect(missingRes.status).toBe(404);
  });

  it('falls back to static catalog on GitHub API rate limit in /api/books-catalog', async () => {
    globalThis.fetch = vi.fn(async () => new Response('Rate limit exceeded', { status: 403 })) as typeof fetch;

    const req = new Request('http://localhost/api/books-catalog?refresh=1');
    const res = await handleBooksCatalogRequest(req, {
      baseConfig: BOOKS_CONFIG,
      staticCatalog: {
        generatedAt: '2026-11-26T00:00:00Z',
        repository: 'IamMradul/CS-and-Programming-Books',
        branch: 'main',
        storageProvider: 'github',
        totalCount: 1,
        books: [BOOKS_CATALOG[0]],
      },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-catalog-source')).toBe('static-fallback');
    const body = await res.json();
    expect(body.books).toHaveLength(1);
  });
});
