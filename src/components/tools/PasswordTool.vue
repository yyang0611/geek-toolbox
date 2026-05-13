<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const length = ref(16)
const useUppercase = ref(true)
const useLowercase = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(true)
const excludeAmbiguous = ref(false)
const count = ref(5)
const results = ref<string[]>([])
const copiedIndex = ref(-1)

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const AMBIGUOUS = '0OIl1'

const charset = computed(() => {
  let chars = ''
  if (useUppercase.value) chars += UPPER
  if (useLowercase.value) chars += LOWER
  if (useNumbers.value) chars += NUMBERS
  if (useSymbols.value) chars += SYMBOLS
  if (excludeAmbiguous.value) chars = chars.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
  return chars
})

const strength = computed(() => {
  if (!charset.value) return { level: 0, label: t('password.strengthWeak') }
  const entropy = Math.log2(charset.value.length) * length.value
  if (entropy < 40) return { level: 1, label: t('password.strengthWeak') }
  if (entropy < 60) return { level: 2, label: t('password.strengthMedium') }
  if (entropy < 80) return { level: 3, label: t('password.strengthStrong') }
  return { level: 4, label: t('password.strengthVeryStrong') }
})

function generate() {
  if (!charset.value) return
  const len = Math.max(8, Math.min(128, length.value || 16))
  const cnt = Math.max(1, Math.min(20, count.value || 1))
  length.value = len
  count.value = cnt
  const arr = new Uint32Array(len * cnt)
  crypto.getRandomValues(arr)
  results.value = Array.from({ length: cnt }, (_, i) => {
    let pw = ''
    for (let j = 0; j < len; j++) {
      pw += charset.value[arr[i * len + j] % charset.value.length]
    }
    return pw
  })
}

function copyOne(text: string, index: number) {
  copy(text)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = -1 }, 1500)
}

function copyAll() { copy(results.value.join('\n')) }

watch([useUppercase, useLowercase, useNumbers, useSymbols, excludeAmbiguous, length], generate)

generate()
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('password.title') }}</h2>
    <div class="length-row">
      <label class="option-item">{{ t('password.length') }}: {{ length }}</label>
      <input type="range" v-model.number="length" min="8" max="128" class="slider" />
    </div>
    <div class="options-row">
      <label class="option-item toggle"><input type="checkbox" v-model="useUppercase" /> {{ t('password.uppercase') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="useLowercase" /> {{ t('password.lowercase') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="useNumbers" /> {{ t('password.numbers') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="useSymbols" /> {{ t('password.symbols') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="excludeAmbiguous" /> {{ t('password.excludeAmbiguous') }}</label>
    </div>
    <div class="options-row">
      <label class="option-item">{{ t('password.count') }} <input type="number" v-model.number="count" min="1" max="20" class="num-input" /></label>
    </div>
    <p v-if="!charset" class="error-msg">{{ t('password.noCharset') }}</p>
    <div class="btn-row">
      <button class="btn btn-primary" @click="generate" :disabled="!charset">{{ t('password.generate') }}</button>
      <button class="btn" @click="copyAll" :disabled="!results.length">{{ copied ? t('password.copied') : t('password.copyAll') }}</button>
    </div>
    <div v-if="charset && results.length" class="strength-bar">
      <span class="strength-label">{{ t('password.strength') }}: {{ strength.label }}</span>
      <div class="strength-track">
        <div class="strength-fill" :class="'level-' + strength.level" :style="{ width: (strength.level * 25) + '%' }"></div>
      </div>
    </div>
    <ul v-if="results.length" class="result-list">
      <li v-for="(pw, i) in results" :key="i" class="result-item">
        <code class="pw-text">{{ pw }}</code>
        <button class="btn btn-sm" @click="copyOne(pw, i)">{{ copiedIndex === i ? t('password.copied') : t('password.copy') }}</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tool-container { max-width: 800px; margin: 0 auto; }
.tool-title {
  font-size: 1.3rem; font-weight: 600; margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.length-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.slider { flex: 1; accent-color: var(--primary); }
.options-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.option-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text); }
.option-item.toggle { cursor: pointer; }
.num-input {
  width: 60px; padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.85rem; text-align: center;
}
.btn-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
.strength-bar { margin-bottom: 14px; }
.strength-label { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 6px; display: block; }
.strength-track { height: 6px; border-radius: 3px; background: var(--surface2); overflow: hidden; }
.strength-fill { height: 100%; border-radius: 3px; transition: width 0.3s, background 0.3s; }
.level-1 { background: var(--red); }
.level-2 { background: #f0932b; }
.level-3 { background: #6c63ff; }
.level-4 { background: var(--accent); }
.result-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.result-item {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 12px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2);
}
.pw-text { font-family: var(--font-mono); font-size: 0.82rem; color: var(--text); word-break: break-all; }
.error-msg {
  margin-bottom: 12px; padding: 10px 14px; background: rgba(255,71,87,0.08);
  border: 1px solid rgba(255,71,87,0.25); border-radius: var(--radius); color: var(--red); font-size: 0.82rem;
}
</style>
