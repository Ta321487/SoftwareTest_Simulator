import { describe, it, expect } from 'vitest'
import {
  shouldRecordMistake,
  computeArtifactQuality,
  applyConsequences,
  getPassDebriefNote,
} from '../data/consequences.js'

describe('consequences', () => {
  it('shouldRecordMistake covers decision sim types', () => {
    expect(shouldRecordMistake('report')).toBe(true)
    expect(shouldRecordMistake('calculator')).toBe(false)
  })

  it('computeArtifactQuality tiers by attempts and mistakes', () => {
    expect(computeArtifactQuality(1, false, 0)).toBe('excellent')
    expect(computeArtifactQuality(2, false, 0)).toBe('good')
    expect(computeArtifactQuality(1, false, 1)).toBe('rough')
    expect(computeArtifactQuality(1, false, 0, 'draft')).toBe('rough')
  })

  it('level 5 gets regression inbox when level 4 had mistakes', () => {
    const progressStore = { getLevelMistakes: (id) => (id === 4 ? 2 : 0) }
    const { inbox } = applyConsequences(5, {
      progressStore,
      projectStore: { hasArtifact: () => false },
    })
    expect(inbox.some((m) => m.id === 'regression-miss')).toBe(true)
  })

  it('getPassDebriefNote for clean login finale', () => {
    const progressStore = { getLevelMistakes: () => 0 }
    expect(getPassDebriefNote(5, progressStore)).toContain('收官')
  })
})
