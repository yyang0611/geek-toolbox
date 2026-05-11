# Legacy Feature Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all missing legacy features into the Vue3 rewrite so there is zero functional regression.

**Architecture:** Each task is a self-contained change to one or two files. Tasks are ordered by dependency — the discovery sidebar composable must exist before the sidebar component can use it.

**Tech Stack:** Vue 3, TypeScript, vue-i18n, localStorage

---

### Task 1: Timestamp — Digit-Length Detection Logic

**Files:**
- Modify: `src/components/tools/TimestampTool.vue:181-202`

The legacy version uses digit-length (13 = ms, 10 = s, else fallback to unit toggle). The current Vue version uses a simple threshold `> 9999999999` which is less precise.

- [ ] **Step 1: Replace `timestampToDate()` detection logic**

Replace the current detection in `timestampToDate()`:

```typescript
function timestampToDate() {
  if (!timestampInput.value) return
  const raw = timestampInput.value.trim()
  if (!/^[+-]?\d+$/.test(raw)) {
    dateResult.value = t('timestamp.invalidTimestamp')
    tsDetectHint.value = ''
    return
  }
  const normalized = raw.replace(/^[+-]/, '')
  let ts = Number(raw)
  if (isNaN(ts)) {
    dateResult.value = t('timestamp.invalidTimestamp')
    tsDetectHint.value = ''
    return
  }
  if (normalized.length === 13) {
    tsDetectHint.value = t('timestamp.detectAutoMilliseconds')
  } else if (normalized.length === 10) {
    tsDetectHint.value = t('timestamp.detectAutoSeconds')
    ts = ts * 1000
  } else {
    // Fallback to current unit toggle
    if (unit.value === 'ms') {
      tsDetectHint.value = t('timestamp.detectAutoMilliseconds')
    } else {
      tsDetectHint.value = t('timestamp.detectAutoSeconds')
      ts = ts * 1000
    }
  }
  const date = new Date(ts)
  if (isNaN(date.getTime())) {
    dateResult.value = t('timestamp.invalidTimestamp')
    tsDetectHint.value = ''
    return
  }
  dateResult.value = formatDateTime(date) + '\n' + date.toISOString()
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/TimestampTool.vue
git commit -m "fix(timestamp): use digit-length detection matching legacy behavior"
```

---

### Task 2: Timestamp — Escape Key Closes Picker

**Files:**
- Modify: `src/components/tools/TimestampTool.vue`

- [ ] **Step 1: Add keyboard event handler for Escape**

Add a `@keydown.escape` handler on the picker overlay div. In the template, change:

```html
<div v-if="pickerVisible" class="picker-overlay" @click.self="closePicker">
```

to:

```html
<div v-if="pickerVisible" class="picker-overlay" @click.self="closePicker" @keydown.escape="closePicker" tabindex="-1" ref="pickerOverlayRef">
```

Add ref and auto-focus logic in script:

```typescript
const pickerOverlayRef = ref<HTMLElement | null>(null)
```

In `openPicker()`, after `pickerVisible.value = true`, add:

```typescript
nextTick(() => pickerOverlayRef.value?.focus())
```

Add `nextTick` to the import if not already there.

- [ ] **Step 2: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/TimestampTool.vue
git commit -m "feat(timestamp): close picker on Escape key"
```

---

### Task 3: Diff Tool — Copy Result Button

**Files:**
- Modify: `src/components/tools/DiffTool.vue`

- [ ] **Step 1: Add clipboard composable and copy button**

In `<script setup>`, add:

```typescript
import { useClipboard } from '@/composables/useClipboard'
const { copied, copy } = useClipboard()

function copyResult() {
  const text = diffResult.value.map(line => {
    const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
    return prefix + line.text
  }).join('\n')
  copy(text)
}
```

In the template, add a copy button next to the Compare button:

```html
<div class="btn-row">
  <button class="btn btn-primary" @click="compare">{{ t('diff.compare') }}</button>
  <button v-if="diffResult.length" class="btn" @click="copyResult">
    {{ copied ? t('common.copied') : t('common.copyResult') }}
  </button>
</div>
```

- [ ] **Step 2: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/DiffTool.vue
git commit -m "feat(diff): add copy result button"
```

---

### Task 4: Annotate Tool — Select Tool

**Files:**
- Modify: `src/components/tools/AnnotateTool.vue`

- [ ] **Step 1: Add 'select' to Tool type and tools array**

Change the type:

```typescript
type Tool = 'select' | 'arrow' | 'rect' | 'text' | 'number' | 'mosaic'
```

Change the default:

```typescript
const currentTool = ref<Tool>('select')
```

Add to tools array (first position):

```typescript
const tools: { key: Tool; label: string }[] = [
  { key: 'select', label: 'annotate.tools.select' },
  { key: 'arrow', label: 'annotate.tools.arrow' },
  { key: 'rect', label: 'annotate.tools.rect' },
  { key: 'text', label: 'annotate.tools.text' },
  { key: 'number', label: 'annotate.tools.number' },
  { key: 'mosaic', label: 'annotate.tools.mosaic' }
]
```

- [ ] **Step 2: Guard pointer events for select tool**

At the top of `onPointerDown`, add early return:

```typescript
function onPointerDown(e: PointerEvent) {
  if (!canvasRef.value || !imageLoaded.value) return
  if (currentTool.value === 'select') return
  // ... rest of function
}
```

- [ ] **Step 3: Change canvas cursor based on tool**

In the template, change the canvas style:

```html
:style="{ touchAction: 'none', cursor: currentTool === 'select' ? 'default' : 'crosshair' }"
```

- [ ] **Step 4: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 5: Commit**

```bash
git add src/components/tools/AnnotateTool.vue
git commit -m "feat(annotate): add select tool as default cursor mode"
```

---

### Task 5: Annotate Tool — Keyboard Navigation

**Files:**
- Modify: `src/components/tools/AnnotateTool.vue`

- [ ] **Step 1: Add keyboard handler for toolbar**

Add a `@keydown` handler on the toolbar div:

```html
<div class="toolbar" @keydown="handleToolbarKeydown">
```

Add the handler function:

```typescript
function handleToolbarKeydown(e: KeyboardEvent) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
  e.preventDefault()
  const currentIdx = tools.findIndex(t => t.key === currentTool.value)
  let nextIdx: number
  if (e.key === 'ArrowRight') {
    nextIdx = (currentIdx + 1) % tools.length
  } else {
    nextIdx = (currentIdx - 1 + tools.length) % tools.length
  }
  currentTool.value = tools[nextIdx].key
  // Focus the new active button
  const toolbar = e.currentTarget as HTMLElement
  const buttons = toolbar.querySelectorAll<HTMLButtonElement>('.tool-btn')
  buttons[nextIdx]?.focus()
}
```

- [ ] **Step 2: Add roving tabindex to tool buttons**

Update the toolbar buttons in template:

```html
<button v-for="(tool, idx) in tools" :key="tool.key" class="btn tool-btn"
        :class="{ active: currentTool === tool.key }"
        :tabindex="currentTool === tool.key ? 0 : -1"
        @click="currentTool = tool.key">
  {{ t(tool.label) }}
</button>
```

- [ ] **Step 3: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 4: Commit**

```bash
git add src/components/tools/AnnotateTool.vue
git commit -m "feat(annotate): add keyboard navigation for toolbar (arrow keys)"
```

---

### Task 6: Image Tool — Shared/Custom Crop Mode

**Files:**
- Modify: `src/components/tools/ImageTool.vue`

- [ ] **Step 1: Add crop mode to ImageItem interface and state**

Add `useCustomCrop` field to `ImageItem`:

```typescript
interface ImageItem {
  id: string
  file: File
  originalSize: number
  thumbnail: string
  naturalWidth: number
  naturalHeight: number
  crop: CropRect | null
  useCustomCrop: boolean  // NEW
  compressedBlob: Blob | null
  compressedSize: number
  compressedUrl: string
}
```

Add shared crop state:

```typescript
const sharedCrop = ref<CropRect | null>(null)
```

When creating new ImageItem, set `useCustomCrop: false`.

- [ ] **Step 2: Add toggle UI in crop section**

After the crop-info div, add a toggle:

```html
<label class="crop-mode-toggle">
  <input type="checkbox" :checked="activeImage.useCustomCrop"
         @change="toggleCropMode(activeImage)" />
  <span>{{ t('image.customCropToggle') }}</span>
</label>
```

- [ ] **Step 3: Implement shared crop logic**

```typescript
function toggleCropMode(item: ImageItem) {
  item.useCustomCrop = !item.useCustomCrop
  if (!item.useCustomCrop) {
    // Switch to shared: apply shared crop proportionally
    item.crop = sharedCrop.value ? adaptCrop(sharedCrop.value, item) : null
  }
  currentCrop.value = item.crop
  drawCropCanvas()
}

function adaptCrop(crop: CropRect, item: ImageItem): CropRect {
  // Adapt shared crop proportionally to this image's dimensions
  const refItem = images.value.find(i => !i.useCustomCrop && i.crop)
  if (!refItem) return { ...crop }
  const scaleX = item.naturalWidth / refItem.naturalWidth
  const scaleY = item.naturalHeight / refItem.naturalHeight
  return {
    x: Math.round(crop.x * scaleX),
    y: Math.round(crop.y * scaleY),
    w: Math.round(crop.w * scaleX),
    h: Math.round(crop.h * scaleY)
  }
}
```

- [ ] **Step 4: Update canvasMouseUp to sync shared crop**

In `canvasMouseUp()`, after setting `activeImage.value.crop`, add:

```typescript
if (activeImage.value && !activeImage.value.useCustomCrop) {
  sharedCrop.value = currentCrop.value
  // Apply to all other non-custom images
  for (const img of images.value) {
    if (img.id !== activeImage.value.id && !img.useCustomCrop) {
      img.crop = sharedCrop.value ? adaptCrop(sharedCrop.value, img) : null
    }
  }
}
```

- [ ] **Step 5: Add badge to thumbnails**

In the thumb-item template, add a badge:

```html
<span class="crop-badge">{{ img.useCustomCrop ? t('image.queueBadgeCustom') : t('image.queueBadgeShared') }}</span>
```

Add CSS:

```css
.crop-badge { position: absolute; top: 2px; left: 2px; font-size: 0.55rem; background: rgba(0,0,0,0.7); color: #fff; padding: 1px 3px; border-radius: 3px; }
.crop-mode-toggle { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 0.78rem; color: var(--text-dim); cursor: pointer; }
.crop-mode-toggle input { accent-color: var(--primary); }
```

- [ ] **Step 6: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 7: Commit**

```bash
git add src/components/tools/ImageTool.vue
git commit -m "feat(image): add shared/custom crop mode with proportional adaptation"
```

---

### Task 7: Convert Tool — All Worksheets ZIP Export

**Files:**
- Modify: `src/components/tools/ConvertTool.vue`

- [ ] **Step 1: Add sheet export mode state**

```typescript
const sheetMode = ref<'single' | 'all'>('single')
```

- [ ] **Step 2: Add UI for sheet mode selection**

In the xlsx-csv advanced options section (where `sheetNames.length > 1`), add radio buttons:

```html
<div class="option-row">
  <label class="small-label">{{ t('convert.sheetMode') }}</label>
  <label class="radio-option">
    <input type="radio" value="single" v-model="sheetMode" /> {{ t('convert.sheetModeSingle') }}
  </label>
  <label class="radio-option">
    <input type="radio" value="all" v-model="sheetMode" /> {{ t('convert.sheetModeAll') }}
  </label>
</div>
```

- [ ] **Step 3: Implement all-sheets ZIP export in xlsxToCsv**

Replace `xlsxToCsv()`:

```typescript
async function xlsxToCsv() {
  loading.value = true
  await loadScript(CDN.XLSX)
  loading.value = false
  const XLSX = (window as any).XLSX
  const data = await file.value!.arrayBuffer()
  const wb = XLSX.read(data, { type: 'array' })

  if (sheetMode.value === 'all' && wb.SheetNames.length > 1) {
    // Export all sheets as ZIP
    const zipFiles: { name: string; data: Uint8Array }[] = []
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name]
      const csv = XLSX.utils.sheet_to_csv(ws, { FS: csvSeparator.value })
      zipFiles.push({ name: `${name}.csv`, data: new TextEncoder().encode(csv) })
    }
    resultBlob.value = createZip(zipFiles)
    resultFileName.value = file.value!.name.replace(/\.[^.]+$/, '') + '_all_sheets.zip'
    resultText.value = t('convert.allSheetsZipReady', { count: wb.SheetNames.length })
  } else {
    const sheetName = selectedSheet.value || wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(ws, { FS: csvSeparator.value })
    resultText.value = csv
    resultBlob.value = new Blob([csv], { type: 'text/csv' })
    resultFileName.value = file.value!.name.replace(/\.[^.]+$/, '') + '.csv'
  }
}
```

- [ ] **Step 4: Add createZip helper (reuse from ImageTool pattern)**

Add the same `createZip` function that already exists in ImageTool (copy it into ConvertTool):

```typescript
function createZip(files: { name: string; data: Uint8Array }[]): Blob {
  const parts: Uint8Array[] = []
  const centralDir: Uint8Array[] = []
  let offset = 0
  for (const f of files) {
    const nameBytes = new TextEncoder().encode(f.name)
    const header = new Uint8Array(30 + nameBytes.length)
    const hv = new DataView(header.buffer)
    hv.setUint32(0, 0x04034b50, true)
    hv.setUint16(4, 20, true)
    hv.setUint16(8, 0, true)
    hv.setUint32(18, f.data.length, true)
    hv.setUint32(22, f.data.length, true)
    hv.setUint16(26, nameBytes.length, true)
    header.set(nameBytes, 30)
    parts.push(header, f.data)
    const cd = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(cd.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint32(20, f.data.length, true)
    cv.setUint32(24, f.data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint32(42, offset, true)
    cd.set(nameBytes, 46)
    centralDir.push(cd)
    offset += header.length + f.data.length
  }
  const cdOffset = offset
  let cdSize = 0
  for (const cd of centralDir) { parts.push(cd); cdSize += cd.length }
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true)
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, cdSize, true)
  ev.setUint32(16, cdOffset, true)
  parts.push(eocd)
  return new Blob(parts, { type: 'application/zip' })
}
```

- [ ] **Step 5: Add i18n keys**

Add to zh-CN.json under `convert`:
```json
"sheetMode": "导出模式",
"sheetModeSingle": "单个工作表",
"sheetModeAll": "全部工作表 (ZIP)",
"allSheetsZipReady": "已打包 {count} 个工作表为 ZIP"
```

Add to en.json under `convert`:
```json
"sheetMode": "Export mode",
"sheetModeSingle": "Single sheet",
"sheetModeAll": "All sheets (ZIP)",
"allSheetsZipReady": "Packed {count} sheets into ZIP"
```

- [ ] **Step 6: Add CSS for radio options**

```css
.radio-option { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--text); cursor: pointer; margin-right: 12px; }
.radio-option input { accent-color: var(--primary); }
```

- [ ] **Step 7: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 8: Commit**

```bash
git add src/components/tools/ConvertTool.vue src/locales/zh-CN.json src/locales/en.json
git commit -m "feat(convert): add all-worksheets ZIP export mode for XLSX→CSV"
```

---

### Task 8: Convert Tool — CSV Separator in CSV→XLSX

**Files:**
- Modify: `src/components/tools/ConvertTool.vue`

The current `csvToXlsx()` always splits by comma. It should use the `csvSeparator` value.

- [ ] **Step 1: Show separator option for csv-xlsx type**

Add a new section in template for csv-xlsx:

```html
<section v-if="conversionType === 'csv-xlsx' && file" class="section">
  <div class="option-row">
    <label class="small-label">{{ t('convert.separatorLabel') }}</label>
    <select v-model="csvSeparator" class="select small-select">
      <option value=",">,</option>
      <option value=";">;</option>
      <option value="&#9">Tab</option>
    </select>
  </div>
</section>
```

- [ ] **Step 2: Fix csvToXlsx to use csvSeparator**

Replace the line splitting logic:

```typescript
async function csvToXlsx() {
  loading.value = true
  await loadScript(CDN.XLSX)
  loading.value = false
  const XLSX = (window as any).XLSX
  const text = await file.value!.text()
  const wb = XLSX.utils.book_new()
  const rows = text.split('\n').map((row: string) => row.split(csvSeparator.value))
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  resultBlob.value = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  resultFileName.value = file.value!.name.replace(/\.[^.]+$/, '') + '.xlsx'
  resultText.value = t('convert.xlsxReady')
}
```

- [ ] **Step 3: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 4: Commit**

```bash
git add src/components/tools/ConvertTool.vue
git commit -m "feat(convert): use selected CSV separator in CSV→XLSX conversion"
```

---

### Task 9: Discovery Sidebar — Composable for Favorites & Recent

**Files:**
- Create: `src/composables/useDiscovery.ts`

- [ ] **Step 1: Create the composable**

```typescript
import { ref, computed } from 'vue'
import { TOOLS } from '@/registry'
import type { ToolMeta } from '@/types/tools'

const STORAGE_KEY_FAVORITES = 'geek-toolbox-favorite-tools'
const STORAGE_KEY_RECENT = 'geek-toolbox-recent-tools'
const STORAGE_KEY_COLLAPSE = 'geek-toolbox-discovery-collapse'
const MAX_FAVORITES = 12
const MAX_RECENT = 8

function loadArray(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') }
  catch { return [] }
}

function saveArray(key: string, arr: string[]) {
  localStorage.setItem(key, JSON.stringify(arr))
}

const favoriteIds = ref<string[]>(loadArray(STORAGE_KEY_FAVORITES))
const recentIds = ref<string[]>(loadArray(STORAGE_KEY_RECENT))
const collapseState = ref<Record<string, boolean>>(
  (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_COLLAPSE) || '{}') } catch { return {} } })()
)

export function useDiscovery() {
  const recommendedTools = computed<ToolMeta[]>(() =>
    TOOLS.filter(t => t.featured)
  )

  const favoriteTools = computed<ToolMeta[]>(() =>
    favoriteIds.value.map(id => TOOLS.find(t => t.id === id)).filter(Boolean) as ToolMeta[]
  )

  const recentTools = computed<ToolMeta[]>(() =>
    recentIds.value.map(id => TOOLS.find(t => t.id === id)).filter(Boolean) as ToolMeta[]
  )

  function isFavorite(id: string): boolean {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id: string) {
    const idx = favoriteIds.value.indexOf(id)
    if (idx !== -1) {
      favoriteIds.value.splice(idx, 1)
    } else {
      if (favoriteIds.value.length >= MAX_FAVORITES) return
      favoriteIds.value.push(id)
    }
    saveArray(STORAGE_KEY_FAVORITES, favoriteIds.value)
  }

  function recordRecent(id: string) {
    const idx = recentIds.value.indexOf(id)
    if (idx !== -1) recentIds.value.splice(idx, 1)
    recentIds.value.unshift(id)
    if (recentIds.value.length > MAX_RECENT) recentIds.value.pop()
    saveArray(STORAGE_KEY_RECENT, recentIds.value)
  }

  function clearRecent() {
    recentIds.value = []
    saveArray(STORAGE_KEY_RECENT, [])
  }

  function isCollapsed(section: string): boolean {
    return collapseState.value[section] ?? false
  }

  function toggleCollapse(section: string) {
    collapseState.value[section] = !collapseState.value[section]
    localStorage.setItem(STORAGE_KEY_COLLAPSE, JSON.stringify(collapseState.value))
  }

  return {
    recommendedTools, favoriteTools, recentTools,
    isFavorite, toggleFavorite,
    recordRecent, clearRecent,
    isCollapsed, toggleCollapse
  }
}
```

- [ ] **Step 2: Add `featured` flag to ToolMeta type**

In `src/types/tools.ts`, add optional `featured`:

```typescript
export interface ToolMeta {
  id: string
  category: ToolCategory
  icon: string
  titleKey: string
  descKey: string
  featured?: boolean
  component: () => Promise<Component>
}
```

- [ ] **Step 3: Mark featured tools in registry**

In `src/registry.ts`, add `featured: true` to `annotate` and `card` entries (matching legacy):

```typescript
{
  id: 'annotate',
  category: 'image',
  icon: '✏️',
  titleKey: 'tabs.annotate',
  descKey: 'toolCards.annotate',
  featured: true,
  component: () => import('@/components/tools/AnnotateTool.vue')
},
{
  id: 'card',
  category: 'text',
  icon: '🃏',
  titleKey: 'tabs.card',
  descKey: 'toolCards.card',
  featured: true,
  component: () => import('@/components/tools/CardTool.vue')
}
```

- [ ] **Step 4: Integrate recordRecent into useToolNav**

In `src/composables/useToolNav.ts`, import and call `recordRecent` when opening a tool:

```typescript
import { ref, computed } from 'vue'
import { getToolById } from '@/registry'
import { useDiscovery } from '@/composables/useDiscovery'
import type { ToolMeta } from '@/types/tools'

const currentToolId = ref<string | null>(null)
const currentCategory = ref<string>('all')

export function useToolNav() {
  const { recordRecent } = useDiscovery()

  const currentTool = computed<ToolMeta | undefined>(() =>
    currentToolId.value ? getToolById(currentToolId.value) : undefined
  )

  function openTool(id: string) {
    currentToolId.value = id
    recordRecent(id)
  }

  function goHome() {
    currentToolId.value = null
  }

  function setCategory(category: string) {
    currentCategory.value = category
  }

  return {
    currentToolId, currentTool, currentCategory,
    openTool, goHome, setCategory
  }
}
```

- [ ] **Step 5: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 6: Commit**

```bash
git add src/composables/useDiscovery.ts src/composables/useToolNav.ts src/types/tools.ts src/registry.ts
git commit -m "feat: add discovery composable (favorites, recent, recommended)"
```

---

### Task 10: Discovery Sidebar — Component

**Files:**
- Create: `src/components/layout/DiscoverySidebar.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Create DiscoverySidebar component**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscovery } from '@/composables/useDiscovery'
import { useToolNav } from '@/composables/useToolNav'

const { t } = useI18n()
const { recommendedTools, favoriteTools, recentTools, isFavorite, toggleFavorite, clearRecent, isCollapsed, toggleCollapse } = useDiscovery()
const { openTool } = useToolNav()

const SHOW_LIMIT = 3
const expandedSections = ref<Record<string, boolean>>({})

function isExpanded(section: string): boolean {
  return expandedSections.value[section] ?? false
}

function toggleExpand(section: string) {
  expandedSections.value[section] = !expandedSections.value[section]
}
</script>

<template>
  <aside class="discovery-sidebar" :aria-label="t('home.discoveryShellAriaLabel')">
    <!-- Recommended -->
    <section v-if="recommendedTools.length" class="sidebar-section" :aria-label="t('home.recommendedSectionAriaLabel')">
      <button class="section-header" @click="toggleCollapse('recommended')">
        <span class="section-title">{{ t('home.recommendedTitle') }}</span>
        <span class="section-count">{{ recommendedTools.length }}</span>
        <span class="collapse-icon">{{ isCollapsed('recommended') ? '▸' : '▾' }}</span>
      </button>
      <div v-show="!isCollapsed('recommended')" class="section-body">
        <div v-for="tool in (isExpanded('recommended') ? recommendedTools : recommendedTools.slice(0, SHOW_LIMIT))"
             :key="tool.id" class="sidebar-card">
          <span class="card-icon">{{ tool.icon }}</span>
          <span class="card-title">{{ t(tool.titleKey) }}</span>
          <div class="card-actions">
            <button class="action-btn" @click="openTool(tool.id)">{{ t('home.useNow') }}</button>
            <button class="action-btn fav-btn" @click.stop="toggleFavorite(tool.id)">
              {{ isFavorite(tool.id) ? t('home.unfavorite') : t('home.favorite') }}
            </button>
          </div>
        </div>
        <button v-if="recommendedTools.length > SHOW_LIMIT" class="expand-btn" @click="toggleExpand('recommended')">
          {{ isExpanded('recommended') ? t('home.showLess') : t('home.showMoreCount', { count: recommendedTools.length - SHOW_LIMIT }) }}
        </button>
      </div>
    </section>

    <!-- Favorites -->
    <section class="sidebar-section" :aria-label="t('home.favoriteSectionAriaLabel')">
      <button class="section-header" @click="toggleCollapse('favorites')">
        <span class="section-title">{{ t('home.favoriteTitle') }}</span>
        <span class="section-count">{{ favoriteTools.length }}</span>
        <span class="collapse-icon">{{ isCollapsed('favorites') ? '▸' : '▾' }}</span>
      </button>
      <div v-show="!isCollapsed('favorites')" class="section-body">
        <p v-if="!favoriteTools.length" class="empty-hint">{{ t('home.favoriteEmpty') }}</p>
        <div v-for="tool in (isExpanded('favorites') ? favoriteTools : favoriteTools.slice(0, SHOW_LIMIT))"
             :key="tool.id" class="sidebar-card">
          <span class="card-icon">{{ tool.icon }}</span>
          <span class="card-title">{{ t(tool.titleKey) }}</span>
          <div class="card-actions">
            <button class="action-btn" @click="openTool(tool.id)">{{ t('home.useNow') }}</button>
            <button class="action-btn fav-btn" @click.stop="toggleFavorite(tool.id)">{{ t('home.unfavorite') }}</button>
          </div>
        </div>
        <button v-if="favoriteTools.length > SHOW_LIMIT" class="expand-btn" @click="toggleExpand('favorites')">
          {{ isExpanded('favorites') ? t('home.showLess') : t('home.showMoreCount', { count: favoriteTools.length - SHOW_LIMIT }) }}
        </button>
      </div>
    </section>

    <!-- Recent -->
    <section class="sidebar-section" :aria-label="t('home.recentSectionAriaLabel')">
      <button class="section-header" @click="toggleCollapse('recent')">
        <span class="section-title">{{ t('home.recentTitle') }}</span>
        <span class="section-count">{{ recentTools.length }}</span>
        <span class="collapse-icon">{{ isCollapsed('recent') ? '▸' : '▾' }}</span>
      </button>
      <div v-show="!isCollapsed('recent')" class="section-body">
        <p v-if="!recentTools.length" class="empty-hint">{{ t('home.recentEmpty') }}</p>
        <div v-for="tool in (isExpanded('recent') ? recentTools : recentTools.slice(0, SHOW_LIMIT))"
             :key="tool.id" class="sidebar-card">
          <span class="card-icon">{{ tool.icon }}</span>
          <span class="card-title">{{ t(tool.titleKey) }}</span>
          <button class="action-btn" @click="openTool(tool.id)">{{ t('home.useNow') }}</button>
        </div>
        <button v-if="recentTools.length > SHOW_LIMIT" class="expand-btn" @click="toggleExpand('recent')">
          {{ isExpanded('recent') ? t('home.showLess') : t('home.showMoreCount', { count: recentTools.length - SHOW_LIMIT }) }}
        </button>
        <button v-if="recentTools.length" class="clear-btn" @click="clearRecent">{{ t('home.clearRecent') }}</button>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.discovery-sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sidebar-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
}
.section-header:hover { background: var(--surface2); }
.section-count {
  background: var(--surface2);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 0.7rem;
  color: var(--text-dim);
}
.collapse-icon { margin-left: auto; font-size: 0.7rem; color: var(--text-dim); }
.section-body { padding: 0 10px 10px; }
.sidebar-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.sidebar-card:hover { background: var(--surface2); }
.card-icon { font-size: 1rem; }
.card-title { flex: 1; font-size: 0.78rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-actions { display: flex; gap: 4px; }
.action-btn {
  padding: 3px 8px;
  font-size: 0.68rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.fav-btn:hover { border-color: var(--accent); color: var(--accent); }
.expand-btn {
  display: block;
  width: 100%;
  padding: 5px;
  margin-top: 4px;
  background: none;
  border: none;
  font-size: 0.72rem;
  color: var(--primary);
  cursor: pointer;
  text-align: center;
}
.expand-btn:hover { text-decoration: underline; }
.clear-btn {
  display: block;
  margin-top: 6px;
  padding: 3px 8px;
  font-size: 0.68rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
}
.clear-btn:hover { border-color: var(--red); color: var(--red); }
.empty-hint { font-size: 0.72rem; color: var(--text-dim); padding: 8px 4px; }

@media (max-width: 900px) {
  .discovery-sidebar { width: 100%; }
}
</style>
```

- [ ] **Step 2: Integrate into App.vue**

Update App.vue home-view to include the sidebar:

```vue
<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToolNav } from '@/composables/useToolNav'
import AppHeader from '@/components/layout/AppHeader.vue'
import CategoryTabs from '@/components/layout/CategoryTabs.vue'
import ToolGrid from '@/components/layout/ToolGrid.vue'
import DiscoverySidebar from '@/components/layout/DiscoverySidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
// ... rest unchanged
</script>
```

In template, change the home-view:

```html
<div v-if="!currentTool" key="home" class="home-view">
  <div class="home-layout">
    <DiscoverySidebar />
    <div class="home-main">
      <CategoryTabs />
      <ToolGrid />
    </div>
  </div>
</div>
```

Add CSS:

```css
.home-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.home-main {
  flex: 1;
  min-width: 0;
}
@media (max-width: 900px) {
  .home-layout { flex-direction: column; }
}
```

- [ ] **Step 3: Add favorite button to ToolCard**

In `src/components/layout/ToolCard.vue`, add a favorite toggle button:

Import `useDiscovery`:
```typescript
import { useDiscovery } from '@/composables/useDiscovery'
const { isFavorite, toggleFavorite } = useDiscovery()
```

Add button in template (inside the card):
```html
<button class="fav-toggle" @click.stop="toggleFavorite(tool.id)"
        :title="isFavorite(tool.id) ? t('home.unfavorite') : t('home.favorite')">
  {{ isFavorite(tool.id) ? '★' : '☆' }}
</button>
```

- [ ] **Step 4: Verify build passes**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/DiscoverySidebar.vue src/App.vue src/components/layout/ToolCard.vue
git commit -m "feat: add discovery sidebar with recommended, favorites, and recent tools"
```

---

### Task 11: Add Missing i18n Keys

**Files:**
- Modify: `src/locales/zh-CN.json`
- Modify: `src/locales/en.json`

- [ ] **Step 1: Add missing keys for image tool**

zh-CN.json under `image`:
```json
"customCropToggle": "为此图片使用独立裁剪",
"queueBadgeCustom": "独立",
"queueBadgeShared": "共享"
```

en.json under `image`:
```json
"customCropToggle": "Use custom crop for this image",
"queueBadgeCustom": "Custom",
"queueBadgeShared": "Shared"
```

- [ ] **Step 2: Verify all i18n keys referenced in code exist**

Run: `npx vue-tsc --noEmit && npx vite build`

- [ ] **Step 3: Commit**

```bash
git add src/locales/zh-CN.json src/locales/en.json
git commit -m "feat(i18n): add missing translation keys for image crop and convert features"
```

---

## Summary

| Task | Feature | Files |
|------|---------|-------|
| 1 | Timestamp digit-length detection | TimestampTool.vue |
| 2 | Timestamp Escape closes picker | TimestampTool.vue |
| 3 | Diff copy result button | DiffTool.vue |
| 4 | Annotate select tool | AnnotateTool.vue |
| 5 | Annotate keyboard navigation | AnnotateTool.vue |
| 6 | Image shared/custom crop | ImageTool.vue |
| 7 | Convert all-sheets ZIP | ConvertTool.vue, locales |
| 8 | Convert CSV separator in CSV→XLSX | ConvertTool.vue |
| 9 | Discovery composable | useDiscovery.ts, useToolNav.ts, types, registry |
| 10 | Discovery sidebar component | DiscoverySidebar.vue, App.vue, ToolCard.vue |
| 11 | Missing i18n keys | locales |
