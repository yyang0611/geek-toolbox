<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const left = ref('')
const right = ref('')

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

const diffResult = ref<DiffLine[]>([])

function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp
}

function compare() {
  const aLines = left.value.split('\n')
  const bLines = right.value.split('\n')
  const dp = computeLCS(aLines, bLines)
  const result: DiffLine[] = []

  let i = aLines.length
  let j = bLines.length

  const stack: DiffLine[] = []
  while (i > 0 && j > 0) {
    if (aLines[i - 1] === bLines[j - 1]) {
      stack.push({ type: 'unchanged', text: aLines[i - 1] })
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      stack.push({ type: 'removed', text: aLines[i - 1] })
      i--
    } else {
      stack.push({ type: 'added', text: bLines[j - 1] })
      j--
    }
  }
  while (i > 0) {
    stack.push({ type: 'removed', text: aLines[i - 1] })
    i--
  }
  while (j > 0) {
    stack.push({ type: 'added', text: bLines[j - 1] })
    j--
  }

  while (stack.length) {
    result.push(stack.pop()!)
  }
  diffResult.value = result
}

function copyResult() {
  const text = diffResult.value.map(line => {
    const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '
    return prefix + line.text
  }).join('\n')
  copy(text)
}
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('diff.title') }}</h2>
    <div class="diff-inputs">
      <div class="diff-col">
        <label class="diff-label">{{ t('diff.leftLabel') }}</label>
        <textarea
          v-model="left"
          class="tool-input"
          :placeholder="t('diff.leftPlaceholder')"
          rows="10"
        ></textarea>
      </div>
      <div class="diff-col">
        <label class="diff-label">{{ t('diff.rightLabel') }}</label>
        <textarea
          v-model="right"
          class="tool-input"
          :placeholder="t('diff.rightPlaceholder')"
          rows="10"
        ></textarea>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-primary" @click="compare">{{ t('diff.compare') }}</button>
      <button v-if="diffResult.length" class="btn" @click="copyResult">
        {{ copied ? t('common.copied') : t('common.copyResult') }}
      </button>
    </div>
    <div v-if="diffResult.length" class="diff-output">
      <div
        v-for="(line, idx) in diffResult"
        :key="idx"
        class="diff-line"
        :class="'diff-' + line.type"
      >
        <span class="diff-prefix">{{ line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ' }}</span>
        <span class="diff-text">{{ line.text }}</span>
      </div>
    </div>
    <p v-else-if="!diffResult.length && (left || right)" class="empty-state">
      {{ t('diff.emptyState') }}
    </p>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 900px;
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
.diff-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.diff-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.diff-label {
  font-size: 0.8rem;
  color: var(--text-dim);
  font-weight: 500;
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
.diff-output {
  margin-top: 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  overflow: auto;
  max-height: 400px;
  font-family: var(--font-mono);
  font-size: 0.82rem;
}
.diff-line {
  display: flex;
  padding: 3px 14px;
  line-height: 1.6;
}
.diff-added {
  background: rgba(0, 212, 170, 0.08);
  color: var(--accent);
}
.diff-removed {
  background: rgba(255, 71, 87, 0.08);
  color: var(--red);
}
.diff-unchanged {
  color: var(--text-dim);
}
.diff-prefix {
  width: 16px;
  flex-shrink: 0;
  user-select: none;
  opacity: 0.6;
}
.diff-text {
  white-space: pre-wrap;
  word-break: break-all;
}
.empty-state {
  margin-top: 16px;
  color: var(--text-dim);
  font-size: 0.82rem;
  text-align: center;
}

@media (max-width: 600px) {
  .diff-inputs {
    grid-template-columns: 1fr;
  }
}
</style>
