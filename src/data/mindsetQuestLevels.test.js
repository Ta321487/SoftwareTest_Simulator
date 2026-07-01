import { describe, it, expect } from 'vitest'
import { mindsetQuestLevels } from './mindsetQuestLevels.js'
import { getSideLevel } from './sideQuests.js'

describe('mindsetQuestLevels', () => {
  it('has 23 levels from #101 to #123', () => {
    expect(mindsetQuestLevels).toHaveLength(23)
    expect(mindsetQuestLevels[0].id).toBe(101)
    expect(mindsetQuestLevels.at(-1).id).toBe(123)
  })

  it('registers all mindset levels in sideQuests', () => {
    for (const level of mindsetQuestLevels) {
      expect(getSideLevel(level.id)).toEqual(level)
    }
  })
})
