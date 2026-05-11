<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClipboard } from '@/composables/useClipboard'

const { t } = useI18n()
const { copied, copy } = useClipboard()
const copiedField = ref<'hex' | 'rgb' | 'hsl' | 'all' | ''>('')

// State
const hex = ref('#6366f1')
const r = ref(99)
const g = ref(102)
const b = ref(241)
const h = ref(239)
const s = ref(84)
const l = ref(67)
const alpha = ref(100)
const history = ref<string[]>([])
const eyeDropperSupported = ref(false)

const PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
]

const STORAGE_KEY = 'color-tool-history'
const MAX_HISTORY = 20

// --- Color conversion functions ---
function hexToRgb(hexStr: string): { r: number; g: number; b: number; a?: number } | null {
  const clean = hexStr.replace('#', '')
  if (clean.length === 3) {
    return { r: parseInt(clean[0] + clean[0], 16), g: parseInt(clean[1] + clean[1], 16), b: parseInt(clean[2] + clean[2], 16) }
  }
  if (clean.length === 4) {
    return { r: parseInt(clean[0] + clean[0], 16), g: parseInt(clean[1] + clean[1], 16), b: parseInt(clean[2] + clean[2], 16), a: parseInt(clean[3] + clean[3], 16) / 255 }
  }
  if (clean.length === 6) {
    return { r: parseInt(clean.substring(0, 2), 16), g: parseInt(clean.substring(2, 4), 16), b: parseInt(clean.substring(4, 6), 16) }
  }
  if (clean.length === 8) {
    return { r: parseInt(clean.substring(0, 2), 16), g: parseInt(clean.substring(2, 4), 16), b: parseInt(clean.substring(4, 6), 16), a: parseInt(clean.substring(6, 8), 16) / 255 }
  }
  return null
}

function rgbToHex(rr: number, gg: number, bb: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`
}

function rgbToHsl(rr: number, gg: number, bb: number): { h: number; s: number; l: number } {
  const rd = rr / 255
  const gd = gg / 255
  const bd = bb / 255
  const max = Math.max(rd, gd, bd)
  const min = Math.min(rd, gd, bd)
  const diff = max - min
  let hh = 0
  let ss = 0
  const ll = (max + min) / 2

  if (diff !== 0) {
    ss = ll > 0.5 ? diff / (2 - max - min) : diff / (max + min)
    switch (max) {
      case rd: hh = ((gd - bd) / diff + (gd < bd ? 6 : 0)) / 6; break
      case gd: hh = ((bd - rd) / diff + 2) / 6; break
      case bd: hh = ((rd - gd) / diff + 4) / 6; break
    }
  }
  return { h: Math.round(hh * 360), s: Math.round(ss * 100), l: Math.round(ll * 100) }
}

function hslToRgb(hh: number, ss: number, ll: number): { r: number; g: number; b: number } {
  const sd = ss / 100
  const ld = ll / 100

  if (sd === 0) {
    const val = Math.round(ld * 255)
    return { r: val, g: val, b: val }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = ld < 0.5 ? ld * (1 + sd) : ld + sd - ld * sd
  const p = 2 * ld - q
  const hd = hh / 360

  return {
    r: Math.round(hue2rgb(p, q, hd + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hd) * 255),
    b: Math.round(hue2rgb(p, q, hd - 1 / 3) * 255)
  }
}

// --- Sync functions ---
function updateFromHex(newHex: string) {
  const rgb = hexToRgb(newHex)
  if (!rgb) return
  r.value = rgb.r
  g.value = rgb.g
  b.value = rgb.b
  if (rgb.a !== undefined) alpha.value = Math.round(rgb.a * 100)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  h.value = hsl.h
  s.value = hsl.s
  l.value = hsl.l
}

function parseColorString(input: string): boolean {
  const rgbaMatch = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/)
  if (rgbaMatch) {
    r.value = clamp(parseInt(rgbaMatch[1]), 0, 255)
    g.value = clamp(parseInt(rgbaMatch[2]), 0, 255)
    b.value = clamp(parseInt(rgbaMatch[3]), 0, 255)
    if (rgbaMatch[4]) alpha.value = Math.round(clamp(parseFloat(rgbaMatch[4]), 0, 1) * 100)
    updateFromRgb()
    return true
  }
  const hslaMatch = input.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*(?:,\s*([\d.]+))?\s*\)/)
  if (hslaMatch) {
    h.value = clamp(parseInt(hslaMatch[1]), 0, 360)
    s.value = clamp(parseInt(hslaMatch[2]), 0, 100)
    l.value = clamp(parseInt(hslaMatch[3]), 0, 100)
    if (hslaMatch[4]) alpha.value = Math.round(clamp(parseFloat(hslaMatch[4]), 0, 1) * 100)
    updateFromHsl()
    return true
  }
  return false
}

function updateFromRgb() {
  hex.value = rgbToHex(r.value, g.value, b.value)
  const hsl = rgbToHsl(r.value, g.value, b.value)
  h.value = hsl.h
  s.value = hsl.s
  l.value = hsl.l
}

function updateFromHsl() {
  const rgb = hslToRgb(h.value, s.value, l.value)
  r.value = rgb.r
  g.value = rgb.g
  b.value = rgb.b
  hex.value = rgbToHex(rgb.r, rgb.g, rgb.b)
}

// --- Watchers ---
watch(hex, (val) => {
  if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)) {
    updateFromHex(val)
    addToHistory(val)
  }
})

// --- History ---
function addToHistory(color: string) {
  const idx = history.value.indexOf(color)
  if (idx !== -1) history.value.splice(idx, 1)
  history.value.unshift(color)
  if (history.value.length > MAX_HISTORY) history.value.pop()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
}

function loadHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) history.value = JSON.parse(stored)
  } catch { /* ignore */ }
}

// --- Color schemes ---
const complementary = computed(() => {
  const newH = (h.value + 180) % 360
  const rgb = hslToRgb(newH, s.value, l.value)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
})

const analogous = computed(() => {
  return [30, -30].map(offset => {
    const newH = (h.value + offset + 360) % 360
    const rgb = hslToRgb(newH, s.value, l.value)
    return rgbToHex(rgb.r, rgb.g, rgb.b)
  })
})

const triadic = computed(() => {
  return [120, 240].map(offset => {
    const newH = (h.value + offset) % 360
    const rgb = hslToRgb(newH, s.value, l.value)
    return rgbToHex(rgb.r, rgb.g, rgb.b)
  })
})

// --- EyeDropper ---
async function pickColor() {
  try {
    const dropper = new (window as any).EyeDropper()
    const result = await dropper.open()
    hex.value = result.sRGBHex
  } catch { /* user cancelled */ }
}

// --- Computed display values ---
const rgbString = computed(() => `rgb(${r.value}, ${g.value}, ${b.value})`)
const rgbaString = computed(() => `rgba(${r.value}, ${g.value}, ${b.value}, ${(alpha.value / 100).toFixed(2)})`)
const hslString = computed(() => `hsl(${h.value}, ${s.value}%, ${l.value}%)`)
const hslaString = computed(() => `hsla(${h.value}, ${s.value}%, ${l.value}%, ${(alpha.value / 100).toFixed(2)})`)
const hexaString = computed(() => {
  const a = Math.round((alpha.value / 100) * 255).toString(16).padStart(2, '0')
  return alpha.value < 100 ? `${hex.value}${a}` : hex.value
})

// --- Input handlers ---
function onHexInput(e: Event) {
  const val = (e.target as HTMLInputElement).value.trim()
  if (parseColorString(val)) {
    addToHistory(hex.value)
    return
  }
  hex.value = val
}

function onRgbInput() {
  r.value = clamp(r.value, 0, 255)
  g.value = clamp(g.value, 0, 255)
  b.value = clamp(b.value, 0, 255)
  updateFromRgb()
  addToHistory(hex.value)
}

function onHslInput() {
  h.value = clamp(h.value, 0, 360)
  s.value = clamp(s.value, 0, 100)
  l.value = clamp(l.value, 0, 100)
  updateFromHsl()
  addToHistory(hex.value)
}

function onPickerChange(e: Event) {
  hex.value = (e.target as HTMLInputElement).value
}

function selectPreset(color: string) {
  hex.value = color
}

function selectHistory(color: string) {
  hex.value = color
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function copyAll() {
  const text = `HEX: ${hexaString.value}\nRGBA: ${rgbaString.value}\nHSLA: ${hslaString.value}`
  copy(text)
  copiedField.value = 'all'
  setTimeout(() => { copiedField.value = '' }, 1500)
}

function copyHex() {
  copy(hexaString.value)
  copiedField.value = 'hex'
  setTimeout(() => { copiedField.value = '' }, 1500)
}

function copyRgb() {
  copy(rgbaString.value)
  copiedField.value = 'rgb'
  setTimeout(() => { copiedField.value = '' }, 1500)
}

function copyHsl() {
  copy(hslaString.value)
  copiedField.value = 'hsl'
  setTimeout(() => { copiedField.value = '' }, 1500)
}

function clearHistory() {
  history.value = []
  localStorage.removeItem(STORAGE_KEY)
}

onMounted(() => {
  eyeDropperSupported.value = 'EyeDropper' in window
  loadHistory()
  updateFromHex(hex.value)
})
</script>

<!-- TEMPLATE_PLACEHOLDER -->

<template>
  <div class="color-tool">
    <h2 class="tool-title">{{ t('color.title') }}</h2>

    <div class="color-layout">
      <!-- Left: picker + preview -->
      <section class="section preview-section">
        <div class="preview-box" :style="{ background: rgbaString }"></div>
        <div class="picker-row">
          <input type="color" :value="hex" @input="onPickerChange" class="color-picker" />
          <button v-if="eyeDropperSupported" class="btn outline eyedropper-btn" @click="pickColor" :title="t('color.eyeDrop')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 22l1-1h3l9-9"/>
              <path d="M3 21v-3l9-9"/>
              <path d="M14.5 5.5l4-4a1.4 1.4 0 0 1 2 0l2 2a1.4 1.4 0 0 1 0 2l-4 4"/>
              <path d="M9.5 10.5l4 4"/>
            </svg>
            <span>{{ t('color.eyeDrop') }}</span>
          </button>
        </div>
        <div class="alpha-row">
          <label class="small-label">{{ t('color.alphaLabel') }}: {{ alpha }}%</label>
          <input type="range" v-model.number="alpha" min="0" max="100" class="alpha-slider" />
        </div>
      </section>

      <!-- Right: inputs -->
      <section class="section inputs-section">
        <!-- HEX -->
        <div class="input-group">
          <label class="small-label">HEX</label>
          <div class="input-with-copy">
            <input type="text" :value="hexaString" @input="onHexInput" class="input" />
            <button class="btn-icon" @click="copyHex" :title="t('color.copy')">{{ copiedField === 'hex' ? '✓' : '⎘' }}</button>
          </div>
        </div>
        <!-- RGB -->
        <div class="input-group">
          <label class="small-label">RGBA</label>
          <div class="rgb-inputs">
            <input type="number" v-model.number="r" min="0" max="255" class="input num-input" @change="onRgbInput" />
            <input type="number" v-model.number="g" min="0" max="255" class="input num-input" @change="onRgbInput" />
            <input type="number" v-model.number="b" min="0" max="255" class="input num-input" @change="onRgbInput" />
            <button class="btn-icon" @click="copyRgb" :title="t('color.copy')">{{ copiedField === 'rgb' ? '✓' : '⎘' }}</button>
          </div>
        </div>
        <!-- HSL -->
        <div class="input-group">
          <label class="small-label">HSLA</label>
          <div class="rgb-inputs">
            <input type="number" v-model.number="h" min="0" max="360" class="input num-input" @change="onHslInput" />
            <input type="number" v-model.number="s" min="0" max="100" class="input num-input" @change="onHslInput" />
            <input type="number" v-model.number="l" min="0" max="100" class="input num-input" @change="onHslInput" />
            <button class="btn-icon" @click="copyHsl" :title="t('color.copy')">{{ copiedField === 'hsl' ? '✓' : '⎘' }}</button>
          </div>
        </div>
        <button class="btn outline copy-all-btn" @click="copyAll">
          {{ t('color.copyAll') }}
        </button>
      </section>
    </div>

    <!-- Presets -->
    <section class="section">
      <label class="section-label">{{ t('color.presets') }}</label>
      <div class="swatches">
        <button v-for="c in PRESETS" :key="c" class="swatch"
                :style="{ background: c }" @click="selectPreset(c)"
                :title="c"></button>
      </div>
    </section>

    <!-- Color schemes -->
    <section class="section">
      <label class="section-label">{{ t('color.schemes') }}</label>
      <div class="scheme-row">
        <div class="scheme-group">
          <span class="scheme-label">{{ t('color.complementary') }}</span>
          <button class="swatch" :style="{ background: complementary }"
                  @click="copy(complementary)" :title="complementary"></button>
        </div>
        <div class="scheme-group">
          <span class="scheme-label">{{ t('color.analogous') }}</span>
          <button v-for="c in analogous" :key="c" class="swatch"
                  :style="{ background: c }" @click="copy(c)" :title="c"></button>
        </div>
        <div class="scheme-group">
          <span class="scheme-label">{{ t('color.triadic') }}</span>
          <button v-for="c in triadic" :key="c" class="swatch"
                  :style="{ background: c }" @click="copy(c)" :title="c"></button>
        </div>
      </div>
    </section>

    <!-- History -->
    <section v-if="history.length" class="section">
      <div class="section-header">
        <label class="section-label">{{ t('color.history') }}</label>
        <button class="btn-icon small" @click="clearHistory" :title="t('common.clear')">✕</button>
      </div>
      <div class="swatches">
        <button v-for="c in history" :key="c" class="swatch"
                :style="{ background: c }" @click="selectHistory(c)"
                :title="c"></button>
      </div>
    </section>
  </div>
</template>

<!-- STYLE_PLACEHOLDER -->

<style scoped>
.color-tool {
  font-family: var(--font-sans);
}
.tool-title {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.section {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color 0.2s;
}
.section:hover {
  border-color: rgba(108, 99, 255, 0.2);
}
.section-label {
  display: block;
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-bottom: 10px;
  font-weight: 500;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.section-header .section-label { margin-bottom: 0; }
.btn-icon.small { padding: 3px 6px; font-size: 0.72rem; }
.color-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.preview-box {
  width: 100%;
  height: 100px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 12px;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
}
.picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.eyedropper-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: rgba(108, 99, 255, 0.08);
  border: 1px solid rgba(108, 99, 255, 0.3);
  border-radius: var(--radius);
  color: var(--primary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.eyedropper-btn:hover {
  background: rgba(108, 99, 255, 0.15);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.2);
}
.eyedropper-btn svg {
  flex-shrink: 0;
}
.color-picker {
  width: 50px;
  height: 36px;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  background: none;
  padding: 0;
}
.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}
.color-picker::-webkit-color-swatch {
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.alpha-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.alpha-slider {
  flex: 1;
  accent-color: var(--primary);
}
.small-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  white-space: nowrap;
}
.input-group {
  margin-bottom: 12px;
}
.input-with-copy {
  display: flex;
  gap: 6px;
  align-items: center;
}
.rgb-inputs {
  display: flex;
  gap: 6px;
  align-items: center;
}
.input {
  padding: 7px 10px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.1);
}
.num-input {
  width: 60px;
}
.btn-icon {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  cursor: pointer;
  padding: 6px 8px;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.btn-icon:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 8px rgba(108, 99, 255, 0.15);
}
.btn {
  padding: 7px 14px;
  border-radius: var(--radius);
  font-size: 0.8rem;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s;
}
.btn.outline {
  background: transparent;
  color: var(--text);
}
.btn.outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.15);
}
.btn:active { transform: scale(0.97); }
.copy-all-btn {
  width: 100%;
  margin-top: 4px;
  background: rgba(108, 99, 255, 0.06);
  border-color: rgba(108, 99, 255, 0.25);
}
.copy-all-btn:hover {
  background: rgba(108, 99, 255, 0.12);
}
.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.swatch {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.swatch:hover {
  transform: scale(1.15);
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(108, 99, 255, 0.25);
}
.scheme-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.scheme-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.scheme-label {
  font-size: 0.75rem;
  color: var(--text-dim);
}

@media (max-width: 600px) {
  .color-layout {
    grid-template-columns: 1fr;
  }
  .scheme-row {
    flex-direction: column;
    gap: 12px;
  }
}
</style>


