import { describe, it, expect, beforeEach } from 'vitest'
import { recordRecentTerm, getRecentTermIds, clearRecentTerms } from './handbookRecent.js'

describe('handbookRecent', () => {
  beforeEach(() => {
    clearRecentTerms()
  })

  it('records and dedupes recent terms', () => {
    recordRecentTerm('blocker')
    recordRecentTerm('regression')
    recordRecentTerm('blocker')
    expect(getRecentTermIds()).toEqual(['blocker', 'regression'])
  })

  it('keeps at most 5 entries', () => {
    ;['a', 'b', 'c', 'd', 'e', 'f'].forEach(recordRecentTerm)
    expect(getRecentTermIds()).toHaveLength(5)
    expect(getRecentTermIds()[0]).toBe('f')
  })
})
