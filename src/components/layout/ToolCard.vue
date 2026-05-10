<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDiscovery } from '@/composables/useDiscovery'
import type { ToolMeta } from '@/types/tools'

defineProps<{ tool: ToolMeta }>()
const emit = defineEmits<{ open: [id: string] }>()
const { t } = useI18n()
const { isFavorite, toggleFavorite } = useDiscovery()
</script>

<template>
  <article class="tool-card" @click="emit('open', tool.id)" tabindex="0"
           @keydown.enter="emit('open', tool.id)">
    <button class="fav-toggle" @click.stop="toggleFavorite(tool.id)"
            :title="isFavorite(tool.id) ? t('home.unfavorite') : t('home.favorite')">
      {{ isFavorite(tool.id) ? '★' : '☆' }}
    </button>
    <span class="tool-card-icon">{{ tool.icon }}</span>
    <h3 class="tool-card-title">{{ t(tool.titleKey) }}</h3>
    <p class="tool-card-desc">{{ t(tool.descKey) }}</p>
  </article>
</template>

<style scoped>
.tool-card {
  position: relative;
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s, box-shadow 0.3s;
  overflow: hidden;
}
.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary));
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s;
}
.tool-card:hover, .tool-card:focus-visible {
  transform: translateY(-4px);
  border-color: rgba(108, 99, 255, 0.4);
  box-shadow: 0 0 20px var(--primary-glow), 0 8px 32px rgba(0, 0, 0, 0.3);
  outline: none;
}
.tool-card:hover::before, .tool-card:focus-visible::before {
  opacity: 1;
  animation: gradient-sweep 3s linear infinite;
}
.tool-card-icon {
  font-size: 1.6rem;
  display: block;
  margin-bottom: 10px;
  transition: transform 0.3s;
}
.tool-card:hover .tool-card-icon {
  transform: scale(1.1);
}
.tool-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}
.tool-card-desc {
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.5;
}
.fav-toggle {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--text-dim);
  transition: color 0.15s, text-shadow 0.15s;
  line-height: 1;
}
.fav-toggle:hover { color: var(--accent); text-shadow: 0 0 8px var(--accent-glow); }
</style>
