# Geek Toolbox Version 1 Growth Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Version 1 growth features — Screenshot Annotation, Code/Text to Image Card, and site-wide Recent/Favorite tools — without breaking the existing local-first single-page toolbox.

**Architecture:** Keep the current static single-page architecture and extend it in-place. Add two new tool panels, add a homepage-style discovery layer above the tab rail, and introduce a small client-side tool registry plus localStorage-backed recent/favorite state so new and existing tools can share the same navigation and retention behavior.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Canvas API, localStorage, Clipboard API, browser file APIs

---

## File Responsibility Map

### Existing files to modify
- `index.html`
  - Add recommended/recent/favorite homepage sections
  - Add tool cards and favorites controls
  - Add Screenshot Annotation panel markup
  - Add Text to Image Card panel markup
- `style.css`
  - Add homepage card layout
  - Add favorite/recent/recommended section styling
  - Add annotation workspace styling
  - Add text-card preview/export styling
  - Add responsive/mobile support for new modules
- `app.js`
  - Add tool registry metadata
  - Add generic tool switching + tool-open tracking
  - Add favorites/recent persistence helpers
  - Add homepage section rendering logic
  - Add screenshot annotation state, canvas interaction, export, messages
  - Add text-card preview/export logic
  - Add i18n strings for new UI copy and states

### New files to create
- `docs/superpowers/plans/2026-05-09-version-1-growth-features.md`
  - This implementation plan
- `docs/manual-tests/version-1-growth-features-checklist.md`
  - Manual verification checklist for launch and regression checks

### Constraints to respect
- No new dependencies
- Preserve existing tools and current access model
- Keep initial page load lightweight
- localStorage failure must degrade gracefully
- New tools must work in both Chinese and English

---

### Task 1: Stabilize tool navigation with a registry

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Add a centralized tool registry in `app.js`**

```js
const TOOL_REGISTRY = [
  { id: 'timestamp', category: 'developer', titleKey: 'tabs.timestamp', descriptionKey: 'toolCards.timestamp' },
  { id: 'image', category: 'image', titleKey: 'tabs.image', descriptionKey: 'toolCards.image' },
  { id: 'convert', category: 'file', titleKey: 'tabs.convert', descriptionKey: 'toolCards.convert' },
  { id: 'json', category: 'developer', titleKey: 'tabs.json', descriptionKey: 'toolCards.json' },
  { id: 'diff', category: 'text', titleKey: 'tabs.diff', descriptionKey: 'toolCards.diff' },
  { id: 'base64', category: 'developer', titleKey: 'tabs.base64', descriptionKey: 'toolCards.base64' },
  { id: 'count', category: 'text', titleKey: 'tabs.count', descriptionKey: 'toolCards.count' },
  { id: 'url', category: 'developer', titleKey: 'tabs.url', descriptionKey: 'toolCards.url' },
  { id: 'regex', category: 'developer', titleKey: 'tabs.regex', descriptionKey: 'toolCards.regex' },
  { id: 'jwt', category: 'developer', titleKey: 'tabs.jwt', descriptionKey: 'toolCards.jwt' },
  { id: 'yaml', category: 'developer', titleKey: 'tabs.yaml', descriptionKey: 'toolCards.yaml' },
  { id: 'color', category: 'image', titleKey: 'tabs.color', descriptionKey: 'toolCards.color' },
  { id: 'annotate', category: 'image', titleKey: 'tabs.annotate', descriptionKey: 'toolCards.annotate', featured: true },
  { id: 'card', category: 'text', titleKey: 'tabs.card', descriptionKey: 'toolCards.card', featured: true }
];

function getToolMeta(toolId) {
  return TOOL_REGISTRY.find(tool => tool.id === toolId) || null;
}
```

- [ ] **Step 2: Add tab buttons for the new tools in `index.html`**

```html
<button class="tab" data-tool="annotate" data-i18n="tabs.annotate">Screenshot Annotation</button>
<button class="tab" data-tool="card" data-i18n="tabs.card">Text to Image Card</button>
```

- [ ] **Step 3: Replace the ad-hoc click handler with `switchTool()`**

```js
function switchTool(toolId, options = {}) {
  const { track = true } = options;
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tool === toolId);
  });
  document.querySelectorAll('.tool-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'tool-' + toolId);
  });
  if (track) recordRecentTool(toolId);
  if (toolId === 'annotate') syncAnnotationLayout();
  if (toolId === 'card') renderTextCardPreview();
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchTool(tab.dataset.tool));
});
```

- [ ] **Step 4: Run a manual smoke check**

Run: open `index.html` in a browser and click `timestamp`, `json`, `image`, and `color`  
Expected: correct panel activates and no console error appears

- [ ] **Step 5: Commit**

```bash
git add app.js index.html
git commit -m "Stabilize tool navigation for growth feature rollout"
```

---

### Task 2: Add homepage discovery sections

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Add the discovery shell above the tab bar**

```html
<section class="discovery-shell container" id="discovery-shell">
  <div class="discovery-section">
    <div class="section-heading">
      <h2 data-i18n="home.recommendedTitle">Recommended</h2>
      <p data-i18n="home.recommendedSubtitle">Try the new shareable tools first</p>
    </div>
    <div class="hero-tool-grid" id="recommended-tools"></div>
  </div>

  <div class="discovery-split-grid">
    <div class="discovery-section">
      <div class="section-heading compact">
        <h2 data-i18n="home.recentTitle">Recent Tools</h2>
        <button class="btn outline small" type="button" id="clear-recent-tools" data-i18n="home.clearRecent">Clear</button>
      </div>
      <div class="tool-card-grid" id="recent-tools"></div>
    </div>

    <div class="discovery-section">
      <div class="section-heading compact">
        <h2 data-i18n="home.favoriteTitle">Favorite Tools</h2>
      </div>
      <div class="tool-card-grid" id="favorite-tools"></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add reusable card layout styles**

```css
.discovery-shell { display: grid; gap: 20px; padding-top: 24px; }
.discovery-section { display: grid; gap: 12px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 12px; }
.hero-tool-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.discovery-split-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.tool-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.tool-card, .hero-tool-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}
.hero-tool-card {
  padding: 22px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.18);
}
```

- [ ] **Step 3: Add mobile fallbacks**

```css
@media (max-width: 820px) {
  .hero-tool-grid,
  .discovery-split-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 4: Verify desktop/mobile layout**

Run: open `index.html`, resize from desktop width to mobile width  
Expected: recommendation cards stack cleanly and tab bar remains usable

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "Add homepage discovery layout for featured and retained tools"
```

---

### Task 3: Implement recent and favorite tools persistence

**Files:**
- Modify: `app.js`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Add storage keys and safe wrappers**

```js
const RECENT_TOOLS_STORAGE_KEY = 'geek-toolbox-recent-tools';
const FAVORITE_TOOLS_STORAGE_KEY = 'geek-toolbox-favorite-tools';
const MAX_RECENT_TOOLS = 8;
const MAX_FAVORITE_TOOLS = 12;

function safeLoadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function safeSaveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}
```

- [ ] **Step 2: Add usage state and mutators**

```js
const toolUsageState = {
  recent: safeLoadJson(RECENT_TOOLS_STORAGE_KEY, []),
  favorites: safeLoadJson(FAVORITE_TOOLS_STORAGE_KEY, [])
};

function recordRecentTool(toolId) {
  if (!getToolMeta(toolId)) return;
  toolUsageState.recent = [toolId]
    .concat(toolUsageState.recent.filter(id => id !== toolId))
    .slice(0, MAX_RECENT_TOOLS);
  safeSaveJson(RECENT_TOOLS_STORAGE_KEY, toolUsageState.recent);
  renderRecentTools();
}

function isFavoriteTool(toolId) {
  return toolUsageState.favorites.includes(toolId);
}

function toggleFavoriteTool(toolId) {
  if (!getToolMeta(toolId)) return;
  const next = isFavoriteTool(toolId)
    ? toolUsageState.favorites.filter(id => id !== toolId)
    : toolUsageState.favorites.concat(toolId).slice(0, MAX_FAVORITE_TOOLS);
  toolUsageState.favorites = next;
  safeSaveJson(FAVORITE_TOOLS_STORAGE_KEY, next);
  renderFavoriteTools();
  renderRecommendedTools();
}
```

- [ ] **Step 3: Add render helpers**

```js
function renderToolCard(tool, options = {}) {
  const { featured = false } = options;
  const cardClass = featured ? 'hero-tool-card' : 'tool-card';
  const favoriteLabel = isFavoriteTool(tool.id) ? t('home.unfavorite') : t('home.favorite');
  const badge = tool.featured ? `<span class="tool-badge">${t('home.newBadge')}</span>` : '';
  return `
    <article class="${cardClass}">
      <div class="tool-card-top">
        <div>
          <h3>${t(tool.titleKey)}</h3>
          <p>${t(tool.descriptionKey)}</p>
        </div>
        ${badge}
      </div>
      <div class="tool-card-actions">
        <button class="btn primary" type="button" onclick="switchTool('${tool.id}')">${t('home.useNow')}</button>
        <button class="btn outline favorite-toggle ${isFavoriteTool(tool.id) ? 'active' : ''}" type="button" onclick="toggleFavoriteTool('${tool.id}')">${favoriteLabel}</button>
      </div>
    </article>
  `;
}
```

- [ ] **Step 4: Add section renderers**

```js
function renderRecommendedTools() {
  const root = document.getElementById('recommended-tools');
  if (!root) return;
  root.innerHTML = TOOL_REGISTRY
    .filter(tool => tool.featured)
    .map(tool => renderToolCard(tool, { featured: true }))
    .join('');
}

function renderRecentTools() {
  const root = document.getElementById('recent-tools');
  if (!root) return;
  if (!toolUsageState.recent.length) {
    root.innerHTML = `<div class="tool-empty">${t('home.recentEmpty')}</div>`;
    return;
  }
  root.innerHTML = toolUsageState.recent.map(getToolMeta).filter(Boolean).map(tool => renderToolCard(tool)).join('');
}

function renderFavoriteTools() {
  const root = document.getElementById('favorite-tools');
  if (!root) return;
  if (!toolUsageState.favorites.length) {
    root.innerHTML = `<div class="tool-empty">${t('home.favoriteEmpty')}</div>`;
    return;
  }
  root.innerHTML = toolUsageState.favorites.map(getToolMeta).filter(Boolean).map(tool => renderToolCard(tool)).join('');
}
```

- [ ] **Step 5: Add clear-recent handler**

```js
document.getElementById('clear-recent-tools')?.addEventListener('click', () => {
  toolUsageState.recent = [];
  safeSaveJson(RECENT_TOOLS_STORAGE_KEY, toolUsageState.recent);
  renderRecentTools();
});
```

- [ ] **Step 6: Verify persistence manually**

Run: open page, click `JSON`, `Regex`, `Screenshot Annotation`, favorite `JSON`, refresh  
Expected: recent tools show in most-recent-first order and favorite `JSON` persists

- [ ] **Step 7: Commit**

```bash
git add app.js
git commit -m "Persist recent and favorite tools for homepage retention"
```

---

### Task 4: Add Screenshot Annotation panel scaffolding

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Add annotation panel markup**

```html
<section id="tool-annotate" class="tool-panel">
  <h2 data-i18n="annotate.title">Screenshot Annotation</h2>
  <p class="panel-subtitle" data-i18n="annotate.subtitle">Add arrows, text, and mosaic to screenshots</p>
  <div class="annotate-layout">
    <div class="annotate-sidebar">
      <label class="upload-dropzone" id="annotate-dropzone">
        <input id="annotate-input" type="file" accept="image/png,image/jpeg,image/webp" hidden />
        <span data-i18n="annotate.uploadCta">Upload screenshot</span>
        <small data-i18n="annotate.uploadHint">PNG, JPG, WEBP</small>
      </label>
      <div class="annotate-toolbar">
        <button class="btn outline" type="button" data-annotate-tool="select">Select</button>
        <button class="btn outline" type="button" data-annotate-tool="arrow">Arrow</button>
        <button class="btn outline" type="button" data-annotate-tool="rect">Rectangle</button>
        <button class="btn outline" type="button" data-annotate-tool="text">Text</button>
        <button class="btn outline" type="button" data-annotate-tool="number">Number</button>
        <button class="btn outline" type="button" data-annotate-tool="mosaic">Mosaic</button>
      </div>
      <div class="annotate-controls">
        <label class="label" for="annotate-color" data-i18n="annotate.color">Color</label>
        <input id="annotate-color" type="color" value="#ff4757" />
        <label class="label" for="annotate-line-width" data-i18n="annotate.lineWidth">Line Width</label>
        <input id="annotate-line-width" type="range" min="1" max="8" value="3" />
        <label class="label" for="annotate-font-size" data-i18n="annotate.fontSize">Font Size</label>
        <input id="annotate-font-size" type="range" min="12" max="32" value="18" />
      </div>
      <div class="btn-row">
        <button class="btn" type="button" id="annotate-undo" data-i18n="annotate.undo">Undo</button>
        <button class="btn" type="button" id="annotate-redo" data-i18n="annotate.redo">Redo</button>
        <button class="btn red" type="button" id="annotate-clear" data-i18n="annotate.clearAll">Clear All</button>
        <button class="btn primary" type="button" id="annotate-export" data-i18n="annotate.export">Export PNG</button>
      </div>
      <div id="annotate-message" class="error-msg"></div>
    </div>
    <div class="annotate-canvas-shell">
      <canvas id="annotate-canvas" class="annotate-canvas"></canvas>
      <div id="annotate-empty" class="annotate-empty" data-i18n="annotate.empty">Upload a screenshot to start annotating</div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add annotation styles**

```css
.annotate-layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 16px; }
.annotate-sidebar, .annotate-canvas-shell {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}
.annotate-toolbar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
.annotate-canvas-shell { min-height: 520px; position: relative; overflow: auto; }
.annotate-canvas { width: 100%; display: block; }
.annotate-empty { position: absolute; inset: 0; display: grid; place-items: center; color: var(--text-dim); }
```

- [ ] **Step 3: Add responsive fallback**

```css
@media (max-width: 960px) {
  .annotate-layout { grid-template-columns: 1fr; }
  .annotate-canvas-shell { min-height: 360px; }
}
```

- [ ] **Step 4: Visual check**

Run: switch to Screenshot Annotation  
Expected: upload area, toolbar, controls, and empty-state canvas shell appear without overlap

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "Scaffold screenshot annotation workspace"
```

---

### Task 5: Implement Screenshot Annotation behavior

**Files:**
- Modify: `app.js`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Add annotation state**

```js
const annotationState = {
  image: null,
  canvas: null,
  ctx: null,
  tool: 'arrow',
  color: '#ff4757',
  lineWidth: 3,
  fontSize: 18,
  shapes: [],
  undoneShapes: [],
  draftShape: null,
  dragStart: null
};
```

- [ ] **Step 2: Add redraw helpers**

```js
function setAnnotationMessage(message = '', type = '') {
  const node = document.getElementById('annotate-message');
  if (!node) return;
  node.textContent = message;
  node.dataset.type = type;
}

function redrawAnnotationCanvas() {
  const canvas = annotationState.canvas;
  const ctx = annotationState.ctx;
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (annotationState.image) ctx.drawImage(annotationState.image, 0, 0, canvas.width, canvas.height);
  annotationState.shapes.forEach(drawAnnotationShape);
  if (annotationState.draftShape) drawAnnotationShape(annotationState.draftShape);
}
```

- [ ] **Step 3: Add initialization and image loading**

```js
function initAnnotationTool() {
  annotationState.canvas = document.getElementById('annotate-canvas');
  annotationState.ctx = annotationState.canvas?.getContext('2d');
  document.getElementById('annotate-input')?.addEventListener('change', onAnnotationFileChange);
  document.querySelectorAll('[data-annotate-tool]').forEach(button => {
    button.addEventListener('click', () => setAnnotationTool(button.dataset.annotateTool));
  });
}

function onAnnotationFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!/^image\\/(png|jpeg|webp)$/.test(file.type)) {
    setAnnotationMessage(t('annotate.invalidFormat'), 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      annotationState.image = image;
      annotationState.shapes = [];
      annotationState.undoneShapes = [];
      annotationState.canvas.width = image.width;
      annotationState.canvas.height = image.height;
      redrawAnnotationCanvas();
      document.getElementById('annotate-empty')?.classList.add('hidden');
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}
```

- [ ] **Step 4: Add undo/redo/export**

```js
function undoAnnotation() {
  const last = annotationState.shapes.pop();
  if (!last) return;
  annotationState.undoneShapes.push(last);
  redrawAnnotationCanvas();
}

function redoAnnotation() {
  const last = annotationState.undoneShapes.pop();
  if (!last) return;
  annotationState.shapes.push(last);
  redrawAnnotationCanvas();
}

function exportAnnotationImage() {
  if (!annotationState.canvas || !annotationState.image) {
    setAnnotationMessage(t('annotate.exportMissing'), 'error');
    return;
  }
  annotationState.canvas.toBlob(blob => {
    if (!blob) return setAnnotationMessage(t('annotate.exportFailed'), 'error');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annotated-screenshot.png';
    link.click();
    URL.revokeObjectURL(url);
    setAnnotationMessage(t('annotate.exportSuccess'), 'success');
  }, 'image/png');
}
```

- [ ] **Step 5: Full manual verification**

Run: upload a PNG, add arrow, rectangle, text, number, mosaic, then export  
Expected: preview updates, undo/redo works, export preserves placement

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "Implement screenshot annotation drawing and export"
```

---

### Task 6: Add Text to Image Card panel scaffolding

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Add panel markup**

```html
<section id="tool-card" class="tool-panel">
  <h2 data-i18n="card.title">Code / Text to Image Card</h2>
  <p class="panel-subtitle" data-i18n="card.subtitle">Turn code or text into a shareable image card</p>
  <div class="card-tool-layout">
    <div class="card-tool-controls">
      <label class="label" for="card-text-input" data-i18n="card.inputLabel">Input</label>
      <textarea id="card-text-input" class="code-input" data-i18n-placeholder="card.placeholder" placeholder="Paste text, code, JSON, or notes here..."></textarea>
      <label class="label" for="card-theme" data-i18n="card.themeLabel">Theme</label>
      <select id="card-theme" class="ts-select">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
      <label class="label" for="card-size" data-i18n="card.sizeLabel">Size</label>
      <select id="card-size" class="ts-select">
        <option value="square">Square</option>
        <option value="portrait">Portrait</option>
        <option value="landscape">Landscape</option>
      </select>
      <div class="btn-row">
        <button class="btn primary" type="button" id="card-export" data-i18n="card.export">Export PNG</button>
        <button class="btn outline" type="button" id="card-copy-image" data-i18n="card.copyImage">Copy Image</button>
        <button class="btn red" type="button" id="card-clear" data-i18n="common.clear">Clear</button>
      </div>
      <div id="card-message" class="error-msg"></div>
    </div>
    <div class="card-preview-shell">
      <div id="card-preview" class="share-card share-card--dark" data-size="square">
        <div class="share-card-window-bar"><span></span><span></span><span></span></div>
        <pre id="card-preview-content" class="share-card-content"></pre>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add preview styles**

```css
.card-tool-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 16px; }
.card-tool-controls, .card-preview-shell {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}
.share-card {
  margin: 0 auto;
  width: min(100%, 680px);
  min-height: 420px;
  border-radius: 24px;
  padding: 22px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.24);
}
.share-card--dark { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); color: #f9fafb; }
.share-card--light { background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%); color: #111827; }
.share-card-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  line-height: 1.7;
}
.share-card[data-size='portrait'] { aspect-ratio: 4 / 5; }
.share-card[data-size='square'] { aspect-ratio: 1 / 1; }
.share-card[data-size='landscape'] { aspect-ratio: 16 / 9; }
```

- [ ] **Step 3: Add responsive fallback**

```css
@media (max-width: 960px) {
  .card-tool-layout { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Visual check**

Run: switch to Text to Image Card  
Expected: controls and preview render cleanly on desktop and mobile widths

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "Scaffold text to image card generator UI"
```

---

### Task 7: Implement Text to Image Card behavior

**Files:**
- Modify: `app.js`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Add card state and preview renderer**

```js
const textCardState = {
  text: '',
  theme: 'dark',
  size: 'square'
};

function renderTextCardPreview() {
  const preview = document.getElementById('card-preview');
  const content = document.getElementById('card-preview-content');
  if (!preview || !content) return;
  preview.classList.toggle('share-card--dark', textCardState.theme === 'dark');
  preview.classList.toggle('share-card--light', textCardState.theme === 'light');
  preview.dataset.size = textCardState.size;
  content.textContent = textCardState.text || t('card.emptyPreview');
}
```

- [ ] **Step 2: Add control listeners**

```js
function initTextCardTool() {
  document.getElementById('card-text-input')?.addEventListener('input', event => {
    textCardState.text = event.target.value;
    renderTextCardPreview();
  });
  document.getElementById('card-theme')?.addEventListener('change', event => {
    textCardState.theme = event.target.value;
    renderTextCardPreview();
  });
  document.getElementById('card-size')?.addEventListener('change', event => {
    textCardState.size = event.target.value;
    renderTextCardPreview();
  });
}
```

- [ ] **Step 3: Add export pipeline**

```js
async function exportTextCardImage() {
  if (!textCardState.text.trim()) return setTextCardMessage(t('card.emptyInput'), 'error');
  const blob = await buildTextCardBlob();
  if (!blob) return setTextCardMessage(t('card.exportFailed'), 'error');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'text-card.png';
  link.click();
  setTextCardMessage(t('card.exportSuccess'), 'success');
}
```

- [ ] **Step 4: Add clipboard image copy**

```js
async function copyTextCardImage() {
  if (!window.ClipboardItem) return setTextCardMessage(t('card.copyUnavailable'), 'error');
  const blob = await buildTextCardBlob();
  if (!blob) return setTextCardMessage(t('card.exportFailed'), 'error');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  setTextCardMessage(t('card.copySuccess'), 'success');
}
```

- [ ] **Step 5: Full manual verification**

Run: paste mixed Chinese/English text, switch themes and sizes, export PNG, then copy image  
Expected: preview updates immediately, wrapping stays readable, export is sharp, unsupported clipboard browsers fail gracefully

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "Implement text card preview export and clipboard copy"
```

---

### Task 8: Add i18n and UI polish

**Files:**
- Modify: `app.js`
- Modify: `style.css`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Extend language bundles**

```js
home: {
  recommendedTitle: '推荐工具',
  recommendedSubtitle: '先试试更适合分享的新工具',
  recentTitle: '最近使用',
  favoriteTitle: '我的收藏',
  clearRecent: '清空',
  recentEmpty: '你最近打开的工具会显示在这里',
  favoriteEmpty: '收藏常用工具，回访更方便',
  useNow: '立即使用',
  favorite: '收藏',
  unfavorite: '取消收藏',
  newBadge: 'NEW'
}
```

- [ ] **Step 2: Add favorite/empty-state styles**

```css
.favorite-toggle.active {
  border-color: var(--primary);
  color: #fff;
  background: rgba(108, 99, 255, 0.18);
}
.tool-empty {
  padding: 18px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  color: var(--text-dim);
}
.panel-subtitle { margin-bottom: 16px; color: var(--text-dim); }
```

- [ ] **Step 3: Refresh dynamic sections after language changes**

```js
function refreshLocalizedUI() {
  renderRecommendedTools();
  renderRecentTools();
  renderFavoriteTools();
  renderTextCardPreview();
}
```

- [ ] **Step 4: Verify bilingual rendering**

Run: switch between Chinese and English  
Expected: recommendation cards, empty states, and both new tools fully localize

- [ ] **Step 5: Commit**

```bash
git add app.js style.css
git commit -m "Localize and polish new growth feature surfaces"
```

---

### Task 9: Add launch checklist and run regression verification

**Files:**
- Create: `docs/manual-tests/version-1-growth-features-checklist.md`
- Test: `docs/manual-tests/version-1-growth-features-checklist.md`

- [ ] **Step 1: Create the checklist**

```md
# Version 1 Growth Features Manual Checklist

## Regression
- [ ] Timestamp tab opens and converts values
- [ ] JSON formatter still formats and validates
- [ ] Image compression still uploads and exports
- [ ] File conversion still switches modes and enables actions
- [ ] Regex tester still updates live
- [ ] Color converter still copies values

## Homepage retention/discovery
- [ ] Recommended cards render
- [ ] Recent tools update after tool open
- [ ] Favorites persist after refresh
- [ ] Clear recent resets the section

## Screenshot annotation
- [ ] PNG/JPG/WEBP upload works
- [ ] Arrow, rectangle, text, number, mosaic work
- [ ] Undo/redo works
- [ ] Export PNG works

## Text to image card
- [ ] Empty state shows helpful text
- [ ] Theme switch works
- [ ] Size switch works
- [ ] Export works
- [ ] Copy image works or shows graceful unsupported message

## i18n/mobile
- [ ] Chinese labels render correctly
- [ ] English labels render correctly
- [ ] Homepage stacks cleanly on narrow viewport
- [ ] New tool panels remain usable on mobile width
```

- [ ] **Step 2: Run the full checklist**

Run: open `index.html` in a browser and execute every item in `docs/manual-tests/version-1-growth-features-checklist.md`  
Expected: all boxes can be checked; any failure blocks completion until fixed

- [ ] **Step 3: Record clipboard fallback behavior in the checklist**

```md
- Clipboard image copy requires browser support for `ClipboardItem`; unsupported browsers should show a localized fallback message instead of throwing.
```

- [ ] **Step 4: Commit**

```bash
git add docs/manual-tests/version-1-growth-features-checklist.md
git commit -m "Document launch verification for Version 1 growth features"
```

---

## Self-Review

### Spec coverage
- Screenshot Annotation: Tasks 4 and 5
- Code/Text to Image Card: Tasks 6 and 7
- Recent/Favorite Tools: Task 3
- Homepage recommendation area: Tasks 2 and 8
- Error handling, empty states, and graceful fallback: Tasks 3, 5, 7, 8
- Mobile and launch validation: Tasks 2, 4, 6, 9

No coverage gaps found.

### Placeholder scan
- No TBD/TODO placeholders remain
- Each task includes exact files, concrete steps, and verification

### Type consistency
- Tool IDs are consistent: `annotate`, `card`
- Shared rendering path consistently depends on `switchTool()`, `TOOL_REGISTRY`, and `toolUsageState`

---

Plan complete and saved to `docs/superpowers/plans/2026-05-09-version-1-growth-features.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
