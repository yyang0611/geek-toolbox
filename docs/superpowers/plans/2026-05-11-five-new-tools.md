# Five New Developer Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 new developer tools (UUID, Hash, Password, Case Convert, QR Code) to geek-toolbox.

**Architecture:** Each tool is a single `.vue` SFC following the existing pattern (script setup + template + scoped styles). Tools are registered in `registry.ts` with lazy imports. All i18n keys live under tool-specific namespaces.

**Tech Stack:** Vue 3 Composition API, TypeScript, Web Crypto API, `qrcode` npm package (for QR only).

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/tools/UuidTool.vue` | UUID v4 generation with batch/format options |
| Create | `src/components/tools/HashTool.vue` | SHA-1/256/512 hashing for text and files |
| Create | `src/components/tools/PasswordTool.vue` | Secure password generation with strength meter |
| Create | `src/components/tools/CaseConvertTool.vue` | Naming convention conversion |
| Create | `src/components/tools/QrcodeTool.vue` | QR code generation with download |
| Modify | `src/registry.ts` | Register 5 new tools |
| Modify | `src/locales/zh-CN.json` | Chinese translations |
| Modify | `src/locales/en.json` | English translations |
| Modify | `package.json` | Add `qrcode` + `@types/qrcode` |

---

## Task 1: Install qrcode dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install qrcode package**

```bash
cd D:/Projects/geek-toolbox && npm install qrcode && npm install -D @types/qrcode
```

- [ ] **Step 2: Verify installation**

```bash
cd D:/Projects/geek-toolbox && node -e "require('qrcode'); console.log('ok')"
```

Expected: `ok`

---

## Task 2: Add i18n translations for all 5 tools

**Files:**
- Modify: `src/locales/zh-CN.json`
- Modify: `src/locales/en.json`

- [ ] **Step 1: Add Chinese translations**

Add to `zh-CN.json` — new keys in `tabs`, `toolCards`, and tool-specific namespaces:

```json
"tabs": {
  "uuid": "UUID 生成",
  "hash": "哈希计算",
  "password": "密码生成",
  "caseconvert": "命名转换",
  "qrcode": "QR 码生成"
}
```

```json
"toolCards": {
  "uuid": "批量生成 UUID v4，支持大写与去连字符格式。",
  "hash": "计算文本或文件的 SHA-1/SHA-256/SHA-512 哈希值。",
  "password": "生成安全随机密码，可配置长度与字符集。",
  "caseconvert": "在 camelCase、snake_case、kebab-case 等命名格式间互转。",
  "qrcode": "输入文本或 URL 生成二维码，支持下载 PNG。"
}
```

```json
"uuid": {
  "title": "UUID 生成器",
  "count": "数量",
  "uppercase": "大写",
  "noDashes": "去连字符",
  "generate": "生成",
  "copyAll": "全部复制",
  "copy": "复制",
  "copied": "已复制"
}
```

```json
"hash": {
  "title": "哈希计算器",
  "modeText": "文本",
  "modeFile": "文件",
  "algorithm": "算法",
  "inputPlaceholder": "输入要计算哈希的文本...",
  "dropHint": "拖拽文件到这里，或点击选择",
  "selectFile": "选择文件",
  "fileMeta": "文件：{name} · {size}",
  "uppercase": "大写",
  "result": "哈希值",
  "copy": "复制",
  "copied": "已复制",
  "computing": "计算中..."
}
```

```json
"password": {
  "title": "密码生成器",
  "length": "长度",
  "options": "字符集",
  "uppercase": "大写字母 (A-Z)",
  "lowercase": "小写字母 (a-z)",
  "numbers": "数字 (0-9)",
  "symbols": "符号 (!@#$...)",
  "excludeAmbiguous": "排除易混淆字符 (0OIl1)",
  "count": "数量",
  "generate": "生成",
  "copyAll": "全部复制",
  "copy": "复制",
  "copied": "已复制",
  "strength": "强度",
  "strengthWeak": "弱",
  "strengthMedium": "中",
  "strengthStrong": "强",
  "strengthVeryStrong": "极强",
  "noCharset": "⚠️ 请至少选择一种字符集"
}
```

```json
"caseconvert": {
  "title": "命名格式转换",
  "inputPlaceholder": "输入变量名，每行一个...",
  "targetFormat": "目标格式",
  "formats": {
    "camel": "camelCase",
    "pascal": "PascalCase",
    "snake": "snake_case",
    "kebab": "kebab-case",
    "constant": "CONSTANT_CASE"
  },
  "result": "转换结果",
  "copy": "复制",
  "copied": "已复制",
  "emptyInput": "⚠️ 请输入内容后再转换"
}
```

```json
"qrcode": {
  "title": "QR 码生成器",
  "inputPlaceholder": "输入文本或 URL...",
  "size": "尺寸",
  "errorLevel": "纠错级别",
  "levels": {
    "L": "低 (7%)",
    "M": "中 (15%)",
    "Q": "较高 (25%)",
    "H": "高 (30%)"
  },
  "download": "下载 PNG",
  "emptyInput": "⚠️ 请输入内容后生成二维码"
}
```

- [ ] **Step 2: Add English translations**

Add to `en.json` — same structure with English values:

```json
"tabs": {
  "uuid": "UUID Generator",
  "hash": "Hash",
  "password": "Password",
  "caseconvert": "Case Convert",
  "qrcode": "QR Code"
}
```

```json
"toolCards": {
  "uuid": "Generate UUID v4 in batch with uppercase and no-dash options.",
  "hash": "Compute SHA-1/SHA-256/SHA-512 hash for text or files.",
  "password": "Generate secure random passwords with configurable length and charset.",
  "caseconvert": "Convert between camelCase, snake_case, kebab-case, and more.",
  "qrcode": "Generate QR codes from text or URLs with PNG download."
}
```

```json
"uuid": {
  "title": "UUID Generator",
  "count": "Count",
  "uppercase": "Uppercase",
  "noDashes": "No Dashes",
  "generate": "Generate",
  "copyAll": "Copy All",
  "copy": "Copy",
  "copied": "Copied"
}
```

```json
"hash": {
  "title": "Hash Generator",
  "modeText": "Text",
  "modeFile": "File",
  "algorithm": "Algorithm",
  "inputPlaceholder": "Enter text to hash...",
  "dropHint": "Drop a file here, or click to select",
  "selectFile": "Select File",
  "fileMeta": "File: {name} · {size}",
  "uppercase": "Uppercase",
  "result": "Hash",
  "copy": "Copy",
  "copied": "Copied",
  "computing": "Computing..."
}
```

```json
"password": {
  "title": "Password Generator",
  "length": "Length",
  "options": "Character Set",
  "uppercase": "Uppercase (A-Z)",
  "lowercase": "Lowercase (a-z)",
  "numbers": "Numbers (0-9)",
  "symbols": "Symbols (!@#$...)",
  "excludeAmbiguous": "Exclude ambiguous (0OIl1)",
  "count": "Count",
  "generate": "Generate",
  "copyAll": "Copy All",
  "copy": "Copy",
  "copied": "Copied",
  "strength": "Strength",
  "strengthWeak": "Weak",
  "strengthMedium": "Medium",
  "strengthStrong": "Strong",
  "strengthVeryStrong": "Very Strong",
  "noCharset": "⚠️ Select at least one character set"
}
```

```json
"caseconvert": {
  "title": "Case Converter",
  "inputPlaceholder": "Enter variable names, one per line...",
  "targetFormat": "Target Format",
  "formats": {
    "camel": "camelCase",
    "pascal": "PascalCase",
    "snake": "snake_case",
    "kebab": "kebab-case",
    "constant": "CONSTANT_CASE"
  },
  "result": "Result",
  "copy": "Copy",
  "copied": "Copied",
  "emptyInput": "⚠️ Enter content before converting"
}
```

```json
"qrcode": {
  "title": "QR Code Generator",
  "inputPlaceholder": "Enter text or URL...",
  "size": "Size",
  "errorLevel": "Error Correction",
  "levels": {
    "L": "Low (7%)",
    "M": "Medium (15%)",
    "Q": "Quartile (25%)",
    "H": "High (30%)"
  },
  "download": "Download PNG",
  "emptyInput": "⚠️ Enter content to generate a QR code"
}
```

- [ ] **Step 3: Verify JSON validity**

```bash
cd D:/Projects/geek-toolbox && node -e "JSON.parse(require('fs').readFileSync('src/locales/zh-CN.json','utf8')); JSON.parse(require('fs').readFileSync('src/locales/en.json','utf8')); console.log('valid')"
```

Expected: `valid`

---

## Task 3: Register tools in registry.ts

**Files:**
- Modify: `src/registry.ts`

- [ ] **Step 1: Add 5 tool entries to TOOLS array**

Append before the closing `]` of the `TOOLS` array:

```typescript
  {
    id: 'uuid',
    category: 'developer',
    icon: '🔑',
    titleKey: 'tabs.uuid',
    descKey: 'toolCards.uuid',
    component: () => import('@/components/tools/UuidTool.vue')
  },
  {
    id: 'hash',
    category: 'developer',
    icon: '#️⃣',
    titleKey: 'tabs.hash',
    descKey: 'toolCards.hash',
    component: () => import('@/components/tools/HashTool.vue')
  },
  {
    id: 'password',
    category: 'developer',
    icon: '🔐',
    titleKey: 'tabs.password',
    descKey: 'toolCards.password',
    component: () => import('@/components/tools/PasswordTool.vue')
  },
  {
    id: 'caseconvert',
    category: 'developer',
    icon: '🔤',
    titleKey: 'tabs.caseconvert',
    descKey: 'toolCards.caseconvert',
    component: () => import('@/components/tools/CaseConvertTool.vue')
  },
  {
    id: 'qrcode',
    category: 'developer',
    icon: '📱',
    titleKey: 'tabs.qrcode',
    descKey: 'toolCards.qrcode',
    component: () => import('@/components/tools/QrcodeTool.vue')
  }
```

---

## Task 4: Implement UUID Generator

**Files:**
- Create: `src/components/tools/UuidTool.vue`

- [ ] **Step 1: Create UuidTool.vue**

```vue
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
    let uuid = crypto.randomUUID()
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
```

- [ ] **Step 2: Verify build**

```bash
cd D:/Projects/geek-toolbox && npx vue-tsc --noEmit 2>&1 | head -20
```

---

## Task 5: Implement Hash Generator

**Files:**
- Create: `src/components/tools/HashTool.vue`

- [ ] **Step 1: Create HashTool.vue**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

type Mode = 'text' | 'file'
type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'

const mode = ref<Mode>('text')
const algorithm = ref<Algorithm>('SHA-256')
const input = ref('')
const result = ref('')
const uppercase = ref(false)
const computing = ref(false)
const fileName = ref('')
const fileSize = ref('')

async function hashText(text: string, algo: Algorithm): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buffer = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function computeFromText() {
  if (!input.value) { result.value = ''; return }
  computing.value = true
  try {
    result.value = await hashText(input.value, algorithm.value)
    if (uppercase.value) result.value = result.value.toUpperCase()
  } finally { computing.value = false }
}

async function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  fileName.value = file.name
  fileSize.value = file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size/1024).toFixed(1)} KB` : `${(file.size/1048576).toFixed(1)} MB`
  computing.value = true
  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest(algorithm.value, buffer)
    result.value = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    if (uppercase.value) result.value = result.value.toUpperCase()
  } finally { computing.value = false }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (!file) return
  const input = document.createElement('input')
  input.type = 'file'
  const dt = new DataTransfer()
  dt.items.add(file)
  input.files = dt.files
  handleFile({ target: input } as unknown as Event)
}

watch([algorithm, uppercase], () => {
  if (mode.value === 'text' && input.value) computeFromText()
})

watch(input, () => { if (mode.value === 'text') computeFromText() })

function copyResult() { if (result.value) copy(result.value) }
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('hash.title') }}</h2>
    <div class="options-row">
      <div class="mode-switch">
        <button :class="['btn btn-sm', mode === 'text' && 'btn-primary']" @click="mode = 'text'">{{ t('hash.modeText') }}</button>
        <button :class="['btn btn-sm', mode === 'file' && 'btn-primary']" @click="mode = 'file'">{{ t('hash.modeFile') }}</button>
      </div>
      <label class="option-item">
        {{ t('hash.algorithm') }}
        <select v-model="algorithm" class="select-input">
          <option value="SHA-1">SHA-1</option>
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-512">SHA-512</option>
        </select>
      </label>
      <label class="option-item toggle">
        <input type="checkbox" v-model="uppercase" />
        {{ t('hash.uppercase') }}
      </label>
    </div>
    <textarea v-if="mode === 'text'" v-model="input" class="tool-input" :placeholder="t('hash.inputPlaceholder')" rows="5"></textarea>
    <div v-else class="drop-zone" @drop="handleDrop" @dragover.prevent>
      <p>{{ t('hash.dropHint') }}</p>
      <input type="file" @change="handleFile" class="file-input" />
      <p v-if="fileName" class="file-meta">{{ t('hash.fileMeta', { name: fileName, size: fileSize }) }}</p>
    </div>
    <div v-if="computing" class="computing">{{ t('hash.computing') }}</div>
    <div v-if="result && !computing" class="result-box">
      <label class="result-label">{{ t('hash.result') }}</label>
      <pre class="tool-output">{{ result }}</pre>
      <button class="btn btn-sm" @click="copyResult">{{ copied ? t('hash.copied') : t('hash.copy') }}</button>
    </div>
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
.mode-switch { display: flex; gap: 4px; }
.option-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text); }
.option-item.toggle { cursor: pointer; }
.select-input {
  padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.82rem;
}
.tool-input {
  width: 100%; padding: 14px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
  resize: vertical; box-sizing: border-box; transition: border-color 0.2s;
}
.tool-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(108,99,255,0.12); }
.drop-zone {
  padding: 40px 20px; border: 2px dashed var(--border); border-radius: var(--radius);
  text-align: center; color: var(--text-dim); transition: border-color 0.2s; position: relative;
}
.drop-zone:hover { border-color: var(--primary); }
.file-input { margin-top: 10px; }
.file-meta { margin-top: 8px; font-size: 0.82rem; color: var(--text); }
.computing { margin-top: 12px; color: var(--text-dim); font-size: 0.82rem; }
.result-box { margin-top: 14px; }
.result-label { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 6px; display: block; }
.tool-output {
  padding: 14px; border-radius: var(--radius); border: 1px solid rgba(108,99,255,0.2);
  background: rgba(108,99,255,0.04); color: var(--text); font-family: var(--font-mono);
  font-size: 0.82rem; white-space: pre-wrap; word-break: break-all;
}
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
</style>
```

- [ ] **Step 2: Verify build**

```bash
cd D:/Projects/geek-toolbox && npx vue-tsc --noEmit 2>&1 | head -20
```

---

## Task 6: Implement Password Generator

**Files:**
- Create: `src/components/tools/PasswordTool.vue`

- [ ] **Step 1: Create PasswordTool.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

const length = ref(16)
const useUppercase = ref(true)
const useLowercase = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(true)
const excludeAmbiguous = ref(false)
const count = ref(5)
const results = ref<string[]>([])
const copiedIndex = ref(-1)

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const AMBIGUOUS = '0OIl1'

const charset = computed(() => {
  let chars = ''
  if (useUppercase.value) chars += UPPER
  if (useLowercase.value) chars += LOWER
  if (useNumbers.value) chars += NUMBERS
  if (useSymbols.value) chars += SYMBOLS
  if (excludeAmbiguous.value) chars = chars.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
  return chars
})

const strength = computed(() => {
  if (!charset.value) return { level: 0, label: t('password.strengthWeak') }
  const entropy = Math.log2(charset.value.length) * length.value
  if (entropy < 40) return { level: 1, label: t('password.strengthWeak') }
  if (entropy < 60) return { level: 2, label: t('password.strengthMedium') }
  if (entropy < 80) return { level: 3, label: t('password.strengthStrong') }
  return { level: 4, label: t('password.strengthVeryStrong') }
})

function generate() {
  if (!charset.value) return
  const arr = new Uint32Array(length.value * count.value)
  crypto.getRandomValues(arr)
  results.value = Array.from({ length: count.value }, (_, i) => {
    let pw = ''
    for (let j = 0; j < length.value; j++) {
      pw += charset.value[arr[i * length.value + j] % charset.value.length]
    }
    return pw
  })
}

function copyOne(text: string, index: number) {
  copy(text)
  copiedIndex.value = index
  setTimeout(() => { copiedIndex.value = -1 }, 1500)
}

function copyAll() { copy(results.value.join('\n')) }

generate()
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('password.title') }}</h2>
    <div class="length-row">
      <label class="option-item">{{ t('password.length') }}: {{ length }}</label>
      <input type="range" v-model.number="length" min="8" max="128" class="slider" />
    </div>
    <div class="options-row">
      <label class="option-item toggle"><input type="checkbox" v-model="useUppercase" /> {{ t('password.uppercase') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="useLowercase" /> {{ t('password.lowercase') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="useNumbers" /> {{ t('password.numbers') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="useSymbols" /> {{ t('password.symbols') }}</label>
      <label class="option-item toggle"><input type="checkbox" v-model="excludeAmbiguous" /> {{ t('password.excludeAmbiguous') }}</label>
    </div>
    <div class="options-row">
      <label class="option-item">{{ t('password.count') }} <input type="number" v-model.number="count" min="1" max="20" class="num-input" /></label>
    </div>
    <p v-if="!charset" class="error-msg">{{ t('password.noCharset') }}</p>
    <div class="btn-row">
      <button class="btn btn-primary" @click="generate" :disabled="!charset">{{ t('password.generate') }}</button>
      <button class="btn" @click="copyAll" :disabled="!results.length">{{ copied ? t('password.copied') : t('password.copyAll') }}</button>
    </div>
    <div v-if="charset && results.length" class="strength-bar">
      <span class="strength-label">{{ t('password.strength') }}: {{ strength.label }}</span>
      <div class="strength-track">
        <div class="strength-fill" :class="'level-' + strength.level" :style="{ width: (strength.level * 25) + '%' }"></div>
      </div>
    </div>
    <ul v-if="results.length" class="result-list">
      <li v-for="(pw, i) in results" :key="i" class="result-item">
        <code class="pw-text">{{ pw }}</code>
        <button class="btn btn-sm" @click="copyOne(pw, i)">{{ copiedIndex === i ? t('password.copied') : t('password.copy') }}</button>
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
.length-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.slider { flex: 1; accent-color: var(--primary); }
.options-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.option-item { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text); }
.option-item.toggle { cursor: pointer; }
.num-input {
  width: 60px; padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.85rem; text-align: center;
}
.btn-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
.strength-bar { margin-bottom: 14px; }
.strength-label { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 6px; display: block; }
.strength-track { height: 6px; border-radius: 3px; background: var(--surface2); overflow: hidden; }
.strength-fill { height: 100%; border-radius: 3px; transition: width 0.3s, background 0.3s; }
.level-1 { background: var(--red); }
.level-2 { background: #f0932b; }
.level-3 { background: #6c63ff; }
.level-4 { background: var(--accent); }
.result-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.result-item {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 12px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2);
}
.pw-text { font-family: var(--font-mono); font-size: 0.82rem; color: var(--text); word-break: break-all; }
.error-msg {
  margin-bottom: 12px; padding: 10px 14px; background: rgba(255,71,87,0.08);
  border: 1px solid rgba(255,71,87,0.25); border-radius: var(--radius); color: var(--red); font-size: 0.82rem;
}
</style>
```

- [ ] **Step 2: Verify build**

```bash
cd D:/Projects/geek-toolbox && npx vue-tsc --noEmit 2>&1 | head -20
```

---

## Task 7: Implement Case Convert Tool

**Files:**
- Create: `src/components/tools/CaseConvertTool.vue`

- [ ] **Step 1: Create CaseConvertTool.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()

type CaseFormat = 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant'

const input = ref('')
const targetFormat = ref<CaseFormat>('camel')

function splitWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function toCase(words: string[], format: CaseFormat): string {
  if (!words.length) return ''
  const lower = words.map(w => w.toLowerCase())
  switch (format) {
    case 'camel': return lower[0] + lower.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join('')
    case 'pascal': return lower.map(w => w[0].toUpperCase() + w.slice(1)).join('')
    case 'snake': return lower.join('_')
    case 'kebab': return lower.join('-')
    case 'constant': return lower.map(w => w.toUpperCase()).join('_')
  }
}

const output = computed(() => {
  if (!input.value.trim()) return ''
  return input.value.split('\n').map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    return toCase(splitWords(trimmed), targetFormat.value)
  }).join('\n')
})

function copyResult() { if (output.value) copy(output.value) }

const formats: CaseFormat[] = ['camel', 'pascal', 'snake', 'kebab', 'constant']
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('caseconvert.title') }}</h2>
    <textarea v-model="input" class="tool-input" :placeholder="t('caseconvert.inputPlaceholder')" rows="5"></textarea>
    <div class="format-row">
      <span class="format-label">{{ t('caseconvert.targetFormat') }}</span>
      <div class="format-btns">
        <button v-for="f in formats" :key="f" :class="['btn btn-sm', targetFormat === f && 'btn-primary']" @click="targetFormat = f">
          {{ t('caseconvert.formats.' + f) }}
        </button>
      </div>
    </div>
    <div v-if="output" class="result-box">
      <label class="result-label">{{ t('caseconvert.result') }}</label>
      <pre class="tool-output">{{ output }}</pre>
      <button class="btn btn-sm" @click="copyResult">{{ copied ? t('caseconvert.copied') : t('caseconvert.copy') }}</button>
    </div>
  </div>
</template>

<style scoped>
.tool-container { max-width: 800px; margin: 0 auto; }
.tool-title {
  font-size: 1.3rem; font-weight: 600; margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tool-input {
  width: 100%; padding: 14px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
  resize: vertical; box-sizing: border-box; transition: border-color 0.2s;
}
.tool-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(108,99,255,0.12); }
.format-row { margin: 14px 0; }
.format-label { font-size: 0.82rem; color: var(--text-dim); display: block; margin-bottom: 8px; }
.format-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }
.result-box { margin-top: 14px; }
.result-label { font-size: 0.82rem; color: var(--text-dim); margin-bottom: 6px; display: block; }
.tool-output {
  padding: 14px; border-radius: var(--radius); border: 1px solid rgba(108,99,255,0.2);
  background: rgba(108,99,255,0.04); color: var(--text); font-family: var(--font-mono);
  font-size: 0.82rem; white-space: pre-wrap; word-break: break-all;
}
</style>
```

- [ ] **Step 2: Verify build**

```bash
cd D:/Projects/geek-toolbox && npx vue-tsc --noEmit 2>&1 | head -20
```

---

## Task 8: Implement QR Code Generator

**Files:**
- Create: `src/components/tools/QrcodeTool.vue`

- [ ] **Step 1: Create QrcodeTool.vue**

```vue
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'

const { t } = useI18n()

const input = ref('')
const size = ref(256)
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasContent = ref(false)

async function generate() {
  if (!input.value.trim() || !canvasRef.value) {
    hasContent.value = false
    return
  }
  await QRCode.toCanvas(canvasRef.value, input.value, {
    width: size.value,
    errorCorrectionLevel: errorLevel.value,
    margin: 2,
    color: { dark: '#e0e0f0', light: '#1a1a2e' }
  })
  hasContent.value = true
}

watch([input, size, errorLevel], () => { nextTick(generate) })

function download() {
  if (!canvasRef.value || !hasContent.value) return
  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('qrcode.title') }}</h2>
    <textarea v-model="input" class="tool-input" :placeholder="t('qrcode.inputPlaceholder')" rows="4"></textarea>
    <div class="options-row">
      <label class="option-item">
        {{ t('qrcode.size') }}
        <input type="range" v-model.number="size" min="128" max="512" step="32" class="slider" />
        <span class="size-val">{{ size }}px</span>
      </label>
      <label class="option-item">
        {{ t('qrcode.errorLevel') }}
        <select v-model="errorLevel" class="select-input">
          <option value="L">{{ t('qrcode.levels.L') }}</option>
          <option value="M">{{ t('qrcode.levels.M') }}</option>
          <option value="Q">{{ t('qrcode.levels.Q') }}</option>
          <option value="H">{{ t('qrcode.levels.H') }}</option>
        </select>
      </label>
    </div>
    <div class="canvas-wrap">
      <canvas ref="canvasRef"></canvas>
      <p v-if="!hasContent" class="empty-hint">{{ t('qrcode.emptyInput') }}</p>
    </div>
    <button v-if="hasContent" class="btn btn-primary" @click="download">{{ t('qrcode.download') }}</button>
  </div>
</template>

<style scoped>
.tool-container { max-width: 800px; margin: 0 auto; }
.tool-title {
  font-size: 1.3rem; font-weight: 600; margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tool-input {
  width: 100%; padding: 14px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
  resize: vertical; box-sizing: border-box; transition: border-color 0.2s;
}
.tool-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(108,99,255,0.12); }
.options-row { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin: 14px 0; }
.option-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text); }
.slider { width: 120px; accent-color: var(--primary); }
.size-val { font-size: 0.75rem; color: var(--text-dim); min-width: 45px; }
.select-input {
  padding: 4px 8px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.82rem;
}
.canvas-wrap {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); margin-bottom: 14px; min-height: 180px;
}
.empty-hint { color: var(--text-dim); font-size: 0.82rem; }
.btn { padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn:hover { border-color: var(--primary); color: var(--primary); }
.btn-primary { background: var(--gradient-primary); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); color: #fff; }
</style>
```

- [ ] **Step 2: Verify build**

```bash
cd D:/Projects/geek-toolbox && npx vue-tsc --noEmit 2>&1 | head -20
```

---

## Task 9: Final verification

- [ ] **Step 1: Full type check**

```bash
cd D:/Projects/geek-toolbox && npx vue-tsc --noEmit
```

- [ ] **Step 2: Build production bundle**

```bash
cd D:/Projects/geek-toolbox && npm run build
```

- [ ] **Step 3: Start dev server and verify tools load**

```bash
cd D:/Projects/geek-toolbox && npm run dev
```

Open browser, verify all 5 new tools appear in the developer category grid and function correctly.

- [ ] **Step 4: Commit**

```bash
cd D:/Projects/geek-toolbox && git add -A && git commit -m "feat: add 5 new developer tools (UUID, Hash, Password, Case Convert, QR Code)"
```
