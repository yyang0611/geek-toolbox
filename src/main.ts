import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './styles/variables.css'
import './styles/base.css'
import './styles/components.css'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

const savedLang = localStorage.getItem('geek-toolbox-language') || 'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { 'zh-CN': zhCN, en }
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
