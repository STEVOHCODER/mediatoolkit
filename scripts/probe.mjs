/**
 * Probe script for iLoveAPI (iLovePDF API family).
 * Validates auth with the project keys and discovers which tool slugs
 * are accepted by the API. Tasks are opened only to verify a slug exists,
 * then deleted. No credits are consumed (credits are spent on /process).
 *
 * Usage: node scripts/probe.mjs [slug1,slug2,...]
 */
import { ILoveApiClient } from '../server/iloveapi.js';

const PUBLIC_KEY = process.env.ILV_PUBLIC_KEY || 'project_public_09422b776c72134e2993fa20a54f77f6_XzwwNe6df411f5d7b7df7bc924e14922cd34f';
const SECRET_KEY = process.env.ILV_SECRET_KEY || 'secret_key_02aa924eefe4b5a26f3d3f60af0ce7b6_c5R-5a2137376a062e3eba827a85dcc4b0961';

const client = new ILoveApiClient(PUBLIC_KEY, SECRET_KEY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- 1. Verify auth ---------------------------------------------------------
try {
  const data = await client.start('compress');
  console.log(`[auth] OK (server=${data.server}, remaining_files=${data.remaining_files}, remaining_credits=${data.remaining_credits})`);
  await client.deleteTask(data.server, data.task);
} catch (err) {
  console.error(`[auth] FAIL: ${err.message} ${err.body ?? ''}`);
  process.exit(1);
}

// --- 2. Probe tool slugs ---------------------------------------------------
const candidates = process.argv[2]
  ? process.argv[2].split(',')
  : [
      // PDF tools not yet probed + image tools
      'rotate', 'protect', 'pdfa', 'validatepdfa', 'extract', 'htmlpdf', 'editpdf',
      'pdftomarkdown', 'detectforms', 'aisummarizer', 'summarize', 'pdftotext',
      'imagecompress', 'imageconvert', 'imagecrop', 'imageresize', 'imagerotate',
      'imagewatermark', 'htmlimage', 'upscale', 'removebackground', 'removebg',
      'compressimage', 'convertimage', 'cropimage', 'resizeimage', 'rotateimage',
      'watermarkimage', 'backgroundremover', 'smartsplit',
    ];

const found = [];
const missing = [];

for (const slug of candidates) {
  try {
    const data = await client.start(slug);
    found.push(slug);
    console.log(`[tool] ${slug}: OK (server=${data.server})`);
    await client.deleteTask(data.server, data.task);
  } catch (err) {
    missing.push(slug);
    console.log(`[tool] ${slug}: ${err.status || 'NETWORK'} ${err.message} ${err.body ?? ''}`);
  }
  await sleep(250);
}

console.log('\n=== SUMMARY ===');
console.log('Available tools:', found.join(', '));
console.log('Not available  :', missing.join(', '));
