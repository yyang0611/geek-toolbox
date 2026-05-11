<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const input = ref('')
const output = ref('')
const error = ref('')

function format() {
  error.value = ''
  output.value = ''
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed, null, 2)
  } catch (e: any) {
    error.value = t('json.invalidError', { message: e.message })
  }
}

function minify() {
  error.value = ''
  output.value = ''
  try {
    const parsed = JSON.parse(input.value)
    output.value = JSON.stringify(parsed)
  } catch (e: any) {
    error.value = t('json.invalidError', { message: e.message })
  }
}

function clear() {
  input.value = ''
  output.value = ''
  error.value = ''
}

function copyResult() {
  if (output.value) copy(output.value)
}
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('json.title') }}</h2>
    <textarea
      v-model="input"
      class="tool-input"
      :placeholder="t('json.placeholder')"
      rows="8"
    ></textarea>
    <div class="btn-row">
      <button class="btn btn-primary" @click="format">{{ t('json.format') }}</button>
      <button class="btn" @click="minify">{{ t('json.compress') }}</button>
      <button class="btn" @click="clear">{{ t('common.clear') }}</button>
    </div>
    <p v-if="error" class="error-msg">{{ error }}</p>
    <pre v-if="output" class="tool-output">{{ output }}</pre>
    <button v-if="output" class="btn btn-copy" @click="copyResult">
      {{ copied ? t('common.copied') : t('common.copyResult') }}
    </button>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
}
.tool-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.tool-input {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.tool-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.12), 0 0 20px rgba(108, 99, 255, 0.08);
}
.btn-row {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.btn {
  padding: 8px 18px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.15);
}
.btn:active { transform: scale(0.97); }
.btn-primary {
  background: var(--gradient-primary);
  color: #fff;
  border-color: var(--primary);
}
.btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: var(--glow-primary);
  color: #fff;
}
.btn-copy {
  margin-top: 10px;
}
.error-msg {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(255, 71, 87, 0.08);
  border: 1px solid rgba(255, 71, 87, 0.25);
  border-radius: var(--radius);
  color: var(--red);
  font-size: 0.82rem;
}
.tool-output {
  margin-top: 14px;
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid rgba(108, 99, 255, 0.2);
  background: rgba(108, 99, 255, 0.04);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}
</style>
