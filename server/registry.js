/**
 * Server-side registry of iLoveAPI-powered tools.
 *
 * Each entry:
 *  - id:       stable tool id used in URLs and API routes
 *  - slug:     iLoveAPI task slug passed to /v1/start/{slug}
 *  - category: pdf | image | convert
 *  - accept:   accepted file extensions for upload
 *  - multiple: whether several files can be added to one task
 *  - options:  declarative option schema; keys are sent to /v1/process
 *    (via buildParams, or perFile for per-file parameters like rotate)
 *
 * Credit costs (https://www.iloveapi.com/pricing) are informational.
 */

export const TOOLS = [
  // ---------------------------------------------------------------- PDF ---
  {
    id: 'merge-pdf',
    slug: 'merge',
    category: 'pdf',
    name: 'Merge PDF',
    description: 'Combine two or more PDFs into a single document.',
    accept: ['.pdf'],
    multiple: true,
    minFiles: 2,
    credits: '5 / task',
    options: [],
  },
  {
    id: 'split-pdf',
    slug: 'split',
    category: 'pdf',
    name: 'Split PDF',
    description: 'Extract page ranges, split every N pages or remove pages.',
    accept: ['.pdf'],
    multiple: false,
    credits: '5 / file',
    options: [
      {
        key: 'split_mode', label: 'Mode', type: 'select',
        choices: [
          { value: 'ranges', label: 'Extract page ranges' },
          { value: 'fixed', label: 'Split every N pages' },
          { value: 'remove', label: 'Remove pages (keep the rest)' },
        ],
        default: 'ranges',
      },
      {
        key: 'ranges', label: 'Page ranges', type: 'text', placeholder: 'e.g. 1-3, 6-8',
        showIf: { split_mode: 'ranges' },
      },
      {
        key: 'fixed_range', label: 'Pages per file', type: 'number', min: 1, placeholder: 'e.g. 2',
        showIf: { split_mode: 'fixed' },
      },
      {
        key: 'remove_pages', label: 'Pages to remove', type: 'text', placeholder: 'e.g. 2-4',
        showIf: { split_mode: 'remove' },
      },
    ],
    buildParams(values) {
      const { split_mode, ranges, fixed_range, remove_pages } = values;
      if (split_mode === 'fixed' && fixed_range) return { fixed_range: Number(fixed_range) };
      if (split_mode === 'remove' && remove_pages) return { remove_pages: remove_pages.trim() };
      if (ranges) return { ranges: ranges.trim() };
      return {};
    },
  },
  {
    id: 'compress-pdf',
    slug: 'compress',
    category: 'pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while keeping great quality.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [
      {
        key: 'compression_level', label: 'Compression level', type: 'select',
        choices: [
          { value: 'recommended', label: 'Recommended (best balance)' },
          { value: 'low', label: 'Low (no quality loss)' },
          { value: 'extreme', label: 'Extreme (smallest size)' },
        ],
        default: 'recommended',
      },
    ],
    buildParams: (v) => ({ compression_level: v.compression_level || 'recommended' }),
  },
  {
    id: 'ocr-pdf',
    slug: 'pdfocr',
    category: 'pdf',
    name: 'OCR PDF',
    description: 'Turn scanned PDFs into searchable, selectable text.',
    accept: ['.pdf'],
    multiple: true,
    credits: '5 / page',
    options: [],
  },
  {
    id: 'pdf-to-jpg',
    slug: 'pdfjpg',
    category: 'pdf',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images or extract embedded images.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [
      {
        key: 'pdfjpg_mode', label: 'Mode', type: 'select',
        choices: [
          { value: 'pages', label: 'Every page becomes an image' },
          { value: 'extract', label: 'Extract embedded images' },
        ],
        default: 'pages',
      },
    ],
    buildParams: (v) => ({ pdfjpg_mode: v.pdfjpg_mode || 'pages' }),
  },
  {
    id: 'jpg-to-pdf',
    slug: 'imagepdf',
    category: 'pdf',
    name: 'JPG to PDF',
    description: 'Combine JPG, PNG and TIFF images into a PDF.',
    accept: ['.jpg', '.jpeg', '.png', '.tiff', '.tif'],
    multiple: true,
    minFiles: 1,
    credits: '10 / file',
    options: [],
  },
  {
    id: 'rotate-pdf',
    slug: 'rotate',
    category: 'pdf',
    name: 'Rotate PDF',
    description: 'Rotate every page of a PDF by 90°, 180° or 270°.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [
      {
        key: 'angle', label: 'Rotation', type: 'select',
        choices: [
          { value: '90', label: '90° clockwise' },
          { value: '180', label: '180°' },
          { value: '270', label: '90° counter-clockwise' },
          { value: '0', label: '0° (upright)' },
        ],
        default: '90',
      },
    ],
    // rotate is a per-file parameter, mapped in routes.js
    perFile: { rotate: 'angle' },
    buildParams: () => ({}),
  },
  {
    id: 'protect-pdf',
    slug: 'protect',
    category: 'pdf',
    name: 'Protect PDF',
    description: 'Encrypt a PDF with a password.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [
      { key: 'password', label: 'Password', type: 'password', required: true, minLength: 4 },
    ],
    buildParams: (v) => ({ password: v.password }),
  },
  {
    id: 'unlock-pdf',
    slug: 'unlock',
    category: 'pdf',
    name: 'Unlock PDF',
    description: 'Remove printing and editing restrictions from a PDF.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [],
  },
  {
    id: 'watermark-pdf',
    slug: 'watermark',
    category: 'pdf',
    name: 'Watermark PDF',
    description: 'Stamp text over every page of your PDF.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [
      { key: 'text', label: 'Watermark text', type: 'text', required: true, placeholder: 'e.g. CONFIDENTIAL' },
      { key: 'rotation', label: 'Rotation (°)', type: 'number', min: -180, max: 180, default: 0 },
      { key: 'font_size', label: 'Font size', type: 'number', min: 8, max: 96, default: 48 },
      { key: 'font_color', label: 'Color', type: 'color', default: '#000000' },
      { key: 'transparency', label: 'Transparency (0–100)', type: 'range', min: 0, max: 100, default: 100 },
      { key: 'mosaic', label: 'Tile as 3×3 mosaic', type: 'checkbox' },
    ],
    buildParams: (v) => ({
      text: v.text,
      rotation: Number(v.rotation ?? 0),
      font_size: Number(v.font_size ?? 48),
      font_color: v.font_color || '#000000',
      transparency: Number(v.transparency ?? 100),
      mosaic: v.mosaic === true || v.mosaic === 'true',
    }),
  },
  {
    id: 'page-numbers',
    slug: 'pagenumber',
    category: 'pdf',
    name: 'Add Page Numbers',
    description: 'Number your PDF pages with full position control.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [
      {
        key: 'horizontal_position', label: 'Horizontal position', type: 'select',
        choices: [
          { value: 'center', label: 'Center' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
        default: 'center',
      },
      { key: 'first_cover', label: 'Skip the first (cover) page', type: 'checkbox' },
    ],
    buildParams: (v) => ({
      horizontal_position: v.horizontal_position || 'center',
      first_cover: v.first_cover === true || v.first_cover === 'true',
    }),
  },
  {
    id: 'repair-pdf',
    slug: 'repair',
    category: 'pdf',
    name: 'Repair PDF',
    description: 'Fix corrupted or broken PDF files.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [],
  },
  {
    id: 'pdf-to-pdfa',
    slug: 'pdfa',
    category: 'pdf',
    name: 'PDF to PDF/A',
    description: 'Convert a PDF to the archival PDF/A standard.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [],
  },
  {
    id: 'validate-pdfa',
    slug: 'validatepdfa',
    category: 'pdf',
    name: 'Validate PDF/A',
    description: 'Check whether a PDF really complies with PDF/A.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [],
  },
  {
    id: 'pdf-to-text',
    slug: 'extract',
    category: 'pdf',
    name: 'PDF to TXT',
    description: 'Extract all text from a PDF into a plain .txt file.',
    accept: ['.pdf'],
    multiple: true,
    credits: '10 / file',
    options: [],
  },

  // ----------------------------------------------------------- Converters --
  {
    id: 'office-to-pdf',
    slug: 'officepdf',
    category: 'convert',
    name: 'Word, Excel & PPT to PDF',
    description: 'Convert DOCX, XLSX, PPTX and older Office files to PDF.',
    accept: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.rtf'],
    multiple: true,
    credits: '10 / file',
    options: [],
  },
  {
    id: 'html-to-pdf',
    slug: 'htmlpdf',
    category: 'convert',
    name: 'Web page to PDF',
    description: 'Save any web page URL as a PDF document.',
    accept: [],
    multiple: false,
    inputMode: 'url',
    urlLabel: 'Web page URL',
    credits: '10 / file',
    options: [
      {
        key: 'page_size', label: 'Page size', type: 'select',
        choices: [
          { value: 'A4', label: 'A4' },
          { value: 'Letter', label: 'Letter' },
          { value: 'A5', label: 'A5' },
          { value: 'Fit', label: 'Fit content' },
        ],
        default: 'A4',
      },
      {
        key: 'page_orientation', label: 'Orientation', type: 'select',
        choices: [
          { value: 'portrait', label: 'Portrait' },
          { value: 'landscape', label: 'Landscape' },
        ],
        default: 'portrait',
      },
      { key: 'single_page', label: 'Single long page', type: 'checkbox' },
    ],
    buildParams: (v) => ({
      page_size: v.page_size || 'A4',
      page_orientation: v.page_orientation || 'portrait',
      single_page: v.single_page === true || v.single_page === 'true',
    }),
  },

  // -------------------------------------------------------------- Images ---
  {
    id: 'compress-image',
    slug: 'compressimage',
    category: 'image',
    name: 'Compress Image',
    description: 'Shrink JPG, PNG and TIFF files with minimal quality loss.',
    accept: ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.gif'],
    multiple: true,
    credits: '2 / file',
    options: [],
  },
  {
    id: 'convert-image',
    slug: 'convertimage',
    category: 'image',
    name: 'Convert Image',
    description: 'Convert PNG, GIF, TIF, PSD, SVG and WEBP to JPG or PNG.',
    accept: ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif', '.bmp', '.webp', '.psd', '.svg'],
    multiple: true,
    credits: '2 / file',
    options: [
      {
        key: 'to', label: 'Target format', type: 'select',
        choices: [
          { value: 'jpg', label: 'JPG' },
          { value: 'png', label: 'PNG' },
          { value: 'gif', label: 'GIF' },
        ],
        default: 'jpg',
      },
    ],
    buildParams: (v) => ({ convert_to: v.to || 'jpg' }),
  },
  {
    id: 'crop-image',
    slug: 'cropimage',
    category: 'image',
    name: 'Crop Image',
    description: 'Cut a pixel-precise area out of your image.',
    accept: ['.jpg', '.jpeg', '.png', '.gif'],
    multiple: false,
    credits: '2 / file',
    options: [
      { key: 'x', label: 'Start X (px)', type: 'number', min: 0, default: 0, required: true },
      { key: 'y', label: 'Start Y (px)', type: 'number', min: 0, default: 0, required: true },
      { key: 'width', label: 'Width (px)', type: 'number', min: 1, required: true, placeholder: 'e.g. 500' },
      { key: 'height', label: 'Height (px)', type: 'number', min: 1, required: true, placeholder: 'e.g. 500' },
    ],
    buildParams: (v) => ({
      x: Number(v.x), y: Number(v.y),
      width: Number(v.width), height: Number(v.height),
    }),
  },
  {
    id: 'resize-image',
    slug: 'resizeimage',
    category: 'image',
    name: 'Resize Image',
    description: 'Scale an image by pixels or percentage.',
    accept: ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif', '.bmp', '.webp'],
    multiple: true,
    credits: '2 / file',
    options: [
      {
        key: 'resize_mode', label: 'Mode', type: 'select',
        choices: [
          { value: 'percentage', label: 'Percentage' },
          { value: 'pixels', label: 'Exact pixels' },
        ],
        default: 'percentage',
      },
      {
        key: 'percentage', label: 'Scale (%)', type: 'number', min: 1, max: 2000, default: 50,
        showIf: { resize_mode: 'percentage' },
      },
      {
        key: 'pixels_width', label: 'Width (px)', type: 'number', min: 1,
        showIf: { resize_mode: 'pixels' },
      },
      {
        key: 'pixels_height', label: 'Height (px)', type: 'number', min: 1,
        showIf: { resize_mode: 'pixels' },
      },
    ],
    buildParams: (v) => {
      if (v.resize_mode === 'pixels') {
        const params = { resize_mode: 'pixels' };
        if (v.pixels_width) params.pixels_width = Number(v.pixels_width);
        if (v.pixels_height) params.pixels_height = Number(v.pixels_height);
        return params;
      }
      return { resize_mode: 'percentage', percentage: String(Number(v.percentage || 50)) };
    },
  },
  {
    id: 'rotate-image',
    slug: 'rotateimage',
    category: 'image',
    name: 'Rotate Image',
    description: 'Rotate images 90°, 180° or 270°.',
    accept: ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif', '.bmp', '.webp'],
    multiple: true,
    credits: '2 / file',
    options: [
      {
        key: 'angle', label: 'Rotation', type: 'select',
        choices: [
          { value: '90', label: '90° clockwise' },
          { value: '180', label: '180°' },
          { value: '270', label: '90° counter-clockwise' },
        ],
        default: '90',
      },
    ],
    perFile: { rotate: 'angle' },
    buildParams: () => ({}),
  },
  {
    id: 'watermark-image',
    slug: 'watermarkimage',
    category: 'image',
    name: 'Watermark Image',
    description: 'Add a text watermark to your photos and images.',
    accept: ['.jpg', '.jpeg', '.png', '.gif'],
    multiple: true,
    credits: '2 / file',
    options: [
      { key: 'text', label: 'Watermark text', type: 'text', required: true, placeholder: 'e.g. © Your Brand' },
      { key: 'rotation', label: 'Rotation (°)', type: 'number', min: -180, max: 180, default: 0 },
      { key: 'transparency', label: 'Transparency (0–100)', type: 'range', min: 0, max: 100, default: 50 },
      {
        key: 'layer', label: 'Layer', type: 'select',
        choices: [
          { value: 'above', label: 'Above content' },
          { value: 'below', label: 'Below content' },
        ],
        default: 'above',
      },
    ],
    buildParams: (v) => ({
      text: v.text,
      rotation: Number(v.rotation ?? 0),
      transparency: Number(v.transparency ?? 50),
      layer: v.layer || 'above',
    }),
  },
  {
    id: 'repair-image',
    slug: 'repairimage',
    category: 'image',
    name: 'Repair Image',
    description: 'Attempt to fix corrupted or damaged image files.',
    accept: ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.tif', '.bmp'],
    multiple: true,
    credits: '10 / file',
    options: [],
  },
  {
    id: 'html-to-image',
    slug: 'htmlimage',
    category: 'image',
    name: 'Web page to Image',
    description: 'Capture a web page URL as an image.',
    accept: [],
    multiple: false,
    inputMode: 'url',
    urlLabel: 'Web page URL',
    credits: '2 / file',
    options: [],
    buildParams: () => ({}),
  },
];

export function getTool(id) {
  return TOOLS.find((tool) => tool.id === id) ?? null;
}

export const CATEGORIES = {
  pdf: { name: 'PDF Tools', icon: 'pdf', tint: '#ef4444' },
  image: { name: 'Image Tools', icon: 'image', tint: '#f59e0b' },
  convert: { name: 'Converters', icon: 'convert', tint: '#3b82f6' },
  data: { name: 'Data Tools', icon: 'data', tint: '#8b5cf6' },
};