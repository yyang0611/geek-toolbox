# Cyberpunk Tech Style + UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cyberpunk neon-glow visual style with animations, fix image preview sizing, and redesign the support modal.

**Architecture:** Pure CSS enhancements to existing components + one new Vue particle canvas component. No new dependencies. All animations GPU-accelerated (transform/opacity). Respects `prefers-reduced-motion`.

**Tech Stack:** Vue 3, CSS custom properties, Canvas API, CSS animations/transitions

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/styles/variables.css` | Modify | Add glow/gradient CSS variables |
| `src/styles/base.css` | Modify | Add global keyframes, reduced-motion query |
| `src/styles/components.css` | Modify | Enhance button/input glow effects |
| `src/components/effects/ParticleBackground.vue` | Create | Canvas-based floating particle system |
| `src/App.vue` | Modify | Import ParticleBackground, enhance transition |
| `src/components/layout/AppHeader.vue` | Modify | Gradient border, logo glow |
| `src/components/layout/ToolCard.vue` | Modify | Enhanced hover with neon glow |
| `src/components/layout/SupportModal.vue` | Modify | Full cyberpunk modal redesign |
| `src/components/tools/ImageTool.vue` | Modify | Fix preview image fill |

---

### Task 1: CSS Variables & Global Keyframes

**Files:**
- Modify: `src/styles/variables.css`
- Modify: `src/styles/base.css`

- [ ] **Step 1: Add glow/gradient variables to variables.css**

Replace the entire file content with:

```css
:root {
  --bg: #0f0f1a;
  --surface: #1a1a2e;
  --surface2: #222240;
  --surface-glass: rgba(26, 26, 46, 0.85);
  --border: #2a2a4a;
  --border-soft: rgba(108, 99, 255, 0.14);
  --text: #e0e0f0;
  --text-dim: #8888aa;
  --primary: #6c63ff;
  --primary-glow: rgba(108, 99, 255, 0.3);
  --accent: #00d4aa;
  --accent-glow: rgba(0, 212, 170, 0.25);
  --red: #ff4757;
  --red-glow: rgba(255, 71, 87, 0.25);
  --radius: 10px;
  --font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --glow-primary: 0 0 20px rgba(108, 99, 255, 0.3);
  --glow-accent: 0 0 15px rgba(0, 212, 170, 0.25);
  --glow-red: 0 0 15px rgba(255, 71, 87, 0.25);
  --gradient-primary: linear-gradient(135deg, #6c63ff, #8b5cf6);
  --gradient-accent: linear-gradient(135deg, #00d4aa, #6c63ff);
}
```

- [ ] **Step 2: Add global keyframes and reduced-motion to base.css**

Append to the end of `src/styles/base.css`:

```css
@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes gradient-sweep {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes float-up {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Enhance button and input glow in components.css**

In `src/styles/components.css`, replace the `.btn.primary:hover` rule:

```css
.btn.primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); }
```

Replace the `.btn.outline:hover` rule:

```css
.btn.outline:hover { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 12px rgba(108, 99, 255, 0.15); }
```

Replace the `.code-input:focus` rule:

```css
.code-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.15), var(--glow-primary);
}
```

Replace the `.ts-input:focus` rule:

```css
.ts-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.15), 0 0 12px rgba(108, 99, 255, 0.1);
}
```

Replace the `.fade-enter-active, .fade-leave-active` block and related rules:

```css
.fade-enter-active { transition: opacity 0.3s ease-out, transform 0.3s ease-out; }
.fade-leave-active { transition: opacity 0.2s ease-in, transform 0.2s ease-in; }
.fade-enter-from { opacity: 0; transform: translateY(12px); }
.fade-leave-to { opacity: 0; transform: translateY(-8px); }
```

- [ ] **Step 4: Verify build passes**

Run: `cd D:/Projects/geek-toolbox && npx vue-tsc -b --noEmit && npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/variables.css src/styles/base.css src/styles/components.css
git commit -m "style: add cyberpunk glow variables, keyframes, and enhanced component effects"
```

---

### Task 2: Particle Background Component

**Files:**
- Create: `src/components/effects/ParticleBackground.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Create ParticleBackground.vue**

Create `src/components/effects/ParticleBackground.vue`:

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animId = 0
let particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number }[] = []

const COLORS = ['rgba(108,99,255,', 'rgba(0,212,170,', 'rgba(255,71,87,']
const COUNT = 35

function init() {
  const el = canvas.value
  if (!el) return
  const w = window.innerWidth
  const h = window.innerHeight
  el.width = w
  el.height = h
  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 2 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.5 + 0.2
  }))
}

function draw() {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')!
  const w = el.width
  const h = el.height
  ctx.clearRect(0, 0, w, h)

  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0) p.x = w
    if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h
    if (p.y > h) p.y = 0

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color + p.alpha + ')'
    ctx.shadowBlur = p.size * 4
    ctx.shadowColor = p.color + '0.6)'
    ctx.fill()
    ctx.shadowBlur = 0
  }

  animId = requestAnimationFrame(draw)
}

function onResize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

function onVisibility() {
  if (document.hidden) {
    cancelAnimationFrame(animId)
  } else {
    animId = requestAnimationFrame(draw)
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  init()
  animId = requestAnimationFrame(draw)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <canvas ref="canvas" class="particle-bg" aria-hidden="true" />
</template>

<style scoped>
.particle-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}
</style>
```

- [ ] **Step 2: Import ParticleBackground in App.vue**

In `src/App.vue`, add the import after existing imports:

```typescript
import ParticleBackground from '@/components/effects/ParticleBackground.vue'
```

In the template, add `<ParticleBackground />` as the first child inside `<div class="app">`:

```html
<div class="app">
  <ParticleBackground />
  <AppHeader />
  ...
```

Add to `.app` style to ensure content is above particles:

```css
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 3: Add ambient glow orb to App.vue**

Add a new style rule in `src/App.vue` `<style scoped>`:

```css
.app::before {
  content: '';
  position: fixed;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
```

- [ ] **Step 4: Verify build passes**

Run: `cd D:/Projects/geek-toolbox && npx vue-tsc -b --noEmit && npx vite build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/effects/ParticleBackground.vue src/App.vue
git commit -m "feat: add cyberpunk particle background and ambient glow"
```

---

### Task 3: Header Enhancement

**Files:**
- Modify: `src/components/layout/AppHeader.vue`

- [ ] **Step 1: Replace header styles**

Replace the entire `<style scoped>` section in `AppHeader.vue`:

```css
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
```

- [ ] **Step 2: Verify build passes**

Run: `cd D:/Projects/geek-toolbox && npx vue-tsc -b --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppHeader.vue
git commit -m "style: cyberpunk header with gradient border and logo glow"
```

---

### Task 4: Tool Card Neon Hover

**Files:**
- Modify: `src/components/layout/ToolCard.vue`

- [ ] **Step 1: Replace ToolCard styles**

Replace the entire `<style scoped>` section in `ToolCard.vue`:

```css
.tool-card {
  position: relative;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s, box-shadow 0.3s;
  overflow: hidden;
}
.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary));
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s;
}
.tool-card:hover, .tool-card:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(108, 99, 255, 0.4);
  box-shadow: 0 0 20px var(--primary-glow), 0 8px 32px rgba(0, 0, 0, 0.3);
  outline: none;
}
.tool-card:hover::before, .tool-card:focus-visible::before {
  opacity: 1;
  animation: gradient-sweep 3s linear infinite;
}
.tool-card-icon {
  font-size: 1.6rem;
  display: block;
  margin-bottom: 10px;
  transition: transform 0.3s;
}
.tool-card:hover .tool-card-icon {
  transform: scale(1.1);
}
.tool-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}
.tool-card-desc {
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.5;
}
.fav-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--text-dim);
  transition: color 0.15s, text-shadow 0.15s;
  line-height: 1;
}
.fav-toggle:hover { color: var(--accent); text-shadow: 0 0 8px var(--accent-glow); }
```

- [ ] **Step 2: Verify build passes**

Run: `cd D:/Projects/geek-toolbox && npx vue-tsc -b --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/ToolCard.vue
git commit -m "style: neon glow hover effect on tool cards"
```

---

### Task 5: Support Modal Redesign

**Files:**
- Modify: `src/components/layout/SupportModal.vue`

- [ ] **Step 1: Replace modal styles**

Replace the entire `<style scoped>` section in `SupportModal.vue`:

```css
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
```

- [ ] **Step 2: Verify build passes**

Run: `cd D:/Projects/geek-toolbox && npx vue-tsc -b --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/SupportModal.vue
git commit -m "style: cyberpunk modal with glassmorphism, glow borders, and spring animation"
```

---

### Task 6: Fix Image Preview Sizing

**Files:**
- Modify: `src/components/tools/ImageTool.vue`

- [ ] **Step 1: Fix preview image CSS**

In `src/components/tools/ImageTool.vue`, find and replace the `.preview-img` rule:

Old:
```css
.preview-img { max-width: 100%; max-height: 400px; display: block; }
```

New:
```css
.preview-img { width: 100%; height: auto; max-height: 500px; object-fit: contain; display: block; }
```

- [ ] **Step 2: Verify build passes**

Run: `cd D:/Projects/geek-toolbox && npx vue-tsc -b --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/tools/ImageTool.vue
git commit -m "fix: image preview now fills container width"
```

---

### Task 7: Visual Verification

- [ ] **Step 1: Start dev server**

Run: `cd D:/Projects/geek-toolbox && npx vite --host`

- [ ] **Step 2: Verify in browser**

Check the following in the browser:
1. Particle background is visible and floating
2. Header has gradient glow line at bottom, logo has text-shadow
3. Tool cards glow on hover with gradient sweep animation at top
4. Click "联系/打赏" button — modal appears with glassmorphism, gradient title, pill tabs, spring animation
5. Open Image tool, upload an image, generate preview — preview fills container width
6. All transitions are smooth (page transitions, card hovers, modal open/close)
7. No console errors

- [ ] **Step 3: Test reduced motion**

In browser DevTools, enable "Emulate prefers-reduced-motion: reduce". Verify:
- Particles don't render
- Animations are instant (no visible motion)
- Site remains fully functional

- [ ] **Step 4: Final build check**

Run: `cd D:/Projects/geek-toolbox && npx vue-tsc -b && npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit any fixes from verification**

If any issues were found and fixed during verification, commit them:
```bash
git add -A
git commit -m "fix: visual verification adjustments"
```
