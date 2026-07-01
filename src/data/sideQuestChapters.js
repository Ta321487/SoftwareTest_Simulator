/** 番外大章：思维选修 / 排查工具链 / 业务场景选修 */

export const MINDSET_ARC_IDS = [
  'security',
  'performance',
  'pipeline',
  'collab',
  'compat',
  'strategy',
  'data',
  'monitor',
  'automation',
  'api',
  'autoroi',
  'boundary',
]

export const TOOLCHAIN_ARC_IDS = [
  'linux',
  'sql',
  'redis',
  'cipipeline',
  'mock',
  'apm',
  'git',
  'async',
]

/** 异步 / 发布 / 值班 / Lead / App / 流程加深等业务实操选修 */
export const SCENARIO_ARC_IDS = [
  'uat',
  'refund',
  'sms',
  'grayrelease',
  'callback',
  'orderstuck',
  'oncall',
  'lead',
  'apiauth',
  'loadtest',
  'appsmoke',
  'explore',
  'testreport',
  'configdrift',
  'flaky',
  'reqchange',
  'weaknet',
  'datamask',
  'i18n',
  'analytics',
  'contract',
]

export const sideChapters = [
  {
    id: 'mindset',
    name: '第一章 · 测试思维选修',
    icon: '📖',
    tagline: '时间紧、资源少时，先练怎么选、怎么取舍。',
    elective: true,
    badge: '选修',
  },
  {
    id: 'toolchain',
    name: '第二章 · 排查工具链',
    icon: '🔧',
    tagline: '主线第 5 关后可开练，从 tail 到 MQ，一条道往下走。',
    recommended: true,
    badge: '推荐',
  },
  {
    id: 'scenario',
    name: '第三章 · 业务场景选修',
    icon: '🎯',
    tagline: '退款卡住、回调丢了、弱网闪退，业务坑单独练。',
    elective: true,
    badge: '选修',
  },
]

export function isMindsetArc(arcId) {
  return MINDSET_ARC_IDS.includes(arcId)
}

export function isToolchainArc(arcId) {
  return TOOLCHAIN_ARC_IDS.includes(arcId)
}

export function isScenarioArc(arcId) {
  return SCENARIO_ARC_IDS.includes(arcId)
}

export function getArcParentChapter(arcId) {
  if (isToolchainArc(arcId)) return 'toolchain'
  if (isScenarioArc(arcId)) return 'scenario'
  if (isMindsetArc(arcId)) return 'mindset'
  return 'scenario'
}

export function enrichSideArc(arc) {
  const parentChapter = getArcParentChapter(arc.id)
  return {
    ...arc,
    parentChapter,
    elective: parentChapter !== 'toolchain',
  }
}

export function enrichSideArcs(arcs) {
  return arcs.map(enrichSideArc)
}

export function getChapterForArc(arcId) {
  const chapterId = getArcParentChapter(arcId)
  return sideChapters.find((c) => c.id === chapterId) || null
}

/** 工具链推荐路线：按关卡 ID 排序 */
export function getToolchainLevelIds(sideLevels) {
  return sideLevels
    .filter((l) => isToolchainArc(l.sideArc))
    .map((l) => l.id)
    .sort((a, b) => a - b)
}

export function getToolchainProgress(sideLevels, completedLevelIds) {
  const ids = getToolchainLevelIds(sideLevels)
  const done = ids.filter((id) => completedLevelIds.includes(id)).length
  return { done, total: ids.length, levelIds: ids }
}

export function getNextToolchainLevel(sideLevels, getStatus) {
  const ids = getToolchainLevelIds(sideLevels)
  for (const id of ids) {
    const status = getStatus(id)
    if (status === 'available') return sideLevels.find((l) => l.id === id) || null
  }
  return null
}
