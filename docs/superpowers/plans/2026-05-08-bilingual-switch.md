# Bilingual Language Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent Chinese/English switcher that localizes the static UI, runtime messages, and project documentation without introducing dependencies.

**Architecture:** Keep the current static single-page app structure, add a centralized translation table plus lightweight language helpers in `app.js`, annotate static DOM nodes in `index.html`, and rerender stateful UI on language changes. Preserve the existing tools and behavior while normalizing corrupted visible text to valid UTF-8.

**Tech Stack:** HTML, CSS, vanilla JavaScript, localStorage, Python static server for manual verification, Node syntax check for JavaScript.

---

## File Structure

- `index.html`
  - Add the top-right language switcher.
  - Replace hard-coded UI copy with `data-i18n*` bindings.
  - Ensure timestamp, image, convert, and support sections expose all translatable labels and placeholders.
- `style.css`
  - Add switcher layout and active-state styles.
  - Adjust header and responsive spacing for longer English labels.
- `app.js`
  - Add locale detection, persistence, translation lookup, DOM application, and localized UI refresh helpers.
  - Replace runtime hard-coded strings in JSON, diff, base64/URL, timestamp, image, convert, and support flows.
- `README.md`
  - Rewrite/normalize as the Chinese primary README and link to the English version.
- `README.en.md`
  - Add the English README and link back to the Chinese version.

### Task 1: Add the language system scaffold and header switcher

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `app.js`

- [ ] **Step 1: Add the header switcher markup and static i18n bindings in `index.html`**

Add a header actions area with a two-button switcher and bind the existing title/subtitle text with translation keys.

```html
<header class="header">
  <div class="header-bar">
    <div>
      <div class="logo" data-i18n="header.title">极客工具箱</div>
      <p class="subtitle" data-i18n="header.subtitle">在线开发工具，浏览器本地运行，你的数据不上云</p>
    </div>

    <div class="lang-switcher" aria-label="Language switcher">
      <button id="lang-zh-CN" class="lang-btn" type="button" onclick="setLanguage('zh-CN')">中文</button>
      <button id="lang-en" class="lang-btn" type="button" onclick="setLanguage('en')">EN</button>
    </div>
  </div>
</header>
```

- [ ] **Step 2: Add switcher styling and responsive header layout in `style.css`**

Introduce a flexible header bar so the top-right switcher does not overlap the centered branding.

```css
.header-bar {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.lang-switcher {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
}

.lang-btn {
  border: none;
  background: transparent;
  color: var(--text-dim);
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.lang-btn.active {
  background: var(--primary);
  color: #fff;
}
```

- [ ] **Step 3: Add the translation table and core helpers in `app.js`**

Create the locale store and the helper functions before the existing tool logic.

```js
const LOCALE_STORAGE_KEY = 'geek-toolbox-language';
const SUPPORTED_LANGUAGES = ['zh-CN', 'en'];

const translations = {
  'zh-CN': {
    header: {
      title: '极客工具箱',
      subtitle: '在线开发工具，浏览器本地运行，你的数据不上云'
    },
    tabs: {
      timestamp: '时间戳',
      image: '图片压缩',
      convert: '文件转换',
      json: 'JSON 格式化',
      diff: '文本对比',
      base64: 'Base64',
      count: '字数统计',
      url: 'URL 编解码'
    }
  },
  en: {
    header: {
      title: 'Geek Toolbox',
      subtitle: 'Local-first developer tools that run in your browser'
    },
    tabs: {
      timestamp: 'Timestamp',
      image: 'Image Compress',
      convert: 'File Convert',
      json: 'JSON Format',
      diff: 'Text Diff',
      base64: 'Base64',
      count: 'Text Count',
      url: 'URL Encode/Decode'
    }
  }
};

function detectPreferredLanguage() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(saved)) return saved;
  } catch {}

  const browserLang = (navigator.language || '').toLowerCase();
  return browserLang.startsWith('zh') ? 'zh-CN' : 'en';
}

let currentLanguage = detectPreferredLanguage();

function t(key, params = {}) {
  const read = locale => key.split('.').reduce((value, part) => value && value[part], translations[locale]);
  const template = read(currentLanguage) ?? read(currentLanguage === 'zh-CN' ? 'en' : 'zh-CN') ?? key;
  return String(template).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '');
}
```

- [ ] **Step 4: Add DOM application and language switching behavior in `app.js`**

Wire up static bindings, active button state, persistence, and refresh hooks.

```js
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `lang-${currentLanguage}`);
  });
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  currentLanguage = lang;
  try { localStorage.setItem(LOCALE_STORAGE_KEY, lang); } catch {}
  applyI18n();
  refreshLocalizedUI();
}
```

- [ ] **Step 5: Run syntax verification**

Run: `node --check app.js`

Expected: exit code `0` with no syntax errors.

### Task 2: Localize the static tool UI and accessibility copy

**Files:**
- Modify: `index.html`
- Modify: `app.js`

- [ ] **Step 1: Bind tab labels and simple tool sections in `index.html`**

Convert the tab labels and static text for JSON, diff, Base64, count, and URL panels into i18n-bound nodes.

```html
<button class="tab active" data-tool="timestamp" data-i18n="tabs.timestamp">时间戳</button>
<button class="tab" data-tool="image" data-i18n="tabs.image">图片压缩</button>

<h2 data-i18n="json.title">JSON 格式化 / 校验</h2>
<textarea id="json-input" data-i18n-placeholder="json.inputPlaceholder"></textarea>
<button class="btn primary" data-i18n="json.formatButton" onclick="formatJSON()">格式化</button>
```

- [ ] **Step 2: Bind the timestamp, image, convert, and support labels in `index.html`**

Apply `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`, and `data-i18n-aria-label` to:

- timestamp picker labels, quick actions, input placeholders, and copy titles;
- image upload labels, empty states, crop controls, action buttons, and preview alt text;
- file conversion labels, select options, dropzone copy, result placeholders;
- support modal tabs, helper text, and button labels.

```html
<input id="ts-timestamp" data-i18n-placeholder="timestamp.inputSecondsPlaceholder" />
<div id="img-empty-state" data-i18n="image.emptyState">拖拽图片到这里...</div>
<div id="convert-dropzone" data-i18n="convert.dropzone">也可以将文件拖拽到这里上传</div>
<button id="support-tab-cn" data-i18n="support.cnTab">国内</button>
```

- [ ] **Step 3: Populate missing translation keys in `app.js` for all static UI copy**

Expand the translation table with all user-visible static keys used in `index.html`.

```js
translations['zh-CN'].json = {
  title: 'JSON 格式化 / 校验',
  inputPlaceholder: '粘贴 JSON 到这里...',
  formatButton: '格式化',
  compressButton: '压缩'
};

translations.en.json = {
  title: 'Format / Validate JSON',
  inputPlaceholder: 'Paste JSON here...',
  formatButton: 'Format',
  compressButton: 'Minify'
};
```

- [ ] **Step 4: Initialize i18n before tool-specific refreshes**

Ensure startup order applies static translations before tool state painters run.

```js
applyI18n();
renderImageQueue();
syncImageMeta();
onConvertTypeChange();
updateTimestampInputPlaceholder();
refreshNow();
```

- [ ] **Step 5: Run syntax verification**

Run: `node --check app.js`

Expected: exit code `0` with no syntax errors.

### Task 3: Localize runtime messages and stateful refresh paths

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace simple tool messages with `t()` calls**

Localize JSON errors, diff empty state, and URL decode errors.

```js
errEl.textContent = t('json.invalidError', { message: e.message });
out.innerHTML = `<span style="color:var(--text-dim)">${escapeHtml(t('diff.emptyState'))}</span>`;
document.getElementById('url-output').textContent = t('url.decodeError');
```

- [ ] **Step 2: Add stateful refresh helpers for timestamp UI**

Refactor timestamp helper functions so labels, hints, placeholders, preview text, and copy feedback read from translations.

```js
function updateTimestampInputPlaceholder() {
  const input = document.getElementById('ts-timestamp');
  if (!input) return;
  input.placeholder = isMillisecondUnit()
    ? t('timestamp.inputMillisecondsPlaceholder')
    : t('timestamp.inputSecondsPlaceholder');
}

function updateTimestampDetectHint(unit) {
  const hint = document.getElementById('ts-detect-hint');
  if (!hint) return;
  hint.textContent = unit ? t('timestamp.detectHint', { unit: t(`timestamp.units.${unit}`) }) : '';
}
```

- [ ] **Step 3: Replace image and file-convert runtime strings with translation keys**

Update queue empty states, status text, result metadata, progress labels, ZIP/export notices, and conversion hints to read through `t()`.

```js
queue.innerHTML = `<div class="img-queue-empty">${escapeHtml(t('image.queueEmpty'))}</div>`;
summary.textContent = t('image.exportSummaryIdle');
generateBtn.textContent = imageToolState.isProcessing ? t('image.generating') : t('image.generateButton');
runBtn.textContent = fileConvertState.isProcessing ? t('convert.running') : t('convert.runButton');
setConvertMessage(t('convert.completedPdfImages', { count: images.length }));
```

- [ ] **Step 4: Add a unified `refreshLocalizedUI()` function**

Repaint each tool’s visible state after a language change.

```js
function refreshLocalizedUI() {
  updateTimestampInputPlaceholder();
  updateTimestampDetectHint(parseTimestampToMilliseconds(document.getElementById('ts-timestamp')?.value || '').detectedUnit);
  updateTimestampPickerPreview();
  renderTimestampPickerCalendar();
  renderImageQueue();
  syncImageMeta();
  updateImageCompressionSummary();
  updateImageActionButtons();
  restoreConvertHint();
  updateConvertButtons();
  applySupportLinks();
}
```

- [ ] **Step 5: Run syntax verification**

Run: `node --check app.js`

Expected: exit code `0` with no syntax errors.

### Task 4: Rewrite bilingual documentation

**Files:**
- Modify: `README.md`
- Create: `README.en.md`

- [ ] **Step 1: Rewrite `README.md` as a clean Chinese primary README**

Document the toolbox features, bilingual switch behavior, local-first/privacy positioning, deployment notes, donation setup, and file conversion capabilities in valid UTF-8. Add a prominent link to `README.en.md`.

```md
# 极客工具箱 / Geek Toolbox

[English README](./README.en.md)

> 纯前端本地运行的开发工具箱，支持中英文界面切换。
```

- [ ] **Step 2: Create `README.en.md` as the English companion**

Mirror the same feature set and operational notes in English and link back to `README.md`.

```md
# Geek Toolbox

[中文说明](./README.md)

> A local-first browser toolbox with a bilingual Chinese/English interface.
```

- [ ] **Step 3: Verify cross-links and file presence**

Run: `Get-ChildItem README*.md`

Expected: both `README.md` and `README.en.md` are present.

### Task 5: Perform manual browser verification and regression sweep

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `app.js`
- Modify: `README.md`
- Create: `README.en.md`

- [ ] **Step 1: Start a local static server**

Run: `python -m http.server 4173`

Expected: a local server starts at `http://127.0.0.1:4173/`.

- [ ] **Step 2: Verify first-load language detection manually**

Check in the browser:

- browser language Chinese => default UI is Chinese;
- browser language English => default UI is English.

Expected: header, tabs, and active panel labels follow the detected locale.

- [ ] **Step 3: Verify manual switching and persistence**

Check in the browser:

- click `EN` and confirm visible UI changes immediately;
- refresh and confirm English persists;
- click `中文` and confirm Chinese returns immediately;
- refresh and confirm Chinese persists.

Expected: no full-page reload is required for switching and the selected locale survives refresh.

- [ ] **Step 4: Verify runtime localization for tool flows**

Check in the browser:

- invalid JSON shows localized error text;
- empty diff state shows localized helper text;
- invalid URL decode shows localized error text;
- timestamp hints and copy actions localize correctly;
- image tool empty state, action buttons, and success/error statuses localize correctly;
- convert tool hints, running state, and completion notices localize correctly;
- support modal tab text and copy-contact button localize correctly.

Expected: all visible runtime messages match the active locale.

- [ ] **Step 5: Run final syntax verification**

Run: `node --check app.js`

Expected: exit code `0` with no syntax errors.

## Self-Review

- Spec coverage: the plan covers the approved scope of UI, runtime text, and bilingual documentation, plus persistence, browser-language detection, and top-right placement.
- Placeholder scan: no `TODO`, `TBD`, or deferred placeholders remain in the task steps.
- Type consistency: all helper names and locale identifiers are used consistently as `zh-CN`, `en`, `setLanguage`, `applyI18n`, `refreshLocalizedUI`, and `t`.
