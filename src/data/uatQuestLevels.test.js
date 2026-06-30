import { describe, it, expect } from 'vitest'
import { uatQuestLevels } from './uatQuestLevels.js'
import { getSideLevel, isSideQuestUnlocked } from './sideQuests.js'

describe('uatQuestLevels', () => {
  it('chains 151 → 152 → 153', () => {
    expect(uatQuestLevels).toHaveLength(3)
    expect(getSideLevel(152)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 151 })
    expect(getSideLevel(153)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 152 })
  })

  it('unlocks first UAT level after mainline Go/No-Go', () => {
    const l151 = getSideLevel(151)
    expect(isSideQuestUnlocked(l151, [33])).toBe(true)
    expect(isSideQuestUnlocked(l151, [32])).toBe(false)
  })
})
