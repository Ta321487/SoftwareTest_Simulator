/** 线上值班面板 —— Dock 专用 ID */
export const ONCALL_DOCK_ID = 904

export const ONBOARD_WEEK2_ID = 'onboard-week2'

export function isOnboardWeek2Project(project) {
  return project?.id === ONBOARD_WEEK2_ID
}

/** prod-login | log-preview | release-board | month-wrap */
export function getOnCallMode(levelId) {
  if (levelId === 22) return 'prod-login'
  if (levelId === 23) return 'log-preview'
  if (levelId === 24) return 'release-board'
  if (levelId === 25) return 'month-wrap'
  return 'release-board'
}

export function shouldShowInlineOnCall(levelId) {
  return levelId === 22 || levelId === 23
}

export function shouldShowOnCallDock(levelId) {
  return levelId >= 22 && levelId <= 25
}

export function getOnCallLead(levelId) {
  if (levelId === 22) {
    return '先在生产 App 模拟器里用 4G 网络复现登录慢，再填写 TEST-1022 工单（不卡关，复现后写单更准）。'
  }
  if (levelId === 23) {
    return '上方是 error.log 摘要，下方终端用 grep 筛 ERROR 与面板交叉验证。'
  }
  return ''
}

export const DEFAULT_PROD_LOGS = [
  '[2026-06-28 14:02:01] ERROR AuthController - login timeout after 8000ms on mobile',
  '[2026-06-28 14:02:05] ERROR Gateway - upstream slow auth-server:8080',
  '[2026-06-28 14:02:08] INFO  AuthController - retry login success',
  '[2026-06-28 14:02:12] ERROR SmsService - SMS gateway latency 3200ms',
]
