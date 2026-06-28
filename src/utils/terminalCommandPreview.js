import { parseTailLineCount } from './terminalValidation.js'

function normalize(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
}

function extractGrepKeyword(cmd) {
  const parts = normalize(cmd).split(/\s+/)
  const grepIdx = parts.indexOf('grep')
  if (grepIdx < 0) return null
  for (let i = grepIdx + 1; i < parts.length; i++) {
    if (parts[i].startsWith('-')) continue
    if (parts[i].startsWith('/')) return null
    return parts[i]
  }
  return null
}

/** 终端命令输入预览（不泄露答案，帮冲星） */
export function getTerminalCommandPreview(command, level) {
  const raw = String(command || '').trim()
  if (!raw || !level?.correctCommand) {
    return { hasPreview: false, tier: 'empty', tips: [], tierLabel: '待输入' }
  }

  const cmd = normalize(raw)
  const tips = []
  const expected = normalize(level.correctCommand)
  const expectedGrepKw = extractGrepKeyword(expected)

  if (cmd.includes('grep')) {
    const keyword = extractGrepKeyword(cmd)
    if (expectedGrepKw && keyword !== expectedGrepKw) {
      tips.push('grep 关键字是否包含 ERROR？线上排障通常先筛错误级别。')
    }
    if (!cmd.includes('/var/log') && !cmd.includes('error.log')) {
      tips.push('确认日志路径：/var/log/app/error.log')
    }
  } else if (cmd.includes('tail')) {
    const expectedCount = parseTailLineCount(level.correctCommand)
    const userCount = parseTailLineCount(raw)
    if (!userCount) {
      tips.push('tail 需要指定行数，如 tail -n 100')
    } else if (expectedCount && userCount !== expectedCount) {
      tips.push(`题目要求最近 ${expectedCount} 行，当前 -n 为 ${userCount}`)
    }
    if (!cmd.includes('error.log')) {
      tips.push('路径是否指向 error.log？')
    }
  } else if (cmd === 'ls' || cmd.startsWith('cd ')) {
    tips.push('探索命令可用。本题需 grep/tail 查看日志内容。')
  } else {
    tips.push('本题期望 grep 或 tail 查看 error.log。')
  }

  let tier = 'good'
  if (tips.length > 1) tier = 'weak'
  else if (tips.length === 1) tier = 'ok'

  const tierLabels = { weak: '待完善', ok: '接近了', good: '结构正确' }

  return {
    hasPreview: true,
    tier,
    tierLabel: tierLabels[tier],
    tips,
  }
}
