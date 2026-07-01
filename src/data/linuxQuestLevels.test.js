import { describe, it, expect } from 'vitest'
import { linuxQuestLevels } from './linuxQuestLevels.js'
import { getSideLevel } from './sideQuests.js'

describe('linuxQuestLevels', () => {
  it('has 13 levels from #124 to #136', () => {
    expect(linuxQuestLevels).toHaveLength(13)
    expect(linuxQuestLevels[0].id).toBe(124)
    expect(linuxQuestLevels.at(-1).id).toBe(136)
  })

  it('registers all linux levels in sideQuests', () => {
    for (const level of linuxQuestLevels) {
      expect(getSideLevel(level.id)).toEqual(level)
    }
  })
})
