<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TOOLS } from '@/registry'
import { useToolNav } from '@/composables/useToolNav'
import SupportModal from './SupportModal.vue'

const { t, locale } = useI18n()
const { openTool } = useToolNav()
const supportModal = ref<InstanceType<typeof SupportModal>>()

const searchQuery = ref('')
const searchFocused = ref(false)
const searchRef = ref<HTMLElement | null>(null)

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return TOOLS.filter(tool => {
    const title = t(tool.titleKey).toLowerCase()
    const desc = t(tool.descKey).toLowerCase()
    return title.includes(q) || desc.includes(q) || tool.id.includes(q)
  }).slice(0, 6)
})

function selectResult(toolId: string) {
  openTool(toolId)
  searchQuery.value = ''
  searchFocused.value = false
}

function onBlur() {
  setTimeout(() => { searchFocused.value = false }, 150)
}

function setLanguage(lang: string) {
  locale.value = lang
  localStorage.setItem('geek-toolbox-language', lang)
  document.title = t('meta.title')
}

function openSupport() {
  supportModal.value?.open()
}
</script>

<template>
  <header class="header">
    <div class="header-bar">
      <div class="header-copy">
        <div class="logo">{{ t('header.logo') }}</div>
        <p class="subtitle">{{ t('header.subtitle') }}</p>
      </div>
      <div class="header-search" ref="searchRef">
        <div class="search-input-wrap" :class="{ focused: searchFocused }">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="t('header.searchPlaceholder')"
            @focus="searchFocused = true"
            @blur="onBlur"
          />
        </div>
        <Transition name="dropdown">
          <div v-if="searchFocused && searchResults.length" class="search-dropdown">
            <button
              v-for="tool in searchResults"
              :key="tool.id"
              class="search-item"
              @mousedown.prevent="selectResult(tool.id)"
            >
              <span class="search-item-icon">{{ tool.icon }}</span>
              <div class="search-item-info">
                <span class="search-item-title">{{ t(tool.titleKey) }}</span>
                <span class="search-item-desc">{{ t(tool.descKey) }}</span>
              </div>
            </button>
          </div>
        </Transition>
      </div>
      <div class="header-actions">
        <span class="support-entry-hint">{{ t('support.entryHint') }}</span>
        <button class="support-entry-btn" @click="openSupport">{{ t('support.entryCta') }}</button>
        <div class="lang-switcher" :aria-label="t('header.languageSwitcherLabel')">
          <button class="lang-btn" :class="{ active: locale === 'zh-CN' }"
                  @click="setLanguage('zh-CN')">{{ t('header.languageZh') }}</button>
          <button class="lang-btn" :class="{ active: locale === 'en' }"
                  @click="setLanguage('en')">{{ t('header.languageEn') }}</button>
        </div>
      </div>
    </div>
    <SupportModal ref="supportModal" />
  </header>
</template>

<style scoped>
.header {
  padding: 20px 24px;
  border-bottom: none;
  position: relative;
}
.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent);
  opacity: 0.6;
}
.header-bar {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.logo {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
  text-shadow: 0 0 20px rgba(108, 99, 255, 0.4);
}
.subtitle {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-top: 2px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Search */
.header-search {
  position: relative;
  flex: 1;
  max-width: 320px;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input-wrap.focused {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.12), 0 0 12px rgba(108, 99, 255, 0.08);
}
.search-icon { color: var(--text-dim); flex-shrink: 0; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 0.82rem;
  outline: none;
  font-family: var(--font-sans);
}
.search-input::placeholder { color: var(--text-dim); opacity: 0.6; }

.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 12px var(--primary-glow);
  backdrop-filter: blur(12px);
  overflow: hidden;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.search-item:hover {
  background: rgba(108, 99, 255, 0.1);
}
.search-item + .search-item {
  border-top: 1px solid var(--border);
}
.search-item-icon { font-size: 1.2rem; flex-shrink: 0; }
.search-item-info { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.search-item-title { font-size: 0.82rem; font-weight: 500; color: var(--text); }
.search-item-desc {
  font-size: 0.72rem; color: var(--text-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.dropdown-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
.support-entry-hint {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.support-entry-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--primary);
  background: transparent;
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.support-entry-btn:hover {
  background: var(--primary);
  color: #fff;
  box-shadow: var(--glow-primary);
  text-decoration: none;
}
.lang-switcher {
  display: flex;
  gap: 4px;
}
.lang-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.3);
}

@media (max-width: 768px) {
  .header-bar { flex-wrap: wrap; }
  .header-search { order: 3; max-width: 100%; flex-basis: 100%; margin-top: 10px; }
  .support-entry-hint { display: none; }
}
</style>
