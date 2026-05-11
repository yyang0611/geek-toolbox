<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const text = ref('Hello, World!\n\nThis is a text card.')
const theme = ref<'dark' | 'light'>('dark')
const size = ref<'square' | 'portrait' | 'landscape'>('square')
const message = ref('')
const previewRef = ref<HTMLDivElement | null>(null)

const sizeMap = {
  square: { width: 1200, height: 1200 },
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1600, height: 900 }
}

const cardDimensions = computed(() => sizeMap[size.value])

const themeStyles = computed(() => {
  if (theme.value === 'dark') {
    return { bg: '#1a1a2e', text: '#e0e0e0', dot1: '#ff5f57', dot2: '#ffbd2e', dot3: '#28c840' }
  }
  return { bg: '#ffffff', text: '#333333', dot1: '#ff5f57', dot2: '#ffbd2e', dot3: '#28c840' }
})

function renderCard(): HTMLCanvasElement {
  const dim = cardDimensions.value
  const canvas = document.createElement('canvas')
  canvas.width = dim.width
  canvas.height = dim.height
  const ctx = canvas.getContext('2d')!
  const styles = themeStyles.value

  ctx.fillStyle = styles.bg
  ctx.fillRect(0, 0, dim.width, dim.height)

  // Title bar
  const barH = Math.round(dim.height * 0.04)
  ctx.fillStyle = styles.bg === '#1a1a2e' ? '#16213e' : '#f0f0f0'
  ctx.fillRect(0, 0, dim.width, barH)

  // Window dots
  const dotY = barH / 2
  const dotR = Math.round(dim.width * 0.005)
  const dotGap = dotR * 3.2
  ctx.fillStyle = styles.dot1
  ctx.beginPath(); ctx.arc(dotGap, dotY, dotR, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = styles.dot2
  ctx.beginPath(); ctx.arc(dotGap * 2, dotY, dotR, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = styles.dot3
  ctx.beginPath(); ctx.arc(dotGap * 3, dotY, dotR, 0, Math.PI * 2); ctx.fill()

  // Text with smart wrapping
  const padding = Math.round(dim.width * 0.04)
  const fontSize = Math.round(dim.width * 0.018)
  const lineHeight = fontSize * 1.6
  const maxTextWidth = dim.width - padding * 2
  const maxLines = Math.floor((dim.height - barH - padding * 2) / lineHeight)

  ctx.fillStyle = styles.text
  ctx.font = `${fontSize}px monospace`

  const rawLines = text.value.split('\n')
  const wrappedLines: string[] = []
  for (const line of rawLines) {
    if (!line) { wrappedLines.push(''); continue }
    let remaining = line
    while (remaining.length > 0) {
      if (ctx.measureText(remaining).width <= maxTextWidth) {
        wrappedLines.push(remaining); break
      }
      let breakIdx = remaining.length
      for (let i = remaining.length - 1; i > 0; i--) {
        if (ctx.measureText(remaining.slice(0, i)).width <= maxTextWidth) { breakIdx = i; break }
      }
      wrappedLines.push(remaining.slice(0, breakIdx))
      remaining = remaining.slice(breakIdx)
    }
    if (wrappedLines.length >= maxLines) break
  }

  const startY = barH + padding + fontSize
  for (let i = 0; i < Math.min(wrappedLines.length, maxLines); i++) {
    if (i === maxLines - 1 && wrappedLines.length > maxLines) {
      ctx.fillText(wrappedLines[i].slice(0, -1) + '…', padding, startY + i * lineHeight)
    } else {
      ctx.fillText(wrappedLines[i], padding, startY + i * lineHeight)
    }
  }

  return canvas
}

async function exportPng() {
  if (!text.value.trim()) { message.value = t('card.emptyInput'); return }
  const canvas = renderCard()
  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'card.png'
    a.click()
    URL.revokeObjectURL(a.href)
    message.value = t('card.exportSuccess')
  }, 'image/png')
}

async function copyImage() {
  if (!text.value.trim()) { message.value = t('card.emptyInput'); return }
  if (!navigator.clipboard?.write) { message.value = t('card.copyImageUnsupported'); return }
  const canvas = renderCard()
  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed')), 'image/png')
    })
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    message.value = t('card.copySuccess')
  } catch {
    message.value = t('card.copyFailed')
  }
}

function clearText() {
  text.value = ''
  message.value = ''
}

function copyText() {
  if (text.value) copy(text.value)
}
</script>

<template>
  <div class="card-tool">
    <h2 class="tool-title">{{ t('card.title') }}</h2>

    <!-- Input -->
    <section class="section">
      <label class="section-label">{{ t('card.inputLabel') }}</label>
      <textarea v-model="text" class="textarea" rows="6" :placeholder="t('card.placeholder')"></textarea>
    </section>

    <!-- Settings -->
    <section class="section">
      <label class="section-label">{{ t('card.settingsLabel') }}</label>
      <div class="settings-row">
        <div class="setting-item">
          <label>{{ t('card.themeLabel') }}</label>
          <select v-model="theme" class="select">
            <option value="dark">{{ t('card.themeDark') }}</option>
            <option value="light">{{ t('card.themeLight') }}</option>
          </select>
        </div>
        <div class="setting-item">
          <label>{{ t('card.sizeLabel') }}</label>
          <select v-model="size" class="select">
            <option value="square">{{ t('card.sizeSquare') }}</option>
            <option value="portrait">{{ t('card.sizePortrait') }}</option>
            <option value="landscape">{{ t('card.sizeLandscape') }}</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Preview -->
    <section class="section">
      <label class="section-label">{{ t('card.previewLabel') }}</label>
      <div class="preview-wrapper">
        <div
          ref="previewRef"
          class="card-preview"
          :style="{
            backgroundColor: themeStyles.bg,
            aspectRatio: `${cardDimensions.width}/${cardDimensions.height}`
          }"
        >
          <div class="card-titlebar" :style="{ backgroundColor: themeStyles.bg === '#1a1a2e' ? '#16213e' : '#f0f0f0' }">
            <span class="dot" :style="{ backgroundColor: themeStyles.dot1 }"></span>
            <span class="dot" :style="{ backgroundColor: themeStyles.dot2 }"></span>
            <span class="dot" :style="{ backgroundColor: themeStyles.dot3 }"></span>
          </div>
          <div class="card-content" :style="{ color: themeStyles.text }">
            <pre class="card-text">{{ text }}</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- Actions -->
    <section class="section">
      <div class="action-row">
        <button class="btn primary" @click="exportPng">{{ t('card.export') }}</button>
        <button class="btn outline" @click="copyImage">{{ t('card.copyImage') }}</button>
        <button class="btn outline" @click="copyText">{{ copied ? '✓' : t('card.copyTextBtn') }}</button>
        <button class="btn outline" @click="clearText">{{ t('card.clearBtn') }}</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
    </section>
  </div>
</template>

<style scoped>
.card-tool { font-family: var(--font-sans); }
.tool-title { font-size: 1.3rem; color: var(--text); margin-bottom: 20px; background: linear-gradient(135deg, var(--text), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.section {
  margin-bottom: 20px; padding: 16px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
}
.section-label { display: block; font-size: 0.82rem; color: var(--text-dim); margin-bottom: 10px; font-weight: 500; }
.textarea {
  width: 100%; padding: 12px; resize: vertical;
  background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
}
.textarea:focus { outline: none; border-color: var(--primary); }
.settings-row { display: flex; gap: 16px; flex-wrap: wrap; }
.setting-item { display: flex; flex-direction: column; gap: 4px; }
.setting-item label { font-size: 0.78rem; color: var(--text-dim); }
.select {
  padding: 6px 10px;
  background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text); font-size: 0.82rem;
}
.select:focus { outline: none; border-color: var(--primary); }
.preview-wrapper { display: flex; justify-content: center; }
.card-preview {
  width: 100%; max-width: 400px; border-radius: 12px; overflow: hidden;
  border: 1px solid var(--border); box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}
.card-titlebar {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px; height: 40px;
}
.dot { width: 12px; height: 12px; border-radius: 50%; }
.card-content { padding: 20px 24px; min-height: 100px; }
.card-text { font-family: var(--font-mono); font-size: 0.85rem; white-space: pre-wrap; word-break: break-word; margin: 0; }
.action-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn {
  padding: 8px 16px; border-radius: var(--radius); font-size: 0.82rem;
  cursor: pointer; border: 1px solid var(--border); transition: all 0.2s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.outline { background: transparent; color: var(--text); border-color: var(--border); }
.btn.outline:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.btn.primary:hover:not(:disabled) { filter: brightness(1.1); box-shadow: var(--glow-primary); }
.message { margin-top: 10px; font-size: 0.82rem; color: var(--primary); }
@media (max-width: 600px) { .settings-row { flex-direction: column; } .action-row { flex-direction: column; } }
</style>
