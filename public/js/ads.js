/**
 * AdSense integration (consent-gated) + path-based SEO routing.
 *
 * Ads stay OFF until BOTH conditions hold:
 *  1. the global ADSENSE config below carries a real client id, and
 *  2. the visitor accepted cookies in the consent banner.
 * Until then the ad slots render nothing (AdSense reviewers see a clean,
 * policy-compliant site with no placeholder ad units).
 */

// Set these (or inject via your Vercel build) when you are ready for ads:
//   window.ADSENSE = { client: 'ca-pub-XXXXXXXXXXXXXXXX', slots: { home: '1111111111', search: '2222222222', tool: '3333333333' } };
window.ADSENSE = window.ADSENSE || { client: '', slots: { home: '', search: '', tool: '' } };

const CONSENT_KEY = 'mtk-consent';

function consentGiven() {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

function loadAdSense() {
  const client = window.ADSENSE?.client || '';
  if (!client || document.querySelector('script[data-adsbygoogle]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.dataset.adsbygoogle = 'true';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

function fillAdSlots() {
  const cfg = window.ADSENSE || {};
  if (!cfg.client || !consentGiven()) return;
  loadAdSense();
  for (const slot of document.querySelectorAll('[data-ad-slot]')) {
    if (slot.dataset.filled) continue;
    const slotId = cfg.slots?.[slot.dataset.adSlot];
    if (!slotId) continue;
    slot.dataset.filled = '1';
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = cfg.client;
    ins.dataset.adSlot = slotId;
    ins.dataset.adFormat = 'auto';
    ins.dataset.fullWidthResponsive = 'true';
    slot.appendChild(ins);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* ad errors must never break tools */ }
  }
}

function wireConsent() {
  if (consentGiven()) {
    fillAdSlots();
    return;
  }
  let banner = document.getElementById('consent-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `<p>We use cookies for site preferences and, with your consent,
      for advertising that keeps MediaToolkit free. See our <a href="/privacy">Privacy Policy</a>.</p>
      <div class="consent-actions">
        <button class="btn btn-ghost" data-consent="declined" type="button">Decline</button>
        <button class="btn btn-primary" data-consent="accepted" type="button">Accept</button>
      </div>`;
    document.body.appendChild(banner);
  }
  banner.classList.add('visible');
  banner.querySelectorAll('[data-consent]').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        localStorage.setItem(CONSENT_KEY, btn.dataset.consent);
      } catch { /* storage unavailable */ }
      banner.classList.remove('visible');
      if (btn.dataset.consent === 'accepted') fillAdSlots();
    });
  });
}

/**
 * Path-based SEO routes that map onto the hash app:
 *   /tool/<id>      -> #/t/<id>
 *   /category/<id>  -> #/c/<id>
 * Unknown paths fall through to the landing page.
 */
export function route() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const toolMatch = path.match(/^\/tool\/([\w-]+)$/);
  if (toolMatch) {
    window.location.hash = `#/t/${toolMatch[1]}`;
  }
  const catMatch = path.match(/^\/category\/([a-z]+)$/);
  if (catMatch) {
    window.location.hash = `#/c/${catMatch[1]}`;
  }
}

/** Call once per view render — no-ops until consent + config exist. */
export function refreshAds() {
  fillAdSlots();
}

/** Call once on boot. */
export function initConsent() {
  document.addEventListener('DOMContentLoaded', wireConsent, { once: true });
}
