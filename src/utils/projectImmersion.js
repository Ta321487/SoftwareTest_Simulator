import { IMMERSION_BY_PROJECT, isImmersionDone } from './sutImmersion.js'

/** 首页展示：各项目线上机实操完成度 */
export function getProjectImmersion(projectId, projectStore) {
  const defs = IMMERSION_BY_PROJECT[projectId] || []
  if (!defs.length) {
    return { total: 0, done: 0, items: [], entries: [], label: '' }
  }

  const items = defs.map((d) => ({
    key: d.key,
    label: d.label,
    levelId: d.levelId,
    dock: d.dock,
    done: isImmersionDone(d, projectStore, projectId),
  }))
  const done = items.filter((i) => i.done).length

  return {
    total: items.length,
    done,
    items,
    entries: defs,
    label: done > 0 ? `上机实操 ${done}/${items.length}` : '含可选上机实操',
  }
}

export const HOME_PROJECT_IDS = [
  'login-module',
  'payment-module',
  'order-module',
  'onboard-week2',
  'season2-lead',
]

export { getImmersionEntries, buildSutRoute, IMMERSION_BY_PROJECT } from './sutImmersion.js'
