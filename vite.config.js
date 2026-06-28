import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'node:fs'
import { join } from 'node:path'

/** GitHub Pages 子路径下，刷新深链接需要 404.html 回落到 SPA */
function ghPagesSpaFallback() {
  return {
    name: 'gh-pages-spa-fallback',
    closeBundle() {
      const outDir = join(process.cwd(), 'dist')
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  plugins: [vue(), ghPagesSpaFallback()],
  base: process.env.BASE_PATH || '/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
