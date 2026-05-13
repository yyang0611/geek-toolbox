<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

type Mode = 'text' | 'file'
type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'

const mode = ref<Mode>('text')
const algorithm = ref<Algorithm>('SHA-256')
const input = ref('')
const result = ref('')
const uppercase = ref(false)
const computing = ref(false)
const fileName = ref('')
const fileSize = ref('')
const fileBuffer = ref<ArrayBuffer | null>(null)

async function hashBuffer(data: ArrayBuffer, algo: Algorithm): Promise<string> {
  const buffer = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1048576).toFixed(1)} MB`
}

async function computeFromText() {
  if (!input.value) { result.value = ''; return }
  computing.value = true
  try {
    const data = new TextEncoder().encode(input.value)
    result.value = await hashBuffer(data, algorithm.value)
    if (uppercase.value) result.value = result.value.toUpperCase()
  } finally { computing.value = false }
}

async function computeFromFile() {
  if (!fileBuffer.value) return
  computing.value = true
  try {
    result.value = await hashBuffer(fileBuffer.value, algorithm.value)
    if (uppercase.value) result.value = result.value.toUpperCase()
  } finally { computing.value = false }
}

async function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  fileName.value = file.name
  fileSize.value = formatSize(file.size)
  fileBuffer.value = await file.arrayBuffer()
  computeFromFile()
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (!file) return
  fileName.value = file.name
  fileSize.value = formatSize(file.size)
  file.arrayBuffer().then(buffer => {
    fileBuffer.value = buffer
    computeFromFile()
  })
}

watch([algorithm, uppercase], () => {
  if (mode.value === 'text' && input.value) computeFromText()
  else if (mode.value === 'file' && fileBuffer.value) computeFromFile()
})

watch(input, () => { if (mode.value === 'text') computeFromText() })

function copyResult() { if (result.value) copy(result.value) }
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('hash.title') }}</h2>
    <div class="options-row">
      <div class="mode-switch">
        <button :class="['btn btn-sm', mode === 'text' && 'btn-primary']" @click="mode = 'text'; result = ''; fileName = ''; fileBuffer = null">{{ t('hash.modeText') }}</button>
        <button :class="['btn btn-sm', mode === 'file' && 'btn-primary']" @click="mode = 'file'; result = ''; input = ''">{{ t('hash.modeFile') }}</button>
      </div>
      <label class="option-item">
        {{ t('hash.algorithm') }}
        <select v-model="algorithm" class="select-input">
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </label>
      <label class="option-item toggle">
        <input type="checkbox" v-model="uppercase" />
        {{ t('hash.uppercase') }}
      </label>
    </div>
    <textarea v-if="mode === 'text'" v-model="input" class="tool-input" :placeholder="t('hash.inputPlaceholder')" rows="5"></textarea>
    <div v-else class="drop-zone" @drop="handleDrop" @dragover.prevent @click="($refs.fileInput as HTMLInputElement)?.click()">
      <p class="drop-text">{{ t('hash.dropHint') }}</p>
      <button class="btn btn-sm" @click.stop="($refs.fileInput as HTMLInputElement)?.click()">{{ t('hash.selectFile') }}</button>
      <input ref="fileInput" type="file" @change="handleFile" class="file-input-hidden" />
      <p v-if="fileName" class="file-meta">{{ t('hash.fileMeta', { name: fileName, size: fileSize }) }}</p>
    </div>
    <div v-if="computing" class="computing">{{ t('hash.computing') }}</div>
    <div v-if="result && !computing" class="result-box">
      <label class="result-label">{{ t('hash.result') }}</label>
      <pre class="tool-output">{{ result }}</pre>
      <button class="btn btn-sm" @click="copyResult">{{ copied ? t('hash.copied') : t('hash.copy') }}</button>
    </div>
  </div>
</template>

<style scoped>
.tool-container { max-width: 800px; margin: 0 auto; }
.tool-title {
  font-size: 1.3rem; font-weight: 600; margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.options-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.mode-switch { display: flex; gap: 4px; }
.option-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text); }
.option-item.toggle { cursor: pointer; }
.select-input {
  padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.82rem;
}
.tool-input {
  width: 100%; padding: 14px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
  resize: vertical; box-sizing: border-box; transition: border-color 0.2s;
}
.tool-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(108,99,255,0.12); }
.drop-zone {
  padding: 40px 20px; border: 2px dashed var(--border); border-radius: var(--radius);
  text-align: center; color: var(--text-dim); transition: border-color 0.2s; cursor: pointer;
}
.drop-zone:hover { border-color: var(--primary); }
.drop-text { margin-bottom: 12px; }
.file-input-hidden { display: none; }
.file-meta { margin-top: 12px; font-size: 0.82rem; color: var(--text); }
.computing { margin-top: 12px; color: var(--text-dim); font-size: 0.82rem; }
.result-box { margin-top: 14px; }
.result-label { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 6px; display: block; }
.tool-output {
  padding: 14px; border-radius: var(--radius); border: 1px solid rgba(108,99,255,0.2);
  background: rgba(108,99,255,0.04); color: var(--text); font-family: var(--font-mono);
  font-size: 0.82rem; white-space: pre-wrap; word-break: break-all;
}
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
</style>
