import { describe, it, expect } from 'vitest'
import { smsQuestLevels } from './smsQuestLevels.js'
import { grayReleaseQuestLevels } from './grayReleaseQuestLevels.js'
import { callbackQuestLevels } from './callbackQuestLevels.js'
import { orderStuckQuestLevels } from './orderStuckQuestLevels.js'
import { getSideLevel, isSideQuestUnlocked } from './sideQuests.js'

describe('smsQuestLevels', () => {
  it('chains 158 → 159 → 160 → 161', () => {
    expect(smsQuestLevels).toHaveLength(4)
    expect(getSideLevel(159)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 158 })
    expect(getSideLevel(161)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 160 })
  })

  it('unlocks first SMS level after mainline #50', () => {
    const l158 = getSideLevel(158)
    expect(isSideQuestUnlocked(l158, [50])).toBe(true)
    expect(isSideQuestUnlocked(l158, [49])).toBe(false)
  })
})

describe('grayReleaseQuestLevels', () => {
  it('chains 162 → 163 → 164', () => {
    expect(grayReleaseQuestLevels).toHaveLength(3)
    expect(getSideLevel(163)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 162 })
    expect(getSideLevel(164)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 163 })
  })

  it('unlocks first gray level after mainline #51', () => {
    const l162 = getSideLevel(162)
    expect(isSideQuestUnlocked(l162, [51])).toBe(true)
    expect(isSideQuestUnlocked(l162, [50])).toBe(false)
  })
})

describe('callbackQuestLevels', () => {
  it('chains 165 → 166 → 167', () => {
    expect(callbackQuestLevels).toHaveLength(3)
    expect(getSideLevel(166)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 165 })
    expect(getSideLevel(167)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 166 })
  })

  it('unlocks first callback level after mainline #31', () => {
    const l165 = getSideLevel(165)
    expect(isSideQuestUnlocked(l165, [31])).toBe(true)
    expect(isSideQuestUnlocked(l165, [30])).toBe(false)
  })
})

describe('orderStuckQuestLevels', () => {
  it('chains 168 → 169 → 170 → 171', () => {
    expect(orderStuckQuestLevels).toHaveLength(4)
    expect(getSideLevel(169)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 168 })
    expect(getSideLevel(171)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 170 })
  })

  it('unlocks first order-stuck level after mainline #43', () => {
    const l168 = getSideLevel(168)
    expect(isSideQuestUnlocked(l168, [43])).toBe(true)
    expect(isSideQuestUnlocked(l168, [42])).toBe(false)
  })
})

describe('sideLevels aggregate', () => {
  it('has 148 side quest levels (#101–#248)', () => {
    expect(getSideLevel(101)).toBeTruthy()
    expect(getSideLevel(248)).toBeTruthy()
    expect(getSideLevel(249)).toBeNull()
  })
})
