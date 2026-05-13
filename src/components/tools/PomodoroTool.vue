<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import NumberInput from '@/components/common/NumberInput.vue'

const { t } = useI18n()

type Phase = 'idle' | 'work' | 'shortBreak' | 'longBreak'

interface PomodoroSettings {
  workDuration: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
  soundEnabled: boolean
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  soundEnabled: true
}

function loadSettings(): PomodoroSettings {
  try {
    const raw = localStorage.getItem('pomodoro-settings')
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { ...defaultSettings }
}

function saveSettings(s: PomodoroSettings) {
  localStorage.setItem('pomodoro-settings', JSON.stringify(s))
}

const settings = ref<PomodoroSettings>(loadSettings())
const phase = ref<Phase>('idle')
const remainingSeconds = ref(0)
const isRunning = ref(false)
const completedCount = ref(0)
const workSessionsInCycle = ref(0)
const settingsOpen = ref(false)
const originalTitle = document.title

let intervalId: ReturnType<typeof setInterval> | null = null

const circumference = 2 * Math.PI * 90

const totalSeconds = computed(() => {
  switch (phase.value) {
    case 'work': return settings.value.workDuration * 60
    case 'shortBreak': return settings.value.shortBreak * 60
    case 'longBreak': return settings.value.longBreak * 60
    default: return settings.value.workDuration * 60
  }
})

const progress = computed(() => {
  if (phase.value === 'idle') return 0
  const total = totalSeconds.value
  if (total === 0) return 0
  return 1 - remainingSeconds.value / total
})

const dashOffset = computed(() => circumference * (1 - progress.value))

const phaseColor = computed(() => {
  return phase.value === 'work' ? 'var(--primary)' : 'var(--accent)'
})

const displayTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'work': return t('pomodoro.work')
    case 'shortBreak': return t('pomodoro.shortBreak')
    case 'longBreak': return t('pomodoro.longBreak')
    default: return t('pomodoro.idle')
  }
})

function playBeep() {
  if (!settings.value.soundEnabled) return
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.value = 0.3
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch { /* audio not available */ }
}

function updateTitle() {
  if (phase.value !== 'idle' && isRunning.value) {
    const emoji = phase.value === 'work' ? '\u{1F345}' : '\u{2615}'
    const label = phase.value === 'work' ? t('pomodoro.work') : t('pomodoro.shortBreak')
    document.title = `${emoji} ${displayTime.value} - ${label}`
  } else {
    document.title = originalTitle
  }
}

function clearTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function tick() {
  if (remainingSeconds.value > 0) {
    remainingSeconds.value--
    updateTitle()
  } else {
    clearTimer()
    isRunning.value = false
    playBeep()
    advancePhase()
  }
}

function startTimer() {
  clearTimer()
  isRunning.value = true
  intervalId = setInterval(tick, 1000)
  updateTitle()
}

function advancePhase() {
  if (phase.value === 'work') {
    completedCount.value++
    workSessionsInCycle.value++
    if (workSessionsInCycle.value >= settings.value.longBreakInterval) {
      phase.value = 'longBreak'
      workSessionsInCycle.value = 0
      remainingSeconds.value = settings.value.longBreak * 60
    } else {
      phase.value = 'shortBreak'
      remainingSeconds.value = settings.value.shortBreak * 60
    }
  } else {
    phase.value = 'work'
    remainingSeconds.value = settings.value.workDuration * 60
  }
  startTimer()
}

function handleStart() {
  if (phase.value === 'idle') {
    phase.value = 'work'
    remainingSeconds.value = settings.value.workDuration * 60
    workSessionsInCycle.value = 0
  }
  startTimer()
}

function handlePauseResume() {
  if (isRunning.value) {
    clearTimer()
    isRunning.value = false
    updateTitle()
  } else {
    startTimer()
  }
}

function handleReset() {
  clearTimer()
  isRunning.value = false
  phase.value = 'idle'
  remainingSeconds.value = 0
  workSessionsInCycle.value = 0
  document.title = originalTitle
}

function handleSkip() {
  clearTimer()
  isRunning.value = false
  advancePhase()
}

function toggleSettings() {
  settingsOpen.value = !settingsOpen.value
}

watch(settings, (val) => {
  saveSettings(val)
}, { deep: true })

onUnmounted(() => {
  clearTimer()
  document.title = originalTitle
})
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('pomodoro.title') }}</h2>

    <div class="timer-section">
      <svg class="timer-ring" width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" stroke-width="8" />
        <circle
          cx="100" cy="100" r="90" fill="none"
          :stroke="phaseColor"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 100 100)"
          class="progress-ring"
        />
      </svg>
      <div class="timer-center">
        <span class="timer-display">{{ displayTime }}</span>
        <span class="phase-label">{{ phaseLabel }}</span>
      </div>
    </div>

    <div class="controls-row">
      <button
        v-if="phase === 'idle'"
        class="btn btn-primary"
        @click="handleStart"
      >{{ t('pomodoro.start') }}</button>
      <button
        v-else
        class="btn btn-primary"
        @click="handlePauseResume"
      >{{ isRunning ? t('pomodoro.pause') : t('pomodoro.resume') }}</button>
      <button
        class="btn"
        :disabled="phase === 'idle'"
        @click="handleReset"
      >{{ t('pomodoro.reset') }}</button>
      <button
        class="btn"
        :disabled="phase === 'idle'"
        @click="handleSkip"
      >{{ t('pomodoro.skip') }}</button>
    </div>

    <div class="completed-count">
      {{ t('pomodoro.completed') }}: <strong>{{ completedCount }}</strong>
    </div>

    <div class="settings-section">
      <button class="settings-toggle" @click="toggleSettings">
        {{ t('pomodoro.settings') }}
        <span class="arrow" :class="{ open: settingsOpen }">&#9662;</span>
      </button>
      <div v-show="settingsOpen" class="settings-panel">
        <label class="setting-item">
          <span>{{ t('pomodoro.workDuration') }}</span>
          <NumberInput v-model="settings.workDuration" :min="1" :max="120" />
          <span class="unit">min</span>
        </label>
        <label class="setting-item">
          <span>{{ t('pomodoro.shortBreakDuration') }}</span>
          <NumberInput v-model="settings.shortBreak" :min="1" :max="60" />
          <span class="unit">min</span>
        </label>
        <label class="setting-item">
          <span>{{ t('pomodoro.longBreakDuration') }}</span>
          <NumberInput v-model="settings.longBreak" :min="1" :max="60" />
          <span class="unit">min</span>
        </label>
        <label class="setting-item">
          <span>{{ t('pomodoro.longBreakInterval') }}</span>
          <NumberInput v-model="settings.longBreakInterval" :min="2" :max="10" />
          <span class="unit">{{ t('pomodoro.rounds') }}</span>
        </label>
        <label class="setting-item toggle">
          <input type="checkbox" v-model="settings.soundEnabled" />
          <span>{{ t('pomodoro.sound') }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
}

.tool-title {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.timer-section {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-ring {
  position: absolute;
  top: 0;
  left: 0;
}

.progress-ring {
  transition: stroke-dashoffset 0.5s ease;
}

.timer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  z-index: 1;
}

.timer-display {
  font-family: var(--font-mono);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.05em;
}

.phase-label {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.controls-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  background: var(--surface2);
  border-color: var(--primary);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--bg);
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 0 12px var(--primary-glow);
  background: var(--primary);
  border-color: var(--primary);
}

.completed-count {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--text-dim);
}

.completed-count strong {
  color: var(--primary);
  font-family: var(--font-mono);
}

.settings-section {
  width: 100%;
  max-width: 360px;
}

.settings-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-dim);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-toggle:hover {
  border-color: var(--primary);
  color: var(--text);
}

.arrow {
  transition: transform 0.2s ease;
  font-size: 0.75rem;
}

.arrow.open {
  transform: rotate(180deg);
}

.settings-panel {
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--text);
}

.setting-item span:first-child {
  flex: 1;
}

.setting-item.toggle {
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.num-input {
  width: 60px;
  padding: 0.3rem 0.5rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-align: center;
}

.num-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 6px var(--primary-glow);
}

.unit {
  color: var(--text-dim);
  font-size: 0.8rem;
  min-width: 2rem;
}

input[type="checkbox"] {
  accent-color: var(--primary);
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}
</style>
