import { levelOrder } from './levels'

const SEASON2_START = 28

export const SEASON1_LEVEL_IDS = levelOrder.slice(0, levelOrder.indexOf(SEASON2_START))

export const SEASON2_LEVEL_IDS = levelOrder.slice(levelOrder.indexOf(SEASON2_START))

export const TOTAL_MAIN_LEVELS = levelOrder.length

export const SEASON1_LEVEL_COUNT = SEASON1_LEVEL_IDS.length

export function isMainlineLevelId(id) {
  return levelOrder.includes(id)
}

export function countMainlineCompleted(completedLevelIds) {
  if (!Array.isArray(completedLevelIds)) return 0
  return completedLevelIds.filter((id) => isMainlineLevelId(id)).length
}

export function isMainLevelDone(levelId, completedLevelIds) {
  if (!Array.isArray(completedLevelIds)) return false
  return completedLevelIds.includes(levelId)
}

export function isSeason1Complete(completedLevelIds) {
  return SEASON1_LEVEL_IDS.every((id) => isMainLevelDone(id, completedLevelIds))
}

export function isSeason2Complete(completedLevelIds) {
  return SEASON2_LEVEL_IDS.every((id) => isMainLevelDone(id, completedLevelIds))
}
