# 极客工具箱 Vue3 + TypeScript 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有纯静态单页应用重构为 Vue3 + TypeScript 组件化项目，同时优化为混合布局（首页卡片网格 + 全宽工具工作区）。

**Architecture:** 单层组件结构，每个工具一个 SFC，通过 useToolNav composable 管理导航状态，App.vue 用动态组件切换视图。工具组件通过 defineAsyncComponent 懒加载。

**Tech Stack:** Vite, Vue 3 (Composition API + script setup), TypeScript, vue-i18n, CSS Variables + Scoped Styles

---

## File Structure

```
geek-toolbox/
├── index.html                          # Vite 入口 HTML
├── vite.config.ts                      # Vite 配置
├── tsconfig.json                       # TypeScript 配置
├── tsconfig.node.json                  # Node 环境 TS 配置
├── package.json                        # 依赖和脚本
├── env.d.ts                            # 全局类型声明
├── public/
│   ├── donate.png                      # 打赏二维码
│   └── donate.jpg                      # 打赏图片
├── src/
│   ├── main.ts                         # createApp + i18n 插件注册
│   ├── App.vue                         # 根组件：首页/工具切换
│   ├── registry.ts                     # 工具注册表
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue           # 顶部栏
│   │   │   ├── CategoryTabs.vue        # 分类 pill 标签
│   │   │   ├── ToolGrid.vue            # 工具卡片网格
│   │   │   ├── ToolCard.vue            # 单个工具卡片
│   │   │   └── AppFooter.vue           # 底部链接
│   │   └── tools/
│   │       ├── TimestampTool.vue       # 时间戳转换
│   │       ├── JsonTool.vue            # JSON 格式化
│   │       ├── DiffTool.vue            # 文本对比
│   │       ├── Base64Tool.vue          # Base64 编解码
│   │       ├── CountTool.vue           # 字数统计
│   │       ├── UrlTool.vue             # URL 编解码
│   │       ├── RegexTool.vue           # 正则测试
│   │       ├── JwtTool.vue             # JWT 解码
│   │       ├── YamlTool.vue            # YAML ↔ JSON
│   │       ├── ColorTool.vue           # 颜色转换
│   │       ├── ImageTool.vue           # 图片压缩
│   │       ├── ConvertTool.vue         # 文件转换
│   │       ├── AnnotateTool.vue        # 截图标注
│   │       └── CardTool.vue            # 文字转图卡片
│   ├── composables/
│   │   ├── useToolNav.ts              # 工具导航状态
│   │   ├── useClipboard.ts            # 复制 + 反馈
│   │   └── useScriptLoader.ts         # CDN 懒加载
│   ├── locales/
│   │   ├── zh-CN.json                 # 中文翻译
│   │   └── en.json                    # 英文翻译
│   ├── types/
│   │   └── tools.ts                   # ToolMeta, ToolCategory
│   └── styles/
│       ├── variables.css              # CSS 变量
│       ├── base.css                   # reset + body
│       └── components.css             # btn, input, code-output 等
```

---

## Task 1: 项目脚手架搭建

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `env.d.ts`, `src/main.ts`, `src/App.vue`

- [ ] **Step 1: 初始化 Vite + Vue3 + TypeScript 项目**

```bash
cd D:/Projects/geek-toolbox
npm create vite@latest . -- --template vue-ts
```

如果目录非空，选择忽略已有文件。删除 Vite 模板生成的示例文件（src/components/HelloWorld.vue, src/assets/ 等）。

- [ ] **Step 2: 安装依赖**

```bash
npm install vue-i18n@9
npm install -D @types/node
```

- [ ] **Step 3: 配置 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

- [ ] **Step 4: 配置 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "env.d.ts"]
}
```

- [ ] **Step 5: 创建 env.d.ts**

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface EyeDropper {
  open(): Promise<{ sRGBHex: string }>
}
declare var EyeDropper: { new(): EyeDropper } | undefined
```

- [ ] **Step 6: 创建最小 src/main.ts**

```typescript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

- [ ] **Step 7: 创建最小 src/App.vue**

```vue
<script setup lang="ts">
</script>

<template>
  <div class="app">
    <h1>极客工具箱</h1>
  </div>
</template>
```

- [ ] **Step 8: 更新 index.html 为 Vite 入口**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>极客工具箱 · Geek Toolbox</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 9: 验证项目启动**

```bash
npm run dev
```

Expected: 浏览器打开后显示"极客工具箱"文字，无编译错误。

- [ ] **Step 10: 提交**

```bash
git add -A
git commit -m "feat: scaffold Vite + Vue3 + TypeScript project"
```

---

## Task 2: 全局样式系统

**Files:**
- Create: `src/styles/variables.css`, `src/styles/base.css`, `src/styles/components.css`
- Modify: `src/main.ts`

- [ ] **Step 1: 创建 src/styles/variables.css**

```css
:root {
  --bg: #0f0f1a;
  --surface: #1a1a2e;
  --surface2: #222240;
  --border: #2a2a4a;
  --border-soft: rgba(108, 99, 255, 0.14);
  --text: #e0e0f0;
  --text-dim: #8888aa;
  --primary: #6c63ff;
  --primary-glow: rgba(108, 99, 255, 0.3);
  --accent: #00d4aa;
  --red: #ff4757;
  --radius: 10px;
  --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 2: 创建 src/styles/base.css**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}
```

- [ ] **Step 3: 创建 src/styles/components.css**

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.btn:active { transform: scale(0.97); }
.btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.btn.primary:hover { filter: brightness(1.1); }
.btn.outline { background: transparent; border-color: var(--border); }
.btn.outline:hover { border-color: var(--primary); color: var(--primary); }
.btn.red { background: rgba(255,71,87,0.15); border-color: rgba(255,71,87,0.3); color: var(--red); }
.btn.red:hover { background: rgba(255,71,87,0.25); }

.code-input {
  width: 100%;
  min-height: 140px;
  padding: 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}
.code-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108,99,255,0.15);
}

.code-output {
  width: 100%;
  min-height: 80px;
  padding: 14px;
  background: rgba(108,99,255,0.05);
  border: 1px solid rgba(108,99,255,0.2);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
}

.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.error-msg {
  color: var(--red);
  font-size: 0.8rem;
  margin: 6px 0;
  min-height: 1.2em;
}

.label {
  display: block;
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-bottom: 6px;
  font-weight: 500;
}

.ts-input {
  padding: 8px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}
.ts-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108,99,255,0.15);
}

.ts-select {
  padding: 6px 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.82rem;
  outline: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to { opacity: 0; transform: translateY(-4px); }
```

- [ ] **Step 4: 在 main.ts 中导入样式**

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import './styles/variables.css'
import './styles/base.css'
import './styles/components.css'

const app = createApp(App)
app.mount('#app')
```

- [ ] **Step 5: 验证样式生效**

```bash
npm run dev
```

Expected: 页面背景变为深色 (#0f0f1a)，文字为浅色。

- [ ] **Step 6: 提交**

```bash
git add src/styles/ src/main.ts
git commit -m "feat: add global style system (variables, base, components)"
```

---

## Task 3: 类型定义 + 工具注册表

**Files:**
- Create: `src/types/tools.ts`, `src/registry.ts`

- [ ] **Step 1: 创建 src/types/tools.ts**

```typescript
import type { Component } from 'vue'

export type ToolCategory = 'developer' | 'text' | 'image' | 'file'

export interface ToolMeta {
  id: string
  category: ToolCategory
  icon: string
  titleKey: string
  descKey: string
  component: () => Promise<Component>
}

export interface CategoryMeta {
  id: ToolCategory | 'all'
  titleKey: string
}
```

- [ ] **Step 2: 创建 src/registry.ts**

```typescript
import { defineAsyncComponent } from 'vue'
import type { ToolMeta, CategoryMeta } from '@/types/tools'

export const CATEGORIES: CategoryMeta[] = [
  { id: 'all', titleKey: 'categories.all' },
  { id: 'developer', titleKey: 'categories.developer' },
  { id: 'text', titleKey: 'categories.text' },
  { id: 'image', titleKey: 'categories.image' },
  { id: 'file', titleKey: 'categories.file' }
]

export const TOOLS: ToolMeta[] = [
  {
    id: 'timestamp',
    category: 'developer',
    icon: '🕐',
    titleKey: 'tabs.timestamp',
    descKey: 'toolCards.timestamp',
    component: () => import('@/components/tools/TimestampTool.vue')
  },
  {
    id: 'json',
    category: 'developer',
    icon: '📋',
    titleKey: 'tabs.json',
    descKey: 'toolCards.json',
    component: () => import('@/components/tools/JsonTool.vue')
  },
  {
    id: 'diff',
    category: 'text',
    icon: '📝',
    titleKey: 'tabs.diff',
    descKey: 'toolCards.diff',
    component: () => import('@/components/tools/DiffTool.vue')
  },
  {
    id: 'base64',
    category: 'developer',
    icon: '🔐',
    titleKey: 'tabs.base64',
    descKey: 'toolCards.base64',
    component: () => import('@/components/tools/Base64Tool.vue')
  },
  {
    id: 'count',
    category: 'text',
    icon: '🔢',
    titleKey: 'tabs.count',
    descKey: 'toolCards.count',
    component: () => import('@/components/tools/CountTool.vue')
  },
  {
    id: 'url',
    category: 'developer',
    icon: '🔗',
    titleKey: 'tabs.url',
    descKey: 'toolCards.url',
    component: () => import('@/components/tools/UrlTool.vue')
  },
  {
    id: 'regex',
    category: 'developer',
    icon: '🧪',
    titleKey: 'tabs.regex',
    descKey: 'toolCards.regex',
    component: () => import('@/components/tools/RegexTool.vue')
  },
  {
    id: 'jwt',
    category: 'developer',
    icon: '🎫',
    titleKey: 'tabs.jwt',
    descKey: 'toolCards.jwt',
    component: () => import('@/components/tools/JwtTool.vue')
  },
  {
    id: 'yaml',
    category: 'developer',
    icon: '🔄',
    titleKey: 'tabs.yaml',
    descKey: 'toolCards.yaml',
    component: () => import('@/components/tools/YamlTool.vue')
  },
  {
    id: 'color',
    category: 'image',
    icon: '🎨',
    titleKey: 'tabs.color',
    descKey: 'toolCards.color',
    component: () => import('@/components/tools/ColorTool.vue')
  },
  {
    id: 'image',
    category: 'image',
    icon: '🖼️',
    titleKey: 'tabs.image',
    descKey: 'toolCards.image',
    component: () => import('@/components/tools/ImageTool.vue')
  },
  {
    id: 'convert',
    category: 'file',
    icon: '📁',
    titleKey: 'tabs.convert',
    descKey: 'toolCards.convert',
    component: () => import('@/components/tools/ConvertTool.vue')
  },
  {
    id: 'annotate',
    category: 'image',
    icon: '✏️',
    titleKey: 'tabs.annotate',
    descKey: 'toolCards.annotate',
    component: () => import('@/components/tools/AnnotateTool.vue')
  },
  {
    id: 'card',
    category: 'text',
    icon: '🃏',
    titleKey: 'tabs.card',
    descKey: 'toolCards.card',
    component: () => import('@/components/tools/CardTool.vue')
  }
]

export function getToolById(id: string): ToolMeta | undefined {
  return TOOLS.find(t => t.id === id)
}

export function getToolsByCategory(category: string): ToolMeta[] {
  if (category === 'all') return TOOLS
  return TOOLS.filter(t => t.category === category)
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
npx vue-tsc --noEmit
```

Expected: 会报错因为工具组件文件不存在，这是预期的。类型文件本身无错误即可。

- [ ] **Step 4: 提交**

```bash
git add src/types/ src/registry.ts
git commit -m "feat: add tool type definitions and registry"
```

---

## Task 4: Composables（共享逻辑）

**Files:**
- Create: `src/composables/useToolNav.ts`, `src/composables/useClipboard.ts`, `src/composables/useScriptLoader.ts`

- [ ] **Step 1: 创建 src/composables/useToolNav.ts**

```typescript
import { ref, computed } from 'vue'
import { TOOLS, getToolById } from '@/registry'
import type { ToolMeta } from '@/types/tools'

const currentToolId = ref<string | null>(null)
const currentCategory = ref<string>('all')

export function useToolNav() {
  const currentTool = computed<ToolMeta | undefined>(() =>
    currentToolId.value ? getToolById(currentToolId.value) : undefined
  )

  function openTool(id: string) {
    currentToolId.value = id
  }

  function goHome() {
    currentToolId.value = null
  }

  function setCategory(category: string) {
    currentCategory.value = category
  }

  return {
    currentToolId,
    currentTool,
    currentCategory,
    openTool,
    goHome,
    setCategory
  }
}
```

- [ ] **Step 2: 创建 src/composables/useClipboard.ts**

```typescript
import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      setTimeout(() => { copied.value = false }, 1500)
      return true
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (success) {
        copied.value = true
        setTimeout(() => { copied.value = false }, 1500)
      }
      return success
    }
  }

  return { copied, copy }
}
```

- [ ] **Step 3: 创建 src/composables/useScriptLoader.ts**

```typescript
const cache: Record<string, Promise<void>> = {}

export function useScriptLoader() {
  function loadScript(url: string): Promise<void> {
    if (cache[url]) return cache[url]

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => resolve()
      script.onerror = () => {
        delete cache[url]
        reject(new Error(`Failed to load: ${url}`))
      }
      document.head.appendChild(script)
    })

    cache[url] = promise
    return promise
  }

  return { loadScript }
}

export const CDN = {
  XLSX: 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js',
  MAMMOTH: 'https://cdn.jsdelivr.net/npm/mammoth/mammoth.browser.min.js',
  PDFJS: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  PDFJS_WORKER: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  YAML: 'https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js'
} as const
```

- [ ] **Step 4: 验证编译**

```bash
npx vue-tsc --noEmit 2>&1 | head -5
```

Expected: composables 本身无类型错误。

- [ ] **Step 5: 提交**

```bash
git add src/composables/
git commit -m "feat: add composables (useToolNav, useClipboard, useScriptLoader)"
```

---

## Task 5: i18n 国际化设置

**Files:**
- Create: `src/locales/zh-CN.json`, `src/locales/en.json`
- Modify: `src/main.ts`

- [ ] **Step 1: 创建 src/locales/zh-CN.json**

从现有 `app.js` 中的 `translations['zh-CN']` 对象提取，转为独立 JSON 文件。保持完整的嵌套结构（common, categories, header, tabs, home, annotate, card, toolCards, json, diff, base64, count, url, regex, jwt, yaml, color, timestamp, image, convert, support, footer）。

- [ ] **Step 2: 创建 src/locales/en.json**

从现有 `app.js` 中的 `translations['en']` 对象提取，结构与 zh-CN.json 完全对应。

- [ ] **Step 3: 在 main.ts 中配置 vue-i18n**

```typescript
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './styles/variables.css'
import './styles/base.css'
import './styles/components.css'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

const savedLang = localStorage.getItem('geek-toolbox-language') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { 'zh-CN': zhCN, en }
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
```

- [ ] **Step 4: 验证 i18n 加载**

在 App.vue 中临时使用 `{{ $t('header.logo') }}` 验证翻译正常工作。

- [ ] **Step 5: 提交**

```bash
git add src/locales/ src/main.ts
git commit -m "feat: add vue-i18n with zh-CN and en locale files"
```

---

## Task 6: 布局组件

**Files:**
- Create: `src/components/layout/AppHeader.vue`, `src/components/layout/CategoryTabs.vue`, `src/components/layout/ToolGrid.vue`, `src/components/layout/ToolCard.vue`, `src/components/layout/AppFooter.vue`

- [ ] **Step 1: 创建 AppHeader.vue**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

function setLanguage(lang: string) {
  locale.value = lang
  localStorage.setItem('geek-toolbox-language', lang)
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
        <div class="lang-switcher" :aria-label="t('header.languageSwitcherLabel')">
          <button class="lang-btn" :class="{ active: locale === 'zh-CN' }"
                  @click="setLanguage('zh-CN')">{{ t('header.languageZh') }}</button>
          <button class="lang-btn" :class="{ active: locale === 'en' }"
                  @click="setLanguage('en')">{{ t('header.languageEn') }}</button>
        </div>
      </div>
    </div>
  </header>
</template>
```

样式使用 scoped styles，从现有 style.css 中提取 `.header` 相关规则。

- [ ] **Step 2: 创建 CategoryTabs.vue**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToolNav } from '@/composables/useToolNav'
import { CATEGORIES } from '@/registry'

const { t } = useI18n()
const { currentCategory, setCategory } = useToolNav()
</script>

<template>
  <nav class="category-tabs" :aria-label="t('home.toolNavAriaLabel')">
    <button v-for="cat in CATEGORIES" :key="cat.id"
            class="category-pill"
            :class="{ active: currentCategory === cat.id }"
            @click="setCategory(cat.id)">
      {{ t(cat.titleKey) }}
    </button>
  </nav>
</template>
```

- [ ] **Step 3: 创建 ToolCard.vue**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ToolMeta } from '@/types/tools'

const props = defineProps<{ tool: ToolMeta }>()
const emit = defineEmits<{ open: [id: string] }>()
const { t } = useI18n()
</script>

<template>
  <article class="tool-card" @click="emit('open', tool.id)">
    <span class="tool-card-icon">{{ tool.icon }}</span>
    <h3 class="tool-card-title">{{ t(tool.titleKey) }}</h3>
    <p class="tool-card-desc">{{ t(tool.descKey) }}</p>
  </article>
</template>
```

- [ ] **Step 4: 创建 ToolGrid.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useToolNav } from '@/composables/useToolNav'
import { getToolsByCategory } from '@/registry'
import ToolCard from './ToolCard.vue'

const { currentCategory, openTool } = useToolNav()

const tools = computed(() => getToolsByCategory(currentCategory.value))
</script>

<template>
  <div class="tool-grid">
    <ToolCard v-for="tool in tools" :key="tool.id"
              :tool="tool" @open="openTool" />
  </div>
</template>
```

- [ ] **Step 5: 创建 AppFooter.vue**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <footer class="footer">
    <p>{{ t('footer.copyright') }}</p>
    <a href="https://github.com/yyang0611/geek-toolbox" target="_blank">GitHub</a>
  </footer>
</template>
```

- [ ] **Step 6: 验证布局组件渲染**

在 App.vue 中组合所有布局组件，确认首页卡片网格正常显示。

- [ ] **Step 7: 提交**

```bash
git add src/components/layout/
git commit -m "feat: add layout components (Header, CategoryTabs, ToolGrid, ToolCard, Footer)"
```

---

## Task 7: App.vue 根组件 + 导航逻辑

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 实现 App.vue 首页/工具切换**

```vue
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useToolNav } from '@/composables/useToolNav'
import AppHeader from '@/components/layout/AppHeader.vue'
import CategoryTabs from '@/components/layout/CategoryTabs.vue'
import ToolGrid from '@/components/layout/ToolGrid.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const { currentTool, goHome } = useToolNav()

const ActiveToolComponent = computed(() => {
  if (!currentTool.value) return null
  return defineAsyncComponent(currentTool.value.component)
})
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <template v-if="!currentTool">
        <CategoryTabs />
        <ToolGrid />
      </template>
      <template v-else>
        <div class="tool-workspace">
          <button class="btn outline back-btn" @click="goHome">← 返回</button>
          <component :is="ActiveToolComponent" />
        </div>
      </template>
    </main>
    <AppFooter />
  </div>
</template>
```

- [ ] **Step 2: 添加 App.vue scoped 样式**

实现混合布局：首页为卡片网格（max-width 容器），工具工作区为全宽。

```css
.main-content {
  flex: 1;
  padding: 24px;
}
.tool-workspace {
  max-width: 1200px;
  margin: 0 auto;
}
.back-btn {
  margin-bottom: 16px;
}
```

- [ ] **Step 3: 验证导航切换**

点击工具卡片进入工具视图，点击返回回到首页。

- [ ] **Step 4: 提交**

```bash
git add src/App.vue
git commit -m "feat: implement App.vue with home/tool view switching"
```

---

## Task 8: 工具组件迁移（核心工具）

**Files:**
- Create: `src/components/tools/TimestampTool.vue`, `JsonTool.vue`, `DiffTool.vue`, `Base64Tool.vue`, `CountTool.vue`, `UrlTool.vue`, `RegexTool.vue`, `JwtTool.vue`, `YamlTool.vue`, `ColorTool.vue`

每个工具组件从现有 `app.js` 中对应的 DOM 操作逻辑迁移为 Vue3 Composition API 响应式实现。

- [ ] **Step 1: TimestampTool.vue**

迁移时间戳转换功能：
- 实时时间戳显示（setInterval）
- 秒/毫秒单位切换
- 日期 → 时间戳、时间戳 → 日期双向转换
- 快捷按钮（此刻、今天、明天等）
- 使用 `useClipboard` composable

- [ ] **Step 2: JsonTool.vue**

迁移 JSON 格式化/压缩/校验功能：
- textarea 输入
- 格式化（2空格缩进）、压缩、清空按钮
- 错误提示
- 复制结果

- [ ] **Step 3: DiffTool.vue**

迁移文本对比功能：
- 左右两栏 textarea
- 逐行对比算法（保留现有 LCS 实现）
- 差异高亮显示（added/removed/modified）

- [ ] **Step 4: Base64Tool.vue**

迁移 Base64 编解码：
- 单 textarea + 编码/解码按钮
- 错误处理
- 复制结果

- [ ] **Step 5: CountTool.vue**

迁移字数统计：
- textarea 输入
- 实时统计：总字符、中文字、英文单词、行数、空格、标点
- 响应式 computed 属性

- [ ] **Step 6: UrlTool.vue**

迁移 URL 编解码：
- 编码/解码按钮
- encodeURIComponent / decodeURIComponent

- [ ] **Step 7: RegexTool.vue**

迁移正则测试器：
- `/pattern/flags` 输入格式
- 匹配/替换模式切换
- 匹配高亮 + 分组显示
- 匹配计数 badge

- [ ] **Step 8: JwtTool.vue**

迁移 JWT 解码器：
- 输入 token
- 解析 header + payload
- 显示过期时间、签发时间
- 过期警告

- [ ] **Step 9: YamlTool.vue**

迁移 YAML ↔ JSON 转换：
- 使用 `useScriptLoader` 懒加载 js-yaml CDN
- 双向转换按钮

- [ ] **Step 10: ColorTool.vue**

迁移颜色转换器：
- 颜色选择器 + 手动输入（HEX/RGB/HSL）
- 透明度滑块
- 色板快捷选择
- EyeDropper API 取色
- 配色方案生成（互补/邻近/三角）
- 历史记录

- [ ] **Step 11: 验证所有核心工具**

逐一打开每个工具，验证基本功能正常。

- [ ] **Step 12: 提交**

```bash
git add src/components/tools/
git commit -m "feat: migrate core tool components (timestamp, json, diff, base64, count, url, regex, jwt, yaml, color)"
```

---

## Task 9: 工具组件迁移（媒体/文件工具）

**Files:**
- Create: `src/components/tools/ImageTool.vue`, `ConvertTool.vue`, `AnnotateTool.vue`, `CardTool.vue`

- [ ] **Step 1: ImageTool.vue**

迁移图片压缩功能：
- 文件上传（拖拽 + 点击）
- Canvas 压缩
- 质量滑块
- 批量处理
- 压缩前后对比
- 下载压缩结果

- [ ] **Step 2: ConvertTool.vue**

迁移文件转换功能：
- 使用 `useScriptLoader` 懒加载 XLSX/Mammoth/PDF.js
- 支持格式：CSV↔XLSX, DOCX→TXT, PDF→TXT
- 文件上传 + 格式选择 + 下载

- [ ] **Step 3: AnnotateTool.vue**

迁移截图标注功能：
- Canvas 绘图（箭头、矩形、文字、序号、马赛克）
- 工具栏切换
- 撤销/重做
- 颜色/线宽/字号设置
- 导出 PNG

- [ ] **Step 4: CardTool.vue**

迁移文字转图卡片功能：
- 文本输入 + 实时预览
- 主题切换（深色/浅色）
- 尺寸选择（方形/竖版/横版）
- 导出 PNG / 复制图片

- [ ] **Step 5: 验证媒体工具**

测试图片上传、标注绘制、卡片导出等交互功能。

- [ ] **Step 6: 提交**

```bash
git add src/components/tools/
git commit -m "feat: migrate media/file tool components (image, convert, annotate, card)"
```

---

## Task 10: UI 优化与布局改进

**Files:**
- Modify: 多个布局和工具组件的样式

- [ ] **Step 1: 首页卡片网格优化**

- 卡片 hover 动效（微上浮 + 边框发光）
- 响应式网格：桌面 3-4 列，平板 2 列，手机 1 列
- 卡片内 icon 放大 + 渐变背景

```css
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.tool-card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.tool-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: 0 4px 20px var(--primary-glow);
}
```

- [ ] **Step 2: 工具工作区布局优化**

- 工具标题 + 描述区域
- 输入/输出区域间距统一
- 按钮组对齐
- 全宽利用（max-width: 900px 居中）

- [ ] **Step 3: 响应式断点完善**

```css
@media (max-width: 768px) {
  .header-bar { flex-direction: column; gap: 12px; }
  .tool-grid { grid-template-columns: 1fr; }
  .main-content { padding: 16px; }
}
```

- [ ] **Step 4: 过渡动画**

- 首页 ↔ 工具视图切换使用 Vue `<Transition>` 组件
- 卡片列表使用 `<TransitionGroup>` 实现分类切换动画

- [ ] **Step 5: 深色主题微调**

- 确保所有工具组件在深色背景下对比度达标（WCAG AA）
- 输入框 focus 状态统一
- 按钮 hover/active 状态一致

- [ ] **Step 6: 验证 UI 效果**

在浏览器中检查所有页面的视觉效果和交互动画。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: optimize UI layout, responsive grid, transitions and dark theme"
```

---

## Task 11: 功能完整性验证

**Files:** 无新文件，验证任务

- [ ] **Step 1: 逐工具功能测试清单**

| 工具 | 核心功能 | 验证点 |
|------|----------|--------|
| 时间戳 | 实时显示、双向转换、快捷按钮 | 秒/毫秒切换正确 |
| JSON | 格式化、压缩、校验 | 错误提示准确 |
| 文本对比 | 逐行 diff | 高亮正确 |
| Base64 | 编码/解码 | Unicode 支持 |
| 字数统计 | 实时统计 | 中英文分词准确 |
| URL | 编码/解码 | 特殊字符处理 |
| 正则 | 匹配/替换/分组 | flags 解析正确 |
| JWT | 解码/过期检测 | 无效 token 提示 |
| YAML | 双向转换 | CDN 加载成功 |
| 颜色 | HEX/RGB/HSL 互转 | 透明度、取色器 |
| 图片压缩 | 上传/压缩/下载 | 批量处理 |
| 文件转换 | 格式转换/下载 | CDN 懒加载 |
| 截图标注 | 绘制/撤销/导出 | Canvas 交互 |
| 文字卡片 | 输入/预览/导出 | 主题切换 |

- [ ] **Step 2: i18n 完整性验证**

- 切换中英文，确认所有文本正确翻译
- 检查是否有遗漏的硬编码中文

- [ ] **Step 3: 复制功能验证**

- 所有"复制"按钮正常工作
- 复制反馈（✅ 已复制）正确显示

- [ ] **Step 4: 浏览器兼容性**

- Chrome 最新版
- Firefox 最新版
- Edge 最新版

- [ ] **Step 5: 修复发现的问题**

根据测试结果修复 bug。

- [ ] **Step 6: 提交修复**

```bash
git add -A
git commit -m "fix: address issues found during feature completeness verification"
```

---

## Task 12: 迁移清理 + 构建验证

**Files:**
- Delete: 旧的 `app.js`, `style.css`（保留在 git 历史中）
- Modify: `index.html`（已在 Task 1 替换为 Vite 入口）

- [ ] **Step 1: 移除旧文件**

```bash
git rm app.js style.css
```

保留 `public/donate.png`, `public/donate.jpg`（已在 Task 1 移入 public/）。

- [ ] **Step 2: 确认 Cloudflare Analytics 保留**

在 `index.html` 的 `<head>` 中保留 Cloudflare Web Analytics 脚本：

```html
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "302b14ed0cb741ccbccbb7af3442598a"}'></script>
```

- [ ] **Step 3: 生产构建验证**

```bash
npm run build
```

Expected: `dist/` 目录生成，无编译错误。

- [ ] **Step 4: 预览生产构建**

```bash
npm run preview
```

在浏览器中验证生产版本功能正常。

- [ ] **Step 5: 检查构建产物大小**

确认主 bundle 合理（目标 < 200KB gzipped，不含 CDN 懒加载库）。

- [ ] **Step 6: 最终提交**

```bash
git add -A
git commit -m "chore: remove legacy static files, verify production build"
```

---

## 执行顺序总结

| Task | 内容 | 依赖 |
|------|------|------|
| 1 | 项目脚手架 | 无 |
| 2 | 全局样式 | Task 1 |
| 3 | 类型 + 注册表 | Task 1 |
| 4 | Composables | Task 3 |
| 5 | i18n | Task 1 |
| 6 | 布局组件 | Task 2-5 |
| 7 | App.vue | Task 6 |
| 8 | 核心工具组件 | Task 4, 7 |
| 9 | 媒体工具组件 | Task 4, 7 |
| 10 | UI 优化 | Task 8, 9 |
| 11 | 功能验证 | Task 10 |
| 12 | 清理 + 构建 | Task 11 |

**并行机会：** Task 2/3/5 可并行；Task 8/9 可并行。
