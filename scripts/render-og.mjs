/**
 * 将 public/og.svg 渲染为 og.png（1200×630），供微信 / OG 预览使用。
 * 需本机 Chrome 或 Playwright Chromium：npm run og:render
 */
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/og.svg'), 'utf8')
const html = `<!DOCTYPE html><html><body style="margin:0;background:#0a0e17">${svg}</body></html>`

const browser = await chromium.launch({
  channel: process.env.CI ? undefined : process.env.PLAYWRIGHT_CHANNEL || 'chrome',
})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'load' })
await page.locator('svg').screenshot({ path: join(root, 'public/og.png'), type: 'png' })
await browser.close()
console.log('Wrote public/og.png')
