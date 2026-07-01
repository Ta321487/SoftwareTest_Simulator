import { describe, it, expect } from 'vitest'
import { exploreQuestLevels } from './exploreQuestLevels.js'
import { testReportQuestLevels } from './testReportQuestLevels.js'
import { configDriftQuestLevels } from './configDriftQuestLevels.js'
import { flakyQuestLevels } from './flakyQuestLevels.js'
import { reqChangeQuestLevels } from './reqChangeQuestLevels.js'
import { weaknetQuestLevels } from './weaknetQuestLevels.js'
import { datamaskQuestLevels } from './datamaskQuestLevels.js'
import { i18nQuestLevels } from './i18nQuestLevels.js'
import { analyticsQuestLevels } from './analyticsQuestLevels.js'
import { contractQuestLevels } from './contractQuestLevels.js'
import { autoRoiQuestLevels } from './autoRoiQuestLevels.js'
import { boundaryQuestLevels } from './boundaryQuestLevels.js'
import { toolQuestLevels } from './toolQuestLevels.js'
import { mindsetQuestLevels } from './mindsetQuestLevels.js'
import { getSideLevel, isSideQuestUnlocked, sideLevels, isSideQuestId } from './sideQuests.js'

function expectChain3(levels, startUnlock) {
  expect(levels).toHaveLength(3)
  const [first, second, third] = levels
  expect(first.unlock).toEqual(startUnlock)
  expect(second.unlock).toEqual({ type: 'sideLevel', sideLevelId: first.id })
  expect(third.unlock).toEqual({ type: 'sideLevel', sideLevelId: second.id })
}

function expectChain(levels, startUnlock) {
  expect(levels).toHaveLength(4)
  const [first, second, third, fourth] = levels
  expect(first.unlock).toEqual(startUnlock)
  expect(second.unlock).toEqual({ type: 'sideLevel', sideLevelId: first.id })
  expect(third.unlock).toEqual({ type: 'sideLevel', sideLevelId: second.id })
  expect(fourth.unlock).toEqual({ type: 'sideLevel', sideLevelId: third.id })
}

describe('supplement side quest arcs', () => {
  it('registers 148 side quest levels (#101–#248)', () => {
    expect(sideLevels.length).toBe(148)
    expect(getSideLevel(248)).toBeTruthy()
    expect(getSideLevel(249)).toBeNull()
  })

  it('explore chain unlocks after mainline #2', () => {
    expectChain(exploreQuestLevels, { type: 'level', levelId: 2 })
    expect(isSideQuestUnlocked(getSideLevel(190), [2])).toBe(true)
    expect(isSideQuestUnlocked(getSideLevel(190), [1])).toBe(false)
  })

  it('test report chain unlocks after mainline #10', () => {
    expectChain(testReportQuestLevels, { type: 'level', levelId: 10 })
  })

  it('config drift chain unlocks after mainline #6', () => {
    expectChain(configDriftQuestLevels, { type: 'level', levelId: 6 })
  })

  it('flaky chain unlocks after mainline #13', () => {
    expectChain(flakyQuestLevels, { type: 'level', levelId: 13 })
  })

  it('req change chain unlocks after mainline #1', () => {
    expectChain(reqChangeQuestLevels, { type: 'level', levelId: 1 })
  })

  it('weaknet chain unlocks after mainline #34', () => {
    expectChain(weaknetQuestLevels, { type: 'level', levelId: 34 })
  })

  it('datamask chain unlocks after side #116', () => {
    expectChain(datamaskQuestLevels, { type: 'sideLevel', sideLevelId: 116 })
  })

  it('i18n chain unlocks after mainline #44', () => {
    expectChain(i18nQuestLevels, { type: 'level', levelId: 44 })
  })

  it('analytics chain unlocks after mainline #14', () => {
    expectChain(analyticsQuestLevels, { type: 'level', levelId: 14 })
  })

  it('toolchain 3rd levels chain from prior arc ends', () => {
    expect(getSideLevel(226)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 138 })
    expect(getSideLevel(227)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 140 })
    expect(getSideLevel(228)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 142 })
    expect(getSideLevel(229)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 144 })
    expect(getSideLevel(230)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 146 })
    expect(getSideLevel(231)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 148 })
    expect(getSideLevel(232)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 150 })
    expect(toolQuestLevels.filter((l) => l.id >= 226)).toHaveLength(7)
  })

  it('contract short chain unlocks after mainline #26', () => {
    expectChain3(contractQuestLevels, { type: 'level', levelId: 26 })
    expect(isSideQuestUnlocked(getSideLevel(233), [26])).toBe(true)
  })

  it('autoroi short chain unlocks after side #109', () => {
    expectChain3(autoRoiQuestLevels, { type: 'sideLevel', sideLevelId: 109 })
  })

  it('boundary short chain unlocks after mainline #17', () => {
    expectChain3(boundaryQuestLevels, { type: 'level', levelId: 17 })
  })

  it('mindset thin arcs补全为 3 关链', () => {
    const arcIds = ['automation', 'api', 'performance', 'pipeline', 'monitor']
    for (const arcId of arcIds) {
      const levels = mindsetQuestLevels.filter((l) => l.sideArc === arcId)
      expect(levels).toHaveLength(3)
    }
    expect(getSideLevel(242)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 109 })
    expect(getSideLevel(243)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 242 })
    expect(getSideLevel(244)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 120 })
    expect(getSideLevel(246)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 122 })
    expect(getSideLevel(247)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 119 })
    expect(getSideLevel(248)?.unlock).toEqual({ type: 'sideLevel', sideLevelId: 115 })
  })
})
