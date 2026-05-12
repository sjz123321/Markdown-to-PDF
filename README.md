[**English**](README.md) | [**中文**](README_zh.md)

---

# md2pdf — Markdown to PDF CLI Tool

Convert Markdown files to beautifully formatted PDFs, with full support for Chinese text, syntax-highlighted code blocks, tables, table of contents, custom stylesheets, and more.

## Features

- **Zero-config setup** — Node.js + Chromium (Puppeteer), no system-level dependencies
- **Chinese-first** — Built-in font stack (PingFang / Microsoft YaHei / Noto Sans SC)
- **Multi-file merge** — Combine several `.md` files into a single PDF
- **Auto table of contents** — `--toc` generates a linked TOC from heading levels
- **Custom styles** — `--css` accepts a custom stylesheet to override the default theme
- **Headers & footers** — `--header / --footer` with page-number placeholder support
- **Code highlighting** — Dark-themed code blocks + optional line numbers (`--line-numbers`)
- **Page control** — A4 / Letter / landscape / custom margins
- **Print-friendly** — `--print` preserves background colors for physical printing

## Installation

```bash
# Clone the repo
git clone https://github.com/your-username/md2pdf-tool.git
cd md2pdf-tool

# Install dependencies
npm install

# (Optional) Install globally for the md2pdf command
npm link
```

Requires Node.js >= 18.

## Usage

```bash
# Convert a single file (outputs to the same name with .pdf)
node cli.js input.md

# Specify output path
node cli.js input.md -o output.pdf

# Merge multiple files
node cli.js chapter1.md chapter2.md -o book.pdf

# Generate table of contents
node cli.js readme.md --toc

# Landscape + custom margins
node cli.js document.md --landscape --margin 15mm

# Headers and footers
node cli.js doc.md --header "Project Docs" --footer "Page %page%"

# Custom stylesheet
node cli.js doc.md --css my-theme.css

# Code line numbers + print-friendly
node cli.js doc.md --line-numbers --print

# Open PDF automatically after generation
node cli.js readme.md --open
```

After global install:

```bash
md2pdf readme.md
md2pdf chap1.md chap2.md -o book.pdf --toc --landscape
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output` | Output PDF path | Input filename + `.pdf` |
| `--css` | Custom CSS file path | Built-in default theme |
| `--header` | Header text (HTML) | None |
| `--footer` | Footer text (supports `%page%`) | None |
| `--page-size` | Page size | `A4` |
| `--margin` | Page margin (CSS unit) | `25.4mm` |
| `--landscape` | Landscape orientation | No |
| `--toc` | Generate table of contents | No |
| `--line-numbers` | Show line numbers in code blocks | No |
| `--print` | Print-friendly mode | No |
| `--open` | Open PDF after generation | No |

## Tech Stack

- **[marked](https://github.com/markedjs/marked)** — Markdown → HTML parser
- **[Puppeteer](https://github.com/puppeteer/puppeteer)** — Headless Chromium HTML → PDF
- **[commander](https://github.com/tj/commander.js)** — CLI argument parser

## License

MIT