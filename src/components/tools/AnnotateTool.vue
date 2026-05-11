<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

type Tool = 'select' | 'arrow' | 'rect' | 'text' | 'number' | 'mosaic'

interface Shape {
  type: Tool
  x1: number; y1: number; x2: number; y2: number
  color: string; lineWidth: number; fontSize: number
  text?: string; number?: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentTool = ref<Tool>('select')
const color = ref('#ff4444')
const lineWidth = ref(3)
const fontSize = ref(18)
const message = ref('')
const imageLoaded = ref(false)
const numberCounter = ref(1)
const textInputVisible = ref(false)
const textInputValue = ref('')
const textInputPos = ref({ x: 0, y: 0 })
const textInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const dragDepth = ref(0)

let baseImage: HTMLImageElement | null = null
let shapes: Shape[] = []
let draftShape: Shape | null = null
let isDrawing = false
let startX = 0
let startY = 0
let undoStack: Shape[][] = []
let redoStack: Shape[][] = []

const MAX_DIMENSION = 4000

function getScale(): number {
  if (!canvasRef.value || !baseImage) return 1
  return canvasRef.value.width / canvasRef.value.getBoundingClientRect().width
}

function getPos(e: MouseEvent | Touch): { x: number; y: number } {
  const rect = canvasRef.value!.getBoundingClientRect()
  const scale = getScale()
  return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale }
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.[0]) return
  loadImageFile(input.files[0])
  input.value = ''
}

function triggerFileInput() {
  fileInputRef.value?.click()
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
  if (e.dataTransfer?.files?.[0]) loadImageFile(e.dataTransfer.files[0])
}

function loadImageFile(file: File) {
  if (!file.type.startsWith('image/')) { message.value = t('annotate.invalidFormat'); return }
  const img = new Image()
  img.onload = () => {
    if (img.naturalWidth > MAX_DIMENSION || img.naturalHeight > MAX_DIMENSION) {
      message.value = t('annotate.imageTooLargeReject')
      URL.revokeObjectURL(img.src)
      return
    }
    baseImage = img
    if (!canvasRef.value) return
    canvasRef.value.width = img.naturalWidth
    canvasRef.value.height = img.naturalHeight
    shapes = []
    undoStack = []
    redoStack = []
    numberCounter.value = 1
    imageLoaded.value = true
    message.value = ''
    redraw()
    URL.revokeObjectURL(img.src)
  }
  img.src = URL.createObjectURL(file)
}

function saveUndo() {
  undoStack.push(JSON.parse(JSON.stringify(shapes)))
  redoStack = []
  if (undoStack.length > 50) undoStack.shift()
}

function undo() {
  if (undoStack.length === 0) return
  redoStack.push(JSON.parse(JSON.stringify(shapes)))
  shapes = undoStack.pop()!
  redraw()
}

function redo() {
  if (redoStack.length === 0) return
  undoStack.push(JSON.parse(JSON.stringify(shapes)))
  shapes = redoStack.pop()!
  redraw()
}

function redraw() {
  const canvas = canvasRef.value
  if (!canvas || !baseImage) return
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(baseImage, 0, 0)
  for (const shape of shapes) drawShape(ctx, shape)
  if (draftShape) drawShape(ctx, draftShape)
}

function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
  ctx.save()
  ctx.strokeStyle = s.color
  ctx.fillStyle = s.color
  ctx.lineWidth = s.lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (s.type) {
    case 'arrow': {
      const angle = Math.atan2(s.y2 - s.y1, s.x2 - s.x1)
      const headLen = Math.max(15, s.lineWidth * 5)
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(s.x2, s.y2)
      ctx.lineTo(s.x2 - headLen * Math.cos(angle - Math.PI / 7), s.y2 - headLen * Math.sin(angle - Math.PI / 7))
      ctx.lineTo(s.x2 - headLen * Math.cos(angle + Math.PI / 7), s.y2 - headLen * Math.sin(angle + Math.PI / 7))
      ctx.closePath(); ctx.fill()
      break
    }
    case 'rect':
      ctx.strokeRect(Math.min(s.x1, s.x2), Math.min(s.y1, s.y2), Math.abs(s.x2 - s.x1), Math.abs(s.y2 - s.y1))
      break
    case 'text':
      if (s.text) {
        ctx.font = `${s.fontSize}px sans-serif`
        ctx.fillText(s.text, s.x1, s.y1)
      }
      break
    case 'number': {
      const r = s.fontSize
      ctx.beginPath(); ctx.arc(s.x1, s.y1, r, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${r}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(String(s.number || 1), s.x1, s.y1)
      break
    }
    case 'mosaic': {
      const canvas2 = canvasRef.value!
      const sx = Math.max(0, Math.min(s.x1, s.x2))
      const sy = Math.max(0, Math.min(s.y1, s.y2))
      const sw = Math.min(Math.abs(s.x2 - s.x1), canvas2.width - sx)
      const sh = Math.min(Math.abs(s.y2 - s.y1), canvas2.height - sy)
      if (sw < 2 || sh < 2) break
      const blockSize = Math.max(8, Math.round(Math.min(sw, sh) / 12))
      if (baseImage) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = baseImage.naturalWidth; tempCanvas.height = baseImage.naturalHeight
        const tCtx = tempCanvas.getContext('2d')!
        tCtx.drawImage(baseImage, 0, 0)
        const imgData = tCtx.getImageData(sx, sy, sw, sh)
        for (let y = 0; y < sh; y += blockSize) {
          for (let x = 0; x < sw; x += blockSize) {
            const idx = (y * sw + x) * 4
            ctx.fillStyle = `rgb(${imgData.data[idx]},${imgData.data[idx + 1]},${imgData.data[idx + 2]})`
            ctx.fillRect(sx + x, sy + y, blockSize, blockSize)
          }
        }
      }
      break
    }
  }
  ctx.restore()
}

// --- Pointer events ---
function onPointerDown(e: PointerEvent) {
  if (!canvasRef.value || !imageLoaded.value) return
  if (currentTool.value === 'select') return
  canvasRef.value.setPointerCapture(e.pointerId)
  const pos = getPos(e)
  startX = pos.x; startY = pos.y

  if (currentTool.value === 'text') {
    const rect = canvasRef.value.getBoundingClientRect()
    textInputPos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    textInputVisible.value = true
    textInputValue.value = ''
    nextTick(() => textInputRef.value?.focus())
    return
  }

  if (currentTool.value === 'number') {
    saveUndo()
    shapes.push({ type: 'number', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, color: color.value, lineWidth: lineWidth.value, fontSize: fontSize.value, number: numberCounter.value })
    numberCounter.value++
    redraw()
    return
  }

  isDrawing = true
  draftShape = { type: currentTool.value, x1: startX, y1: startY, x2: startX, y2: startY, color: color.value, lineWidth: lineWidth.value, fontSize: fontSize.value }
}

function onPointerMove(e: PointerEvent) {
  if (!isDrawing || !draftShape) return
  const pos = getPos(e)
  draftShape.x2 = pos.x; draftShape.y2 = pos.y
  redraw()
}

function onPointerUp(e: PointerEvent) {
  if (!isDrawing || !draftShape) return
  isDrawing = false
  const pos = getPos(e)
  draftShape.x2 = pos.x; draftShape.y2 = pos.y
  if (Math.abs(draftShape.x2 - draftShape.x1) > 3 || Math.abs(draftShape.y2 - draftShape.y1) > 3) {
    saveUndo()
    shapes.push(draftShape)
  }
  draftShape = null
  redraw()
}

function commitText() {
  if (textInputValue.value.trim()) {
    saveUndo()
    const scale = getScale()
    const x = textInputPos.value.x * scale
    const y = textInputPos.value.y * scale
    shapes.push({ type: 'text', x1: x, y1: y, x2: x, y2: y, color: color.value, lineWidth: lineWidth.value, fontSize: fontSize.value, text: textInputValue.value })
    redraw()
  }
  textInputVisible.value = false
  textInputValue.value = ''
}

function clearAll() {
  if (shapes.length > 0) saveUndo()
  shapes = []
  numberCounter.value = 1
  redraw()
}

function exportPng() {
  if (!canvasRef.value) return
  canvasRef.value.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'annotated.png'
    a.click()
    URL.revokeObjectURL(a.href)
    message.value = t('annotate.exportSuccess')
  }, 'image/png')
}

const tools: { key: Tool; label: string }[] = [
  { key: 'select', label: 'annotate.tools.select' },
  { key: 'arrow', label: 'annotate.tools.arrow' },
  { key: 'rect', label: 'annotate.tools.rect' },
  { key: 'text', label: 'annotate.tools.text' },
  { key: 'number', label: 'annotate.tools.number' },
  { key: 'mosaic', label: 'annotate.tools.mosaic' }
]

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
  const toolbar = e.currentTarget as HTMLElement
  const buttons = toolbar.querySelectorAll<HTMLButtonElement>('.tool-btn')
  buttons[nextIdx]?.focus()
}
</script>

<template>
  <div class="annotate-tool">
    <h2 class="tool-title">{{ t('annotate.title') }}</h2>

    <section class="section drop-zone" :class="{ 'drag-over': dragOver }"
             @dragenter="handleDragEnter" @dragover="handleDragOver"
             @dragleave="handleDragLeave" @drop="handleDrop">
      <label class="section-label">{{ t('annotate.upload') }}</label>
      <div class="drop-content">
        <p class="drop-text">{{ t('annotate.uploadHint') }}</p>
        <button type="button" class="btn primary upload-btn" @click="triggerFileInput">
          {{ t('annotate.uploadTitle') }}
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="sr-only"
          :aria-label="t('annotate.uploadInputAria')"
          @change="handleFileUpload"
        />
      </div>
    </section>

    <section v-if="imageLoaded" class="section toolbar-section">
      <div class="toolbar" @keydown="handleToolbarKeydown">
        <button v-for="(tool, idx) in tools" :key="tool.key" class="btn tool-btn"
                :class="{ active: currentTool === tool.key }"
                :tabindex="currentTool === tool.key ? 0 : -1"
                @click="currentTool = tool.key">
          {{ t(tool.label) }}
        </button>
      </div>
      <div class="settings-row">
        <label class="setting">
          <span>{{ t('annotate.color') }}</span>
          <input type="color" v-model="color" class="color-input" />
        </label>
        <label class="setting">
          <span>{{ t('annotate.lineWidth') }}: {{ lineWidth }}</span>
          <input type="range" min="1" max="10" v-model.number="lineWidth" class="slider" />
        </label>
        <label class="setting">
          <span>{{ t('annotate.fontSize') }}: {{ fontSize }}</span>
          <input type="range" min="10" max="48" v-model.number="fontSize" class="slider" />
        </label>
      </div>
    </section>

    <section class="section canvas-section">
      <div class="canvas-container">
        <canvas ref="canvasRef" class="draw-canvas"
                @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
                :style="{ touchAction: 'none', cursor: currentTool === 'select' ? 'default' : 'crosshair' }"></canvas>
        <input v-if="textInputVisible" ref="textInputRef" v-model="textInputValue"
               class="text-overlay-input"
               :style="{ left: textInputPos.x + 'px', top: textInputPos.y + 'px' }"
               @keyup.enter="commitText" @blur="commitText" />
        <p v-if="!imageLoaded" class="canvas-placeholder">{{ t('annotate.placeholder') }}</p>
      </div>
    </section>

    <section v-if="imageLoaded" class="section">
      <div class="action-row">
        <button class="btn outline" :disabled="undoStack.length === 0" @click="undo">{{ t('annotate.undo') }}</button>
        <button class="btn outline" :disabled="redoStack.length === 0" @click="redo">{{ t('annotate.redo') }}</button>
        <button class="btn outline" @click="clearAll">{{ t('annotate.clear') }}</button>
        <button class="btn primary" @click="exportPng">{{ t('annotate.export') }}</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </section>
  </div>
</template>

<style scoped>
.annotate-tool { font-family: var(--font-sans); }
.tool-title { font-size: 1.3rem; color: var(--text); margin-bottom: 20px; background: linear-gradient(135deg, var(--text), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.section { margin-bottom: 20px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); transition: border-color 0.2s; }
.section:hover { border-color: rgba(108, 99, 255, 0.2); }
.section-label { display: block; font-size: 0.82rem; color: var(--text-dim); margin-bottom: 10px; font-weight: 500; }
.drop-zone { border: 2px dashed var(--border); text-align: center; padding: 32px 16px; transition: border-color 0.2s, background 0.2s; }
.drop-zone.drag-over { border-color: var(--primary); background: rgba(108, 99, 255, 0.05); }
.drop-content { text-align: center; padding: 12px 0; }
.drop-text { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 12px; }
.upload-btn { display: inline-block; cursor: pointer; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.toolbar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.tool-btn { padding: 6px 12px; font-size: 0.78rem; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); cursor: pointer; }
.tool-btn.active { border-color: var(--primary); color: var(--primary); background: rgba(99,102,241,0.1); }
.settings-row { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
.setting { display: flex; flex-direction: column; gap: 4px; font-size: 0.78rem; color: var(--text-dim); }
.color-input { width: 32px; height: 24px; border: none; cursor: pointer; background: none; }
.slider { width: 100px; accent-color: var(--primary); }
.canvas-container { position: relative; min-height: 200px; background: var(--surface2); border-radius: var(--radius); overflow: hidden; }
.draw-canvas { display: block; max-width: 100%; cursor: crosshair; }
.canvas-placeholder { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-dim); font-size: 0.9rem; }
.text-overlay-input { position: absolute; background: rgba(0,0,0,0.7); color: #fff; border: 1px solid var(--primary); border-radius: 4px; padding: 4px 8px; font-size: 14px; min-width: 120px; outline: none; z-index: 10; }
.action-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn { padding: 8px 16px; border-radius: var(--radius); font-size: 0.82rem; cursor: pointer; border: 1px solid var(--border); transition: all 0.2s; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.outline { background: transparent; color: var(--text); border-color: var(--border); }
.btn.outline:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.btn.primary:hover:not(:disabled) { filter: brightness(1.1); box-shadow: var(--glow-primary); }
.btn:active { transform: scale(0.97); }
.message { margin-top: 10px; font-size: 0.82rem; color: var(--primary); }
@media (max-width: 600px) { .settings-row { flex-direction: column; align-items: flex-start; } .action-row { flex-direction: column; } }
</style>
