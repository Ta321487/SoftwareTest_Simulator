import { formatPracticeLine } from './sharePractice.js'

const W = 1200
const H = 630

const COLORS = {
  bg: '#0a0e17',
  card: '#111827',
  border: '#334155',
  text: '#e2e8f0',
  muted: '#94a3b8',
  dim: '#64748b',
  cyan: '#22d3ee',
  purple: '#a78bfa',
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawBorderGradient(ctx) {
  const g = ctx.createLinearGradient(48, 48, W - 48, H - 48)
  g.addColorStop(0, COLORS.cyan)
  g.addColorStop(1, COLORS.purple)
  ctx.strokeStyle = g
  ctx.lineWidth = 2
  roundRect(ctx, 48, 48, W - 96, H - 96, 20)
  ctx.stroke()
}

/**
 * 在 Canvas 上绘制个人成绩分享图（1200×630）
 */
export function drawShareCard(canvas, payload) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  canvas.width = W
  canvas.height = H

  const {
    rankTitle,
    rankIcon,
    xp,
    stars,
    mainDone,
    mainTotal,
    sideDone,
    sideTotal,
    streak,
    practiceContext,
  } = payload

  const practiceLine = formatPracticeLine(practiceContext)
  const font = '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'

  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, W, H)
  drawBorderGradient(ctx)

  ctx.fillStyle = COLORS.text
  ctx.font = `700 44px ${font}`
  ctx.fillText('测试人一生', 80, 110)

  ctx.fillStyle = COLORS.muted
  ctx.font = `400 24px ${font}`
  ctx.fillText('用「闯关」练软件测试 · 积累经验、提升职级', 80, 148)

  roundRect(ctx, 80, 175, W - 160, 130, 14)
  ctx.fillStyle = COLORS.card
  ctx.fill()
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = COLORS.text
  ctx.font = `700 40px ${font}`
  ctx.fillText(`${rankIcon}  ${rankTitle}`, 104, 228)

  ctx.font = `400 26px ${font}`
  ctx.fillStyle = COLORS.muted
  ctx.fillText(
    `XP ${xp}    ★ ${stars}    主线 ${mainDone}/${mainTotal}    番外 ${sideDone}/${sideTotal}`,
    104,
    272
  )
  ctx.fillText(`每日连续 ${streak} 天`, 104, 306)

  roundRect(ctx, 80, 325, W - 160, 100, 14)
  ctx.fillStyle = COLORS.card
  ctx.fill()
  ctx.strokeStyle = COLORS.purple
  ctx.globalAlpha = 0.45
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.fillStyle = COLORS.purple
  ctx.font = `600 22px ${font}`
  ctx.fillText('最近在练', 104, 358)

  ctx.fillStyle = COLORS.text
  ctx.font = `400 24px ${font}`
  const practiceShort = practiceLine.length > 52 ? `${practiceLine.slice(0, 50)}…` : practiceLine
  ctx.fillText(practiceShort, 104, 398)

  ctx.fillStyle = COLORS.cyan
  ctx.font = `400 26px ${font}`
  ctx.fillText('我在用模拟器练测试，不是背题 —— 来挑战 →', 80, 520)

  ctx.fillStyle = COLORS.dim
  ctx.font = `400 20px ${font}`
  ctx.fillText('SoftwareTest Simulator · 手札·百科随时查', 80, 560)

  return canvas
}

export function renderShareCardDataUrl(payload) {
  if (typeof document === 'undefined') {
    throw new Error('renderShareCardDataUrl 需在浏览器环境调用')
  }
  const canvas = document.createElement('canvas')
  drawShareCard(canvas, payload)
  return canvas.toDataURL('image/png')
}

export function downloadShareCard(payload, filename = '测试人一生-成绩分享.png') {
  const dataUrl = renderShareCardDataUrl(payload)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
