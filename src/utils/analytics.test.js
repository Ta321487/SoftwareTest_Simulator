import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hasMeaningfulProgress } from './storageBackup.js'

describe('storageBackup', () => {
  it('detects meaningful progress', () => {
    expect(hasMeaningfulProgress(null)).toBe(false)
    expect(hasMeaningfulProgress({ completedLevelIds: [] })).toBe(false)
    expect(hasMeaningfulProgress({ completedLevelIds: [1] })).toBe(true)
  })
})

describe('analytics', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  it('logs events in dev mode', async () => {
    const { trackEvent } = await import('./analytics.js')
    trackEvent('level_start', { levelId: 1 })
    expect(console.debug).toHaveBeenCalled()
  })
})
