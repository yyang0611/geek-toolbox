import { ref, computed } from 'vue'
import { TOOLS } from '@/registry'
import type { ToolMeta } from '@/types/tools'

const STORAGE_KEY_FAVORITES = 'geek-toolbox-favorite-tools'
const STORAGE_KEY_RECENT = 'geek-toolbox-recent-tools'
const STORAGE_KEY_COLLAPSE = 'geek-toolbox-discovery-collapse'
const MAX_FAVORITES = 12
const MAX_RECENT = 8

function loadArray(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') }
  catch { return [] }
}

function saveArray(key: string, arr: string[]) {
  localStorage.setItem(key, JSON.stringify(arr))
}

const favoriteIds = ref<string[]>(loadArray(STORAGE_KEY_FAVORITES))
const recentIds = ref<string[]>(loadArray(STORAGE_KEY_RECENT))
const collapseState = ref<Record<string, boolean>>(
  (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_COLLAPSE) || '{}') } catch { return {} } })()
)

export function useDiscovery() {
  const recommendedTools = computed<ToolMeta[]>(() =>
    TOOLS.filter(t => t.featured)
  )

  const favoriteTools = computed<ToolMeta[]>(() =>
    favoriteIds.value.map(id => TOOLS.find(t => t.id === id)).filter(Boolean) as ToolMeta[]
  )

  const recentTools = computed<ToolMeta[]>(() =>
    recentIds.value.map(id => TOOLS.find(t => t.id === id)).filter(Boolean) as ToolMeta[]
  )

  function isFavorite(id: string): boolean {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id: string) {
    const idx = favoriteIds.value.indexOf(id)
    if (idx !== -1) {
      favoriteIds.value.splice(idx, 1)
    } else {
      if (favoriteIds.value.length >= MAX_FAVORITES) return
      favoriteIds.value.push(id)
    }
    saveArray(STORAGE_KEY_FAVORITES, favoriteIds.value)
  }

  function recordRecent(id: string) {
    const idx = recentIds.value.indexOf(id)
    if (idx !== -1) recentIds.value.splice(idx, 1)
    recentIds.value.unshift(id)
    if (recentIds.value.length > MAX_RECENT) recentIds.value.pop()
    saveArray(STORAGE_KEY_RECENT, recentIds.value)
  }

  function clearRecent() {
    recentIds.value = []
    saveArray(STORAGE_KEY_RECENT, [])
  }

  function isCollapsed(section: string): boolean {
    return collapseState.value[section] ?? false
  }

  function toggleCollapse(section: string) {
    collapseState.value[section] = !collapseState.value[section]
    localStorage.setItem(STORAGE_KEY_COLLAPSE, JSON.stringify(collapseState.value))
  }

  return {
    recommendedTools, favoriteTools, recentTools,
    isFavorite, toggleFavorite,
    recordRecent, clearRecent,
    isCollapsed, toggleCollapse
  }
}
