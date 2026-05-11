import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/geek-toolbox/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
