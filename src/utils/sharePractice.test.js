import { describe, it, expect } from 'vitest'
import { getSharePracticeContext, formatPracticeLine } from './sharePractice.js'

describe('sharePractice', () => {
  it('returns default context when no level', () => {
    const ctx = getSharePracticeContext(null)
    expect(ctx.phaseLabel).toBe('备考')
    expect(ctx.tags).toContain('黑盒')
  })

  it('returns level and sim tags for jira level', () => {
    const ctx = getSharePracticeContext(3)
    expect(ctx.levelLine).toContain('#3')
    expect(ctx.tags.some((t) => t.includes('Bug') || t.includes('Blocker'))).toBe(true)
  })

  it('formats practice line for share text', () => {
    const line = formatPracticeLine(getSharePracticeContext(1))
    expect(line).toContain('备考')
    expect(line).toContain('#1')
  })
})
