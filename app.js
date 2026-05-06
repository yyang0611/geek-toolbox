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
function showSupport() {
  document.getElementById('support-modal').classList.remove('hidden');
}
function hideSupport() {
  document.getElementById('support-modal').classList.add('hidden');
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
