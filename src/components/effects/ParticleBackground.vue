<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let animId = 0
let particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number }[] = []

const COLORS = ['rgba(108,99,255,', 'rgba(0,212,170,', 'rgba(255,71,87,']
const COUNT = 35

function init() {
  const el = canvas.value
  if (!el) return
  const w = window.innerWidth
  const h = window.innerHeight
  el.width = w
  el.height = h
  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 2 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.5 + 0.2
  }))
}

function draw() {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')!
  const w = el.width
  const h = el.height
  ctx.clearRect(0, 0, w, h)

  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0) p.x = w
    if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h
    if (p.y > h) p.y = 0

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = p.color + p.alpha + ')'
    ctx.shadowBlur = p.size * 4
    ctx.shadowColor = p.color + '0.6)'
    ctx.fill()
    ctx.shadowBlur = 0
  }

  animId = requestAnimationFrame(draw)
}

function onResize() {
  if (!canvas.value) return
  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight
}

function onVisibility() {
  if (document.hidden) {
    cancelAnimationFrame(animId)
  } else {
    animId = requestAnimationFrame(draw)
  }
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  init()
  animId = requestAnimationFrame(draw)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <canvas ref="canvas" class="particle-bg" aria-hidden="true" />
</template>

<style scoped>
.particle-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.7;
}
</style>
