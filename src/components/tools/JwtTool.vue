<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const input = ref('')
const error = ref('')

function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const decoded = computed(() => {
  error.value = ''
  const token = input.value.trim()
  if (!token) return null

  const parts = token.split('.')
  if (parts.length < 2 || parts.length > 3) {
    error.value = t('jwt.invalid')
    return null
  }

  try {
    const header = JSON.parse(decodeBase64Url(parts[0]))
    const payload = JSON.parse(decodeBase64Url(parts[1]))
    return { header, payload }
  } catch {
    error.value = t('jwt.invalid')
    return null
  }
})

const meta = computed(() => {
  if (!decoded.value) return null
  const { header, payload } = decoded.value
  const alg = header.alg || '--'
  const typ = header.typ || ''

  let expired = false
  let expiresStr = ''
  let issuedStr = ''

  if (payload.exp) {
    const expDate = new Date(payload.exp * 1000)
    expired = expDate.getTime() < Date.now()
    expiresStr = expDate.toLocaleString()
  }
  if (payload.iat) {
    issuedStr = new Date(payload.iat * 1000).toLocaleString()
  }

  return { alg, typ, expired, expiresStr, issuedStr }
})

function copyPayload() {
  if (decoded.value) {
    copy(JSON.stringify(decoded.value.payload, null, 2))
  }
}
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('jwt.title') }}</h2>
    <textarea
      v-model="input"
      class="tool-input"
      :placeholder="t('jwt.placeholder')"
      rows="4"
    ></textarea>
    <p v-if="error" class="error-msg">{{ error }}</p>
    <template v-if="decoded && meta">
      <div class="meta-bar">
        <span>{{ meta.typ ? t('jwt.meta', { alg: meta.alg, typ: meta.typ }) : t('jwt.metaNoPayload', { alg: meta.alg }) }}</span>
        <span v-if="meta.expired" class="expired-badge">{{ t('jwt.expired') }}</span>
      </div>
      <div v-if="meta.expiresStr" class="meta-time">{{ t('jwt.expires', { time: meta.expiresStr }) }}</div>
      <div v-if="meta.issuedStr" class="meta-time">{{ t('jwt.issuedAt', { time: meta.issuedStr }) }}</div>

      <div class="jwt-cards">
        <div class="jwt-card">
          <h3 class="jwt-card-title">{{ t('jwt.header') }}</h3>
          <pre class="jwt-card-body">{{ JSON.stringify(decoded.header, null, 2) }}</pre>
        </div>
        <div class="jwt-card">
          <h3 class="jwt-card-title">{{ t('jwt.payload') }}</h3>
          <pre class="jwt-card-body">{{ JSON.stringify(decoded.payload, null, 2) }}</pre>
          <button class="btn btn-copy" @click="copyPayload">
            {{ copied ? t('common.copied') : t('jwt.copyPayload') }}
          </button>
        </div>
      </div>
    </template>
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
.error-msg {
  margin-top: 12px;
  padding: 10px 14px;
  background: rgba(255, 71, 87, 0.08);
  border: 1px solid rgba(255, 71, 87, 0.25);
  border-radius: var(--radius);
  color: var(--red);
  font-size: 0.82rem;
}
.meta-bar {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-dim);
  padding: 10px 14px;
  background: var(--surface2);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.expired-badge {
  color: var(--red);
  font-weight: 600;
  background: rgba(255, 71, 87, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}
.meta-time {
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-top: 6px;
  padding-left: 14px;
}
.jwt-cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
}
.jwt-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  padding: 16px;
  transition: border-color 0.2s;
}
.jwt-card:hover {
  border-color: rgba(108, 99, 255, 0.3);
}
.jwt-card-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 10px;
}
.jwt-card-body {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  padding: 12px;
  background: rgba(108, 99, 255, 0.04);
  border-radius: 6px;
  border: 1px solid rgba(108, 99, 255, 0.1);
}
.btn {
  padding: 7px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.15);
}
.btn:active { transform: scale(0.97); }
.btn-copy {
  margin-top: 10px;
}
</style>
