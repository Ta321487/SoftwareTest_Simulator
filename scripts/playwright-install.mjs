/**
 * 安装 Playwright 自带 Chromium（CI 用）。本地开发建议直接用本机 Chrome，见 README。
 *
 * 用法：
 *   node scripts/playwright-install.mjs           # 官方 CDN
 *   node scripts/playwright-install.mjs --cn      # 国内镜像（Chromium 可能仍失败）
 *   node scripts/playwright-install.mjs --cn --fallback  # 镜像失败则改官方 CDN
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const useCn = process.argv.includes('--cn') || process.env.PLAYWRIGHT_CN_MIRROR === '1'
const withDeps = process.argv.includes('--with-deps')
const fallback = process.argv.includes('--fallback')

function runInstall(label, downloadHost) {
  const env = { ...process.env }
  if (downloadHost) {
    env.PLAYWRIGHT_DOWNLOAD_HOST = downloadHost
    console.log(`[playwright-install] ${label}:`, downloadHost)
  } else {
    delete env.PLAYWRIGHT_DOWNLOAD_HOST
    console.log(`[playwright-install] ${label}: 官方 CDN`)
  }

  const cli = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'node_modules',
    '@playwright',
    'test',
    'cli.js'
  )

  const args = [cli, 'install', 'chromium']
  if (withDeps) args.push('--with-deps')

  return spawnSync(process.execPath, args, { stdio: 'inherit', env })
}

let result = useCn
  ? runInstall('国内镜像', process.env.PLAYWRIGHT_DOWNLOAD_HOST || 'https://cdn.npmmirror.com/binaries/playwright')
  : runInstall('官方 CDN', null)

if (result.status !== 0 && useCn && fallback) {
  console.warn('[playwright-install] 国内镜像失败，尝试官方 CDN…')
  result = runInstall('官方 CDN（回退）', null)
}

if (result.status !== 0) {
  console.error(`
[playwright-install] 下载失败。本地跑 E2E 可不装浏览器，直接用本机 Chrome：

  npm run test:e2e

若只有 Edge：

  $env:PLAYWRIGHT_CHANNEL="msedge"; npm run test:e2e
`)
}

process.exit(result.status ?? 1)
