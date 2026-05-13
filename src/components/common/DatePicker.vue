<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const pickerRef = ref<HTMLElement | null>(null)

const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const weekdayLabels = computed(() => {
  if (locale.value === 'zh-CN') {
    return ['日', '一', '二', '三', '四', '五', '六']
  }
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
})

const displayValue = computed(() => {
  return props.modelValue || ''
})

interface DayCell {
  date: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  dateStr: string
}

const calendarDays = computed<DayCell[]>(() => {
  const y = viewYear.value
  const m = viewMonth.value
  const firstDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const daysInPrevMonth = new Date(y, m, 0).getDate()

  const cells: DayCell[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const pm = m === 0 ? 11 : m - 1
    const py = m === 0 ? y - 1 : y
    const dateStr = `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ date: d, month: pm, year: py, isCurrentMonth: false, isToday: dateStr === todayStr, isSelected: dateStr === props.modelValue, dateStr })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ date: d, month: m, year: y, isCurrentMonth: true, isToday: dateStr === todayStr, isSelected: dateStr === props.modelValue, dateStr })
  }

  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nm = m === 11 ? 0 : m + 1
    const ny = m === 11 ? y + 1 : y
    const dateStr = `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ date: d, month: nm, year: ny, isCurrentMonth: false, isToday: dateStr === todayStr, isSelected: dateStr === props.modelValue, dateStr })
  }

  return cells
})

const monthLabel = computed(() => {
  const monthNames = locale.value === 'zh-CN'
    ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${viewYear.value} ${monthNames[viewMonth.value]}`
})

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value && props.modelValue) {
    const d = new Date(props.modelValue)
    if (!isNaN(d.getTime())) {
      viewYear.value = d.getFullYear()
      viewMonth.value = d.getMonth()
    }
  }
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function selectDate(cell: DayCell) {
  emit('update:modelValue', cell.dateStr)
  isOpen.value = false
}

function selectToday() {
  emit('update:modelValue', todayStr)
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="date-picker" ref="pickerRef">
    <div class="picker-trigger" @click="toggleOpen">
      <span :class="['trigger-text', !displayValue && 'placeholder']">
        {{ displayValue || placeholder || 'YYYY-MM-DD' }}
      </span>
      <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen" class="picker-dropdown">
        <div class="picker-header">
          <button class="nav-btn" @click="prevMonth">&lt;</button>
          <span class="month-label">{{ monthLabel }}</span>
          <button class="nav-btn" @click="nextMonth">&gt;</button>
        </div>

        <div class="weekday-row">
          <span v-for="wd in weekdayLabels" :key="wd" class="weekday-cell">{{ wd }}</span>
        </div>

        <div class="days-grid">
          <button
            v-for="(cell, idx) in calendarDays"
            :key="idx"
            :class="['day-cell', {
              'other-month': !cell.isCurrentMonth,
              'is-today': cell.isToday,
              'is-selected': cell.isSelected
            }]"
            @click="selectDate(cell)"
          >
            {{ cell.date }}
          </button>
        </div>

        <div class="picker-footer">
          <button class="today-btn" @click="selectToday">{{ t('datecalc.today') }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
  display: inline-block;
  width: 100%;
}

.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.picker-trigger:hover {
  border-color: var(--primary);
}

.trigger-text {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text);
}

.trigger-text.placeholder {
  color: var(--text-dim);
}

.calendar-icon {
  color: var(--text-dim);
  flex-shrink: 0;
}

.picker-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1000;
  width: 280px;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px var(--primary-glow);
  backdrop-filter: blur(12px);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}

.nav-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 8px var(--primary-glow);
}

.month-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.weekday-cell {
  text-align: center;
  font-size: 0.72rem;
  color: var(--text-dim);
  padding: 4px 0;
  font-weight: 500;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  margin: 0 auto;
}

.day-cell:hover {
  background: rgba(108, 99, 255, 0.15);
  color: var(--primary);
}

.day-cell.other-month {
  color: var(--text-dim);
  opacity: 0.4;
}

.day-cell.is-today {
  position: relative;
  color: var(--accent);
  font-weight: 600;
}

.day-cell.is-today::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
}

.day-cell.is-selected {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 0 12px var(--primary-glow);
}

.day-cell.is-selected.is-today::after {
  background: #fff;
}

.picker-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
}

.today-btn {
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;
}

.today-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
