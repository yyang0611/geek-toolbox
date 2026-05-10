<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copy } = useClipboard()

interface CropRect { x: number; y: number; w: number; h: number }

interface ImageItem {
  id: string
  file: File
  originalSize: number
  thumbnail: string
  naturalWidth: number
  naturalHeight: number
  crop: CropRect | null
  useCustomCrop: boolean
  compressedBlob: Blob | null
  compressedSize: number
  compressedUrl: string
}

const images = ref<ImageItem[]>([])
const activeId = ref<string | null>(null)
const quality = ref(0.82)
const format = ref<'image/jpeg' | 'image/png'>('image/jpeg')
const outputWidth = ref<number | null>(null)
const outputHeight = ref<number | null>(null)
const processing = ref(false)
const message = ref('')
const dragOver = ref(false)

// Crop state
const cropCanvas = ref<HTMLCanvasElement | null>(null)
const isCropping = ref(false)
const cropStart = ref<{ x: number; y: number } | null>(null)
const currentCrop = ref<CropRect | null>(null)
const cropDragging = ref(false)
const sharedCrop = ref<CropRect | null>(null)

const activeImage = computed(() => images.value.find(img => img.id === activeId.value) || null)
const hasCompressed = computed(() => images.value.some(img => img.compressedBlob))

function addFiles(files: FileList | File[]) {
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
    const thumbnail = URL.createObjectURL(file)
    const img: ImageItem = {
      id, file, originalSize: file.size, thumbnail,
      naturalWidth: 0, naturalHeight: 0, crop: null,
      useCustomCrop: false,
      compressedBlob: null, compressedSize: 0, compressedUrl: ''
    }
    const imgEl = new Image()
    imgEl.onload = () => {
      img.naturalWidth = imgEl.naturalWidth
      img.naturalHeight = imgEl.naturalHeight
      if (activeId.value === id) updateDimensionDefaults()
    }
    imgEl.src = thumbnail
    images.value.push(img)
    if (!activeId.value) activeId.value = id
  }
}

function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(input.files)
  input.value = ''
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

function updateDimensionDefaults() {
  const item = activeImage.value
  if (!item) return
  const crop = currentCrop.value
  if (crop && crop.w > 0 && crop.h > 0) {
    outputWidth.value = Math.round(crop.w)
    outputHeight.value = Math.round(crop.h)
  } else {
    outputWidth.value = item.naturalWidth || null
    outputHeight.value = item.naturalHeight || null
  }
}

function selectImage(id: string) {
  activeId.value = id
  currentCrop.value = images.value.find(img => img.id === id)?.crop || null
  nextTick(() => {
    drawCropCanvas()
    updateDimensionDefaults()
  })
}

function removeImage(id: string) {
  const idx = images.value.findIndex(img => img.id === id)
  if (idx !== -1) {
    if (images.value[idx].compressedUrl) URL.revokeObjectURL(images.value[idx].compressedUrl)
    URL.revokeObjectURL(images.value[idx].thumbnail)
    images.value.splice(idx, 1)
    if (activeId.value === id) activeId.value = images.value[0]?.id || null
  }
}

// --- Crop Canvas ---
function drawCropCanvas() {
  const canvas = cropCanvas.value
  const item = activeImage.value
  if (!canvas || !item) return
  const img = new Image()
  img.onload = () => {
    const maxW = canvas.parentElement!.clientWidth - 2
    const scale = Math.min(maxW / img.naturalWidth, 400 / img.naturalHeight, 1)
    canvas.width = img.naturalWidth * scale
    canvas.height = img.naturalHeight * scale
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    if (currentCrop.value) drawCropOverlay(ctx, img, canvas.width, canvas.height, scale)
  }
  img.src = item.thumbnail
}

function drawCropOverlay(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number, scale: number) {
  const crop = currentCrop.value
  if (!crop) return
  const x = crop.x * scale, y = crop.y * scale, w = crop.w * scale, h = crop.h * scale

  ctx.save()
  ctx.fillStyle = 'rgba(10,10,24,0.58)'
  ctx.fillRect(0, 0, cw, ch)
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.clearRect(x, y, w, h)
  ctx.drawImage(img, 0, 0, cw, ch)
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = '#00d4aa'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)
  ctx.fillStyle = 'rgba(0, 212, 170, 0.18)'
  ctx.fillRect(x, y, w, h)

  ctx.setLineDash([6, 4])
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath()
  ctx.moveTo(x + w / 3, y); ctx.lineTo(x + w / 3, y + h)
  ctx.moveTo(x + (w * 2) / 3, y); ctx.lineTo(x + (w * 2) / 3, y + h)
  ctx.moveTo(x, y + h / 3); ctx.lineTo(x + w, y + h / 3)
  ctx.moveTo(x, y + (h * 2) / 3); ctx.lineTo(x + w, y + (h * 2) / 3)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x + w, y + h, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#6c63ff'
  ctx.stroke()
  ctx.restore()
}

function getCanvasScale(): number {
  const canvas = cropCanvas.value
  const item = activeImage.value
  if (!canvas || !item || !item.naturalWidth) return 1
  return canvas.width / item.naturalWidth
}

function canvasMouseDown(e: MouseEvent) {
  const canvas = cropCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scale = getCanvasScale()
  const x = (e.clientX - rect.left) / scale
  const y = (e.clientY - rect.top) / scale
  cropStart.value = { x, y }
  isCropping.value = true
  currentCrop.value = { x, y, w: 0, h: 0 }
}

function canvasMouseMove(e: MouseEvent) {
  if (!isCropping.value || !cropStart.value) return
  const canvas = cropCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const scale = getCanvasScale()
  const item = activeImage.value
  if (!item) return
  let x2 = Math.max(0, Math.min((e.clientX - rect.left) / scale, item.naturalWidth))
  let y2 = Math.max(0, Math.min((e.clientY - rect.top) / scale, item.naturalHeight))
  const sx = Math.min(cropStart.value.x, x2)
  const sy = Math.min(cropStart.value.y, y2)
  const sw = Math.abs(x2 - cropStart.value.x)
  const sh = Math.abs(y2 - cropStart.value.y)
  currentCrop.value = { x: sx, y: sy, w: sw, h: sh }
  drawCropCanvas()
}

function canvasMouseUp() {
  isCropping.value = false
  if (currentCrop.value && currentCrop.value.w < 5 && currentCrop.value.h < 5) {
    currentCrop.value = null
  }
  if (activeImage.value) {
    activeImage.value.crop = currentCrop.value
    if (!activeImage.value.useCustomCrop) {
      sharedCrop.value = currentCrop.value
      for (const img of images.value) {
        if (img.id !== activeImage.value.id && !img.useCustomCrop) {
          img.crop = sharedCrop.value ? adaptCrop(sharedCrop.value, img) : null
        }
      }
    }
  }
  updateDimensionDefaults()
  drawCropCanvas()
}

function resetCrop() {
  currentCrop.value = null
  if (activeImage.value) activeImage.value.crop = null
  drawCropCanvas()
}

function toggleCropMode(item: ImageItem) {
  item.useCustomCrop = !item.useCustomCrop
  if (!item.useCustomCrop) {
    item.crop = sharedCrop.value ? adaptCrop(sharedCrop.value, item) : null
  }
  currentCrop.value = item.crop
  drawCropCanvas()
}

function adaptCrop(crop: CropRect, item: ImageItem): CropRect {
  const refItem = images.value.find(i => !i.useCustomCrop && i.crop && i.id !== item.id)
  if (!refItem || !refItem.naturalWidth) return { ...crop }
  const scaleX = item.naturalWidth / refItem.naturalWidth
  const scaleY = item.naturalHeight / refItem.naturalHeight
  return {
    x: Math.round(crop.x * scaleX),
    y: Math.round(crop.y * scaleY),
    w: Math.round(crop.w * scaleX),
    h: Math.round(crop.h * scaleY)
  }
}

// --- Compression ---
function compressImage(item: ImageItem): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const crop = item.crop
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
      if (crop && crop.w > 0 && crop.h > 0) {
        sx = crop.x; sy = crop.y; sw = crop.w; sh = crop.h
      }
      let dw = outputWidth.value || sw
      let dh = outputHeight.value || sh
      if (outputWidth.value && !outputHeight.value) dh = Math.round(sh * (outputWidth.value / sw))
      else if (outputHeight.value && !outputWidth.value) dw = Math.round(sw * (outputHeight.value / sh))

      const canvas = document.createElement('canvas')
      canvas.width = dw; canvas.height = dh
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh)
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return }
          if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
          item.compressedBlob = blob
          item.compressedSize = blob.size
          item.compressedUrl = URL.createObjectURL(blob)
          resolve()
        },
        format.value,
        format.value === 'image/jpeg' ? quality.value : undefined
      )
    }
    img.onerror = () => reject(new Error('Failed to load'))
    img.src = item.thumbnail
  })
}

// --- Preview ---
const previewUrl = ref('')
const previewMeta = ref('')

async function generatePreview() {
  const item = activeImage.value
  if (!item) return
  processing.value = true
  try {
    await compressImage(item)
    if (item.compressedUrl) {
      previewUrl.value = item.compressedUrl
      const ratio = Math.round((1 - item.compressedSize / item.originalSize) * 100)
      previewMeta.value = `${outputWidth.value || item.naturalWidth} × ${outputHeight.value || item.naturalHeight}px · ${formatSize(item.compressedSize)} · -${ratio}%`
    }
    message.value = t('image.compressDone')
  } catch (e: any) {
    message.value = e.message || t('image.compressError')
  } finally {
    processing.value = false
  }
}

// --- Actions ---
async function compressAll() {
  if (images.value.length === 0) return
  processing.value = true
  message.value = ''
  try {
    for (const item of images.value) await compressImage(item)
    message.value = t('image.compressDone')
  } catch (e: any) {
    message.value = e.message || t('image.compressError')
  } finally {
    processing.value = false
  }
}

function downloadOne(item: ImageItem) {
  if (!item.compressedBlob) return
  const ext = format.value === 'image/jpeg' ? 'jpg' : 'png'
  const name = item.file.name.replace(/\.[^.]+$/, '') + `_compressed.${ext}`
  const a = document.createElement('a')
  a.href = item.compressedUrl
  a.download = name
  a.click()
}

async function downloadAllZip() {
  const compressed = images.value.filter(img => img.compressedBlob)
  if (compressed.length === 0) return
  if (compressed.length === 1) { downloadOne(compressed[0]); return }

  // Simple ZIP implementation (store method, no compression - images are already compressed)
  const files: { name: string; data: Uint8Array }[] = []
  for (const item of compressed) {
    const ext = format.value === 'image/jpeg' ? 'jpg' : 'png'
    const name = item.file.name.replace(/\.[^.]+$/, '') + `_compressed.${ext}`
    const data = new Uint8Array(await item.compressedBlob!.arrayBuffer())
    files.push({ name, data })
  }
  const zipBlob = createZip(files)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(zipBlob)
  a.download = 'compressed_images.zip'
  a.click()
  URL.revokeObjectURL(a.href)
}

function createZip(files: { name: string; data: Uint8Array }[]): Blob {
  const parts: Uint8Array[] = []
  const centralDir: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name)
    // Local file header
    const header = new Uint8Array(30 + nameBytes.length)
    const hv = new DataView(header.buffer)
    hv.setUint32(0, 0x04034b50, true) // signature
    hv.setUint16(4, 20, true) // version
    hv.setUint16(8, 0, true) // method: store
    hv.setUint32(18, file.data.length, true) // compressed size
    hv.setUint32(22, file.data.length, true) // uncompressed size
    hv.setUint16(26, nameBytes.length, true) // name length
    header.set(nameBytes, 30)
    parts.push(header, file.data)

    // Central directory entry
    const cd = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(cd.buffer)
    cv.setUint32(0, 0x02014b50, true)
    cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true)
    cv.setUint32(20, file.data.length, true)
    cv.setUint32(24, file.data.length, true)
    cv.setUint16(28, nameBytes.length, true)
    cv.setUint32(42, offset, true) // local header offset
    cd.set(nameBytes, 46)
    centralDir.push(cd)
    offset += header.length + file.data.length
  }
  const cdOffset = offset
  let cdSize = 0
  for (const cd of centralDir) { parts.push(cd); cdSize += cd.length }
  // End of central directory
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

function clearAll() {
  for (const item of images.value) {
    if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
    URL.revokeObjectURL(item.thumbnail)
  }
  images.value = []
  activeId.value = null
  currentCrop.value = null
  message.value = ''
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

onUnmounted(() => {
  for (const item of images.value) {
    if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
    URL.revokeObjectURL(item.thumbnail)
  }
})
</script>

<template>
  <div class="image-tool">
    <h2 class="tool-title">{{ t('image.title') }}</h2>

    <!-- Drop zone -->
    <section class="section drop-zone" :class="{ 'drag-over': dragOver }"
             @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="handleDrop">
      <div class="drop-content">
        <p class="drop-text">{{ t('image.dropHint') }}</p>
        <label class="btn primary upload-btn">
          {{ t('image.selectButton') }}
          <input type="file" accept="image/*" multiple hidden @change="handleFileInput" />
        </label>
      </div>
    </section>

    <!-- Image queue -->
    <section v-if="images.length" class="section">
      <label class="section-label">{{ t('image.queue') }} ({{ images.length }})</label>
      <div class="thumb-grid">
        <div v-for="img in images" :key="img.id" class="thumb-item"
             :class="{ active: img.id === activeId }" @click="selectImage(img.id)">
          <img :src="img.thumbnail" class="thumb-img" />
          <button class="thumb-remove" @click.stop="removeImage(img.id)">&times;</button>
          <span class="crop-badge">{{ img.useCustomCrop ? t('image.queueBadgeCustom') : t('image.queueBadgeShared') }}</span>
          <span class="thumb-size">{{ formatSize(img.originalSize) }}</span>
        </div>
      </div>
    </section>

    <!-- Crop editor -->
    <section v-if="activeImage" class="section">
      <label class="section-label">{{ t('image.cropLabel') }}</label>
      <div class="crop-container">
        <canvas ref="cropCanvas" class="crop-canvas"
                @mousedown="canvasMouseDown" @mousemove="canvasMouseMove" @mouseup="canvasMouseUp"
                @mouseleave="canvasMouseUp"
                @touchstart.prevent="canvasMouseDown($event.touches[0] as any)"
                @touchmove.prevent="canvasMouseMove($event.touches[0] as any)"
                @touchend.prevent="canvasMouseUp" />
      </div>
      <div class="crop-info">
        <span v-if="activeImage.crop">
          {{ Math.round(activeImage.crop.w) }} × {{ Math.round(activeImage.crop.h) }}px
          ({{ Math.round(activeImage.crop.x) }}, {{ Math.round(activeImage.crop.y) }})
        </span>
        <span v-else class="hint">{{ t('image.cropHint') }}</span>
        <button v-if="activeImage.crop" class="btn outline small" @click="resetCrop">{{ t('image.resetCrop') }}</button>
      </div>
      <label class="crop-mode-toggle">
        <input type="checkbox" :checked="activeImage.useCustomCrop"
               @change="toggleCropMode(activeImage)" />
        <span>{{ t('image.customCropToggle') }}</span>
      </label>
    </section>

    <!-- Settings -->
    <section class="section">
      <label class="section-label">{{ t('image.settings') }}</label>
      <div class="settings-grid">
        <div class="setting-item">
          <label>{{ t('image.quality') }}: {{ Math.round(quality * 100) }}%</label>
          <input type="range" min="0.1" max="1" step="0.01" v-model.number="quality" class="slider" />
        </div>
        <div class="setting-item">
          <label>{{ t('image.format') }}</label>
          <select v-model="format" class="select">
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
          </select>
        </div>
        <div class="setting-item">
          <label>{{ t('image.width') }}</label>
          <input type="number" v-model.number="outputWidth" class="input" :placeholder="t('image.auto')" />
        </div>
        <div class="setting-item">
          <label>{{ t('image.height') }}</label>
          <input type="number" v-model.number="outputHeight" class="input" :placeholder="t('image.auto')" />
        </div>
      </div>
    </section>

    <!-- Actions -->
    <section class="section">
      <div class="action-row">
        <button class="btn primary" :disabled="!activeImage || processing" @click="generatePreview">
          {{ processing ? t('image.processing') : t('image.generatePreview') }}
        </button>
        <button class="btn outline" :disabled="!activeImage?.compressedBlob" @click="activeImage && downloadOne(activeImage)">
          {{ t('image.downloadCurrent') }}
        </button>
        <button class="btn primary" :disabled="!images.length || processing" @click="compressAll">
          {{ t('image.compress') }}
        </button>
        <button class="btn outline" :disabled="!hasCompressed" @click="downloadAllZip">
          {{ t('image.downloadAll') }}
        </button>
        <button class="btn outline" @click="clearAll">{{ t('image.clear') }}</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </section>

    <!-- Preview -->
    <section v-if="previewUrl || activeImage" class="section">
      <label class="section-label">{{ t('image.preview') }}</label>
      <div class="preview-area">
        <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
        <div v-else class="preview-empty">{{ t('image.previewHint') }}</div>
      </div>
      <p v-if="previewMeta" class="preview-meta">{{ previewMeta }}</p>
    </section>

    <!-- Results -->
    <section v-if="hasCompressed" class="section">
      <label class="section-label">{{ t('image.results') }}</label>
      <div class="result-list">
        <div v-for="img in images.filter(i => i.compressedBlob)" :key="img.id" class="result-item">
          <img :src="img.compressedUrl" class="result-preview" />
          <div class="result-info">
            <span class="result-name">{{ img.file.name }}</span>
            <span class="size-compare">
              {{ formatSize(img.originalSize) }} → {{ formatSize(img.compressedSize) }}
              <span class="savings">-{{ Math.round((1 - img.compressedSize / img.originalSize) * 100) }}%</span>
            </span>
          </div>
          <button class="btn outline small" @click="downloadOne(img)">{{ t('image.download') }}</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.image-tool { font-family: var(--font-sans); }
.tool-title { font-size: 1.3rem; color: var(--text); margin-bottom: 20px; }
.section { margin-bottom: 20px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
.section-label { display: block; font-size: 0.82rem; color: var(--text-dim); margin-bottom: 10px; font-weight: 500; }
.drop-zone { border: 2px dashed var(--border); text-align: center; padding: 32px 16px; transition: border-color 0.2s, background 0.2s; }
.drop-zone.drag-over { border-color: var(--primary); background: rgba(108, 99, 255, 0.05); }
.drop-text { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 12px; }
.upload-btn { display: inline-block; cursor: pointer; }
.thumb-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.thumb-item { position: relative; width: 72px; height: 72px; border-radius: var(--radius); overflow: hidden; border: 2px solid var(--border); cursor: pointer; transition: border-color 0.15s; }
.thumb-item.active { border-color: var(--primary); }
.thumb-item:hover { border-color: var(--primary); }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-remove { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; background: var(--red); color: #fff; border: none; border-radius: 50%; font-size: 12px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.thumb-size { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: #fff; font-size: 0.58rem; text-align: center; padding: 1px; }
.crop-container { overflow: hidden; border-radius: var(--radius); border: 1px solid var(--border); background: #000; }
.crop-canvas { display: block; max-width: 100%; cursor: crosshair; }
.crop-info { display: flex; align-items: center; gap: 10px; margin-top: 8px; font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-dim); }
.crop-info .hint { font-family: var(--font-sans); }
.crop-badge { position: absolute; top: 2px; left: 2px; font-size: 0.55rem; background: rgba(0,0,0,0.7); color: #fff; padding: 1px 3px; border-radius: 3px; }
.crop-mode-toggle { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 0.78rem; color: var(--text-dim); cursor: pointer; }
.crop-mode-toggle input { accent-color: var(--primary); }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.setting-item label { display: block; font-size: 0.78rem; color: var(--text-dim); margin-bottom: 4px; }
.slider { width: 100%; accent-color: var(--primary); }
.select, .input { width: 100%; padding: 6px 10px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-size: 0.82rem; }
.select:focus, .input:focus { outline: none; border-color: var(--primary); }
.action-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn { padding: 8px 16px; border-radius: var(--radius); font-size: 0.82rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }
.btn.small { padding: 4px 10px; font-size: 0.75rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.outline { background: transparent; color: var(--text); border-color: var(--border); }
.btn.outline:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.btn.primary:hover:not(:disabled) { opacity: 0.85; }
.message { margin-top: 10px; font-size: 0.82rem; color: var(--primary); }
.result-list { display: flex; flex-direction: column; gap: 10px; }
.result-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--surface2); border-radius: var(--radius); }
.result-preview { width: 56px; height: 56px; object-fit: cover; border-radius: 4px; }
.result-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.result-name { font-size: 0.8rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
.size-compare { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-dim); }
.savings { color: var(--accent); font-weight: 600; }
.preview-area { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--surface2); min-height: 120px; display: flex; align-items: center; justify-content: center; }
.preview-img { width: 100%; height: auto; max-height: 500px; object-fit: contain; display: block; }
.preview-empty { font-size: 0.82rem; color: var(--text-dim); padding: 32px; text-align: center; }
.preview-meta { margin-top: 8px; font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-dim); }
@media (max-width: 600px) { .settings-grid { grid-template-columns: 1fr; } .action-row { flex-direction: column; } }
</style>

