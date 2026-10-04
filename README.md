# MediaToolkit.tech

An all-in-one document & image toolkit (in the spirit of iLovePDF) — PDF, image,
Office, JSON, CSV and Excel tools in one fast web app.

- **Heavy lifting** (PDF & image processing, OCR, Office→PDF, web page→PDF) runs
  through **iLoveAPI** server-side, so your secret key never leaves the server.
- **Private tools** (JSON formatter, JSON↔CSV↔Excel, Word→Text/HTML) run **100%
  in the browser** with the vendored SheetJS + mammoth libraries — free and
  private, no upload at all.

## Architecture

```
Browser  ──multipart/JSON──▶  Node/Express server  ──JWT (HS256)──▶  api.ilovepdf.com
   │                              │
   │  local tools (in-browser)    ├─ /api/tools        → tool registry (public metadata)
   └─ SheetJS / mammoth           ├─ /api/tools/:id    → start → upload → process (proxied)
                                  ├─ /api/download/:t  → streams result, then closes task
                                  └─ static frontend (public/)
```

iLoveAPI workflow implemented in `server/iloveapi.js`:

1. `GET  https://api.ilovepdf.com/v1/start/{tool}` → `{ task, server }`
2. `POST https://{server}/v1/upload` — multipart `task` + `file` (or `cloud_file` for URLs)
3. `POST https://{server}/v1/process` — `{ task, tool, files[], ...options }`
4. `GET  https://{server}/v1/download/{task}` → binary result
5. `DELETE https://{server}/v1/task/{task}` — task closed after delivery

Authentication is a **self-signed HS256 JWT** (`jti` = public key, `iss` =
`api.ilovepdf.com`, `iat` = now−5 s) signed with the project secret key.

## Tools included

| Category | Tools |
|---|---|
| **PDF** (15) | Merge, Split, Compress, OCR, PDF→JPG, JPG→PDF, Rotate, Protect, Unlock, Watermark, Page numbers, Repair, PDF→PDF/A, Validate PDF/A, PDF→TXT |
| **Image** (8) | Compress, Convert (JPG/PNG/GIF), Crop, Resize, Rotate, Watermark, Repair, Web page→Image |
| **Converters** | Word/Excel/PPT→PDF, Web page→PDF, Word→Text, Word→HTML |
| **Data** (free, local) | JSON Formatter, JSON→CSV, CSV→JSON, CSV→Excel, Excel→CSV, Excel→JSON, JSON→Excel |

Notes discovered while testing this project's keys (free plan):

- **AI tools (AI Summarizer, Smart Split) cannot use free monthly credits**
  — the API returns 401 “This tool can not use free monthly credits”. They were
  left out; they can be added once the project moves to a paid plan.
- `PDF → Markdown` and `Detect Forms` were not discoverable under their
  documented slugs on the free project (server rejects the tool), so they are
  not wired in yet.

### Credit costs (from iloveapi.com/pricing)

| Action | Credits |
|---|---|
| Merge | 5 / task |
| Split, OCR (per page) | 5 |
| Compress, Rotate, Protect, Unlock, Watermark, Page numbers, Repair, PDF/A, Extract, Office→PDF, HTML→PDF | 10 / file |
| Image tools (compress, convert, crop, resize, rotate, watermark) | 2 / file |
| Repair image | 10 / file |
| Digital signature | 80 |

Free tier: **2,500 credits/month** (no free credits for AI tools or signatures).

## Getting started

### 1. Requirements

- Node.js ≥ 20 (tested on Node 24)
- An iLoveAPI project (https://www.iloveapi.com) — free plan is fine

### 2. Configure

Copy `.env.example` to `.env` and fill in your keys:

```ini
ILV_PUBLIC_KEY=project_public_xxx
ILV_SECRET_KEY=secret_key_xxx
PORT=3000
MAX_FILE_MB=100
```

> ⚠️ **Never commit `.env`** and never expose `ILV_SECRET_KEY` in the browser.
> If a key was ever shared in chat/email, rotate it in the iLoveAPI console.

### 3. Install & run

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # auto-reload (node --watch)
```

### 4. Tests

```bash
npm test           # end-to-end: boots the server and processes real files
```

The e2e suite spends roughly **29 iLoveAPI credits** (image compress + convert,
PDF compress, merge, PDF→TXT). It verifies: server boot, tool listing, 400/404
validation, option pass-through, multi-file upload, real downloads and
single-use download links.

`npm run probe` lists which tool slugs your project accepts (starts tasks and
deletes them again — consumes **no** credits).

## Proxy environments

If `HTTP_PROXY` / `HTTPS_PROXY` are set, the server routes outbound requests
through the proxy (via the optional `undici` package) and automatically falls
back to direct connections; transient network errors are retried with backoff.
On a normal hosting box the proxy variables are simply absent — nothing to do.

## Project layout

```
server/
  index.js      Express app: config, uploads, rate limit, static files, errors
  iloveapi.js   iLoveAPI client: JWT auth, start/upload/process/download/delete
  registry.js   Remote tool definitions (slugs, options, per-file params)
  routes.js     /api/tools, /api/tools/:id, /api/download/:task
public/
  index.html    App shell
  css/styles.css  Design system (light/dark)
  js/app.js     Router + boot
  js/registry.js  Client tool registry (remote + local)
  js/ui.js      Landing & tool page rendering
  js/runner.js  Remote execution with real upload progress (XHR)
  js/local.js   Local engines (SheetJS / mammoth)
  js/icons.js   SVG icon set
  vendor/       xlsx.full.min.js, mammoth.browser.min.js
scripts/
  probe.mjs     Slug/auth discovery (no credits spent)
  auth-test.mjs  Single-request auth check
  e2e-test.mjs  Full pipeline test (spends ~29 credits)
```

## Deployment

- **Production:** https://mediatoolkit.tech (`www` 308-redirects to the apex)
- **Repository:** https://github.com/STEVOHCODER/mediatoolkit
- **Vercel project:** `devfixes`, git-linked to `master`, auto-deploys on push

Environment variables required in Vercel **Production** (never committed —
`.env` is gitignored):

```ini
ILV_PUBLIC_KEY=project_public_xxx
ILV_SECRET_KEY=secret_key_xxx
MAX_FILE_MB=100
```

`vercel.json` sets `"framework": null` **on purpose**. The Vercel project was
originally created for a Next.js app, and without that override Vercel runs
`next build` and fails with *"No Next.js version detected"*. This app needs no
build step: Vercel installs dependencies, uploads `public/` as static files, and
packages `api/index.js` as the serverless function.

> Vercel rejects request bodies larger than **4.5 MB**, so `MAX_FILE_MB` above
> that will not be reachable in production.

## Production notes

- Put the app behind HTTPS and keep `MAX_FILE_MB` aligned with your proxy's
  upload limits.
- The server keeps a small in-memory map of finished results
  (task → server) so downloads can stream; entries expire after 30 minutes and
  their remote tasks are deleted. Run a single instance, or externalize the map
  for multi-instance deployments.
- Open tasks on iLoveAPI are capped (10% of the monthly file limit, e.g. 250
  for the free tier). The server closes tasks after each download and after
  failures, but an instance crash can leave a few open until the API reaps them.
- Rate limit: 60 tool runs per minute per IP (in-memory).

