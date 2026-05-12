const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');
const puppeteer = require('puppeteer');

/**
 * Convert one or more Markdown files into a single PDF.
 *
 * @param {object} options
 * @param {string[]} options.inputs       - Paths to .md files (in merge order)
 * @param {string}   options.output       - Output .pdf path
 * @param {string}   [options.css]        - Path to custom CSS stylesheet
 * @param {string}   [options.header]     - HTML snippet for page header
 * @param {string}   [options.footer]     - HTML snippet for page footer
 * @param {string}   [options.pageSize]   - e.g. 'A4', 'Letter' (default: A4)
 * @param {string}   [options.margin]     - CSS margin string, e.g. '20mm' (default: 25.4mm)
 * @param {boolean}  [options.print]      - Print-friendly mode (no bg graphics)
 * @param {boolean}  [options.toc]        - Prepend a table of contents
 * @param {boolean}  [options.landscape]  - Landscape orientation
 * @param {boolean}  [options.lineNumbers]- Add line numbers to code blocks
 */
async function convertMdToPdf(options) {
  const {
    inputs,
    output,
    css,
    header,
    footer,
    pageSize = 'A4',
    margin = '25.4mm',
    print = false,
    toc = false,
    landscape = false,
    lineNumbers = false,
  } = options;

  // 1. Read and parse all markdown files
  let allHtml = '';
  const headings = []; // for TOC

  const marked = new Marked({
    gfm: true,
    breaks: true,
  });

  // Extend renderer to collect headings for TOC
  const renderer = {
    heading({ text, depth, tokens }) {
      const slug = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '');
      headings.push({ text, depth, slug });
      return `<h${depth} id="${slug}">${text}</h${depth}>`;
    },
    code({ text, lang }) {
      const langClass = lang ? ` class="language-${lang}"` : '';
      const lineNumClass = lineNumbers ? ' class="line-numbers"' : '';
      return `<pre><code${langClass}${lineNumClass}>${escapeHtml(text)}</code></pre>`;
    },
  };

  marked.use({ renderer });

  for (const inputPath of inputs) {
    const mdContent = fs.readFileSync(inputPath, 'utf-8');
    const html = await marked.parse(mdContent);
    allHtml += html + '\n';
  }

  // 2. Build table of contents
  let tocHtml = '';
  if (toc && headings.length > 0) {
    tocHtml = '<nav class="toc"><h1>目录</h1><ul>';
    for (const h of headings) {
      tocHtml += `<li style="padding-left:${(h.depth - 1) * 1.2}em">` +
        `<a href="#${h.slug}">${escapeHtml(h.text)}</a></li>`;
    }
    tocHtml += '</ul></nav><hr>';
  }

  // 3. Load custom CSS
  let customCss = '';
  if (css) {
    customCss = fs.readFileSync(css, 'utf-8');
  }

  // 4. Build final HTML document
  const orientation = landscape ? 'landscape' : 'portrait';
  const printStyle = print ? '@media print { body { -webkit-print-color-adjust: exact; } }' : '';

  const htmlDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  /* Default theme */
  body {
    font-family: 'Segoe UI', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 12pt;
    line-height: 1.7;
    color: #1a1a1a;
    max-width: ${pageSize === 'A4' ? '170mm' : '6.5in'};
    margin: 0 auto;
    padding: 0;
    word-wrap: break-word;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.3;
    color: #111;
  }
  h1 { font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.2em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1.1em; }

  p { margin: 0.8em 0; }
  ul, ol { margin: 0.5em 0; padding-left: 2em; }
  li { margin: 0.3em 0; }

  blockquote {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid #4a9eff;
    background: #f8f9fa;
    color: #555;
  }

  code {
    font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
    font-size: 0.9em;
    background: #f0f0f0;
    padding: 0.15em 0.4em;
    border-radius: 3px;
  }

  pre {
    margin: 1em 0;
    padding: 1em;
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 0.85em;
    line-height: 1.5;
  }
  pre code {
    background: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 0.5em 0.8em;
    text-align: left;
  }
  th { background: #f5f5f5; font-weight: 600; }
  tr:nth-child(even) { background: #fafafa; }

  a { color: #0969da; text-decoration: none; }
  a:hover { text-decoration: underline; }

  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 2em 0;
  }

  img { max-width: 100%; height: auto; }

  /* TOC */
  .toc { margin-bottom: 1em; }
  .toc h1 { font-size: 1.5em; border: none; }
  .toc ul { list-style: none; padding-left: 0; }
  .toc li { margin: 0.4em 0; }
  .toc a { color: #333; }
  .toc a:hover { color: #0969da; }

  /* Line numbers for code blocks */
  code.line-numbers {
    counter-reset: linenumber;
  }
  code.line-numbers > span {
    display: block;
    counter-increment: linenumber;
  }
  code.line-numbers > span::before {
    content: counter(linenumber);
    display: inline-block;
    width: 2em;
    padding-right: 1em;
    text-align: right;
    color: #6c7086;
    user-select: none;
  }

  /* Page breaks */
  .page-break { page-break-before: always; }

  @page {
    size: ${pageSize} ${orientation};
    margin: ${margin};
    ${header ? `@top-center { content: "${escapeCssString(header)}"; font-size: 9pt; color: #888; }` : ''}
    ${footer ? `@bottom-center { content: "${escapeCssString(footer)}"; font-size: 9pt; color: #888; }` : ''}
  }

  ${printStyle}
  ${customCss}
</style>
</head>
<body>
${tocHtml}
${allHtml}
</body>
</html>`;

  // 5. Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlDoc, { waitUntil: 'networkidle0' });

    const pdfOptions = {
      path: output,
      format: pageSize,
      printBackground: !print,
      margin: {
        top: margin,
        bottom: margin,
        left: margin,
        right: margin,
      },
      landscape,
      displayHeaderFooter: !!(header || footer),
      headerTemplate: header
        ? `<div style="font-size:9pt;color:#888;padding:0 10mm;width:100%;text-align:center">${escapeHtml(header)}</div>`
        : '',
      footerTemplate: footer
        ? `<div style="font-size:9pt;color:#888;padding:0 10mm;width:100%;text-align:center">${escapeHtml(footer)}</div>`
        : '',
      preferCSSPageSize: false,
    };

    await page.pdf(pdfOptions);
  } finally {
    await browser.close();
  }

  return { output, pages: headings.length };
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeCssString(str) {
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\A ');
}

module.exports = { convertMdToPdf };