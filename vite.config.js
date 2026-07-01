import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
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

const base = process.env.BASE_PATH || '/'
const basePath = base.replace(/\/$/, '')

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['og.png', 'og.svg'],
      manifest: {
        name: '测试人一生 · 软件测试闯关',
        short_name: '测试人一生',
        description:
          '备考 → 面试 → 笔试 → 入职。48 关主线 + 番外 + 每日特训，在模拟工具里攒 XP 升职级。',
        theme_color: '#131316',
        background_color: '#131316',
        display: 'standalone',
        lang: 'zh-CN',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'og.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'og.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // 预缓存带 hash 的 js/css，与 index 同步更新；勿用运行时闭包（SW 里 base 未定义会白屏）
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        globIgnores: ['**/workbox-*.js'],
        navigateFallback: basePath ? `${basePath}/index.html` : '/index.html',
        navigateFallbackDenylist: [/^\/api/, /\/[^/?]+\.[^/]+$/],
      },
    }),
    ghPagesSpaFallback(),
  ],
  base,
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || 'dev'),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor'
            }
            return
          }
          if (id.includes('/src/views/Handbook.vue') || id.includes('/src/data/glossary.js')) {
            return 'handbook'
          }
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
