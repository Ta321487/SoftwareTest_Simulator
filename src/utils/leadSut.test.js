import { describe, it, expect } from 'vitest'
import {
  getLeadMode,
  shouldShowLeadDock,
  getLeadSutLead,
  isSeason2LeadProject,
  SEASON2_LEAD_ID,
} from './leadSut.js'

describe('leadSut', () => {
  it('identifies season2 lead project', () => {
    expect(isSeason2LeadProject({ id: SEASON2_LEAD_ID })).toBe(true)
    expect(isSeason2LeadProject({ id: 'login-module' })).toBe(false)
  })

  it('maps lead levels to panel modes', () => {
    expect(getLeadMode(33)).toBe('gonogo')
    expect(getLeadMode(47)).toBe('roster')
    expect(getLeadMode(48)).toBe('loadtest')
  })

  it('shows lead dock only on SUT levels', () => {
    expect(shouldShowLeadDock(33)).toBe(true)
    expect(shouldShowLeadDock(47)).toBe(true)
    expect(shouldShowLeadDock(48)).toBe(true)
    expect(shouldShowLeadDock(28)).toBe(false)
  })

  it('provides guidance per level', () => {
    expect(getLeadSutLead(33)).toMatch(/No-Go|错误率/)
    expect(getLeadSutLead(47)).toMatch(/分派|交付/)
    expect(getLeadSutLead(48)).toMatch(/压测|超时/)
  })
})
