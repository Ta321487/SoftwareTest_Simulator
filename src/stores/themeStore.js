import { defineStore } from 'pinia'
import { getItem, setItem } from '../utils/storage'

const STORAGE_KEY = 'theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: getItem(STORAGE_KEY, 'light'),
  }),

  getters: {
    isLight: (state) => state.theme === 'light',
    label: (state) => (state.theme === 'light' ? '深色模式' : '浅色模式'),
    icon: (state) => (state.theme === 'light' ? '🌙' : '☀️'),
  },

  actions: {
    apply() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    setTheme(theme) {
      this.theme = theme
      setItem(STORAGE_KEY, theme)
      this.apply()
    },

    toggle() {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    },

    init() {
      this.apply()
    },
  },
})
