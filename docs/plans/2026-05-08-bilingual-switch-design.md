# Bilingual Language Switch Design

**Date:** 2026-05-08  
**Project:** Geek Toolbox  
**Status:** Approved

## Goal

Add a Chinese/English language switch to the existing single-page toolbox so that:

- first visit follows the browser language automatically;
- users can switch languages manually from the top-right corner;
- manual choice is persisted with `localStorage`;
- UI copy, runtime messages, and project documentation are all bilingual.

## Approved Decisions

### Scope

The language switch covers:

1. page UI copy;
2. runtime messages and status text;
3. documentation.

### Default Language Strategy

Language selection priority:

1. previously saved manual preference in `localStorage`;
2. browser language from `navigator.language`;
3. fallback to `zh-CN`.

Supported languages for this iteration:

- `zh-CN`
- `en`

### Entry Placement

Place the switcher in the **top-right corner** of the page header.

### Persistence

Persist manual selection with `localStorage` so the last chosen language wins on refresh.

### Documentation Strategy

Use:

- `README.md` as the Chinese primary document;
- `README.en.md` as the English companion document.

Both documents should link to each other.

## Technical Approach

## 1. Keep the current lightweight architecture

The project remains a static frontend app with:

- `index.html`
- `style.css`
- `app.js`

No new dependency is introduced.

## 2. Add a centralized translation table

Create a translation map in `app.js` with locale buckets:

- `translations['zh-CN']`
- `translations['en']`

Group keys by feature area, for example:

- `common`
- `header`
- `tabs`
- `json`
- `diff`
- `base64`
- `count`
- `url`
- `timestamp`
- `image`
- `convert`
- `support`

## 3. Bind static DOM copy with i18n data attributes

Static copy in `index.html` should use attributes such as:

- `data-i18n`
- `data-i18n-placeholder`
- `data-i18n-title`
- `data-i18n-aria-label`

This allows a single render pass to update visible text and accessibility copy.

## 4. Route runtime messages through `t(key, params?)`

Dynamic messages currently embedded in `app.js` should be replaced by lookups such as:

- JSON validation errors;
- URL decode errors;
- diff empty-state messages;
- timestamp hints and copy feedback;
- image tool queue/status/result text;
- file conversion hints, progress, and completion text;
- support modal actions.

## 5. Refresh both static and stateful UI

Language switching must:

1. update all static DOM labels;
2. refresh state-derived UI already on screen.

Examples of stateful UI that must be refreshed:

- timestamp labels, hints, and picker labels;
- image queue empty state, crop summary, export summary, action buttons, result metadata;
- conversion hints, button labels, advanced option labels, result metadata;
- support modal button text and helper copy;
- any currently displayed error or success text that is under app control.

## Runtime State Model

Recommended helpers in `app.js`:

- `detectPreferredLanguage()`
- `getCurrentLanguage()`
- `setLanguage(lang)`
- `t(key, params?)`
- `applyI18n()`
- `refreshLocalizedUI()`

Behavior:

- `setLanguage(lang)` stores the selection and rerenders;
- `applyI18n()` updates static DOM bindings;
- `refreshLocalizedUI()` rehydrates live tool state in the active language.

## UX Notes

- Switcher label style: `中文 | EN`
- Active locale should be visually highlighted.
- Switching language should not require a page reload.
- Copy length differences between Chinese and English must not break layout.

## Encoding and Content Hygiene

Current visible text in the repository shows encoding corruption in several places. The implementation should normalize affected text to valid UTF-8 while introducing i18n keys, instead of preserving corrupted literals.

## Error Handling Rules

- If a locale key is missing, fall back to the other locale.
- If both locale values are missing, render the key string instead of leaving blank UI.
- If `localStorage` is unavailable, continue with browser detection only.
- If a section is not initialized yet, localization refresh should skip it safely.

## Testing Strategy

Verification should cover:

1. first load with browser Chinese;
2. first load with browser English;
3. manual switch without reload;
4. persistence after refresh;
5. runtime messages for JSON, URL, timestamp, image, convert, and support flows;
6. bilingual documentation cross-links.

Because the project is static and dependency-free, verification can rely on:

- syntax checking for `app.js`;
- local static serving;
- manual browser smoke tests.

## Out of Scope

This iteration does not include:

- more than two languages;
- a third-party i18n framework;
- content translation for generated user data;
- restructuring the app into a module bundler setup.
