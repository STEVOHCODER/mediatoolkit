# MediaToolkit

Production Next.js application served on `https://mediatoolkit.tech` for
searching, understanding, and fixing developer errors.

The GitHub repository is `STEVOHCODER/mediatoolkit`; the Vercel project is
`devfixes` and the production domain attached to it is `mediatoolkit.tech`.

## Product surfaces

- Search-first homepage and fuzzy error index
- Dedicated VS Code extension guide with named extensions, install commands,
  purposes, and a downloadable MediaToolkit companion VSIX
- GitHub repository guide explaining what important official repositories are
  useful for during debugging
- Error Fingerprint detection for pasted traces and logs
- AI debugger with local fallback and probability-ranked fixes
- Universal learning IDE with guided debugging challenges, runnable code editor,
  terminal simulation, collapsible rails, and full-screen focus mode
- Browser-local challenge authoring with JSON/Markdown/text imports and
  exportable error, explanation, broken-code, and corrected-code examples
- Tutorial knowledge base with Markdown, JSON, and structured authoring paths
- Copy controls for every quick fix, ranked method, environment alternative,
  and code example
- Uniform error articles with causes, explanations, commands, examples, FAQs,
  references, related errors, and structured data
- Protected `/admin` workspace for adding and publishing errors without editing
  source code
- Protected `/admin/tutorials` studio for writing and publishing tutorials without
  editing source code
- Supabase-backed live catalog with bundled starter content as a fallback
- Cloudflare R2 signed uploads for diagnostic files up to 5 MB
- AdSense-ready responsive placements and root `ads.txt`
- Sitemap, robots, canonical URLs, FAQ/HowTo/TechArticle schema, Open Graph,
  security headers, privacy page, and health endpoint

## Local development

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The public site works without credentials. AI, database writes, uploaded logs,
admin publishing, and ads activate only when their environment variables exist.

## Admin editor

Set a long random `DEVFIXES_ADMIN_TOKEN`, restart the app, and open `/admin`.
The token is exchanged for a 12-hour HttpOnly, Secure, SameSite=Strict cookie.

The editor supports:

- Draft, review, and published states
- Loading existing Supabase articles back into the editor
- Importing a complete MediaToolkit article from a JSON file
- Downloading a valid JSON template and copying complete draft JSON
- Language, framework, severity, difficulty, tags, and popularity
- Beginner meaning and common causes
- Quick-fix commands and expected output
- Any number of probability-ranked debug methods
- Windows, macOS, Linux, Docker, Conda, or custom alternatives
- Broken and corrected code
- Related error slugs
- FAQs and official references

Publishing writes the complete article to Supabase and revalidates the homepage,
search index, article route, and sitemap.

### Add or upload an error

1. Open `/admin` and sign in with `DEVFIXES_ADMIN_TOKEN`.
2. Select `New error` to write directly in the structured editor, or select
   `Import JSON` to load a file created from the downloadable template.
3. Complete the identity, explanation, quick fix, ranked methods, environment
   alternatives, examples, FAQs, and references.
4. Save as `Draft` or `Needs review` while checking the commands.
5. Select `Published` and save to make the page available in search and the
   sitemap. Supabase must be configured before any server-side save can persist.

### Add or upload a tutorial

1. Open `/admin/tutorials` and sign in with `DEVFIXES_ADMIN_TOKEN`.
2. Choose one authoring path:
   - Use the structured editor for a new tutorial.
   - Select `Import Markdown` to load the body from an `.md` file, then complete
     the metadata and learning fields in the studio.
   - Select `Import JSON` to load a complete tutorial object.
3. Use the download button to get `MediaToolkit-tutorial-template.json` when starting
   a new JSON tutorial. The imported file is validated before it can be saved.
4. Use `Preview` to inspect the public route. Code blocks on the public page have
   their own copy button.
5. Save as `Draft` while writing, `Needs review` while checking commands and
   references, or `Published` when it is ready. Published tutorials appear under
   `/tutorials`, in related error pages, and in the sitemap.

The public tutorial format is intentionally Markdown inside a structured record.
This keeps the writing experience flexible while preserving consistent SEO,
structured data, related errors, FAQs, references, and publication states.

When Supabase is unavailable during local development, the studio now saves
validated records under `content/tutorials`. Published local records immediately
appear in the tutorial index and can be committed with the project. Set
`DEVFIXES_LOCAL_PUBLISHING=true` to explicitly enable this mode outside development.

The studio also includes a rendered draft preview, word and section counts, and
a search-readiness checklist for titles, excerpts, outcomes, references, FAQs,
tags, and substantial tutorial content.

## Supabase

The CLI project is initialized in `supabase/config.toml`.

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Then add:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The migration creates the error catalog, votes, reports, bookmarks, analytics,
and debugging history with row-level security. The service-role key must remain
server-only.

## Cloudflare R2

Authenticate Wrangler and run the checked-in setup script:

```powershell
npx --yes wrangler login
powershell -ExecutionPolicy Bypass -File scripts/setup-r2.ps1
```

The script performs these exact operations:

```powershell
npx --yes wrangler r2 bucket create devfixes-logs
npx --yes wrangler r2 bucket cors set devfixes-logs --file cloudflare/r2-cors.json --force
npx --yes wrangler r2 bucket lifecycle add devfixes-logs delete-debug-logs logs/ --expire-days 7 --force
```

`cloudflare/r2-cors.json` permits direct uploads from localhost,
`https://devfixes.vercel.app`, `https://mediatoolkit.tech`, and
`https://www.mediatoolkit.tech`.

Create an R2 API token scoped to object reads and writes for this bucket, then
configure `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`,
`CLOUDFLARE_R2_SECRET_ACCESS_KEY`, and `CLOUDFLARE_R2_BUCKET` in Vercel.
Uploaded files are private, use 10-minute signed PUT URLs, and expire after
seven days by default.

## OpenAI

Set `OPENAI_API_KEY`. The default `OPENAI_MODEL` is `gpt-5.6-terra`.
`/api/debug` uses the Responses API with structured Zod output. Diagnostic text
is explicitly treated as untrusted input. If AI is unavailable, the local
fingerprint engine still returns a useful result.

To use Gemini as the in-editor debugging partner, set `GEMINI_API_KEY` and
optionally `GEMINI_MODEL` (default: `gemini-2.5-flash`). The `/api/debug` route
prefers Gemini when configured, falls back to OpenAI when only its key exists,
and always retains the local fingerprint fallback. Keys remain server-side;
the browser sends only the error and current code context.

## Isolated labs

Set `E2B_API_KEY` to execute lab submissions inside short-lived, network-restricted
E2B sandboxes. The server only runs fixed challenge verification commands, limits
code size and request frequency, and destroys each sandbox after the run.

Without E2B, labs retain the guided verifier so the learning flow remains usable,
but the interface labels that mode honestly instead of presenting canned output
as a real runtime.

## Universal learning IDE

Open `/playground` to work through the built-in debugging challenges. The editor
and terminal share a focused workspace; the challenge library and teaching guide
rails can be collapsed when more code space is needed. Each challenge includes
the error anatomy, evidence to inspect, a step-by-step debugging path, hints,
and a broken-versus-corrected example.

Users can select `Import` to load a JSON challenge or a plain-text/Markdown error
capture, or select `Add your own failure` to author a challenge in the browser.
Custom cases are stored locally until they are exported as JSON. This keeps
private logs on the user's device while still making them reusable as lessons.

## GitHub hosting

The source repository is hosted at `https://github.com/STEVOHCODER/mediatoolkit`.
GitHub Pages publishes the project landing page from `github-pages/`. The full
Next.js application must remain on Vercel or another Node-compatible host because
GitHub Pages cannot run admin APIs, Supabase server access, uploads, or sandboxes.

## Google AdSense

The codebase is AdSense-ready. The loader script renders in the root layout only
when `NEXT_PUBLIC_ADSENSE_CLIENT` exists, ad slots are placed on the home page,
both article types, and search results, and `/ads.txt` is generated from the
publisher ID. Until those values are set, nothing ad-related renders, so the
site can be deployed and reviewed first.

Configure in Vercel Production:

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...
ADSENSE_PUBLISHER_ID=pub-...
NEXT_PUBLIC_ADSENSE_SLOT_HOME=
NEXT_PUBLIC_ADSENSE_SLOT_SEARCH=
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE=
```

Ad placements are labeled and kept outside navigation, commands, copy controls,
and debugger actions.

### AdSense application checklist

Work through this list before applying at AdSense with the domain
`mediatoolkit.tech`:

- [ ] `NEXT_PUBLIC_SITE_URL=https://mediatoolkit.tech` is set in Vercel Production
- [ ] `/`, `/about`, `/contact`, `/privacy`, `/terms` return 200 and are linked from the footer
- [ ] `https://mediatoolkit.tech/ads.txt` returns the `google.com, pub-...` line
- [ ] `https://mediatoolkit.tech/robots.txt` points at `https://mediatoolkit.tech/sitemap.xml`
- [ ] Property added to Google Search Console, sitemap submitted, no critical coverage errors
- [ ] Substantial original error guides published — thin content is the most common rejection reason
- [ ] No empty, stub, or placeholder pages left in the navigation
- [ ] Google-certified CMP configured in the AdSense account before enabling personalized ads for EEA/UK traffic

`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` can be set in Vercel to inject the Search
Console meta tag into the root layout.


## Vercel deployment

```powershell
vercel
vercel --prod
```

Add the variables from `.env.example` to Development, Preview, and Production
as appropriate. Set `NEXT_PUBLIC_SITE_URL` to `https://mediatoolkit.tech` in
Production; every canonical URL, sitemap entry, `robots.txt` host, and Open Graph
url is derived from it (the code falls back to the same value when the variable
is absent).

The included `vercel.json` grants the AI debugger a 60-second function
duration.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

Health endpoint: `/api/health`

## VS Code companion

The extension source lives in `extensions/devfixes-error-search`.

```powershell
Set-Location extensions/devfixes-error-search
npm install
npm run compile
npm run package
```

Packaging writes `public/downloads/devfixes-error-search-0.1.0.vsix`, which is
served by the `/resources/vscode` page. The extension opens selected diagnostic
text in MediaToolkit search or the Error Fingerprint debugger and does not collect
telemetry.
