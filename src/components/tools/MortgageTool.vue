<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NumberInput from '@/components/common/NumberInput.vue'

const { t } = useI18n()

const loanAmount = ref(100)
const loanYears = ref(30)
const annualRate = ref(3.45)
const method = ref<'equal-installment' | 'equal-principal'>('equal-installment')
const showAllMonths = ref(false)

const yearOptions = [10, 15, 20, 25, 30]

function formatNumber(num: number): string {
  return num.toFixed(2).replace(/\B(?=(\d{3})+\.)/g, ',')
}

const result = computed(() => {
  const P = loanAmount.value * 10000
  const r = annualRate.value / 100 / 12
  const n = loanYears.value * 12

  if (P <= 0 || r <= 0 || n <= 0) {
    return { monthlyFirst: 0, monthlyLast: 0, totalPayment: 0, totalInterest: 0, schedule: [] }
  }

  const schedule: Array<{
    month: number
    payment: number
    principal: number
    interest: number
    remaining: number
  }> = []

  let totalPayment = 0
  let monthlyFirst = 0
  let monthlyLast = 0

  if (method.value === 'equal-installment') {
    const pow = Math.pow(1 + r, n)
    const monthly = P * r * pow / (pow - 1)
    monthlyFirst = monthly
    monthlyLast = monthly
    totalPayment = monthly * n

    let remaining = P
    for (let m = 1; m <= n; m++) {
      const interest = remaining * r
      const principal = monthly - interest
      remaining -= principal
      schedule.push({
        month: m,
        payment: monthly,
        principal,
        interest,
        remaining: Math.max(remaining, 0)
      })
    }
  } else {
    const principalPerMonth = P / n
    let remaining = P

    for (let m = 1; m <= n; m++) {
      const interest = remaining * r
      const payment = principalPerMonth + interest
      remaining -= principalPerMonth
      totalPayment += payment
      schedule.push({
        month: m,
        payment,
        principal: principalPerMonth,
        interest,
        remaining: Math.max(remaining, 0)
      })
    }

    monthlyFirst = schedule[0]?.payment ?? 0
    monthlyLast = schedule[n - 1]?.payment ?? 0
  }

  const totalInterest = totalPayment - P

  return { monthlyFirst, monthlyLast, totalPayment, totalInterest, schedule }
})

const visibleSchedule = computed(() => {
  if (showAllMonths.value) return result.value.schedule
  return result.value.schedule.slice(0, 12)
})
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('mortgage.title') }}</h2>

    <div class="input-section">
      <div class="form-group">
        <label class="form-label">{{ t('mortgage.loanAmount') }}</label>
        <div class="input-with-unit">
          <NumberInput v-model="loanAmount" :min="1" :max="10000" :step="10" />
          <span class="input-unit">{{ t('mortgage.unitWan') }}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('mortgage.loanTerm') }}</label>
        <div class="input-with-unit">
          <NumberInput v-model="loanYears" :min="1" :max="30" />
          <span class="input-unit">{{ t('mortgage.unitYear') }}</span>
        </div>
        <div class="quick-buttons">
          <button
            v-for="y in yearOptions"
            :key="y"
            class="quick-btn"
            :class="{ active: loanYears === y }"
            @click="loanYears = y"
          >
            {{ y }}{{ t('mortgage.unitYear') }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('mortgage.annualRate') }}</label>
        <div class="input-with-unit">
          <NumberInput v-model="annualRate" :min="0.01" :max="20" :step="0.05" />
          <span class="input-unit">%</span>
        </div>
      </div>
    </div>

    <div class="method-toggle">
      <button
        class="toggle-btn"
        :class="{ active: method === 'equal-installment' }"
        @click="method = 'equal-installment'"
      >
        {{ t('mortgage.methodEqual') }}
      </button>
      <button
        class="toggle-btn"
        :class="{ active: method === 'equal-principal' }"
        @click="method = 'equal-principal'"
      >
        {{ t('mortgage.methodPrincipal') }}
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ formatNumber(result.monthlyFirst) }}</span>
        <span class="stat-label">
          {{ method === 'equal-installment' ? t('mortgage.monthlyPayment') : t('mortgage.firstMonth') }}
        </span>
      </div>
      <div v-if="method === 'equal-principal'" class="stat-card">
        <span class="stat-value">{{ formatNumber(result.monthlyLast) }}</span>
        <span class="stat-label">{{ t('mortgage.lastMonth') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ formatNumber(result.totalPayment) }}</span>
        <span class="stat-label">{{ t('mortgage.totalPayment') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ formatNumber(result.totalInterest) }}</span>
        <span class="stat-label">{{ t('mortgage.totalInterest') }}</span>
      </div>
    </div>

    <div class="schedule-section">
      <div class="schedule-header" @click="showAllMonths = !showAllMonths">
        <span class="schedule-title">{{ t('mortgage.scheduleTitle') }}</span>
        <span class="schedule-toggle">
          {{ showAllMonths ? t('mortgage.collapse') : t('mortgage.showAll') }}
        </span>
      </div>
      <div class="table-wrapper">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>{{ t('mortgage.colMonth') }}</th>
              <th>{{ t('mortgage.colPayment') }}</th>
              <th>{{ t('mortgage.colPrincipal') }}</th>
              <th>{{ t('mortgage.colInterest') }}</th>
              <th>{{ t('mortgage.colRemaining') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in visibleSchedule" :key="row.month">
              <td>{{ row.month }}</td>
              <td>{{ formatNumber(row.payment) }}</td>
              <td>{{ formatNumber(row.principal) }}</td>
              <td>{{ formatNumber(row.interest) }}</td>
              <td>{{ formatNumber(row.remaining) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        v-if="!showAllMonths && result.schedule.length > 12"
        class="show-all-btn"
        @click="showAllMonths = true"
      >
        {{ t('mortgage.showAll') }} ({{ result.schedule.length }} {{ t('mortgage.months') }})
      </button>
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  max-width: 700px;
  margin: 0 auto;
}
.tool-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.input-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-family: var(--font-sans);
}
.input-with-unit {
  display: flex;
  align-items: center;
  gap: 6px;
}
.input-unit {
  font-size: 0.75rem;
  color: var(--text-dim);
  white-space: nowrap;
  font-family: var(--font-mono);
}
.quick-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.quick-btn {
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text-dim);
  font-size: 0.7rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.2s;
}
.quick-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.quick-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  box-shadow: 0 0 8px var(--primary-glow);
}
.method-toggle {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}
.toggle-btn {
  flex: 1;
  padding: 8px 14px;
  border: none;
  background: var(--surface2);
  color: var(--text-dim);
  font-size: 0.8rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn:hover {
  color: var(--text);
}
.toggle-btn.active {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 0 12px var(--primary-glow);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface2);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  border-color: rgba(108, 99, 255, 0.3);
  box-shadow: 0 0 16px rgba(108, 99, 255, 0.1);
}
.stat-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--primary);
  font-family: var(--font-mono);
  word-break: break-all;
  text-align: center;
}
.stat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-top: 4px;
  text-align: center;
}
.schedule-section {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  overflow: hidden;
}
.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}
.schedule-header:hover {
  background: var(--surface2);
}
.schedule-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}
.schedule-toggle {
  font-size: 0.75rem;
  color: var(--primary);
}
.table-wrapper {
  overflow-x: auto;
}
.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono);
  font-size: 0.75rem;
}
.schedule-table th,
.schedule-table td {
  padding: 8px 12px;
  text-align: right;
  border-top: 1px solid var(--border);
  white-space: nowrap;
}
.schedule-table th {
  background: var(--surface2);
  color: var(--text-dim);
  font-weight: 500;
  font-size: 0.72rem;
  position: sticky;
  top: 0;
}
.schedule-table td {
  color: var(--text);
}
.schedule-table tr:hover td {
  background: var(--surface2);
}
.show-all-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-top: 1px solid var(--border);
  background: var(--surface2);
  color: var(--primary);
  font-size: 0.78rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: background 0.2s;
}
.show-all-btn:hover {
  background: var(--bg);
}

@media (max-width: 600px) {
  .input-section {
    grid-template-columns: 1fr;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .schedule-table th,
  .schedule-table td {
    padding: 6px 8px;
    font-size: 0.7rem;
  }
}
</style>
