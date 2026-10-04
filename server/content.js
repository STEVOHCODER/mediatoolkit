/**
 * SEO + guide copy for every tool and category.
 *
 * Single source of truth: the server uses this to inject unique meta tags,
 * canonical URLs, structured data and the visible guide into the HTML, and
 * serves it to the browser at GET /api/content/:id so the client renders the
 * exact same text. Keep the ids aligned with server/registry.js and the
 * LOCAL_TOOLS list in public/js/registry.js.
 */

export const SITE_URL = 'https://mediatoolkit.tech';
export const SITE_NAME = 'MediaToolkit';

const t = (name, category, metaTitle, metaDescription, intro, steps, faqs, related) => ({
  name, category, metaTitle, metaDescription, intro, steps, faqs, related,
});

const faq = (q, a) => ({ q, a });

export const CATEGORIES_SEO = {
  pdf: {
    name: 'PDF Tools',
    metaTitle: 'Free PDF Tools Online – Merge, Split, Compress & Convert PDF | MediaToolkit',
    metaDescription:
      '15 free PDF tools: merge, split, compress, OCR, rotate, protect, watermark and convert PDF files. No sign-up, no watermarks, files deleted after processing.',
    intro:
      'Everything you need to work with PDF files in one place. Combine or extract pages, shrink oversized documents, make scans searchable, add page numbers or watermarks, protect files with a password and convert PDFs to images or plain text. Each tool runs on our servers and your files are deleted automatically as soon as the result is ready.',
  },
  image: {
    name: 'Image Tools',
    metaTitle: 'Free Image Tools Online – Compress, Convert, Crop & Resize | MediaToolkit',
    metaDescription:
      '8 free image tools: compress, convert, crop, resize, rotate, watermark and repair images, plus capture any web page as a screenshot. No sign-up required.',
    intro:
      'Shrink heavy photos, convert between PNG, JPG, GIF, WEBP and SVG, cut pixel-precise crops, scale images to exact dimensions, straighten them, brand them with a text watermark, repair damaged files or capture a full web page as an image. Everything is free, runs in seconds and needs no account.',
  },
  convert: {
    name: 'Converters',
    metaTitle: 'Free File Converters Online – Word, Excel, HTML & PDF | MediaToolkit',
    metaDescription:
      'Convert Word, Excel and PowerPoint to PDF, save web pages as PDF or PNG, and turn DOCX into clean text or HTML. Free online converters, no sign-up.',
    intro:
      'Move files between formats without installing anything: turn Office documents into polished PDFs, save a public web page as a PDF or a full-page screenshot, and extract plain text or semantic HTML from Word files. Layouts stay intact, and the tools that handle documents privately run straight in your browser.',
  },
  data: {
    name: 'Data Tools',
    metaTitle: 'Free JSON, CSV & Excel Tools Online – Private, In-Browser | MediaToolkit',
    metaDescription:
      'Format, validate and convert JSON, CSV and Excel files. 7 free data tools that run entirely in your browser — your data never leaves your device.',
    intro:
      'Format and validate messy JSON, convert between JSON, CSV and Excel in any direction, and read spreadsheet rows as clean records. These tools run entirely in your browser, so your data is never uploaded anywhere — ideal for private or sensitive work. Everything is free, instant and unlimited.',
  },
};

export const TOOLS_SEO = {
  // ------------------------------------------------------------------ PDF --
  'merge-pdf': t(
    'Merge PDF', 'pdf',
    'Merge PDF Files Online – Free PDF Combiner | MediaToolkit',
    'Combine two or more PDF files into a single document. Free online PDF merger — no sign-up, no watermarks, files deleted after processing.',
    'Merge PDF combines several PDF documents into one file in seconds. It is the fastest way to join scans, invoices, statements, contracts or book chapters into a single document you can send, print or archive. Pages keep their original quality, order and links, and your files are removed from our servers automatically right after processing.',
    [
      'Click Choose files and select the two or more PDFs you want to join — at least two are required.',
      'Check the order: the first file becomes the opening pages of the merged document.',
      'Press Merge PDF and wait a moment while the server rebuilds the document.',
      'Download your merged file. The download link is single-use, so save the file straight away.',
    ],
    [
      faq('How many PDFs can I merge at once?', 'You can add up to 20 files in a single task as long as each stays below the upload limit. For bigger jobs, merge in batches — the result is identical.'),
      faq('Will merging change the quality of my PDF?', 'No. Pages are reassembled exactly as they were, so text, images, fonts, links and vector graphics are preserved without any re-compression.'),
      faq('Are my files stored or shared?', 'No. Files are uploaded only to be processed, deleted automatically shortly afterwards, and never used for anything else.'),
    ],
    ['split-pdf', 'compress-pdf', 'page-numbers'],
  ),

  'split-pdf': t(
    'Split PDF', 'pdf',
    'Split PDF Online – Extract Pages from a PDF | MediaToolkit',
    'Split a PDF into separate files or extract specific page ranges. Free online PDF splitter — no sign-up, no watermarks, instant download.',
    'Split PDF pulls pages out of a document or breaks a large PDF into several smaller files. Extract the pages you need, cut a document into fixed-size chunks, or drop the pages you do not want — all without installing software. Every output keeps the original quality, and your files are deleted automatically once you have downloaded the result.',
    [
      'Choose the PDF you want to split — only one file is needed.',
      'Pick a mode: extract page ranges, split every N pages, or remove selected pages.',
      'Enter the ranges you want, for example 1-3, 6-8, or set how many pages go in each new file.',
      'Press Split PDF and download the resulting files one by one.',
    ],
    [
      faq('Can I split one PDF into many files?', 'Yes. Choose Split every N pages and set how many pages each new file should contain — for example one page per file for a slide deck.'),
      faq('How do I extract only certain pages?', 'Use Extract page ranges and type the pages you need, such as 1-3, 6-8. The tool returns a single PDF containing just those pages.'),
      faq('Do I need to know the page count first?', 'No, but it helps. Open the file in any PDF viewer to see the total pages before entering ranges — ranges beyond the end are ignored.'),
    ],
    ['merge-pdf', 'pdf-to-jpg', 'page-numbers'],
  ),

  'compress-pdf': t(
    'Compress PDF', 'pdf',
    'Compress PDF Online – Reduce PDF File Size | MediaToolkit',
    'Reduce PDF file size free while keeping quality readable. Choose low, recommended or extreme compression — no sign-up, instant download.',
    'Compress PDF shrinks oversized documents so they are easy to email, upload or archive. You choose how aggressive the compression should be: Low keeps the file near-original, Recommended balances size and clarity, and Extreme squeezes it as far as it will go while staying readable. Text stays sharp, and your file is deleted from our servers as soon as the download finishes.',
    [
      'Select the PDF you want to shrink — several files can be queued one after another.',
      'Choose a compression level: Low for no visible loss, Recommended for the best balance, Extreme for the smallest file.',
      'Press Compress PDF and let the server optimise images, fonts and structure.',
      'Download the smaller file and check it looks right before sending it on.',
    ],
    [
      faq('How much smaller will my PDF get?', 'It depends on the file. Image-heavy documents often shrink dramatically, while text-only PDFs are already compact — the Recommended level usually gives the best result.'),
      faq('Does compression reduce readability?', 'No. Text stays fully vector and sharp; only embedded images are resampled. If quality matters more than size, pick the Low level.'),
      faq('Why is my PDF still large after compressing?', 'Very large scans or photographic PDFs have a natural floor. Try Extreme, or downsample the source images before building the PDF.'),
    ],
    ['merge-pdf', 'pdf-to-jpg', 'office-to-pdf'],
  ),

  'ocr-pdf': t(
    'OCR PDF', 'pdf',
    'OCR PDF Online – Make Scanned PDFs Searchable | MediaToolkit',
    'Turn scanned or photographed PDFs into searchable, selectable text. Free online OCR for PDF files — no sign-up, up to 300 DPI recognition.',
    'OCR PDF recognises the text inside scanned or photographed documents and turns it into real, selectable characters. Once processed you can search the document, copy passages out of it, and index it properly instead of carrying around a picture of a page. It works on any text-bearing scan, and the original layout is left untouched.',
    [
      'Upload the scanned PDF you want to read as text — it must contain a single file.',
      'Press OCR PDF; the server runs recognition across every page.',
      'Wait for processing to finish — large scans take a little longer than normal files.',
      'Download the searchable PDF and try selecting a word to confirm the text layer is there.',
    ],
    [
      faq('What does OCR stand for?', 'Optical Character Recognition. It detects printed text in an image-based PDF and rebuilds it as a real text layer.'),
      faq('Which languages are supported?', 'OCR handles most Latin-script languages well and recognises many others. Accuracy is best on clean, well-lit scans at 300 DPI or higher.'),
      faq('Why can I not select text after OCR?', 'If a page has no readable characters — a photo of handwriting or a very low-resolution scan — recognition may return little or nothing. Rescan at higher resolution and try again.'),
    ],
    ['pdf-to-text', 'compress-pdf', 'repair-pdf'],
  ),

  'pdf-to-jpg': t(
    'PDF to JPG', 'pdf',
    'Convert PDF to JPG Online – Free PDF to Image | MediaToolkit',
    'Turn every page of a PDF into a high-quality JPG image. Free online PDF to JPG converter — no sign-up, no watermarks, instant download.',
    'PDF to JPG exports each page of a document as its own JPG image, which is what you need for presentations, websites, social posts or anywhere that will not accept a PDF. Pages come out at a clear, shareable resolution and are delivered as separate images so you can pick exactly the ones you want.',
    [
      'Choose the PDF you want to convert — one file per task.',
      'Press PDF to JPG and let the server render every page as an image.',
      'Wait for the pages to be generated; longer documents take a little more time.',
      'Download the JPGs. Each page arrives as its own image file.',
    ],
    [
      faq('Can I choose which pages convert?', 'You get every page of the document. To export a subset first, use Split PDF to extract the pages you need, then convert that smaller file.'),
      faq('What resolution are the images?', 'Pages are rendered at a high, screen-friendly resolution that stays sharp in documents and on the web without producing huge files.'),
      faq('Is the layout preserved exactly?', 'Yes. The page is rendered, not rebuilt, so fonts, tables, images and spacing look the same as in the original PDF.'),
    ],
    ['jpg-to-pdf', 'pdf-to-text', 'compress-pdf'],
  ),

  'jpg-to-pdf': t(
    'JPG to PDF', 'pdf',
    'Convert JPG to PDF Online – Free Image to PDF | MediaToolkit',
    'Combine JPG, PNG and TIFF photos into a single PDF document. Free online image to PDF converter — no sign-up, instant download.',
    'JPG to PDF turns photos, scans and screenshots into a single, properly ordered PDF. Add several images at once and they become consecutive pages — perfect for sending scans, assembling receipts, building a simple portfolio or packaging screenshots into one attachment. Image quality is kept as it is, and the result downloads instantly.',
    [
      'Choose the images you want to include — JPG, PNG and TIFF are all accepted.',
      'Check the order; images are added as pages in the sequence shown.',
      'Press JPG to PDF and let the server assemble the document.',
      'Download your new PDF and open it to confirm the page order.',
    ],
    [
      faq('Can I add more than one image?', 'Yes. Select several files at once and each becomes a page, in the order you selected them. Very large sets can be built in two passes with Merge PDF.'),
      faq('Are my photos compressed?', 'No. Images are embedded at their original quality, so photographs stay crisp in the finished PDF.'),
      faq('Does it work with scanned documents?', 'Yes — that is one of the most common uses. Combine multi-page scans into one PDF, then run OCR PDF if you want the text to be searchable.'),
    ],
    ['pdf-to-jpg', 'merge-pdf', 'compress-pdf'],
  ),

  'rotate-pdf': t(
    'Rotate PDF', 'pdf',
    'Rotate PDF Online – Rotate PDF Pages 90°, 180° or 270° | MediaToolkit',
    'Rotate all or some pages of a PDF and save the result. Free online PDF rotator — no sign-up, no watermarks, instant download.',
    'Rotate PDF fixes pages that scan or export the wrong way round. Turn every page by 90, 180 or 270 degrees in one go, save the corrected file and never again send a sideways document. Nothing is re-compressed, so quality is untouched, and the corrected file is ready to download immediately.',
    [
      'Select the PDF that needs straightening — one file per task.',
      'Choose the rotation angle: 90°, 180° or 270°.',
      'Press Rotate PDF and let the server rebuild the page tree.',
      'Download the rotated file and open it to confirm the pages sit correctly.',
    ],
    [
      faq('Can I rotate only some pages?', 'The tool applies the same rotation to every page of the file. To fix a subset, extract those pages with Split PDF, rotate them, then merge them back.'),
      faq('Will rotating change the file size?', 'No meaningful change — the page content is untouched, only the page orientation is updated.'),
      faq('Is the rotation permanent?', 'Yes, the saved file has the new orientation baked in, so any viewer or printer shows it correctly.'),
    ],
    ['page-numbers', 'split-pdf', 'merge-pdf'],
  ),

  'protect-pdf': t(
    'Protect PDF', 'pdf',
    'Protect PDF with Password Online – Free PDF Encryption | MediaToolkit',
    'Encrypt your PDF with a password so only authorized people can open it. Free online PDF protection — no sign-up, secure processing.',
    'Protect PDF encrypts a document so it can only be opened with the password you set. Use it for contracts, financial records, medical paperwork or anything you are about to email. The file behaves exactly like the original — same layout, same pages — but nobody without the password can read a single word of it.',
    [
      'Select the PDF you want to secure.',
      'Enter a strong password — you will need to share it with your recipients separately.',
      'Press Protect PDF and wait for the encryption to finish.',
      'Download the protected file and test it by opening it in a different viewer.',
    ],
    [
      faq('Can I recover the password if I forget it?', 'No. The password is never stored by us, so there is no reset. Keep a copy somewhere safe before you send the file.'),
      faq('What if the original PDF already has a password?', 'Unlock it first with Unlock PDF, then protect it again with your new password.'),
      faq('Does protecting the PDF change its appearance?', 'No. Encryption hides the content; the pages, fonts and layout stay exactly as they were.'),
    ],
    ['unlock-pdf', 'watermark-pdf', 'compress-pdf'],
  ),

  'unlock-pdf': t(
    'Unlock PDF', 'pdf',
    'Unlock PDF Online – Remove PDF Password Restrictions | MediaToolkit',
    'Remove printing and editing restrictions from a PDF you own. Free online PDF unlocker — no sign-up, instant download.',
    'Unlock PDF removes the permissions that stop you printing, copying or editing a document you legitimately own. If a supplier or public body sent you a restricted file, this produces a normal, unrestricted copy. The content itself never changes — only the permission flags that were blocking ordinary use are taken off.',
    [
      'Choose the restricted PDF you want to open up.',
      'Press Unlock PDF — permission restrictions are removed automatically.',
      'Download the unlocked copy once processing completes.',
      'Open it and confirm printing or copying now works as expected.',
    ],
    [
      faq('Does this break a password that stops the file opening?', 'No. Files that require a password just to open cannot be unlocked without it — this tool removes usage restrictions such as printing and editing.'),
      faq('Is removing restrictions legal?', 'Only do this with documents you own or are authorised to use. Removing controls from material you have no rights to is not permitted.'),
      faq('Will the file still look the same?', 'Yes. Only the metadata flags change; every page renders exactly as before.'),
    ],
    ['protect-pdf', 'split-pdf', 'merge-pdf'],
  ),

  'watermark-pdf': t(
    'Watermark PDF', 'pdf',
    'Watermark PDF Online – Add Text Watermark to PDF | MediaToolkit',
    'Stamp a text watermark over every page of your PDF to brand or protect it. Free online PDF watermark tool — no sign-up.',
    'Watermark PDF lays your text across every page of a document — a company name, DRAFT, CONFIDENTIAL or a reference number. It is the quickest way to brand a document before it leaves your hands and to make sure nobody claims it as their own. Pages stay sharp and the watermark is part of the file, not an overlay image.',
    [
      'Choose the PDF you want to mark.',
      'Enter the watermark text, for example your company name or DRAFT.',
      'Press Watermark PDF and let the server stamp every page.',
      'Download the file and scroll through to check the placement looks right.',
    ],
    [
      faq('Can I control where the watermark sits?', 'The tool stamps each page consistently with the text you provide, so it reads clearly on every page without hiding the content.'),
      faq('Can I use an image instead of text?', 'This tool is text-based. Brand documents with your name or reference; for images, stamp the source images before building the PDF.'),
      faq('Can the watermark be removed later?', 'Anyone can remove a visible watermark from a file they can edit — treat it as branding and a courtesy signal, not as security. Use Protect PDF for real protection.'),
    ],
    ['watermark-image', 'page-numbers', 'protect-pdf'],
  ),

  'page-numbers': t(
    'Add Page Numbers', 'pdf',
    'Add Page Numbers to PDF Online – Free Page Numbering | MediaToolkit',
    'Add page numbers to a PDF with full control over position, font and start number. Free online tool — no sign-up, instant download.',
    'Add Page Numbers stamps a clean, sequential number onto every page of your document. Reports, dissertations, contracts and tender submissions almost always need it, and doing it by hand wastes an afternoon. Set the position, the starting number and the format, and the finished file is ready to print or submit.',
    [
      'Select the PDF you want to number.',
      'Choose where the numbers appear and the number the first page should carry.',
      'Press Add Page Numbers and let the server stamp the pages.',
      'Download the file and check the sequence reads correctly from start to end.',
    ],
    [
      faq('Can I start numbering from a specific page?', 'Yes — set the start value so the front matter stays unnumbered while the body begins at 1, or carry on from a previous document.'),
      faq('Can I change the format?', 'You can use plain numbers or add surrounding text such as Page 3 of 12, so the numbering matches your style guide.'),
      faq('Does it work if pages are already numbered?', 'It adds new numbers on top. If a document already has them, remove those pages first or rebuild the file from the unnumbered version.'),
    ],
    ['rotate-pdf', 'watermark-pdf', 'merge-pdf'],
  ),

  'repair-pdf': t(
    'Repair PDF', 'pdf',
    'Repair PDF Online – Fix Corrupted PDF Files | MediaToolkit',
    'Rebuild a damaged, unreadable or broken PDF so it opens again. Free online PDF repair tool — no sign-up, secure processing.',
    'Repair PDF rebuilds a document that will not open, crashes your viewer or shows missing pages. It reads as much of the structure as it can, reconstructs the damaged parts and writes out a clean, valid file. Text and images that survived the damage come back intact, and the result opens normally in any reader.',
    [
      'Upload the damaged PDF — even if your viewer only shows part of it.',
      'Press Repair PDF and wait while the structure is rebuilt.',
      'Download the repaired file.',
      'Open it in a fresh viewer and check the pages you care about most.',
    ],
    [
      faq('Will everything in my file be recovered?', 'Most content is, but a badly corrupted file can have unrecoverable sections. Whatever could be read is preserved and the document becomes usable again.'),
      faq('What usually causes a broken PDF?', 'Interrupted downloads or saves, disk errors, truncated uploads and files copied while a program was still writing to them.'),
      faq('What if repair does not help?', 'Try opening the original in a different viewer first — the file may be intact but your reader is failing. Otherwise validate the source and regenerate it from the original application.'),
    ],
    ['validate-pdfa', 'compress-pdf', 'pdf-to-text'],
  ),

  'pdf-to-pdfa': t(
    'PDF to PDF/A', 'pdf',
    'Convert PDF to PDF/A Online – Archival PDF Conversion | MediaToolkit',
    'Convert a regular PDF into the PDF/A archival standard for long-term storage. Free online converter — no sign-up, instant download.',
    'PDF to PDF/A converts an ordinary document into the archival format used for long-term storage by libraries, courts and regulated industries. PDF/A removes everything that can break over time — external fonts, embedded scripts, links to online assets — so the file still renders the same way decades from now.',
    [
      'Select the PDF you want to convert to the archival standard.',
      'Press PDF to PDF/A and wait while fonts are embedded and non-conforming elements removed.',
      'Download the converted file.',
      'Run it through Validate PDF/A to confirm it genuinely passes archival checks.',
    ],
    [
      faq('What is the difference between PDF and PDF/A?', 'PDF/A is a restricted profile of PDF designed for archiving: all fonts are embedded, encryption and interactive content are forbidden, and the rendering is self-contained.'),
      faq('Why does my file look slightly different?', 'Colours may be converted to a standard profile and external links removed — these are required changes for archival compliance.'),
      faq('How do I know the conversion worked?', 'Run the result through Validate PDF/A, which reports exactly which parts of the standard the file meets.'),
    ],
    ['validate-pdfa', 'compress-pdf', 'repair-pdf'],
  ),

  'validate-pdfa': t(
    'Validate PDF/A', 'pdf',
    'Validate PDF/A Online – Check Archival Compliance | MediaToolkit',
    'Check whether a PDF really complies with the PDF/A standard and see exactly what fails. Free online validator — no sign-up.',
    'Validate PDF/A checks a document against the archival standard and tells you plainly whether it passes. Instead of a vague yes or no, it reports the specific compliance problems — an embedded font that is missing, a forbidden annotation, a colour space that is not profile-based — so you know exactly what to fix before submitting to a records system.',
    [
      'Upload the PDF you want checked.',
      'Press Validate PDF/A and wait for the full compliance scan.',
      'Read the result: it reports whether the document conforms and which rules failed.',
      'Fix any reported issues — often by converting the file with PDF to PDF/A — and validate again.',
    ],
    [
      faq('What does a failure mean for my document?', 'It means the file would be rejected by archival or court systems that enforce PDF/A. The report tells you which rule was broken so you can correct it.'),
      faq('Which versions of PDF/A are supported?', 'The validator checks against the widely used PDF/A profiles. Check the reported profile to confirm it matches what your records team requires.'),
      faq('Can I fix a failed file here?', 'Not directly — use PDF to PDF/A to rebuild it under the standard, then validate the result. If it still fails, rebuild the source document.'),
    ],
    ['pdf-to-pdfa', 'repair-pdf', 'pdf-to-text'],
  ),

  'pdf-to-text': t(
    'PDF to TXT', 'pdf',
    'Convert PDF to Text Online – Free PDF to TXT Extractor | MediaToolkit',
    'Extract all text from a PDF into a clean plain .txt file. Free online PDF to text converter — no sign-up, instant download.',
    'PDF to TXT pulls the text out of a document and hands it back as a plain .txt file you can search, edit, translate or paste into anything. It is ideal for quoting a report, feeding a document into another program, or reading a PDF on a device where reflowable text is easier than a fixed page layout.',
    [
      'Choose the PDF whose text you want to extract.',
      'Press PDF to TXT and let the server read through the document.',
      'Download the .txt file once processing finishes.',
      'Open it in any editor — the text is plain, unformatted and ready to reuse.',
    ],
    [
      faq('Will the formatting be kept?', 'No. You get the raw text, not the layout. Use it when you want the words rather than the appearance — tables come out as sequential lines.'),
      faq('Why did I get very little text back?', 'The PDF is probably a scan with no text layer. Run OCR PDF first to recognise the characters, then extract the text again.'),
      faq('Can I convert only part of a document?', 'Extract the pages you need with Split PDF, then convert that smaller file to text.'),
    ],
    ['ocr-pdf', 'docx-to-text', 'pdf-to-jpg'],
  ),

  // ------------------------------------------------------------- converters --
  'office-to-pdf': t(
    'Word, Excel & PPT to PDF', 'convert',
    'Convert Word, Excel & PowerPoint to PDF Online | MediaToolkit',
    'Convert DOCX, XLSX, PPTX and older Office files to PDF while keeping the layout intact. Free online converter — no sign-up.',
    'This converter turns Word documents, Excel workbooks and PowerPoint presentations into PDFs that look exactly like the original — same fonts, same tables, same slide sizes. It is the safest way to send a document when you cannot be sure what the recipient has installed, and it locks the layout so nothing shifts on their screen.',
    [
      'Choose the Office file you want to convert — DOCX, XLSX, PPTX and older formats are accepted.',
      'Press Convert and wait while the server renders the document.',
      'Download the resulting PDF.',
      'Open it and compare a couple of pages against the original to confirm the layout.',
    ],
    [
      faq('Which formats are supported?', 'Word (DOC, DOCX), Excel (XLS, XLSX) and PowerPoint (PPT, PPTX), including the older binary formats used before 2007.'),
      faq('Will complex spreadsheets convert correctly?', 'Cell content, formatting and formulas-as-displayed are preserved. Very wide sheets may paginate differently — set the print area in Excel first if that matters.'),
      faq('Are fonts embedded in the result?', 'Yes. Fonts used in the document are embedded so the PDF renders the same way on any machine.'),
    ],
    ['html-to-pdf', 'compress-pdf', 'docx-to-text'],
  ),

  'html-to-pdf': t(
    'Web page to PDF', 'convert',
    'Convert Web Page to PDF Online – HTML to PDF | MediaToolkit',
    'Save any public web page URL as a PDF document, ready to print or archive. Free online HTML to PDF converter — no sign-up.',
    'Web page to PDF renders a live URL into a proper PDF — links, images, styles and layout included. Save an article for offline reading, archive a confirmation page or a terms-of-service revision, or produce a printable copy of something that only exists on screen. The page is rendered exactly as a browser would show it.',
    [
      'Paste the full public URL of the page you want to save.',
      'Press Convert and let the server load and render the page.',
      'Wait for the render to finish — dynamic pages can take a few extra seconds.',
      'Download the PDF and check the content is complete.',
    ],
    [
      faq('Can I convert a private or logged-in page?', 'No. The server can only reach public URLs, so anything behind a login will not be reachable. Save the page to PDF from your own browser instead.'),
      faq('Will images and styling be preserved?', 'Yes. The page is rendered with its CSS, images and fonts, so the PDF looks like the screen version rather than plain text.'),
      faq('How long does a page take?', 'Usually a few seconds. Pages with heavy scripts or slow servers take longer; if it fails, the site may be blocking automated access.'),
    ],
    ['html-to-image', 'office-to-pdf', 'compress-pdf'],
  ),

  // ----------------------------------------------------------------- image --
  'compress-image': t(
    'Compress Image', 'image',
    'Compress Image Online – Reduce JPG & PNG File Size | MediaToolkit',
    'Shrink JPG, PNG and TIFF file sizes while keeping the image sharp. Free online image compressor — no sign-up, instant download.',
    'Compress Image reduces the weight of photos and graphics so pages load faster and attachments stay under size limits. Metadata is dropped, pixels are optimised and quality is tuned so the picture still looks right — usually you will not see the difference, but the file can come out a fraction of its original size.',
    [
      'Choose the images you want to shrink — JPG, PNG and TIFF are supported.',
      'Press Compress Image and let the server optimise each file.',
      'Download the lighter versions as they finish.',
      'Compare one against the original to confirm the quality is acceptable.',
    ],
    [
      faq('How much smaller will the files get?', 'Photos often drop by 50–80%. Graphics with flat colours and transparency benefit most; already-optimised files have less room to improve.'),
      faq('Does compression lose quality?', 'Some, by design. The tool balances size against visual quality so the result stays sharp for screen use — if you need the original, keep a copy.'),
      faq('Does it strip the metadata?', 'Yes — camera and location metadata is removed, which also keeps private details out of images you publish.'),
    ],
    ['convert-image', 'resize-image', 'pdf-to-jpg'],
  ),

  'convert-image': t(
    'Convert Image', 'image',
    'Convert Image Online – PNG, GIF, WEBP & SVG to JPG or PNG | MediaToolkit',
    'Convert PNG, GIF, TIF, PSD, SVG and WEBP images to JPG or PNG in one click. Free online image converter — no sign-up.',
    'Convert Image moves pictures between the formats people actually ask for: PNG, GIF, TIF, PSD, SVG and WEBP into JPG or PNG, ready for a website, an email or a document that will not accept the file you were given. Transparency is preserved when you choose PNG, and JPG is used when a smaller photo file matters more.',
    [
      'Choose the images you want to convert.',
      'Pick the output format: JPG for photos and small files, PNG for transparency and sharp edges.',
      'Press Convert and let the server re-encode each image.',
      'Download the results — the file name reflects the new format.',
    ],
    [
      faq('JPG or PNG — which should I pick?', 'Choose JPG for photographs and anything where file size matters; choose PNG for logos, screenshots and anything with transparency or fine text.'),
      faq('Can I convert several images at once?', 'Yes. Add multiple files and each is converted to the same output format in one pass.'),
      faq('Does converting reduce quality?', 'Moving to JPG introduces normal JPEG compression; PNG is lossless. Re-saving a photo repeatedly at each conversion should be avoided — convert once, from the original.'),
    ],
    ['compress-image', 'resize-image', 'jpg-to-pdf'],
  ),

  'crop-image': t(
    'Crop Image', 'image',
    'Crop Image Online – Free Online Image Cropper | MediaToolkit',
    'Cut a pixel-precise area out of any photo or image. Free online cropper for JPG and PNG — no sign-up, instant download.',
    'Crop Image trims a picture down to exactly the region you want — remove an unwanted edge, isolate a subject, or produce a clean thumbnail from a larger shot. Set the area precisely, apply it and download a file that is only as big as the part you kept, with nothing left over from the original.',
    [
      'Select the image you want to trim.',
      'Define the crop area — drag the selection or enter exact pixel values.',
      'Press Crop and let the server cut the region you chose.',
      'Download the cropped image and check the framing.',
    ],
    [
      faq('Can I set exact pixel dimensions?', 'Yes. Enter the position and size directly when you need a specific output size, such as a fixed banner or avatar dimension.'),
      faq('Will cropping change the image quality?', 'No. The pixels you keep are untouched — only the area outside your selection is discarded.'),
      faq('What about the aspect ratio?', 'Keep proportions locked when you want a standard ratio such as 16:9 or 1:1, or unlock it to crop freely.'),
    ],
    ['resize-image', 'rotate-image', 'watermark-image'],
  ),

  'resize-image': t(
    'Resize Image', 'image',
    'Resize Image Online – Scale Images by Pixels or % | MediaToolkit',
    'Scale an image to exact pixels or a percentage while keeping the aspect ratio. Free online image resizer — no sign-up.',
    'Resize Image scales a picture to the exact dimensions you need — by pixel size or by percentage — while keeping the proportions correct so nothing ends up stretched. Use it to shrink a photo for the web, produce a fixed-size thumbnail, or reduce a huge export to something an email will accept.',
    [
      'Choose the image you want to scale.',
      'Enter target dimensions in pixels or a percentage, keeping the aspect ratio locked if you want undistorted output.',
      'Press Resize and let the server resample the image.',
      'Download the resized file and confirm the dimensions.',
    ],
    [
      faq('Will the aspect ratio be preserved?', 'With the ratio locked, yes — change one dimension and the other follows automatically. Unlock it only when you deliberately want a different shape.'),
      faq('Can I make an image bigger?', 'You can, but scaling up adds no real detail and may look soft. Start from the original high-resolution file whenever you can.'),
      faq('How is this different from cropping?', 'Scaling changes the size of the whole picture; cropping cuts part of it away. Use both when you need a specific size from a larger source.'),
    ],
    ['compress-image', 'crop-image', 'convert-image'],
  ),

  'rotate-image': t(
    'Rotate Image', 'image',
    'Rotate Image Online – Free Photo Rotation Tool | MediaToolkit',
    'Rotate images by 90°, 180° or 270° and download the result. Free online image rotator for JPG and PNG — no sign-up.',
    'Rotate Image turns photos that came out sideways or upside down the right way round — a common result of phone cameras and scanners. Rotate by 90, 180 or 270 degrees, download, and stop apologising for attached images that recipients have to crane their necks to read.',
    [
      'Select the image that is the wrong way round.',
      'Choose the rotation: 90°, 180° or 270°.',
      'Press Rotate and let the server re-render the picture.',
      'Download the corrected image and confirm the orientation.',
    ],
    [
      faq('Can I rotate by an arbitrary angle like 15°?', 'The tool handles the standard quarter and half turns. For small straightening adjustments, an editor with free-angle rotation is the better fit.'),
      faq('Does rotating reduce quality?', 'No. The pixel data is reorganised rather than re-compressed away, so the image stays as sharp as the original.'),
      faq('My image loses its orientation after upload — why?', 'Some devices store orientation in EXIF metadata instead of the pixels. Rotating here bakes the correct orientation into the file permanently.'),
    ],
    ['crop-image', 'resize-image', 'watermark-image'],
  ),

  'watermark-image': t(
    'Watermark Image', 'image',
    'Watermark Image Online – Add Text Watermark to Photos | MediaToolkit',
    'Add a text watermark to photos and images to brand or protect them. Free online image watermark tool — no sign-up.',
    'Watermark Image writes your text directly onto a photo so every copy that circulates carries your name, brand or copyright notice. It is the standard defence for photographers, agencies and businesses publishing images online, and it takes seconds rather than a session in an image editor.',
    [
      'Choose the image you want to mark.',
      'Enter the watermark text — a name, brand or © notice works best.',
      'Press Watermark and let the server stamp the image.',
      'Download it and check the text is legible against the picture.',
    ],
    [
      faq('Can I position the watermark?', 'The text is applied consistently across the image so it remains visible without covering the main subject. Keep it short for the cleanest result.'),
      faq('Is the watermark permanent?', 'Yes — it is written into the pixels of the file you download, so it travels with the image everywhere it is shared.'),
      faq('Should I watermark before or after resizing?', 'After. Resize and crop first, then watermark the final version so the text stays proportional to the image people actually see.'),
    ],
    ['watermark-pdf', 'crop-image', 'compress-image'],
  ),

  'repair-image': t(
    'Repair Image', 'image',
    'Repair Image Online – Fix Corrupted Image Files | MediaToolkit',
    'Attempt to repair corrupted or damaged image files so they open again. Free online image repair tool — no sign-up.',
    'Repair Image attempts to rebuild picture files that will not open, display only partially, or crash the viewer. It reads whatever survived the damage — headers, colour tables, scan lines — and writes out a clean file. Partial results are still useful: a recovered photo beats a file you cannot open at all.',
    [
      'Upload the image that is damaged or will not open.',
      'Press Repair Image and let the server attempt to rebuild it.',
      'Download the repaired file.',
      'Open it and check how much of the original picture was recovered.',
    ],
    [
      faq('What kinds of damage can be fixed?', 'Truncated files, broken headers, corrupted colour tables and interrupted downloads are the most common cases. Success depends on how much of the file survived.'),
      faq('Will the image be perfect again?', 'Not always. Rebuilt files can show artefacts or lose the damaged section — but the result is normally viewable where the original was not.'),
      faq('Can it work on a PDF?', 'No — for documents use Repair PDF, which handles the same kind of structural damage in PDF files.'),
    ],
    ['convert-image', 'compress-image', 'repair-pdf'],
  ),

  'html-to-image': t(
    'Web page to Image', 'image',
    'Capture Web Page as Image Online – HTML to PNG | MediaToolkit',
    'Turn any public web page URL into a PNG screenshot, ready to share. Free online HTML to image tool — no sign-up.',
    'Web page to Image loads a public URL and captures it as a PNG screenshot — the whole page, rendered with its real layout, styles and images. It is the quickest way to grab a hero shot for a deck, keep a visual record of a page, or share how a site looks without sending someone a link.',
    [
      'Paste the full public URL of the page you want to capture.',
      'Press Capture and let the server load and render the page.',
      'Wait for the screenshot — dynamic pages may need a few extra seconds.',
      'Download the PNG and check the full page was captured.',
    ],
    [
      faq('Can I capture a private or logged-in page?', 'No. Only publicly reachable URLs can be loaded. For a page behind a login, take the screenshot with your own browser.'),
      faq('Is the whole page captured or just the visible part?', 'The page is rendered as a full-length image, so long articles and landing pages are captured from top to bottom.'),
      faq('What if the capture comes out blank?', 'The site may block automated requests or need JavaScript to render. Try a different URL, or use Web page to PDF, which uses the same renderer.'),
    ],
    ['html-to-pdf', 'convert-image', 'compress-image'],
  ),

  // ------------------------------------------------------------------ data --
  'json-formatter': t(
    'JSON Formatter', 'data',
    'JSON Formatter Online – Format, Minify & Validate JSON | MediaToolkit',
    'Format, minify and validate JSON with clear error hints. Free online JSON formatter that runs entirely in your browser.',
    'JSON Formatter takes minified, tangled or broken JSON and makes it readable — or squeezes it back down for an API payload. It also validates the document as you go and points at the exact line where something is wrong, which turns a vague parse error into a fix you can actually make. Everything runs in your browser, so your data is never uploaded.',
    [
      'Paste your JSON into the input pane, or load a .json file from disk.',
      'Press Format to indent it, or Minify to compress it into one line.',
      'Use Validate to check the structure and get told precisely where it breaks.',
      'Copy or download the result — your data never leaves this device.',
    ],
    [
      faq('Is my data uploaded anywhere?', 'No. The tool runs entirely in your browser using local JavaScript. Nothing you paste is sent to a server.'),
      faq('Why does it say there is an error?', 'JSON is strict: it needs double quotes on keys, no trailing commas and no comments. The message tells you the line and column to look at.'),
      faq('What is the difference between Format and Minify?', 'Format adds whitespace and indentation so humans can read it; Minify removes all whitespace so the payload stays small for APIs.'),
    ],
    ['json-to-csv', 'csv-to-json', 'json-to-excel'],
  ),

  'json-to-csv': t(
    'JSON to CSV', 'data',
    'Convert JSON to CSV Online – Free JSON to CSV | MediaToolkit',
    'Convert a JSON array of objects into a clean CSV file. Free online JSON to CSV converter that runs in your browser.',
    'JSON to CSV flattens an array of JSON objects into rows and columns a spreadsheet can open. Pass API responses, exported records or configuration data through it and you get a properly headed CSV with consistent columns — the fastest route from structured data to something you can filter, sort and share. It runs entirely in your browser.',
    [
      'Paste a JSON array of objects, or load a .json file.',
      'Press Convert and the keys from the first objects become column headers.',
      'Check the rows look right — missing keys are left blank rather than shifting columns.',
      'Download the CSV or copy it straight to the clipboard.',
    ],
    [
      faq('Does it handle nested objects?', 'Flattening is best for flat records. Deeply nested structures are stringified into a single cell so no data is dropped.'),
      faq('What if my JSON is a single object?', 'Wrap it in square brackets to make it an array of one record, and it converts normally.'),
      faq('Where does my data go?', 'Nowhere. Conversion happens in your browser, so sensitive records never leave your machine.'),
    ],
    ['csv-to-json', 'json-to-excel', 'csv-to-excel'],
  ),

  'csv-to-json': t(
    'CSV to JSON', 'data',
    'Convert CSV to JSON Online – Free CSV to JSON | MediaToolkit',
    'Turn any CSV file into clean JSON records with correct types. Free online CSV to JSON converter that runs in your browser.',
    'CSV to JSON reads a comma-separated file and produces an array of objects, one per row, using the header row as the keys. It handles quoted fields, embedded commas and escaped quotes correctly, which is where most hand-rolled conversions fall apart. The result is ready to feed straight into an API or a script.',
    [
      'Paste CSV text or load a .csv file from your device.',
      'Press Convert — the header row becomes the keys for every record.',
      'Review the output; numeric-looking values are converted to numbers where appropriate.',
      'Copy the JSON or download it as a .json file.',
    ],
    [
      faq('Does it support semicolon- or tab-separated files?', 'Comma separation is standard for CSV. If your file uses another delimiter, convert it to commas first or export it again as CSV.'),
      faq('Are values kept as strings?', 'Numbers and booleans are detected and typed; everything else stays a string. Quoted text is never reinterpreted.'),
      faq('Is my file uploaded?', 'No. Parsing happens locally in your browser — the file is read by the page and never sent anywhere.'),
    ],
    ['json-to-csv', 'csv-to-excel', 'excel-to-json'],
  ),

  'csv-to-excel': t(
    'CSV to Excel', 'data',
    'Convert CSV to Excel Online – CSV to XLSX | MediaToolkit',
    'Open a CSV file as a real .xlsx workbook you can edit in Excel. Free online CSV to Excel converter that runs in your browser.',
    'CSV to Excel packages a plain text file into a genuine .xlsx workbook that opens instantly in Excel, LibreOffice or Google Sheets with the columns already split correctly. It saves you from the import wizard every time, and gives colleagues a real spreadsheet instead of a text file they have to convert themselves.',
    [
      'Load your .csv file or paste the CSV text.',
      'Press Convert to build a workbook with one sheet and the header row intact.',
      'Check the column split — delimiters and quoted fields are handled automatically.',
      'Download the .xlsx file and open it in your spreadsheet app.',
    ],
    [
      faq('Will Excel open this without warnings?', 'Yes. The output is a real .xlsx workbook, not a renamed CSV, so Excel opens it directly.'),
      faq('Does it handle large files?', 'Large files are fine, though very big sheets are limited by how much your browser can hold in memory. Split unusually large exports first.'),
      faq('Can I convert more than one sheet?', 'The converter builds a single sheet from one CSV. Combine several outputs afterwards with Merge if you need a multi-sheet workbook.'),
    ],
    ['excel-to-csv', 'csv-to-json', 'json-to-excel'],
  ),

  'excel-to-csv': t(
    'Excel to CSV', 'data',
    'Convert Excel to CSV Online – XLSX to CSV | MediaToolkit',
    'Extract the first sheet of an Excel workbook as a plain CSV file. Free online Excel to CSV converter that runs in your browser.',
    'Excel to CSV pulls the rows out of a workbook and hands them back as plain, portable CSV — the format every database, script and import tool understands. Use it when you need to feed spreadsheet data into a system that will not accept .xlsx, or when you want a lightweight copy without the formatting overhead.',
    [
      'Choose the workbook you want to export — .xlsx and .xls are both accepted.',
      'Press Convert to read the first sheet into CSV rows.',
      'Review the output; the header row becomes the first line.',
      'Download the .csv file or copy it to the clipboard.',
    ],
    [
      faq('Which sheet does it use?', 'The first sheet in the workbook. Move the sheet you want to the front position before converting.'),
      faq('Are formulas converted to values?', 'Cell values as displayed are exported, so formulas resolve to their results rather than their expressions.'),
      faq('Does it work with several columns and empty cells?', 'Yes — columns are aligned by position and empty cells stay empty, so rows keep their structure.'),
    ],
    ['excel-to-json', 'csv-to-excel', 'csv-to-json'],
  ),

  'excel-to-json': t(
    'Excel to JSON', 'data',
    'Convert Excel to JSON Online – XLSX to JSON | MediaToolkit',
    'Read spreadsheet rows from XLSX or XLS files as JSON objects. Free online Excel to JSON converter that runs in your browser.',
    'Excel to JSON turns spreadsheet rows into an array of objects, using the header row as keys — exactly the shape APIs and scripts expect. It is the quickest way to move a spreadsheet into a database import, a dashboard or a configuration file without retyping anything. The workbook is read locally in your browser.',
    [
      'Select the .xlsx or .xls file you want to convert.',
      'Press Convert — the header row becomes the property names for each record.',
      'Check that the values landed under the right keys.',
      'Copy the JSON or download it as a .json file.',
    ],
    [
      faq('Does it use the first sheet?', 'Yes, the first sheet becomes the dataset. Reorder the sheets first if you need a different one.'),
      faq('What happens to merged cells or blank rows?', 'Merged cells resolve to the value in the top-left cell; blank rows are skipped so the array stays clean.'),
      faq('Is my spreadsheet uploaded?', 'No. The file is read and converted inside your browser — it never reaches a server.'),
    ],
    ['excel-to-csv', 'json-to-csv', 'json-to-excel'],
  ),

  'json-to-excel': t(
    'JSON to Excel', 'data',
    'Convert JSON to Excel Online – JSON to XLSX | MediaToolkit',
    'Turn JSON records into a downloadable .xlsx spreadsheet. Free online JSON to Excel converter that runs in your browser.',
    'JSON to Excel writes an array of records straight into a spreadsheet, with the object keys forming the column headers. It is the fastest way to make API output, survey data or exported records readable for anyone who works in Excel rather than in code — no copy-paste, no manual column splitting.',
    [
      'Paste a JSON array of objects, or load a .json file.',
      'Press Convert to build a workbook with one sheet and a header row.',
      'Check that each key became a column and each record a row.',
      'Download the .xlsx file and open it in your spreadsheet app.',
    ],
    [
      faq('What if the objects have different keys?', 'The union of all keys becomes the columns; records missing a key leave that cell blank rather than shifting the row.'),
      faq('Can I convert a single object?', 'Yes — wrap it in square brackets so it becomes an array of one record.'),
      faq('Where is my data processed?', 'Entirely in your browser. Nothing is uploaded, so it is safe for confidential records.'),
    ],
    ['json-to-csv', 'csv-to-excel', 'excel-to-json'],
  ),

  // --------------------------------------------------------------- word -----
  'docx-to-text': t(
    'Word to Text', 'convert',
    'Convert Word to Text Online – DOCX to TXT | MediaToolkit',
    'Extract plain text from a Word .docx document in one click. Free online Word to text converter that runs in your browser.',
    'Word to Text strips a .docx down to its plain words — no styles, no headers, no tables, just the text. It is what you want when you need to quote a document, paste content into another system, run a word count, or hand text to a tool that will not accept a Word file. The document is read locally in your browser.',
    [
      'Choose the .docx file you want to extract text from.',
      'Press Convert and the document is parsed in your browser.',
      'Review the output — paragraphs are separated by line breaks.',
      'Copy the text or download it as a .txt file.',
    ],
    [
      faq('Is my document uploaded?', 'No. The file is read and parsed locally by the page, so confidential documents never leave your device.'),
      faq('What happens to images and tables?', 'They are not carried over — this tool returns text only. Use Word to HTML if you need the structure and styling preserved.'),
      faq('Does it work with older .doc files?', 'Modern .docx is supported. Save legacy .doc files as .docx from Word first, or convert them to PDF instead.'),
    ],
    ['docx-to-html', 'office-to-pdf', 'pdf-to-text'],
  ),

  'docx-to-html': t(
    'Word to HTML', 'convert',
    'Convert Word to HTML Online – DOCX to HTML | MediaToolkit',
    'Convert a Word .docx document into clean semantic HTML. Free online Word to HTML converter that runs in your browser.',
    'Word to HTML turns a document into structured markup — headings, paragraphs, lists and tables as real elements instead of inline Word styling. It is the practical way to move content from a draft in Word onto a website or CMS without dragging in the proprietary markup Word generates. Everything runs in your browser.',
    [
      'Select the .docx file you want to convert.',
      'Press Convert and the document structure is translated to semantic HTML.',
      'Review the markup — headings become h1–h6, lists become ul or ol, tables become table.',
      'Copy the HTML or download it as an .html file.',
    ],
    [
      faq('Is the output clean HTML?', 'Yes. You get semantic elements rather than Word’s span-heavy markup, which is easier to paste into a CMS or style sheet.'),
      faq('Are images included?', 'Text and structure come across; embedded images are not exported as separate assets by this tool.'),
      faq('Where is the file processed?', 'In your browser. The document is parsed locally and never uploaded.'),
    ],
    ['docx-to-text', 'html-to-pdf', 'office-to-pdf'],
  ),
};

/** Total number of tool guides (remote + browser-only tools). */
export const TOOL_COUNT = Object.keys(TOOLS_SEO).length;
