/**
 * App bootstrap: theme, mobile nav, hash router.
 *
 * Routes:
 *   #/            landing page
 *   #/c/:id       landing page scrolled to a category
 *   #/t/:id       tool page
 */
import { loadRemoteTools, loadContent, getTool } from './registry.js';
import { renderLanding, renderTool, esc } from './ui.js';
import { icon } from './icons.js';
import { route as seoRoute, refreshAds, initConsent } from './ads.js';

const app = document.getElementById('app');
const THEME_KEY = 'mtk-theme';

/* ------------------------------------------------------------- theme ----- */
function currentTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
}

/* --------------------------------------------------------------- nav ----- */
function initNav() {
  const toggle = document.getElementById('theme-toggle');
  toggle.addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  navToggle.innerHTML = icon('menu');
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function markActiveNav(hash) {
  const nav = document.getElementById('main-nav');
  for (const link of nav.querySelectorAll('a')) {
    const href = link.getAttribute('href');
    const active = href === '#/' ? hash === '#/' || hash === '' : hash.startsWith(href);
    link.classList.toggle('active', active);
  }
}

/* ------------------------------------------------------------- router ---- */
function notFound(id) {
  app.innerHTML = `<div class="tool-page container">
    <h1 style="font-size:1.6rem">Tool not found</h1>
    <p style="color:var(--muted)">No tool matches <code>${esc(id)}</code>.</p>
    <p><a class="btn btn-primary" style="width:auto" href="#/">${icon('arrowLeft')} Back to all tools</a></p>
  </div>`;
}

function route() {
  const hash = window.location.hash || '#/';
  markActiveNav(hash);

  const toolMatch = hash.match(/^#\/t\/([\w-]+)$/);
  if (toolMatch) {
    const tool = getTool(toolMatch[1]);
    if (!tool) {
      notFound(toolMatch[1]);
      return;
    }
    renderTool(tool);
    return;
  }

  const categoryMatch = hash.match(/^#\/c\/([a-z]+)$/);
  if (categoryMatch) {
    renderLanding();
    const section = document.getElementById(`c-${categoryMatch[1]}`);
    if (section) {
      // Wait a frame so layout is stable before scrolling.
      requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    refreshAds();
    return;
  }

  renderLanding();
  refreshAds();
}

/* --------------------------------------------------------------- boot ---- */
async function boot() {
  document.getElementById('year').textContent = String(new Date().getFullYear());
  applyTheme(currentTheme());
  initNav();
  initConsent();

  // Map SEO-friendly paths onto the hash app before other routing runs.
  seoRoute();

  try {
    await Promise.all([loadRemoteTools(), loadContent()]);
  } catch (err) {
    // Tool and category pages are already server-rendered into <main>. Only
    // fall back to this error when there is nothing to preserve, otherwise a
    // blocked or flaky fetch hands crawlers an empty page.
    if (!app.hasChildNodes()) {
      app.innerHTML = `<div class="tool-page container">
        <h1>Could not load tools</h1>
        <p style="color:var(--muted)">${esc(err.message)} - is the server running?</p>
      </div>`;
    }
    return;
  }

  window.addEventListener('hashchange', route);
  route();
}

boot();
