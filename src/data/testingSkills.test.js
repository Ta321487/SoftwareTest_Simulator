import { describe, it, expect } from 'vitest'
import {
  levelSkillEntries,
  MAINLINE_SKILL_COUNT,
  getSkillForLevel,
  getSpiralNote,
  getUnlockedSkills,
  getSkillProgress,
  getSkillsByCategory,
} from './testingSkills.js'
import { levelOrder } from './levels.js'

describe('testingSkills', () => {
  it('maps every mainline level to a skill', () => {
    const mapped = new Set(levelSkillEntries.map((e) => e.levelId))
    for (const id of levelOrder) {
      expect(mapped.has(id), `level ${id}`).toBe(true)
    }
    expect(levelSkillEntries).toHaveLength(48)
  })

  it('resolves skill for level with spiral note', () => {
    const skill = getSkillForLevel(26)
    expect(skill?.label).toContain('断言')
    expect(skill?.spiralFrom).toBe(16)
    expect(getSpiralNote(26)).toContain('第 16 关')
  })

  it('tracks unique unlocked skills', () => {
    const progress = getSkillProgress([1, 2, 3, 34, 35])
    expect(progress.done).toBe(3)
    expect(progress.total).toBe(MAINLINE_SKILL_COUNT)
    expect(getUnlockedSkills([1, 34]).map((s) => s.id)).toEqual(['prd-testpoints'])
  })

  it('groups skills by category with lock state', () => {
    const groups = getSkillsByCategory([3])
    const defect = groups.find((g) => g.id === 'defect')
    expect(defect?.done).toBe(1)
    const bug = defect?.skills.find((s) => s.id === 'bug-report')
    expect(bug?.unlocked).toBe(true)
    expect(defect?.skills.find((s) => s.id === 'bug-review')?.unlocked).toBe(false)
  })
})
