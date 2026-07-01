import { describe, it, expect } from 'vitest'
import {
  isToolchainArc,
  isMindsetArc,
  isScenarioArc,
  getArcParentChapter,
  getToolchainLevelIds,
  getToolchainProgress,
} from './sideQuestChapters.js'

describe('sideQuestChapters', () => {
  it('classifies mindset, toolchain and scenario arcs', () => {
    expect(isToolchainArc('linux')).toBe(true)
    expect(isMindsetArc('security')).toBe(true)
    expect(isScenarioArc('refund')).toBe(true)
    expect(isScenarioArc('contract')).toBe(true)
    expect(isMindsetArc('boundary')).toBe(true)
    expect(isMindsetArc('autoroi')).toBe(true)
    expect(getArcParentChapter('sql')).toBe('toolchain')
    expect(getArcParentChapter('pipeline')).toBe('mindset')
    expect(getArcParentChapter('oncall')).toBe('scenario')
    expect(getArcParentChapter('uat')).toBe('scenario')
  })

  it('counts toolchain levels', () => {
    const levels = [
      { id: 124, sideArc: 'linux' },
      { id: 137, sideArc: 'sql' },
      { id: 101, sideArc: 'security' },
      { id: 154, sideArc: 'refund' },
    ]
    expect(getToolchainLevelIds(levels)).toEqual([124, 137])
    const progress = getToolchainProgress(levels, [124])
    expect(progress).toEqual({ done: 1, total: 2, levelIds: [124, 137] })
  })
})
