import {
  validateJiraMinimum,
  scoreJiraTier,
  jiraTierMessage,
  jiraTierStarCap,
} from './jiraValidation'
import { validateChatReply } from './chatValidation'
import { validateTemplateSubmission } from './templateValidation'
import { validateTerminalCommand } from './terminalValidation'
import { validateSqlQuery } from './sqlValidation'
import { validateRedisCommand } from './redisValidation'
import { validatePipelineSubmission } from './cipipelineValidation'
import { validateMockServer } from './mockserverValidation'
import { validateMqInbox } from './mqinboxValidation'

function arraysEqual(a, b) {
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return (
    sortedA.length === sortedB.length && sortedA.every((value, index) => value === sortedB[index])
  )
}

function normalizeCalcAnswer(raw) {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[%天\s]/g, '')
  const n = parseFloat(cleaned)
  if (Number.isNaN(n)) return null
  return n.toFixed(2)
}

function expectedCalculatorResult(level, fields) {
  if (level.calculatorFormula === 'density') {
    const totalCases = Number(fields.totalCases)
    const bugsFound = Number(fields.bugsFound)
    if (!totalCases || bugsFound === undefined || Number.isNaN(bugsFound)) return null
    return ((bugsFound / totalCases) * 100).toFixed(2)
  }

  const modules = Number(fields.modules)
  const casesPerModule = Number(fields.casesPerModule)
  const casesPerHour = Number(fields.casesPerHour)
  const hoursPerDay = Number(fields.hoursPerDay)
  if (!modules || !casesPerModule || !casesPerHour || !hoursPerDay) return null
  return ((modules * casesPerModule) / casesPerHour / hoursPerDay).toFixed(2)
}

export function validateSimulation(level, data) {
  switch (level.simType) {
    case 'checklist': {
      const selected = data.selected || []
      const isPass = arraysEqual(selected, level.correctChecks)
      return {
        isPass,
        message: isPass
          ? '勾选正确！'
          : '有些选项不该选。想想哪些是功能或风险相关，哪些只是干扰。',
      }
    }

    case 'template': {
      const values = data.values || {}
      const result = validateTemplateSubmission(level, values)
      if (!result.ok) {
        return { isPass: false, message: result.message }
      }
      return { isPass: true, message: '模板填写完成！' }
    }

    case 'apiclient': {
      if (level.checklistItems?.length) {
        const selected = data.selected || []
        const isPass = arraysEqual(selected, level.correctChecks)
        return {
          isPass,
          message: isPass
            ? '勾选正确！'
            : '有些选项不该选。想想哪些是接口必须验证的，哪些只是干扰。',
        }
      }
      const values = data.values || {}
      const result = validateTemplateSubmission(level, values)
      if (!result.ok) {
        return { isPass: false, message: result.message }
      }
      return { isPass: true, message: '接口断言填写完成！' }
    }

    case 'jira': {
      const values = data.values || {}
      const invalidFields = []
      const labelMap = {}
      for (const [key, config] of Object.entries(level.jiraFields)) {
        labelMap[key] = config.label
        if (config.required && !String(values[key] || '').trim()) {
          invalidFields.push(key)
        }
      }
      if (invalidFields.length) {
        const first = labelMap[invalidFields[0]]
        return {
          isPass: false,
          message:
            invalidFields.length === 1
              ? `请填写「${first}」`
              : `还有 ${invalidFields.length} 个必填项未填，请先补全「${first}」等字段。`,
          invalidFields,
        }
      }

      const minimum = validateJiraMinimum(level, values)
      if (!minimum.isPass) {
        return {
          isPass: false,
          message: minimum.message,
          invalidFields: minimum.field ? [minimum.field] : [],
        }
      }

      const jiraTier = scoreJiraTier(level, values)
      return {
        isPass: true,
        message: jiraTierMessage(jiraTier),
        jiraTier,
      }
    }

    case 'report': {
      const selected = data.selected || []
      const isPass = arraysEqual(selected, level.correctSelections)
      return {
        isPass,
        message: isPass
          ? '回归范围选择正确！'
          : '回归范围不对。优先关注「FAIL + 高风险」的用例，低风险 PASS 项可暂缓。',
      }
    }

    case 'terminal': {
      const result = validateTerminalCommand(data.command || '', level)
      return result
    }

    case 'config': {
      const value = (data.value || '').trim()
      const isPass = value === level.correctValue
      return {
        isPass,
        message: isPass
          ? '配置修改正确！'
          : '连接失败。文档里的示例地址往往连不上，请改成测试环境的真实地址。',
      }
    }

    case 'chat':
      return validateChatReply(level, data)

    case 'clickcard': {
      const isPass = data.selected === level.correctClick
      if (!data.selected) {
        return { isPass: false, message: '请先点击选中一个选项，再确认提交。' }
      }
      return {
        isPass,
        message: isPass ? '选择正确！' : '选择不对。请结合场景中的数据、环境或团队背景重新分析。',
      }
    }

    case 'packet': {
      const isPass = data.selected === level.correctClick
      if (!data.selected) {
        return { isPass: false, message: '请先点击选中一条请求，再确认提交。' }
      }
      return {
        isPass,
        message: isPass
          ? '定位正确！'
          : '选错了。看看状态码、域名/地址是否对，再顺着支付→回调→落库想一遍。',
      }
    }

    case 'calculator': {
      const fields = data.values || {}
      const userAnswer = normalizeCalcAnswer(data.userResult)

      if (!userAnswer) {
        return { isPass: false, message: '请填写计算结果。' }
      }

      const expected = expectedCalculatorResult(level, fields)
      if (!expected) {
        return { isPass: false, message: '题目参数不完整，请刷新页面重试。' }
      }

      const isPass = userAnswer === expected
      const unit = level.calculatorFormula === 'density' ? '%' : ' 天'
      return {
        isPass,
        message: isPass
          ? `计算正确！结果为 ${expected}${unit.trim()}`
          : `结果不正确（你填写的是 ${userAnswer}），请按公式重新计算。`,
      }
    }

    case 'sqlclient': {
      return validateSqlQuery(data.query || '', level)
    }

    case 'redis': {
      return validateRedisCommand(data.command || '', level)
    }

    case 'cipipeline': {
      return validatePipelineSubmission(level, data)
    }

    case 'mockserver': {
      return validateMockServer(level, data)
    }

    case 'apmtrace':
    case 'gitrelease': {
      const isPass = data.selected === level.correctClick
      if (!data.selected) {
        return { isPass: false, message: '请先点击选中一项，再确认提交。' }
      }
      return {
        isPass,
        message: isPass ? '选择正确！' : '选择不对。请结合场景中的数据与环境背景重新分析。',
      }
    }

    case 'mqinbox': {
      return validateMqInbox(level, data)
    }

    case 'oncall':
    case 'leadboard':
    case 'loginapp':
    case 'paymentapp': {
      const expected = level.oncallAction || level.leadAction || level.appAction
      if (!data.done) {
        return { isPass: false, message: '请先完成面板上的操作，再确认提交。' }
      }
      if (expected && data.action !== expected) {
        return { isPass: false, message: '操作未完成，请按任务说明在面板里完成后再提交。' }
      }
      return { isPass: true, message: '操作完成！' }
    }

    default:
      return { isPass: false, message: '这道题类型暂不支持，请刷新页面或反馈问题。' }
  }
}

export function calculateStars(attempts, hintsUsed, options = {}) {
  let stars
  if (attempts <= 1 && !hintsUsed) stars = 3
  else if (attempts <= 2 && !hintsUsed) stars = 2
  else if (attempts <= 1 && hintsUsed) stars = 2
  else stars = 1

  if (options.jiraTier) {
    stars = Math.min(stars, jiraTierStarCap(options.jiraTier))
  }
  return stars
}

export function calculateBonusXp(baseXp, stars) {
  if (stars >= 3) return Math.max(1, Math.round(baseXp * 0.3))
  if (stars >= 2) return Math.max(1, Math.round(baseXp * 0.15))
  return 0
}
