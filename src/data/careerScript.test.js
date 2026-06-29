import { describe, it, expect } from 'vitest'
import {
  careerChapters,
  getChapterLevelIds,
  getChapterProgress,
  findChapterForLevel,
  findActiveChapter,
  getWorkBrief,
  isChapterLocked,
} from './careerScript.js'
import { SEASON1_LEVEL_IDS } from './mainlineMeta.js'

describe('careerScript', () => {
  it('covers all 48 mainline levels across chapters', () => {
    const ids = careerChapters.flatMap(getChapterLevelIds)
    expect(ids).toHaveLength(48)
    expect(new Set(ids).size).toBe(48)
  })

  it('tracks chapter progress', () => {
    const ch1 = careerChapters[0]
    expect(getChapterProgress(ch1, [1, 2])).toEqual({ done: 2, total: 7 })
  })

  it('finds chapter for interlude levels', () => {
    expect(findChapterForLevel(16)?.id).toBe('skills-drill')
    expect(findChapterForLevel(6)?.id).toBe('job-hunt')
  })

  it('locks lead chapter until season1 complete', () => {
    const lead = careerChapters.find((c) => c.id === 'lead-track')
    expect(isChapterLocked(lead, [1])).toBe(true)
    expect(isChapterLocked(lead, SEASON1_LEVEL_IDS)).toBe(false)
  })

  it('finds active chapter from progress', () => {
    expect(findActiveChapter([1, 2, 3, 4, 5, 34, 35]).id).toBe('skills-drill')
  })

  it('builds work brief for next task', () => {
    const brief = getWorkBrief({
      firstAvailableLevelId: 2,
      completedLevelIds: [1],
      getStatus: (id) => (id === 2 ? 'available' : 'completed'),
    })
    expect(brief.complete).toBe(false)
    expect(brief.chapterTitle).toContain('新人培训营')
    expect(brief.title).toContain('测试用例')
  })
})
