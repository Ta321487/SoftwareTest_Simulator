import { describe, expect, it } from 'vitest'
import { getWeakAreas, getWeakSimTypeDrills } from './weakAreas'

describe('getWeakAreas', () => {
  it('returns empty when no weak signals', () => {
    expect(getWeakAreas({})).toEqual([])
  })

  it('prioritizes levels with mistakes', () => {
    const areas = getWeakAreas({
      levelMistakes: { 2: 3, 5: 1 },
      completedLevelIds: [2, 5],
    })
    expect(areas[0].levelId).toBe(2)
    expect(areas[0].reason).toBe('失误 3 次')
  })

  it('includes one-star completions and hint usage', () => {
    const areas = getWeakAreas({
      levelMeta: { 4: { stars: 1 } },
      hintsUsed: { 7: true },
      completedLevelIds: [4, 7],
    })
    expect(areas.map((a) => a.levelId).sort()).toEqual([4, 7])
  })

  it('reads hintsUsed from levelMeta when progress hintsUsed is empty', () => {
    const areas = getWeakAreas({
      levelMeta: { 12: { stars: 3, hintsUsed: true } },
      hintsUsed: {},
      completedLevelIds: [12],
    })
    expect(areas).toHaveLength(1)
    expect(areas[0].reason).toBe('用过提示')
  })
})

describe('getWeakSimTypeDrills', () => {
  it('groups weak levels by simType', () => {
    const drills = getWeakSimTypeDrills({
      levelMistakes: { 2: 2, 3: 1 },
      completedLevelIds: [2, 3],
    })
    expect(drills.length).toBeGreaterThan(0)
    expect(drills[0]).toHaveProperty('simType')
    expect(drills[0]).toHaveProperty('levelId')
  })
})
