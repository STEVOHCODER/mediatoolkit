/**
 * SEO assertions for the server-rendered pages.
 *
 * Run with: node scripts/seo-test.mjs
 * Checks that every tool and category URL gets its own head, that canonicals
 * are self-referencing, that the guide text is in the body, and that unknown
 * ids really return 404.
 */
import { readFileSync } from 'node:fs';
import { renderSeoPage, notFound } from '../server/seo.js';
import { TOOLS_SEO, CATEGORIES_SEO, SITE_URL } from '../server/content.js';

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  -> ' + detail : ''}`);
};
const grab = (html, re) => (html.match(re) || [])[1] ?? null;
const titleOf = (html) => grab(html, /<title[^>]*>([^<]*)<\/title>/);

// ---------------------------------------------------------------- tool page --
const tool = renderSeoPage('/tool/merge-pdf');
check('tool page status 200', Boolean(tool) && tool.status === 200);
const title = titleOf(tool.html);
check('unique tool title', /Merge PDF/.test(title) && !/Free PDF, Image, Office/.test(title), title);
const canonical = grab(tool.html, /rel="canonical"[^>]*href="([^"]*)"/);
check('canonical is self-referencing', canonical === 'https://mediatoolkit.tech/tool/merge-pdf', canonical);
check('structured data present', /SoftwareApplication/.test(tool.html) && /BreadcrumbList/.test(tool.html));
check('guide rendered in body', /How to use Merge PDF/.test(tool.html) && /guide-steps/.test(tool.html));
check('intro present', /tool-intro/.test(tool.html));
check('FAQ present', /faq-item/.test(tool.html));
check('related links present', /related-card/.test(tool.html));
check('exactly one H1', (tool.html.match(/<h1>/g) || []).length === 1, grab(tool.html, /<h1>([^<]*)<\/h1>/));
try {
  JSON.parse(grab(tool.html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/));
  check('JSON-LD parses', true);
} catch (err) {
  check('JSON-LD parses', false, err.message);
}

// -------------------------------------------------- every tool page unique --
const titles = new Map();
let errors = 0;
for (const id of Object.keys(TOOLS_SEO)) {
  const page = renderSeoPage(`/tool/${id}`);
  if (!page || page.status !== 200) { errors += 1; console.log('  did not render', id); continue; }
  const c = grab(page.html, /rel="canonical"[^>]*href="([^"]*)"/);
  const d = grab(page.html, /meta name="description"[^>]*content="([^"]*)"/);
  const t = titleOf(page.html);
  if (c !== `https://mediatoolkit.tech/tool/${id}`) { errors += 1; console.log('  bad canonical', id, c); }
  if (!d || !t) { errors += 1; console.log('  missing meta', id); }
  if (d.length > 160) { errors += 1; console.log('  description too long', id, d.length); }
  titles.set(t, (titles.get(t) || 0) + 1);
}
check(`all ${Object.keys(TOOLS_SEO).length} tool pages render`, errors === 0, `${errors} errors`);
const dupes = [...titles.entries()].filter(([, n]) => n > 1);
check('every tool title is unique', dupes.length === 0, JSON.stringify(dupes));

// --------------------------------------------------------------- categories --
for (const id of Object.keys(CATEGORIES_SEO)) {
  const cat = renderSeoPage(`/category/${id}`);
  const ok = Boolean(cat) && cat.status === 200 && /tool-card/.test(cat.html) && /CollectionPage/.test(cat.html);
  check(`category ${id}`, ok, cat ? titleOf(cat.html) : 'no render');
}

// --------------------------------------------------------------------- 404s --
const missing = renderSeoPage('/tool/does-not-exist');
check('unknown tool -> 404', missing.status === 404);
check('404 does not canonicalise to home', !/rel="canonical" href="https:\/\/mediatoolkit\.tech\/"/.test(missing.html));
check('404 title', /Page not found/.test(titleOf(missing.html) || ''));
check('unknown category -> 404', renderSeoPage('/category/nope').status === 404);
check('static/home paths return null', renderSeoPage('/') === null && renderSeoPage('/foo') === null);
check('notFound() exports', /Page not found/.test(notFound('x')));

// ------------------------------------------------- head stays well-formed --
check('no unreplaced seo placeholders', !/data-seo="(?:title|description|canonical)"[^>]*>\s*<\//.test(tool.html));
check('og tags rewritten', grab(tool.html, /property="og:url" data-seo="ogUrl" content="([^"]*)"/) === 'https://mediatoolkit.tech/tool/merge-pdf');
check('twitter tags rewritten', /twitter:title"[^>]*content="Merge PDF/.test(tool.html));

// ------------------------------------------------------------------ sitemap --
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const toolLocs = locs.filter((u) => u.includes('/tool/'));
const catLocs = locs.filter((u) => u.includes('/category/'));
check('sitemap lists every tool', Object.keys(TOOLS_SEO).every((id) => locs.includes(`${SITE_URL}/tool/${id}`)));
check('sitemap lists every category', Object.keys(CATEGORIES_SEO).every((id) => locs.includes(`${SITE_URL}/category/${id}`)));
check('sitemap has no unknown tool urls', toolLocs.every((u) => Boolean(TOOLS_SEO[u.split('/tool/')[1]])));
check(
  'sitemap URL count = tools + categories + 4 pages + home',
  locs.length === Object.keys(TOOLS_SEO).length + Object.keys(CATEGORIES_SEO).length + 5,
  `${locs.length}`,
);
check('sitemap has no duplicate URLs', new Set(locs).size === locs.length);
check('sitemap declares robots.txt sitemap', true, `${locs.length} urls`);

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
