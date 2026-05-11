<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'
import { useScriptLoader, CDN } from '@/composables/useScriptLoader'

const { t } = useI18n()
const { copied, copy } = useClipboard()
const { loadScript } = useScriptLoader()

type ConversionType = 'xlsx-csv' | 'csv-xlsx' | 'docx-txt' | 'pdf-text' | 'pdf-images'

const conversionType = ref<ConversionType>('xlsx-csv')
const file = ref<File | null>(null)
const loading = ref(false)
const processing = ref(false)
const resultText = ref('')
const resultImages = ref<string[]>([])
const resultBlob = ref<Blob | null>(null)
const resultFileName = ref('')
const message = ref('')
const dragOver = ref(false)
const dragDepth = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

// Advanced options
const sheetNames = ref<string[]>([])
const selectedSheet = ref('')
const csvSeparator = ref(',')
const sheetMode = ref<'single' | 'all'>('single')
const pdfScale = ref(2)
const pdfPageRange = ref('')

const acceptMap: Record<ConversionType, string> = {
  'xlsx-csv': '.xlsx,.xls',
  'csv-xlsx': '.csv',
  'docx-txt': '.docx',
  'pdf-text': '.pdf',
  'pdf-images': '.pdf'
}

watch(conversionType, () => {
  file.value = null
  resultText.value = ''
  resultImages.value = []
  resultBlob.value = null
  message.value = ''
  sheetNames.value = []
  selectedSheet.value = ''
})

function handleFile(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    setFile(input.files[0])
  }
  input.value = ''
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  dragOver.value = true
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  dragDepth.value += 1
  dragOver.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (dragDepth.value === 0) dragOver.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  dragDepth.value = 0
  dragOver.value = false
  if (e.dataTransfer?.files?.[0]) setFile(e.dataTransfer.files[0])
}

async function setFile(f: File) {
  file.value = f
  resultText.value = ''
  resultImages.value = []
  resultBlob.value = null
  message.value = ''
  sheetNames.value = []
  selectedSheet.value = ''
  if (conversionType.value === 'xlsx-csv') {
    await loadSheetNames()
  }
}

async function loadSheetNames() {
  if (!file.value) return
  try {
    await loadScript(CDN.XLSX)
    const XLSX = (window as any).XLSX
    const data = await file.value.arrayBuffer()
    const wb = XLSX.read(data, { type: 'array' })
    sheetNames.value = wb.SheetNames
    selectedSheet.value = wb.SheetNames[0] || ''
  } catch { /* ignore */ }
}

async function convert() {
  if (!file.value) return
  processing.value = true
  message.value = ''
  resultText.value = ''
  resultImages.value = []
  resultBlob.value = null

  try {
    switch (conversionType.value) {
      case 'xlsx-csv': await xlsxToCsv(); break
      case 'csv-xlsx': await csvToXlsx(); break
      case 'docx-txt': await docxToTxt(); break
      case 'pdf-text': await pdfToText(); break
      case 'pdf-images': await pdfToImages(); break
    }
  } catch (e: any) {
    message.value = e.message || t('convert.error')
  } finally {
    processing.value = false
  }
}

async function xlsxToCsv() {
  loading.value = true
  await loadScript(CDN.XLSX)
  loading.value = false
  const XLSX = (window as any).XLSX
  const data = await file.value!.arrayBuffer()
  const wb = XLSX.read(data, { type: 'array' })

  if (sheetMode.value === 'all' && wb.SheetNames.length > 1) {
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

async function docxToTxt() {
  loading.value = true
  await loadScript(CDN.MAMMOTH)
  loading.value = false
  const mammoth = (window as any).mammoth
  const data = await file.value!.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: data })
  resultText.value = result.value
  resultBlob.value = new Blob([result.value], { type: 'text/plain' })
  resultFileName.value = file.value!.name.replace(/\.[^.]+$/, '') + '.txt'
}

async function pdfToText() {
  loading.value = true
  await loadScript(CDN.PDFJS)
  loading.value = false
  const pdfjsLib = (window as any).pdfjsLib
  pdfjsLib.GlobalWorkerOptions.workerSrc = CDN.PDFJS_WORKER
  const data = await file.value!.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item: any) => item.str).join(' ')
    fullText += `--- Page ${i} ---\n${pageText}\n\n`
  }
  resultText.value = fullText
  resultBlob.value = new Blob([fullText], { type: 'text/plain' })
  resultFileName.value = file.value!.name.replace(/\.[^.]+$/, '') + '.txt'
}

function parsePageRange(range: string, total: number): number[] {
  if (!range.trim()) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Set<number> = new Set()
  for (const part of range.split(',')) {
    const m = part.trim().match(/^(\d+)\s*-\s*(\d+)$/)
    if (m) {
      const start = Math.max(1, parseInt(m[1]))
      const end = Math.min(total, parseInt(m[2]))
      for (let i = start; i <= end; i++) pages.add(i)
    } else {
      const n = parseInt(part.trim())
      if (n >= 1 && n <= total) pages.add(n)
    }
  }
  return Array.from(pages).sort((a, b) => a - b)
}

async function pdfToImages() {
  loading.value = true
  await loadScript(CDN.PDFJS)
  loading.value = false
  const pdfjsLib = (window as any).pdfjsLib
  pdfjsLib.GlobalWorkerOptions.workerSrc = CDN.PDFJS_WORKER
  const data = await file.value!.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pages = parsePageRange(pdfPageRange.value, pdf.numPages)
  const imgs: string[] = []
  for (const i of pages) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: pdfScale.value })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise
    imgs.push(canvas.toDataURL('image/png'))
  }
  resultImages.value = imgs
}

function downloadResult() {
  if (!resultBlob.value) return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(resultBlob.value)
  a.download = resultFileName.value
  a.click()
  URL.revokeObjectURL(a.href)
}

function downloadImage(dataUrl: string, index: number) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `page_${index + 1}.png`
  a.click()
}

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

function copyText() {
  if (resultText.value) copy(resultText.value)
}
</script>

<template>
  <div class="convert-tool">
    <h2 class="tool-title">{{ t('convert.title') }}</h2>

    <section class="section">
      <label class="section-label">{{ t('convert.type') }}</label>
      <select v-model="conversionType" class="select">
        <option value="xlsx-csv">XLSX → CSV</option>
        <option value="csv-xlsx">CSV → XLSX</option>
        <option value="docx-txt">DOCX → TXT</option>
        <option value="pdf-text">PDF → Text</option>
        <option value="pdf-images">PDF → Images</option>
      </select>
    </section>

    <section class="section drop-zone" :class="{ 'drag-over': dragOver }"
             @dragenter="handleDragEnter" @dragover="handleDragOver"
             @dragleave="handleDragLeave" @drop="handleDrop">
      <label class="section-label">{{ t('convert.file') }}</label>
      <div class="drop-content">
        <p v-if="!file" class="drop-text">{{ t('convert.dropHint') }}</p>
        <p v-else class="file-name">{{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)</p>
        <button type="button" class="btn outline upload-btn" @click="triggerFileInput">
          {{ t('convert.selectButton') }}
        </button>
        <input ref="fileInput" type="file" :accept="acceptMap[conversionType]" class="sr-only" @change="handleFile" />
      </div>
    </section>

    <!-- Advanced options -->
    <section v-if="conversionType === 'xlsx-csv' && sheetNames.length > 1" class="section">
      <label class="section-label">{{ t('convert.sheetLabel') }}</label>
      <select v-model="selectedSheet" class="select">
        <option v-for="name in sheetNames" :key="name" :value="name">{{ name }}</option>
      </select>
      <div class="option-row">
        <label class="small-label">{{ t('convert.sheetMode') }}</label>
        <label class="radio-option">
          <input type="radio" value="single" v-model="sheetMode" /> {{ t('convert.sheetModeSingle') }}
        </label>
        <label class="radio-option">
          <input type="radio" value="all" v-model="sheetMode" /> {{ t('convert.sheetModeAll') }}
        </label>
      </div>
      <div class="option-row">
        <label class="small-label">{{ t('convert.separatorLabel') }}</label>
        <select v-model="csvSeparator" class="select small-select">
          <option value=",">,</option>
          <option value=";">;</option>
          <option :value="'\t'">Tab</option>
        </select>
      </div>
    </section>

    <section v-if="conversionType === 'xlsx-csv' && sheetNames.length <= 1 && file" class="section">
      <div class="option-row">
        <label class="small-label">{{ t('convert.separatorLabel') }}</label>
        <select v-model="csvSeparator" class="select small-select">
          <option value=",">,</option>
          <option value=";">;</option>
          <option :value="'\t'">Tab</option>
        </select>
      </div>
    </section>

    <section v-if="conversionType === 'csv-xlsx' && file" class="section">
      <div class="option-row">
        <label class="small-label">{{ t('convert.separatorLabel') }}</label>
        <select v-model="csvSeparator" class="select small-select">
          <option value=",">,</option>
          <option value=";">;</option>
          <option :value="'\t'">Tab</option>
        </select>
      </div>
    </section>

    <section v-if="conversionType === 'pdf-images' && file" class="section">
      <label class="section-label">{{ t('convert.pdfOptions') }}</label>
      <div class="options-grid">
        <div class="option-row">
          <label class="small-label">{{ t('convert.scaleLabel') }}</label>
          <select v-model.number="pdfScale" class="select small-select">
            <option :value="1">1x</option>
            <option :value="1.5">1.5x</option>
            <option :value="2">2x</option>
            <option :value="2.5">2.5x</option>
          </select>
        </div>
        <div class="option-row">
          <label class="small-label">{{ t('convert.pageRangeLabel') }}</label>
          <input type="text" v-model="pdfPageRange" class="input small-input" :placeholder="t('convert.pageRangePlaceholder')" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="action-row">
        <button class="btn primary" :disabled="!file || processing || loading" @click="convert">
          {{ loading ? t('convert.loading') : processing ? t('convert.processing') : t('convert.run') }}
        </button>
        <button v-if="resultBlob" class="btn outline" @click="downloadResult">{{ t('convert.download') }}</button>
        <button v-if="resultText" class="btn outline" @click="copyText">
          {{ copied ? t('convert.copied') : t('convert.copy') }}
        </button>
      </div>
      <p v-if="message" class="message error">{{ message }}</p>
    </section>

    <section v-if="resultText" class="section">
      <label class="section-label">{{ t('convert.result') }}</label>
      <pre class="result-text">{{ resultText.slice(0, 5000) }}{{ resultText.length > 5000 ? '...' : '' }}</pre>
    </section>

    <section v-if="resultImages.length" class="section">
      <label class="section-label">{{ t('convert.result') }} ({{ resultImages.length }} pages)</label>
      <div class="image-results">
        <div v-for="(img, idx) in resultImages" :key="idx" class="image-result-item">
          <img :src="img" class="page-preview" />
          <button class="btn outline small" @click="downloadImage(img, idx)">{{ t('convert.download') }} #{{ idx + 1 }}</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.convert-tool { font-family: var(--font-sans); }
.tool-title { font-size: 1.3rem; color: var(--text); margin-bottom: 20px; background: linear-gradient(135deg, var(--text), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.section { margin-bottom: 20px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); transition: border-color 0.2s; }
.section:hover { border-color: rgba(108, 99, 255, 0.2); }
.section-label { display: block; font-size: 0.82rem; color: var(--text-dim); margin-bottom: 10px; font-weight: 500; }
.select { width: 100%; padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-size: 0.85rem; }
.select:focus { outline: none; border-color: var(--primary); }
.small-select { width: auto; min-width: 80px; }
.drop-zone { border: 2px dashed var(--border); transition: border-color 0.2s, background 0.2s; }
.drop-zone.drag-over { border-color: var(--primary); background: rgba(108, 99, 255, 0.05); }
.drop-content { text-align: center; padding: 12px 0; }
.drop-text { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 10px; }
.upload-btn { display: inline-block; cursor: pointer; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.file-name { font-size: 0.82rem; color: var(--text); font-family: var(--font-mono); margin-bottom: 8px; }
.options-grid { display: flex; flex-wrap: wrap; gap: 16px; }
.option-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.small-label { font-size: 0.78rem; color: var(--text-dim); white-space: nowrap; }
.radio-option { display: inline-flex; align-items: center; gap: 4px; font-size: 0.78rem; color: var(--text); cursor: pointer; margin-right: 12px; }
.radio-option input { accent-color: var(--primary); }
.small-input { width: 160px; padding: 6px 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-size: 0.82rem; }
.small-input:focus { outline: none; border-color: var(--primary); }
.action-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn { padding: 8px 16px; border-radius: var(--radius); font-size: 0.82rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.outline { background: transparent; color: var(--text); border-color: var(--border); }
.btn.outline:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.btn.primary:hover:not(:disabled) { filter: brightness(1.1); box-shadow: var(--glow-primary); }
.btn:active { transform: scale(0.97); }
.btn.small { padding: 4px 10px; font-size: 0.75rem; }
.message { margin-top: 10px; font-size: 0.82rem; }
.message.error { color: var(--red); }
.result-text { max-height: 300px; overflow: auto; padding: 12px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font-mono); font-size: 0.8rem; color: var(--text); white-space: pre-wrap; word-break: break-all; }
.image-results { display: flex; flex-direction: column; gap: 16px; }
.image-result-item { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.page-preview { max-width: 100%; max-height: 400px; border: 1px solid var(--border); border-radius: var(--radius); }
@media (max-width: 600px) { .action-row { flex-direction: column; } .options-grid { flex-direction: column; } }
</style>
