/**
 * Executes iLoveAPI-backed tools through our server.
 * Uses XMLHttpRequest so we get real upload progress events.
 *
 * onStage('upload'|'process') is called as the pipeline advances,
 * onProgress(0..1) reports upload percentage.
 */
export function runRemote(tool, { files = [], url = '', options = {}, onStage, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/tools/${encodeURIComponent(tool.id)}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(event.loaded / event.total);
      }
    };
    xhr.upload.onload = () => onStage?.('process');

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON error body */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.ok) {
        onStage?.('done');
        resolve(data);
      } else {
        const message = data?.error
          ?? `The server responded with ${xhr.status}. Please try again.`;
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error('Network error - check your connection and try again.'));
    xhr.ontimeout = () => reject(new Error('The request timed out. Please try again.'));

    onStage?.('upload');

    if (tool.inputMode === 'url') {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({ url, options }));
      return;
    }

    const form = new FormData();
    form.append('options', JSON.stringify(options));
    for (const file of files) form.append('files', file, file.name);
    xhr.send(form);
  });
}
