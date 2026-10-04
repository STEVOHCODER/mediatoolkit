/**
 * View rendering: landing page + tool pages.
 */
import { icon } from './icons.js';
import {
  CATEGORIES, toolsByCategory, toolIcon, categoryMeta, getTool, getContent,
} from './registry.js';
import { introHtml, guideHtml } from './guide.js';
import { runRemote } from './runner.js';
import { runLocal, jsonEditorAction } from './local.js';
import { refreshAds } from './ads.js';

const app = document.getElementById('app');

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

/* ================================================================ LANDING == */
export function renderLanding() {
  const sections = CATEGORIES.map((cat) => {
    const tools = toolsByCategory(cat.id);
    if (!tools.length) return '';
    const cards = tools.map((tool) => `
      <a class="tool-card" href="/tool/${esc(tool.id)}" data-hash="/tool/${esc(tool.id)}"
         data-search="${esc(`${tool.name} ${tool.description} ${cat.name}`.toLowerCase())}">
        <span class="t-icon" style="background:${cat.tint}">${icon(toolIcon(tool))}</span>
        <span class="t-body">
          <h3>${esc(tool.name)}</h3>
          <p>${esc(tool.description)}</p>
        </span>
        ${tool.engine === 'local' ? '<span class="t-badge local">Private</span>' : ''}
      </a>`).join('');

    return `
      <section class="tool-section" id="c-${cat.id}" data-category="${cat.id}">
        <div class="section-head">
          <span class="chip" style="background:${cat.tint}">${icon(cat.icon)}</span>
          <h2>${esc(cat.name)}</h2>
          <span class="count" data-count>${tools.length} tools</span>
        </div>
        <div class="tool-grid">${cards}</div>
      </section>`;
  }).join('');

  app.innerHTML = `
    <section class="hero">
      <div class="container hero-inner">
        <span class="eyebrow">${icon('zap')} One toolkit · every format</span>
        <h1>Everything you need for<br><span class="grad">documents &amp; images</span></h1>
        <p class="lead">Compress, convert, merge and transform PDFs, images, Office files, JSON, CSV and Excel.
          Powerful servers for the heavy lifting, your browser for the private stuff.</p>
        <div class="search-wrap">
          <span class="search-icon">${icon('search')}</span>
          <input class="search-input" id="tool-search" type="search"
                 placeholder="Search ${countAll()} tools… e.g. compress, excel, watermark" autocomplete="off">
        </div>
        <div class="features">
          <div class="feature"><span class="fi">${icon('zap')}</span><div><h3>Instant tools</h3><p>Drop a file, click once, download the result.</p></div></div>
          <div class="feature"><span class="fi">${icon('shield')}</span><div><h3>Private by design</h3><p>Data tools run entirely in your browser.</p></div></div>
          <div class="feature"><span class="fi">${icon('gauge')}</span><div><h3>Battle-tested engine</h3><p>Processing powered by iLoveAPI — 20M+ files daily.</p></div></div>
          <div class="feature"><span class="fi">${icon('lock')}</span><div><h3>Nothing is stored</h3><p>Files are deleted automatically right after processing.</p></div></div>
        </div>
      </div>
    </section>

    <div class="container">
      ${sections}
      <div class="ad-slot" data-ad-slot="home"></div>
      <div class="no-results" id="no-results">
        ${icon('search')}
        <p>No tools match your search. Try “pdf”, “excel” or “resize”.</p>
      </div>
    </div>`;

  wireSearch();
}

function countAll() {
  return CATEGORIES.reduce((sum, cat) => sum + toolsByCategory(cat.id).length, 0);
}

function wireSearch() {
  const input = document.getElementById('tool-search');
  const noResults = document.getElementById('no-results');
  input?.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let visibleTotal = 0;

    for (const section of app.querySelectorAll('.tool-section')) {
      let visibleInSection = 0;
      for (const card of section.querySelectorAll('.tool-card')) {
        const match = !query || card.dataset.search.includes(query);
        card.classList.toggle('hidden', !match);
        if (match) visibleInSection += 1;
      }
      section.classList.toggle('hidden', visibleInSection === 0);
      visibleTotal += visibleInSection;
      const counter = section.querySelector('[data-count]');
      if (counter && query) counter.textContent = `${visibleInSection} match${visibleInSection === 1 ? '' : 'es'}`;
      else if (counter) {
        const cat = section.dataset.category;
        counter.textContent = `${toolsByCategory(cat).length} tools`;
      }
    }
    noResults?.classList.toggle('visible', visibleTotal === 0);
  });
}

/* ============================================================= TOOL PAGE == */
export function renderTool(tool) {
  const cat = categoryMeta(tool.category);
  const isLocal = tool.engine === 'local';
  const isEditor = tool.inputMode === 'editor';
  const hasOptions = (tool.options?.length ?? 0) > 0;

  // Guide copy: the intro sits under the header, the how-to steps, FAQ and
  // related-tool links sit below the working tool. Server-rendered into the
  // HTML as well, so this re-renders the exact same text.
  const guideContent = getContent(tool.id);
  const intro = guideContent ? introHtml(guideContent) : '';
  const guide = guideContent
    ? guideHtml(guideContent, (id) => getTool(id)?.name ?? id)
    : '';

  const headerHtml = `
    <nav class="breadcrumb">
      <a href="/">Home</a><span class="sep">/</span>
      <a href="/category/${cat.id}">${esc(cat.name)}</a><span class="sep">/</span>
      <span>${esc(tool.name)}</span>
    </nav>
    <header class="tool-header">
      <span class="t-icon" style="background:${cat.tint}">${icon(toolIcon(tool))}</span>
      <div>
        <h1>${esc(tool.name)}</h1>
        <p>${esc(tool.description)}</p>
        <div class="meta-row">
          <span class="pill free">${isLocal ? 'Runs in your browser' : 'Free tier ready'}</span>
          <span class="pill credits">${esc(tool.credits ?? '')}</span>
          ${tool.accept?.length ? `<span class="pill">${tool.accept.join(' ')}</span>` : ''}
        </div>
      </div>
    </header>`;

  if (isEditor) {
    app.innerHTML = `<div class="tool-page container">${headerHtml}${intro}
      <div class="local-editor">
        <div class="local-toolbar">
          <button class="btn btn-primary" style="width:auto" data-action="format">${icon('braces')} Format</button>
          <button class="btn btn-ghost" data-action="minify">Minify</button>
          <button class="btn btn-ghost" data-action="validate">Validate</button>
          <button class="btn btn-ghost" data-action="load">Load .json file</button>
          <span class="spacer"></span>
          <button class="btn btn-ghost" data-action="copy">Copy</button>
          <button class="btn btn-ghost" data-action="download">Download</button>
          <input type="file" accept=".json,application/json" hidden data-editor-file>
        </div>
        <div class="local-io">
          <div class="io-pane">
            <div class="io-head"><span>Input</span>
              <span class="io-actions"><button data-action="clear">Clear</button></span>
            </div>
            <textarea data-io="input" spellcheck="false" placeholder='Paste JSON here, e.g. { "name": "MediaToolkit", "tools": 36 }'></textarea>
            <div class="io-error" data-io-error></div>
          </div>
          <div class="io-pane">
            <div class="io-head"><span>Output</span>
              <span class="io-actions"><button data-action="copy-output">Copy</button></span>
            </div>
            <textarea data-io="output" readonly spellcheck="false" placeholder="Formatted output appears here"></textarea>
          </div>
        </div>
      </div>
      ${guide}
    </div>`;
    wireEditor(tool);
    return;
  }

  const inputBlock = tool.inputMode === 'url'
    ? `
      <div class="url-row">
        <input type="url" data-url placeholder="https://example.com" spellcheck="false">
      </div>
      <p class="run-hint" style="text-align:left;margin-top:8px">The page will be rendered and converted on our servers.</p>`
    : `
      <div class="dropzone" data-dropzone tabindex="0" role="button" aria-label="Choose file">
        <span class="dz-icon">${icon('upload')}</span>
        <h3>Drop ${tool.multiple ? 'files' : 'a file'} here or click to browse</h3>
        <p>${tool.multiple ? 'Add as many files as you need' : 'One file at a time'}</p>
        <span class="dz-hint">${tool.accept?.length ? tool.accept.join(' · ') : 'any file'}</span>
        <input type="file" ${tool.multiple ? 'multiple' : ''}
               accept="${tool.accept?.length ? tool.accept.join(',') : ''}" data-file-input>
      </div>
      <ul class="file-list" data-file-list></ul>`;

  app.innerHTML = `<div class="tool-page container">
    ${headerHtml}${intro}
    <div class="tool-layout">
      <div class="panel">
        ${inputBlock}

        <div class="progress-box" data-progress>
          <div class="progress-step" data-step="upload">
            <span class="step-icon">${icon('upload')}</span><span>Uploading files…</span>
          </div>
          <div class="progress-bar"><span class="fill" data-fill></span></div>
          <div class="progress-label" data-progress-label></div>
          <div class="progress-step" data-step="process">
            <span class="step-icon">${icon('clock')}</span><span>Processing…</span>
          </div>
        </div>

        <div class="alert" data-alert>${icon('alert')}<span data-alert-text></span></div>

        <div class="result-box" data-result>
          <div class="result-card">
            <span class="r-icon">${icon('check')}</span>
            <div class="r-body">
              <div class="r-title" data-result-title></div>
              <div class="r-meta" data-result-meta></div>
            </div>
          </div>
          <div class="result-actions">
            <a class="btn btn-primary" style="width:auto" data-download-link download>
              ${icon('download')} <span>Download</span></a>
            <button class="btn btn-ghost" data-reset>${icon('arrowLeft')} Process another</button>
          </div>
        </div>
        <div class="ad-slot" data-ad-slot="tool"></div>
      </div>

      <aside class="panel options-panel">
        <h4>Options</h4>
        <div data-options>
          ${hasOptions ? '' : '<p style="color:var(--muted);font-size:.86rem;margin:0 0 6px">This tool works best with the defaults — just add your files and go.</p>'}
        </div>
        <button class="btn btn-primary" data-run disabled>
          ${icon('zap')} <span data-run-label>${esc(tool.name)}</span>
        </button>
        <p class="run-hint">
          ${isLocal ? 'Processed locally — your data never leaves this device.'
            : `Processed securely · ${esc(tool.credits ?? '')} · files auto-deleted`}
        </p>
      </aside>
    </div>
    ${guide}
  </div>`;

  wireFileTool(tool);
}

/* ---------------------------------------------------- field rendering ---- */
function renderField(opt) {
  const id = `opt-${opt.key}`;
  const required = opt.required ? ' <span class="req">*</span>' : '';
  const showIf = opt.showIf ? `data-showif='${esc(JSON.stringify(opt.showIf))}'` : '';

  if (opt.type === 'checkbox') {
    return `<div class="field check" data-field="${esc(opt.key)}" ${showIf}>
      <input type="checkbox" id="${id}" data-key="${esc(opt.key)}">
      <label for="${id}">${esc(opt.label)}</label>
    </div>`;
  }

  let control = '';
  switch (opt.type) {
    case 'select':
      control = `<select id="${id}" data-key="${esc(opt.key)}">${
        opt.choices.map((c) => `<option value="${esc(c.value)}" ${
          c.value === (opt.default ?? opt.choices[0]?.value) ? 'selected' : ''}>${esc(c.label)}</option>`
        ).join('')}</select>`;
      break;
    case 'number':
      control = `<input type="number" id="${id}" data-key="${esc(opt.key)}"
        value="${opt.default ?? ''}" ${opt.min !== undefined ? `min="${opt.min}"` : ''}
        ${opt.max !== undefined ? `max="${opt.max}"` : ''}
        ${opt.placeholder ? `placeholder="${esc(opt.placeholder)}"` : ''}>`;
      break;
    case 'range':
      control = `<input type="range" id="${id}" data-key="${esc(opt.key)}"
        value="${opt.default ?? 0}" min="${opt.min ?? 0}" max="${opt.max ?? 100}">`;
      break;
    case 'color':
      control = `<input type="color" id="${id}" data-key="${esc(opt.key)}" value="${esc(opt.default ?? '#000000')}">`;
      break;
    case 'password':
      control = `<input type="password" id="${id}" data-key="${esc(opt.key)}" autocomplete="new-password"
        ${opt.minLength ? `minlength="${opt.minLength}"` : ''} placeholder="••••••••">`;
      break;
    default:
      control = `<input type="text" id="${id}" data-key="${esc(opt.key)}"
        ${opt.placeholder ? `placeholder="${esc(opt.placeholder)}"` : ''}>`;
  }

  return `<div class="field" data-field="${esc(opt.key)}" ${showIf}>
    <label for="${id}">${esc(opt.label)}${required}</label>
    ${control}
  </div>`;
}

function collectValues(optionsHost, tool) {
  const values = {};
  for (const opt of tool.options ?? []) {
    const el = optionsHost.querySelector(`[data-key="${opt.key}"]`);
    if (!el) continue;
    values[opt.key] = el.type === 'checkbox' ? el.checked : el.value;
  }
  return values;
}

function evaluateShowIf(optionsHost, tool) {
  const values = collectValues(optionsHost, tool);
  for (const opt of tool.options ?? []) {
    const field = optionsHost.querySelector(`[data-field="${opt.key}"]`);
    if (!field) continue;
    if (!opt.showIf) { field.classList.remove('hidden'); continue; }
    const [key, expected] = Object.entries(opt.showIf)[0];
    field.classList.toggle('hidden', String(values[key]) !== String(expected));
  }
}

/* ------------------------------------------------------- wire file tool --- */
function wireFileTool(tool) {
  const isLocal = tool.engine === 'local';
  const isUrlMode = tool.inputMode === 'url';
  const dropzone = app.querySelector('[data-dropzone]');
  const fileInput = app.querySelector('[data-file-input]');
  const fileListEl = app.querySelector('[data-file-list]');
  const urlInput = app.querySelector('[data-url]');
  const optionsHost = app.querySelector('[data-options]');
  const runBtn = app.querySelector('[data-run]');
  const runLabel = app.querySelector('[data-run-label]');
  const progressBox = app.querySelector('[data-progress]');
  const fill = app.querySelector('[data-fill]');
  const progressLabel = app.querySelector('[data-progress-label]');
  const stepUpload = app.querySelector('[data-step="upload"]');
  const stepProcess = app.querySelector('[data-step="process"]');
  const alertBox = app.querySelector('[data-alert]');
  const alertText = app.querySelector('[data-alert-text]');
  const resultBox = app.querySelector('[data-result]');

  let files = [];
  let busy = false;

  // ---- options
  if (tool.options?.length) {
    optionsHost.innerHTML = tool.options.map(renderField).join('');
    evaluateShowIf(optionsHost, tool);
    optionsHost.addEventListener('input', () => evaluateShowIf(optionsHost, tool));
    optionsHost.addEventListener('change', () => evaluateShowIf(optionsHost, tool));
  }

  // ---- file selection
  const acceptOk = (file) => !tool.accept?.length
    || tool.accept.includes(`.${file.name.split('.').pop()?.toLowerCase() ?? ''}`);

  function addFiles(incoming) {
    const incomingArr = [...incoming];
    const valid = incomingArr.filter(acceptOk);
    const rejected = incomingArr.length - valid.length;
    if (rejected) showAlert(`${rejected} file(s) skipped - accepted types: ${tool.accept.join(', ')}`);
    files = tool.multiple ? [...files, ...valid].slice(0, 30) : valid.slice(0, 1);
    renderFileList();
  }

  function renderFileList() {
    if (!fileListEl) return;
    fileListEl.innerHTML = files.map((file, i) => `
      <li>
        <span style="color:var(--primary);display:grid;place-items:center">${icon('file')}</span>
        <span class="f-name">${esc(file.name)}</span>
        <span class="f-size">${formatBytes(file.size)}</span>
        <button class="f-remove" data-remove="${i}" aria-label="Remove">${icon('x')}</button>
      </li>`).join('');
    fileListEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        files.splice(Number(btn.dataset.remove), 1);
        renderFileList();
      });
    });
    if (dropzone) dropzone.style.display = files.length && !tool.multiple ? 'none' : '';
    updateRunState();
  }

  function updateRunState() {
    if (busy) return;
    if (isUrlMode) {
      runBtn.disabled = !/^https?:\/\/\S+\.\S+/.test(urlInput?.value?.trim() ?? '');
    } else {
      runBtn.disabled = files.length < (tool.minFiles ?? 1);
    }
  }

  if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => { if (e.key === 'Enter') fileInput.click(); });
    fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
    for (const evt of ['dragenter', 'dragover']) {
      dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    }
    for (const evt of ['dragleave', 'drop']) {
      dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); });
    }
    dropzone.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
  }
  urlInput?.addEventListener('input', updateRunState);
  updateRunState();

  // ---- feedback helpers
  function showAlert(message) {
    alertBox.classList.toggle('visible', Boolean(message));
    if (message) alertText.textContent = message;
  }

  function setBusy(next) {
    busy = next;
    runBtn.disabled = next;
    runLabel.textContent = next ? 'Working…' : tool.name;
    const oldSpinner = runBtn.querySelector('.spinner');
    if (oldSpinner) oldSpinner.remove();
    if (next) runBtn.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>');
    else updateRunState();
  }

  function resetProgress() {
    progressBox.classList.add('visible');
    fill.style.width = '0%';
    progressLabel.textContent = '';
    for (const step of [stepUpload, stepProcess]) step.classList.remove('active', 'done');
  }

  // ---- show result
  function showResult({ title, meta, href = null, downloadBlob = null, previewText = null, note = null }) {
    resultBox.querySelector('[data-result-title]').textContent = title;
    resultBox.querySelector('[data-result-meta]').textContent = [meta, note].filter(Boolean).join(' · ');
    const link = resultBox.querySelector('[data-download-link]');
    if (href) {
      link.href = href;
      link.removeAttribute('download');
    } else if (downloadBlob) {
      link.href = URL.createObjectURL(downloadBlob);
      link.setAttribute('download', title);
    }

    let previewEl = resultBox.querySelector('[data-result-preview]');
    if (previewText && previewText.length < 20000) {
      if (!previewEl) {
        previewEl = document.createElement('textarea');
        previewEl.setAttribute('data-result-preview', '');
        previewEl.readOnly = true;
        previewEl.spellcheck = false;
        Object.assign(previewEl.style, {
          width: '100%', marginTop: '12px', minHeight: '140px', maxHeight: '260px',
          resize: 'vertical', padding: '12px', borderRadius: '9px',
          border: '1px solid var(--line)', background: 'var(--surface-2)',
          color: 'var(--ink)', font: '.82rem/1.5 var(--mono)',
        });
        resultBox.querySelector('.result-card').after(previewEl);
      }
      previewEl.value = previewText;
    } else if (previewEl) {
      previewEl.remove();
    }
    resultBox.classList.add('visible');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ---- validate required options
  function optionErrors(values) {
    const errors = [];
    for (const opt of tool.options ?? []) {
      const value = values[opt.key];
      const missing = value === undefined || value === null || String(value).trim() === '';
      if (opt.required && missing) errors.push(`${opt.label} is required`);
      if (!missing && opt.minLength && String(value).length < opt.minLength) {
        errors.push(`${opt.label} must be at least ${opt.minLength} characters`);
      }
      if (!missing && opt.type === 'number' && opt.min !== undefined && Number(value) < opt.min) {
        errors.push(`${opt.label} must be at least ${opt.min}`);
      }
    }
    return errors;
  }

  // ---- main run
  runBtn.addEventListener('click', async () => {
    if (busy) return;
    showAlert(null);
    resultBox.classList.remove('visible');

    const values = collectValues(optionsHost, tool);
    const errors = optionErrors(values);
    if (errors.length) { showAlert(errors.join('. ')); return; }

    setBusy(true);
    resetProgress();

    try {
      if (isLocal) {
        stepUpload.classList.add('active');
        const out = await runLocal(tool.id, { files });
        stepUpload.classList.remove('active');
        stepUpload.classList.add('done');
        stepProcess.classList.add('done');
        progressBox.classList.remove('visible');
        showResult({
          title: out.filename,
          meta: `${out.preview ? `${out.preview.length} chars · ` : ''}processed locally`,
          downloadBlob: out.download,
          previewText: out.preview,
          note: out.note,
        });
      } else {
        const result = await runRemote(tool, {
          files,
          url: urlInput?.value?.trim() ?? '',
          options: values,
          onStage: (stage) => {
            if (stage === 'upload') {
              stepUpload.classList.add('active');
              progressLabel.textContent = 'Uploading…';
            }
            if (stage === 'process') {
              stepUpload.classList.remove('active');
              stepUpload.classList.add('done');
              stepProcess.classList.add('active');
              fill.style.width = '100%';
              progressLabel.textContent = 'Processing on secure servers…';
            }
          },
          onProgress: (ratio) => {
            const pct = Math.round(ratio * 100);
            fill.style.width = `${pct}%`;
            progressLabel.textContent = `Uploading… ${pct}%`;
          },
        });
        stepProcess.classList.remove('active');
        stepProcess.classList.add('done');
        progressLabel.textContent = 'Done!';
        setTimeout(() => progressBox.classList.remove('visible'), 700);

        const meta = [
          result.filesize && result.outputFilesize
            ? `${formatBytes(result.filesize)} → ${formatBytes(result.outputFilesize)}`
            : '',
          result.outputFilenumber ? `${result.outputFilenumber} output file(s)` : '',
          result.remainingCredits != null ? `${result.remainingCredits} credits left` : '',
        ].filter(Boolean).join(' · ');

        showResult({
          title: result.downloadFilename,
          meta,
          href: result.downloadUrl,
          preview: null,
          note: null,
        });
      }
    } catch (err) {
      progressBox.classList.remove('visible');
      showAlert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  });

  // helper used above for local blobs
  app.querySelector('[data-reset]')?.addEventListener('click', () => {
    files = [];
    if (fileListEl) renderFileList();
    if (dropzone) dropzone.style.display = '';
    resultBox.classList.remove('visible');
    progressBox.classList.remove('visible');
    showAlert(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  refreshAds();
}

/* ------------------------------------------------------------ wire editor -- */
/** Editor-mode tools (JSON formatter): two textareas + toolbar actions. */
function wireEditor(tool) {
  const inputEl = app.querySelector('[data-io="input"]');
  const outputEl = app.querySelector('[data-io="output"]');
  const errorEl = app.querySelector('[data-io-error]');
  const fileInput = app.querySelector('[data-editor-file]');

  let lastOutput = '';

  const showError = (message) => {
    errorEl.textContent = message ?? '';
    errorEl.classList.toggle('visible', Boolean(message));
  };

  const setOutput = (text) => {
    lastOutput = text ?? '';
    outputEl.value = lastOutput;
    showError(null);
  };

  const run = (action) => {
    try {
      const { preview } = jsonEditorAction(inputEl.value, action);
      setOutput(preview);
    } catch (err) {
      setOutput('');
      showError(err.message);
    }
  };

  app.querySelectorAll('[data-action]').forEach((btn) => {
    const action = btn.dataset.action;
    btn.addEventListener('click', async () => {
      switch (action) {
        case 'format':
        case 'minify':
        case 'validate':
          run(action);
          break;
        case 'load':
          fileInput.click();
          break;
        case 'clear':
          inputEl.value = '';
          setOutput('');
          inputEl.focus();
          break;
        case 'copy':
        case 'copy-output': {
          const text = action === 'copy' ? lastOutput || inputEl.value : outputEl.value;
          try {
            await navigator.clipboard.writeText(text);
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = original; }, 1200);
          } catch {
            showError('Clipboard access was blocked by the browser - select the text and copy manually.');
          }
          break;
        }
        case 'download': {
          if (!lastOutput) return;
          const blob = new Blob([lastOutput], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'formatted.json';
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          break;
        }
        default:
          break;
      }
    });
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    try {
      inputEl.value = await file.text();
      run('format');
    } catch {
      showError(`Could not read "${file.name}".`);
    }
  });
}


