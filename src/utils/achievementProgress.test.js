import { describe, it, expect } from 'vitest'
import { getNextAchievementHint, measureAchievementProgress } from './achievementProgress.js'
import { achievements } from '../data/achievements.js'

describe('measureAchievementProgress', () => {
  it('tracks star collector toward 60 stars', () => {
    const a = achievements.find((x) => x.id === 'star_collector')
    const m = measureAchievementProgress(a, {
      completedLevelIds: [1, 2],
      levelMeta: { 1: { stars: 3 }, 2: { stars: 2 } },
    })
    expect(m).toEqual({ current: 5, target: 60 })
  })
})

describe('getNextAchievementHint', () => {
  it('returns closest incomplete achievement', () => {
    const hint = getNextAchievementHint({
      achievements: [],
      completedLevelIds: [1],
      levelMeta: { 1: { stars: 2 } },
      levelMistakes: {},
      dailyStreak: 0,
    })
    expect(hint).toBeTruthy()
    expect(hint.percent).toBeGreaterThanOrEqual(0)
    expect(hint.target).toBeGreaterThan(hint.current)
  })

  it('returns null when all achievements unlocked', () => {
    const hint = getNextAchievementHint({
      achievements: achievements.map((a) => a.id),
      completedLevelIds: [],
      levelMeta: {},
      levelMistakes: {},
      dailyStreak: 0,
    })
    expect(hint).toBeNull()
  })
})
