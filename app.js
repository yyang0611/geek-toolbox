/* === Site Config: Support / Donation === */
const supportConfig = {
  // 国内/通用联系方式
  contact: 'yyang0611',
  // 只填用户名，不要填完整 URL，例如 your-paypalme-name
  paypalUsername: '',
  // 只填用户名，不要填完整 URL，例如 your-bmac-name
  buyMeACoffeeUsername: '',
  // 只填用户名，不要填完整 URL，例如 your-kofi-name
  koFiUsername: ''
};

/* === Tab 切换 === */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tool-' + tab.dataset.tool).classList.add('active');
  });
});

/* === JSON 工具 === */
function formatJSON() {
  const input = document.getElementById('json-input').value;
  const errEl = document.getElementById('json-error');
  const outEl = document.getElementById('json-output');
  try {
    const parsed = JSON.parse(input);
    outEl.textContent = JSON.stringify(parsed, null, 2);
    errEl.textContent = '';
  } catch (e) {
    errEl.textContent = '❌ JSON 格式错误: ' + e.message;
    outEl.textContent = '';
  }
}
function compressJSON() {
  const input = document.getElementById('json-input').value;
  const errEl = document.getElementById('json-error');
  const outEl = document.getElementById('json-output');
  try {
    outEl.textContent = JSON.stringify(JSON.parse(input));
    errEl.textContent = '';
  } catch (e) {
    errEl.textContent = '❌ JSON 格式错误: ' + e.message;
    outEl.textContent = '';
  }
}

/* === 文本对比 (朴素 diff) === */
function runDiff() {
  const left = document.getElementById('diff-left').value;
  const right = document.getElementById('diff-right').value;
  const out = document.getElementById('diff-output');

  const lLines = left.split('\n');
  const rLines = right.split('\n');
  const maxLen = Math.max(lLines.length, rLines.length);
  let html = '';

  for (let i = 0; i < maxLen; i++) {
    const l = lLines[i] || '';
    const r = rLines[i] || '';
    if (l === r) {
      html += `<span> ${escapeHtml(l)}</span>\n`;
    } else {
      if (l) html += `<span class="diff-remove">-${escapeHtml(l)}</span>\n`;
      if (r) html += `<span class="diff-add">+${escapeHtml(r)}</span>\n`;
    }
  }

  if (!left && !right) {
    out.innerHTML = '<span style="color:var(--text-dim)">请在两侧输入文本后对比</span>';
  } else {
    out.innerHTML = html;
  }
}

/* === Base64 === */
function base64Encode() {
  const input = document.getElementById('base64-input').value;
  document.getElementById('base64-output').textContent = btoa(unescape(encodeURIComponent(input)));
}
function base64Decode() {
  const input = document.getElementById('base64-input').value;
  try {
    document.getElementById('base64-output').textContent = decodeURIComponent(escape(atob(input)));
  } catch {
    document.getElementById('base64-output').textContent = atob(input);
  }
}

/* === URL 编解码 === */
function urlEncode() {
  document.getElementById('url-output').textContent = encodeURIComponent(document.getElementById('url-input').value);
}
function urlDecode() {
  try {
    document.getElementById('url-output').textContent = decodeURIComponent(document.getElementById('url-input').value);
  } catch {
    document.getElementById('url-output').textContent = '❌ 无法解码，请检查输入';
  }
}

/* === 字数统计 === */
function liveCount() {
  const text = document.getElementById('count-input').value;
  document.getElementById('stat-chars').textContent = text.length;
  document.getElementById('stat-chinese').textContent = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const words = text.match(/[a-zA-Z]+/g);
  document.getElementById('stat-english').textContent = words ? words.length : 0;
  document.getElementById('stat-lines').textContent = text ? text.split('\n').length : 0;
  document.getElementById('stat-spaces').textContent = (text.match(/\s/g) || []).length;
  document.getElementById('stat-punct').textContent = (text.match(/[，。、；：？！""''（）【】《》—…·\.\,\;\:\!\?\-\–\(\)\[\]\{\}]/g) || []).length;
}

/* === 时间戳 === */

/* === 图片压缩 / 裁剪 === */

const imageToolState = {
  items: [],
  activeIndex: -1,
  image: null,
  fileName: '',
  originalType: '',
  originalSize: 0,
  naturalWidth: 0,
  naturalHeight: 0,
  renderedWidth: 0,
  renderedHeight: 0,
  offsetX: 0,
  offsetY: 0,
  crop: null,
  sharedCrop: null,
  activePointerId: null,
  dragMode: null,
  dragStartX: 0,
  dragStartY: 0,
  draftCrop: null,
  resultBlob: null,
  resultDataUrl: '',
  resultWidth: 0,
  resultHeight: 0
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 100 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getImageDimensionLimit() {
  return 9999;
}

function normalizeDimensionValue(value, fallback) {
  const limit = getImageDimensionLimit();
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return clamp(Math.round(numeric), 1, limit);
}

function getImageCanvas() {
  return document.getElementById('img-editor-canvas');
}

function getActiveImageItem() {
  if (imageToolState.activeIndex < 0 || imageToolState.activeIndex >= imageToolState.items.length) return null;
  return imageToolState.items[imageToolState.activeIndex];
}

function buildFullImageCrop(item) {
  return {
    x: 0,
    y: 0,
    width: item.naturalWidth,
    height: item.naturalHeight
  };
}

function adaptCropToItem(crop, item) {
  if (!crop || !item) return buildFullImageCrop(item);
  const widthRatio = item.naturalWidth / Math.max(1, imageToolState.naturalWidth || item.naturalWidth);
  const heightRatio = item.naturalHeight / Math.max(1, imageToolState.naturalHeight || item.naturalHeight);
  return normalizeCropForItem({
    x: crop.x * widthRatio,
    y: crop.y * heightRatio,
    width: crop.width * widthRatio,
    height: crop.height * heightRatio
  }, item);
}

function ensureImageCrop() {
  const item = getActiveImageItem();
  if (!item) {
    imageToolState.crop = null;
    return;
  }

  if (item.useCustomCrop) {
    if (!item.customCrop) {
      item.customCrop = buildFullImageCrop(item);
    }
    imageToolState.crop = { ...item.customCrop };
    return;
  }

  if (!imageToolState.sharedCrop) {
    imageToolState.sharedCrop = buildFullImageCrop(item);
  }
  imageToolState.crop = adaptCropToItem(imageToolState.sharedCrop, item);
}

function syncActiveImageFromItem() {
  const item = getActiveImageItem();
  if (!item) {
    imageToolState.image = null;
    imageToolState.fileName = '';
    imageToolState.originalType = '';
    imageToolState.originalSize = 0;
    imageToolState.naturalWidth = 0;
    imageToolState.naturalHeight = 0;
    imageToolState.crop = null;
    return;
  }

  imageToolState.image = item.image;
  imageToolState.fileName = item.fileName;
  imageToolState.originalType = item.originalType;
  imageToolState.originalSize = item.originalSize;
  imageToolState.naturalWidth = item.naturalWidth;
  imageToolState.naturalHeight = item.naturalHeight;
  ensureImageCrop();
}

function syncImageMeta() {
  const sourceMeta = document.getElementById('img-source-meta');
  const cropMeta = document.getElementById('img-crop-meta');
  const batchMeta = document.getElementById('img-batch-meta');
  const toggle = document.getElementById('img-custom-crop-toggle');
  const activeItem = getActiveImageItem();

  if (sourceMeta) {
    sourceMeta.textContent = activeItem
      ? `当前：${activeItem.fileName} · ${activeItem.naturalWidth} × ${activeItem.naturalHeight} · ${formatBytes(activeItem.originalSize)}`
      : '请选择图片后开始编辑';
  }

  if (batchMeta) {
    batchMeta.textContent = imageToolState.items.length
      ? `已加载 ${imageToolState.items.length} 张图片 · 默认共用裁剪规则，可切换到单张图片单独处理`
      : '支持点击、拖拽、批量上传图片';
  }

  if (cropMeta) {
    cropMeta.textContent = imageToolState.crop
      ? `裁剪区：${Math.round(imageToolState.crop.width)} × ${Math.round(imageToolState.crop.height)} · 起点 ${Math.round(imageToolState.crop.x)}, ${Math.round(imageToolState.crop.y)}`
      : '裁剪区：--';
  }

  if (toggle) {
    toggle.checked = Boolean(activeItem && activeItem.useCustomCrop);
    toggle.disabled = !activeItem;
  }
}

function renderImageQueue() {
  const queue = document.getElementById('img-queue');
  if (!queue) return;

  if (!imageToolState.items.length) {
    queue.innerHTML = '<div class="img-queue-empty">暂无图片。上传后可逐张切换，并为单张图片单独调整裁剪。</div>';
    return;
  }

  queue.innerHTML = imageToolState.items.map((item, index) => `
    <button type="button" class="img-queue-item ${index === imageToolState.activeIndex ? 'active' : ''}" onclick="setActiveImageIndex(${index})">
      <img class="img-queue-thumb" src="${item.previewUrl}" alt="${escapeHtml(item.fileName)}" />
      <span class="img-queue-text">
        <span class="img-queue-name">${escapeHtml(item.fileName)}</span>
        <span class="img-queue-sub">${item.naturalWidth} × ${item.naturalHeight} · ${formatBytes(item.originalSize)}</span>
      </span>
      <span class="img-queue-badge">${item.useCustomCrop ? '单独' : '共用'}</span>
    </button>
  `).join('');
}

function setActiveImageIndex(index) {
  if (index < 0 || index >= imageToolState.items.length) return;
  imageToolState.activeIndex = index;
  syncActiveImageFromItem();
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (widthInput) widthInput.value = String(Math.round(imageToolState.crop ? imageToolState.crop.width : imageToolState.naturalWidth));
  if (heightInput) heightInput.value = String(Math.round(imageToolState.crop ? imageToolState.crop.height : imageToolState.naturalHeight));
  clearImageResult();
  renderImageQueue();
  syncImageMeta();
  updateImageCompressionSummary();
  drawImageEditor();
}

function normalizeCropForItem(crop, item = getActiveImageItem()) {
  if (!item) return crop;
  const normalized = {
    x: crop.width >= 0 ? crop.x : crop.x + crop.width,
    y: crop.height >= 0 ? crop.y : crop.y + crop.height,
    width: Math.abs(crop.width),
    height: Math.abs(crop.height)
  };

  normalized.width = Math.max(40, normalized.width);
  normalized.height = Math.max(40, normalized.height);
  normalized.x = clamp(normalized.x, 0, item.naturalWidth - normalized.width);
  normalized.y = clamp(normalized.y, 0, item.naturalHeight - normalized.height);
  normalized.width = Math.min(normalized.width, item.naturalWidth - normalized.x);
  normalized.height = Math.min(normalized.height, item.naturalHeight - normalized.y);
  return normalized;
}

function applyCropChange(nextCrop) {
  const item = getActiveImageItem();
  if (!item) return;
  const normalized = normalizeCropForItem(nextCrop, item);
  imageToolState.crop = normalized;

  if (item.useCustomCrop) {
    item.customCrop = { ...normalized };
    return;
  }

  imageToolState.sharedCrop = {
    x: normalized.x,
    y: normalized.y,
    width: normalized.width,
    height: normalized.height
  };

  imageToolState.items.forEach(queueItem => {
    if (!queueItem.useCustomCrop) {
      queueItem.customCrop = null;
    }
  });
}

function toggleActiveImageCustomCrop(checked) {
  const item = getActiveImageItem();
  if (!item) return;
  item.useCustomCrop = checked;
  if (checked) {
    item.customCrop = imageToolState.crop ? { ...imageToolState.crop } : buildFullImageCrop(item);
  } else {
    item.customCrop = null;
  }
  ensureImageCrop();
  renderImageQueue();
  syncImageMeta();
  updateImageCompressionSummary();
  drawImageEditor();
}

function onImageDimensionInputChange() {
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (widthInput && widthInput.value) {
    widthInput.value = String(normalizeDimensionValue(widthInput.value, 1));
  }
  if (heightInput && heightInput.value) {
    heightInput.value = String(normalizeDimensionValue(heightInput.value, 1));
  }
  updateImageCompressionSummary();
}

function updateImageCompressionSummary() {
  const summary = document.getElementById('img-export-summary');
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (!summary) return;
  if (!imageToolState.image || !imageToolState.crop) {
    summary.textContent = '裁剪后可压缩导出，并在下方预览结果。';
    return;
  }
  const format = document.getElementById('img-format').value.toUpperCase();
  const cropWidth = Math.round(imageToolState.crop.width);
  const cropHeight = Math.round(imageToolState.crop.height);

  const exportWidth = normalizeDimensionValue(widthInput && widthInput.value ? widthInput.value : cropWidth, cropWidth);
  const exportHeight = normalizeDimensionValue(heightInput && heightInput.value ? heightInput.value : cropHeight, cropHeight);

  summary.textContent = `导出：${format} · ${exportWidth} × ${exportHeight} · ${imageToolState.items.length > 1 ? '支持批量导出' : '单张导出'}`;
}

function onImageQualityChange() {
  const quality = Number(document.getElementById('img-quality').value || 0.82);
  const qualityValue = document.getElementById('img-quality-value');
  if (qualityValue) {
    qualityValue.textContent = `${Math.round(quality * 100)}%`;
  }
  updateImageCompressionSummary();
}

function clearImageResult() {
  imageToolState.resultBlob = null;
  imageToolState.resultDataUrl = '';
  imageToolState.resultWidth = 0;
  imageToolState.resultHeight = 0;

  const preview = document.getElementById('img-result-preview');
  const empty = document.getElementById('img-result-empty');
  const meta = document.getElementById('img-result-meta');
  if (preview) {
    preview.src = '';
    preview.classList.add('hidden');
  }
  if (empty) {
    empty.classList.remove('hidden');
  }
  if (meta) {
    meta.textContent = '结果：--';
  }
}

function clearImageTool() {
  imageToolState.items = [];
  imageToolState.activeIndex = -1;
  imageToolState.image = null;
  imageToolState.fileName = '';
  imageToolState.originalType = '';
  imageToolState.originalSize = 0;
  imageToolState.naturalWidth = 0;
  imageToolState.naturalHeight = 0;
  imageToolState.renderedWidth = 0;
  imageToolState.renderedHeight = 0;
  imageToolState.offsetX = 0;
  imageToolState.offsetY = 0;
  imageToolState.crop = null;
  imageToolState.sharedCrop = null;
  imageToolState.activePointerId = null;
  imageToolState.dragMode = null;
  imageToolState.draftCrop = null;

  const input = document.getElementById('img-input');
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  const emptyState = document.getElementById('img-empty-state');
  const canvas = getImageCanvas();
  const toggle = document.getElementById('img-custom-crop-toggle');
  if (input) input.value = '';
  if (widthInput) widthInput.value = '';
  if (heightInput) heightInput.value = '';
  if (toggle) {
    toggle.checked = false;
    toggle.disabled = true;
  }
  if (emptyState) emptyState.classList.remove('hidden');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove('dragging', 'resizing');
  }

  renderImageQueue();
  clearImageResult();
  syncImageMeta();
  updateImageCompressionSummary();
}

function resetImageCrop() {
  const item = getActiveImageItem();
  if (!item) return;
  if (item.useCustomCrop) {
    item.customCrop = buildFullImageCrop(item);
  } else {
    imageToolState.sharedCrop = buildFullImageCrop(item);
  }
  ensureImageCrop();
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (widthInput) widthInput.value = String(Math.round(imageToolState.crop.width));
  if (heightInput) heightInput.value = String(Math.round(imageToolState.crop.height));
  drawImageEditor();
  syncImageMeta();
  updateImageCompressionSummary();
  clearImageResult();
  renderImageQueue();
}

function getRenderedCropRect() {
  if (!imageToolState.crop) return null;
  const scaleX = imageToolState.renderedWidth / imageToolState.naturalWidth;
  const scaleY = imageToolState.renderedHeight / imageToolState.naturalHeight;
  return {
    x: imageToolState.offsetX + imageToolState.crop.x * scaleX,
    y: imageToolState.offsetY + imageToolState.crop.y * scaleY,
    width: imageToolState.crop.width * scaleX,
    height: imageToolState.crop.height * scaleY
  };
}

function drawImageEditor() {
  const canvas = getImageCanvas();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const emptyState = document.getElementById('img-empty-state');
  const wrap = document.getElementById('img-canvas-wrap');
  if (!ctx || !wrap) return;

  const wrapWidth = Math.max(320, Math.floor(wrap.clientWidth - 24));
  const wrapHeight = Math.max(260, Math.floor((window.innerHeight || 900) * 0.52));
  canvas.width = wrapWidth;
  canvas.height = wrapHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!imageToolState.image) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const scale = Math.min(canvas.width / imageToolState.naturalWidth, canvas.height / imageToolState.naturalHeight);
  const renderedWidth = Math.max(1, Math.round(imageToolState.naturalWidth * scale));
  const renderedHeight = Math.max(1, Math.round(imageToolState.naturalHeight * scale));
  const offsetX = Math.round((canvas.width - renderedWidth) / 2);
  const offsetY = Math.round((canvas.height - renderedHeight) / 2);

  imageToolState.renderedWidth = renderedWidth;
  imageToolState.renderedHeight = renderedHeight;
  imageToolState.offsetX = offsetX;
  imageToolState.offsetY = offsetY;

  ctx.drawImage(imageToolState.image, offsetX, offsetY, renderedWidth, renderedHeight);

  ensureImageCrop();
  const crop = getRenderedCropRect();
  if (!crop) return;

  ctx.save();
  ctx.fillStyle = 'rgba(10,10,24,0.58)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
  ctx.drawImage(imageToolState.image, offsetX, offsetY, renderedWidth, renderedHeight);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#00d4aa';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

  ctx.fillStyle = 'rgba(0, 212, 170, 0.18)';
  ctx.fillRect(crop.x, crop.y, crop.width, crop.height);

  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(crop.x + crop.width / 3, crop.y);
  ctx.lineTo(crop.x + crop.width / 3, crop.y + crop.height);
  ctx.moveTo(crop.x + (crop.width * 2) / 3, crop.y);
  ctx.lineTo(crop.x + (crop.width * 2) / 3, crop.y + crop.height);
  ctx.moveTo(crop.x, crop.y + crop.height / 3);
  ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 3);
  ctx.moveTo(crop.x, crop.y + (crop.height * 2) / 3);
  ctx.lineTo(crop.x + crop.width, crop.y + (crop.height * 2) / 3);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(crop.x + crop.width, crop.y + crop.height, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6c63ff';
  ctx.stroke();
  ctx.restore();
}

function canvasPointToImagePoint(clientX, clientY) {
  const canvas = getImageCanvas();
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const relativeX = clamp((x - imageToolState.offsetX) / imageToolState.renderedWidth, 0, 1);
  const relativeY = clamp((y - imageToolState.offsetY) / imageToolState.renderedHeight, 0, 1);

  return {
    canvasX: x,
    canvasY: y,
    imageX: relativeX * imageToolState.naturalWidth,
    imageY: relativeY * imageToolState.naturalHeight
  };
}

function hitTestImageCrop(clientX, clientY) {
  const crop = getRenderedCropRect();
  if (!crop) return 'outside';
  const point = canvasPointToImagePoint(clientX, clientY);
  const resizeHandleSize = 16;
  const onResizeHandle =
    point.canvasX >= crop.x + crop.width - resizeHandleSize &&
    point.canvasX <= crop.x + crop.width + resizeHandleSize &&
    point.canvasY >= crop.y + crop.height - resizeHandleSize &&
    point.canvasY <= crop.y + crop.height + resizeHandleSize;

  if (onResizeHandle) return 'resize';
  const inside =
    point.canvasX >= crop.x &&
    point.canvasX <= crop.x + crop.width &&
    point.canvasY >= crop.y &&
    point.canvasY <= crop.y + crop.height;

  return inside ? 'move' : 'new';
}

function normalizeCrop(crop) {
  return normalizeCropForItem(crop, getActiveImageItem());
}

function onImageCanvasPointerDown(event) {
  if (!imageToolState.image) return;
  const canvas = getImageCanvas();
  if (!canvas) return;

  const mode = hitTestImageCrop(event.clientX, event.clientY);
  const point = canvasPointToImagePoint(event.clientX, event.clientY);
  imageToolState.activePointerId = event.pointerId;
  imageToolState.dragStartX = point.imageX;
  imageToolState.dragStartY = point.imageY;
  imageToolState.draftCrop = imageToolState.crop ? { ...imageToolState.crop } : null;
  imageToolState.dragMode = mode;

  canvas.setPointerCapture(event.pointerId);
  canvas.classList.toggle('resizing', mode === 'resize');
  canvas.classList.toggle('dragging', mode === 'move');

  if (mode === 'new') {
    applyCropChange({
      x: point.imageX,
      y: point.imageY,
      width: 1,
      height: 1
    });
    drawImageEditor();
  }
}

function onImageCanvasPointerMove(event) {
  const canvas = getImageCanvas();
  if (!canvas || imageToolState.activePointerId !== event.pointerId || !imageToolState.dragMode) return;
  const point = canvasPointToImagePoint(event.clientX, event.clientY);

  if (imageToolState.dragMode === 'move' && imageToolState.draftCrop) {
    const item = getActiveImageItem();
    if (!item) return;
    const deltaX = point.imageX - imageToolState.dragStartX;
    const deltaY = point.imageY - imageToolState.dragStartY;
    applyCropChange({
      ...imageToolState.draftCrop,
      x: clamp(imageToolState.draftCrop.x + deltaX, 0, item.naturalWidth - imageToolState.draftCrop.width),
      y: clamp(imageToolState.draftCrop.y + deltaY, 0, item.naturalHeight - imageToolState.draftCrop.height)
    });
  } else if (imageToolState.dragMode === 'resize' && imageToolState.draftCrop) {
    applyCropChange({
      x: imageToolState.draftCrop.x,
      y: imageToolState.draftCrop.y,
      width: point.imageX - imageToolState.draftCrop.x,
      height: point.imageY - imageToolState.draftCrop.y
    });
  } else if (imageToolState.dragMode === 'new' && imageToolState.crop) {
    applyCropChange({
      x: imageToolState.dragStartX,
      y: imageToolState.dragStartY,
      width: point.imageX - imageToolState.dragStartX,
      height: point.imageY - imageToolState.dragStartY
    });
  }

  renderImageQueue();
  drawImageEditor();
  syncImageMeta();
  updateImageCompressionSummary();
}

function onImageCanvasPointerUp(event) {
  const canvas = getImageCanvas();
  if (!canvas || imageToolState.activePointerId !== event.pointerId) return;
  canvas.releasePointerCapture(event.pointerId);
  canvas.classList.remove('dragging', 'resizing');
  imageToolState.activePointerId = null;
  imageToolState.dragMode = null;
  imageToolState.draftCrop = null;
  syncImageMeta();
  updateImageCompressionSummary();
}

function getExportSettings(crop = imageToolState.crop) {
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  return {
    exportWidth: normalizeDimensionValue(widthInput && widthInput.value ? widthInput.value : Math.round(crop.width), Math.round(crop.width)),
    exportHeight: normalizeDimensionValue(heightInput && heightInput.value ? heightInput.value : Math.round(crop.height), Math.round(crop.height))
  };
}

function createCompressedBlobForItem(item) {
  return new Promise(resolve => {
    const crop = item.useCustomCrop && item.customCrop ? item.customCrop : adaptCropToItem(imageToolState.sharedCrop || buildFullImageCrop(item), item);
    const { exportWidth, exportHeight } = getExportSettings(crop);
    const format = document.getElementById('img-format').value;
    const quality = Number(document.getElementById('img-quality').value || 0.82);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = exportWidth;
    outputCanvas.height = exportHeight;
    const ctx = outputCanvas.getContext('2d');

    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportWidth, exportHeight);
    }

    ctx.drawImage(item.image, crop.x, crop.y, crop.width, crop.height, 0, 0, exportWidth, exportHeight);
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    outputCanvas.toBlob(blob => resolve({ blob, exportWidth, exportHeight, format, crop }), mimeType, format === 'png' ? undefined : quality);
  });
}

function generateCompressedImage() {
  const item = getActiveImageItem();
  if (!item || !imageToolState.crop) return;

  createCompressedBlobForItem(item).then(({ blob, exportWidth, exportHeight, format }) => {
    if (!blob) return;
    imageToolState.resultBlob = blob;
    imageToolState.resultWidth = exportWidth;
    imageToolState.resultHeight = exportHeight;

    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById('img-result-preview');
      const empty = document.getElementById('img-result-empty');
      const meta = document.getElementById('img-result-meta');

      imageToolState.resultDataUrl = String(reader.result || '');
      if (preview) {
        preview.src = imageToolState.resultDataUrl;
        preview.classList.remove('hidden');
      }
      if (empty) {
        empty.classList.add('hidden');
      }
      if (meta) {
        meta.textContent = `结果：${exportWidth} × ${exportHeight} · ${formatBytes(blob.size)} · ${format.toUpperCase()} · 当前图片`;
      }
    };
    reader.readAsDataURL(blob);
  });
}

function downloadCompressedImage() {
  const item = getActiveImageItem();
  if (!item || !imageToolState.resultBlob) return;
  const ext = document.getElementById('img-format').value === 'png' ? 'png' : 'jpg';
  const baseName = item.fileName ? item.fileName.replace(/\.[^.]+$/, '') : 'compressed-image';
  const url = URL.createObjectURL(imageToolState.resultBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}-cropped.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAllCompressedImages() {
  if (!imageToolState.items.length) return;
  imageToolState.items.forEach((item, index) => {
    createCompressedBlobForItem(item).then(({ blob, format }) => {
      if (!blob) return;
      const ext = format === 'png' ? 'png' : 'jpg';
      const baseName = item.fileName ? item.fileName.replace(/\.[^.]+$/, '') : `compressed-image-${index + 1}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}-cropped.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
}

function loadFilesIntoImageTool(files) {
  const imageFiles = Array.from(files || []).filter(file => file.type.startsWith('image/'));
  if (!imageFiles.length) return;

  const loaders = imageFiles.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        resolve({
          image,
          fileName: file.name,
          originalType: file.type,
          originalSize: file.size,
          naturalWidth: image.naturalWidth || image.width,
          naturalHeight: image.naturalHeight || image.height,
          previewUrl: String(reader.result || ''),
          useCustomCrop: false,
          customCrop: null
        });
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }));

  Promise.all(loaders).then(items => {
    const hadItems = imageToolState.items.length > 0;
    imageToolState.items = imageToolState.items.concat(items);
    if (!hadItems) {
      imageToolState.sharedCrop = null;
      imageToolState.activeIndex = 0;
    }
    if (imageToolState.activeIndex < 0) {
      imageToolState.activeIndex = 0;
    }
    syncActiveImageFromItem();
    const widthInput = document.getElementById('img-max-width');
    const heightInput = document.getElementById('img-max-height');
    if (widthInput && !widthInput.value) widthInput.value = String(Math.round(imageToolState.crop.width));
    if (heightInput && !heightInput.value) heightInput.value = String(Math.round(imageToolState.crop.height));
    clearImageResult();
    renderImageQueue();
    syncImageMeta();
    updateImageCompressionSummary();
    drawImageEditor();
  });
}

function onImageInputChange(event) {
  const files = event.target.files;
  if (!files || !files.length) {
    return;
  }
  loadFilesIntoImageTool(files);
}

function onImageDrop(event) {
  event.preventDefault();
  const wrap = document.getElementById('img-canvas-wrap');
  if (wrap) wrap.classList.remove('drag-over');
  if (event.dataTransfer && event.dataTransfer.files) {
    loadFilesIntoImageTool(event.dataTransfer.files);
  }
}

function onImageDragOver(event) {
  event.preventDefault();
  const wrap = document.getElementById('img-canvas-wrap');
  if (wrap) wrap.classList.add('drag-over');
}

function onImageDragLeave() {
  const wrap = document.getElementById('img-canvas-wrap');
  if (wrap) wrap.classList.remove('drag-over');
}

const timestampPickerState = {
  current: null,
  viewingYear: 0,
  viewingMonth: 0,
  selectedDate: null,
  mode: 'datetime'
};

function padTime(value) {
  return String(value).padStart(2, '0');
}

function formatPickerDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return [
    date.getFullYear(),
    '-',
    padTime(date.getMonth() + 1),
    '-',
    padTime(date.getDate()),
    ' ',
    padTime(date.getHours()),
    ':',
    padTime(date.getMinutes()),
    ':',
    padTime(date.getSeconds())
  ].join('');
}

function parsePickerInputValue(value) {
  if (!value) return null;
  const normalized = value.replace('T', ' ').trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return null;
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function syncTimestampPickerInput() {
  if (timestampPickerState.mode === 'timestamp') {
    const input = document.getElementById('ts-timestamp');
    if (!input) return;
    input.value = timestampPickerState.selectedDate ? String(formatTimestampValue(timestampPickerState.selectedDate.getTime())) : '';
    if (input.value) {
      tsToDate();
    } else {
      document.getElementById('ts-to-date').textContent = '--';
      updateTimestampDetectHint('');
    }
    return;
  }

  const input = document.getElementById('ts-datetime');
  if (!input) return;
  input.value = timestampPickerState.selectedDate ? formatPickerDateTime(timestampPickerState.selectedDate) : '';
  if (input.value) {
    dateToTs();
  } else {
    document.getElementById('ts-to-ts').textContent = '--';
  }
}

function updateTimestampPickerPreview() {
  const preview = document.getElementById('ts-picker-preview');
  if (!preview) return;
  if (!timestampPickerState.selectedDate) {
    preview.textContent = '未选择日期时间';
    return;
  }
  const formatted = formatPickerDateTime(timestampPickerState.selectedDate);
  if (timestampPickerState.mode === 'timestamp') {
    preview.textContent = formatted + ' → ' + formatTimestampValue(timestampPickerState.selectedDate.getTime()) + ' ' + formatTimestampUnitLabel();
  } else {
    preview.textContent = formatted;
  }
}

function fillTimestampSelectOptions(id, max) {
  const select = document.getElementById(id);
  if (!select || select.options.length) return;
  let html = '';
  for (let i = 0; i <= max; i++) {
    const value = padTime(i);
    html += `<option value="${value}">${value}</option>`;
  }
  select.innerHTML = html;
}

function initTimestampPickerSelectors() {
  fillTimestampSelectOptions('ts-picker-hour', 23);
  fillTimestampSelectOptions('ts-picker-minute', 59);
  fillTimestampSelectOptions('ts-picker-second', 59);
}

function setTimestampPickerTime(date) {
  document.getElementById('ts-picker-hour').value = padTime(date.getHours());
  document.getElementById('ts-picker-minute').value = padTime(date.getMinutes());
  document.getElementById('ts-picker-second').value = padTime(date.getSeconds());
}

function ensureTimestampPickerSelection() {
  if (!timestampPickerState.selectedDate) {
    timestampPickerState.selectedDate = new Date();
  }
}

function openTimestampPicker(mode = 'datetime') {
  initTimestampPickerSelectors();
  const panel = document.getElementById('ts-picker-panel');
  if (!panel) return;
  timestampPickerState.mode = mode;
  const inputValue = mode === 'timestamp'
    ? (() => {
        const raw = document.getElementById('ts-timestamp').value.trim();
        if (!raw) return '';
        const parsedTs = parseTimestampToMilliseconds(raw);
        if (parsedTs.error) return '';
        return formatPickerDateTime(new Date(parsedTs.milliseconds));
      })()
    : document.getElementById('ts-datetime').value;
  const parsed = parsePickerInputValue(inputValue);
  timestampPickerState.selectedDate = parsed || new Date();
  timestampPickerState.current = new Date(timestampPickerState.selectedDate.getTime());
  timestampPickerState.viewingYear = timestampPickerState.current.getFullYear();
  timestampPickerState.viewingMonth = timestampPickerState.current.getMonth();
  setTimestampPickerTime(timestampPickerState.selectedDate);
  renderTimestampPickerCalendar();
  updateTimestampPickerPreview();
  panel.classList.remove('hidden');
  setTimeout(() => {
    updateTimestampPickerPlacement();
    focusTimestampPickerSelection();
  }, 0);
}

function closeTimestampPicker() {
  const panel = document.getElementById('ts-picker-panel');
  if (!panel) return;
  panel.classList.add('hidden');
  panel.classList.remove('above', 'viewport-fixed');
  panel.style.top = '';
  panel.style.bottom = '';
  panel.style.maxHeight = '';
}

function getTimestampPickerAnchor() {
  if (timestampPickerState.mode === 'timestamp') {
    return document.querySelector('.ts-input-group-suffix');
  }
  return document.querySelector('.ts-picker-wrap');
}

function updateTimestampPickerPlacement() {
  const panel = document.getElementById('ts-picker-panel');
  const anchor = getTimestampPickerAnchor();
  if (!panel || !anchor || panel.classList.contains('hidden')) return;

  panel.classList.remove('above', 'viewport-fixed');
  panel.style.top = '';
  panel.style.bottom = '';
  panel.style.maxHeight = '';

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const isMobile = viewportWidth <= 700;
  const gap = 8;
  const edgePadding = isMobile ? 12 : 16;
  const anchorRect = anchor.getBoundingClientRect();

  if (isMobile) {
    panel.classList.add('viewport-fixed');

    const fixedTop = Math.max(edgePadding, Math.min(anchorRect.bottom + gap, viewportHeight - edgePadding));
    const availableHeight = Math.max(220, viewportHeight - fixedTop - edgePadding);

    panel.style.top = `${fixedTop}px`;
    panel.style.bottom = 'auto';
    panel.style.maxHeight = `${availableHeight}px`;
    return;
  }

  const panelRect = panel.getBoundingClientRect();
  const spaceBelow = viewportHeight - anchorRect.bottom - gap - edgePadding;
  const spaceAbove = anchorRect.top - gap - edgePadding;

  if (panelRect.height > spaceBelow && spaceAbove > spaceBelow) {
    panel.classList.add('above');
    panel.style.maxHeight = `${Math.max(220, spaceAbove)}px`;
    return;
  }

  panel.style.maxHeight = `${Math.max(220, spaceBelow)}px`;
}

function renderTimestampPickerCalendar() {
  const title = document.getElementById('ts-picker-title');
  const daysEl = document.getElementById('ts-picker-days');
  if (!title || !daysEl) return;

  const year = timestampPickerState.viewingYear;
  const month = timestampPickerState.viewingMonth;
  title.textContent = `${year} 年 ${padTime(month + 1)} 月`;

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  let html = '';

  for (let i = 0; i < 42; i++) {
    let dayNumber;
    let renderMonth = month;
    let renderYear = year;
    let muted = false;

    if (i < startOffset) {
      dayNumber = prevMonthDays - startOffset + i + 1;
      renderMonth = month - 1;
      muted = true;
    } else if (i >= startOffset + daysInMonth) {
      dayNumber = i - startOffset - daysInMonth + 1;
      renderMonth = month + 1;
      muted = true;
    } else {
      dayNumber = i - startOffset + 1;
    }

    if (renderMonth < 0) {
      renderMonth = 11;
      renderYear -= 1;
    } else if (renderMonth > 11) {
      renderMonth = 0;
      renderYear += 1;
    }

    const isToday =
      today.getFullYear() === renderYear &&
      today.getMonth() === renderMonth &&
      today.getDate() === dayNumber;

    const isSelected =
      timestampPickerState.selectedDate &&
      timestampPickerState.selectedDate.getFullYear() === renderYear &&
      timestampPickerState.selectedDate.getMonth() === renderMonth &&
      timestampPickerState.selectedDate.getDate() === dayNumber;

    const classNames = ['ts-picker-day'];
    if (muted) classNames.push('muted');
    if (isToday) classNames.push('today');
    if (isSelected) classNames.push('selected');

    html += `<button type="button" class="${classNames.join(' ')}" onclick="selectTimestampPickerDate(${renderYear}, ${renderMonth}, ${dayNumber})" data-picker-date="${renderYear}-${padTime(renderMonth + 1)}-${padTime(dayNumber)}">${dayNumber}</button>`;
  }

  daysEl.innerHTML = html;
}

function focusTimestampPickerSelection() {
  if (typeof document.querySelector !== 'function') return;
  const selectedDay = document.querySelector('.ts-picker-day.selected');
  if (!selectedDay) return;

  if (typeof selectedDay.scrollIntoView === 'function') {
    selectedDay.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth'
    });
  }

  if (selectedDay.classList && typeof selectedDay.classList.add === 'function') {
    selectedDay.classList.add('focused-day');
  }

  if (typeof selectedDay.focus === 'function') {
    selectedDay.focus({ preventScroll: true });
  }
}

function changeTimestampPickerMonth(delta) {
  timestampPickerState.viewingMonth += delta;
  if (timestampPickerState.viewingMonth < 0) {
    timestampPickerState.viewingMonth = 11;
    timestampPickerState.viewingYear -= 1;
  } else if (timestampPickerState.viewingMonth > 11) {
    timestampPickerState.viewingMonth = 0;
    timestampPickerState.viewingYear += 1;
  }
  renderTimestampPickerCalendar();
  updateTimestampPickerPlacement();
}

function selectTimestampPickerDate(year, month, day) {
  ensureTimestampPickerSelection();
  timestampPickerState.selectedDate = new Date(
    year,
    month,
    day,
    timestampPickerState.selectedDate.getHours(),
    timestampPickerState.selectedDate.getMinutes(),
    timestampPickerState.selectedDate.getSeconds()
  );
  timestampPickerState.viewingYear = year;
  timestampPickerState.viewingMonth = month;
  syncTimestampPickerInput();
  renderTimestampPickerCalendar();
  updateTimestampPickerPreview();
  updateTimestampPickerPlacement();
}

function onTimestampPickerTimeChange() {
  ensureTimestampPickerSelection();
  timestampPickerState.selectedDate.setHours(Number(document.getElementById('ts-picker-hour').value));
  timestampPickerState.selectedDate.setMinutes(Number(document.getElementById('ts-picker-minute').value));
  timestampPickerState.selectedDate.setSeconds(Number(document.getElementById('ts-picker-second').value));
  syncTimestampPickerInput();
  updateTimestampPickerPreview();
}

function applyTimestampQuickDate(type) {
  const now = new Date();
  const base = timestampPickerState.selectedDate ? new Date(timestampPickerState.selectedDate.getTime()) : new Date();

  switch (type) {
    case 'now':
      timestampPickerState.selectedDate = new Date();
      timestampPickerState.viewingYear = timestampPickerState.selectedDate.getFullYear();
      timestampPickerState.viewingMonth = timestampPickerState.selectedDate.getMonth();
      setTimestampPickerTime(timestampPickerState.selectedDate);
      syncTimestampPickerInput();
      renderTimestampPickerCalendar();
      updateTimestampPickerPreview();
      updateTimestampPickerPlacement();
      return;
    case 'today':
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      break;
    case 'tomorrow':
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'weekStart': {
      const currentDay = now.getDay() || 7;
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() - currentDay + 1);
      break;
    }
    case 'monthStart':
      base.setFullYear(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      break;
  }

  timestampPickerState.selectedDate = base;
  timestampPickerState.viewingYear = base.getFullYear();
  timestampPickerState.viewingMonth = base.getMonth();
  setTimestampPickerTime(base);
  syncTimestampPickerInput();
  renderTimestampPickerCalendar();
  updateTimestampPickerPreview();
  updateTimestampPickerPlacement();
}

function clearTimestampPicker() {
  timestampPickerState.selectedDate = null;
  syncTimestampPickerInput();
  updateTimestampPickerPreview();
  document.getElementById('ts-picker-hour').value = '00';
  document.getElementById('ts-picker-minute').value = '00';
  document.getElementById('ts-picker-second').value = '00';
  updateTimestampPickerPlacement();
}

function confirmTimestampPicker() {
  ensureTimestampPickerSelection();
  onTimestampPickerTimeChange();
  syncTimestampPickerInput();
  closeTimestampPicker();
}

function getTimestampUnit() {
  const selected = document.querySelector('input[name="ts-unit"]:checked');
  return selected ? selected.value : 'seconds';
}

function isMillisecondUnit() {
  return getTimestampUnit() === 'milliseconds';
}

function updateTimestampInputPlaceholder() {
  const input = document.getElementById('ts-timestamp');
  if (!input) return;
  input.placeholder = isMillisecondUnit() ? '输入时间戳（毫秒）' : '输入时间戳（秒）';
}

function formatTimestampValue(ms) {
  return isMillisecondUnit() ? ms : Math.floor(ms / 1000);
}

function formatTimestampUnitLabel() {
  return isMillisecondUnit() ? '毫秒' : '秒';
}

function updateTimestampDetectHint(message = '') {
  const hint = document.getElementById('ts-detect-hint');
  if (!hint) return;
  hint.textContent = message;
}

function flashCopiedState(element, originalText) {
  if (!element) return;
  element.classList.add('copied');
  element.dataset.originalText = originalText;
  element.textContent = '✅ 已复制';
  setTimeout(() => {
    element.classList.remove('copied');
    element.textContent = element.dataset.originalText || originalText;
  }, 1200);
}

function writeTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text);
  }

  if (typeof document !== 'undefined' && typeof document.createElement === 'function' && document.body) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      if (typeof document.execCommand === 'function') {
        document.execCommand('copy');
      }
    } finally {
      document.body.removeChild(textarea);
    }

    return Promise.resolve();
  }

  return Promise.resolve();
}

function copyTimestampResult(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const text = (element.textContent || '').trim();
  if (!text || text === '--' || text === '请输入时间戳') return;

  writeTextToClipboard(text).then(() => {
    flashCopiedState(element, text);
  });
}

function pulseRealtimeStatusRow(id, className) {
  const element = document.getElementById(id);
  if (!element) return;
  const row = element.closest('.ts-now-row');
  if (!row) return;
  row.classList.remove(className);
  void row.offsetWidth;
  row.classList.add(className);
}

function updateLiveIndicatorMode() {
  const liveIndicator = document.querySelector('.ts-now-live');
  if (!liveIndicator) return;
  liveIndicator.classList.toggle('ts-now-live-seconds', !isMillisecondUnit());
  liveIndicator.classList.toggle('ts-now-live-milliseconds', isMillisecondUnit());
}

function pulseLiveIndicator() {
  const liveIndicator = document.querySelector('.ts-now-live');
  if (!liveIndicator || isMillisecondUnit()) return;
  liveIndicator.classList.remove('ts-now-live-tick');
  void liveIndicator.offsetWidth;
  liveIndicator.classList.add('ts-now-live-tick');
}

function animateCurrentTimestampUnitSwitch(nextText) {
  const timestampEl = document.getElementById('ts-now-timestamp');
  if (!timestampEl) return false;
  if (timestampEl.textContent === nextText) return false;
  timestampEl.classList.remove('ts-now-data-roll');
  void timestampEl.offsetWidth;
  timestampEl.textContent = nextText;
  timestampEl.classList.add('ts-now-data-roll');
  return true;
}

function parseTimestampToMilliseconds(rawValue) {
  if (!/^[+-]?\d+$/.test(rawValue)) {
    return { error: 'invalid-number' };
  }

  const normalized = rawValue.replace(/^[+-]/, '');
  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    return { error: 'invalid-number' };
  }

  if (normalized.length === 13) {
    return { milliseconds: numericValue, detectedUnit: 'milliseconds', detectedBy: 'length' };
  }

  if (normalized.length === 10) {
    return { milliseconds: numericValue * 1000, detectedUnit: 'seconds', detectedBy: 'length' };
  }

  return {
    milliseconds: isMillisecondUnit() ? numericValue : numericValue * 1000,
    detectedUnit: isMillisecondUnit() ? 'milliseconds' : 'seconds',
    detectedBy: 'toggle'
  };
}

function refreshNow() {
  const nowMs = Date.now();
  const nowValue = formatTimestampValue(nowMs);
  const timestampEl = document.getElementById('ts-now-timestamp');
  const displayEl = document.getElementById('ts-now-display');
  if (timestampEl) {
    timestampEl.textContent = nowValue + ' ' + formatTimestampUnitLabel();
  }
  if (displayEl) {
    displayEl.textContent = new Date(nowMs).toLocaleString('zh-CN');
  }
  pulseRealtimeStatusRow('ts-now-display', 'ts-now-row-live-tick');
  if (!isMillisecondUnit()) {
    pulseRealtimeStatusRow('ts-now-timestamp', 'ts-now-row-seconds-flash');
  }
  pulseLiveIndicator();
}

function onTimestampUnitChange() {
  const nowText = formatTimestampValue(Date.now()) + ' ' + formatTimestampUnitLabel();
  animateCurrentTimestampUnitSwitch(nowText);
  updateLiveIndicatorMode();
  updateTimestampInputPlaceholder();
  refreshNow();

  const dateTimeVal = document.getElementById('ts-datetime').value;
  if (dateTimeVal) {
    dateToTs();
  } else {
    document.getElementById('ts-to-ts').textContent = '--';
  }

  const timestampVal = document.getElementById('ts-timestamp').value.trim();
  if (timestampVal) {
    tsToDate();
  } else {
    document.getElementById('ts-to-date').textContent = '--';
    updateTimestampDetectHint('');
  }
}

refreshNow();
updateLiveIndicatorMode();
updateTimestampInputPlaceholder();
updateTimestampDetectHint('');
setInterval(refreshNow, 1000);

function dateToTs() {
  const val = document.getElementById('ts-datetime').value;
  if (!val) { document.getElementById('ts-to-ts').textContent = '请选择时间'; return; }
  const parsedDate = parsePickerInputValue(val);
  if (!parsedDate) { document.getElementById('ts-to-ts').textContent = '请选择时间'; return; }
  const ms = parsedDate.getTime();
  document.getElementById('ts-to-ts').textContent = formatTimestampValue(ms) + ' ' + formatTimestampUnitLabel();
}
function tsToDate() {
  const val = document.getElementById('ts-timestamp').value.trim();
  if (!val) {
    document.getElementById('ts-to-date').textContent = '请输入时间戳';
    updateTimestampDetectHint('');
    return;
  }
  const parsed = parseTimestampToMilliseconds(val);
  if (parsed.error) {
    document.getElementById('ts-to-date').textContent = '❌ 无效数字';
    updateTimestampDetectHint('');
    return;
  }
  const d = new Date(parsed.milliseconds);
  if (Number.isNaN(d.getTime())) {
    document.getElementById('ts-to-date').textContent = '❌ 无效时间戳';
    updateTimestampDetectHint('');
    return;
  }
  if (parsed.detectedBy === 'length') {
    updateTimestampDetectHint(parsed.detectedUnit === 'milliseconds' ? '已自动识别为毫秒（13 位）' : '已自动识别为秒（10 位）');
  } else {
    updateTimestampDetectHint('按当前选择的“' + formatTimestampUnitLabel() + '”解析');
  }
  document.getElementById('ts-to-date').textContent = d.toLocaleString('zh-CN');
}

/* === 通用工具函数 === */
function clearInput(id) {
  document.getElementById(id).value = '';
  if (id === 'count-input') liveCount();
}

function copyOutput(id) {
  const el = document.getElementById(id);
  let text = '';
  if (el.tagName === 'PRE' || el.tagName === 'DIV') {
    text = el.textContent || el.innerText;
  } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    text = el.value;
  } else {
    text = el.textContent || el.innerText;
  }
  if (!text || text === '--') return;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = '✅ 已复制';
    setTimeout(() => btn.textContent = orig, 1200);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* === 打赏弹窗 === */
function getPayPalSupportUrl() {
  return supportConfig.paypalUsername
    ? `https://www.paypal.com/paypalme/${supportConfig.paypalUsername}`
    : 'https://www.paypal.com/paypalme/';
}

function getBuyMeACoffeeUrl() {
  return supportConfig.buyMeACoffeeUsername
    ? `https://buymeacoffee.com/${supportConfig.buyMeACoffeeUsername}`
    : 'https://buymeacoffee.com/';
}

function getKoFiUrl() {
  return supportConfig.koFiUsername
    ? `https://ko-fi.com/${supportConfig.koFiUsername}`
    : 'https://ko-fi.com/';
}

function applySupportLinks() {
  const contactText = document.getElementById('support-contact-text');
  const paypalLink = document.getElementById('paypal-support-link');
  const paypalText = document.getElementById('paypal-support-text');
  const bmacLink = document.getElementById('bmac-support-link');
  const bmacText = document.getElementById('bmac-support-text');
  const kofiLink = document.getElementById('kofi-support-link');
  const kofiText = document.getElementById('kofi-support-text');

  const hasPayPal = Boolean(supportConfig.paypalUsername);
  const hasBmac = Boolean(supportConfig.buyMeACoffeeUsername);
  const hasKoFi = Boolean(supportConfig.koFiUsername);
  const paypalUrl = getPayPalSupportUrl();
  const bmacUrl = getBuyMeACoffeeUrl();
  const kofiUrl = getKoFiUrl();

  if (contactText) {
    contactText.textContent = supportConfig.contact || '未设置';
  }

  if (paypalLink) {
    paypalLink.href = hasPayPal ? paypalUrl : '#';
    paypalLink.textContent = hasPayPal ? 'PayPal 支持' : 'PayPal（待配置）';
    paypalLink.classList.toggle('is-disabled', !hasPayPal);
    paypalLink.setAttribute('aria-disabled', hasPayPal ? 'false' : 'true');
    paypalLink.tabIndex = hasPayPal ? 0 : -1;
  }
  if (paypalText) {
    paypalText.textContent = hasPayPal ? paypalUrl : '未配置 PayPal 用户名';
  }

  if (bmacLink) {
    bmacLink.href = hasBmac ? bmacUrl : '#';
    bmacLink.textContent = hasBmac ? 'Buy Me a Coffee' : 'Buy Me a Coffee（待配置）';
    bmacLink.classList.toggle('is-disabled', !hasBmac);
    bmacLink.setAttribute('aria-disabled', hasBmac ? 'false' : 'true');
    bmacLink.tabIndex = hasBmac ? 0 : -1;
  }
  if (bmacText) {
    bmacText.textContent = hasBmac ? bmacUrl : '未配置 Buy Me a Coffee 用户名';
  }

  if (kofiLink) {
    kofiLink.href = hasKoFi ? kofiUrl : '#';
    kofiLink.textContent = hasKoFi ? 'Ko-fi' : 'Ko-fi（待配置）';
    kofiLink.classList.toggle('is-disabled', !hasKoFi);
    kofiLink.setAttribute('aria-disabled', hasKoFi ? 'false' : 'true');
    kofiLink.tabIndex = hasKoFi ? 0 : -1;
  }
  if (kofiText) {
    kofiText.textContent = hasKoFi ? kofiUrl : '未配置 Ko-fi 用户名';
  }
}

function showSupport() {
  document.getElementById('support-modal').classList.remove('hidden');
  applySupportLinks();
  switchSupportTab('cn');
}
function hideSupport() {
  document.getElementById('support-modal').classList.add('hidden');
}
function switchSupportTab(tab) {
  const isCn = tab === 'cn';
  const cnTab = document.getElementById('support-tab-cn');
  const intlTab = document.getElementById('support-tab-intl');
  const cnPanel = document.getElementById('support-panel-cn');
  const intlPanel = document.getElementById('support-panel-intl');

  if (cnTab) cnTab.classList.toggle('active', isCn);
  if (intlTab) intlTab.classList.toggle('active', !isCn);
  if (cnPanel) cnPanel.classList.toggle('hidden', !isCn);
  if (intlPanel) intlPanel.classList.toggle('hidden', isCn);
}
function copySupportContact() {
  const value = supportConfig.contact || '';
  const button = document.getElementById('support-contact-copy-btn');
  if (!value) return;
  writeTextToClipboard(value).then(() => {
    if (!button) return;
    const originalText = button.dataset.originalText || button.textContent;
    button.dataset.originalText = originalText;
    button.textContent = '已复制';
    setTimeout(() => {
      button.textContent = button.dataset.originalText || '复制联系方式';
    }, 1200);
  });
}
document.getElementById('support-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) hideSupport();
});

document.getElementById('ts-timestamp').addEventListener('input', () => {
  const val = document.getElementById('ts-timestamp').value.trim();
  if (val) {
    tsToDate();
  } else {
    document.getElementById('ts-to-date').textContent = '--';
    updateTimestampDetectHint('');
  }
});

document.addEventListener('click', (e) => {
  const panel = document.getElementById('ts-picker-panel');
  const wrap = document.querySelector('.ts-picker-wrap');
  if (!panel || panel.classList.contains('hidden') || !wrap) return;
  if (!wrap.contains(e.target)) {
    closeTimestampPicker();
  }
});

document.addEventListener('keydown', (e) => {
  const panel = document.getElementById('ts-picker-panel');
  if (!panel || panel.classList.contains('hidden')) return;
  if (e.key === 'Escape') {
    closeTimestampPicker();
    return;
  }
  if (e.key === 'Enter') {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    confirmTimestampPicker();
  }
});

window.addEventListener('resize', updateTimestampPickerPlacement);
window.addEventListener('scroll', updateTimestampPickerPlacement, true);


const imageInput = document.getElementById('img-input');
const imageCanvas = getImageCanvas();
const imageCanvasWrap = document.getElementById('img-canvas-wrap');

if (imageInput) {
  imageInput.addEventListener('change', onImageInputChange);
}

if (imageCanvas) {
  imageCanvas.addEventListener('pointerdown', onImageCanvasPointerDown);
  imageCanvas.addEventListener('pointermove', onImageCanvasPointerMove);
  imageCanvas.addEventListener('pointerup', onImageCanvasPointerUp);
  imageCanvas.addEventListener('pointercancel', onImageCanvasPointerUp);
}

if (imageCanvasWrap) {
  imageCanvasWrap.addEventListener('dragover', onImageDragOver);
  imageCanvasWrap.addEventListener('dragleave', onImageDragLeave);
  imageCanvasWrap.addEventListener('drop', onImageDrop);
}

window.addEventListener('resize', () => {
  if (imageToolState.image) {
    drawImageEditor();
  }
});

onImageQualityChange();
renderImageQueue();
updateImageCompressionSummary();
syncImageMeta();
clearImageResult();
