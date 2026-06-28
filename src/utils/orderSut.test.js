import { describe, it, expect } from 'vitest'
import {
  ORDER_OBS_DOCK_ID,
  getOrderObsMode,
  shouldShowInlineOrderObs,
  shouldShowOrderObsDock,
} from './orderSut.js'

describe('orderSut', () => {
  it('maps levels to observability modes', () => {
    expect(getOrderObsMode(12)).toBe('apm')
    expect(getOrderObsMode(14)).toBe('monitor')
    expect(getOrderObsMode(15)).toBe('incident')
    expect(getOrderObsMode(13)).toBe('overview')
  })

  it('inline on levels 12 and 14', () => {
    expect(shouldShowInlineOrderObs(12)).toBe(true)
    expect(shouldShowInlineOrderObs(14)).toBe(true)
    expect(shouldShowInlineOrderObs(13)).toBe(false)
  })

  it('dock from 12 through 15', () => {
    expect(shouldShowOrderObsDock(11)).toBe(false)
    expect(shouldShowOrderObsDock(12)).toBe(true)
    expect(shouldShowOrderObsDock(15)).toBe(true)
  })

  it('uses dedicated dock id', () => {
    expect(ORDER_OBS_DOCK_ID).toBe(903)
  })
})
