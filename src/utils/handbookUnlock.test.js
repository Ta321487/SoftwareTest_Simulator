import { describe, it, expect } from 'vitest'
import {
  isHandbookLevelLocked,
  isPlaybookHandbookLocked,
  isGlossaryHandbookLocked,
} from './handbookUnlock.js'
import { playbooks } from '../data/playbooks.js'
import { glossaryTerms } from '../data/glossary.js'

function mockStore(statusMap = {}) {
  return {
    getStatus: (id) => statusMap[id] ?? 'locked',
    getSideQuestStatus: (id) => statusMap[id] ?? 'locked',
  }
}

describe('handbookUnlock', () => {
  it('locks mainline notes when level is locked', () => {
    const store = mockStore({ 1: 'locked', 2: 'available' })
    expect(isHandbookLevelLocked(1, store)).toBe(true)
    expect(isHandbookLevelLocked(2, store)).toBe(false)
  })

  it('locks playbook when all related levels are locked', () => {
    const pb = playbooks.find((p) => p.id === 'bug-report')
    const store = mockStore({ 3: 'locked', 8: 'locked' })
    expect(isPlaybookHandbookLocked(pb, store)).toBe(true)
    store.getStatus = (id) => (id === 3 ? 'completed' : 'locked')
    expect(isPlaybookHandbookLocked(pb, store)).toBe(false)
  })

  it('locks glossary when all related levels are locked', () => {
    const term = glossaryTerms.find((t) => t.id === 'blocker')
    const store = mockStore({ 3: 'locked', 22: 'locked' })
    expect(isGlossaryHandbookLocked(term, store)).toBe(true)
  })
})
