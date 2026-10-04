/**
 * Thin iLoveAPI (iLovePDF API family) client.
 *
 * Workflow: start task -> upload files -> process -> download -> delete task.
 * Auth: self-signed HS256 JWT (claims jti/iss/iat) using the project secret key.
 * Docs: https://www.iloveapi.com/docs/api-reference
 *
 * Networking: if HTTP_PROXY/HTTPS_PROXY is present in the environment the
 * client routes through it (using the optional `undici` package) and falls
 * back to a direct connection automatically. Transient network failures retry
 * with backoff.
 */

import crypto from 'node:crypto';

const API_BASE = 'https://api.ilovepdf.com/v1';
const API_HOST = 'api.ilovepdf.com';
// The API rejects tokens generated with the exact current timestamp,
// same delay applied by the official libraries (5 seconds).
const TOKEN_TIME_DELAY = 5;
const TOKEN_TTL_MS = 30 * 60 * 1000;

const b64url = (input) => Buffer.from(input).toString('base64url');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Optional proxy support -------------------------------------------------
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
let proxyDispatcher = null;
let directDispatcher = null;

if (proxyUrl && !process.env.NO_PROXY?.includes('ilovepdf.com')) {
  try {
    const undici = await import('undici');
    proxyDispatcher = new undici.ProxyAgent(proxyUrl);
    directDispatcher = new undici.Agent();
    console.log(`[net] using proxy ${proxyUrl}`);
  } catch {
    console.log('[net] proxy set but optional `undici` package missing - connecting direct');
  }
}

async function fetchWithRetry(url, init = {}, { retries = 3, timeoutMs = 60000 } = {}) {
  let lastError;
  // Attempt 0 uses the proxy when configured, later attempts go direct.
  for (let attempt = 0; attempt < retries; attempt++) {
    const useProxy = attempt === 0 && proxyDispatcher;
    const dispatcher = useProxy ? proxyDispatcher : directDispatcher;
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
        ...(dispatcher ? { dispatcher } : {}),
      });
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) await sleep(500 * (attempt + 1));
    }
  }
  throw lastError;
}

export class ILoveApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message);
    this.name = 'ILoveApiError';
    this.status = status;
    this.body = body;
  }
}

export class ILoveApiClient {
  #publicKey;
  #secretKey;
  #token = null;
  #tokenIssuedAt = 0;

  constructor(publicKey, secretKey) {
    if (!publicKey || !secretKey) {
      throw new ILoveApiError('Missing ILV_PUBLIC_KEY / ILV_SECRET_KEY configuration');
    }
    this.#publicKey = publicKey;
    this.#secretKey = secretKey;
  }

  /** Self-signed JWT accepted by every iLoveAPI endpoint (cached for 30 minutes). */
  getToken() {
    const now = Date.now();
    if (this.#token && now - this.#tokenIssuedAt < TOKEN_TTL_MS) {
      return this.#token;
    }
    const nowSec = Math.floor(now / 1000);
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = b64url(JSON.stringify({
      jti: this.#publicKey,
      iss: API_HOST,
      iat: nowSec - TOKEN_TIME_DELAY,
    }));
    const data = `${header}.${payload}`;
    const signature = crypto.createHmac('sha256', this.#secretKey).update(data).digest('base64url');
    this.#token = `${data}.${signature}`;
    this.#tokenIssuedAt = now;
    return this.#token;
  }

  async #request(url, { method = 'GET', headers = {}, body = null, binary = false, timeoutMs = 60000, retries = 3 } = {}) {
    const res = await fetchWithRetry(url, {
      method,
      headers: { Authorization: `Bearer ${this.getToken()}`, ...headers },
      body,
    }, { retries, timeoutMs });

    if (!res.ok) {
      let detail = '';
      try {
        detail = await res.text();
      } catch { /* ignore */ }
      throw new ILoveApiError(
        `iLoveAPI ${method} ${new URL(url).pathname} failed with ${res.status}`,
        res.status,
        detail.slice(0, 500),
      );
    }

    if (binary) return res;
    return res.json();
  }

  /** Step 1: open a task for a tool. Returns { task, server, remaining_files, remaining_credits }. */
  async start(tool) {
    return this.#request(`${API_BASE}/start/${encodeURIComponent(tool)}`);
  }

  /** Step 2: upload a file buffer to the task server (multipart: task, file). */
  async upload(server, taskId, buffer, filename) {
    const form = new FormData();
    form.append('task', taskId);
    form.append('file', new Blob([buffer]), filename);
    return this.#request(`https://${server}/v1/upload`, {
      method: 'POST',
      body: form,
    }, { timeoutMs: 120000 });
  }

  /** Register a file that already lives at a public URL (no bytes through us). */
  async uploadFromUrl(server, taskId, fileUrl) {
    return this.#request(`https://${server}/v1/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({ task: taskId, cloud_file: fileUrl }),
    }, { timeoutMs: 120000 });
  }

  /**
   * Step 3: run the tool.
   * @param files - [{ server_filename, filename, rotate?, password? }]
   * @param params - extra tool options merged into the body.
   */
  async process(server, taskId, tool, files, params = {}) {
    return this.#request(`https://${server}/v1/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({ task: taskId, tool, files, ...params }),
    }, { timeoutMs: 300000, retries: 2 });
  }

  /** Step 4: download the processed result (binary response stream). */
  async download(server, taskId) {
    return this.#request(`https://${server}/v1/download/${taskId}`, {
      binary: true,
    }, { timeoutMs: 180000 });
  }

  /** Close/delete a task so it stops counting against the open-task limit. */
  async deleteTask(server, taskId) {
    try {
      await this.#request(`https://${server}/v1/task/${taskId}`, { method: 'DELETE' });
    } catch (err) {
      // Tasks auto-expire server side; never fail the user request on cleanup.
      console.warn(`[iloveapi] delete task failed: ${err.message}`);
    }
  }
}
