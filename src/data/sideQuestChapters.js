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

/** 异步 / 发布 / 值班 / Lead / App 等业务实操选修 */
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
]

export const sideChapters = [
  {
    id: 'mindset',
    name: '第一章 · 测试思维选修',
    icon: '📖',
    tagline: '安全、性能、策略等场景判断——#101–#123 共 23 关，按主线里程碑解锁。',
    elective: true,
    badge: '选修',
  },
  {
    id: 'toolchain',
    name: '第二章 · 排查工具链',
    icon: '🔧',
    tagline:
      '推荐路线：主线 #5 后开练。Linux → SQL → Redis → CI → Mock → APM → Git → MQ，共 27 关链式解锁。',
    recommended: true,
    badge: '推荐',
  },
  {
    id: 'scenario',
    name: '第三章 · 业务场景选修',
    icon: '🎯',
    tagline:
      'UAT / 退款 / 短信 / 灰度 / 抓包 / 卡单 / 值班 / Lead / 越权 / 压测 / App 冒烟——共 39 关实操链。',
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
