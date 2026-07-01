import { describe, it, expect } from 'vitest'
import { mindsetQuestLevels } from './mindsetQuestLevels.js'
import { getSideLevel } from './sideQuests.js'

describe('mindsetQuestLevels', () => {
  it('has 30 levels from #101 to #248', () => {
    expect(mindsetQuestLevels).toHaveLength(30)
    expect(mindsetQuestLevels[0].id).toBe(101)
    expect(mindsetQuestLevels.at(-1).id).toBe(248)
  })

  it('registers all mindset levels in sideQuests', () => {
    for (const level of mindsetQuestLevels) {
      expect(getSideLevel(level.id)).toEqual(level)
    }
  })
})
