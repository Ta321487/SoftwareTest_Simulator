const JIRA_RULES = {
  3: {
    summaryKeywords: ['验证码', '倒计时', '-1', 'countdown'],
    summaryMinLength: 8,
    module: '登录',
    severityIn: ['Major', 'Critical'],
    stepsMinLength: 20,
    stepsKeywords: ['验证码'],
    expectedKeywords: ['倒计时', '0', '正'],
    actualKeywords: ['-1', '负'],
    expectedActualMustDiffer: true,
  },
  8: {
    summaryKeywords: ['支付'],
    summaryMinLength: 10,
    summaryReject: ['支付失败了', '点支付就报错'],
    module: '支付',
    severityIn: ['Major', 'Critical', 'Blocker'],
    stepsMinLength: 25,
    stepsKeywords: ['支付', '订单'],
    expectedActualMustDiffer: true,
  },
  22: {
    summaryKeywords: ['登录', '慢', '超时', '8', '4G', '延迟'],
    summaryMinLength: 10,
    module: '登录',
    severityIn: ['Major', 'Critical', 'Blocker'],
    stepsMinLength: 20,
    stepsKeywords: ['登录', '4G', 'App'],
    expectedKeywords: ['秒', '时间', '快速', '3'],
    actualKeywords: ['8', '慢', '超时', '等待'],
    expectedActualMustDiffer: true,
  },
}

export const JIRA_TIER_LABELS = {
  excellent: '优秀',
  good: '合格',
  draft: '草稿',
}

function includesAny(text, keywords = []) {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(String(kw).toLowerCase()))
}

function countLines(text) {
  return text.split(/\n+/).filter((line) => line.trim()).length
}

/** 最低可提交线：必填 + 基础可读性，保证能过关 */
export function validateJiraMinimum(levelId, values) {
  const summary = String(values.summary || '').trim()
  const steps = String(values.steps || '').trim()
  const expected = String(values.expected || '').trim()
  const actual = String(values.actual || '').trim()
  const rules = JIRA_RULES[levelId]

  if (summary.length < 6) {
    return {
      isPass: false,
      message: 'Bug 标题太短。至少用一句话描述「什么功能 + 什么现象」。',
      field: 'summary',
    }
  }

  if (rules?.summaryReject?.some((bad) => summary.includes(bad))) {
    return {
      isPass: false,
      message: '标题太笼统（如「支付失败了」）。请写清具体现象后再提交。',
      field: 'summary',
    }
  }

  if (steps.length < 12) {
    return {
      isPass: false,
      message: '复现步骤太简略。至少写清进入页面 → 操作 → 观察结果。',
      field: 'steps',
    }
  }

  if (expected && actual && expected === actual) {
    return {
      isPass: false,
      message: '预期结果与实际结果不能相同。预期写「应该怎样」，实际写「实际怎样」。',
      field: 'actual',
    }
  }

  if (!expected || !actual) {
    return {
      isPass: false,
      message: '请填写预期结果与实际结果，便于开发对比。',
      field: !expected ? 'expected' : 'actual',
    }
  }

  return { isPass: true }
}

/** 合格线：原有关键词/模块/严重度等规则 */
export function validateJiraQuality(levelId, values) {
  const rules = JIRA_RULES[levelId]
  if (!rules) return { isPass: true }

  const summary = String(values.summary || '').trim()
  const steps = String(values.steps || '').trim()
  const expected = String(values.expected || '').trim()
  const actual = String(values.actual || '').trim()
  const module = values.module
  const severity = values.severity

  if (rules.summaryMinLength && summary.length < rules.summaryMinLength) {
    return {
      isPass: false,
      message: `Bug 标题过短。用一句话说清【什么功能 + 什么现象 + 影响】，至少 ${rules.summaryMinLength} 字。`,
      field: 'summary',
    }
  }

  if (rules.summaryReject?.some((bad) => summary.includes(bad))) {
    return {
      isPass: false,
      message: '标题太笼统（如「支付失败了」）。请写清具体现象：什么操作、什么报错、影响范围。',
      field: 'summary',
    }
  }

  if (rules.summaryKeywords?.length && !includesAny(summary, rules.summaryKeywords)) {
    return {
      isPass: false,
      message: '标题未点明核心问题。请包含关键现象词（如验证码、倒计时、-1 等）。',
      field: 'summary',
    }
  }

  if (rules.module && module !== rules.module) {
    return {
      isPass: false,
      message: `所属模块应选「${rules.module}」，与 Bug 现象所在功能一致。`,
      field: 'module',
    }
  }

  if (rules.severityIn?.length && !rules.severityIn.includes(severity)) {
    return {
      isPass: false,
      message: '严重程度与现象不匹配。功能性缺陷通常选 Major 或 Critical，不要选 Trivial。',
      field: 'severity',
    }
  }

  if (rules.stepsMinLength && steps.length < rules.stepsMinLength) {
    return {
      isPass: false,
      message: '复现步骤太简略。按顺序写清：进入哪个页面 → 点什么 → 看到什么，让开发能独立复现。',
      field: 'steps',
    }
  }

  if (rules.stepsKeywords?.length && !includesAny(steps, rules.stepsKeywords)) {
    return {
      isPass: false,
      message: '复现步骤缺少关键操作。请写清与 Bug 相关的具体操作路径。',
      field: 'steps',
    }
  }

  if (countLines(steps) < 2 && steps.length < 30) {
    return {
      isPass: false,
      message: '复现步骤建议分步写（每步一行），至少 2 步操作。',
      field: 'steps',
    }
  }

  if (rules.expectedActualMustDiffer && expected && actual && expected === actual) {
    return {
      isPass: false,
      message: '预期结果与实际结果不能相同。预期写「应该怎样」，实际写「实际怎样」。',
      field: 'actual',
    }
  }

  if (rules.expectedKeywords?.length && !includesAny(expected, rules.expectedKeywords)) {
    return {
      isPass: false,
      message: '预期结果未描述正常行为。写清正常情况下用户应看到什么。',
      field: 'expected',
    }
  }

  if (rules.actualKeywords?.length && !includesAny(actual, rules.actualKeywords)) {
    return {
      isPass: false,
      message: '实际结果未描述异常现象。写清你观察到的具体问题。',
      field: 'actual',
    }
  }

  return { isPass: true }
}

/** 三档：draft 可过关；good 合格；excellent 优秀（冲三星上限） */
export function scoreJiraTier(levelId, values) {
  const minimum = validateJiraMinimum(levelId, values)
  if (!minimum.isPass) return 'draft'

  const quality = validateJiraQuality(levelId, values)
  if (!quality.isPass) return 'draft'

  const rules = JIRA_RULES[levelId]
  const summary = String(values.summary || '').trim()
  const steps = String(values.steps || '').trim()
  const stepLines = countLines(steps)
  const summaryBonus = rules?.summaryMinLength ? summary.length >= rules.summaryMinLength + 6 : summary.length >= 16
  const stepsBonus = stepLines >= 3 && steps.length >= (rules?.stepsMinLength || 20) + 5

  if (summaryBonus && stepsBonus) return 'excellent'
  return 'good'
}

export function getJiraTierPreview(levelId, values) {
  const hasRules = Boolean(JIRA_RULES[levelId])
  if (!hasRules) {
    return { hasRules: false, tier: null, starCap: 3, tips: [] }
  }

  const minimum = validateJiraMinimum(levelId, values)
  const quality = validateJiraQuality(levelId, values)
  const tier = scoreJiraTier(levelId, values)
  const tips = []

  if (!minimum.isPass) {
    tips.push(minimum.message)
  } else if (!quality.isPass) {
    tips.push(quality.message)
  } else if (tier === 'good') {
    tips.push('再充实标题与步骤（建议 3 步以上）可冲「优秀」拿 ★★★。')
  }

  return {
    hasRules: true,
    tier,
    starCap: jiraTierStarCap(tier),
    tips,
  }
}

export function jiraTierMessage(tier) {
  if (tier === 'excellent') return 'Bug 单提交成功！质量优秀，开发可直接接手。'
  if (tier === 'good') return 'Bug 单提交成功！已达合格标准。'
  return 'Bug 单已收录（草稿档）。能过关，但建议补全现象与步骤后再冲星。'
}

export function jiraTierStarCap(tier) {
  if (tier === 'excellent') return 3
  if (tier === 'good') return 2
  return 1
}
