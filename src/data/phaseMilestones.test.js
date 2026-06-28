import { describe, it, expect } from 'vitest'
import { getPhaseMilestoneForLevel, isPhaseFinaleLevel } from '../data/phaseMilestones.js'

describe('phaseMilestones', () => {
  it('detects phase finale level', () => {
    expect(isPhaseFinaleLevel('prepare', 17)).toBe(true)
    expect(isPhaseFinaleLevel('prepare', 5)).toBe(false)
  })

  it('returns milestone for last level in phase', () => {
    const m = getPhaseMilestoneForLevel(17)
    expect(m?.title).toContain('备考')
  })

  it('returns null for non-finale level', () => {
    expect(getPhaseMilestoneForLevel(3)).toBeNull()
  })
})
