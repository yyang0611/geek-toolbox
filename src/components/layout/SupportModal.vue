<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copy } = useClipboard()

const visible = ref(false)
const activeTab = ref<'cn' | 'intl'>('cn')
const contactCopied = ref(false)

function open() {
  visible.value = true
  activeTab.value = 'cn'
}

function close() {
  visible.value = false
}

function switchTab(tab: 'cn' | 'intl') {
  activeTab.value = tab
}

async function copyContact() {
  await copy('yyang0611 / han998966@gmail.com')
  contactCopied.value = true
  setTimeout(() => (contactCopied.value = false), 2000)
}

defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="modal-content" role="dialog" aria-modal="true">
          <button class="close-btn" @click="close" :aria-label="t('common.cancel')">&times;</button>
          <h3 class="modal-title">{{ t('support.modalTitle') }}</h3>

          <div class="support-tabs" role="tablist" :aria-label="t('support.tabsAriaLabel')">
            <button class="support-tab" :class="{ active: activeTab === 'cn' }"
                    @click="switchTab('cn')">{{ t('support.cnTab') }}</button>
            <button class="support-tab" :class="{ active: activeTab === 'intl' }"
                    @click="switchTab('intl')">{{ t('support.intlTab') }}</button>
          </div>

          <!-- 国内 tab -->
          <div v-show="activeTab === 'cn'" class="tab-panel">
            <p class="qr-text">{{ t('support.cnQrText') }}</p>
            <img src="/donate.png" :alt="t('support.qrAlt')" class="donation-qr" />
            <div class="contact-row">
              <p class="hint">{{ t('support.contactLabel') }}<strong>yyang0611</strong> / han998966@gmail.com</p>
              <button class="btn outline small" @click="copyContact">
                {{ contactCopied ? t('support.copiedContact') : t('support.copyContact') }}
              </button>
            </div>
          </div>

          <!-- 国际 tab -->
          <div v-show="activeTab === 'intl'" class="tab-panel">
            <p class="hint">{{ t('support.intlHint') }}</p>
            <div class="link-list">
              <div class="link-group">
                <a class="link-btn" href="https://www.paypal.com/paypalme/GeekToolbox" target="_blank" rel="noreferrer">PayPal</a>
                <p class="link-text">https://www.paypal.com/paypalme/GeekToolbox</p>
              </div>
              <!-- TODO: 待配置实际地址后启用
              <div class="link-group">
                <a class="link-btn secondary" href="https://buymeacoffee.com/" target="_blank" rel="noreferrer">Buy Me a Coffee</a>
                <p class="link-text">https://buymeacoffee.com/</p>
              </div>
              <div class="link-group">
                <a class="link-btn tertiary" href="https://ko-fi.com/" target="_blank" rel="noreferrer">Ko-fi</a>
                <p class="link-text">https://ko-fi.com/</p>
              </div>
              -->
            </div>
            <div class="intl-feedback-row">
              <p class="hint">{{ t('support.intlContactHint') }}</p>
              <div class="link-list">
                <a class="link-btn" href="https://github.com/yyang0611/geek-toolbox/issues/new" target="_blank" rel="noreferrer">GitHub Issues</a>
                <p class="link-text">github.com/yyang0611/geek-toolbox/issues/new</p>
                <a class="link-btn secondary" href="mailto:han998966@gmail.com">han998966@gmail.com</a>
                <p class="link-text">han998966@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: var(--surface-glass);
  border: 1px solid rgba(108, 99, 255, 0.3);
  border-radius: 16px;
  padding: 28px 24px;
  max-width: 420px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 40px rgba(108, 99, 255, 0.12), 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
}
.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  border-radius: 1px;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(108, 99, 255, 0.3);
  background: transparent;
  font-size: 1.2rem;
  color: var(--text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}
.close-btn:hover {
  color: var(--text);
  border-color: var(--primary);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.2);
}
.modal-title {
  font-size: 1.1rem;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.support-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  padding: 4px;
  background: rgba(42, 42, 74, 0.5);
  border-radius: 8px;
}
.support-tab {
  padding: 6px 16px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.support-tab.active {
  background: var(--gradient-primary);
  color: #fff;
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.3);
}
.tab-panel { text-align: center; }
.qr-text {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 12px;
}
.donation-qr {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  margin-bottom: 14px;
  border: 1px solid rgba(108, 99, 255, 0.2);
  box-shadow: inset 0 0 20px rgba(108, 99, 255, 0.05);
}
.contact-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.contact-row .hint {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.hint {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.link-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.link-btn {
  display: block;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--gradient-primary);
  color: #fff;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.15s, box-shadow 0.2s;
}
.link-btn:hover { opacity: 0.9; box-shadow: var(--glow-primary); text-decoration: none; }
.link-btn.secondary { background: linear-gradient(135deg, #ff813f, #ff6348); }
.link-btn.secondary:hover { box-shadow: 0 0 15px rgba(255, 129, 63, 0.3); }
.link-btn.tertiary { background: linear-gradient(135deg, #13c3ff, #0ea5e9); }
.link-btn.tertiary:hover { box-shadow: 0 0 15px rgba(19, 195, 255, 0.3); }
.link-group { margin-bottom: 4px; }
.link-text {
  font-size: 0.72rem;
  color: var(--text-dim);
  margin-top: 2px;
  word-break: break-all;
}
.intl-feedback-row {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}
.intl-feedback-row .hint { margin-bottom: 8px; }

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .modal-content, .modal-leave-active .modal-content {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-content { transform: scale(0.92) translateY(10px); opacity: 0; }
.modal-leave-to .modal-content { transform: scale(0.95) translateY(-5px); opacity: 0; }
</style>
