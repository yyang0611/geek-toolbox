<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t, locale } = useI18n()
const { copy } = useClipboard()

const unit = ref<'s' | 'ms'>('s')
const currentTimestamp = ref(0)
const currentDatetime = ref('')
const timestampInput = ref('')
const dateResult = ref('')
const tsDetectHint = ref('')
const copiedField = ref('')

// Picker state
const pickerVisible = ref(false)
const pickerOverlayRef = ref<HTMLElement | null>(null)
const pickerTarget = ref<'datetime' | 'timestamp'>('datetime')
const pickerYear = ref(new Date().getFullYear())
const pickerMonth = ref(new Date().getMonth())
const pickerDay = ref<number | null>(null)
const pickerHour = ref(0)
const pickerMinute = ref(0)
const pickerSecond = ref(0)
const pickerPreview = ref('--')
const dateInputDisplay = ref('')
const dateToTsResult = ref('')

let timer: ReturnType<typeof setInterval> | null = null

function formatDateTime(date: Date): string {
  const lang = locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
  return date.toLocaleString(lang, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
}

function updateCurrent() {
  const now = Date.now()
  currentTimestamp.value = unit.value === 'ms' ? now : Math.floor(now / 1000)
  currentDatetime.value = formatDateTime(new Date(now))
}

onMounted(() => {
  updateCurrent()
  timer = setInterval(updateCurrent, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function switchUnit(u: 's' | 'ms') {
  unit.value = u
  updateCurrent()
}

watch(timestampInput, (val) => {
  if (val.trim()) {
    timestampToDate()
  } else {
    dateResult.value = ''
    tsDetectHint.value = ''
  }
})

// --- Picker logic ---
const pickerTitle = computed(() => {
  if (locale.value === 'zh-CN') {
    return `${pickerYear.value} 年 ${pickerMonth.value + 1} 月`
  }
  return `${pickerYear.value}-${String(pickerMonth.value + 1).padStart(2, '0')}`
})

const pickerDays = computed(() => {
  const firstDay = new Date(pickerYear.value, pickerMonth.value, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(pickerYear.value, pickerMonth.value + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
})

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)
const seconds = Array.from({ length: 60 }, (_, i) => i)

function openPicker(target: 'datetime' | 'timestamp') {
  pickerTarget.value = target
  const now = new Date()
  pickerYear.value = now.getFullYear()
  pickerMonth.value = now.getMonth()
  pickerDay.value = now.getDate()
  pickerHour.value = now.getHours()
  pickerMinute.value = now.getMinutes()
  pickerSecond.value = now.getSeconds()
  updatePickerPreview()
  pickerVisible.value = true
  nextTick(() => pickerOverlayRef.value?.focus())
}

function closePicker() {
  pickerVisible.value = false
}

function changeMonth(delta: number) {
  let m = pickerMonth.value + delta
  let y = pickerYear.value
  if (m < 0) { m = 11; y-- }
  if (m > 11) { m = 0; y++ }
  pickerMonth.value = m
  pickerYear.value = y
  if (pickerDay.value) {
    const max = new Date(y, m + 1, 0).getDate()
    if (pickerDay.value > max) pickerDay.value = max
  }
  updatePickerPreview()
}

function selectDay(day: number | null) {
  if (day === null) return
  pickerDay.value = day
  updatePickerPreview()
}

function updatePickerPreview() {
  if (!pickerDay.value) {
    pickerPreview.value = '--'
    return
  }
  const d = new Date(pickerYear.value, pickerMonth.value, pickerDay.value,
    pickerHour.value, pickerMinute.value, pickerSecond.value)
  pickerPreview.value = formatDateTime(d)
}

function onPickerTimeChange() {
  updatePickerPreview()
}
function applyQuickDate(type: string) {
  const now = new Date()
  let date: Date
  switch (type) {
    case 'now': date = now; break
    case 'today': date = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break
    case 'yesterday': date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1); break
    case 'tomorrow': date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); break
    case 'weekStart': {
      const day = now.getDay() || 7
      date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1)
      break
    }
    case 'monthStart': date = new Date(now.getFullYear(), now.getMonth(), 1); break
    default: date = now
  }
  pickerYear.value = date.getFullYear()
  pickerMonth.value = date.getMonth()
  pickerDay.value = date.getDate()
  pickerHour.value = date.getHours()
  pickerMinute.value = date.getMinutes()
  pickerSecond.value = date.getSeconds()
  updatePickerPreview()
}

function clearPicker() {
  pickerDay.value = null
  pickerHour.value = 0
  pickerMinute.value = 0
  pickerSecond.value = 0
  pickerPreview.value = '--'
}

function confirmPicker() {
  if (!pickerDay.value) return
  const d = new Date(pickerYear.value, pickerMonth.value, pickerDay.value,
    pickerHour.value, pickerMinute.value, pickerSecond.value)
  if (pickerTarget.value === 'datetime') {
    dateInputDisplay.value = formatDateTime(d)
    const ts = unit.value === 'ms' ? d.getTime() : Math.floor(d.getTime() / 1000)
    dateToTsResult.value = String(ts)
  } else {
    const ts = unit.value === 'ms' ? d.getTime() : Math.floor(d.getTime() / 1000)
    timestampInput.value = String(ts)
    timestampToDate()
  }
  closePicker()
}

function timestampToDate() {
  if (!timestampInput.value) return
  const raw = timestampInput.value.trim()
  if (!/^[+-]?\d+$/.test(raw)) {
    dateResult.value = t('timestamp.invalidTimestamp')
    tsDetectHint.value = ''
    return
  }
  const normalized = raw.replace(/^[+-]/, '')
  let ts = Number(raw)
  if (isNaN(ts)) {
    dateResult.value = t('timestamp.invalidTimestamp')
    tsDetectHint.value = ''
    return
  }
  if (normalized.length === 13) {
    tsDetectHint.value = t('timestamp.detectAutoMilliseconds')
  } else if (normalized.length === 10) {
    tsDetectHint.value = t('timestamp.detectAutoSeconds')
    ts = ts * 1000
  } else {
    if (unit.value === 'ms') {
      tsDetectHint.value = t('timestamp.detectAutoMilliseconds')
    } else {
      tsDetectHint.value = t('timestamp.detectAutoSeconds')
      ts = ts * 1000
    }
  }
  const date = new Date(ts)
  if (isNaN(date.getTime())) {
    dateResult.value = t('timestamp.invalidTimestamp')
    tsDetectHint.value = ''
    return
  }
  dateResult.value = formatDateTime(date) + '\n' + date.toISOString()
}

function flashCopy(field: string, text: string) {
  if (!text) return
  copy(text)
  copiedField.value = field
  setTimeout(() => { copiedField.value = '' }, 1500)
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <div class="timestamp-tool">
    <h2 class="tool-title">{{ t('timestamp.title') }}</h2>

    <!-- Unit selector + Live panel -->
    <section class="section">
      <label class="section-label">{{ t('timestamp.unitLabel') }}</label>
      <div class="unit-switch">
        <label class="unit-option">
          <input type="radio" name="ts-unit" :checked="unit === 's'" @change="switchUnit('s')" />
          <span>{{ t('timestamp.units.seconds') }}</span>
        </label>
        <label class="unit-option">
          <input type="radio" name="ts-unit" :checked="unit === 'ms'" @change="switchUnit('ms')" />
          <span>{{ t('timestamp.units.milliseconds') }}</span>
        </label>
      </div>

      <div class="live-panel">
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-text">{{ t('timestamp.liveLabel') }}</span>
        </div>
        <div class="live-row copyable" :title="t('timestamp.copyCurrentTimestamp')"
             @click="flashCopy('ts', String(currentTimestamp))">
          <span class="live-key">{{ t('timestamp.currentTimestampLabel') }}</span>
          <span class="live-data">{{ currentTimestamp }}</span>
          <span v-if="copiedField === 'ts'" class="copied-tag">{{ t('common.copied') }}</span>
        </div>
        <div class="live-row copyable" :title="t('timestamp.copyCurrentTime')"
             @click="flashCopy('time', currentDatetime)">
          <span class="live-key">{{ t('timestamp.currentTimeLabel') }}</span>
          <span class="live-data wide">{{ currentDatetime }}</span>
          <span v-if="copiedField === 'time'" class="copied-tag">{{ t('common.copied') }}</span>
        </div>
      </div>
    </section>

    <!-- Date to Timestamp -->
    <section class="section">
      <label class="section-label">{{ t('timestamp.dateToTimestampLabel') }}</label>
      <div class="picker-wrap">
        <input type="text" class="input datetime-input" readonly
               :value="dateInputDisplay"
               :placeholder="t('timestamp.datetimePlaceholder')"
               @click="openPicker('datetime')" />
      </div>
      <div v-if="dateToTsResult" class="result copyable" @click="flashCopy('dateToTs', dateToTsResult)">
        <span class="result-text">{{ dateToTsResult }}</span>
        <span v-if="copiedField === 'dateToTs'" class="copied-tag">{{ t('common.copied') }}</span>
      </div>
      <div v-else class="result placeholder">--</div>
    </section>

    <!-- Timestamp to Date -->
    <section class="section">
      <label class="section-label">{{ t('timestamp.timestampToDateLabel') }}</label>
      <div class="input-row">
        <input type="text" v-model="timestampInput" class="input"
               :placeholder="t('timestamp.inputPlaceholderSeconds')"
               @keyup.enter="timestampToDate" />
        <button class="btn outline small" @click="openPicker('timestamp')" :title="t('timestamp.selectTime')">📅</button>
      </div>
      <p v-if="tsDetectHint" class="detect-hint">{{ tsDetectHint }}</p>
      <div v-if="dateResult" class="result copyable" @click="flashCopy('dateResult', dateResult)">
        <pre class="result-text">{{ dateResult }}</pre>
        <span v-if="copiedField === 'dateResult'" class="copied-tag">{{ t('common.copied') }}</span>
      </div>
      <div v-else class="result placeholder">--</div>
    </section>

    <!-- Picker Panel (Teleport) -->
    <Teleport to="body">
      <Transition name="picker-fade">
        <div v-if="pickerVisible" class="picker-overlay" @click.self="closePicker" @keydown.escape="closePicker" tabindex="-1" ref="pickerOverlayRef">
          <div class="picker-panel">
            <div class="picker-header">
              <button class="btn outline small" @click="changeMonth(-1)">&lsaquo;</button>
              <div class="picker-title">{{ pickerTitle }}</div>
              <button class="btn outline small" @click="changeMonth(1)">&rsaquo;</button>
            </div>

            <div class="picker-body">
              <div class="picker-calendar">
                <div class="weekdays">
                  <span>{{ t('timestamp.weekdays.mon') }}</span>
                  <span>{{ t('timestamp.weekdays.tue') }}</span>
                  <span>{{ t('timestamp.weekdays.wed') }}</span>
                  <span>{{ t('timestamp.weekdays.thu') }}</span>
                  <span>{{ t('timestamp.weekdays.fri') }}</span>
                  <span>{{ t('timestamp.weekdays.sat') }}</span>
                  <span>{{ t('timestamp.weekdays.sun') }}</span>
                </div>
                <div class="days-grid">
                  <button v-for="(day, idx) in pickerDays" :key="idx"
                          class="day-cell"
                          :class="{ active: day === pickerDay, empty: day === null }"
                          :disabled="day === null"
                          @click="selectDay(day)">
                    {{ day ?? '' }}
                  </button>
                </div>
              </div>

              <div class="picker-side">
                <div class="quick-actions">
                  <button class="btn outline small" @click="applyQuickDate('now')">{{ t('timestamp.quick.now') }}</button>
                  <button class="btn outline small" @click="applyQuickDate('today')">{{ t('timestamp.quick.today') }}</button>
                  <button class="btn outline small" @click="applyQuickDate('yesterday')">{{ t('timestamp.quick.yesterday') }}</button>
                  <button class="btn outline small" @click="applyQuickDate('tomorrow')">{{ t('timestamp.quick.tomorrow') }}</button>
                  <button class="btn outline small" @click="applyQuickDate('weekStart')">{{ t('timestamp.quick.weekStart') }}</button>
                  <button class="btn outline small" @click="applyQuickDate('monthStart')">{{ t('timestamp.quick.monthStart') }}</button>
                  <button class="btn outline small" @click="clearPicker">{{ t('common.clear') }}</button>
                </div>

                <div class="time-selectors">
                  <label class="time-field">
                    <span>{{ t('timestamp.hour') }}</span>
                    <select v-model.number="pickerHour" @change="onPickerTimeChange">
                      <option v-for="h in hours" :key="h" :value="h">{{ pad2(h) }}</option>
                    </select>
                  </label>
                  <label class="time-field">
                    <span>{{ t('timestamp.minute') }}</span>
                    <select v-model.number="pickerMinute" @change="onPickerTimeChange">
                      <option v-for="m in minutes" :key="m" :value="m">{{ pad2(m) }}</option>
                    </select>
                  </label>
                  <label class="time-field">
                    <span>{{ t('timestamp.second') }}</span>
                    <select v-model.number="pickerSecond" @change="onPickerTimeChange">
                      <option v-for="s in seconds" :key="s" :value="s">{{ pad2(s) }}</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div class="picker-preview">{{ pickerPreview }}</div>

            <div class="picker-actions">
              <button class="btn outline small" @click="closePicker">{{ t('common.cancel') }}</button>
              <button class="btn primary small" @click="confirmPicker">{{ t('common.confirm') }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- PLACEHOLDER_TEMPLATE_CONTINUE -->
  </div>
</template>

<style scoped>
.timestamp-tool { font-family: var(--font-sans); }
.tool-title { font-size: 1.3rem; color: var(--text); margin-bottom: 20px; background: linear-gradient(135deg, var(--text), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.section {
  margin-bottom: 20px; padding: 16px;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
}
.section-label {
  display: block; font-size: 0.82rem; color: var(--text-dim); margin-bottom: 10px; font-weight: 500;
}
.unit-switch { display: flex; gap: 16px; margin-bottom: 12px; }
.unit-option {
  display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--text); cursor: pointer;
}
.unit-option input { accent-color: var(--primary); }

.live-panel {
  border: 1px solid var(--primary); border-radius: var(--radius); padding: 12px; position: relative;
}
.live-indicator { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.live-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--red);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.live-text { font-size: 0.7rem; font-weight: 700; color: var(--red); text-transform: uppercase; }
.live-row {
  display: flex; align-items: center; gap: 12px; padding: 6px 10px;
  border-radius: 6px; transition: background 0.15s;
}
.live-row.copyable { cursor: pointer; }
.live-row.copyable:hover { background: var(--surface2); }
.live-key { font-size: 0.78rem; color: var(--text-dim); min-width: 90px; }
.live-data {
  font-family: var(--font-mono); font-size: 1.1rem; color: var(--primary); font-weight: 600;
}
.live-data.wide { font-size: 0.9rem; }
.copied-tag { font-size: 0.72rem; color: var(--accent); margin-left: auto; }

.picker-wrap { position: relative; }
.datetime-input { cursor: pointer; }
.input-row { display: flex; gap: 10px; align-items: center; }
.input {
  flex: 1; padding: 8px 12px; background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text); font-family: var(--font-mono); font-size: 0.85rem;
}
.input:focus { outline: none; border-color: var(--primary); }
.detect-hint { font-size: 0.75rem; color: var(--accent); margin-top: 6px; }
.result {
  margin-top: 10px; padding: 10px 14px; background: var(--surface2); border: 1px solid var(--border);
  border-radius: var(--radius); display: flex; align-items: center; gap: 8px;
}
.result.copyable { cursor: pointer; }
.result.copyable:hover { border-color: var(--primary); }
.result.placeholder { color: var(--text-dim); font-size: 0.85rem; }
.result-text {
  font-family: var(--font-mono); font-size: 0.85rem; color: var(--text);
  margin: 0; white-space: pre-wrap; word-break: break-all;
}

/* Picker overlay */
.picker-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
}
.picker-panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto;
}
.picker-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.picker-title { font-size: 0.9rem; font-weight: 600; color: var(--text); }
.picker-body { display: flex; gap: 16px; flex-wrap: wrap; }
.picker-calendar { flex: 1; min-width: 220px; }
.weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr); text-align: center;
  font-size: 0.72rem; color: var(--text-dim); margin-bottom: 4px;
}
.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.day-cell {
  width: 32px; height: 32px; border-radius: 6px; border: none; background: transparent;
  color: var(--text); font-size: 0.8rem; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.day-cell:hover:not(.empty) { background: var(--surface2); }
.day-cell.active { background: var(--primary); color: #fff; }
.day-cell.empty { cursor: default; }
.picker-side { display: flex; flex-direction: column; gap: 12px; min-width: 140px; }
.quick-actions { display: flex; flex-wrap: wrap; gap: 6px; }
.quick-actions .btn { font-size: 0.72rem; padding: 4px 8px; }
.time-selectors { display: flex; gap: 8px; }
.time-field { display: flex; flex-direction: column; gap: 2px; font-size: 0.72rem; color: var(--text-dim); }
.time-field select {
  padding: 4px 6px; border-radius: 6px; border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.8rem;
}
.picker-preview {
  margin-top: 12px; padding: 8px 12px; background: var(--surface2); border-radius: 6px;
  font-family: var(--font-mono); font-size: 0.85rem; color: var(--text); text-align: center;
}
.picker-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }

.picker-fade-enter-active, .picker-fade-leave-active { transition: opacity 0.2s; }
.picker-fade-enter-from, .picker-fade-leave-to { opacity: 0; }

/* Buttons */
.btn {
  padding: 8px 16px; border-radius: var(--radius); font-size: 0.82rem;
  cursor: pointer; border: 1px solid var(--border); transition: all 0.2s;
}
.btn.outline { background: transparent; color: var(--text); border-color: var(--border); }
.btn.outline:hover { border-color: var(--primary); color: var(--primary); }
.btn.primary { background: var(--primary); color: #fff; border-color: var(--primary); }
.btn.primary:hover { filter: brightness(1.1); box-shadow: var(--glow-primary); }
.btn.small { padding: 5px 10px; font-size: 0.78rem; }

@media (max-width: 600px) {
  .picker-body { flex-direction: column; }
  .live-data { font-size: 0.9rem; }
  .input-row { flex-direction: column; }
}
</style>

