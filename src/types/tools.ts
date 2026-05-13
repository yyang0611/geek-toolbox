import type { Component } from 'vue'

export type ToolCategory = 'developer' | 'text' | 'image' | 'file' | 'life'

export interface ToolMeta {
  id: string
  category: ToolCategory
  icon: string
  titleKey: string
  descKey: string
  featured?: boolean
  component: () => Promise<Component>
}

export interface CategoryMeta {
  id: ToolCategory | 'all'
  titleKey: string
}
