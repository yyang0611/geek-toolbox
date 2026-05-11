<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToolNav } from '@/composables/useToolNav'
import { CATEGORIES } from '@/registry'

const { t } = useI18n()
const { currentCategory, setCategory } = useToolNav()
</script>

<template>
  <nav class="category-tabs" :aria-label="t('home.toolNavAriaLabel')">
    <button v-for="cat in CATEGORIES" :key="cat.id"
            class="category-pill"
            :class="{ active: currentCategory === cat.id }"
            @click="setCategory(cat.id)">
      {{ t(cat.titleKey) }}
    </button>
  </nav>
</template>

<style scoped>
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.category-pill {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}
.category-pill:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.category-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
</style>
