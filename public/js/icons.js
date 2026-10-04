/** Inline SVG icon set (stroke-based, inherits currentColor). */

const svg = (paths, opts = {}) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${opts.w ?? 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const ICONS = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>'),
  menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  upload: svg('<path d="M12 16V4m0 0 4 4m-4-4L8 8"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'),
  file: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>'),
  files: svg('<path d="M9 3h6l4 4v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M5 7v12a2 2 0 0 0 2 2h9"/>'),
  download: svg('<path d="M12 4v12m0 0 4-4m-4 4-4-4"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>'),
  check: svg('<path d="m5 13 4 4L19 7"/>', { w: 2.2 }),
  checkCircle: svg('<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>'),
  alert: svg('<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5m0 3h.01"/>'),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  arrowLeft: svg('<path d="M19 12H5m0 0 6-6m-6 6 6 6"/>'),
  arrowRight: svg('<path d="M5 12h14m0 0-6-6m6 6-6 6"/>'),
  zap: svg('<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>'),
  shield: svg('<path d="M12 3 5 6v5c0 4.4 3 8.4 7 10 4-1.6 7-5.6 7-10V6l-7-3Z"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  eye: svg('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.6"/>'),
  gauge: svg('<path d="M12 14 8.5 9"/><path d="M4 18a9 9 0 1 1 16 0"/>'),
  scissors: svg('<circle cx="6" cy="7" r="2.6"/><circle cx="6" cy="17" r="2.6"/><path d="M8.2 8.4 20 18M8.2 15.6 20 6"/>'),
  split: svg('<path d="M12 3v18"/><rect x="3" y="6" width="6" height="12" rx="1.5"/><rect x="15" y="6" width="6" height="12" rx="1.5"/>'),
  image: svg('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>'),
  pdf: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M8.5 16v-3.4h1.2a1.1 1.1 0 0 1 0 2.2H8.5M13 16v-3.4h1a1.7 1.7 0 0 1 0 3.4Z"/>'),
  convert: svg('<path d="M7 4 3 8l4 4"/><path d="M3 8h12a4 4 0 0 1 4 4v0"/><path d="m17 20 4-4-4-4"/><path d="M21 16H9a4 4 0 0 1-4-4v0"/>'),
  data: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 15h18M9 4v16M15 4v16"/>'),
  braces: svg('<path d="M8 3c-2 0-2 2-2 3.5S5 9 4 10c1 1 2 1.5 2 3s0 3.5 2 3.5"/><path d="M16 3c2 0 2 2 2 3.5S19 9 20 10c-1 1-2 1.5-2 3s0 3.5-2 3.5"/>'),
  table: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9.5 10v10"/>'),
  word: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="m8.5 12 1.4 5 1.6-3.6L13 17l1.5-5"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"/>'),
  crop: svg('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>'),
  resize: svg('<path d="M4 9V4h5M20 15v5h-5"/><path d="M4 4l6 6M20 20l-6-6"/>'),
  rotate: svg('<path d="M20 8a8.5 8.5 0 1 0 1 6"/><path d="M21 3v5h-5"/>'),
  stamp: svg('<path d="M6 21h12"/><path d="M8 17h8l-1-4.5a4.8 4.8 0 0 0-1.3-3.1L13 8a2 2 0 1 0-2-2l-.7 1.4A4.8 4.8 0 0 0 9 12.5Z"/>'),
  hash: svg('<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>'),
  wrench: svg('<path d="M14.5 6.5a4.8 4.8 0 0 0 6 6L21 13l-8 8-2-2 8-8-1-1Z" transform="translate(-1 -1)"/><path d="M9.5 9.5 4 15l3 3 5.5-5.5"/>'),
  archive: svg('<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/>'),
  badge: svg('<path d="m12 3 2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 15l-4.6 2.4.9-5.2L4.5 8.5l5.2-.8Z"/>'),
  text: svg('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
  spinner: '<span class="spinner"></span>',
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  link: svg('<path d="M10 14a4.5 4.5 0 0 0 6.4.4l3-3a4.5 4.5 0 1 0-6.4-6.4L11.5 6.5"/><path d="M14 10a4.5 4.5 0 0 0-6.4-.4l-3 3a4.5 4.5 0 1 0 6.4 6.4l1.5-1.5"/>'),
};

export function icon(name) {
  return ICONS[name] ?? ICONS.file;
}
