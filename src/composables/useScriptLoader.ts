const cache: Record<string, Promise<void> | undefined> = {}

export function useScriptLoader() {
  function loadScript(url: string): Promise<void> {
    const cached = cache[url]
    if (cached) return cached

    const promise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${url}"]`)
      if (existing) { resolve(); return }
      const script = document.createElement('script')
      script.src = url
      script.onload = () => resolve()
      script.onerror = () => {
        delete cache[url]
        reject(new Error(`Failed to load: ${url}`))
      }
      document.head.appendChild(script)
    })

    cache[url] = promise
    return promise
  }

  return { loadScript }
}

export const CDN = {
  XLSX: 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js',
  MAMMOTH: 'https://cdn.jsdelivr.net/npm/mammoth/mammoth.browser.min.js',
  PDFJS: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  PDFJS_WORKER: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  YAML: 'https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js'
} as const
