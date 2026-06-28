import { LOGIN_MODULE_ID } from './loginSut.js'
import { PAYMENT_MODULE_ID } from './paymentSut.js'
import { ORDER_MODULE_ID } from './orderSut.js'
import { ONBOARD_WEEK2_ID } from './onboardSut.js'

const IMMERSION_DEFS = {
  [LOGIN_MODULE_ID]: [
    { key: 'reproducedBug', label: 'App 复现 Bug' },
    { key: 'verifiedFix', label: 'App 验证修复' },
  ],
  [PAYMENT_MODULE_ID]: [
    { key: 'dbConnected', label: '沙箱连通' },
    { key: 'callbackMiss', label: '回调缺失复现' },
    { key: 'payErrorReproduced', label: '支付失败复现' },
  ],
  [ORDER_MODULE_ID]: [{ key: 'bottleneckIdentified', label: 'APM 定位瓶颈' }],
  [ONBOARD_WEEK2_ID]: [
    { key: 'prodSlowReproduced', label: '生产慢登录复现' },
    { key: 'logReviewed', label: '日志摘要已阅' },
  ],
}

function getSut(projectStore, projectId) {
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

/** 首页展示：各项目剧本可选沉浸体验完成度 */
export function getProjectImmersion(projectId, projectStore) {
  const defs = IMMERSION_DEFS[projectId] || []
  if (!defs.length) {
    return { total: 0, done: 0, items: [], label: '' }
  }

  const sut = getSut(projectStore, projectId)
  const items = defs.map((d) => ({
    key: d.key,
    label: d.label,
    done: Boolean(sut[d.key]),
  }))
  const done = items.filter((i) => i.done).length

  return {
    total: items.length,
    done,
    items,
    label: done > 0 ? `沉浸 ${done}/${items.length}` : '含可选 App/监控体验',
  }
}

export const HOME_PROJECT_IDS = [
  LOGIN_MODULE_ID,
  PAYMENT_MODULE_ID,
  ORDER_MODULE_ID,
  ONBOARD_WEEK2_ID,
  'season2-lead',
]
