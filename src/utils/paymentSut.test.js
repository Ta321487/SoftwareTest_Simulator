import { describe, it, expect } from 'vitest'
import {
  PAYMENT_SUT_DOCK_ID,
  getPaymentScenario,
  shouldShowInlinePaymentSut,
  shouldShowPaymentAppDock,
} from './paymentSut.js'

describe('paymentSut', () => {
  const emptyStore = {
    getPaymentSut: () => ({}),
    hasArtifact: () => false,
  }
  const progressDone6 = { completedLevelIds: [6] }

  it('shows no-db before level 6 complete', () => {
    expect(getPaymentScenario(7, emptyStore, { completedLevelIds: [] })).toBe('no-db')
  })

  it('shows callback-bug on level 7 when db ready', () => {
    expect(getPaymentScenario(7, emptyStore, progressDone6)).toBe('callback-bug')
  })

  it('shows pay-error on level 8 when db ready', () => {
    expect(getPaymentScenario(8, emptyStore, progressDone6)).toBe('pay-error')
  })

  it('shows fixed on level 9+', () => {
    expect(getPaymentScenario(9, emptyStore, progressDone6)).toBe('fixed')
    expect(getPaymentScenario(10, emptyStore, progressDone6)).toBe('fixed')
  })

  it('inline mock on levels 6–8', () => {
    expect(shouldShowInlinePaymentSut(6)).toBe(true)
    expect(shouldShowInlinePaymentSut(8)).toBe(true)
    expect(shouldShowInlinePaymentSut(9)).toBe(false)
  })

  it('dock from level 6 through 10', () => {
    expect(shouldShowPaymentAppDock(5)).toBe(false)
    expect(shouldShowPaymentAppDock(6)).toBe(true)
    expect(shouldShowPaymentAppDock(10)).toBe(true)
  })

  it('uses dedicated dock id', () => {
    expect(PAYMENT_SUT_DOCK_ID).toBe(902)
  })
})
