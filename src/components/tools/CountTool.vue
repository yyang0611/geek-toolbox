<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const input = ref('')

const stats = computed(() => {
  const text = input.value
  const chars = text.length
  const chinese = (text.match(/[一-鿿㐀-䶿]/g) || []).length
  const english = (text.match(/[a-zA-Z]+/g) || []).length
  const lines = text ? text.split('\n').length : 0
  const spaces = (text.match(/\s/g) || []).length
  const punctRe = /[，。！？、；：""''（）【】《》—…·～.,!?;:'"()\[\]{}\/<>@#$%^&*\-_=+\\|`~]/g
  const punct = (text.match(punctRe) || []).length
  return { chars, chinese, english, lines, spaces, punct }
})
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('count.title') }}</h2>
    <textarea
      v-model="input"
      class="tool-input"
      :placeholder="t('count.placeholder')"
      rows="8"
    ></textarea>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ stats.chars }}</span>
        <span class="stat-label">{{ t('count.stats.chars') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.chinese }}</span>
        <span class="stat-label">{{ t('count.stats.chinese') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.english }}</span>
        <span class="stat-label">{{ t('count.stats.english') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.lines }}</span>
        <span class="stat-label">{{ t('count.stats.lines') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.spaces }}</span>
        <span class="stat-label">{{ t('count.stats.spaces') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.punct }}</span>
        <span class="stat-label">{{ t('count.stats.punct') }}</span>
      </div>
    </div>
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 18px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  border-color: rgba(108, 99, 255, 0.3);
  box-shadow: 0 0 16px rgba(108, 99, 255, 0.1);
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  font-family: var(--font-mono);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 6px;
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>