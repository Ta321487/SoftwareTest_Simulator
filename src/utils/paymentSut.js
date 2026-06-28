/** 支付模块被测 App —— Dock 专用 ID */
export const PAYMENT_SUT_DOCK_ID = 902

export const PAYMENT_MODULE_ID = 'payment-module'

export function isPaymentModuleProject(project) {
  return project?.id === PAYMENT_MODULE_ID
}

/**
 * 支付 App 场景：
 * no-db | callback-bug | pay-error | fixed
 */
export function getPaymentScenario(currentLevelId, projectStore, progressStore) {
  const sut = projectStore.getPaymentSut?.(PAYMENT_MODULE_ID) || {}
  const level6Done =
    progressStore?.completedLevelIds?.includes(6) ||
    projectStore?.hasArtifact?.(PAYMENT_MODULE_ID, 6)
  const dbReady = Boolean(sut.dbConnected || level6Done)

  if (currentLevelId >= 9 && currentLevelId <= 10) return 'fixed'
  if (currentLevelId === 8) return dbReady ? 'pay-error' : 'no-db'
  if (currentLevelId === 7) return dbReady ? 'callback-bug' : 'no-db'
  if (currentLevelId === 6) return dbReady ? 'callback-bug' : 'no-db'
  return dbReady ? 'fixed' : 'no-db'
}

export function shouldShowInlinePaymentSut(levelId) {
  return levelId === 6 || levelId === 7 || levelId === 8
}

export function shouldShowPaymentAppDock(currentLevelId) {
  return currentLevelId >= 6 && currentLevelId <= 10
}

export function getPaymentSutLead(levelId) {
  if (levelId === 6) {
    return '右侧支付 App 会反映沙箱连通状态。改对 PAYMENT_DB_HOST 并测试连接后，App 才能发起支付。'
  }
  if (levelId === 7) {
    return '先在支付 App 里完成一笔微信支付，观察「到账通知」是否缺失，再在企微里写排查回复。'
  }
  if (levelId === 8) {
    return '先在 App 里复现支付失败现象，再补全 TEST-1008 工单（不卡关，但复现后写单更准）。'
  }
  return ''
}
