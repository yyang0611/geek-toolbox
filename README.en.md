# Geek Toolbox

[中文说明](./README.md)

> A local-first browser toolbox with a bilingual Chinese / English interface and no backend required for the core experience.

## Live Site

**[https://geek-toolbox-f4k2.vercel.app/](https://geek-toolbox-f4k2.vercel.app/)**

## Highlights

- **Bilingual UI**: follows the browser language on first visit and remembers manual language changes.
- **Local-first processing**: most actions run directly in the browser, so your data is not uploaded by default.
- **Static deployment**: built with plain HTML, CSS, and JavaScript.
- **Single-page toolbox**: open and use immediately.

## Included Tools

| Tool | What it does |
| --- | --- |
| Timestamp Converter | Convert time ↔ timestamp, supports seconds / milliseconds, date picker, quick presets, and live current time |
| Image Compress / Crop | Batch upload, per-image switching, shared or custom crop, JPEG/PNG export, ZIP batch download |
| File Conversion | XLSX → CSV, CSV → XLSX, DOCX → TXT, PDF → text, PDF → images |
| JSON Formatter | Format, minify, and validate JSON |
| Text Diff | Compare text side by side |
| Base64 | Encode / decode Base64 |
| Text Counter | Count characters, Chinese characters, English words, lines, spaces, and punctuation |
| URL Encode/Decode | Encode / decode URL strings |

## Tech Stack

- HTML
- CSS
- JavaScript
- Browser-side libraries: XLSX, Mammoth, PDF.js

## Bilingual Switching

- First load:
  - Browsers using `zh-*` default to Chinese
  - All other browsers default to English
- Manual switching:
  - Use the `中文 / EN` switcher in the top-right corner
  - The selection is persisted in `localStorage`
- Coverage:
  - Page UI copy
  - Runtime hints, errors, and status messages
  - README documentation

## File Conversion Notes

### XLSX → CSV
- Choose a single worksheet
- Export all worksheets as a ZIP archive
- Change CSV delimiters (comma / semicolon / tab)

### CSV → XLSX
- Convert CSV content into an Excel workbook

### DOCX → TXT
- Extract plain text only, without source formatting

### PDF → Text
- Extract text page by page
- Output is plain text and does not preserve original layout

### PDF → Images
- Choose render scale / clarity
- Select page ranges like `1-3,5,8`
- Download generated images as a ZIP file

## Support / Donations

The project supports both domestic and international donation options:

- Domestic: Alipay QR code in `donate.png`
- International: PayPal / Buy Me a Coffee / Ko-fi

### Replace the domestic QR code

Replace this file in the project root:

- `donate.png`

Use a clear PNG image to avoid QR quality loss.

### Configure international donation usernames

At the top of `app.js`, update:

```js
const supportConfig = {
  contact: 'yyang0611',
  paypalUsername: '',
  buyMeACoffeeUsername: '',
  koFiUsername: ''
};
```

Example:

```js
const supportConfig = {
  contact: 'your-contact',
  paypalUsername: 'your-paypalme-name',
  buyMeACoffeeUsername: 'your-bmac-name',
  koFiUsername: 'your-kofi-name'
};
```

Notes:

- Only provide usernames, not full URLs
- Unconfigured channels are shown as unavailable in the UI
- Configured channels automatically render real donation links

Current configuration:

```js
const supportConfig = {
  contact: 'yyang0611',
  paypalUsername: 'GeekToolbox',
  buyMeACoffeeUsername: '',
  koFiUsername: ''
};
```

## Deployment

This project is a static site and works well with:

- Vercel
- Netlify
- GitHub Pages

The current setup uses Vercel auto-deploys from the `main` branch.
