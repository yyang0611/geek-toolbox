<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface UnitDef {
  id: string
  label: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

interface Category {
  id: string
  labelKey: string
  units: UnitDef[]
}

const categories: Category[] = [
  {
    id: 'length',
    labelKey: 'unit.categories.length',
    units: [
      { id: 'mm', label: 'mm', toBase: (v) => v * 0.001, fromBase: (v) => v * 1000 },
      { id: 'cm', label: 'cm', toBase: (v) => v * 0.01, fromBase: (v) => v * 100 },
      { id: 'm', label: 'm', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', label: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'inch', label: 'inch', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'foot', label: 'foot', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'yard', label: 'yard', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'mile', label: 'mile', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    ],
  },
  {
    id: 'weight',
    labelKey: 'unit.categories.weight',
    units: [
      { id: 'mg', label: 'mg', toBase: (v) => v * 0.000001, fromBase: (v) => v * 1000000 },
      { id: 'g', label: 'g', toBase: (v) => v * 0.001, fromBase: (v) => v * 1000 },
      { id: 'kg', label: 'kg', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ton', label: 'ton', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'oz', label: 'oz', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
      { id: 'lb', label: 'lb', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    ],
  },
  {
    id: 'temperature',
    labelKey: 'unit.categories.temperature',
    units: [
      { id: 'celsius', label: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'fahrenheit', label: '°F', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { id: 'kelvin', label: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  {
    id: 'area',
    labelKey: 'unit.categories.area',
    units: [
      { id: 'mm2', label: 'mm²', toBase: (v) => v * 1e-6, fromBase: (v) => v * 1e6 },
      { id: 'cm2', label: 'cm²', toBase: (v) => v * 1e-4, fromBase: (v) => v * 1e4 },
      { id: 'm2', label: 'm²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km2', label: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v * 1e-6 },
      { id: 'hectare', label: 'hectare', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      { id: 'acre', label: 'acre', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
      { id: 'ft2', label: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
    ],
  },
  {
    id: 'volume',
    labelKey: 'unit.categories.volume',
    units: [
      { id: 'mL', label: 'mL', toBase: (v) => v * 0.000001, fromBase: (v) => v * 1000000 },
      { id: 'L', label: 'L', toBase: (v) => v * 0.001, fromBase: (v) => v * 1000 },
      { id: 'm3', label: 'm³', toBase: (v) => v, fromBase: (v) => v },
      { id: 'gallon', label: 'gallon(US)', toBase: (v) => v * 0.00378541, fromBase: (v) => v / 0.00378541 },
      { id: 'cup', label: 'cup', toBase: (v) => v * 0.000236588, fromBase: (v) => v / 0.000236588 },
      { id: 'tbsp', label: 'tbsp', toBase: (v) => v * 0.0000147868, fromBase: (v) => v / 0.0000147868 },
    ],
  },
  {
    id: 'data',
    labelKey: 'unit.categories.data',
    units: [
      { id: 'B', label: 'B', toBase: (v) => v, fromBase: (v) => v },
      { id: 'KB', label: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'MB', label: 'MB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: 'GB', label: 'GB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: 'TB', label: 'TB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
      { id: 'PB', label: 'PB', toBase: (v) => v * 1125899906842624, fromBase: (v) => v / 1125899906842624 },
    ],
  },
  {
    id: 'speed',
    labelKey: 'unit.categories.speed',
    units: [
      { id: 'ms', label: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kmh', label: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', label: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', label: 'knot', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    ],
  },
  {
    id: 'time',
    labelKey: 'unit.categories.time',
    units: [
      { id: 'ms', label: 'ms', toBase: (v) => v * 0.001, fromBase: (v) => v * 1000 },
      { id: 's', label: 's', toBase: (v) => v, fromBase: (v) => v },
      { id: 'min', label: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'hour', label: 'hour', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'day', label: 'day', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: 'week', label: 'week', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: 'year', label: 'year', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
    ],
  },
]

const activeCategory = ref<string>('length')
const inputValue = ref<string>('1')
const fromUnit = ref<string>('m')
const toUnit = ref<string>('km')

const currentCategory = computed(() => categories.find((c) => c.id === activeCategory.value)!)
const currentUnits = computed(() => currentCategory.value.units)

const fromUnitDef = computed(() => currentUnits.value.find((u) => u.id === fromUnit.value))
const toUnitDef = computed(() => currentUnits.value.find((u) => u.id === toUnit.value))

const result = computed(() => {
  const val = parseFloat(inputValue.value)
  if (isNaN(val) || !fromUnitDef.value || !toUnitDef.value) return ''
  const baseValue = fromUnitDef.value.toBase(val)
  const converted = toUnitDef.value.fromBase(baseValue)
  return formatNumber(converted)
})

const quickReference = computed(() => {
  const val = parseFloat(inputValue.value)
  if (isNaN(val) || !fromUnitDef.value) return []
  const baseValue = fromUnitDef.value.toBase(val)
  return currentUnits.value.map((unit) => ({
    label: unit.label,
    value: formatNumber(unit.fromBase(baseValue)),
  }))
})

function formatNumber(n: number): string {
  if (Math.abs(n) === 0) return '0'
  if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-10 && Math.abs(n) > 0)) {
    return n.toExponential(6)
  }
  const str = n.toPrecision(10)
  return parseFloat(str).toString()
}

function switchCategory(catId: string) {
  activeCategory.value = catId
  const units = categories.find((c) => c.id === catId)!.units
  fromUnit.value = units[0].id
  toUnit.value = units.length > 1 ? units[1].id : units[0].id
  inputValue.value = '1'
}

function swapUnits() {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
}
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('unit.title') }}</h2>

    <div class="category-selector">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['btn', 'outline', activeCategory === cat.id && 'primary']"
        @click="switchCategory(cat.id)"
      >
        {{ t(cat.labelKey) }}
      </button>
    </div>

    <div class="converter-area">
      <div class="converter-column">
        <label class="column-label">{{ t('unit.from') }}</label>
        <select v-model="fromUnit" class="unit-select">
          <option v-for="u in currentUnits" :key="u.id" :value="u.id">{{ u.label }}</option>
        </select>
        <input
          v-model="inputValue"
          type="text"
          inputmode="decimal"
          class="unit-input"
          :placeholder="t('unit.inputPlaceholder')"
        />
      </div>

      <div class="swap-column">
        <button class="btn swap-btn" @click="swapUnits" :title="t('unit.swap')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 16l-4-4 4-4" />
            <path d="M17 8l4 4-4 4" />
            <path d="M3 12h18" />
          </svg>
        </button>
      </div>

      <div class="converter-column">
        <label class="column-label">{{ t('unit.to') }}</label>
        <select v-model="toUnit" class="unit-select">
          <option v-for="u in currentUnits" :key="u.id" :value="u.id">{{ u.label }}</option>
        </select>
        <div class="result-display">{{ result || '—' }}</div>
      </div>
    </div>

    <div class="quick-reference" v-if="quickReference.length > 0">
      <h3 class="section-title">{{ t('unit.quickReference') }}</h3>
      <div class="reference-table">
        <div v-for="item in quickReference" :key="item.label" class="reference-row">
          <span class="ref-label">{{ item.label }}</span>
          <span class="ref-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
}

.tool-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-sans);
}

.btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn:active {
  transform: scale(0.97);
}

.btn.outline {
  background: transparent;
  border: 1px solid var(--border);
}

.btn.primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 0 12px var(--primary-glow);
}

.btn.primary:hover {
  filter: brightness(1.1);
}

.converter-area {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: end;
  padding: 24px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
  backdrop-filter: blur(12px);
  margin-bottom: 24px;
}

.converter-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-label {
  font-size: 0.8rem;
  color: var(--text-dim);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.unit-select {
  padding: 10px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-size: 0.85rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border-color 0.2s;
}

.unit-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.12);
}

.unit-input {
  padding: 12px 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
  width: 100%;
}

.unit-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.12);
}

.unit-input::-webkit-inner-spin-button,
.unit-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.unit-input[type='number'] {
  -moz-appearance: textfield;
}

.result-display {
  padding: 12px 14px;
  border-radius: var(--radius);
  border: 1px solid rgba(108, 99, 255, 0.25);
  background: rgba(108, 99, 255, 0.06);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 500;
  min-height: 1.2em;
  word-break: break-all;
}

.swap-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 24px;
}

.swap-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text-dim);
  transition: all 0.2s;
}

.swap-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 8px var(--primary-glow);
}

.quick-reference {
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
  backdrop-filter: blur(12px);
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dim);
  margin-bottom: 14px;
}

.reference-table {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.reference-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: calc(var(--radius) * 0.6);
  background: var(--surface2);
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.reference-row:hover {
  border-color: var(--border);
}

.ref-label {
  font-size: 0.8rem;
  color: var(--text-dim);
  font-weight: 500;
}

.ref-value {
  font-size: 0.82rem;
  color: var(--text);
  font-family: var(--font-mono);
}

@media (max-width: 640px) {
  .converter-area {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .swap-column {
    padding-top: 0;
  }

  .swap-btn {
    transform: rotate(90deg);
  }

  .category-selector {
    gap: 6px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  .reference-table {
    grid-template-columns: 1fr;
  }
}
</style>
