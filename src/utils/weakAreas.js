import { getLevelById } from './levelRegistry'

/**
 * 汇总本地薄弱关卡：有失误记录、低星通关、或用过提示仍重玩的关。
 */
export function getWeakAreas({
  levelMistakes = {},
  levelMeta = {},
  hintsUsed = {},
  completedLevelIds = [],
}) {
  const seen = new Set()
  const areas = []

  function push(levelId, reason, score) {
    if (seen.has(levelId)) return
    const level = getLevelById(levelId)
    if (!level) return
    seen.add(levelId)
    areas.push({
      levelId,
      title: level.title,
      simType: level.simType,
      reason,
      score,
    })
  }

  for (const [idStr, count] of Object.entries(levelMistakes)) {
    const levelId = Number(idStr)
    if (count > 0) {
      push(levelId, `失误 ${count} 次`, count * 10)
    }
  }

  for (const [idStr, meta] of Object.entries(levelMeta)) {
    const levelId = Number(idStr)
    if (meta?.stars === 1 && completedLevelIds.includes(levelId)) {
      push(levelId, '仅 ★1', 5)
    }
  }

  for (const [idStr, used] of Object.entries(hintsUsed)) {
    if (!used) continue
    const levelId = Number(idStr)
    if (completedLevelIds.includes(levelId)) {
      push(levelId, '用过提示', 3)
    }
  }

  return areas.sort((a, b) => b.score - a.score || a.levelId - b.levelId).slice(0, 6)
}

/** 按模拟器题型聚合薄弱关，用于「按题型特训」 */
export function getWeakSimTypeDrills({
  levelMistakes = {},
  levelMeta = {},
  hintsUsed = {},
  completedLevelIds = [],
}) {
  const weak = getWeakAreas({ levelMistakes, levelMeta, hintsUsed, completedLevelIds })
  const bySim = new Map()

  for (const item of weak) {
    if (!item.simType) continue
    const existing = bySim.get(item.simType)
    if (!existing) {
      bySim.set(item.simType, {
        simType: item.simType,
        count: 1,
        levelId: item.levelId,
        title: item.title,
        score: item.score,
      })
    } else {
      existing.count += 1
      if (item.score > existing.score) {
        existing.levelId = item.levelId
        existing.title = item.title
        existing.score = item.score
      }
    }
  }

  return [...bySim.values()].sort((a, b) => b.score - a.score || b.count - a.count).slice(0, 4)
}
