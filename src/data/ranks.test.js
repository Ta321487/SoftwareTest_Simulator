import { describe, it, expect } from 'vitest'
import { getRankForXp, getNextRank, getRankProgress } from '../data/ranks.js'

describe('getRankProgress', () => {
  it('returns percent and xpToNext toward next rank', () => {
    const p = getRankProgress(50)
    expect(p.current.title).toBe('备考萌新')
    expect(p.next?.title).toBe('刷题党')
    expect(p.percent).toBeGreaterThan(0)
    expect(p.xpToNext).toBe(15)
  })

  it('returns 100% when at max rank', () => {
    const p = getRankProgress(9999)
    expect(p.next).toBeNull()
    expect(p.percent).toBe(100)
    expect(p.xpToNext).toBe(0)
  })
})

describe('getNextRank', () => {
  it('returns next tier after current', () => {
    expect(getNextRank(10)?.title).toBe('刷题党')
    expect(getRankForXp(850).title).toBe('质量负责人')
    expect(getNextRank(850)).toBeNull()
  })
})
