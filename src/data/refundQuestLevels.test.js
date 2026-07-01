import { describe, it, expect } from 'vitest'
import { refundQuestLevels } from './refundQuestLevels.js'
import { getSideLevel, isSideQuestUnlocked } from './sideQuests.js'

describe('refundQuestLevels', () => {
  it('chains 154 → 155 → 156 → 157', () => {
    expect(refundQuestLevels).toHaveLength(4)
    expect(getSideLevel(155)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 154 })
    expect(getSideLevel(156)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 155 })
    expect(getSideLevel(157)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 156 })
  })

  it('unlocks first refund level after mainline #49', () => {
    const l154 = getSideLevel(154)
    expect(isSideQuestUnlocked(l154, [49])).toBe(true)
    expect(isSideQuestUnlocked(l154, [48])).toBe(false)
  })
})
