import { simTypeLabels } from '../data/levels.js'
import { sideLevels, isSideQuestUnlocked } from '../data/sideQuests.js'
import { getHandbookLinksForLevel } from './handbookLinks.js'
import { getLevelById } from './levelRegistry.js'
import { getWeakSimTypeDrills } from './weakAreas.js'

/** 为薄弱题型推荐一条已解锁、未通关的番外 */
export function getSideQuestDrillForSimType(simType, completedLevelIds = []) {
  if (!simType) return null
  const candidate = sideLevels.find(
    (lv) =>
      lv.simType === simType &&
      isSideQuestUnlocked(lv, completedLevelIds) &&
      !completedLevelIds.includes(lv.id)
  )
  if (!candidate) return null
  return { levelId: candidate.id, title: candidate.title }
}

/** 聚合薄弱题型特训卡片（含冲星关 + 可选番外） */
export function buildWeakDrillCards(snapshot) {
  const drills = getWeakSimTypeDrills(snapshot)
  const completedLevelIds = snapshot.completedLevelIds || []

  return drills.map((item) => {
    const sideQuest = getSideQuestDrillForSimType(item.simType, completedLevelIds)
    const stars = snapshot.levelMeta?.[item.levelId]?.stars
    return {
      simType: item.simType,
      simLabel: simTypeLabels[item.simType] || item.simType,
      weakCount: item.count,
      retryLevelId: item.levelId,
      retryTitle: item.title,
      retryStars: stars || 0,
      sideQuest,
    }
  })
}

/** 失败/低星时给玩家的学习路径建议 */
export function getLearningPathForLevel(levelId, completedLevelIds = []) {
  const level = getLevelById(levelId)
  if (!level) return null

  const handbook = getHandbookLinksForLevel(levelId)
  const sideQuest = getSideQuestDrillForSimType(level.simType, completedLevelIds)

  const terms = handbook.terms.slice(0, 2)
  const playbooks = handbook.playbooks.slice(0, 1)

  if (!terms.length && !playbooks.length && !sideQuest) return null

  return {
    levelId,
    simType: level.simType,
    simLabel: simTypeLabels[level.simType] || level.simType,
    terms,
    playbooks,
    sideQuest,
  }
}

export function getLowStarLevels(levelMeta = {}, completedLevelIds = [], maxStars = 2) {
  return completedLevelIds
    .filter((id) => {
      const stars = levelMeta[id]?.stars
      return stars != null && stars <= maxStars && stars < 3
    })
    .map((id) => {
      const level = getLevelById(id)
      return level
        ? {
            levelId: id,
            title: level.title,
            stars: levelMeta[id].stars,
          }
        : null
    })
    .filter(Boolean)
    .sort((a, b) => a.stars - b.stars || a.levelId - b.levelId)
    .slice(0, 3)
}
