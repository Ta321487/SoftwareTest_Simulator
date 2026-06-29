import { describe, expect, it } from 'vitest'
import { getSeasonMeta } from './seasonMeta'

describe('seasonMeta', () => {
  it('returns label for known seasons', () => {
    expect(getSeasonMeta('bronze')?.label).toBe('青铜')
    expect(getSeasonMeta('platinum')?.className).toBe('season-platinum')
  })

  it('returns null for unknown season', () => {
    expect(getSeasonMeta('extra')).toBeNull()
  })
})
