/**
 * Discover the correct process parameter for image format conversion on the
 * api.ilovepdf.com backend, using a REAL valid PNG (2 credits per run).
 *
 * Usage: node scripts/img-param-probe.mjs
 */
import zlib from 'node:zlib';
import { ILoveApiClient } from '../server/iloveapi.js';

const client = new ILoveApiClient(
  process.env.ILV_PUBLIC_KEY || 'project_public_09422b776c72134e2993fa20a54f77f6_XzwwNe6df411f5d7b7df7bc924e14922cd34f',
  process.env.ILV_SECRET_KEY || 'secret_key_02aa924eefe4b5a26f3d3f60af0ce7b6_c5R-5a2137376a062e3eba827a85dcc4b0961',
);

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
  ihdr[8] = 8;
  ihdr[9] = 2;
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

const runs = [
  { slug: 'convertimage', params: { extension: 'gif' } },
  { slug: 'convertimage', params: { output_format: 'gif' } },
  { slug: 'convertimage', params: { format: 'gif' } },
  { slug: 'convertimage', params: { convert_to: 'gif' } },
  { slug: 'convertimage', params: { ext: 'gif' } },
  { slug: 'convert', params: { to: 'gif' } },
];

for (const { slug, params } of runs) {
  const label = `${slug} + ${Object.keys(params)[0]}=gif`;
  try {
    const { task, server } = await client.start(slug);
    const up = await client.upload(server, task, PNG, 'tiny.png');
    const result = await client.process(server, task, slug,
      [{ server_filename: up.server_filename, filename: 'tiny.png' }], params);
    console.log(`[probe] ${label} -> ${result.download_filename} (ext=${result.output_extensions})`);
    await client.deleteTask(server, task);
  } catch (err) {
    console.log(`[probe] ${label} -> ERROR ${err.status}: ${err.body ?? err.message}`);
  }
}

