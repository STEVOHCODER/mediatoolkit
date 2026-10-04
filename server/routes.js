/**
 * HTTP routes for MediaToolkit.
 *
 *  GET  /api/tools        - public metadata for every remote tool
 *  GET  /api/content/:id  - guide copy for any tool (remote or browser-only)
 *  POST /api/tools/:id    - run a tool (multipart files or JSON {url})
 *  GET  /api/download/:id - stream a processed result, then clean the task
 *  GET  /api/health       - liveness probe
 */
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { TOOLS, getTool } from './registry.js';
import { TOOLS_SEO } from './content.js';

const DOWNLOAD_TTL_MS = 30 * 60 * 1000;

/** Serialisable projection of a tool (functions cannot cross the wire). */
function publicTool(tool) {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    accept: tool.accept,
    multiple: Boolean(tool.multiple),
    minFiles: tool.minFiles ?? 1,
    options: tool.options,
    credits: tool.credits,
    inputMode: tool.inputMode ?? 'file',
    urlLabel: tool.urlLabel,
  };
}

function validateOptions(tool, values) {
  const errors = [];
  for (const opt of tool.options ?? []) {
    const value = values[opt.key];
    const missing = value === undefined || value === null || String(value).trim() === '';
    if (opt.required && missing) {
      errors.push(`${opt.label} is required`);
      continue;
    }
    if (!missing && opt.minLength && String(value).length < opt.minLength) {
      errors.push(`${opt.label} must be at least ${opt.minLength} characters`);
    }
  }
  return errors;
}

function validateFiles(tool, files) {
  const errors = [];
  if (tool.inputMode === 'url') return errors;
  if (!files.length) errors.push('Please choose a file first');
  if (files.length < (tool.minFiles ?? 1)) {
    errors.push(`This tool needs at least ${tool.minFiles ?? 1} file(s)`);
  }
  if (!tool.multiple && files.length > 1) {
    errors.push('This tool accepts a single file at a time');
  }
  if (tool.accept?.length) {
    for (const file of files) {
      const ext = file.originalname.includes('.')
        ? `.${file.originalname.split('.').pop().toLowerCase()}`
        : '';
      if (!tool.accept.includes(ext)) {
        errors.push(`"${file.originalname}" is not supported (accepted: ${tool.accept.join(', ')})`);
      }
    }
  }
  return errors;
}

function sanitizeFilename(name) {
  return String(name || 'result').replace(/[^\w.\- ]+/g, '_').slice(0, 120);
}

export function createRoutes({ client }) {
  const downloadMap = new Map();

  // Drop expired download entries and close their remote tasks.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of downloadMap) {
      if (now - entry.createdAt > DOWNLOAD_TTL_MS) {
        downloadMap.delete(key);
        client.deleteTask(entry.server, key).catch(() => {});
      }
    }
  }, 60 * 1000);
  sweeper.unref?.();

  return async function router(req, res, next) {
    try {
      // ------------------------------------------------------ GET /api/tools
      if (req.method === 'GET' && req.path === '/api/tools') {
        res.json({ tools: TOOLS.map(publicTool) });
        return;
      }

      // ------------------------------------------------- GET /api/content/:id
      // Guide copy for any tool id — remote or browser-only alike. The server
      // injects this same text into the HTML; the client fetches it to render.
      // /api/content returns everything in one request so tool pages can be
      // drawn synchronously with no flash of missing content.
      if (req.method === 'GET' && req.path.startsWith('/api/content')) {
        if (req.path === '/api/content') {
          res.json({ content: TOOLS_SEO });
          return;
        }
        const id = decodeURIComponent(req.path.slice('/api/content/'.length));
        const entry = TOOLS_SEO[id];
        if (!entry) {
          res.status(404).json({ error: 'Unknown tool' });
          return;
        }
        res.json({
          id,
          name: entry.name,
          category: entry.category,
          intro: entry.intro,
          steps: entry.steps,
          faqs: entry.faqs,
          related: entry.related,
        });
        return;
      }

      if (req.method === 'GET' && req.path === '/api/health') {
        res.json({ ok: true, service: 'mediatoolkit' });
        return;
      }
      // ------------------------------------------------- POST /api/tools/:id
      if (req.method === 'POST' && req.path.startsWith('/api/tools/')) {
        const toolId = req.path.slice('/api/tools/'.length);
        const tool = getTool(toolId);
        if (!tool) {
          res.status(404).json({ error: 'Unknown tool' });
          return;
        }

        let values = {};
        try {
          values = typeof req.body.options === 'string'
            ? JSON.parse(req.body.options || '{}')
            : (req.body.options ?? {});
        } catch {
          res.status(400).json({ error: 'Invalid options payload' });
          return;
        }

        const files = Array.isArray(req.files) ? req.files : [];
        const errors = [
          ...validateOptions(tool, values),
          ...validateFiles(tool, files),
        ];
        if (errors.length) {
          res.status(400).json({ error: errors.join('. ') });
          return;
        }

        // 1. Start the remote task.
        const started = await client.start(tool.slug);
        const { task, server } = started;
        let processed = false;

        try {
          // 2. Upload files (or register the URL for url-mode tools).
          const uploaded = [];
          if (tool.inputMode === 'url') {
            const url = String(req.body.url || '').trim();
            if (!/^https?:\/\//i.test(url)) {
              res.status(400).json({ error: 'Please enter a valid http(s) URL' });
              return;
            }
            const up = await client.uploadFromUrl(server, task, url);
            uploaded.push({ server_filename: up.server_filename, filename: new URL(url).hostname });
          } else {
            for (const file of files) {
              const up = await client.upload(server, task, file.buffer, file.originalname);
              const entry = { server_filename: up.server_filename, filename: file.originalname };
              if (tool.perFile) {
                for (const [apiParam, valueKey] of Object.entries(tool.perFile)) {
                  const raw = values[valueKey];
                  if (raw !== undefined && raw !== '') entry[apiParam] = Number(raw);
                }
              }
              uploaded.push(entry);
            }
          }

          // 3. Process.
          const params = tool.buildParams ? tool.buildParams(values) : {};
          const result = await client.process(server, task, tool.slug, uploaded, params);
          processed = true;

          downloadMap.set(task, {
            server,
            filename: sanitizeFilename(result.download_filename),
            toolId: tool.id,
            createdAt: Date.now(),
          });

          res.json({
            ok: true,
            taskId: task,
            downloadUrl: `/api/download/${encodeURIComponent(task)}`,
            downloadFilename: sanitizeFilename(result.download_filename),
            outputFilenumber: result.output_filenumber,
            outputFilesize: result.output_filesize,
            filesize: result.filesize,
            remainingCredits: started.remaining_credits ?? null,
          });
        } catch (err) {
          if (!processed) {
            // Close the half-open task; failures are ignored.
            client.deleteTask(server, task).catch(() => {});
          }
          throw err;
        }
        return;
      }

      // --------------------------------------------- GET /api/download/:task
      if (req.method === 'GET' && req.path.startsWith('/api/download/')) {
        const task = decodeURIComponent(req.path.slice('/api/download/'.length));
        const entry = downloadMap.get(task);
        if (!entry) {
          res.status(404).json({ error: 'Result not found or expired. Please run the tool again.' });
          return;
        }

        const upstream = await client.download(entry.server, task);
        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${entry.filename}"`);
        const length = upstream.headers.get('content-length');
        if (length) res.setHeader('Content-Length', length);

        try {
          await pipeline(Readable.fromWeb(upstream.body), res);
        } catch (err) {
          if (!res.headersSent) res.status(502);
          res.end();
          console.warn(`[download] stream failed: ${err.message}`);
          return;
        }

        // Result delivered - close the remote task to free the open-task slot.
        downloadMap.delete(task);
        client.deleteTask(entry.server, task).catch(() => {});
        return;
      }


      next();
    } catch (err) {
      next(err);
    }
  };
}