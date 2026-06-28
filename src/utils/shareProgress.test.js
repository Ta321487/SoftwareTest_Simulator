import { describe, it, expect } from 'vitest'
import { buildShareText, PLAY_URL } from './shareProgress.js'

describe('shareProgress', () => {
  it('builds multi-line share text with play url', () => {
    const text = buildShareText({
      rankTitle: '备考萌新',
      rankIcon: '📖',
      xp: 10,
      stars: 3,
      mainDone: 1,
      mainTotal: 33,
      sideDone: 0,
      sideTotal: 9,
      streak: 2,
      achievementDone: 1,
      achievementTotal: 18,
    })
    expect(text).toContain('备考萌新')
    expect(text).toContain(PLAY_URL)
    expect(text).toContain('主线 1/33')
  })
})
