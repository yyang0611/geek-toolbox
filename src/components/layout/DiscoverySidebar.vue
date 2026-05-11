<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscovery } from '@/composables/useDiscovery'
import { useToolNav } from '@/composables/useToolNav'

const { t } = useI18n()
const { recommendedTools, favoriteTools, recentTools, isFavorite, toggleFavorite, clearRecent, isCollapsed, toggleCollapse } = useDiscovery()
const { openTool } = useToolNav()

const SHOW_LIMIT = 3
const expandedSections = ref<Record<string, boolean>>({})

function isExpanded(section: string): boolean {
  return expandedSections.value[section] ?? false
}

function toggleExpand(section: string) {
  expandedSections.value[section] = !expandedSections.value[section]
}
</script>

<template>
  <aside class="discovery-sidebar" :aria-label="t('home.discoveryShellAriaLabel')">
    <!-- Recommended -->
    <section v-if="recommendedTools.length" class="sidebar-section" :aria-label="t('home.recommendedSectionAriaLabel')">
      <button class="section-header" @click="toggleCollapse('recommended')">
        <span class="section-title">{{ t('home.recommendedTitle') }}</span>
        <span class="section-count">{{ recommendedTools.length }}</span>
        <span class="collapse-icon">{{ isCollapsed('recommended') ? '&#9656;' : '&#9662;' }}</span>
      </button>
      <div v-show="!isCollapsed('recommended')" class="section-body">
        <div v-for="tool in (isExpanded('recommended') ? recommendedTools : recommendedTools.slice(0, SHOW_LIMIT))"
             :key="tool.id" class="sidebar-card">
          <span class="card-icon">{{ tool.icon }}</span>
          <span class="card-title">{{ t(tool.titleKey) }}</span>
          <div class="card-actions">
            <button class="action-btn" @click="openTool(tool.id)">{{ t('home.useNow') }}</button>
            <button class="action-btn fav-btn" @click.stop="toggleFavorite(tool.id)">
              {{ isFavorite(tool.id) ? t('home.unfavorite') : t('home.favorite') }}
            </button>
          </div>
        </div>
        <button v-if="recommendedTools.length > SHOW_LIMIT" class="expand-btn" @click="toggleExpand('recommended')">
          {{ isExpanded('recommended') ? t('home.showLess') : t('home.showMoreCount', { count: recommendedTools.length - SHOW_LIMIT }) }}
        </button>
      </div>
    </section>

    <!-- Favorites -->
    <section class="sidebar-section" :aria-label="t('home.favoriteSectionAriaLabel')">
      <button class="section-header" @click="toggleCollapse('favorites')">
        <span class="section-title">{{ t('home.favoriteTitle') }}</span>
        <span class="section-count">{{ favoriteTools.length }}</span>
        <span class="collapse-icon">{{ isCollapsed('favorites') ? '&#9656;' : '&#9662;' }}</span>
      </button>
      <div v-show="!isCollapsed('favorites')" class="section-body">
        <p v-if="!favoriteTools.length" class="empty-hint">{{ t('home.favoriteEmpty') }}</p>
        <div v-for="tool in (isExpanded('favorites') ? favoriteTools : favoriteTools.slice(0, SHOW_LIMIT))"
             :key="tool.id" class="sidebar-card">
          <span class="card-icon">{{ tool.icon }}</span>
          <span class="card-title">{{ t(tool.titleKey) }}</span>
          <div class="card-actions">
            <button class="action-btn" @click="openTool(tool.id)">{{ t('home.useNow') }}</button>
            <button class="action-btn fav-btn" @click.stop="toggleFavorite(tool.id)">{{ t('home.unfavorite') }}</button>
          </div>
        </div>
        <button v-if="favoriteTools.length > SHOW_LIMIT" class="expand-btn" @click="toggleExpand('favorites')">
          {{ isExpanded('favorites') ? t('home.showLess') : t('home.showMoreCount', { count: favoriteTools.length - SHOW_LIMIT }) }}
        </button>
      </div>
    </section>

    <!-- Recent -->
    <section class="sidebar-section" :aria-label="t('home.recentSectionAriaLabel')">
      <button class="section-header" @click="toggleCollapse('recent')">
        <span class="section-title">{{ t('home.recentTitle') }}</span>
        <span class="section-count">{{ recentTools.length }}</span>
        <span class="collapse-icon">{{ isCollapsed('recent') ? '&#9656;' : '&#9662;' }}</span>
      </button>
      <div v-show="!isCollapsed('recent')" class="section-body">
        <p v-if="!recentTools.length" class="empty-hint">{{ t('home.recentEmpty') }}</p>
        <div v-for="tool in (isExpanded('recent') ? recentTools : recentTools.slice(0, SHOW_LIMIT))"
             :key="tool.id" class="sidebar-card">
          <span class="card-icon">{{ tool.icon }}</span>
          <span class="card-title">{{ t(tool.titleKey) }}</span>
          <button class="action-btn" @click="openTool(tool.id)">{{ t('home.useNow') }}</button>
        </div>
        <button v-if="recentTools.length > SHOW_LIMIT" class="expand-btn" @click="toggleExpand('recent')">
          {{ isExpanded('recent') ? t('home.showLess') : t('home.showMoreCount', { count: recentTools.length - SHOW_LIMIT }) }}
        </button>
        <button v-if="recentTools.length" class="clear-btn" @click="clearRecent">{{ t('home.clearRecent') }}</button>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.discovery-sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sidebar-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
}
.section-header:hover { background: var(--surface2); }
.section-count {
  background: var(--surface2);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 0.7rem;
  color: var(--text-dim);
}
.collapse-icon { margin-left: auto; font-size: 0.7rem; color: var(--text-dim); }
.section-body { padding: 0 10px 10px; }
.sidebar-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.sidebar-card:hover { background: var(--surface2); }
.card-icon { font-size: 1rem; }
.card-title { flex: 1; font-size: 0.78rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-actions { display: flex; gap: 4px; }
.action-btn {
  padding: 3px 8px;
  font-size: 0.68rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover { border-color: var(--primary); color: var(--primary); }
.fav-btn:hover { border-color: var(--accent); color: var(--accent); }
.expand-btn {
  display: block;
  width: 100%;
  padding: 5px;
  margin-top: 4px;
  background: none;
  border: none;
  font-size: 0.72rem;
  color: var(--primary);
  cursor: pointer;
  text-align: center;
}
.expand-btn:hover { text-decoration: underline; }
.clear-btn {
  display: block;
  margin-top: 6px;
  padding: 3px 8px;
  font-size: 0.68rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
}
.clear-btn:hover { border-color: var(--red); color: var(--red); }
.empty-hint { font-size: 0.72rem; color: var(--text-dim); padding: 8px 4px; }

@media (max-width: 900px) {
  .discovery-sidebar { width: 100%; }
}
</style>
