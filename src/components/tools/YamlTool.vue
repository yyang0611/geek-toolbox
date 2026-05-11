<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'
import { useScriptLoader, CDN } from '@/composables/useScriptLoader'

const { t } = useI18n()
const { copied, copy } = useClipboard()
const { loadScript } = useScriptLoader()

const input = ref('')
const output = ref('')
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    await loadScript(CDN.YAML)
    loading.value = false
  } catch (e: any) {
    error.value = t('yaml.loadError')
    loading.value = false
  }
})

function toJSON() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  try {
    const jsyaml = (window as any).jsyaml
    if (!jsyaml) {
      error.value = t('yaml.loadError')
      return
    }
    const parsed = jsyaml.load(input.value)
    output.value = JSON.stringify(parsed, null, 2)
  } catch (e: any) {
    error.value = e.message || t('yaml.parseError')
  }
}

function toYAML() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  try {
    const jsyaml = (window as any).jsyaml
    if (!jsyaml) {
      error.value = t('yaml.loadError')
      return
    }
    const parsed = JSON.parse(input.value)
    output.value = jsyaml.dump(parsed, { indent: 2 })
  } catch (e: any) {
    error.value = e.message || t('yaml.parseError')
  }
}

function copyOutput() {
  if (output.value) copy(output.value)
}
</script>

<template>
  <div class="yaml-tool">
    <h2 class="tool-title">{{ t('yaml.title') }}</h2>

    <div v-if="loading" class="loading">{{ t('yaml.loading') }}</div>

    <template v-else>
      <!-- Input -->
      <section class="section">
        <label class="section-label">{{ t('yaml.input') }}</label>
        <textarea v-model="input" class="textarea" rows="10"
                  :placeholder="t('yaml.inputPlaceholder')"></textarea>
      </section>

      <!-- Action buttons -->
      <div class="actions">
        <button class="btn primary" @click="toJSON">→ JSON</button>
        <button class="btn primary" @click="toYAML">→ YAML</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="error-msg">{{ error }}</div>

      <!-- Output -->
      <section v-if="output" class="section">
        <div class="output-header">
          <label class="section-label">{{ t('yaml.output') }}</label>
          <button class="btn outline copy-btn" @click="copyOutput">
            {{ copied ? t('yaml.copied') : t('yaml.copy') }}
          </button>
        </div>
        <pre class="output-pre">{{ output }}</pre>
      </section>
    </template>
  </div>
</template>

<style scoped>
.yaml-tool {
  font-family: var(--font-sans);
}
.tool-title {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.loading {
  color: var(--text-dim);
  font-size: 0.85rem;
  padding: 20px;
  text-align: center;
}
.section {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.2s;
}
.section:hover {
  border-color: rgba(108, 99, 255, 0.2);
}
.section-label {
  display: block;
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-bottom: 8px;
  font-weight: 500;
}
.textarea {
  width: 100%;
  padding: 10px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  resize: vertical;
}
.textarea:focus {
  outline: none;
  border-color: var(--primary);
}
.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.btn {
  padding: 8px 20px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s;
  font-weight: 500;
}
.btn.primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.btn.primary:hover {
  filter: brightness(1.1);
  box-shadow: var(--glow-primary);
}
.btn.outline {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}
.btn.outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.15);
}
.btn:active { transform: scale(0.97); }
.copy-btn {
  font-size: 0.75rem;
  padding: 4px 10px;
}
.error-msg {
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--red);
  border-radius: var(--radius);
  color: var(--red);
  font-size: 0.82rem;
  font-family: var(--font-mono);
  white-space: pre-wrap;
  word-break: break-all;
}
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.output-pre {
  margin-top: 8px;
  padding: 12px;
  background: var(--surface2);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}
</style>
