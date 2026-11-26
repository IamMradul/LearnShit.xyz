import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ROUTES = [
  { url: '/', file: path.join(rootDir, 'dist/index.html') },
  { url: '/visualizer', file: path.join(rootDir, 'dist/visualizer/index.html') },
  { url: '/playgrounds', file: path.join(rootDir, 'dist/playgrounds/index.html') },
  { url: '/dsa', file: path.join(rootDir, 'dist/dsa/index.html') },
  { url: '/books', file: path.join(rootDir, 'dist/books/index.html') },
  { url: '/resources', file: path.join(rootDir, 'dist/resources/index.html') },
  { url: '/about', file: path.join(rootDir, 'dist/about/index.html') },
  { url: '/contact', file: path.join(rootDir, 'dist/contact/index.html') },
  { url: '/privacy', file: path.join(rootDir, 'dist/privacy/index.html') },
  { url: '/404', file: path.join(rootDir, 'dist/404.html') },
];

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function prerender() {
  console.log('🚀 Starting Static Site Pre-rendering (SSG)...');

  const templatePath = path.join(rootDir, 'dist/index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Base template not found at ${templatePath}. Run 'vite build' first.`);
  }
  const baseTemplate = fs.readFileSync(templatePath, 'utf8');

  // Start Vite custom server for SSR module execution
  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

    for (const { url, file } of ROUTES) {
      console.log(`⚡ Pre-rendering route: ${url} -> ${path.relative(rootDir, file)}`);
      const { appHtml, seo } = render(url);

      let html = baseTemplate;

      // 1. Inject pre-rendered app HTML
      html = html.replace('<!--app-html-->', () => appHtml);

      // 2. Replace Document Title
      html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(seo.title)}</title>`);

      // 3. Replace Meta Description
      html = html.replace(
        /<meta\s+name="description"\s+content=".*?"\s*\/?>/s,
        `<meta name="description" content="${escapeHtml(seo.description)}" />`
      );

      // 4. Replace Canonical Link
      html = html.replace(
        /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/s,
        `<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`
      );

      // 5. Replace Open Graph Tags
      html = html.replace(
        /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/s,
        `<meta property="og:title" content="${escapeHtml(seo.title)}" />`
      );
      html = html.replace(
        /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/s,
        `<meta property="og:description" content="${escapeHtml(seo.description)}" />`
      );
      html = html.replace(
        /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/s,
        `<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`
      );
      html = html.replace(
        /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/s,
        `<meta property="og:type" content="${escapeHtml(seo.ogType || 'website')}" />`
      );
      html = html.replace(
        /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/s,
        `<meta property="og:image" content="${escapeHtml(seo.ogImage || 'https://learnshit.xyz/og-image.png')}" />`
      );

      // 6. Replace Twitter Card Tags
      html = html.replace(
        /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/s,
        `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`
      );
      html = html.replace(
        /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/s,
        `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`
      );
      html = html.replace(
        /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/s,
        `<meta name="twitter:image" content="${escapeHtml(seo.ogImage || 'https://learnshit.xyz/og-image.png')}" />`
      );

      // 7. Inject Structured Data (JSON-LD)
      if (seo.structuredData && seo.structuredData.length > 0) {
        const jsonLdString = JSON.stringify(
          seo.structuredData.length === 1 ? seo.structuredData[0] : seo.structuredData,
          null,
          2
        );
        html = html.replace(
          /<script id="seo-structured-data" type="application\/ld\+json">.*?<\/script>/s,
          `<script id="seo-structured-data" type="application/ld+json">\n${jsonLdString}\n  </script>`
        );
      }

      // Ensure directory exists and save pre-rendered static HTML
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, html, 'utf8');
    }
  } finally {
    await vite.close();
  }

  console.log('✅ Successfully pre-rendered all 9 static routes with full HTML, metadata, and JSON-LD schemas.');
}

prerender().catch((err) => {
  console.error('❌ Pre-rendering failed:', err);
  process.exit(1);
});
