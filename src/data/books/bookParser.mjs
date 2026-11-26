/**
 * Shared pure GitHub PDF discovery, metadata extraction, categorization, and
 * storage URL generation utilities.
 *
 * Used across Node sync scripts, Vercel serverless functions, Vite dev
 * middleware, and Vitest verification suites with zero Node-only APIs so it
 * can execute cleanly in any JS runtime.
 */

const VALID_DOMAINS = new Set([
  'Algorithms',
  'Interview',
  'Systems',
  'Databases',
  'C / C++',
  'Python',
  'Web & JS',
  'ML & Math',
  'Core & Langs',
]);

const LOWERCASE_WORDS = new Set([
  'and',
  'or',
  'for',
  'of',
  'in',
  'on',
  'to',
  'with',
  'by',
  'from',
  'the',
  'a',
  'an',
  'at',
]);

const ACRONYM_REPLACEMENTS = [
  [/\bi\s*OS\b/gi, 'iOS'],
  [/\bmac\s*OS\b/gi, 'macOS'],
  [/\bj\s*Query\b/gi, 'jQuery'],
  [/\bType\s*Script\b/gi, 'TypeScript'],
  [/\bJava\s*Script\b/gi, 'JavaScript'],
  [/\bCoffee\s*Script\b/gi, 'CoffeeScript'],
  [/\bPower\s*Shell\b/gi, 'PowerShell'],
  [/\bPostgre\s*SQL\b/gi, 'PostgreSQL'],
  [/\bMy\s*SQL\b/gi, 'MySQL'],
  [/\bMongo\s*DB\b/gi, 'MongoDB'],
  [/\bGraph\s*QL\b/gi, 'GraphQL'],
  [/\bNode\s*JS\b/gi, 'Node.js'],
  [/\bReact\s*JS\b/gi, 'React'],
  [/\bDot\s*NET\b/gi, '.NET'],
  [/\bC\s*Sharp\b/gi, 'C#'],
  [/\bC\s*Plus\s*Plus\b/gi, 'C++'],
  [/\bObjective\s+C\b/gi, 'Objective-C'],
  [/\bMATLAB\b/gi, 'MATLAB'],
  [/\bHTML5?\b/gi, (m) => m.toUpperCase()],
  [/\bCSS3?\b/gi, (m) => m.toUpperCase()],
  [/\bSQL\b/gi, 'SQL'],
  [/\bPHP\b/gi, 'PHP'],
  [/\bDSA\b/gi, 'DSA'],
  [/\bUI\s*UX\b/gi, 'UI/UX'],
];

const FOLDER_LABEL_MAP = {
  'c-c++': 'C / C++',
  csharp: 'C#',
  'dev-ops': 'DevOps',
  'html-css': 'HTML & CSS',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  nodejs: 'Node.js',
  'objective-c': 'Objective-C',
  'r-lang': 'R Programming',
  'react-native': 'React Native',
  sql: 'SQL',
  php: 'PHP',
  matlab: 'MATLAB',
  'bash-shell-git': 'Bash, Shell & Git',
  'visual-basic': 'Visual Basic',
};

export function encodeRepoPath(repoPath) {
  return repoPath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Validates and normalizes a repository-relative PDF path.
 * Rejects traversal segments (`..`), absolute schemes, or non-PDF extensions.
 */
export function normalizeRepoPath(rawPath) {
  if (typeof rawPath !== 'string') return null;
  const trimmed = rawPath.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!trimmed || /^[a-zA-Z]+:\/\//.test(trimmed)) return null;
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  for (const part of parts) {
    if (part === '.' || part === '..' || part.includes('\0')) return null;
  }
  const normalized = parts.join('/');
  if (!/\.pdf$/i.test(normalized)) return null;
  return normalized;
}

export function buildDirectPdfUrl(repoPath, config) {
  const safePath = normalizeRepoPath(repoPath) || repoPath;
  const encoded = encodeRepoPath(safePath);

  if (config.storageProvider === 'r2' || config.storageProvider === 'custom') {
    const base = String(config.publicBaseUrl || '').replace(/\/+$/, '');
    if (base) {
      return `${base}/${encoded}`;
    }
  }

  const rawBase = String(config.githubRawBaseUrl || 'https://raw.githubusercontent.com').replace(
    /\/+$/,
    '',
  );
  const { owner, repo, branch } = config.repository;
  return `${rawBase}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${encoded}`;
}

export function buildGithubBlobUrl(repoPath, config) {
  const safePath = normalizeRepoPath(repoPath) || repoPath;
  const { owner, repo, branch } = config.repository;
  return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/blob/${encodeURIComponent(branch)}/${encodeRepoPath(safePath)}`;
}

function stableShortHash(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).slice(0, 5);
}

/**
 * Generates a deterministic, URL-safe unique ID from full repository path,
 * guaranteeing duplicate filenames across different directories never collide.
 */
export function slugifyBookId(repoPath, sha, usedIds) {
  const withoutExt = repoPath.replace(/\.pdf$/i, '');
  const baseSlug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, '-')
    .replace(/\//g, '--')
    .replace(/-{3,}/g, '--')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);

  const candidateBase = baseSlug || `book-${stableShortHash(repoPath)}`;
  let candidate = candidateBase;

  if (usedIds.has(candidate)) {
    const suffix = sha ? sha.slice(0, 6) : stableShortHash(repoPath);
    candidate = `${candidateBase}-${suffix}`;
  }

  let seq = 2;
  while (usedIds.has(candidate)) {
    candidate = `${candidateBase}-${seq++}`;
  }

  usedIds.add(candidate);
  return candidate;
}

export function cleanDirectoryCategory(folder) {
  if (!folder || folder === 'Root') return 'Computer Science';
  const primary = folder.split('/')[0].trim();
  const stripped = primary
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  const lowerKey = stripped.toLowerCase();
  if (FOLDER_LABEL_MAP[lowerKey]) return FOLDER_LABEL_MAP[lowerKey];

  return stripped
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && LOWERCASE_WORDS.has(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function inferDomainForFolder(folder, folderDomainMap = {}) {
  if (folderDomainMap[folder] && VALID_DOMAINS.has(folderDomainMap[folder])) {
    return folderDomainMap[folder];
  }
  const top = folder.split('/')[0];
  if (folderDomainMap[top] && VALID_DOMAINS.has(folderDomainMap[top])) {
    return folderDomainMap[top];
  }

  const normalized = folder.toLowerCase();
  if (normalized.includes('algo') || normalized.includes('struct')) return 'Algorithms';
  if (normalized.includes('interview') || normalized.includes('coding') || normalized.includes('career')) {
    return 'Interview';
  }
  if (
    normalized.includes('system') ||
    normalized.includes('os') ||
    normalized.includes('operating') ||
    normalized.includes('network') ||
    normalized.includes('parallel') ||
    normalized.includes('distrib') ||
    normalized.includes('devops') ||
    normalized.includes('linux')
  ) {
    return 'Systems';
  }
  if (normalized.includes('sql') || normalized.includes('data') && normalized.includes('base') || normalized.includes('db')) {
    return 'Databases';
  }
  if (normalized === 'c' || normalized.includes('c++') || normalized.includes('c-c++')) {
    return 'C / C++';
  }
  if (normalized.includes('python')) return 'Python';
  if (
    normalized.includes('web') ||
    normalized.includes('js') ||
    normalized.includes('script') ||
    normalized.includes('react') ||
    normalized.includes('angular') ||
    normalized.includes('vue') ||
    normalized.includes('html') ||
    normalized.includes('css') ||
    normalized.includes('node')
  ) {
    return 'Web & JS';
  }
  if (
    normalized.includes('ml') ||
    normalized.includes('machine') ||
    normalized.includes('ai') ||
    normalized.includes('math') ||
    normalized.includes('stat') ||
    normalized.includes('data science')
  ) {
    return 'ML & Math';
  }
  return 'Core & Langs';
}

export function extractCategoryFromPath(repoPath, folderDomainMap = {}) {
  const parts = repoPath.split('/').filter(Boolean);
  const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : 'Root';
  const category = cleanDirectoryCategory(folder);
  const domain = inferDomainForFolder(folder, folderDomainMap);
  return { folder, category, domain };
}

export function extractAuthorFromFilename(filename) {
  const base = filename.replace(/\.pdf$/i, '');
  const bracketMatch = base.match(/\[([^\]]+)\]/);
  if (bracketMatch) {
    return bracketMatch[1].replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (/NotesForProfessionals/i.test(base)) {
    return 'GoalKicker Community';
  }
  const dashAuthorMatch = base.match(/\s+-\s+([A-Z][a-zA-Z.]+(?:\s+[A-Z][a-zA-Z.]+){1,3})$/);
  if (dashAuthorMatch) {
    return dashAuthorMatch[1].trim();
  }
  return 'Unknown';
}

export function extractTitleFromFilename(filename) {
  let raw = filename.replace(/\.pdf$/i, '').trim();
  // Remove bracketed author and trailing duplicate copy markers e.g. "(2)"
  raw = raw.replace(/\[[^\]]+\]/g, ' ').replace(/\(\d+\)\s*$/g, ' ');

  // Normalize separators before PascalCase splitting
  raw = raw.replace(/[_.]+/g, ' ');
  // Keep meaningful hyphens inside words, turn separator hyphens into spaces
  raw = raw.replace(/([a-z0-9])-([A-Z0-9])/g, '$1 $2').replace(/-+/g, ' ');

  // Insert spaces cleanly inside camelCase/PascalCase words without splitting acronyms
  raw = raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [pattern, replacement] of ACRONYM_REPLACEMENTS) {
    raw = raw.replace(pattern, replacement);
  }

  const words = raw.split(/\s+/).filter(Boolean);
  return words
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && LOWERCASE_WORDS.has(lower)) return lower;
      return word;
    })
    .join(' ')
    .trim();
}

export function formatFileSizeLabel(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) {
    return 'Unknown size';
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 0.1) {
    return `${mb.toFixed(1)} MB`;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} KB`;
}

function makeShortTitle(title) {
  return title
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/:.*$/, '')
    .toUpperCase()
    .trim()
    .slice(0, 26);
}

function makeEditionBadge(title) {
  if (/Notes\s+for\s+Professionals/i.test(title)) return 'NOTES';
  const token = title.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/)[0] || 'PDF';
  return token.toUpperCase().slice(0, 7);
}

function isoDateOnly(rawDate) {
  if (!rawDate || typeof rawDate !== 'string') return '';
  const match = rawDate.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

export function buildCatalogFromTreeEntries({
  treeEntries,
  config,
  curatedOverrides = {},
  cachedBooksByPath = new Map(),
  commitDatesByPath = new Map(),
  fallbackDate = new Date().toISOString().slice(0, 10),
}) {
  const rootPrefix = config.repository.rootFolder
    ? `${config.repository.rootFolder.replace(/^\/+|\/+$/g, '')}/`
    : '';

  const pdfBlobs = (treeEntries || [])
    .filter((entry) => {
      if (!entry || entry.type !== 'blob' || !entry.path) return false;
      if (!/\.pdf$/i.test(entry.path)) return false;
      if (rootPrefix && !entry.path.startsWith(rootPrefix)) return false;
      return normalizeRepoPath(entry.path) !== null;
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  const usedIds = new Set();

  return pdfBlobs.map((entry, idx) => {
    const repoPath = entry.path;
    const filename = repoPath.split('/').pop() || repoPath;
    const { folder, category, domain } = extractCategoryFromPath(repoPath, config.folderDomainMap);
    const curated = curatedOverrides[repoPath] || {};
    const cached = cachedBooksByPath.get(repoPath);

    const id = slugifyBookId(repoPath, entry.sha, usedIds);
    const catalogNo = String(idx + 1).padStart(2, '0');
    const title = curated.title || extractTitleFromFilename(filename);
    const shortTitle = curated.shortTitle || makeShortTitle(title);
    const author = curated.author || extractAuthorFromFilename(filename);
    const editionBadge = curated.editionBadge || makeEditionBadge(title);
    const finalDomain = curated.domain || domain;
    const fileSize = typeof entry.size === 'number' ? entry.size : 0;
    const sizeLabel = formatFileSizeLabel(fileSize);

    const lastUpdated =
      isoDateOnly(commitDatesByPath.get(repoPath)) ||
      isoDateOnly(commitDatesByPath.get(folder)) ||
      (cached && entry.sha && cached.sha === entry.sha ? isoDateOnly(cached.lastUpdated) : '') ||
      isoDateOnly(fallbackDate) ||
      new Date().toISOString().slice(0, 10);

    const pdfUrl = buildDirectPdfUrl(repoPath, config);
    const summary =
      curated.summary ||
      `Reference handbook and technical volume in ${category} (${sizeLabel} PDF).`;

    return {
      id,
      catalogNo,
      title,
      author,
      category,
      domain: finalDomain,
      folder,
      path: repoPath,
      repoPath,
      fileSize,
      sizeLabel,
      lastUpdated,
      pdfUrl,
      sha: entry.sha,
      shortTitle,
      editionBadge,
      ...(curated.presetId ? { presetId: curated.presetId, presetLabel: curated.presetLabel } : {}),
      summary,
      artVariant: idx % 12,
      paletteIndex: idx % 8,
    };
  });
}

async function githubFetchJson(url, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'LearnShit-BookCatalog-Sync',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { headers });
  const remainingHeader = res.headers.get('x-ratelimit-remaining');
  const remaining = remainingHeader !== null ? Number(remainingHeader) : null;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`GitHub API ${res.status} for ${url}: ${text.slice(0, 180)}`);
    err.status = res.status;
    err.remaining = remaining;
    throw err;
  }
  const data = await res.json();
  return { data, remaining };
}

async function fetchContentsRecursively(config, token, dirPath = '') {
  const { owner, repo, branch } = config.repository;
  const apiBase = config.githubApiBaseUrl || 'https://api.github.com';
  const encodedDir = dirPath ? `/${encodeRepoPath(dirPath)}` : '';
  const url = `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents${encodedDir}?ref=${encodeURIComponent(branch)}`;
  const { data } = await githubFetchJson(url, token);
  if (!Array.isArray(data)) return [];

  const entries = [];
  for (const item of data) {
    if (item.type === 'dir') {
      const sub = await fetchContentsRecursively(config, token, item.path);
      entries.push(...sub);
    } else if (item.type === 'file') {
      entries.push({
        path: item.path,
        type: 'blob',
        sha: item.sha,
        size: item.size,
      });
    }
  }
  return entries;
}

/**
 * Discovers all PDF files recursively from the configured GitHub repository,
 * reusing cached SHAs and respecting API rate limits for commit metadata.
 */
export async function discoverRepositoryPdfs({
  config,
  githubToken,
  curatedOverrides = {},
  cachedCatalog = null,
  fetchCommitDates = true,
  onWarn = () => {},
}) {
  const { owner, repo, branch, rootFolder } = config.repository;
  const apiBase = config.githubApiBaseUrl || 'https://api.github.com';

  const cachedBooksByPath = new Map();
  for (const b of cachedCatalog?.books || []) {
    const key = b.repoPath || b.path;
    if (key) cachedBooksByPath.set(key, b);
  }

  let fallbackDate = new Date().toISOString().slice(0, 10);
  let remainingRate = null;

  try {
    const repoUrl = `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const repoResp = await githubFetchJson(repoUrl, githubToken);
    remainingRate = repoResp.remaining;
    fallbackDate = isoDateOnly(repoResp.data?.pushed_at || repoResp.data?.updated_at) || fallbackDate;
  } catch (err) {
    onWarn(`Repository metadata lookup skipped: ${err.message}`);
  }

  const treeUrl = `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const treeResp = await githubFetchJson(treeUrl, githubToken);
  remainingRate = treeResp.remaining ?? remainingRate;

  let treeEntries = Array.isArray(treeResp.data?.tree) ? treeResp.data.tree : [];
  if (treeResp.data?.truncated) {
    onWarn('GitHub tree response was truncated; falling back to recursive Contents API traversal.');
    treeEntries = await fetchContentsRecursively(config, githubToken, rootFolder || '');
  }

  const commitDatesByPath = new Map();
  if (fetchCommitDates) {
    const needsDate = treeEntries.filter((e) => {
      if (e.type !== 'blob' || !/\.pdf$/i.test(e.path || '')) return false;
      const cached = cachedBooksByPath.get(e.path);
      return !(cached && cached.sha && cached.sha === e.sha && cached.lastUpdated);
    });

    if (needsDate.length > 0) {
      const hasHighQuota = Boolean(githubToken) || (remainingRate !== null && remainingRate >= needsDate.length + 10);
      if (hasHighQuota) {
        // Lookup exact commit date only for new/changed PDFs in small batches
        const BATCH_SIZE = 6;
        for (let i = 0; i < needsDate.length; i += BATCH_SIZE) {
          const batch = needsDate.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(async (item) => {
              try {
                const cUrl = `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(branch)}&path=${encodeURIComponent(item.path)}&per_page=1`;
                const { data } = await githubFetchJson(cUrl, githubToken);
                const dateStr = isoDateOnly(data?.[0]?.commit?.committer?.date || data?.[0]?.commit?.author?.date);
                if (dateStr) commitDatesByPath.set(item.path, dateStr);
              } catch {
                // Non-fatal: fallback date handles missing commit date gracefully
              }
            }),
          );
        }
      } else {
        // Fetch folder-level commit dates only if within remaining unauthenticated budget
        const foldersNeeded = Array.from(
          new Set(
            needsDate.map((e) => {
              const parts = e.path.split('/');
              return parts.length > 1 ? parts.slice(0, -1).join('/') : 'Root';
            }),
          ),
        );
        if (remainingRate === null || remainingRate >= foldersNeeded.length + 5) {
          const BATCH_SIZE = 6;
          for (let i = 0; i < foldersNeeded.length; i += BATCH_SIZE) {
            const batch = foldersNeeded.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map(async (folder) => {
                if (folder === 'Root') return;
                try {
                  const cUrl = `${apiBase}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(branch)}&path=${encodeURIComponent(folder)}&per_page=1`;
                  const { data } = await githubFetchJson(cUrl, githubToken);
                  const dateStr = isoDateOnly(data?.[0]?.commit?.committer?.date || data?.[0]?.commit?.author?.date);
                  if (dateStr) commitDatesByPath.set(folder, dateStr);
                } catch {
                  // Non-fatal fallback
                }
              }),
            );
          }
        } else {
          onWarn(
            `Skipped per-file commit date queries to stay within GitHub API rate limit (remaining=${remainingRate}). Using repo pushed_at=${fallbackDate}.`,
          );
        }
      }
    }
  }

  const books = buildCatalogFromTreeEntries({
    treeEntries,
    config,
    curatedOverrides,
    cachedBooksByPath,
    commitDatesByPath,
    fallbackDate,
  });

  return {
    generatedAt: new Date().toISOString(),
    repository: `${owner}/${repo}`,
    branch,
    storageProvider: config.storageProvider,
    totalCount: books.length,
    books,
  };
}
