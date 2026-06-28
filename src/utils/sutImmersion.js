import { LOGIN_SUT_DOCK_ID, LOGIN_MODULE_ID } from './loginSut.js'
import { PAYMENT_SUT_DOCK_ID, PAYMENT_MODULE_ID } from './paymentSut.js'
import { ORDER_OBS_DOCK_ID, ORDER_MODULE_ID } from './orderSut.js'
import { ONCALL_DOCK_ID, ONBOARD_WEEK2_ID } from './onboardSut.js'

export const SUT_MODE = 'sut'

/** query.dock → 内部 Dock ID */
export const DOCK_QUERY_TO_ID = {
  app: LOGIN_SUT_DOCK_ID,
  pay: PAYMENT_SUT_DOCK_ID,
  obs: ORDER_OBS_DOCK_ID,
  oncall: ONCALL_DOCK_ID,
}

export const DOCK_ID_TO_QUERY = Object.fromEntries(
  Object.entries(DOCK_QUERY_TO_ID).map(([k, v]) => [v, k])
)

/** 各项目线上机实操项（独立入口，不影响主线判分） */
export const IMMERSION_BY_PROJECT = {
  [LOGIN_MODULE_ID]: [
    {
      key: 'reproducedBug',
      label: 'App 复现 Bug',
      levelId: 3,
      dock: 'app',
      steps: ['打开登录页', '点击「获取验证码」', '确认倒计时显示 -1 秒'],
    },
    {
      key: 'verifiedFix',
      label: 'App 验证修复',
      levelId: 4,
      dock: 'app',
      steps: ['点击「获取验证码」', '确认倒计时从 60 正常递减'],
    },
  ],
  [PAYMENT_MODULE_ID]: [
    {
      key: 'dbConnected',
      label: '沙箱连通',
      levelId: 6,
      dock: 'pay',
      steps: ['主线完成配置并测试连接', '在支付 App 确认可发起支付'],
    },
    {
      key: 'callbackMiss',
      label: '回调缺失复现',
      levelId: 7,
      dock: 'pay',
      steps: ['完成一笔微信支付', '观察「到账通知」是否缺失'],
    },
    {
      key: 'payErrorReproduced',
      label: '支付失败复现',
      levelId: 8,
      dock: 'pay',
      steps: ['在 App 内复现支付失败', '记录现象供 Bug 单使用'],
    },
  ],
  [ORDER_MODULE_ID]: [
    {
      key: 'bottleneckIdentified',
      label: 'APM 定位瓶颈',
      levelId: 12,
      dock: 'obs',
      steps: ['查看调用链各段耗时', '点击 MySQL 800ms 瓶颈环节'],
    },
  ],
  [ONBOARD_WEEK2_ID]: [
    {
      key: 'prodSlowReproduced',
      label: '生产慢登录复现',
      levelId: 22,
      dock: 'oncall',
      steps: ['切换 4G 网络', '登录并感受超时', '记录实际等待秒数'],
    },
    {
      key: 'logReviewed',
      label: '日志摘要已阅',
      levelId: 23,
      dock: 'oncall',
      steps: ['阅读 error.log 摘要', '在终端 grep 关键字验证'],
    },
  ],
}

export function getImmersionEntries(projectId) {
  return IMMERSION_BY_PROJECT[projectId] || []
}

export function getImmersionEntry(projectId, key) {
  return getImmersionEntries(projectId).find((e) => e.key === key) || null
}

export function buildSutRoute(levelId, dock = 'app') {
  return { name: 'LevelSut', params: { id: String(levelId), dock } }
}

export function buildMainLevelRoute(levelId) {
  return { name: 'LevelDetail', params: { id: String(levelId) } }
}

export function isSutModeRoute(route) {
  if (route?.name === 'LevelSut') return true
  return route?.query?.mode === SUT_MODE
}

export function getSutDockQuery(route) {
  const paramDock = route.params?.dock
  if (typeof paramDock === 'string' && DOCK_QUERY_TO_ID[paramDock]) return paramDock
  const queryDock = route?.query?.dock
  if (typeof queryDock === 'string' && DOCK_QUERY_TO_ID[queryDock]) return queryDock
  return null
}

export function getSutDockId(route) {
  const q = getSutDockQuery(route)
  return q ? DOCK_QUERY_TO_ID[q] : null
}

/** 某关是否有上机实操入口 */
export function getSutEntriesForLevel(levelId, projectId) {
  return getImmersionEntries(projectId).filter((e) => e.levelId === levelId)
}

export function resolveSutEntry(route, projectId) {
  const levelId = Number(route.params.id)
  const dock = getSutDockQuery(route)
  const entries = getImmersionEntries(projectId)
  if (dock) {
    return entries.find((e) => e.levelId === levelId && e.dock === dock) || null
  }
  return entries.find((e) => e.levelId === levelId) || null
}

export function isImmersionDone(entry, projectStore, projectId) {
  if (!entry) return false
  const sut = getSutState(projectStore, projectId)
  return Boolean(sut[entry.key])
}

export function getSutState(projectStore, projectId) {
  switch (projectId) {
    case LOGIN_MODULE_ID:
      return projectStore.getLoginSut(projectId)
    case PAYMENT_MODULE_ID:
      return projectStore.getPaymentSut(projectId)
    case ORDER_MODULE_ID:
      return projectStore.getOrderSut(projectId)
    case ONBOARD_WEEK2_ID:
      return projectStore.getOnboardSut(projectId)
    default:
      return {}
  }
}

function patchSutState(projectStore, projectId, patch) {
  switch (projectId) {
    case LOGIN_MODULE_ID:
      projectStore.patchLoginSut(projectId, patch)
      break
    case PAYMENT_MODULE_ID:
      projectStore.patchPaymentSut(projectId, patch)
      break
    case ORDER_MODULE_ID:
      projectStore.patchOrderSut(projectId, patch)
      break
    case ONBOARD_WEEK2_ID:
      projectStore.patchOnboardSut(projectId, patch)
      break
    default:
      break
  }
}

/** 已完成步数（0..steps.length）；旧存档仅有 key 布尔时视为全部完成 */
export function getCompletedStepCount(entry, projectStore, projectId) {
  if (!entry?.steps?.length) return 0
  const sut = getSutState(projectStore, projectId)
  const stored = sut._stepProgress?.[entry.key]
  if (typeof stored === 'number') return Math.min(stored, entry.steps.length)
  if (sut[entry.key]) return entry.steps.length
  return 0
}

export function setImmersionStepProgress(entry, projectStore, projectId, completedSteps) {
  if (!entry?.steps?.length) return
  const count = Math.min(Math.max(0, completedSteps), entry.steps.length)
  const sut = getSutState(projectStore, projectId)
  const stepProgress = { ...(sut._stepProgress || {}), [entry.key]: count }
  const patch = { _stepProgress: stepProgress }
  if (count >= entry.steps.length) {
    patch[entry.key] = true
  }
  patchSutState(projectStore, projectId, patch)
}

export function getImmersionStepsProgress(entry, projectStore, projectId) {
  if (!entry?.steps?.length) return []
  const completedCount = getCompletedStepCount(entry, projectStore, projectId)
  return entry.steps.map((text, index) => ({
    text,
    done: index < completedCount,
    active: index === completedCount && completedCount < entry.steps.length,
  }))
}

/** SUT 页 mount 时：被动首步（打开页面 / 查看面板）自动勾选 */
export function initPassiveSutStep(entry, projectStore, projectId) {
  if (!entry) return
  const count = getCompletedStepCount(entry, projectStore, projectId)
  if (count > 0) return
  const passiveFirst = [
    'reproducedBug',
    'bottleneckIdentified',
    'prodSlowReproduced',
    'logReviewed',
  ]
  if (passiveFirst.includes(entry.key)) {
    setImmersionStepProgress(entry, projectStore, projectId, 1)
  }
}

/** 沙箱连通：主线配置完成后同步第 1 步 */
export function syncDbConnectedStep(entry, projectStore, projectId, progressStore) {
  if (!entry || entry.key !== 'dbConnected') return
  const sut = getSutState(projectStore, projectId)
  const level6Done =
    progressStore?.completedLevelIds?.includes(6) ||
    projectStore?.hasArtifact?.(projectId, 6)
  const configReady = Boolean(sut.dbConnected || level6Done)
  if (!configReady) return
  const current = getCompletedStepCount(entry, projectStore, projectId)
  if (current < 1) {
    setImmersionStepProgress(entry, projectStore, projectId, 1)
  }
}
