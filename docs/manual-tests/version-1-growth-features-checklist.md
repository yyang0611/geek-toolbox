# Version 1 Growth Features Manual Checklist

Verified on: 2026-05-10 10:20 UTC
Workspace: `D:\Projects\geek-toolbox`
Primary verification browser: Chromium (Playwright Core 1.59.1, headless)
Served at: `http://127.0.0.1:4173/index.html`

## Verification setup
- Local static server: `python -m http.server 4173 --bind 127.0.0.1`
- Desktop viewport: `1440x1600`
- Mobile viewport: `390x844`
- Clipboard fallback simulation: Chromium context with `window.ClipboardItem` removed before page load
- Sample assets used during verification:
  - generated PNG / JPG / WEBP screenshot fixture (`800x500`)
  - generated CSV fixture (`name,score` rows)

## Regression
- [x] Timestamp tab opens and converts values  
  Evidence: picker `Now` -> `1778389126 seconds`; `1710000000` -> `3/10/2024, 12:00:00 AM`; detect hint `Auto-detected seconds (10 digits)`.
- [x] JSON formatter still formats and validates  
  Evidence: formatted `{"name":"Ada","items":[1,2]}` successfully; invalid input produced `❌ Invalid JSON: Expected property name or '}' in JSON at position 1...`.
- [x] Image compression still uploads and exports  
  Evidence: generated preview and downloaded `sample-upload-cropped.jpg` (`11191 bytes`); result meta `800 × 500 · 10.9 KB · JPEG · Current Image`.
- [x] File conversion still switches modes and enables actions  
  Evidence: `csv-to-xlsx` enabled run/download; preview `CSV converted to XLSX. Click download to save the result.`; downloaded `sample-data.xlsx` (`16078 bytes`).
- [x] Regex tester still updates live  
  Evidence: pattern `foo` against `foo\nbar\nfoo` updated live to match count `2`.
- [x] Color converter still copies values  
  Evidence: clicking HEX copied `#6c63ff` to clipboard.

## Homepage retention / discovery
- [x] Recommended cards render  
  Evidence: cards rendered for `截图标注 / Screenshot Annotation` and `文字转图卡片 / Text to Image Card`.
- [x] Recent tools update after tool open  
  Evidence: opening JSON then Screenshot Annotation produced recent order `截图标注 > JSON 格式化`.
- [x] Favorites persist after refresh  
  Evidence: favoriting Screenshot Annotation from the recommended card survived full page reload.
- [x] Clear recent resets the section  
  Evidence: empty state returned to `从下方标签栏或推荐卡片打开工具后，最近记录会显示在这里。` after clearing.

## Screenshot annotation
- [x] PNG/JPG/WEBP upload works  
  Evidence: uploaded generated `sample-upload.png`, `sample-upload.jpg`, and `sample-upload.webp`; each loaded at `800x500`.
- [x] Arrow, rectangle, text, number, mosaic work  
  Evidence: annotation state recorded shape sequence `arrow, rect, text, number, mosaic` after interaction.
- [x] Undo/redo works  
  Evidence: shapes moved `5 -> 4 -> 5`; undone stack moved `0 -> 1 -> 0`.
- [x] Export PNG works  
  Evidence: downloaded `sample-upload-annotated.png` (`458800 bytes`); UI message `PNG exported successfully.`.

## Text to image card
- [x] Empty state shows helpful text  
  Evidence: clear action restored preview message `Start typing to preview your shareable image card.`.
- [x] Theme switch works  
  Evidence: preview class changed to `share-card share-card--light` after switching to Light.
- [x] Size switch works  
  Evidence: preview `data-size` changed through `portrait` and `landscape` successfully.
- [x] Export works  
  Evidence: downloaded `text-card.png` (`943566 bytes`); UI message `PNG exported successfully.`.
- [x] Copy image works or shows graceful unsupported message  
  Evidence (supported Chromium secure context): UI message `Image copied to clipboard.` after copy.  
  Evidence (simulated unsupported browser): button relabeled to `Copy Unavailable` with tooltip `Image copy is not supported in this browser. Export PNG instead.` and non-throwing message `Image copy is not supported in this browser. Export PNG instead.`.

## i18n / mobile
- [x] Chinese labels render correctly  
  Evidence: header `⚡ 极客工具箱`; tabs `截图标注` and `文字转图卡片`; recommended title `推荐工具`.
- [x] English labels render correctly  
  Evidence: header `⚡ Geek Toolbox`; tabs `Screenshot Annotation` and `Text to Image Card`; recommended title `Recommended`.
- [x] Homepage stacks cleanly on narrow viewport  
  Evidence: on `390x844`, first two recommended cards stacked vertically at `{"x":20,"y":307,"width":350}` and `{"x":20,"y":663,"width":350}`.
- [x] New tool panels remain usable on mobile width  
  Evidence: on `390x844`, annotate sidebar/canvas stacked vertically and card controls/preview stacked vertically.

## Browser-specific fallback notes
- Clipboard image copy requires browser support for `ClipboardItem`, a secure context, and `navigator.clipboard.write`.
- In supported Chromium secure context, the Text to Image Card copy action completed successfully.
- In an unsupported-browser simulation, the copy button degraded gracefully instead of throwing:
  - English button/message: `Copy Unavailable` / `Image copy is not supported in this browser. Export PNG instead.`
  - Chinese button/message: `当前不可复制` / `当前浏览器不支持复制图片，请改用导出 PNG。`
- This fallback behavior is acceptable for launch so long as export remains available.

## Commands run
```powershell
python -m http.server 4173 --bind 127.0.0.1
node <Playwright verification script via stdin using playwright-core from C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core>
```

## Result
- Manual verification completed for the planned Version 1 growth surfaces and listed core regressions.
- No blocking product issues were found during this pass.
