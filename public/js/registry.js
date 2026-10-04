/**
 * Client-side tool registry: iLoveAPI tools are fetched from /api/tools,
 * local (browser-only) tools are declared here. Both share one shape.
 */

export const CATEGORIES = [
  { id: 'pdf', name: 'PDF Tools', icon: 'pdf', tint: '#ef4444', blurb: 'Merge, split, compress and secure PDFs.' },
  { id: 'image', name: 'Image Tools', icon: 'image', tint: '#f59e0b', blurb: 'Compress, convert, crop and resize images.' },
  { id: 'convert', name: 'Converters', icon: 'convert', tint: '#3b82f6', blurb: 'Move between Office, PDF, HTML, TXT and more.' },
  { id: 'data', name: 'Data Tools', icon: 'data', tint: '#8b5cf6', blurb: 'JSON, CSV and Excel — 100% private, in your browser.' },
];

const local = (id, name, category, description, accept, extra = {}) => ({
  id,
  name,
  category,
  description,
  accept,
  multiple: false,
  minFiles: 1,
  options: [],
  credits: 'Free · private',
  inputMode: 'file',
  engine: 'local',
  ...extra,
});

export const LOCAL_TOOLS = [
  local('json-formatter', 'JSON Formatter', 'data', 'Format, minify and validate JSON with error hints.', [],
    { inputMode: 'editor', accept: ['.json'] }),
  local('json-to-csv', 'JSON to CSV', 'data', 'Convert a JSON array of objects into a CSV sheet.', ['.json']),
  local('csv-to-json', 'CSV to JSON', 'data', 'Turn any CSV file into clean JSON records.', ['.csv']),
  local('csv-to-excel', 'CSV to Excel', 'data', 'Open a CSV as a real .xlsx workbook.', ['.csv']),
  local('excel-to-csv', 'Excel to CSV', 'data', 'Extract the first sheet of a workbook as CSV.', ['.xlsx', '.xls']),
  local('excel-to-json', 'Excel to JSON', 'data', 'Read spreadsheet rows as JSON objects.', ['.xlsx', '.xls']),
  local('json-to-excel', 'JSON to Excel', 'data', 'Turn JSON records into a downloadable .xlsx file.', ['.json']),
  local('docx-to-text', 'Word to Text', 'convert', 'Extract plain text from a DOCX document.', ['.docx']),
  local('docx-to-html', 'Word to HTML', 'convert', 'Convert a DOCX document into semantic HTML.', ['.docx']),
];

/** Remote tools, hydrated from the server on boot. */
let remoteTools = [];

export async function loadRemoteTools() {
  const res = await fetch('/api/tools');
  if (!res.ok) throw new Error('Failed to load tools');
  const data = await res.json();
  remoteTools = data.tools.map((tool) => ({ ...tool, engine: 'iloveapi' }));
  return remoteTools;
}

/** Guide copy for every tool, including the browser-only ones. */
let contentMap = {};

export async function loadContent() {
  const res = await fetch('/api/content');
  if (!res.ok) throw new Error('Failed to load content');
  const data = await res.json();
  contentMap = data.content || {};
  return contentMap;
}

export function getContent(id) {
  return contentMap[id] ?? null;
}

export function allTools() {
  return [...remoteTools, ...LOCAL_TOOLS];
}

export function getTool(id) {
  return allTools().find((tool) => tool.id === id) ?? null;
}

export function toolsByCategory(categoryId) {
  return allTools().filter((tool) => tool.category === categoryId);
}

/** Nicer per-tool icon than the generic category glyph. */
const ICON_OVERRIDES = {
  'merge-pdf': 'files',
  'split-pdf': 'split',
  'compress-pdf': 'gauge',
  'ocr-pdf': 'text',
  'pdf-to-jpg': 'image',
  'jpg-to-pdf': 'pdf',
  'rotate-pdf': 'rotate',
  'protect-pdf': 'lock',
  'unlock-pdf': 'lock',
  'watermark-pdf': 'stamp',
  'page-numbers': 'hash',
  'repair-pdf': 'wrench',
  'pdf-to-pdfa': 'archive',
  'validate-pdfa': 'badge',
  'pdf-to-text': 'text',
  'office-to-pdf': 'word',
  'html-to-pdf': 'globe',
  'compress-image': 'gauge',
  'convert-image': 'convert',
  'crop-image': 'crop',
  'resize-image': 'resize',
  'rotate-image': 'rotate',
  'watermark-image': 'stamp',
  'repair-image': 'wrench',
  'html-to-image': 'globe',
  'json-formatter': 'braces',
  'json-to-csv': 'convert',
  'csv-to-json': 'convert',
  'csv-to-excel': 'table',
  'excel-to-csv': 'table',
  'excel-to-json': 'table',
  'json-to-excel': 'table',
  'docx-to-text': 'word',
  'docx-to-html': 'word',
};

export function toolIcon(tool) {
  return ICON_OVERRIDES[tool.id] ?? (CATEGORIES.find((c) => c.id === tool.category)?.icon ?? 'file');
}

export function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
