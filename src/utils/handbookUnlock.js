/** 手札内容是否与关卡进度联动锁定 */

import { SIDE_QUEST_ID_MIN, SIDE_QUEST_ID_MAX } from '../data/sideQuests.js'

export function resolveHandbookLevelStatus(levelId, store) {
  if (levelId >= SIDE_QUEST_ID_MIN && levelId <= SIDE_QUEST_ID_MAX) {
    return store.getSideQuestStatus(levelId)
  }
  return store.getStatus(levelId)
}

export function isHandbookLevelLocked(levelId, store) {
  return resolveHandbookLevelStatus(levelId, store) === 'locked'
}

export function isPlaybookHandbookLocked(playbook, store) {
  const ids = playbook?.relatedLevelIds
  if (!ids?.length) return false
  return ids.every((id) => isHandbookLevelLocked(id, store))
}

export function isGlossaryHandbookLocked(term, store) {
  const ids = term?.relatedLevelIds
  if (!ids?.length) return false
  return ids.every((id) => isHandbookLevelLocked(id, store))
}

export function isDailyHandbookLocked(store) {
  return store.getDailyStatus() === 'locked'
}
