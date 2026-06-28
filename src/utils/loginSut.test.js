import { describe, it, expect } from 'vitest'
import {
  LOGIN_SUT_DOCK_ID,
  getLoginBuildVersion,
  shouldShowInlineLoginSut,
  shouldShowLoginAppDock,
} from './loginSut.js'

describe('loginSut', () => {
  it('uses buggy build on Day 1–3', () => {
    expect(getLoginBuildVersion(1)).toBe('buggy')
    expect(getLoginBuildVersion(3)).toBe('buggy')
  })

  it('uses fixed build on Day 4–5', () => {
    expect(getLoginBuildVersion(4)).toBe('fixed')
    expect(getLoginBuildVersion(5)).toBe('fixed')
  })

  it('shows inline mock on levels 3 and 4 only', () => {
    expect(shouldShowInlineLoginSut(3)).toBe(true)
    expect(shouldShowInlineLoginSut(4)).toBe(true)
    expect(shouldShowInlineLoginSut(5)).toBe(false)
  })

  it('shows app dock from level 3 through 5', () => {
    expect(shouldShowLoginAppDock(2)).toBe(false)
    expect(shouldShowLoginAppDock(3)).toBe(true)
    expect(shouldShowLoginAppDock(5)).toBe(true)
    expect(shouldShowLoginAppDock(6)).toBe(false)
  })

  it('uses dedicated dock id for login app', () => {
    expect(LOGIN_SUT_DOCK_ID).toBeGreaterThan(100)
  })
})
