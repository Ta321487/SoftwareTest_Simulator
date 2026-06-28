/** 订单模块可观测面板 —— Dock 专用 ID */
export const ORDER_OBS_DOCK_ID = 903

export const ORDER_MODULE_ID = 'order-module'

export function isOrderModuleProject(project) {
  return project?.id === ORDER_MODULE_ID
}

/** apm | monitor | incident | overview */
export function getOrderObsMode(levelId) {
  if (levelId === 12) return 'apm'
  if (levelId === 14) return 'monitor'
  if (levelId === 15) return 'incident'
  if (levelId === 13) return 'overview'
  return 'overview'
}

export function shouldShowInlineOrderObs(levelId) {
  return levelId === 12 || levelId === 14
}

export function shouldShowOrderObsDock(levelId) {
  return levelId >= 12 && levelId <= 15
}

export function getOrderObsLead(levelId) {
  if (levelId === 12) {
    return '先看 APM 链路里哪一段最慢，再在下方案例里点选瓶颈环节（不卡关，但对照监控再选更准）。'
  }
  if (levelId === 14) {
    return '对照灰度监控面板，勾选必须盯的业务与系统指标——UI 圆角那种不用选。'
  }
  return ''
}
