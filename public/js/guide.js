/**
 * Pure HTML builders for the per-tool guide.
 *
 * Shared by the server (which injects the guide into the HTML so search
 * engines and social previews get crawlable text) and by the client (which
 * renders the same markup into the live tool page). Keep this module free of
 * DOM or Node APIs — it must import cleanly on both sides.
 */

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

/** Short paragraph shown directly under the tool header. */
export function introHtml(entry) {
  return `<p class="tool-intro">${escapeHtml(entry.intro)}</p>`;
}

/**
 * Full guide block: how-to steps, FAQ and related-tool links.
 * `resolveName(id)` maps a related tool id to its display name.
 */
export function guideHtml(entry, resolveName) {
  const name = escapeHtml(entry.name);
  const lookup = resolveName || ((id) => id);

  const steps = entry.steps
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join('');

  const faqs = entry.faqs
    .map((item) => `
      <details class="faq-item">
        <summary>${escapeHtml(item.q)}</summary>
        <p>${escapeHtml(item.a)}</p>
      </details>`)
    .join('');

  const related = entry.related
    .map((id) => `
      <a class="related-card" href="/tool/${escapeHtml(id)}">
        <span class="related-name">${escapeHtml(lookup(id))}</span>
        <span class="related-go" aria-hidden="true">&rarr;</span>
      </a>`)
    .join('');

  return `
<section class="tool-guide" aria-label="Guide">
  <div class="guide-block">
    <h2>How to use ${name}</h2>
    <ol class="guide-steps">${steps}</ol>
  </div>
  <div class="guide-block">
    <h2>${name} FAQ</h2>
    <div class="faq-list">${faqs}</div>
  </div>
  <div class="guide-block">
    <h2>Related tools</h2>
    <div class="related-list">${related}</div>
  </div>
</section>`;
}
