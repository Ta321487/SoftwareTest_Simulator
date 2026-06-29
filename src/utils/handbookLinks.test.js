import { describe, it, expect } from 'vitest'
import { getHandbookLinksForLevel, getPlaybooksForTerm } from './handbookLinks.js'

describe('handbookLinks', () => {
  it('links bug level to bug-report playbook and terms', () => {
    const links = getHandbookLinksForLevel(3)
    expect(links.playbooks.some((p) => p.id === 'bug-report')).toBe(true)
    expect(links.terms.some((t) => t.id === 'bug')).toBe(true)
  })

  it('links oncall levels to triage playbook', () => {
    const links = getHandbookLinksForLevel(45)
    expect(links.playbooks.some((p) => p.id === 'oncall-triage')).toBe(true)
  })

  it('finds playbooks for glossary term', () => {
    const pbs = getPlaybooksForTerm('regression')
    expect(pbs.some((p) => p.id === 'regression-scope')).toBe(true)
  })
})
