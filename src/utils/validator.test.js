import { describe, it, expect } from 'vitest'
import { executeTerminalCommand, parseTailLineCount } from './terminalExecution.js'
import { validateSimulation, calculateStars } from './validator.js'
import { validateJiraQuality, scoreJiraTier, validateJiraMinimum, getJiraTierPreview } from './jiraValidation.js'
import { validateTerminalCommand } from './terminalValidation.js'

const level3 = {
  id: 3,
  simType: 'jira',
  jiraFields: {
    summary: { label: 'Bug标题', required: true },
    severity: { label: '严重程度', required: true },
    module: { label: '所属模块', required: true },
    steps: { label: '复现步骤', required: true },
    expected: { label: '预期结果', required: true },
    actual: { label: '实际结果', required: true },
  },
}

describe('calculateStars', () => {
  it('gives 3 stars for first attempt without hint', () => {
    expect(calculateStars(1, false)).toBe(3)
  })

  it('caps stars by jira draft tier', () => {
    expect(calculateStars(1, false, { jiraTier: 'draft' })).toBe(1)
    expect(calculateStars(1, false, { jiraTier: 'good' })).toBe(2)
    expect(calculateStars(1, false, { jiraTier: 'excellent' })).toBe(3)
  })

  it('gives 2 stars when hint used on first attempt', () => {
    expect(calculateStars(1, true)).toBe(2)
  })

  it('gives 1 star after many attempts', () => {
    expect(calculateStars(5, false)).toBe(1)
  })
})

describe('executeTerminalCommand', () => {
  const tailLevel = {
    correctCommand: 'tail -n 100 /var/log/app/error.log',
    storyLogs: [
      '[2026-06-28 09:15:01] ERROR AuthController - SMS countdown display: -1',
      '[2026-06-28 09:15:08] ERROR LoginAPI - success rate dropped',
    ],
  }

  const grepLevel = {
    correctCommand: 'grep ERROR /var/log/app/error.log',
    storyLogs: [
      '[2026-06-28 14:02:01] ERROR AuthController - login timeout',
      '[2026-06-28 14:02:08] INFO  AuthController - retry success',
    ],
  }

  it('tail shows last N lines of log file', () => {
    const result = executeTerminalCommand('tail -n 1 /var/log/app/error.log', tailLevel)
    expect(result.outputLines.length).toBe(2)
    expect(result.outputLines[1]).toContain('LoginAPI')
  })

  it('tail wrong path fails validation', () => {
    const result = executeTerminalCommand('tail -n 100 /var/log/wrong.log', tailLevel)
    expect(result.validation.isPass).toBe(false)
    expect(result.errorLine).toContain('No such file')
  })

  it('grep filters ERROR lines only', () => {
    const result = executeTerminalCommand('grep ERROR /var/log/app/error.log', grepLevel)
    expect(result.outputLines.length).toBe(1)
    expect(result.outputLines[0]).toContain('ERROR')
    expect(result.validation.isPass).toBe(true)
  })

  it('parseTailLineCount supports -n and shorthand', () => {
    expect(parseTailLineCount('tail -n 100 /var/log/app/error.log')).toBe(100)
    expect(parseTailLineCount('tail -100 /var/log/app/error.log')).toBe(100)
  })
})

describe('validateTerminalCommand', () => {
  const tailLevel = { correctCommand: 'tail -n 100 /var/log/app/error.log' }
  const grepLevel = { correctCommand: 'grep ERROR /var/log/app/error.log' }

  it('accepts exact tail command', () => {
    expect(validateTerminalCommand('tail -n 100 /var/log/app/error.log', tailLevel).isPass).toBe(true)
  })

  it('accepts grep with keyword and path', () => {
    expect(validateTerminalCommand('grep ERROR /var/log/app/error.log', grepLevel).isPass).toBe(true)
  })
})

describe('jira three-tier', () => {
  it('rejects vague payment summary on minimum', () => {
    const result = validateJiraMinimum(8, {
      summary: '支付失败了',
      steps: '1. 登录\n2. 进入订单\n3. 点击微信支付\n4. 看到报错',
      expected: '支付成功',
      actual: '页面报错无法支付',
    })
    expect(result.isPass).toBe(false)
  })

  it('scores draft when quality rules not met', () => {
    const tier = scoreJiraTier(3, {
      summary: '验证码按钮有问题啊',
      severity: 'Trivial',
      module: '登录',
      steps: '打开登录页点击获取验证码按钮观察界面',
      expected: '倒计时正常',
      actual: '显示负一',
    })
    expect(tier).toBe('draft')
  })

  it('passes simulation with draft tier', () => {
    const result = validateSimulation(level3, {
      values: {
        summary: '验证码按钮有问题啊',
        severity: 'Trivial',
        module: '登录',
        steps: '打开登录页点击获取验证码按钮观察界面',
        expected: '倒计时正常',
        actual: '显示负一',
      },
    })
    expect(result.isPass).toBe(true)
    expect(result.jiraTier).toBe('draft')
  })

  it('accepts well-formed login bug as excellent or good', () => {
    const values = {
      summary: '登录页验证码倒计时显示 -1 秒',
      severity: 'Major',
      module: '登录',
      steps: '1. 打开登录页\n2. 点击获取验证码\n3. 观察倒计时',
      expected: '倒计时从 60 递减至 0',
      actual: '倒计时显示 -1 秒',
    }
    expect(validateJiraQuality(3, values).isPass).toBe(true)
    expect(['good', 'excellent']).toContain(scoreJiraTier(3, values))
  })

  it('getJiraTierPreview returns tips for draft content', () => {
    const preview = getJiraTierPreview(3, {
      summary: '短',
      steps: '一步',
      expected: '好',
      actual: '坏',
    })
    expect(preview.hasRules).toBe(true)
    expect(preview.tier).toBe('draft')
    expect(preview.starCap).toBe(1)
    expect(preview.tips.length).toBeGreaterThan(0)
  })

  it('getJiraTierPreview has no rules for non-jira-quality levels', () => {
    expect(getJiraTierPreview(1, {}).hasRules).toBe(false)
  })
})

describe('validateSimulation checklist', () => {
  const level = {
    simType: 'checklist',
    correctChecks: ['a', 'b'],
    checklistItems: [],
  }

  it('passes exact match', () => {
    expect(validateSimulation(level, { selected: ['a', 'b'] }).isPass).toBe(true)
  })

  it('fails with extra selection', () => {
    expect(validateSimulation(level, { selected: ['a', 'b', 'c'] }).isPass).toBe(false)
  })
})
