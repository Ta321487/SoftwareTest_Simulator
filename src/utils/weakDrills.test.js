import { describe, it, expect } from 'vitest'
import { buildWeakDrillCards, getLearningPathForLevel, getLowStarLevels } from './weakDrills.js'

describe('weakDrills', () => {
  it('builds drill cards from weak areas', () => {
    const cards = buildWeakDrillCards({
      levelMistakes: { 3: 2 },
      levelMeta: { 3: { stars: 1 } },
      hintsUsed: {},
      completedLevelIds: [1, 2, 3],
    })
    expect(cards.length).toBeGreaterThan(0)
    expect(cards[0].simLabel).toBeTruthy()
    expect(cards[0].retryLevelId).toBe(3)
  })

  it('returns learning path with handbook links for level 3', () => {
    const path = getLearningPathForLevel(3, [1, 2, 3])
    expect(path?.levelId).toBe(3)
  })

  it('lists low star completed levels', () => {
    const rows = getLowStarLevels({ 5: { stars: 1 }, 6: { stars: 3 } }, [5, 6])
    expect(rows).toHaveLength(1)
    expect(rows[0].levelId).toBe(5)
  })
})
