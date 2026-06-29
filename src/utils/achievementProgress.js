import { achievements } from '../data/achievements'
import { sideLevels } from '../data/sideQuests'
import { SEASON1_LEVEL_IDS, SEASON2_LEVEL_IDS } from '../data/mainlineMeta'
import { phases } from '../data/phases'

const PREPARE_LEVEL_IDS = phases.prepare.levelIds
const LOGIN_PROJECT_IDS = [1, 2, 3, 4, 5, 34, 35]
const ONCALL_LEVEL_IDS = [22, 23, 24, 25, 45, 46]

function sideCompletedCount(completedLevelIds) {
  if (!Array.isArray(completedLevelIds)) return 0
  return sideLevels.filter((l) => completedLevelIds.includes(l.id)).length
}

function countLevels(completedLevelIds, ids) {
  const done = ids.filter((id) => completedLevelIds.includes(id)).length
  return { current: done, target: ids.length }
}

function totalStars(completedLevelIds, levelMeta) {
  return completedLevelIds.reduce((sum, id) => sum + (levelMeta[id]?.stars || 0), 0)
}

/** 可量化进度的成就；无法量化的返回 null */
export function measureAchievementProgress(achievement, state) {
  const ids = state.completedLevelIds || []
  const meta = state.levelMeta || {}

  switch (achievement.id) {
    case 'first_step':
      return { current: Math.min(ids.length, 1), target: 1 }
    case 'login_arc':
      return countLevels(ids, LOGIN_PROJECT_IDS)
    case 'first_perfect': {
      const hasPerfect = Object.values(meta).some((m) => m.stars >= 3)
      return { current: hasPerfect ? 1 : 0, target: 1 }
    }
    case 'star_collector':
      return { current: totalStars(ids, meta), target: 60 }
    case 'prepare_done':
      return countLevels(ids, PREPARE_LEVEL_IDS)
    case 'veteran':
      return countLevels(ids, SEASON1_LEVEL_IDS)
    case 'jira_tracker':
      return countLevels(ids, [3, 8, 22])
    case 'firefighter':
      return countLevels(ids, ONCALL_LEVEL_IDS)
    case 'side_explorer':
      return { current: Math.min(sideCompletedCount(ids), 1), target: 1 }
    case 'side_master':
      return { current: sideCompletedCount(ids), target: sideLevels.length }
    case 'daily_streak':
      return { current: state.dailyStreak || 0, target: 3 }
    case 'clean_login': {
      const loginDone = [1, 2, 3, 4, 5].every((id) => ids.includes(id))
      const clean = [1, 2, 3, 4].every((id) => !(state.levelMistakes?.[id] > 0))
      return { current: loginDone && clean ? 1 : 0, target: 1 }
    }
    case 'lead_graduate':
      return countLevels(ids, SEASON2_LEVEL_IDS)
    case 'packet_pro': {
      const packet = [113, 31].filter((id) => ids.includes(id)).length
      return { current: Math.min(packet, 1), target: 1 }
    }
    default:
      return null
  }
}

/**
 * 距解锁最近的下一项成就（用于首页目标提示）
 * @param {{ achievements: string[], completedLevelIds: number[], levelMeta: object, levelMistakes: object, dailyStreak: number }} state
 */
export function getNextAchievementHint(state) {
  const unlocked = new Set(state.achievements || [])
  let best = null
  let bestPercent = -1

  for (const achievement of achievements) {
    if (unlocked.has(achievement.id)) continue
    const measured = measureAchievementProgress(achievement, state)
    if (!measured || measured.target <= 0) continue
    const percent = Math.min(100, Math.round((measured.current / measured.target) * 100))
    if (percent >= 100) continue
    if (percent > bestPercent) {
      bestPercent = percent
      best = {
        id: achievement.id,
        icon: achievement.icon,
        title: achievement.title,
        desc: achievement.desc,
        current: measured.current,
        target: measured.target,
        percent,
      }
    }
  }

  return best
}
