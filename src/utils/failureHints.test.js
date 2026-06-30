import { describe, it, expect } from 'vitest'
import { getFailureHint, getLevelHintPool, pickNextLevelHint } from './failureHints.js'
import { levels } from '../data/levels.js'
import { getSideLevel } from '../data/sideQuests.js'

describe('getFailureHint', () => {
  it('template failure returns pitfall only, not duplicated result.message', () => {
    const level = levels.find((lv) => lv.id === 2)
    const result = { message: '「用户名空，密码正确」还未填写。对照需求…' }
    const hint = getFailureHint(level, { values: {} }, result)
    expect(hint).not.toContain(result.message)
    expect(hint).toContain('6 位纯数字')
  })

  it('checklist failure prefers diff detail over generic message', () => {
    const level = levels.find((lv) => lv.id === 1)
    const hint = getFailureHint(level, { selected: ['a', 'd'] }, { message: '勾选不正确' })
    expect(hint).toMatch(/漏选|多选/)
    expect(hint).not.toBe('勾选不正确')
  })

  it('checklist failure without diff returns pitfall or empty, not result.message', () => {
    const level = levels.find((lv) => lv.id === 1)
    const msg = '勾选不正确。请重新审视…'
    const hint = getFailureHint(level, { selected: [] }, { message: msg })
    expect(hint).not.toBe(msg)
  })

  it('report failure returns diff detail, not duplicated result.message', () => {
    const level = levels.find((lv) => lv.id === 4)
    const msg = '回归范围不正确'
    const hint = getFailureHint(level, { selected: [] }, { message: msg })
    expect(hint).not.toBe(msg)
    expect(hint.length).toBeGreaterThan(0)
  })
})

describe('getLevelHintPool', () => {
  it('level 1 pool is topic-specific without generic checklist fallback', () => {
    const level = levels.find((lv) => lv.id === 1)
    const pool = getLevelHintPool(level)
    expect(pool.length).toBeGreaterThanOrEqual(3)
    expect(pool[0]).toBe(level.hint)
    expect(pool.some((t) => t.includes('PRD'))).toBe(true)
    expect(pool.some((t) => t.includes('常见遗漏'))).toBe(true)
    expect(pool.some((t) => t.includes('UI 审美类通常是干扰项'))).toBe(false)
  })

  it('side quest uses side debrief for hint pool', () => {
    const level = getSideLevel(101)
    const pool = getLevelHintPool(level)
    expect(pool[0]).toBe(level.hint)
    expect(pool.some((t) => t.includes('OWASP') || t.includes('安全冒烟'))).toBe(true)
  })

  it('terminal level includes terminalHint and debrief', () => {
    const level = levels.find((lv) => lv.id === 5)
    const pool = getLevelHintPool(level)
    expect(pool.some((t) => t.includes('tail') || t.includes('末尾'))).toBe(true)
    expect(pool.some((t) => t.includes('日志') || t.includes('SSH'))).toBe(true)
  })

  it('pickNextLevelHint avoids repeating current when pool has alternatives', () => {
    const pool = ['A', 'B', 'C']
    for (let i = 0; i < 20; i++) {
      const next = pickNextLevelHint(pool, 'A')
      expect(next).not.toBe('A')
    }
  })
})
