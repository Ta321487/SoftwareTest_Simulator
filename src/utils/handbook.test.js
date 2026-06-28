import { describe, it, expect } from 'vitest'
import { getHandbookBlurb, matchesHandbookSearch } from './handbook.js'
import { debriefs } from '../data/debriefs.js'

describe('handbook', () => {
  it('uses why instead of second-person summary for card blurb', () => {
    const entry = { ...debriefs[1], title: '接 PRD', levelId: 1, phaseName: '备考' }
    const blurb = getHandbookBlurb(entry)
    expect(blurb).toContain('业务规则')
    expect(blurb).not.toMatch(/^你/)
  })

  it('prefers explicit takeaway when present', () => {
    const entry = { takeaway: '先列维度再确认优先级', why: 'other', summary: '你完成了' }
    expect(getHandbookBlurb(entry)).toBe('先列维度再确认优先级')
  })

  it('searches across blurb and workplace', () => {
    const entry = { ...debriefs[3], title: 'Bug 单', levelId: 3, phaseName: '备考' }
    expect(matchesHandbookSearch(entry, '可复现')).toBe(true)
  })
})
