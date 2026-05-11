<script setup lang="ts">
import { computed } from 'vue'
import { useToolNav } from '@/composables/useToolNav'
import { getToolsByCategory } from '@/registry'
import ToolCard from './ToolCard.vue'

const { currentCategory, openTool } = useToolNav()
const tools = computed(() => getToolsByCategory(currentCategory.value))
</script>

<template>
  <div class="tool-grid">
    <ToolCard v-for="tool in tools" :key="tool.id"
              :tool="tool" @open="openTool" />
  </div>
</template>

<style scoped>
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

@media (max-width: 600px) {
  .tool-grid { grid-template-columns: 1fr; }
}
</style>
