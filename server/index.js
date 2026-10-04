/**
 * MediaToolkit server entry point.
 *
 * Serves the static web app and a small JSON API that proxies iLoveAPI
 * processing so the project secret key never reaches the browser.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import { ILoveApiClient, ILoveApiError } from './iloveapi.js';
import { createRoutes } from './routes.js';
import { renderSeoPage, notFound } from './seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// --- configuration -----------------------------------------------------------
// Minimal .env loader (keeps the dependency footprint small).
const envPath = path.join(ROOT, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
  }
}

const PORT = Number(process.env.PORT || 3000);
const MAX_FILE_MB = Number(process.env.MAX_FILE_MB || 100);

const client = new ILoveApiClient(process.env.ILV_PUBLIC_KEY, process.env.ILV_SECRET_KEY);

// --- express app -------------------------------------------------------------
const app = express();
app.disable('x-powered-by');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024, files: 20, fields: 30 },
});

// Simple per-IP rate limit for tool runs: 60 requests / minute.
const rateBuckets = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || 'anon';
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.start > 60_000) {
    rateBuckets.set(key, { start: now, count: 1 });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > 60) {
    res.status(429).json({ error: 'Too many requests - please slow down.' });
    return;
  }
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.start > 120_000) rateBuckets.delete(key);
  }
}, 60_000).unref?.();

app.use(express.json({ limit: '1mb' }));

const router = createRoutes({ client });

// Tool runs accept multipart (files + options fields) or plain JSON (url tools).
app.post('/api/tools/:id', rateLimit, (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  const handler = contentType.startsWith('multipart/form-data')
    ? upload.any()
    : express.json({ limit: '1mb' });
  handler(req, res, (err) => {
    if (err) {
      const status = err instanceof multer.MulterError ? 413 : 500;
      res.status(status).json({ error: err.message });
      return;
    }
    next();
  });
}, router);

app.use(rateLimit, router);

// --- static frontend ---------------------------------------------------------
app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'] }));

// Unmatched API calls answer with JSON rather than the HTML 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Tool and category URLs get their own head (title, description, canonical,
// structured data) and guide body; anything else unknown is a real 404 so
// search engines stop seeing duplicate homepage content.
app.get(/^\/(?!api\/).*/, (req, res) => {
  const rendered = renderSeoPage(req.path);
  if (rendered) {
    res.status(rendered.status).type('html').send(rendered.html);
    return;
  }
  if (req.path === '/') {
    res.sendFile(path.join(ROOT, 'public', 'index.html'));
    return;
  }
  res.status(404).type('html').send(notFound(req.path));
});

// --- error handling ----------------------------------------------------------
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof ILoveApiError) {
    // Surface upstream client errors (4xx) verbatim; hide internals for 5xx.
    const status = err.status >= 400 && err.status < 500 ? err.status : 502;
    let message = err.message;
    try {
      const parsed = JSON.parse(err.body);
      if (parsed?.error?.message) message = parsed.error.message;
      else if (parsed?.message) message = parsed.message;
    } catch { /* keep generic message */ }
    res.status(status).json({ error: message, detail: err.body || undefined });
    return;
  }
  console.error('[server]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// In serverless runtimes the platform imports this module and calls the app.
// Only bind a port when running directly as a process (local dev / VPS).
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`MediaToolkit running at http://localhost:${PORT}`);
    console.log(`iLoveAPI project: ${process.env.ILV_PUBLIC_KEY?.slice(0, 24)}...`);
  });
}

// Exported for serverless runtimes (Vercel). When VERCEL=1 the platform
// invokes the exported handler instead of the listener above.
export default app;