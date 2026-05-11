---
title: Cyberpunk Tech Style + UI Polish
date: 2026-05-10
status: draft
---

# Cyberpunk Tech Style + UI Polish Design Spec

## Overview

Three improvements to the geek-toolbox Vue3 app:
1. Fix image preview not filling container width
2. Redesign modal/popup with cyberpunk aesthetics
3. Add site-wide cyberpunk tech style with animations (Neon Glow Cards direction)

## 1. Image Preview Fix

**Problem:** In `ImageTool.vue`, the preview image uses `max-width: 100%; max-height: 400px` which doesn't fill the container width for landscape images.

**Solution:** Change `.preview-img` to `width: 100%; height: auto; max-height: 500px; object-fit: contain` so images fill the available width while maintaining aspect ratio.

## 2. Modal Redesign (SupportModal.vue)

**Current state:** Plain dark card with basic border, simple close button, flat tabs.

**Target state:**
- Overlay: darker backdrop with subtle radial glow behind modal
- Modal container: `backdrop-filter: blur(12px)`, semi-transparent background, glowing border (`border: 1px solid rgba(108,99,255,0.3)`), outer glow shadow
- Top accent: gradient line across top (`linear-gradient(90deg, transparent, var(--primary), transparent)`)
- Close button: circular with border, hover glow
- Title: gradient text (`background: linear-gradient(135deg, #e0e0f0, #6c63ff)`)
- Tab switcher: pill container background, active tab has gradient + glow shadow
- Animation: enter with `scale(0.92) → scale(1)` + `opacity 0→1` + `translateY(10px→0)`, exit reverse

## 3. Site-wide Cyberpunk Tech Style

### 3.1 CSS Variables (additions to variables.css)

```css
--glow-primary: 0 0 20px rgba(108, 99, 255, 0.3);
--glow-accent: 0 0 15px rgba(0, 212, 170, 0.25);
--glow-red: 0 0 15px rgba(255, 71, 87, 0.25);
--gradient-primary: linear-gradient(135deg, #6c63ff, #8b5cf6);
--gradient-accent: linear-gradient(135deg, #00d4aa, #6c63ff);
--surface-glass: rgba(26, 26, 46, 0.85);
```

### 3.2 Background Particles

Add a canvas-based particle system to `App.vue`:
- 30-40 small dots (2-3px) in primary/accent/red colors
- Slow floating motion (random direction, 0.2-0.5px/frame)
- Subtle glow (`box-shadow` or canvas glow)
- Fixed position behind all content, low opacity
- Performance: use `requestAnimationFrame`, pause when tab not visible

### 3.3 Header Enhancement (AppHeader.vue)

- Bottom border: replace solid border with gradient glow line
- Logo: subtle text-shadow glow on primary color
- Buttons: hover state adds glow shadow

### 3.4 Tool Cards (ToolCard.vue)

Current hover: `translateY(-2px)` + border color change.

Enhanced hover:
- `translateY(-4px)` with spring-like transition
- Border glow: `box-shadow: 0 0 20px var(--primary-glow), 0 8px 32px rgba(0,0,0,0.3)`
- Top edge: animated gradient sweep (CSS `@keyframes` moving a gradient highlight across the top border)
- Icon: subtle scale(1.05) on card hover

### 3.5 Tool Workspace Transitions

- Tool panel enter: `fadeInUp` (opacity 0→1, translateY(12px→0), 300ms ease-out)
- Tool panel exit: `fadeOutDown` (opacity 1→0, translateY(0→-8px), 200ms ease-in)
- Already using Vue `<Transition>` — enhance the existing `fade` transition

### 3.6 Buttons

- `.btn.primary` hover: add `box-shadow: 0 0 16px rgba(108,99,255,0.4)` glow
- `.btn.outline` hover: border glow + text color shift to primary
- Active/pressed: brief scale(0.97) feedback

### 3.7 Input Fields

- Focus state: border glow (`box-shadow: 0 0 0 2px rgba(108,99,255,0.2)`)
- Subtle transition on focus (200ms)

### 3.8 Page-level Ambient Effects

- Top of page: fixed gradient orb (radial-gradient, very subtle, positioned top-right)
- Scrolling: no parallax (keep it simple), just fixed ambient glow

## Implementation Notes

- All animations use CSS where possible (GPU-accelerated transforms/opacity)
- Particle system is the only JS animation — use canvas for performance
- Respect `prefers-reduced-motion` — disable particles and reduce transitions
- No external dependencies needed
- Keep existing dark theme colors, just enhance with glow/gradient effects

## Files to Modify

1. `src/styles/variables.css` — add glow/gradient variables
2. `src/styles/base.css` — add global animation keyframes, reduced-motion media query
3. `src/App.vue` — add particle canvas, enhance fade transition
4. `src/components/layout/AppHeader.vue` — gradient border, logo glow
5. `src/components/layout/ToolCard.vue` — enhanced hover effects
6. `src/components/layout/SupportModal.vue` — full modal redesign
7. `src/components/tools/ImageTool.vue` — fix preview image sizing

## Files to Create

1. `src/components/effects/ParticleBackground.vue` — canvas particle component
