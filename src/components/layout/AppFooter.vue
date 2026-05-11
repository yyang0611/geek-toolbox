<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SupportModal from './SupportModal.vue'

const { t } = useI18n()
const supportModal = ref<InstanceType<typeof SupportModal>>()

function openSupport() {
  supportModal.value?.open()
}
</script>

<template>
  <footer class="footer">
    <p class="footer-notice">{{ t('support.footerNotice') }}</p>
    <p class="footer-prompt">
      {{ t('support.footerPrompt') }}
      <a href="#" class="coffee-link" @click.prevent="openSupport">{{ t('support.footerLink') }}</a>
    </p>
    <p class="footer-links">
      <a href="https://github.com/yyang0611/geek-toolbox" target="_blank">GitHub</a>
      <span class="sep">·</span>
      <a href="https://github.com/yyang0611/geek-toolbox/issues/new" target="_blank">{{ t('support.feedbackGithub') }}</a>
      <span class="sep">·</span>
      <a href="mailto:han998966@gmail.com">{{ t('support.feedbackEmail') }}</a>
    </p>
    <SupportModal ref="supportModal" />
  </footer>
</template>

<style scoped>
.footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  text-align: center;
}
.footer-notice {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-bottom: 6px;
}
.footer-prompt {
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-bottom: 8px;
}
.coffee-link {
  color: var(--primary);
  font-weight: 500;
  transition: color 0.15s;
}
.coffee-link:hover {
  color: var(--accent);
  text-decoration: none;
}
.footer-links {
  font-size: 0.78rem;
}
.footer-links a {
  color: var(--primary);
}
.sep {
  margin: 0 6px;
  color: var(--text-dim);
}
</style>
