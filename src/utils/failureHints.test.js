import { describe, it, expect } from 'vitest'
import { getFailureHint } from './failureHints.js'
import { levels } from '../data/levels.js'

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
  })
})
