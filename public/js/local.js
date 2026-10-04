/**
 * Local tool engine - runs 100% in the browser (free & private).
 * Uses the vendored SheetJS (xlsx) and mammoth libraries.
 *
 * Every runner returns { filename, download: Blob, preview: string|null, note? }.
 */

const enc = (str, mime = 'text/plain;charset=utf-8') => new Blob([str], { type: mime });

function jsonError(err, source) {
  const message = String(err?.message ?? err);
  const posMatch = message.match(/position (\d+)/);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const before = source.slice(0, pos);
    const line = before.split('\n').length;
    const col = pos - before.lastIndexOf('\n');
    return `Invalid JSON — line ${line}, column ${col}. ${message}`;
  }
  return `Invalid JSON — ${message}`;
}

function parseJson(source) {
  try {
    return { data: JSON.parse(source) };
  } catch (err) {
    throw new Error(jsonError(err, source));
  }
}

/** Normalise parsed JSON into an array of flat records. */
function toRecords(data) {
  let rows = data;
  if (rows && !Array.isArray(rows) && typeof rows === 'object') {
    // A single object, or an object containing an array (e.g. { data: [...] }).
    const arrayValue = Object.values(rows).find((v) => Array.isArray(v));
    rows = arrayValue ?? [rows];
  }
  if (!Array.isArray(rows)) throw new Error('JSON must be an array of objects (or an object containing one).');
  if (!rows.length) return [];
  return rows.map((row) => {
    if (row !== null && typeof row === 'object' && !Array.isArray(row)) {
      const flat = {};
      for (const [key, value] of Object.entries(row)) {
        flat[key] = value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
      }
      return flat;
    }
    return { value: row };
  });
}

const csvEscape = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

function recordsToCsv(records) {
  if (!records.length) return '';
  const headers = [];
  for (const record of records) {
    for (const key of Object.keys(record)) if (!headers.includes(key)) headers.push(key);
  }
  const lines = [headers.map(csvEscape).join(',')];
  for (const record of records) {
    lines.push(headers.map((h) => csvEscape(record[h])).join(','));
  }
  return lines.join('\r\n');
}

async function readWorkbook(file) {
  const buffer = await file.arrayBuffer();
  try {
    return XLSX.read(buffer, { type: 'array' });
  } catch (err) {
    throw new Error(`Could not read "${file.name}": ${err.message}`);
  }
}

function firstSheet(wb) {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error('The workbook has no sheets.');
  const sheet = wb.Sheets[sheetName];
  return {
    sheet,
    sheetName,
    sheetCount: wb.SheetNames.length,
    records: XLSX.utils.sheet_to_json(sheet, { defval: '' }),
  };
}

const baseName = (name) => name.replace(/\.[^.]+$/, '');

/** JSON Formatter actions: format | minify | validate. */
export function jsonEditorAction(source, action) {
  if (!source.trim()) throw new Error('Paste or load some JSON first.');
  const { data } = parseJson(source);
  if (action === 'validate') return { preview: '✓ Valid JSON' };
  const output = action === 'minify' ? JSON.stringify(data) : JSON.stringify(data, null, 2);
  return { preview: output };
}

/** Run a local tool. `files` is a File array, `text` an optional editor buffer. */
export async function runLocal(toolId, { files = [] } = {}) {
  const file = files[0];
  if (!file) throw new Error('Please choose a file first.');

  switch (toolId) {
    case 'json-to-csv': {
      const source = await file.text();
      const { data } = parseJson(source);
      const csv = recordsToCsv(toRecords(data));
      return {
        filename: `${baseName(file.name)}.csv`,
        download: enc(csv, 'text/csv;charset=utf-8'),
        preview: csv,
      };
    }

    case 'csv-to-json': {
      const source = await file.text();
      const wb = XLSX.read(source, { type: 'string' });
      const { records, sheetCount } = firstSheet(wb);
      const json = JSON.stringify(records, null, 2);
      return {
        filename: `${baseName(file.name)}.json`,
        download: enc(json, 'application/json'),
        preview: json,
        note: sheetCount > 1 ? `First of ${sheetCount} sheets converted.` : null,
      };
    }

    case 'csv-to-excel': {
      const source = await file.text();
      const wb = XLSX.read(source, { type: 'string' });
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const range = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : null;
      return {
        filename: `${baseName(file.name)}.xlsx`,
        download: new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        preview: range ? `${range.e.r + 1} row(s) written to ${baseName(file.name)}.xlsx` : 'Workbook ready.',
      };
    }

    case 'excel-to-csv': {
      const wb = await readWorkbook(file);
      const { sheet, sheetName, sheetCount } = firstSheet(wb);
      const csv = XLSX.utils.sheet_to_csv(sheet);
      return {
        filename: `${baseName(file.name)}.csv`,
        download: enc(csv, 'text/csv;charset=utf-8'),
        preview: csv,
        note: sheetCount > 1 ? `Sheet "${sheetName}" (first of ${sheetCount}).` : null,
      };
    }

    case 'excel-to-json': {
      const wb = await readWorkbook(file);
      const { records, sheetName, sheetCount } = firstSheet(wb);
      const json = JSON.stringify(records, null, 2);
      return {
        filename: `${baseName(file.name)}.json`,
        download: enc(json, 'application/json'),
        preview: json,
        note: sheetCount > 1 ? `Sheet "${sheetName}" (first of ${sheetCount}).` : null,
      };
    }

    case 'json-to-excel': {
      const source = await file.text();
      const { data } = parseJson(source);
      const records = toRecords(data);
      const ws = XLSX.utils.json_to_sheet(records);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return {
        filename: `${baseName(file.name)}.xlsx`,
        download: new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        preview: `${records.length} row(s) written to ${baseName(file.name)}.xlsx`,
      };
    }

    case 'docx-to-text': {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return {
        filename: `${baseName(file.name)}.txt`,
        download: enc(result.value),
        preview: result.value,
        note: result.messages?.length ? `${result.messages.length} conversion message(s).` : null,
      };
    }

    case 'docx-to-html': {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
      const html = `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${baseName(file.name)}</title>\n<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.6;color:#111}</style>\n</head>\n<body>\n${result.value}\n</body>\n</html>`;
      return {
        filename: `${baseName(file.name)}.html`,
        download: enc(html, 'text/html;charset=utf-8'),
        preview: result.value,
        note: result.messages?.length ? `${result.messages.length} conversion message(s).` : null,
      };
    }

    default:
      throw new Error(`Unknown local tool: ${toolId}`);
  }
}
