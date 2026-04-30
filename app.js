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
function refreshNow() {
  const now = Math.floor(Date.now() / 1000);
  document.getElementById('ts-now-display').textContent =
    now + ' (本地时间: ' + new Date().toLocaleString('zh-CN') + ')';
}
refreshNow();

function dateToTs() {
  const val = document.getElementById('ts-datetime').value;
  if (!val) { document.getElementById('ts-to-ts').textContent = '请选择时间'; return; }
  const ts = Math.floor(new Date(val).getTime() / 1000);
  document.getElementById('ts-to-ts').textContent = ts + ' 秒';
}
function tsToDate() {
  const val = document.getElementById('ts-timestamp').value.trim();
  if (!val) { document.getElementById('ts-to-date').textContent = '请输入时间戳'; return; }
  const ts = parseInt(val);
  if (isNaN(ts)) { document.getElementById('ts-to-date').textContent = '❌ 无效数字'; return; }
  const d = new Date(ts * 1000);
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
