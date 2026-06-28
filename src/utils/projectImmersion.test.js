import { describe, it, expect } from 'vitest'
import { getProjectImmersion, HOME_PROJECT_IDS } from './projectImmersion.js'

describe('projectImmersion', () => {
  const store = {
    getLoginSut: () => ({ reproducedBug: true, verifiedFix: false }),
    getPaymentSut: () => ({}),
    getOrderSut: () => ({}),
    getOnboardSut: () => ({}),
  }

  it('counts login module immersion items', () => {
    const immersion = getProjectImmersion('login-module', store)
    expect(immersion.total).toBe(2)
    expect(immersion.done).toBe(1)
    expect(immersion.label).toContain('1/2')
  })

  it('shows hint when no immersion done', () => {
    const immersion = getProjectImmersion('payment-module', store)
    expect(immersion.done).toBe(0)
    expect(immersion.label).toContain('可选')
  })

  it('includes season2-lead on home with no immersion entries', () => {
    expect(HOME_PROJECT_IDS).toContain('season2-lead')
    const immersion = getProjectImmersion('season2-lead', store)
    expect(immersion.total).toBe(0)
    expect(immersion.entries).toEqual([])
  })
})
