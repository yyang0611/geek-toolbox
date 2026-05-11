/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface EyeDropper {
  open(): Promise<{ sRGBHex: string }>
}
declare var EyeDropper: { new(): EyeDropper } | undefined
