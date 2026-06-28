import { describe, it, expect } from 'vitest'
import {
  ONCALL_DOCK_ID,
  getOnCallMode,
  shouldShowInlineOnCall,
  shouldShowOnCallDock,
} from './onboardSut.js'

describe('onboardSut', () => {
  it('maps week2 levels to on-call modes', () => {
    expect(getOnCallMode(22)).toBe('prod-login')
    expect(getOnCallMode(23)).toBe('log-preview')
    expect(getOnCallMode(24)).toBe('release-board')
    expect(getOnCallMode(25)).toBe('month-wrap')
  })

  it('inline on levels 22 and 23', () => {
    expect(shouldShowInlineOnCall(22)).toBe(true)
    expect(shouldShowInlineOnCall(23)).toBe(true)
    expect(shouldShowInlineOnCall(24)).toBe(false)
  })

  it('dock from 22 through 25', () => {
    expect(shouldShowOnCallDock(21)).toBe(false)
    expect(shouldShowOnCallDock(22)).toBe(true)
    expect(shouldShowOnCallDock(25)).toBe(true)
  })

  it('uses dedicated dock id', () => {
    expect(ONCALL_DOCK_ID).toBe(904)
  })
})
