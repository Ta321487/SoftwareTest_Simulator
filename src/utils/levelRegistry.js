import { levels, simTypeLabels } from '../data/levels'
import { getSideLevel, isSideQuestId } from '../data/sideQuests'
import { getTodayDailyChallenge, isDailyQuestId, DAILY_LEVEL_ID } from '../data/dailyChallenges'

export { simTypeLabels, levels }

export function getLevelById(id) {
  const numId = Number(id)
  if (isDailyQuestId(numId)) {
    return getTodayDailyChallenge()
  }
  if (isSideQuestId(numId)) {
    return getSideLevel(numId)
  }
  return levels.find((l) => l.id === numId) || null
}

export function isMainQuestId(id) {
  return id >= 1 && id <= 99
}

export { isSideQuestId, isDailyQuestId, DAILY_LEVEL_ID }
