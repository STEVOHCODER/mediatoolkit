/**
 * Server-side SEO rendering.
 *
 * The app is a hash-routed SPA, so without this every /tool/:id URL would
 * return the homepage head — same <title>, same description and a canonical
 * pointing at /. That tells search engines "this page is a duplicate of the
 * homepage", which is exactly what we do not want. Here the template head is
 * rewritten per URL, structured data is attached, and the guide text is placed
 * in the body so crawlers and social previews see real content without running
 * JavaScript.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, SITE_NAME, TOOLS_SEO, CATEGORIES_SEO } from './content.js';
import { escapeHtml, introHtml, guideHtml } from '../public/js/guide.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

/** Swap the text/attribute captured by a regex group, HTML-escaped. */
function swap(html, pattern, value) {
  return html.replace(pattern, (match, before, after) => before + escapeHtml(value) + after);
}

function applyHead(html, { title, description, url, jsonLd }) {
  let out = html;
  out = swap(out, /(<title data-seo="title">)[\s\S]*?(<\/title>)/, title);
  out = swap(out, /(<meta name="description" data-seo="description" content=")[^"]*(")/, description);
  out = swap(out, /(<link rel="canonical" data-seo="canonical" href=")[^"]*(")/, url);
  out = swap(out, /(<meta property="og:title" data-seo="ogTitle" content=")[^"]*(")/, title);
  out = swap(out, /(<meta property="og:description" data-seo="ogDescription" content=")[^"]*(")/, description);
  out = swap(out, /(<meta property="og:url" data-seo="ogUrl" content=")[^"]*(")/, url);
  out = swap(out, /(<meta name="twitter:title" data-seo="twTitle" content=")[^"]*(")/, title);
  out = swap(out, /(<meta name="twitter:description" data-seo="twDescription" content=")[^"]*(")/, description);
  return out.replace(
    /<script type="application\/ld\+json" data-seo="jsonld">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" data-seo="jsonld">\n${jsonLd}\n  </script>`,
  );
}

function applyBody(html, body) {
  return html.replace(
    /<main id="app" class="site-main" tabindex="-1">[\s\S]*?<\/main>/,
    `<main id="app" class="site-main" tabindex="-1">${body}</main>`,
  );
}

const resolveName = (id) => TOOLS_SEO[id]?.name ?? id;

function toolJsonLd(id, entry) {
  const url = `${SITE_URL}/tool/${id}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: entry.name,
        description: entry.metaDescription,
        url,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: CATEGORIES_SEO[entry.category].name,
            item: `${SITE_URL}/category/${entry.category}`,
          },
          { '@type': 'ListItem', position: 3, name: entry.name, item: url },
        ],
      },
    ],
  }, null, 2);
}

function categoryJsonLd(id, entry) {
  const url = `${SITE_URL}/category/${id}`;
  const items = Object.entries(TOOLS_SEO)
    .filter(([, tool]) => tool.category === id)
    .map(([toolId, tool]) => ({
      '@type': 'ListItem',
      position: itemsPosition(toolId),
      name: tool.name,
      item: `${SITE_URL}/tool/${toolId}`,
    }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: entry.name,
        description: entry.metaDescription,
        url,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: entry.name, item: url },
        ],
      },
    ],
  }, null, 2);
}

// Stable ordering inside the ItemList (insertion order of the id).
const ORDER = Object.keys(TOOLS_SEO);
const itemsPosition = (id) => ORDER.indexOf(id) + 1;

function toolBody(id, entry) {
  const category = CATEGORIES_SEO[entry.category];
  const body = `
<div class="tool-page container">
  <nav class="breadcrumb">
    <a href="/">Home</a><span class="sep">/</span>
    <a href="/category/${entry.category}">${escapeHtml(category.name)}</a><span class="sep">/</span>
    <span>${escapeHtml(entry.name)}</span>
  </nav>
  <header class="tool-header">
    <div>
      <h1>${escapeHtml(entry.name)}</h1>
      ${introHtml(entry)}
    </div>
  </header>
  ${guideHtml(entry, resolveName)}
</div>`;
  return body;
}

function categoryBody(id, entry) {
  const cards = Object.entries(TOOLS_SEO)
    .filter(([, tool]) => tool.category === id)
    .map(([toolId, tool]) => `
      <a class="tool-card" href="/tool/${escapeHtml(toolId)}">
        <h3>${escapeHtml(tool.name)}</h3>
        <p>${escapeHtml(tool.metaDescription)}</p>
      </a>`)
    .join('');
  return `
<div class="container category-page">
  <nav class="breadcrumb">
    <a href="/">Home</a><span class="sep">/</span><span>${escapeHtml(entry.name)}</span>
  </nav>
  <h1>${escapeHtml(entry.name)}</h1>
  <p class="tool-intro">${escapeHtml(entry.intro)}</p>
  <div class="tool-grid">${cards}</div>
</div>`;
}

/**
 * Render a URL. Returns { status, html } for /tool/* and /category/*, or null
 * when the path is not handled here (static files, homepage, unknown routes).
 */
export function renderSeoPage(pathname) {
  const toolMatch = pathname.match(/^\/tool\/([\w-]+)$/);
  if (toolMatch) {
    const id = toolMatch[1];
    const entry = TOOLS_SEO[id];
    if (!entry) return { status: 404, html: notFound(id) };
    const url = `${SITE_URL}/tool/${id}`;
    const html = applyBody(
      applyHead(TEMPLATE, {
        title: entry.metaTitle,
        description: entry.metaDescription,
        url,
        jsonLd: toolJsonLd(id, entry),
      }),
      toolBody(id, entry),
    );
    return { status: 200, html };
  }

  const catMatch = pathname.match(/^\/category\/([a-z]+)$/);
  if (catMatch) {
    const id = catMatch[1];
    const entry = CATEGORIES_SEO[id];
    if (!entry) return { status: 404, html: notFound(id) };
    const url = `${SITE_URL}/category/${id}`;
    const html = applyBody(
      applyHead(TEMPLATE, {
        title: entry.metaTitle,
        description: entry.metaDescription,
        url,
        jsonLd: categoryJsonLd(id, entry),
      }),
      categoryBody(id, entry),
    );
    return { status: 200, html };
  }

  return null;
}

/** A real 404 document, so unknown tool URLs stop returning homepage meta. */
export function notFound(id) {
  const safe = escapeHtml(id || 'this page');
  return applyBody(applyHead(TEMPLATE, {
    title: `Page not found | ${SITE_NAME}`,
    description: 'The page you are looking for does not exist on mediatoolkit.tech.',
    url: `${SITE_URL}/404`,
    jsonLd: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: SITE_URL }),
  }), `
<div class="tool-page container">
  <header class="tool-header">
    <div>
      <h1>Page not found</h1>
      <p class="tool-intro">No page matches <code>${safe}</code>. Pick a tool below instead.</p>
    </div>
  </header>
  <p><a class="btn btn-primary" style="width:auto" href="/">Back to all tools</a></p>
</div>`);
}
