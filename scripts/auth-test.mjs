/** Quick single-request auth test. Prints status and exits. */
import crypto from 'node:crypto';

const PUBLIC_KEY = 'project_public_09422b776c72134e2993fa20a54f77f6_XzwwNe6df411f5d7b7df7bc924e14922cd34f';
const SECRET_KEY = 'secret_key_02aa924eefe4b5a26f3d3f60af0ce7b6_c5R-5a2137376a062e3eba827a85dcc4b0961';
const BASE = 'https://api.ilovepdf.com/v1';

const b64url = (input) => Buffer.from(input).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const body = b64url(JSON.stringify({ jti: PUBLIC_KEY, iss: 'api.ilovepdf.com', iat: now - 5 }));
const data = `${header}.${body}`;
const sig = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
const token = `${data}.${sig}`;

console.log('[env] NODE_USE_ENV_PROXY =', process.env.NODE_USE_ENV_PROXY);
console.log('[env] HTTPS_PROXY =', process.env.HTTPS_PROXY);

const started = Date.now();
try {
  const res = await fetch(`${BASE}/start/compress`, { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  console.log(`[result] status=${res.status} in ${Date.now() - started}ms`);
  console.log('[result] body:', text.slice(0, 400));
} catch (err) {
  console.log(`[result] FAILED in ${Date.now() - started}ms:`, err.message, err.cause?.message ?? '');
}
