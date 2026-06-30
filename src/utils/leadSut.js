/** Lead 线管理看板 — Dock 专用 ID */
export const LEAD_DOCK_ID = 905

export const SEASON2_LEAD_ID = 'season2-lead'

export function isSeason2LeadProject(project) {
  return project?.id === SEASON2_LEAD_ID
}

/** gonogo | roster | loadtest */
export function getLeadMode(levelId) {
  if (levelId === 33) return 'gonogo'
  if (levelId === 47) return 'roster'
  if (levelId === 48) return 'loadtest'
  return 'gonogo'
}

export function shouldShowLeadDock(levelId) {
  return levelId === 33 || levelId === 47 || levelId === 48
}

export function getLeadSutLead(levelId) {
  if (levelId === 33) {
    return '先看压测指标：P99 达标不代表能 Go，核心链路错误率超标应 No-Go 并写复测标准。'
  }
  if (levelId === 47) {
    return '分派任务要写清范围、交付物与截止时间——对照下方表单练手，再回主线填写。'
  }
  if (levelId === 48) {
    return '压测报告里支付超时率比 P99 略好更致命；在看板确认后再回主线选发布建议。'
  }
  return ''
}
