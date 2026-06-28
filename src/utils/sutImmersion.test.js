import { describe, it, expect, vi } from 'vitest'
import {
  buildSutRoute,
  isSutModeRoute,
  getSutDockQuery,
  resolveSutEntry,
  getImmersionEntries,
  getCompletedStepCount,
  setImmersionStepProgress,
  getImmersionStepsProgress,
  initPassiveSutStep,
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

  it('tracks step progress and completes on final step', () => {
    const entry = getImmersionEntries('login-module')[0]
    const store = {
      getLoginSut: vi.fn(() => ({})),
      patchLoginSut: vi.fn(),
    }

    initPassiveSutStep(entry, store, 'login-module')
    expect(store.patchLoginSut).toHaveBeenCalledWith('login-module', {
      _stepProgress: { reproducedBug: 1 },
    })

    store.getLoginSut.mockReturnValue({ _stepProgress: { reproducedBug: 1 } })
    setImmersionStepProgress(entry, store, 'login-module', 2)
    expect(store.patchLoginSut).toHaveBeenLastCalledWith('login-module', {
      _stepProgress: { reproducedBug: 2 },
    })

    store.getLoginSut.mockReturnValue({ _stepProgress: { reproducedBug: 2 } })
    setImmersionStepProgress(entry, store, 'login-module', 3)
    expect(store.patchLoginSut).toHaveBeenLastCalledWith('login-module', {
      _stepProgress: { reproducedBug: 3 },
      reproducedBug: true,
    })
  })

  it('falls back to legacy boolean for step display', () => {
    const entry = getImmersionEntries('login-module')[0]
    const store = {
      getLoginSut: () => ({ reproducedBug: true }),
    }
    expect(getCompletedStepCount(entry, store, 'login-module')).toBe(3)
    const steps = getImmersionStepsProgress(entry, store, 'login-module')
    expect(steps.every((s) => s.done)).toBe(true)
  })
})
