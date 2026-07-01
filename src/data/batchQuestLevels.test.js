import { describe, it, expect } from 'vitest'
import { oncallQuestLevels } from './oncallQuestLevels.js'
import { leadQuestLevels } from './leadQuestLevels.js'
import { apiAuthQuestLevels } from './apiAuthQuestLevels.js'
import { loadtestQuestLevels } from './loadtestQuestLevels.js'
import { appSmokeQuestLevels } from './appSmokeQuestLevels.js'
import { getSideLevel, isSideQuestUnlocked } from './sideQuests.js'

describe('oncallQuestLevels', () => {
  it('chains 172 → 173 → 174 → 175', () => {
    expect(oncallQuestLevels).toHaveLength(4)
    expect(getSideLevel(173)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 172 })
    expect(getSideLevel(175)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 174 })
  })

  it('unlocks first oncall level after mainline #45', () => {
    expect(isSideQuestUnlocked(getSideLevel(172), [45])).toBe(true)
    expect(isSideQuestUnlocked(getSideLevel(172), [44])).toBe(false)
  })
})

describe('leadQuestLevels', () => {
  it('chains 176 → 177 → 178 → 179', () => {
    expect(leadQuestLevels).toHaveLength(4)
    expect(getSideLevel(177)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 176 })
  })

  it('unlocks first lead level after mainline #47', () => {
    expect(isSideQuestUnlocked(getSideLevel(176), [47])).toBe(true)
    expect(isSideQuestUnlocked(getSideLevel(176), [46])).toBe(false)
  })
})

describe('apiAuthQuestLevels', () => {
  it('chains 180 → 181 → 182 → 183', () => {
    expect(apiAuthQuestLevels).toHaveLength(4)
    expect(getSideLevel(181)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 180 })
  })

  it('unlocks first apiauth level after mainline #32', () => {
    expect(isSideQuestUnlocked(getSideLevel(180), [32])).toBe(true)
    expect(isSideQuestUnlocked(getSideLevel(180), [31])).toBe(false)
  })
})

describe('loadtestQuestLevels', () => {
  it('chains 184 → 185 → 186', () => {
    expect(loadtestQuestLevels).toHaveLength(3)
    expect(getSideLevel(185)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 184 })
  })

  it('unlocks first loadtest level after mainline #48', () => {
    expect(isSideQuestUnlocked(getSideLevel(184), [48])).toBe(true)
    expect(isSideQuestUnlocked(getSideLevel(184), [47])).toBe(false)
  })
})

describe('appSmokeQuestLevels', () => {
  it('chains 187 → 188 → 189', () => {
    expect(appSmokeQuestLevels).toHaveLength(3)
    expect(getSideLevel(188)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 187 })
  })

  it('unlocks first app smoke level after mainline #34', () => {
    expect(isSideQuestUnlocked(getSideLevel(187), [34])).toBe(true)
    expect(isSideQuestUnlocked(getSideLevel(187), [33])).toBe(false)
  })
})

describe('sideLevels batch aggregate', () => {
  it('has 148 side quest levels through #248', () => {
    expect(getSideLevel(248)).toBeTruthy()
    expect(getSideLevel(249)).toBeNull()
  })
})
