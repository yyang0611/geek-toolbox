<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToolNav } from '@/composables/useToolNav'
import AppHeader from '@/components/layout/AppHeader.vue'
import CategoryTabs from '@/components/layout/CategoryTabs.vue'
import ToolGrid from '@/components/layout/ToolGrid.vue'
import DiscoverySidebar from '@/components/layout/DiscoverySidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ParticleBackground from '@/components/effects/ParticleBackground.vue'

const { t } = useI18n()
const { currentTool, goHome } = useToolNav()

const ActiveToolComponent = computed(() => {
  if (!currentTool.value) return null
  return defineAsyncComponent(currentTool.value.component)
})

watch(currentTool, (tool) => {
  if (tool) {
    document.title = `${t(tool.titleKey)} - ${t('meta.title')}`
  } else {
    document.title = t('meta.title')
  }
})
</script>

<template>
  <div class="app">
    <ParticleBackground />
    <AppHeader />
    <main class="main-content">
      <Transition name="fade" mode="out-in">
        <div v-if="!currentTool" key="home" class="home-view">
          <div class="home-layout">
            <DiscoverySidebar />
            <div class="home-main">
              <CategoryTabs />
              <ToolGrid />
            </div>
          </div>
        </div>
        <div v-else key="tool" class="tool-workspace">
          <button class="btn outline back-btn" @click="goHome">
            ← {{ t('common.back') }}
          </button>
          <component :is="ActiveToolComponent" />
        </div>
      </Transition>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}
.app::before {
  content: '';
  position: fixed;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(108, 99, 255, 0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.back-btn {
  margin-bottom: 16px;
}
.home-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.home-main {
  flex: 1;
  min-width: 0;
}

@media (max-width: 900px) {
  .home-layout { flex-direction: column; }
}

@media (max-width: 768px) {
  .main-content { padding: 16px; }
}
</style>
