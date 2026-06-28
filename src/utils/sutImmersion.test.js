import { describe, it, expect } from 'vitest'
import {
  buildSutRoute,
  isSutModeRoute,
  getSutDockQuery,
  resolveSutEntry,
  getImmersionEntries,
} from './sutImmersion.js'

describe('sutImmersion', () => {
  it('builds sut route with dedicated path', () => {
    expect(buildSutRoute(3, 'app')).toEqual({
      name: 'LevelSut',
      params: { id: '3', dock: 'app' },
    })
  })

  it('detects sut mode from route name', () => {
    expect(isSutModeRoute({ name: 'LevelSut', params: { dock: 'app' } })).toBe(true)
    expect(isSutModeRoute({ name: 'LevelDetail', query: {} })).toBe(false)
  })

  it('resolves immersion entry by level and dock', () => {
    const route = { name: 'LevelSut', params: { id: '3', dock: 'app' }, query: {} }
    const entry = resolveSutEntry(route, 'login-module')
    expect(entry?.key).toBe('reproducedBug')
  })

  it('lists login module immersion entries', () => {
    expect(getImmersionEntries('login-module')).toHaveLength(2)
    expect(getSutDockQuery({ query: { dock: 'pay' } })).toBe('pay')
  })
})
