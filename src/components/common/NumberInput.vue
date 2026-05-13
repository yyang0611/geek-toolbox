<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  placeholder?: string
}>(), {
  step: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed({
  get: () => props.modelValue,
  set: (val: number) => {
    let v = Number(val)
    if (isNaN(v)) v = props.min ?? 0
    if (props.min !== undefined && v < props.min) v = props.min
    if (props.max !== undefined && v > props.max) v = props.max
    emit('update:modelValue', v)
  }
})

function increment() {
  let v = props.modelValue + props.step
  if (props.max !== undefined && v > props.max) v = props.max
  emit('update:modelValue', v)
}

function decrement() {
  let v = props.modelValue - props.step
  if (props.min !== undefined && v < props.min) v = props.min
  emit('update:modelValue', v)
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  if (raw === '' || raw === '-') return
  displayValue.value = Number(raw)
}

const canDecrement = computed(() => props.min === undefined || props.modelValue > props.min)
const canIncrement = computed(() => props.max === undefined || props.modelValue < props.max)
</script>

<template>
  <div class="number-input-wrapper">
    <button
      class="stepper-btn decrement"
      @click="decrement"
      :disabled="!canDecrement"
      tabindex="-1"
    >−</button>
    <input
      type="text"
      inputmode="numeric"
      class="number-field"
      :value="displayValue"
      @input="onInput"
      @blur="displayValue = Number(($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
    />
    <button
      class="stepper-btn increment"
      @click="increment"
      :disabled="!canIncrement"
      tabindex="-1"
    >+</button>
  </div>
</template>

<style scoped>
.number-input-wrapper {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface2);
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.number-input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.12), 0 0 12px rgba(108, 99, 255, 0.08);
}

.stepper-btn {
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.stepper-btn:hover:not(:disabled) {
  color: var(--primary);
  background: rgba(108, 99, 255, 0.1);
}

.stepper-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-btn.decrement {
  border-right: 1px solid var(--border);
}

.stepper-btn.increment {
  border-left: 1px solid var(--border);
}

.number-field {
  flex: 1;
  min-width: 50px;
  max-width: 100px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-align: center;
  outline: none;
}

.number-field::placeholder {
  color: var(--text-dim);
}
</style>
