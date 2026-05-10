<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SupportModal from './SupportModal.vue'

const { t, locale } = useI18n()
const supportModal = ref<InstanceType<typeof SupportModal>>()

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
      <div class="header-actions">
        <a class="support-entry-hint"
           href="https://github.com/yyang0611/geek-toolbox/issues/new"
           target="_blank">{{ t('support.entryHint') }}</a>
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
.support-entry-hint {
  font-size: 0.78rem;
  color: var(--text-dim);
  transition: color 0.2s, text-shadow 0.2s;
}
.support-entry-hint:hover {
  color: var(--primary);
  text-decoration: none;
  text-shadow: 0 0 8px rgba(108, 99, 255, 0.3);
}
.support-entry-btn {
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
  .header-bar { flex-direction: column; align-items: flex-start; }
  .support-entry-hint { display: none; }
}
</style>
