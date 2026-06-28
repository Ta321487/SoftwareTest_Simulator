import { describe, it, expect } from 'vitest'
import {
  validateJiraMinimum,
  validateJiraQuality,
  scoreJiraTier,
  getJiraTierPreview,
  jiraTierMessage,
  jiraTierStarCap,
  JIRA_TIER_LABELS,
} from './jiraValidation.js'

const loginBugValues = {
  summary: '登录页验证码倒计时显示 -1 秒',
  severity: 'Major',
  module: '登录',
  steps: '1. 打开登录页\n2. 点击获取验证码\n3. 观察倒计时',
  expected: '倒计时从 60 递减至 0',
  actual: '倒计时显示 -1 秒',
}

describe('validateJiraMinimum', () => {
  it('rejects summary shorter than 6 chars', () => {
    const result = validateJiraMinimum(3, { ...loginBugValues, summary: '验证码' })
    expect(result.isPass).toBe(false)
    expect(result.field).toBe('summary')
  })

  it('rejects identical expected and actual', () => {
    const result = validateJiraMinimum(3, {
      ...loginBugValues,
      expected: '一样',
      actual: '一样',
    })
    expect(result.isPass).toBe(false)
    expect(result.field).toBe('actual')
  })

  it('requires expected and actual fields', () => {
    const result = validateJiraMinimum(3, { ...loginBugValues, actual: '' })
    expect(result.isPass).toBe(false)
    expect(result.field).toBe('actual')
  })

  it('passes readable minimum payload', () => {
    expect(validateJiraMinimum(3, loginBugValues).isPass).toBe(true)
  })
})

describe('validateJiraQuality', () => {
  it('rejects wrong module for level 3', () => {
    const result = validateJiraQuality(3, { ...loginBugValues, module: '支付' })
    expect(result.isPass).toBe(false)
    expect(result.field).toBe('module')
  })

  it('rejects Trivial severity for functional bug', () => {
    const result = validateJiraQuality(3, { ...loginBugValues, severity: 'Trivial' })
    expect(result.isPass).toBe(false)
    expect(result.field).toBe('severity')
  })

  it('rejects summary missing phenomenon keywords on level 3', () => {
    const result = validateJiraQuality(3, {
      ...loginBugValues,
      summary: '登录页面有一个显示问题需要修复',
    })
    expect(result.isPass).toBe(false)
    expect(result.field).toBe('summary')
  })

  it('passes well-formed level 3 bug', () => {
    expect(validateJiraQuality(3, loginBugValues).isPass).toBe(true)
  })

  it('passes when level has no quality rules', () => {
    expect(validateJiraQuality(99, loginBugValues).isPass).toBe(true)
  })
})

describe('scoreJiraTier', () => {
  it('returns draft when minimum fails', () => {
    expect(scoreJiraTier(3, { ...loginBugValues, summary: '短' })).toBe('draft')
  })

  it('returns draft when quality fails', () => {
    expect(scoreJiraTier(3, { ...loginBugValues, severity: 'Trivial' })).toBe('draft')
  })

  it('returns good or excellent for complete login bug', () => {
    expect(['good', 'excellent']).toContain(scoreJiraTier(3, loginBugValues))
  })

  it('returns excellent for verbose steps and title', () => {
    const values = {
      ...loginBugValues,
      summary: '登录页验证码倒计时异常显示 -1 秒影响用户',
      steps: '1. 打开登录页输入手机号\n2. 点击获取验证码按钮\n3. 观察倒计时数字变化\n4. 截图留存',
    }
    expect(scoreJiraTier(3, values)).toBe('excellent')
  })
})

describe('getJiraTierPreview', () => {
  it('returns no rules for levels without jira rubric', () => {
    expect(getJiraTierPreview(1, loginBugValues)).toEqual({
      hasRules: false,
      tier: null,
      starCap: 3,
      tips: [],
    })
  })

  it('includes tip when tier is good', () => {
    const preview = getJiraTierPreview(3, loginBugValues)
    if (preview.tier === 'good') {
      expect(preview.tips.some((t) => t.includes('优秀'))).toBe(true)
    }
  })

  it('maps star cap from tier', () => {
    expect(getJiraTierPreview(3, { ...loginBugValues, summary: '短', steps: '一步', expected: 'a', actual: 'b' }).starCap).toBe(1)
  })
})

describe('jira tier helpers', () => {
  it('exposes tier labels', () => {
    expect(JIRA_TIER_LABELS.excellent).toBe('优秀')
    expect(JIRA_TIER_LABELS.draft).toBe('草稿')
  })

  it('maps tier to star cap', () => {
    expect(jiraTierStarCap('excellent')).toBe(3)
    expect(jiraTierStarCap('good')).toBe(2)
    expect(jiraTierStarCap('draft')).toBe(1)
  })

  it('returns user-facing tier messages', () => {
    expect(jiraTierMessage('excellent')).toContain('优秀')
    expect(jiraTierMessage('draft')).toContain('草稿')
  })
})
