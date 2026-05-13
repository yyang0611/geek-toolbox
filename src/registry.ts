import type { ToolMeta, CategoryMeta } from '@/types/tools'

export const CATEGORIES: CategoryMeta[] = [
  { id: 'all', titleKey: 'categories.all' },
  { id: 'developer', titleKey: 'categories.developer' },
  { id: 'text', titleKey: 'categories.text' },
  { id: 'image', titleKey: 'categories.image' },
  { id: 'file', titleKey: 'categories.file' },
  { id: 'life', titleKey: 'categories.life' }
]

export const TOOLS: ToolMeta[] = [
  {
    id: 'timestamp',
    category: 'developer',
    icon: '\u{1F552}',
    titleKey: 'tabs.timestamp',
    descKey: 'toolCards.timestamp',
    component: () => import('@/components/tools/TimestampTool.vue')
  },
  {
    id: 'json',
    category: 'developer',
    icon: '\u{1F9E9}',
    titleKey: 'tabs.json',
    descKey: 'toolCards.json',
    component: () => import('@/components/tools/JsonTool.vue')
  },
  {
    id: 'diff',
    category: 'text',
    icon: '\u{1F4DD}',
    titleKey: 'tabs.diff',
    descKey: 'toolCards.diff',
    component: () => import('@/components/tools/DiffTool.vue')
  },
  {
    id: 'base64',
    category: 'developer',
    icon: '\u{1F510}',
    titleKey: 'tabs.base64',
    descKey: 'toolCards.base64',
    component: () => import('@/components/tools/Base64Tool.vue')
  },
  {
    id: 'count',
    category: 'text',
    icon: '\u{1F522}',
    titleKey: 'tabs.count',
    descKey: 'toolCards.count',
    component: () => import('@/components/tools/CountTool.vue')
  },
  {
    id: 'url',
    category: 'developer',
    icon: '\u{1F517}',
    titleKey: 'tabs.url',
    descKey: 'toolCards.url',
    component: () => import('@/components/tools/UrlTool.vue')
  },
  {
    id: 'regex',
    category: 'developer',
    icon: '\u{1F9EA}',
    titleKey: 'tabs.regex',
    descKey: 'toolCards.regex',
    component: () => import('@/components/tools/RegexTool.vue')
  },
  {
    id: 'jwt',
    category: 'developer',
    icon: '\u{1F3AB}',
    titleKey: 'tabs.jwt',
    descKey: 'toolCards.jwt',
    component: () => import('@/components/tools/JwtTool.vue')
  },
  {
    id: 'yaml',
    category: 'developer',
    icon: '\u{1F4C4}',
    titleKey: 'tabs.yaml',
    descKey: 'toolCards.yaml',
    component: () => import('@/components/tools/YamlTool.vue')
  },
  {
    id: 'color',
    category: 'image',
    icon: '\u{1F3A8}',
    titleKey: 'tabs.color',
    descKey: 'toolCards.color',
    component: () => import('@/components/tools/ColorTool.vue')
  },
  {
    id: 'image',
    category: 'image',
    icon: '\u{1F5BC}\uFE0F',
    titleKey: 'tabs.image',
    descKey: 'toolCards.image',
    component: () => import('@/components/tools/ImageTool.vue')
  },
  {
    id: 'convert',
    category: 'file',
    icon: '\u{1F504}',
    titleKey: 'tabs.convert',
    descKey: 'toolCards.convert',
    component: () => import('@/components/tools/ConvertTool.vue')
  },
  {
    id: 'annotate',
    category: 'image',
    icon: '\u270F\uFE0F',
    titleKey: 'tabs.annotate',
    descKey: 'toolCards.annotate',
    featured: true,
    component: () => import('@/components/tools/AnnotateTool.vue')
  },
  {
    id: 'card',
    category: 'text',
    icon: '\u{1FAAA}',
    titleKey: 'tabs.card',
    descKey: 'toolCards.card',
    featured: true,
    component: () => import('@/components/tools/CardTool.vue')
  },
  {
    id: 'uuid',
    category: 'developer',
    icon: '\u{1F511}',
    titleKey: 'tabs.uuid',
    descKey: 'toolCards.uuid',
    component: () => import('@/components/tools/UuidTool.vue')
  },
  {
    id: 'hash',
    category: 'developer',
    icon: '#️⃣',
    titleKey: 'tabs.hash',
    descKey: 'toolCards.hash',
    component: () => import('@/components/tools/HashTool.vue')
  },
  {
    id: 'password',
    category: 'developer',
    icon: '\u{1F510}',
    titleKey: 'tabs.password',
    descKey: 'toolCards.password',
    component: () => import('@/components/tools/PasswordTool.vue')
  },
  {
    id: 'caseconvert',
    category: 'developer',
    icon: '\u{1F524}',
    titleKey: 'tabs.caseconvert',
    descKey: 'toolCards.caseconvert',
    component: () => import('@/components/tools/CaseConvertTool.vue')
  },
  {
    id: 'qrcode',
    category: 'developer',
    icon: '\u{1F4F1}',
    titleKey: 'tabs.qrcode',
    descKey: 'toolCards.qrcode',
    component: () => import('@/components/tools/QrcodeTool.vue')
  },
  {
    id: 'unit',
    category: 'life',
    icon: '\u{1F4D0}',
    titleKey: 'tabs.unit',
    descKey: 'toolCards.unit',
    component: () => import('@/components/tools/UnitTool.vue')
  },
  {
    id: 'datecalc',
    category: 'life',
    icon: '\u{1F4C5}',
    titleKey: 'tabs.datecalc',
    descKey: 'toolCards.datecalc',
    component: () => import('@/components/tools/DateCalcTool.vue')
  },
  {
    id: 'mortgage',
    category: 'life',
    icon: '\u{1F3E0}',
    titleKey: 'tabs.mortgage',
    descKey: 'toolCards.mortgage',
    component: () => import('@/components/tools/MortgageTool.vue')
  },
  {
    id: 'random',
    category: 'life',
    icon: '\u{1F3B2}',
    titleKey: 'tabs.random',
    descKey: 'toolCards.random',
    component: () => import('@/components/tools/RandomTool.vue')
  },
  {
    id: 'pomodoro',
    category: 'life',
    icon: '\u{1F345}',
    titleKey: 'tabs.pomodoro',
    descKey: 'toolCards.pomodoro',
    component: () => import('@/components/tools/PomodoroTool.vue')
  }
]

export function getToolById(id: string): ToolMeta | undefined {
  return TOOLS.find(t => t.id === id)
}

export function getToolsByCategory(category: string): ToolMeta[] {
  if (category === 'all') return TOOLS
  return TOOLS.filter(t => t.category === category)
}
