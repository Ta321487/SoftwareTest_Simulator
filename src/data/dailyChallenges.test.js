import { describe, it, expect } from 'vitest'
import {
  DAILY_POOL,
  DAILY_POOL_SIZE,
  DAILY_NO_REPEAT_DAYS,
  getDailyIndex,
  getTodayDailyChallenge,
  getDailyFocusHint,
  shiftDateStr,
} from './dailyChallenges.js'

describe('dailyChallenges pool', () => {
  it('has at least 50 questions', () => {
    expect(DAILY_POOL_SIZE).toBeGreaterThanOrEqual(50)
    expect(DAILY_POOL.length).toBe(DAILY_POOL_SIZE)
  })

  it('uses unique keys across the pool', () => {
    const keys = DAILY_POOL.map((d) => d.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('includes mixed simulator types', () => {
    const types = new Set(DAILY_POOL.map((d) => d.simType))
    expect(types.has('jira')).toBe(true)
    expect(types.has('apiclient')).toBe(true)
    expect(types.has('packet')).toBe(true)
    expect(types.has('config')).toBe(true)
  })
})

describe('getDailyIndex no-repeat window', () => {
  it('avoids repeating the same key within 7 days when pool is large enough', () => {
    const start = '2026-06-01'
    for (let i = 0; i < 14; i++) {
      const dateStr = shiftDateStr(start, i)
      const idx = getDailyIndex(dateStr)
      const key = DAILY_POOL[idx].key
      for (let j = 1; j <= DAILY_NO_REPEAT_DAYS; j++) {
        const prevIdx = getDailyIndex(shiftDateStr(dateStr, -j))
        expect(DAILY_POOL[prevIdx].key).not.toBe(key)
      }
    }
  }, 15000)
})

describe('getDailyFocusHint', () => {
  it('returns first clause of hint without leaking full answer', () => {
    const challenge = getTodayDailyChallenge('2026-06-15')
    const focus = getDailyFocusHint(challenge)
    expect(focus.length).toBeGreaterThan(0)
    expect(focus.length).toBeLessThanOrEqual(52)
  })
})
