import { ref, computed } from 'vue'
import { getToolById } from '@/registry'
import { useDiscovery } from '@/composables/useDiscovery'
import type { ToolMeta } from '@/types/tools'

const currentToolId = ref<string | null>(null)
const currentCategory = ref<string>('all')

export function useToolNav() {
  const { recordRecent } = useDiscovery()

  const currentTool = computed<ToolMeta | undefined>(() =>
    currentToolId.value ? getToolById(currentToolId.value) : undefined
  )

  function openTool(id: string) {
    currentToolId.value = id
    recordRecent(id)
  }

  function goHome() {
    currentToolId.value = null
  }

  function setCategory(category: string) {
    currentCategory.value = category
  }

  return {
    currentToolId,
    currentTool,
    currentCategory,
    openTool,
    goHome,
    setCategory
  }
}
