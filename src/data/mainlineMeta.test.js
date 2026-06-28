import { describe, it, expect } from 'vitest'
import {
  SEASON1_LEVEL_IDS,
  SEASON2_LEVEL_IDS,
  TOTAL_MAIN_LEVELS,
  countMainlineCompleted,
  isSeason1Complete,
  isSeason2Complete,
} from './mainlineMeta.js'

describe('mainlineMeta', () => {
  it('defines 27 season1 and 6 season2 levels totaling 33', () => {
    expect(SEASON1_LEVEL_IDS).toHaveLength(27)
    expect(SEASON2_LEVEL_IDS).toHaveLength(6)
    expect(SEASON2_LEVEL_IDS[0]).toBe(28)
    expect(TOTAL_MAIN_LEVELS).toBe(33)
  })

  it('counts only levelOrder ids as mainline completed', () => {
    expect(countMainlineCompleted([1, 2, 101])).toBe(2)
    expect(countMainlineCompleted([1, 2, 99])).toBe(2)
  })

  it('detects season1 complete when all 27 ids done', () => {
    expect(isSeason1Complete(SEASON1_LEVEL_IDS)).toBe(true)
    expect(isSeason1Complete(SEASON1_LEVEL_IDS.slice(0, 26))).toBe(false)
  })

  it('detects season2 complete', () => {
    expect(isSeason2Complete(SEASON2_LEVEL_IDS)).toBe(true)
    expect(isSeason2Complete([28, 29])).toBe(false)
  })
})
