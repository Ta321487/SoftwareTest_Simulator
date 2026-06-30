import { describe, expect, it } from 'vitest'
import { resolveNavActive, HOME_HASH_TO_TAB } from './appNavigation.js'

describe('appNavigation', () => {
  it('maps home hashes to tabs', () => {
    expect(HOME_HASH_TO_TAB['']).toBe('quest')
    expect(HOME_HASH_TO_TAB['#home-side']).toBe('side')
    expect(HOME_HASH_TO_TAB['#home-career']).toBe('quest')
  })

  it('highlights home section from hash', () => {
    const side = { id: 'side', kind: 'section', section: 'home-side' }
    expect(
      resolveNavActive(side, {
        route: { path: '/', hash: '#home-side' },
        current: 'home',
        activeLevelId: null,
        highlightMainTask: true,
        mainLevelId: 1,
      })
    ).toBe(true)
  })
})
