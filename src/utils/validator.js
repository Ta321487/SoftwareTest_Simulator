import { validateJiraMinimum, scoreJiraTier, jiraTierMessage, jiraTierStarCap } from './jiraValidation'
import { validateChatStructure } from './chatValidation'
import { validateTemplateSubmission } from './templateValidation'
import { validateTerminalCommand } from './terminalValidation'

function arraysEqual(a, b) {
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.length === sortedB.length && sortedA.every((value, index) => value === sortedB[index])
}

function normalizeCommand(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
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
          : '勾选不正确。请重新审视哪些是功能性/风险项，哪些是可忽略的干扰项。',
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
            : '勾选不正确。请重新审视哪些是接口层必须验证的项，哪些是可忽略的干扰项。',
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

      const minimum = validateJiraMinimum(level.id, values)
      if (!minimum.isPass) {
        return {
          isPass: false,
          message: minimum.message,
          invalidFields: minimum.field ? [minimum.field] : [],
        }
      }

      const jiraTier = scoreJiraTier(level.id, values)
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
          : '测试连接失败。占位符地址通常无法连通沙箱，请向运维确认测试环境真实地址。',
      }
    }

    case 'chat': {
      const message = (data.message || '').trim()
      const lower = message.toLowerCase()
      const keywords = level.chatKeywords || []
      const matched = keywords.filter((keyword) => lower.includes(keyword.toLowerCase()))
      const minLen = level.chatMinLength ?? 8
      const minKw = level.chatMinKeywords ?? 1

      if (message.length < minLen) {
        return {
          isPass: false,
          message: level.chatFailHint || '回复太短或太笼统。说明你会先查什么，并请对方配合排查。',
        }
      }

      if (matched.length < minKw) {
        return {
          isPass: false,
          message:
            level.chatFailHint ||
            '回复偏被动。试着写：①你会先核对测试环境的配置/地址 ②请李工配合查日志或抓包。',
        }
      }

      const structure = validateChatStructure(level, message)
      if (!structure.ok) {
        return { isPass: false, message: structure.message }
      }

      return { isPass: true, message: '回复专业得体！' }
    }

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
          : '选错了。对照 status、Host/URL 环境与业务链路（支付→回调→落库）重新分析。',
      }
    }

    case 'calculator': {
      const fields = data.values || {}
      const userAnswer = normalizeCalcAnswer(data.userResult)

      if (!userAnswer) {
        return { isPass: false, message: '请先填写你的计算结果（数字，建议保留两位小数）。' }
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
          : `结果不对（你填的是 ${userAnswer}）。请按公式重算，保留两位小数后再提交。`,
      }
    }

    default:
      return { isPass: false, message: '未知模拟类型。' }
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
