/**
 * End-to-end test: boots the server, exercises the API with real files
 * against iLoveAPI, verifies downloads and error paths.
 *
 * Usage: node scripts/e2e-test.mjs
 * Spends a small number of iLoveAPI credits (~14): image compress + convert,
 * PDF compress.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import zlib from 'node:zlib';

const PORT = process.env.TEST_PORT || 3999;
const BASE = `http://localhost:${PORT}`;

let failures = 0;
const ok = (name) => console.log(`  OK  ${name}`);
const fail = (name, detail) => {
  failures += 1;
  console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
};

/** Build a real, valid PNG (RGB) so image tools actually process it. */
function buildPng(width = 3, height = 2) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'latin1');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // colour type: truecolour RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 180)]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const PNG = buildPng();

/** Dummy bytes with a .jpg name - only used to test extension rejection. */
const DUMMY_JPG = Buffer.from('not really a jpeg');

/** Minimal but valid 1-page PDF with a computed xref table. */
function buildPdf(text = 'Hello MediaToolkit e2e') {
  const stream = `BT /F1 14 Tf 20 70 Td (${text}) Tj ET\n`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 140] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

async function main() {
  console.log('[e2e] starting server...');
  const server = spawn('node', ['server/index.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));

  try {
    let up = false;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`${BASE}/api/health`);
        if (res.ok) { up = true; break; }
      } catch { /* not yet */ }
      await sleep(250);
    }
    if (!up) throw new Error('server did not start');
    ok('server boots and /api/health responds');

    const toolsRes = await fetch(`${BASE}/api/tools`);
    const { tools } = await toolsRes.json();
    if (toolsRes.ok && Array.isArray(tools) && tools.length >= 25) {
      ok(`/api/tools lists ${tools.length} remote tools`);
    } else {
      fail('/api/tools', `status=${toolsRes.status} count=${tools?.length}`);
    }

    const bad = await fetch(`${BASE}/api/tools/compress-pdf`, { method: 'POST' });
    if (bad.status === 400) ok('POST without files rejected with 400');
    else fail('POST without files rejected', `status=${bad.status}`);

    const unknown = await fetch(`${BASE}/api/tools/not-a-tool`, { method: 'POST' });
    if (unknown.status === 404) ok('unknown tool rejected with 404');
    else fail('unknown tool rejected', `status=${unknown.status}`);

    // Image compress (2 credits).
    {
      const form = new FormData();
      form.append('options', JSON.stringify({}));
      form.append('files', new Blob([PNG], { type: 'image/png' }), 'tiny.png');
      const res = await fetch(`${BASE}/api/tools/compress-image`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.ok && data.downloadUrl) ok(`compress-image runs (${data.downloadFilename})`);
      else fail('compress-image', `${res.status} ${data.error ?? ''}`);

      if (data.downloadUrl) {
        const dl = await fetch(`${BASE}${data.downloadUrl}`);
        const bytes = Buffer.from(await dl.arrayBuffer());
        const disp = dl.headers.get('content-disposition') ?? '';
        // Tiny images may legitimately come back unchanged (nothing to gain),
        // so only assert we got a valid PNG result file.
        const isPng = bytes.length > 8 && bytes.subarray(0, 4).toString('hex') === '89504e47';
        if (dl.ok && isPng) {
          ok(`compress-image download is a PNG (${bytes.length} bytes, ${disp})`);
        } else {
          fail('compress-image download', `status=${dl.status} bytes=${bytes.length} png=${isPng}`);
        }
        const again = await fetch(`${BASE}${data.downloadUrl}`);
        if (again.status === 404) ok('download link is single-use');
        else fail('download single-use', `status=${again.status}`);
      }
    }
    // Image convert to GIF (2 credits) - non-default target proves option pass-through.
    {
      const form = new FormData();
      form.append('options', JSON.stringify({ to: 'gif' }));
      form.append('files', new Blob([PNG], { type: 'image/png' }), 'tiny.png');
      const res = await fetch(`${BASE}/api/tools/convert-image`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.ok && /\.gif$/i.test(data.downloadFilename ?? '')) {
        ok(`convert-image honours options (PNG -> ${data.downloadFilename})`);
      } else {
        fail('convert-image options', `${res.status} ${data.error ?? ''} name=${data.downloadFilename}`);
      }
      if (data.downloadUrl) await fetch(`${BASE}${data.downloadUrl}`).catch(() => {});
    }

    // Required option validation (protect requires password) -> 400.
    {
      const form = new FormData();
      form.append('options', JSON.stringify({}));
      form.append('files', new Blob([buildPdf()], { type: 'application/pdf' }), 'doc.pdf');
      const res = await fetch(`${BASE}/api/tools/protect-pdf`, { method: 'POST', body: form });
      if (res.status === 400) ok('required option (password) enforced with 400');
      else fail('required option enforced', `status=${res.status}`);
    }

    // Wrong file type -> 400 (png bytes offered to a pdf-only tool).
    {
      const form = new FormData();
      form.append('options', JSON.stringify({}));
      form.append('files', new Blob([DUMMY_JPG], { type: 'image/jpeg' }), 'not-a-pdf.jpg');
      const res = await fetch(`${BASE}/api/tools/compress-pdf`, { method: 'POST', body: form });
      if (res.status === 400) ok('file-type validation rejects a JPG for a PDF tool');
      else fail('file-type validation', `status=${res.status}`);
    }

    // PDF compress (10 credits) - the flagship flow.
    {
      const form = new FormData();
      form.append('options', JSON.stringify({ compression_level: 'recommended' }));
      form.append('files', new Blob([buildPdf()], { type: 'application/pdf' }), 'hello.pdf');
      const res = await fetch(`${BASE}/api/tools/compress-pdf`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.ok) ok(`compress-pdf runs (${data.downloadFilename})`);
      else fail('compress-pdf', `${res.status} ${data.error ?? ''}`);

      if (data.downloadUrl) {
        const dl = await fetch(`${BASE}${data.downloadUrl}`);
        const bytes = Buffer.from(await dl.arrayBuffer());
        const magic = bytes.subarray(0, 5).toString('latin1');
        if (dl.ok && magic === '%PDF-') ok(`compress-pdf download is a valid PDF (${bytes.length} bytes)`);
        else fail('compress-pdf download', `status=${dl.status} magic=${JSON.stringify(magic)}`);
      }
    }

    // Merge PDF (5 credits) with two files - validates multi-file upload.
    {
      const form = new FormData();
      form.append('options', JSON.stringify({}));
      form.append('files', new Blob([buildPdf('page one')], { type: 'application/pdf' }), 'one.pdf');
      form.append('files', new Blob([buildPdf('page two')], { type: 'application/pdf' }), 'two.pdf');
      const res = await fetch(`${BASE}/api/tools/merge-pdf`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.ok) ok(`merge-pdf merges two uploads (${data.downloadFilename})`);
      else fail('merge-pdf', `${res.status} ${data.error ?? ''}`);
      if (data.downloadUrl) await fetch(`${BASE}${data.downloadUrl}`).catch(() => {});
    }

    // PDF -> TXT (10 credits) proves the non-PDF output path.
    {
      const form = new FormData();
      form.append('options', JSON.stringify({}));
      form.append('files', new Blob([buildPdf()], { type: 'application/pdf' }), 'hello.pdf');
      const res = await fetch(`${BASE}/api/tools/pdf-to-text`, { method: 'POST', body: form });
      const data = await res.json();
      if (res.ok && data.ok) ok(`pdf-to-text runs (${data.downloadFilename})`);
      else fail('pdf-to-text', `${res.status} ${data.error ?? ''} ${data.detail ?? ''}`);
      if (data.downloadUrl) {
        const dl = await fetch(`${BASE}${data.downloadUrl}`);
        const raw = Buffer.from(await dl.arrayBuffer());
        // The extract tool emits UTF-16 text; normalise before matching.
        const text = raw.toString('utf16le').replace(/\u0000/g, '');
        if (dl.ok && /MediaToolkit/i.test(text)) ok('pdf-to-text output contains the document text');
        else fail('pdf-to-text content', `status=${dl.status} body=${text.slice(0, 80)}`);
      }
    }
  } catch (err) {
    fail('e2e crashed', err.message);
  } finally {
    server.kill();
  }

  console.log(failures === 0 ? '\n[e2e] ALL TESTS PASSED' : `\n[e2e] ${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
