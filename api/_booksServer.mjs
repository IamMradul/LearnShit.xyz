import {
  buildDirectPdfUrl,
  discoverRepositoryPdfs,
  normalizeRepoPath,
} from '../src/data/books/bookParser.mjs';

const MEMORY_CACHE_TTL_MS = 30 * 60 * 1000;
let memoryCatalogCache = null;

export function resolveBooksConfig(baseConfig, env = {}) {
  return {
    ...baseConfig,
    storageProvider: env.BOOKS_STORAGE_PROVIDER || baseConfig.storageProvider,
    publicBaseUrl: env.BOOKS_STORAGE_BASE_URL ?? baseConfig.publicBaseUrl,
    repository: {
      ...baseConfig.repository,
      owner: env.BOOKS_GITHUB_OWNER || baseConfig.repository.owner,
      repo: env.BOOKS_GITHUB_REPO || baseConfig.repository.repo,
      branch: env.BOOKS_GITHUB_BRANCH || baseConfig.repository.branch,
      rootFolder: env.BOOKS_ROOT_FOLDER ?? baseConfig.repository.rootFolder,
    },
  };
}

function sanitizeHeaderFilename(name) {
  return String(name || 'book.pdf').replace(/["\r\n\\]/g, '_');
}

export async function handlePdfProxyRequest(request, { baseConfig, env = {} }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, If-Range, If-None-Match',
        'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Range, Content-Length, Content-Disposition',
      },
    });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const reqUrl = new URL(request.url, 'http://localhost');
  const rawPath = reqUrl.searchParams.get('path') || '';
  const safePath = normalizeRepoPath(rawPath);

  if (!safePath) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing PDF path parameter.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const config = resolveBooksConfig(baseConfig, env);
  const upstreamUrl = buildDirectPdfUrl(safePath, config);
  const isDownload =
    reqUrl.searchParams.get('download') === '1' ||
    reqUrl.searchParams.get('download') === 'true';

  const forwardHeaders = new Headers();
  const rangeHeader = request.headers.get('range');
  if (rangeHeader) forwardHeaders.set('Range', rangeHeader);
  const ifRange = request.headers.get('if-range');
  if (ifRange) forwardHeaders.set('If-Range', ifRange);
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch) forwardHeaders.set('If-None-Match', ifNoneMatch);

  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: forwardHeaders,
      redirect: 'follow',
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Unable to reach remote PDF storage.',
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!upstream.ok && upstream.status !== 206 && upstream.status !== 304) {
    const status = upstream.status === 404 || upstream.status === 410 ? 404 : 502;
    return new Response(
      JSON.stringify({
        error:
          status === 404
            ? 'PDF file could not be found in the repository (it may have been moved or removed).'
            : `Upstream PDF storage returned status ${upstream.status}.`,
        path: safePath,
      }),
      { status, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const filename = sanitizeHeaderFilename(safePath.split('/').pop() || 'document.pdf');
  const respHeaders = new Headers();
  respHeaders.set('Content-Type', 'application/pdf');
  respHeaders.set('Accept-Ranges', upstream.headers.get('accept-ranges') || 'bytes');
  respHeaders.set(
    'Content-Disposition',
    `${isDownload ? 'attachment' : 'inline'}; filename="${filename}"`,
  );
  respHeaders.set(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  );
  respHeaders.set('Cross-Origin-Resource-Policy', 'same-origin');
  respHeaders.set(
    'Access-Control-Expose-Headers',
    'Accept-Ranges, Content-Range, Content-Length, Content-Disposition',
  );

  for (const h of ['content-range', 'content-length', 'etag', 'last-modified']) {
    const val = upstream.headers.get(h);
    if (val) respHeaders.set(h, val);
  }

  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export async function handleBooksCatalogRequest(
  request,
  { baseConfig, curatedOverrides = {}, staticCatalog = null, env = {} },
) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const reqUrl = new URL(request.url, 'http://localhost');
  const forceRefresh = reqUrl.searchParams.get('refresh') === '1';
  const now = Date.now();

  if (!forceRefresh && memoryCatalogCache && memoryCatalogCache.expiresAt > now) {
    return new Response(JSON.stringify(memoryCatalogCache.payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
        'X-Catalog-Source': 'memory-cache',
      },
    });
  }

  const config = resolveBooksConfig(baseConfig, env);
  try {
    const payload = await discoverRepositoryPdfs({
      config,
      githubToken: env.GITHUB_TOKEN || env.GH_TOKEN || '',
      curatedOverrides,
      cachedCatalog: staticCatalog,
      fetchCommitDates: false,
    });

    if (payload.books.length > 0) {
      memoryCatalogCache = {
        payload,
        expiresAt: now + MEMORY_CACHE_TTL_MS,
      };
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
          'X-Catalog-Source': 'github-live',
        },
      });
    }
  } catch {
    // Fall back gracefully to bundled static catalog on rate limit or outage
  }

  if (staticCatalog) {
    return new Response(JSON.stringify(staticCatalog), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120, s-maxage=300',
        'X-Catalog-Source': 'static-fallback',
      },
    });
  }

  return new Response(JSON.stringify({ error: 'Book catalog temporarily unavailable.' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}
