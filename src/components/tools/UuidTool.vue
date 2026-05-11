<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const count = ref(5)
const uppercase = ref(false)
const noDashes = ref(false)
const results = ref<string[]>([])
const copiedIndex = ref(-1)

function generate() {
  results.value = Array.from({ length: count.value }, () => {
    let uuid: string = crypto.randomUUID()
    if (noDashes.value) uuid = uuid.replace(/-/g, '')
    if (uppercase.value) uuid = uuid.toUpperCase()
    return uuid
  })
}

function copyOne(text: string, index: number) {
  copy(text)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = -1 }, 1500)
}

function copyAll() {
  copy(results.value.join('\n'))
}

generate()
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('uuid.title') }}</h2>
    <div class="options-row">
      <label class="option-item">
        {{ t('uuid.count') }}
        <input type="number" v-model.number="count" min="1" max="100" class="num-input" />
      </label>
      <label class="option-item toggle">
        <input type="checkbox" v-model="uppercase" />
        {{ t('uuid.uppercase') }}
      </label>
      <label class="option-item toggle">
        <input type="checkbox" v-model="noDashes" />
        {{ t('uuid.noDashes') }}
      </label>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" @click="generate">{{ t('uuid.generate') }}</button>
      <button class="btn" @click="copyAll" :disabled="!results.length">
        {{ copied ? t('uuid.copied') : t('uuid.copyAll') }}
      </button>
    </div>
    <ul v-if="results.length" class="result-list">
      <li v-for="(uuid, i) in results" :key="i" class="result-item">
        <code class="uuid-text">{{ uuid }}</code>
        <button class="btn btn-sm" @click="copyOne(uuid, i)">
          {{ copiedIndex === i ? t('uuid.copied') : t('uuid.copy') }}
        </button>
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
.options-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.option-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text); }
.option-item.toggle { cursor: pointer; }
.num-input {
  width: 60px; padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.85rem; text-align: center;
}
.num-input:focus { outline: none; border-color: var(--primary); }
.btn-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.btn {
  padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn:hover { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 12px rgba(108,99,255,0.15); }
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
.result-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.result-item {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 12px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2);
}
.uuid-text { font-family: var(--font-mono); font-size: 0.82rem; color: var(--text); word-break: break-all; }
</style>
