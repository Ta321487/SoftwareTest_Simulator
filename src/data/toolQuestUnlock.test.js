import { describe, it, expect } from 'vitest'
import { getSideLevel, isSideQuestUnlocked, getUnlockHint } from './sideQuests.js'

describe('toolchain unlock chain', () => {
  it('git arc follows apm: #147 after #146, #148 after #147', () => {
    expect(getSideLevel(147).unlock).toEqual({ type: 'sideLevel', sideLevelId: 146 })
    expect(getSideLevel(148).unlock).toEqual({ type: 'sideLevel', sideLevelId: 147 })
    expect(getUnlockHint(getSideLevel(147))).toBe('完成番外 #146 后解锁')
  })

  it('async arc follows git: #149 after #148, #150 after #149', () => {
    expect(getSideLevel(149).unlock).toEqual({ type: 'sideLevel', sideLevelId: 148 })
    expect(getSideLevel(150).unlock).toEqual({ type: 'sideLevel', sideLevelId: 149 })
    expect(getUnlockHint(getSideLevel(149))).toBe('完成番外 #148 后解锁')
  })

  it('does not unlock git/mq levels from unrelated mainline progress', () => {
    const mainlineOnly = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    expect(isSideQuestUnlocked(getSideLevel(147), mainlineOnly)).toBe(false)
    expect(isSideQuestUnlocked(getSideLevel(149), mainlineOnly)).toBe(false)
  })

  it('unlocks when prior side level in chain is completed', () => {
    expect(isSideQuestUnlocked(getSideLevel(147), [146])).toBe(true)
    expect(isSideQuestUnlocked(getSideLevel(149), [148])).toBe(true)
  })

  it('git and async arcs chain via immediate sideLevel predecessor', () => {
    for (const [id, prev] of [
      [147, 146],
      [148, 147],
      [149, 148],
      [150, 149],
    ]) {
      const level = getSideLevel(id)
      expect(level.unlock, `#${id}`).toEqual({ type: 'sideLevel', sideLevelId: prev })
    }
  })
})
