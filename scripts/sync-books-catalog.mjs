import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverRepositoryPdfs } from '../src/data/books/bookParser.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function readJsonIfExists(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`Warning: failed to read JSON at ${filePath}:`, err.message);
    return fallback;
  }
}

async function main() {
  const startedAt = Date.now();
  const baseConfig = readJsonIfExists(path.join(rootDir, 'books.config.json'), null);
  if (!baseConfig) {
    throw new Error('Missing books.config.json in project root.');
  }

  const config = {
    ...baseConfig,
    storageProvider: process.env.BOOKS_STORAGE_PROVIDER || baseConfig.storageProvider,
    publicBaseUrl: process.env.BOOKS_STORAGE_BASE_URL ?? baseConfig.publicBaseUrl,
    repository: {
      ...baseConfig.repository,
      owner: process.env.BOOKS_GITHUB_OWNER || baseConfig.repository.owner,
      repo: process.env.BOOKS_GITHUB_REPO || baseConfig.repository.repo,
      branch: process.env.BOOKS_GITHUB_BRANCH || baseConfig.repository.branch,
      rootFolder: process.env.BOOKS_ROOT_FOLDER ?? baseConfig.repository.rootFolder,
    },
  };

  const publicCatalogPath = path.join(rootDir, 'public/books-catalog.json');
  const srcCatalogPath = path.join(rootDir, 'src/data/books/booksCatalog.json');
  const curatedPath = path.join(rootDir, 'src/data/books/curatedMetadata.json');

  const curatedOverrides = readJsonIfExists(curatedPath, {});
  const cachedCatalog = readJsonIfExists(publicCatalogPath, null);
  const previousPaths = new Set((cachedCatalog?.books || []).map((b) => b.path || b.repoPath));

  console.log(
    `[books:sync] Discovering PDFs in ${config.repository.owner}/${config.repository.repo}@${config.repository.branch}...`,
  );

  const catalog = await discoverRepositoryPdfs({
    config,
    githubToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '',
    curatedOverrides,
    cachedCatalog,
    fetchCommitDates: true,
    onWarn: (msg) => console.warn(`[books:sync] ${msg}`),
  });

  if (catalog.books.length === 0 && !process.env.ALLOW_EMPTY_CATALOG) {
    throw new Error('Discovered 0 PDF files; aborting catalog overwrite to protect existing catalog.');
  }

  const nextPaths = new Set(catalog.books.map((b) => b.path));
  const added = catalog.books.filter((b) => !previousPaths.has(b.path)).length;
  const removed = [...previousPaths].filter((p) => !nextPaths.has(p)).length;

  // Preserve previous generatedAt if the book payload itself has zero substantive changes
  const prevComparable = JSON.stringify(cachedCatalog?.books || []);
  const nextComparable = JSON.stringify(catalog.books);
  if (cachedCatalog && prevComparable === nextComparable) {
    console.log(
      `[books:sync] No catalog changes detected (${catalog.totalCount} PDFs). Keeping existing files untouched.`,
    );
    return;
  }

  const serialized = `${JSON.stringify(catalog, null, 2)}\n`;
  fs.mkdirSync(path.dirname(publicCatalogPath), { recursive: true });
  fs.mkdirSync(path.dirname(srcCatalogPath), { recursive: true });
  fs.writeFileSync(publicCatalogPath, serialized, 'utf8');
  fs.writeFileSync(srcCatalogPath, serialized, 'utf8');

  const elapsedMs = Date.now() - startedAt;
  console.log(
    `[books:sync] Synced ${catalog.totalCount} PDFs (+${added} added, -${removed} removed) in ${elapsedMs}ms -> public/books-catalog.json & src/data/books/booksCatalog.json`,
  );
}

main().catch((err) => {
  console.error('[books:sync] Failed:', err.message);
  process.exit(1);
});
