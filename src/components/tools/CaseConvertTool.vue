<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

type CaseFormat = 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant'

const input = ref('')
const targetFormat = ref<CaseFormat>('camel')

function splitWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function toCase(words: string[], format: CaseFormat): string {
  if (!words.length) return ''
  const lower = words.map(w => w.toLowerCase())
  switch (format) {
    case 'camel': return lower[0] + lower.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join('')
    case 'pascal': return lower.map(w => w[0].toUpperCase() + w.slice(1)).join('')
    case 'snake': return lower.join('_')
    case 'kebab': return lower.join('-')
    case 'constant': return lower.map(w => w.toUpperCase()).join('_')
  }
}

const output = computed(() => {
  if (!input.value.trim()) return ''
  return input.value.split('\n').map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    return toCase(splitWords(trimmed), targetFormat.value)
  }).join('\n')
})

function copyResult() { if (output.value) copy(output.value) }

const formats: CaseFormat[] = ['camel', 'pascal', 'snake', 'kebab', 'constant']
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('caseconvert.title') }}</h2>
    <textarea v-model="input" class="tool-input" :placeholder="t('caseconvert.inputPlaceholder')" rows="5"></textarea>
    <div class="format-row">
      <span class="format-label">{{ t('caseconvert.targetFormat') }}</span>
      <div class="format-btns">
        <button v-for="f in formats" :key="f" :class="['btn btn-sm', targetFormat === f && 'btn-primary']" @click="targetFormat = f">
          {{ t('caseconvert.formats.' + f) }}
        </button>
      </div>
    </div>
    <div v-if="output" class="result-box">
      <label class="result-label">{{ t('caseconvert.result') }}</label>
      <pre class="tool-output">{{ output }}</pre>
      <button class="btn btn-sm" @click="copyResult">{{ copied ? t('caseconvert.copied') : t('caseconvert.copy') }}</button>
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
.tool-input {
  width: 100%; padding: 14px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
  resize: vertical; box-sizing: border-box; transition: border-color 0.2s;
}
.tool-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(108,99,255,0.12); }
.format-row { margin: 14px 0; }
.format-label { font-size: 0.82rem; color: var(--text-dim); display: block; margin-bottom: 8px; }
.format-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
.result-box { margin-top: 14px; }
.result-label { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 6px; display: block; }
.tool-output {
  padding: 14px; border-radius: var(--radius); border: 1px solid rgba(108,99,255,0.2);
  background: rgba(108,99,255,0.04); color: var(--text); font-family: var(--font-mono);
  font-size: 0.82rem; white-space: pre-wrap; word-break: break-all;
}
</style>
