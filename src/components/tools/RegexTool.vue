<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const pattern = ref('')
const flags = ref('g')
const testText = ref('')
const mode = ref<'match' | 'replace'>('match')
const replaceInput = ref('')
const error = ref('')

interface MatchResult {
  text: string
  index: number
  groups: Record<string, string> | null
}

const flagOptions = ['g', 'gi', 'gm', 'gmi', 'i', 'm', 'mi', '']

const matches = computed<MatchResult[]>(() => {
  error.value = ''
  if (!pattern.value || !testText.value) return []
  try {
    const regex = new RegExp(pattern.value, flags.value)
    const results: MatchResult[] = []
    let match: RegExpExecArray | null

    if (flags.value.includes('g')) {
      while ((match = regex.exec(testText.value)) !== null) {
        results.push({
          text: match[0],
          index: match.index,
          groups: match.groups || null
        })
        if (!match[0]) regex.lastIndex++
      }
    } else {
      match = regex.exec(testText.value)
      if (match) {
        results.push({
          text: match[0],
          index: match.index,
          groups: match.groups || null
        })
      }
    }
    return results
  } catch (e: any) {
    error.value = e.message
    return []
  }
})

const matchCount = computed(() => matches.value.length)

const highlightedText = computed(() => {
  if (!pattern.value || !testText.value || error.value) return testText.value
  try {
    const regex = new RegExp(pattern.value, flags.value.includes('g') ? flags.value : flags.value + 'g')
    return testText.value.replace(regex, (m) => `<mark class="highlight">${escapeHtml(m)}</mark>`)
  } catch {
    return escapeHtml(testText.value)
  }
})

const replacedText = computed(() => {
  if (!pattern.value || !testText.value) return ''
  try {
    const regex = new RegExp(pattern.value, flags.value)
    return testText.value.replace(regex, replaceInput.value)
  } catch (e: any) {
    error.value = e.message
    return ''
  }
})

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function copyOutput() {
  if (mode.value === 'replace') {
    copy(replacedText.value)
  } else {
    copy(matches.value.map(m => m.text).join('\n'))
  }
}
</script>

<template>
  <div class="regex-tool">
    <h2 class="tool-title">{{ t('regex.title') }}</h2>

    <!-- Pattern input -->
    <section class="section">
      <label class="section-label">{{ t('regex.pattern') }}</label>
      <div class="pattern-row">
        <span class="pattern-slash">/</span>
        <input type="text" v-model="pattern" class="input pattern-input"
               :placeholder="t('regex.patternPlaceholder')" />
        <span class="pattern-slash">/</span>
        <select v-model="flags" class="input flags-select">
          <option v-for="f in flagOptions" :key="f" :value="f">
            {{ f || t('regex.noFlags') }}
          </option>
        </select>
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
    </section>

    <!-- Mode toggle -->
    <section class="section">
      <div class="mode-toggle">
        <button class="btn" :class="{ active: mode === 'match' }" @click="mode = 'match'">
          {{ t('regex.match') }}
        </button>
        <button class="btn" :class="{ active: mode === 'replace' }" @click="mode = 'replace'">
          {{ t('regex.replace') }}
        </button>
        <span v-if="matchCount > 0" class="match-badge">{{ matchCount }}</span>
      </div>
    </section>

    <!-- Test text -->
    <section class="section">
      <label class="section-label">{{ t('regex.testText') }}</label>
      <textarea v-model="testText" class="textarea" rows="5"
                :placeholder="t('regex.testPlaceholder')"></textarea>
    </section>

    <!-- Replace input -->
    <section v-if="mode === 'replace'" class="section">
      <label class="section-label">{{ t('regex.replaceWith') }}</label>
      <input type="text" v-model="replaceInput" class="input"
             :placeholder="t('regex.replacePlaceholder')" />
    </section>

    <!-- Output -->
    <section class="section output-section">
      <div class="output-header">
        <label class="section-label">{{ t('regex.output') }}</label>
        <button class="btn outline copy-btn" @click="copyOutput">
          {{ copied ? t('regex.copied') : t('regex.copy') }}
        </button>
      </div>

      <div v-if="mode === 'match'" class="output-content">
        <div v-if="testText && pattern" class="highlighted-text" v-html="highlightedText"></div>
        <div v-if="matches.length" class="matches-list">
          <div v-for="(m, i) in matches" :key="i" class="match-item">
            <span class="match-index">#{{ i + 1 }}</span>
            <span class="match-text">{{ m.text }}</span>
            <span class="match-pos">@{{ m.index }}</span>
            <div v-if="m.groups" class="match-groups">
              <span v-for="(val, key) in m.groups" :key="key" class="group-tag">
                {{ key }}: {{ val }}
              </span>
            </div>
          </div>
        </div>
        <div v-else-if="testText && pattern && !error" class="no-match">
          {{ t('regex.noMatch') }}
        </div>
      </div>

      <div v-else class="output-content">
        <pre v-if="replacedText" class="replaced-output">{{ replacedText }}</pre>
        <div v-else class="no-match">{{ t('regex.noOutput') }}</div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.regex-tool {
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
.pattern-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pattern-slash {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--primary);
  font-weight: bold;
}
.pattern-input {
  flex: 1;
}
.flags-select {
  width: 70px;
  text-align: center;
}
.input {
  padding: 8px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.input:focus {
  outline: none;
  border-color: var(--primary);
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
.mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mode-toggle .btn {
  padding: 6px 16px;
  border-radius: var(--radius);
  font-size: 0.82rem;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  transition: all 0.2s;
}
.mode-toggle .btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.match-badge {
  background: var(--primary);
  color: #fff;
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}
.error-msg {
  margin-top: 8px;
  color: var(--red);
  font-size: 0.8rem;
  font-family: var(--font-mono);
}
.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.copy-btn {
  font-size: 0.75rem;
  padding: 4px 10px;
}
.btn.outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
}
.btn.outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.output-content {
  margin-top: 10px;
}
.highlighted-text {
  padding: 10px;
  background: var(--surface2);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}
.highlighted-text :deep(.highlight) {
  background: rgba(99, 102, 241, 0.3);
  color: var(--primary);
  border-radius: 2px;
  padding: 1px 2px;
}
.matches-list {
  margin-top: 12px;
}
.match-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 0.82rem;
  flex-wrap: wrap;
}
.match-item:last-child {
  border-bottom: none;
}
.match-index {
  color: var(--text-dim);
  font-size: 0.75rem;
}
.match-text {
  font-family: var(--font-mono);
  color: var(--primary);
  background: var(--surface2);
  padding: 2px 6px;
  border-radius: 3px;
}
.match-pos {
  color: var(--text-dim);
  font-size: 0.72rem;
}
.match-groups {
  width: 100%;
  margin-top: 4px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.group-tag {
  font-size: 0.72rem;
  background: var(--surface2);
  padding: 2px 8px;
  border-radius: 3px;
  color: var(--text-dim);
  font-family: var(--font-mono);
}
.replaced-output {
  padding: 10px;
  background: var(--surface2);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
.no-match {
  color: var(--text-dim);
  font-size: 0.82rem;
  font-style: italic;
}

@media (max-width: 600px) {
  .pattern-row { flex-wrap: wrap; }
  .flags-select { width: 100%; }
}
</style>
