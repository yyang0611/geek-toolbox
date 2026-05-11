import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      setTimeout(() => { copied.value = false }, 1500)
      return true
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (success) {
        copied.value = true
        setTimeout(() => { copied.value = false }, 1500)
      }
      return success
    }
  }

  return { copied, copy }
}
