# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check (vue-tsc) + Vite production build
npm run preview   # Preview production build locally
```

No test runner is configured.

## Architecture

Vue 3 + TypeScript single-page app. A local-first browser toolbox with no backend. Bilingual (zh-CN / en) via vue-i18n Composition mode.

**No vue-router.** Navigation is a reactive `currentToolId` ref in `src/composables/useToolNav.ts`. App.vue switches between home grid and active tool workspace based on this state.

### Tool Registry Pattern

Every tool is declared in `src/registry.ts` as a `ToolMeta` entry:

```ts
{
  id: string,
  category: 'developer' | 'text' | 'image' | 'file',
  icon: string,
  titleKey: string,       // i18n key: tabs.<id>
  descKey: string,        // i18n key: toolCards.<id>
  featured?: boolean,
  component: () => import('@/components/tools/XxxTool.vue')
}
```

Categories are defined in `CATEGORIES` array in the same file.

### Adding a New Tool

1. Create `src/components/tools/<Name>Tool.vue`
2. Add entry to `TOOLS` array in `src/registry.ts`
3. Add i18n keys to both `src/locales/zh-CN.json` and `src/locales/en.json` (keys: `tabs.<id>` and `toolCards.<id>`)

### Key Composables

- `useToolNav` — navigation state (open/close tool)
- `useDiscovery` — favorites (max 12) and recent tools (max 8), localStorage-backed
- `useClipboard` — copy-to-clipboard utility
- `useScriptLoader` — lazy CDN script loader with dedup caching (used for XLSX, Mammoth, PDF.js, js-yaml)

### External Libraries

Heavy libs are loaded from CDN at runtime via `useScriptLoader`, not bundled. Only `qrcode` is an npm dependency for tool logic.

### Styling

Dark theme, CSS custom properties in `src/styles/variables.css`. No CSS framework. Glassmorphism + glow aesthetic. Scoped styles in `.vue` files for tool-specific styling.

## Conventions

- All tool components use `<script setup lang="ts">` with Composition API
- Tool component files are named `<PascalCase>Tool.vue`
- i18n keys follow `tabs.<toolId>` for title, `toolCards.<toolId>` for description
- Language persisted to localStorage key `geek-toolbox-language`
