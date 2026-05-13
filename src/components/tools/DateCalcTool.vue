<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DatePicker from '@/components/common/DatePicker.vue'
import NumberInput from '@/components/common/NumberInput.vue'

const { t } = useI18n()

type Mode = 'interval' | 'add'
type AddOp = 'add' | 'subtract'

const mode = ref<Mode>('interval')

// Interval mode
const startDate = ref('')
const endDate = ref('')

// Add/Subtract mode
const baseDate = ref('')
const daysInput = ref<number>(0)
const addOp = ref<AddOp>('add')

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getWeekdayKey(date: Date): string {
  return `datecalc.weekdays.${date.getDay()}`
}

// Interval calculation
const intervalResult = computed(() => {
  if (!startDate.value || !endDate.value) return null
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null

  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const absDays = Math.abs(diffDays)
  const weeks = Math.floor(absDays / 7)
  const remainDays = absDays % 7

  return {
    days: diffDays,
    absDays,
    weeks,
    remainDays,
    startWeekday: getWeekdayKey(start),
    endWeekday: getWeekdayKey(end)
  }
})

// Add/Subtract calculation
const addResult = computed(() => {
  if (!baseDate.value || daysInput.value === null || daysInput.value === undefined) return null
  const base = new Date(baseDate.value)
  if (isNaN(base.getTime())) return null

  const days = addOp.value === 'add' ? daysInput.value : -daysInput.value
  const result = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)

  const y = result.getFullYear()
  const m = String(result.getMonth() + 1).padStart(2, '0')
  const d = String(result.getDate()).padStart(2, '0')

  return {
    dateStr: `${y}-${m}-${d}`,
    weekday: getWeekdayKey(result)
  }
})
</script>

<template>
  <div class="datecalc-tool">
    <h2 class="tool-title">{{ t('datecalc.title') }}</h2>

    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button
        class="btn"
        :class="mode === 'interval' ? 'primary' : 'outline'"
        @click="mode = 'interval'"
      >
        {{ t('datecalc.modeInterval') }}
      </button>
      <button
        class="btn"
        :class="mode === 'add' ? 'primary' : 'outline'"
        @click="mode = 'add'"
      >
        {{ t('datecalc.modeAdd') }}
      </button>
    </div>

    <!-- Interval Mode -->
    <section v-if="mode === 'interval'" class="section">
      <div class="date-row">
        <div class="date-field">
          <label class="field-label">{{ t('datecalc.startDate') }}</label>
          <DatePicker v-model="startDate" />
        </div>
        <div class="date-field">
          <label class="field-label">{{ t('datecalc.endDate') }}</label>
          <DatePicker v-model="endDate" />
        </div>
      </div>

      <!-- Interval Result -->
      <div v-if="intervalResult" class="result-card">
        <div class="result-main">
          <span class="result-number">{{ intervalResult.absDays }}</span>
          <span class="result-unit">{{ t('datecalc.days') }}</span>
        </div>
        <div class="result-detail">
          <span v-if="intervalResult.weeks > 0">
            {{ intervalResult.weeks }} {{ t('datecalc.weeks') }}
            <span v-if="intervalResult.remainDays > 0">
              + {{ intervalResult.remainDays }} {{ t('datecalc.days') }}
            </span>
          </span>
        </div>
        <div class="result-meta">
          <span>{{ t('datecalc.startDate') }}: {{ t(intervalResult.startWeekday) }}</span>
          <span>{{ t('datecalc.endDate') }}: {{ t(intervalResult.endWeekday) }}</span>
        </div>
        <div v-if="intervalResult.days < 0" class="result-note">
          {{ t('datecalc.endBeforeStart') }}
        </div>
      </div>
      <div v-else class="result-card placeholder">
        <span class="result-placeholder">{{ t('datecalc.selectDates') }}</span>
      </div>
    </section>

    <!-- Add/Subtract Mode -->
    <section v-if="mode === 'add'" class="section">
      <div class="add-row">
        <div class="date-field">
          <label class="field-label">{{ t('datecalc.baseDate') }}</label>
          <DatePicker v-model="baseDate" />
        </div>
      </div>

      <div class="add-controls">
        <div class="days-field">
          <label class="field-label">{{ t('datecalc.daysCount') }}</label>
          <NumberInput v-model="daysInput" :min="0" :max="99999" />
        </div>
        <div class="op-toggle">
          <button
            class="btn"
            :class="addOp === 'add' ? 'primary' : 'outline'"
            @click="addOp = 'add'"
          >
            + {{ t('datecalc.add') }}
          </button>
          <button
            class="btn"
            :class="addOp === 'subtract' ? 'primary' : 'outline'"
            @click="addOp = 'subtract'"
          >
            - {{ t('datecalc.subtract') }}
          </button>
        </div>
      </div>

      <!-- Add Result -->
      <div v-if="addResult" class="result-card">
        <div class="result-main">
          <span class="result-date">{{ addResult.dateStr }}</span>
        </div>
        <div class="result-detail">
          <span class="weekday-badge">{{ t(addResult.weekday) }}</span>
        </div>
      </div>
      <div v-else class="result-card placeholder">
        <span class="result-placeholder">{{ t('datecalc.selectDates') }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.datecalc-tool {
  font-family: var(--font-sans);
}

.tool-title {
  font-size: 1.3rem;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.section {
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.field-label {
  display: block;
  font-size: 0.82rem;
  color: var(--text-dim);
  margin-bottom: 6px;
  font-weight: 500;
}

.date-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.date-field {
  flex: 1;
  min-width: 200px;
}

.input {
  padding: 8px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--primary);
}

.number-input {
  max-width: 120px;
}

.add-row {
  margin-bottom: 16px;
}

.add-controls {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0;
}

.days-field {
  flex: 0 0 auto;
}

.op-toggle {
  display: flex;
  gap: 8px;
}

/* Result Card */
.result-card {
  margin-top: 16px;
  padding: 20px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-align: center;
}

.result-card.placeholder {
  padding: 16px;
}

.result-placeholder {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.result-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.result-number {
  font-family: var(--font-mono);
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--primary);
  text-shadow: 0 0 12px var(--primary-glow);
}

.result-unit {
  font-size: 1rem;
  color: var(--text-dim);
}

.result-date {
  font-family: var(--font-mono);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
  text-shadow: 0 0 12px var(--primary-glow);
}

.result-detail {
  font-size: 0.88rem;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.weekday-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--surface);
  border: 1px solid var(--primary);
  border-radius: 20px;
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 500;
}

.result-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 0.78rem;
  color: var(--text-dim);
}

.result-note {
  margin-top: 8px;
  font-size: 0.78rem;
  color: var(--accent);
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 0.82rem;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s;
  white-space: nowrap;
}

.btn.outline {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}

.btn.outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn.primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn.primary:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 12px var(--primary-glow);
}

.btn.small {
  padding: 5px 10px;
  font-size: 0.78rem;
}

@media (max-width: 600px) {
  .date-row {
    flex-direction: column;
  }

  .add-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .op-toggle {
    justify-content: center;
  }

  .result-meta {
    flex-direction: column;
    gap: 4px;
  }

  .result-number {
    font-size: 1.8rem;
  }

  .result-date {
    font-size: 1.4rem;
  }
}
</style>
