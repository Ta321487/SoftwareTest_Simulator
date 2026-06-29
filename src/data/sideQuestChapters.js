/** 番外大章：工具链（推荐） vs 思维选修 */

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

export const sideChapters = [
  {
    id: 'mindset',
    name: '第一章 · 测试思维选修',
    icon: '📖',
    tagline: '安全、性能、策略等场景判断——按主线里程碑解锁，不影响职级晋升。',
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
]

export function isToolchainArc(arcId) {
  return TOOLCHAIN_ARC_IDS.includes(arcId)
}

export function getArcParentChapter(arcId) {
  return isToolchainArc(arcId) ? 'toolchain' : 'mindset'
}

export function enrichSideArc(arc) {
  const parentChapter = getArcParentChapter(arc.id)
  return {
    ...arc,
    parentChapter,
    elective: parentChapter === 'mindset',
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
