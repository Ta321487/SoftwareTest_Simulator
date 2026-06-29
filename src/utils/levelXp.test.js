import { describe, expect, it } from 'vitest'
import { getLevelXpPreview } from './levelXp'

describe('getLevelXpPreview', () => {
  it('computes max total with 3-star bonus', () => {
    const preview = getLevelXpPreview(20, 0)
    expect(preview.base).toBe(20)
    expect(preview.maxBonus).toBe(6)
    expect(preview.maxTotal).toBe(26)
    expect(preview.canImprove).toBe(true)
  })

  it('marks no improve when already 3 stars', () => {
    const preview = getLevelXpPreview(20, 3)
    expect(preview.canImprove).toBe(false)
  })
})
