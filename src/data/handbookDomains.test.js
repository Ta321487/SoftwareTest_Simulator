import { describe, it, expect } from 'vitest'
import {
  getPlaybookDomain,
  getTermDomains,
  getLevelDomains,
  filterPlaybooksByDomain,
  getDomainCounts,
} from './handbookDomains.js'
import { playbooks } from './playbooks.js'
import { glossaryTerms } from './glossary.js'

describe('handbookDomains', () => {
  it('maps playbook categories to domains', () => {
    expect(getPlaybookDomain(playbooks.find((p) => p.id === 'api-smoke'))).toBe('api')
    expect(getPlaybookDomain(playbooks.find((p) => p.id === 'oncall-triage'))).toBe('oncall')
  })

  it('assigns terminal levels to oncall domain', () => {
    expect(getLevelDomains(23)).toContain('oncall')
    expect(getLevelDomains(16)).toContain('api')
  })

  it('assigns white-box term to functional domain', () => {
    const wb = glossaryTerms.find((t) => t.id === 'white-box')
    expect(getTermDomains(wb)).toContain('functional')
  })

  it('aggregates domain counts', () => {
    const rows = getDomainCounts({
      entries: [{ levelId: 3 }, { levelId: 16 }],
      terms: glossaryTerms,
      playbooks,
    })
    expect(rows).toHaveLength(4)
    expect(rows.find((r) => r.id === 'api').counts.notes).toBe(1)
    expect(filterPlaybooksByDomain(playbooks, 'api').length).toBeGreaterThan(0)
  })
})
