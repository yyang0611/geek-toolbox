<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import NumberInput from '@/components/common/NumberInput.vue'

const { t } = useI18n()

type Mode = 'pick' | 'dice' | 'coin' | 'number'

interface HistoryEntry {
  mode: Mode
  result: string
  timestamp: number
}

const STORAGE_KEY = 'random-tool-history'
const MAX_HISTORY = 20

const activeMode = ref<Mode>('pick')

// Pick mode
const pickOptions = ref('')
const pickCount = ref(1)
const pickError = ref('')

// Dice mode
const diceCount = ref(1)
const diceResults = ref<number[]>([])

// Coin mode
const coinResult = ref<'heads' | 'tails' | ''>('')
const coinFlipping = ref(false)

// Number mode
const numMin = ref(1)
const numMax = ref(100)
const numResult = ref<number | null>(null)

// Shared
const resultText = ref('')
const resultKey = ref(0)
const history = ref<HistoryEntry[]>([])

// Load history from localStorage
onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) history.value = JSON.parse(stored)
  } catch { /* ignore */ }
})

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch { /* ignore */ }
}

function addHistory(mode: Mode, result: string) {
  history.value.unshift({ mode, result, timestamp: Date.now() })
  if (history.value.length > MAX_HISTORY) history.value.pop()
  saveHistory()
}

function clearHistory() {
  history.value = []
  saveHistory()
}

// Random Pick
function doPick() {
  pickError.value = ''
  const lines = pickOptions.value
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
  if (lines.length < 2) {
    pickError.value = t('random.pickErrorMin')
    return
  }
  const count = Math.min(pickCount.value, lines.length)
  const shuffled = [...lines].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, count)
  const result = picked.join(', ')
  resultText.value = result
  resultKey.value++
  addHistory('pick', result)
}

// Dice Roll
const diceRolling = ref(false)

function rollDice() {
  diceRolling.value = true
  diceResults.value = []
  let ticks = 0
  const maxTicks = 12
  const interval = setInterval(() => {
    const temp: number[] = []
    for (let i = 0; i < diceCount.value; i++) {
      temp.push(Math.floor(Math.random() * 6) + 1)
    }
    diceResults.value = temp
    ticks++
    if (ticks >= maxTicks) {
      clearInterval(interval)
      diceRolling.value = false
      const total = temp.reduce((a, b) => a + b, 0)
      const result = temp.length > 1
        ? `${temp.join(' + ')} = ${total}`
        : `${total}`
      resultText.value = result
      resultKey.value++
      addHistory('dice', result)
    }
  }, 100)
}

// Coin Flip — physics-based with JS animation
const coinEl = ref<HTMLElement | null>(null)
const coinExtraRotation = ref(0)

function flipCoin() {
  coinFlipping.value = true
  coinResult.value = ''

  const isHeads = Math.random() < 0.5
  const totalHalfTurns = (isHeads ? 0 : 1) + (Math.floor(Math.random() * 4) + 6) * 2
  const totalDeg = totalHalfTurns * 180
  coinExtraRotation.value = totalDeg

  // Physics params
  const gravity = 1800 // px/s²
  const launchVelocity = -700 // px/s (upward)
  const spinSpeed = totalDeg / 1.4 // deg/s — finish spinning before landing
  const duration = (-launchVelocity * 2) / gravity // time to go up and come back (s)
  const totalMs = duration * 1000

  const startTime = performance.now()

  function animate(now: number) {
    const elapsed = (now - startTime) / 1000
    const progress = Math.min(elapsed / duration, 1)

    // Vertical position: parabola y = v0*t + 0.5*g*t²
    const elapsedClamped = Math.min(elapsed, duration)
    const y = launchVelocity * elapsedClamped + 0.5 * gravity * elapsedClamped * elapsedClamped

    // Rotation: fast at start, decelerates
    const easedProgress = progress < 0.7 ? progress / 0.7 : 1
    const rotation = easedProgress * totalDeg

    // Slight wobble on Z axis
    const wobble = Math.sin(elapsed * 12) * (1 - progress) * 5

    if (coinEl.value) {
      coinEl.value.style.transform = `translateY(${y}px) rotateX(${rotation}deg) rotateZ(${wobble}deg)`
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      if (coinEl.value) {
        coinEl.value.style.transform = `translateY(0px) rotateX(${totalDeg}deg) rotateZ(0deg)`
      }
      coinResult.value = isHeads ? 'heads' : 'tails'
      const result = isHeads ? t('random.heads') : t('random.tails')
      resultText.value = result
      resultKey.value++
      coinFlipping.value = false
      addHistory('coin', result)
    }
  }

  requestAnimationFrame(animate)
}

// Random Number
function generateNumber() {
  const min = Math.min(numMin.value, numMax.value)
  const max = Math.max(numMin.value, numMax.value)
  const result = Math.floor(Math.random() * (max - min + 1)) + min
  numResult.value = result
  resultText.value = String(result)
  resultKey.value++
  addHistory('number', String(result))
}

const formattedHistory = computed(() => {
  return history.value.map(entry => {
    const date = new Date(entry.timestamp)
    const time = date.toLocaleTimeString()
    const modeLabel = t(`random.mode${entry.mode.charAt(0).toUpperCase() + entry.mode.slice(1)}`)
    return { ...entry, time, modeLabel }
  })
})

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
</script>

<template>
  <div class="tool-container">
    <h2 class="tool-title">{{ t('random.title') }}</h2>

    <!-- Mode Selector -->
    <div class="mode-selector">
      <button
        class="btn"
        :class="activeMode === 'pick' ? 'btn-primary' : 'btn-outline'"
        @click="activeMode = 'pick'"
      >{{ t('random.modePick') }}</button>
      <button
        class="btn"
        :class="activeMode === 'dice' ? 'btn-primary' : 'btn-outline'"
        @click="activeMode = 'dice'"
      >{{ t('random.modeDice') }}</button>
      <button
        class="btn"
        :class="activeMode === 'coin' ? 'btn-primary' : 'btn-outline'"
        @click="activeMode = 'coin'"
      >{{ t('random.modeCoin') }}</button>
      <button
        class="btn"
        :class="activeMode === 'number' ? 'btn-primary' : 'btn-outline'"
        @click="activeMode = 'number'"
      >{{ t('random.modeNumber') }}</button>
    </div>

    <!-- Pick Mode -->
    <div v-if="activeMode === 'pick'" class="mode-panel">
      <label class="field-label">{{ t('random.pickLabel') }}</label>
      <textarea
        v-model="pickOptions"
        class="textarea"
        rows="5"
        :placeholder="t('random.pickPlaceholder')"
      ></textarea>
      <div class="inline-row">
        <label class="field-label">{{ t('random.pickCount') }}</label>
        <NumberInput v-model="pickCount" :min="1" :max="100" />
        <button class="btn btn-primary" @click="doPick">{{ t('random.pickBtn') }}</button>
      </div>
      <p v-if="pickError" class="error-text">{{ pickError }}</p>
    </div>

    <!-- Dice Mode -->
    <div v-if="activeMode === 'dice'" class="mode-panel">
      <div class="inline-row">
        <label class="field-label">{{ t('random.diceCount') }}</label>
        <select v-model.number="diceCount" class="select-input">
          <option v-for="n in 6" :key="n" :value="n">{{ n }}</option>
        </select>
        <button class="btn btn-primary" @click="rollDice" :disabled="diceRolling">{{ t('random.rollBtn') }}</button>
      </div>
      <div v-if="diceResults.length" class="dice-display">
        <div v-for="(d, i) in diceResults" :key="i" class="dice-scene">
          <div class="dice-3d" :class="{ rolling: diceRolling, ['show-' + d]: !diceRolling }">
            <div class="dice-side side-1"><span class="dot-grid g1"><i/></span></div>
            <div class="dice-side side-2"><span class="dot-grid g2"><i/><i/></span></div>
            <div class="dice-side side-3"><span class="dot-grid g3"><i/><i/><i/></span></div>
            <div class="dice-side side-4"><span class="dot-grid g4"><i/><i/><i/><i/></span></div>
            <div class="dice-side side-5"><span class="dot-grid g5"><i/><i/><i/><i/><i/></span></div>
            <div class="dice-side side-6"><span class="dot-grid g6"><i/><i/><i/><i/><i/><i/></span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Coin Mode -->
    <div v-if="activeMode === 'coin'" class="mode-panel">
      <div class="coin-section">
        <div class="coin-stage">
          <div
            ref="coinEl"
            class="coin-3d"
          >
            <div class="coin-face coin-front">
              <span class="coin-icon">&#x1F451;</span>
            </div>
            <div class="coin-face coin-back">
              <span class="coin-icon">&#x1F33F;</span>
            </div>
          </div>
        </div>
        <div class="coin-label" v-if="coinResult && !coinFlipping">
          {{ coinResult === 'heads' ? t('random.heads') : t('random.tails') }}
        </div>
        <button class="btn btn-primary coin-btn" @click="flipCoin" :disabled="coinFlipping">
          {{ t('random.flipBtn') }}
        </button>
      </div>
    </div>

    <!-- Number Mode -->
    <div v-if="activeMode === 'number'" class="mode-panel">
      <div class="inline-row">
        <label class="field-label">{{ t('random.numMin') }}</label>
        <NumberInput v-model="numMin" :min="-999999" :max="999999" />
        <label class="field-label">{{ t('random.numMax') }}</label>
        <NumberInput v-model="numMax" :min="-999999" :max="999999" />
        <button class="btn btn-primary" @click="generateNumber">{{ t('random.generateBtn') }}</button>
      </div>
    </div>

    <!-- Result Display -->
    <div v-if="resultText" class="result-display" :key="resultKey">
      <span class="result-text">{{ resultText }}</span>
    </div>

    <!-- History -->
    <div v-if="history.length" class="history-section">
      <div class="history-header">
        <h3 class="history-title">{{ t('random.history') }}</h3>
        <button class="btn btn-sm" @click="clearHistory">{{ t('random.clearHistory') }}</button>
      </div>
      <ul class="history-list">
        <li v-for="(entry, i) in formattedHistory" :key="i" class="history-item">
          <span class="history-mode">{{ entry.modeLabel }}</span>
          <span class="history-result">{{ entry.result }}</span>
          <span class="history-time">{{ entry.time }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tool-container { max-width: 800px; margin: 0 auto; }
.tool-title {
  font-size: 1.3rem; font-weight: 600; margin-bottom: 20px;
  background: linear-gradient(135deg, var(--text), var(--primary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

/* Mode Selector */
.mode-selector {
  display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
}
.btn {
  padding: 8px 18px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.82rem;
  font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: var(--font-sans);
}
.btn:hover { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 12px var(--primary-glow); }
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; border-color: var(--primary); }
.btn-primary:hover { filter: brightness(1.1); box-shadow: 0 0 16px var(--primary-glow); color: #fff; }
.btn-outline { background: transparent; border-color: var(--border); color: var(--text-dim); }
.btn-outline:hover { border-color: var(--primary); color: var(--primary); }
.btn-sm { padding: 4px 10px; font-size: 0.75rem; }

/* Mode Panel */
.mode-panel {
  padding: 16px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface); margin-bottom: 20px;
}
.field-label { font-size: 0.82rem; color: var(--text-dim); margin-right: 8px; }
.textarea {
  width: 100%; padding: 10px 12px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.85rem;
  font-family: var(--font-mono); resize: vertical; margin-bottom: 12px;
}
.textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 8px var(--primary-glow); }
.textarea::placeholder { color: var(--text-dim); opacity: 0.6; }
.inline-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.num-input {
  width: 80px; padding: 6px 10px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.85rem; text-align: center;
  font-family: var(--font-mono);
}
.num-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 8px var(--primary-glow); }
.select-input {
  padding: 6px 12px; border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--surface2); color: var(--text); font-size: 0.85rem; cursor: pointer;
}
.select-input:focus { outline: none; border-color: var(--primary); }
.error-text { color: #f44; font-size: 0.8rem; margin-top: 8px; }

/* 3D Dice */
.dice-display { display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap; justify-content: center; }
.dice-scene { width: 64px; height: 64px; perspective: 300px; }
.dice-3d {
  width: 64px; height: 64px; position: relative;
  transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.dice-3d.rolling { animation: diceRoll 0.12s infinite linear; }
.dice-3d.show-1 { transform: rotateX(0deg) rotateY(0deg); }
.dice-3d.show-2 { transform: rotateX(0deg) rotateY(-90deg); }
.dice-3d.show-3 { transform: rotateX(-90deg) rotateY(0deg); }
.dice-3d.show-4 { transform: rotateX(90deg) rotateY(0deg); }
.dice-3d.show-5 { transform: rotateX(0deg) rotateY(90deg); }
.dice-3d.show-6 { transform: rotateX(180deg) rotateY(0deg); }

.dice-side {
  position: absolute; width: 64px; height: 64px;
  border-radius: 10px; border: 2px solid rgba(108, 99, 255, 0.3);
  background: linear-gradient(135deg, #1e1e3a, #2a2a4a);
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.3);
}
.side-1 { transform: translateZ(32px); }
.side-6 { transform: rotateX(180deg) translateZ(32px); }
.side-2 { transform: rotateY(90deg) translateZ(32px); }
.side-5 { transform: rotateY(-90deg) translateZ(32px); }
.side-3 { transform: rotateX(90deg) translateZ(32px); }
.side-4 { transform: rotateX(-90deg) translateZ(32px); }

.dot-grid { display: grid; width: 44px; height: 44px; padding: 4px; }
.dot-grid i {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--primary); box-shadow: 0 0 6px var(--primary-glow);
}
.g1 { place-content: center; place-items: center; }
.g2 { grid-template: 1fr 1fr / 1fr; align-items: center; justify-items: center; }
.g2 i:first-child { justify-self: end; align-self: start; }
.g2 i:last-child { justify-self: start; align-self: end; }
.g3 { grid-template: 1fr 1fr 1fr / 1fr; align-items: center; justify-items: center; }
.g3 i:first-child { justify-self: end; align-self: start; }
.g3 i:last-child { justify-self: start; align-self: end; }
.g4 { grid-template: 1fr 1fr / 1fr 1fr; place-items: center; }
.g5 { grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr; place-items: center; }
.g5 i:nth-child(1) { grid-area: 1/1; }
.g5 i:nth-child(2) { grid-area: 1/3; }
.g5 i:nth-child(3) { grid-area: 2/2; }
.g5 i:nth-child(4) { grid-area: 3/1; }
.g5 i:nth-child(5) { grid-area: 3/3; }
.g6 { grid-template: 1fr 1fr 1fr / 1fr 1fr; place-items: center; }

/* 3D Coin */
.coin-section { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.coin-stage { perspective: 800px; width: 120px; height: 200px; display: flex; align-items: flex-end; justify-content: center; }
.coin-3d {
  width: 120px; height: 120px; position: relative;
  transform-style: preserve-3d;
}
.coin-face {
  position: absolute; width: 100%; height: 100%; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  backface-visibility: hidden;
}
.coin-front {
  background: radial-gradient(circle at 38% 32%, #6e66ff, #4038b0);
  border: 4px solid #8880ff;
  box-shadow: 0 4px 20px rgba(108, 99, 255, 0.5), inset 0 -6px 12px rgba(0,0,0,0.4), inset 0 6px 10px rgba(255,255,255,0.15);
}
.coin-back {
  background: radial-gradient(circle at 38% 32%, #12c49a, #0a8a6c);
  border: 4px solid #1aedc0;
  box-shadow: 0 4px 20px rgba(0, 212, 170, 0.5), inset 0 -6px 12px rgba(0,0,0,0.4), inset 0 6px 10px rgba(255,255,255,0.15);
  transform: rotateX(180deg);
}
.coin-icon { font-size: 2.6rem; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)); }
.coin-label {
  font-size: 1.1rem; font-weight: 700; color: var(--primary);
  text-shadow: 0 0 12px var(--primary-glow); letter-spacing: 1px;
  animation: resultPop 0.4s ease-out;
}
.coin-btn { margin-top: 4px; }

/* Result Display */
.result-display {
  text-align: center; padding: 24px 16px; margin-bottom: 20px;
  border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface);
  animation: resultPop 0.4s ease-out;
}
.result-text {
  font-size: 1.8rem; font-weight: 700; font-family: var(--font-mono);
  color: var(--primary); text-shadow: 0 0 20px var(--primary-glow);
}

/* History */
.history-section { margin-top: 10px; }
.history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.history-title { font-size: 0.95rem; font-weight: 600; color: var(--text); margin: 0; }
.history-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.history-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface2);
  font-size: 0.8rem;
}
.history-mode {
  padding: 2px 8px; border-radius: var(--radius); background: var(--surface);
  border: 1px solid var(--border); color: var(--text-dim); font-size: 0.72rem; white-space: nowrap;
}
.history-result { flex: 1; color: var(--text); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.history-time { color: var(--text-dim); font-size: 0.72rem; white-space: nowrap; }

/* Animations */
@keyframes resultPop {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes diceRoll {
  0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  25% { transform: rotateX(90deg) rotateY(45deg) rotateZ(30deg); }
  50% { transform: rotateX(180deg) rotateY(135deg) rotateZ(-20deg); }
  75% { transform: rotateX(270deg) rotateY(225deg) rotateZ(40deg); }
  100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(0deg); }
}
</style>
