import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = 'http://localhost:3457';
let fail = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  -> ' + detail : ''}`);
  if (!ok) fail++;
};

const server = spawn(process.execPath, ['server/index.js'], {
  env: { ...process.env, PORT: '3457' },
  stdio: 'ignore'
});

async function get(path) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  return { status: res.status, body: await res.text() };
}

function meta(html, re) {
  return (html.match(re) || [])[1] || '';
}

const CANON = /rel="canonical"[^>]*href="([^"]*)"/;
const TITLE = /<title[^>]*>([^<]*)<\/title>/;

try {
  for (let i = 0; i < 40; i++) {
    try { await fetch(BASE + '/api/health'); break; } catch { await sleep(250); }
  }

  const home = await get('/');
  const merge = await get('/tool/merge-pdf');
  const split = await get('/tool/split-pdf');
  const bad = await get('/tool/nope');
  const cat = await get('/category/data');
  const about = await get('/about');
  const sm = await get('/sitemap.xml');
  const robots = await get('/robots.txt');
  const content = await get('/api/content');
  const one = await get('/api/content/merge-pdf');
  const missing = await get('/api/content/nope');
  const unknownApi = await get('/api/nope');

  check('home 200', home.status === 200, meta(home.body, TITLE));
  check('home canonical = /', meta(home.body, CANON) === 'https://mediatoolkit.tech/', meta(home.body, CANON));

  check('tool 200', merge.status === 200, meta(merge.body, TITLE));
  check('tool canonical self', meta(merge.body, CANON) === 'https://mediatoolkit.tech/tool/merge-pdf', meta(merge.body, CANON));
  check('titles unique vs home', meta(merge.body, TITLE) !== meta(home.body, TITLE));
  check('titles unique per tool', meta(merge.body, TITLE) !== meta(split.body, TITLE), meta(split.body, TITLE));
  check('guide rendered', merge.body.includes('How to use Merge PDF'));
  check('steps rendered', merge.body.includes('guide-steps'));
  check('faq rendered', merge.body.includes('faq-item'));
  check('related rendered', merge.body.includes('related-card'));
  check('exactly one H1', (merge.body.match(/<h1>/g) || []).length === 1);
  check('JSON-LD present', merge.body.includes('application/ld+json') && merge.body.includes('SoftwareApplication'));

  check('unknown tool 404', bad.status === 404, meta(bad.body, TITLE));
  check('404 canonical not home', meta(bad.body, CANON) !== 'https://mediatoolkit.tech/', meta(bad.body, CANON));
  check('category 200', cat.status === 200, meta(cat.body, TITLE));
  check('category canonical self', meta(cat.body, CANON) === 'https://mediatoolkit.tech/category/data', meta(cat.body, CANON));
  check('category cards', cat.body.includes('tool-card'));

  const parsed = JSON.parse(content.body).content;
  check('/api/content has 34', Object.keys(parsed).length === 34, String(Object.keys(parsed).length));
  check('/api/content/:id 200', one.status === 200);
  check('/api/content/:id 404', missing.status === 404);
  check('unknown api 404 json', unknownApi.status === 404 && /error/.test(unknownApi.body));

  check('about 200 + og:url', about.status === 200 && about.body.includes('og:url" content="https://mediatoolkit.tech/about"'));
  check('sitemap 43 urls', (sm.body.match(/<loc>/g) || []).length === 43, String((sm.body.match(/<loc>/g) || []).length));
  check('robots 200', robots.status === 200);

  for (const p of ['/api/tools', '/api/content']) {
    const res = await fetch(BASE + p);
    const tag = res.headers.get('x-robots-tag') || '';
    check(`${p} sends X-Robots-Tag noindex`, /noindex/.test(tag), tag || 'none');
    await res.text();
  }
  const robotsBody = robots.body;
  check('robots.txt does not block /api/', !/Disallow:[ \t]*\/api\//i.test(robotsBody), robotsBody.split('\n')[2] || '');
} finally {
  server.kill();
}

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILURES`);
process.exit(fail === 0 ? 0 : 1);
