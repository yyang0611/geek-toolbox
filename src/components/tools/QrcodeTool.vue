<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'

const { t } = useI18n()

const input = ref('')
const size = ref(256)
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasContent = ref(false)

async function generate() {
  if (!input.value.trim() || !canvasRef.value) {
    hasContent.value = false
    return
  }
  await QRCode.toCanvas(canvasRef.value, input.value, {
    width: size.value,
    errorCorrectionLevel: errorLevel.value,
    margin: 2,
    color: { dark: '#e0e0f0', light: '#1a1a2e' }
  })
  hasContent.value = true
}

watch([input, size, errorLevel], () => { nextTick(generate) })

function download() {
  if (!canvasRef.value || !hasContent.value) return
  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('qrcode.title') }}</h2>
    <textarea v-model="input" class="tool-input" :placeholder="t('qrcode.inputPlaceholder')" rows="4"></textarea>
    <div class="options-row">
      <label class="option-item">
        {{ t('qrcode.size') }}
        <input type="range" v-model.number="size" min="128" max="512" step="32" class="slider" />
        <span class="size-val">{{ size }}px</span>
      </label>
      <label class="option-item">
        {{ t('qrcode.errorLevel') }}
        <select v-model="errorLevel" class="select-input">
          <option value="L">{{ t('qrcode.levels.L') }}</option>
          <option value="M">{{ t('qrcode.levels.M') }}</option>
          <option value="Q">{{ t('qrcode.levels.Q') }}</option>
          <option value="H">{{ t('qrcode.levels.H') }}</option>
        </select>
      </label>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
      <p v-if="!hasContent" class="empty-hint">{{ t('qrcode.emptyInput') }}</p>
    </div>
    <button v-if="hasContent" class="btn btn-primary" @click="download">{{ t('qrcode.download') }}</button>
  </div>
</template>

<style scoped>
.tool-container { max-width: 800px; margin: 0 auto; }
.tool-title {
  font-size: 1.3rem; font-weight: 600; margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tool-input {
  width: 100%; padding: 14px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
  resize: vertical; box-sizing: border-box; transition: border-color 0.2s;
}
.tool-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(108,99,255,0.12); }
.options-row { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin: 14px 0; }
.option-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text); }
.slider { width: 120px; accent-color: var(--primary); }
.size-val { font-size: 0.75rem; color: var(--text-dim); min-width: 45px; }
.select-input {
  padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.82rem;
}
.canvas-wrap {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); margin-bottom: 14px; min-height: 180px;
}
.empty-hint { color: var(--text-dim); font-size: 0.82rem; }
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
</style>
