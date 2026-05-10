# 极客工具箱 Vue3 + TypeScript 重构设计

## 概述

将现有纯静态单页应用（index.html + app.js 5835行 + style.css 2714行）重构为 Vue3 + TypeScript 项目，同时优化 UI 布局。

## 目标

- 功能对等迁移：14 个工具全部保留，功能不丢失
- 代码组件化：单文件 5800+ 行拆分为独立 SFC
- 类型安全：TypeScript 全覆盖
- UI 优化：混合布局 + 视觉细节改进
- 保留中英文双语支持

## 技术栈

- **构建工具**: Vite
- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript
- **国际化**: vue-i18n
- **状态管理**: Vue 内置响应式 (ref/reactive/computed)
- **路由**: 无，使用动态组件切换
- **CSS**: CSS 变量 + 组件 scoped style

## 布局设计

### 首页（工具网格）

- 顶部：紧凑 Header（logo + 副标题 + 语言切换）
- 中部：分类 pill 标签（全部 / 开发工具 / 文本工具 / 图片工具 / 文件工具）
- 主体：工具卡片网格（图标 + 标题 + 描述），点击进入工具

### 工具页（全宽工作区）

- 顶部：紧凑 Header（← 返回按钮 + 工具名 + 语言切换）
- 主体：工具内容占满宽度，无侧边栏

### 响应式断点

| 断点 | 卡片列数 | 工具区布局 |
|------|----------|-----------|
| ≥ 1024px (Desktop) | 3 列 | 双栏 |
| 768–1023px (Tablet) | 2 列 | 单栏 |
| < 768px (Mobile) | 1 列 | 全宽堆叠 |

## 项目结构

```
src/
├── main.ts                    # 入口：createApp + i18n 插件
├── App.vue                    # 根组件：首页/工具视图切换
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue      # 顶部栏
│   │   ├── ToolGrid.vue       # 首页卡片网格
│   │   ├── ToolCard.vue       # 单个工具卡片
│   │   └── CategoryTabs.vue   # 分类标签
│   └── tools/
│       ├── TimestampTool.vue   # 时间戳转换
│       ├── JsonTool.vue        # JSON 格式化
│       ├── DiffTool.vue        # 文本对比
│       ├── Base64Tool.vue      # Base64 编解码
│       ├── CountTool.vue       # 字数统计
│       ├── UrlTool.vue         # URL 编解码
│       ├── RegexTool.vue       # 正则测试
│       ├── JwtTool.vue         # JWT 解码
│       ├── YamlTool.vue        # YAML ↔ JSON
│       ├── ColorTool.vue       # 颜色转换
│       ├── ImageTool.vue       # 图片压缩
│       ├── ConvertTool.vue     # 文件转换
│       ├── AnnotateTool.vue    # 截图标注
│       └── CardTool.vue        # 文字转图卡片
├── composables/
│   ├── useClipboard.ts        # 复制到剪贴板 + 反馈
│   ├── useToolNav.ts          # 工具导航状态
│   └── useScriptLoader.ts     # CDN 库懒加载
├── locales/
│   ├── zh-CN.json             # 中文翻译
│   └── en.json                # 英文翻译
├── types/
│   └── tools.ts               # ToolMeta 接口、ToolCategory 枚举
├── registry.ts                # 工具注册表
└── styles/
    ├── variables.css           # CSS 变量
    ├── base.css                # reset + 全局样式
    └── components.css          # 共享组件样式
```

## 核心数据流

### 导航状态 (useToolNav)

```typescript
// composables/useToolNav.ts
const currentTool = ref<string | null>(null)
const category = ref<string>('all')

function openTool(id: string) { currentTool.value = id }
function goHome() { currentTool.value = null }
```

### App.vue 切换逻辑

```vue
<template>
  <AppHeader />
  <main>
    <template v-if="!currentTool">
      <CategoryTabs v-model="category" />
      <ToolGrid :category="category" @select="openTool" />
    </template>
    <Transition name="fade">
      <component v-if="currentTool" :is="toolComponent" />
    </Transition>
  </main>
</template>
```

### 工具注册表 (registry.ts)

```typescript
interface ToolMeta {
  id: string
  category: 'developer' | 'text' | 'image' | 'file'
  icon: string
  titleKey: string
  descKey: string
  component: () => Promise<Component>
}
```

工具组件通过 `defineAsyncComponent` 懒加载，首屏只加载首页。

## UI 视觉规范

### 主题色

- `--bg`: #0f0f1a
- `--surface`: #1a1a2e
- `--surface2`: #222240
- `--border`: #2a2a4a
- `--text`: #e0e0f0
- `--text-dim`: #8888aa
- `--primary`: #6c63ff
- `--accent`: #00d4aa
- `--red`: #ff4757

### 按钮系统

| 类型 | 背景 | 用途 |
|------|------|------|
| Primary | #6c63ff 实色 | 主操作（格式化、编码、转换） |
| Outline | 透明 + border | 次要操作（复制、重置） |
| Danger | rgba(255,71,87,0.15) | 破坏性操作（清空） |
| Success | rgba(0,212,170,0.12) | 成功反馈 |

### 输入/输出区

- 输入框：`--surface2` 背景 + `--border` 边框，focus 时 border 变 `--primary` + 外发光
- 输出区：`rgba(108,99,255,0.05)` 背景 + `rgba(108,99,255,0.2)` 边框，与输入区视觉区分

### 动效

- 卡片 hover: translateY(-2px) + border 变亮 + 阴影加深，200ms ease
- 页面切换: Vue Transition，fade + translateY(8px)，150ms
- 按钮点击: scale(0.97)，100ms
- 复制成功: 按钮文字变"✓ 已复制"，1.5s 后恢复

## CDN 依赖策略

以下库保持 CDN 懒加载（通过 useScriptLoader composable）：

- xlsx (XLSX → CSV / CSV → XLSX)
- mammoth (DOCX → TXT)
- pdfjs-dist (PDF → 文本 / PDF → 图片)
- js-yaml (YAML ↔ JSON)

## 迁移范围

14 个工具全部迁移，功能对等：

1. 时间戳转换（含日历选择器、实时时钟、单位切换）
2. JSON 格式化（格式化、压缩、校验）
3. 文本对比（diff 高亮）
4. Base64 编解码
5. 字数统计（实时统计字符/中文/英文/行数/空格/标点）
6. URL 编解码
7. 正则测试（/pattern/flags UX、匹配/替换模式、分组高亮）
8. JWT 解码（Header + Payload + 过期时间）
9. YAML ↔ JSON 转换
10. 颜色转换（拾色器、透明度、HEX/RGB/HSL、配色方案、历史记录）
11. 图片压缩（批量上传、裁剪、格式/质量/尺寸设置、预览）
12. 文件转换（XLSX↔CSV、DOCX→TXT、PDF→文本/图片）
13. 截图标注（箭头、矩形、文字、编号、马赛克、撤销/重做）
14. 文字转图卡片（主题、尺寸、导出 PNG/复制）

## 不在范围内

- 新增工具
- 收藏/最近使用功能（当前未完全实现，不迁移半成品）
- 打赏/联系模态框（简化为 footer 链接）
- 亮色主题
