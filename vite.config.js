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
        theme_color: '#0f172a',
        background_color: '#0f172a',
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
        globPatterns: ['index.html', 'manifest.webmanifest', '**/*.{ico,png,svg,woff2}'],
        globIgnores: ['**/workbox-*.js'],
        navigateFallback: base === '/' ? 'index.html' : `${base.replace(/\/$/, '')}/index.html`,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith(base.replace(/\/$/, '') || '') && /\.(?:js|css)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-chunks',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
    ghPagesSpaFallback(),
  ],
  base,
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
