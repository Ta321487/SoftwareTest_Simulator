import { describe, it, expect } from 'vitest'
import {
  getHandbookBlurb,
  getGlossaryBlurb,
  matchesHandbookSearch,
  matchesGlossarySearch,
  matchesPlaybookSearch,
  filterGlossaryTerms,
} from './handbook.js'
import { debriefs } from '../data/debriefs.js'
import { glossaryTerms } from '../data/glossary.js'
import { playbooks } from '../data/playbooks.js'

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

  it('finds glossary term by alias', () => {
    const blocker = glossaryTerms.find((t) => t.id === 'blocker')
    expect(matchesGlossarySearch(blocker, '阻塞')).toBe(true)
    expect(getGlossaryBlurb(blocker)).toContain('核心功能')
  })

  it('filters glossary by category', () => {
    const defectTerms = filterGlossaryTerms(glossaryTerms, { categoryId: 'defect' })
    expect(defectTerms.length).toBeGreaterThan(3)
    expect(defectTerms.every((t) => t.category === 'defect')).toBe(true)
  })

  it('finds black-box and classic design methods', () => {
    const blackBox = glossaryTerms.find((t) => t.id === 'black-box')
    expect(matchesGlossarySearch(blackBox, '黑盒')).toBe(true)
    expect(
      filterGlossaryTerms(glossaryTerms, { query: '等价类' }).some(
        (t) => t.id === 'equivalence-class'
      )
    ).toBe(true)
    expect(
      filterGlossaryTerms(glossaryTerms, { query: '判定表' }).some((t) => t.id === 'decision-table')
    ).toBe(true)
  })

  it('finds playbooks by step keyword', () => {
    const pb = playbooks.find((p) => p.id === 'log-grep')
    expect(matchesPlaybookSearch(pb, 'tail')).toBe(true)
  })
})
