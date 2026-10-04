/**
 * Regenerate public/sitemap.xml from the content registry so the sitemap can
 * never fall behind the tool list again.
 *
 * Run with: npm run sitemap
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, TOOLS_SEO, CATEGORIES_SEO } from '../server/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'sitemap.xml');

const STATIC_PAGES = [
  { id: 'about', priority: '0.5' },
  { id: 'contact', priority: '0.5' },
  { id: 'privacy', priority: '0.4' },
  { id: 'terms', priority: '0.4' },
];

const entries = [
  { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
  ...Object.keys(CATEGORIES_SEO).map((id) => ({
    loc: `${SITE_URL}/category/${id}`,
    changefreq: 'weekly',
    priority: '0.9',
  })),
  ...Object.keys(TOOLS_SEO).map((id) => ({
    loc: `${SITE_URL}/tool/${id}`,
    changefreq: 'monthly',
    priority: '0.8',
  })),
  ...STATIC_PAGES.map((page) => ({
    loc: `${SITE_URL}/${page.id}`,
    changefreq: 'monthly',
    priority: page.priority,
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => `  <url><loc>${e.loc}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`)
  .join('\n')}
</urlset>
`;

writeFileSync(OUT, xml, 'utf8');
console.log(`sitemap.xml written: ${entries.length} URLs (${Object.keys(TOOLS_SEO).length} tools, ${Object.keys(CATEGORIES_SEO).length} categories, ${STATIC_PAGES.length} pages + home)`);
