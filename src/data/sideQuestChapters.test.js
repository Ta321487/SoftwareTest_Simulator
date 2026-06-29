import { describe, it, expect } from 'vitest'
import {
  isToolchainArc,
  getArcParentChapter,
  getToolchainLevelIds,
  getToolchainProgress,
} from './sideQuestChapters.js'

describe('sideQuestChapters', () => {
  it('classifies toolchain arcs', () => {
    expect(isToolchainArc('linux')).toBe(true)
    expect(isToolchainArc('security')).toBe(false)
    expect(getArcParentChapter('sql')).toBe('toolchain')
    expect(getArcParentChapter('pipeline')).toBe('mindset')
  })

  it('counts toolchain levels', () => {
    const levels = [
      { id: 124, sideArc: 'linux' },
      { id: 137, sideArc: 'sql' },
      { id: 101, sideArc: 'security' },
    ]
    expect(getToolchainLevelIds(levels)).toEqual([124, 137])
    const progress = getToolchainProgress(levels, [124])
    expect(progress).toEqual({ done: 1, total: 2, levelIds: [124, 137] })
  })
})
