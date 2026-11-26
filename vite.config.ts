import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { handleBooksCatalogRequest, handlePdfProxyRequest } from './api/_booksServer.mjs'

function readJsonFile(relPath: string) {
  const rootDir = fileURLToPath(new URL('.', import.meta.url))
  return JSON.parse(fs.readFileSync(path.join(rootDir, relPath), 'utf8'))
}

function booksApiDevMiddleware(): Plugin {
  return {
    name: 'learnshit-books-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || ''
        if (!rawUrl.startsWith('/api/pdf') && !rawUrl.startsWith('/api/books-catalog')) {
          return next()
        }
        try {
          const origin = `http://${req.headers.host || 'localhost:5173'}`
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === 'string') headers.set(k, v)
            else if (Array.isArray(v)) headers.set(k, v.join(', '))
          }
          const webReq = new Request(`${origin}${rawUrl}`, {
            method: req.method || 'GET',
            headers,
          })
          const baseConfig = readJsonFile('books.config.json')
          const webRes = rawUrl.startsWith('/api/pdf')
            ? await handlePdfProxyRequest(webReq, { baseConfig, env: process.env })
            : await handleBooksCatalogRequest(webReq, {
                baseConfig,
                curatedOverrides: readJsonFile('src/data/books/curatedMetadata.json'),
                staticCatalog: readJsonFile('src/data/books/booksCatalog.json'),
                env: process.env,
              })

          res.statusCode = webRes.status
          webRes.headers.forEach((value: string, key: string) => {
            res.setHeader(key, value)
          })
          if (!webRes.body || req.method === 'HEAD') {
            res.end()
            return
          }
          Readable.fromWeb(webRes.body as unknown as import('node:stream/web').ReadableStream).pipe(res)
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    booksApiDevMiddleware(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['pyodide'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
