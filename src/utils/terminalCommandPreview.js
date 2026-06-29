import { parseTailLineCount, parseGrepCommand } from './terminalValidation.js'

function normalize(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
}

function getCommandFamily(expected) {
  const norm = normalize(expected || '')
  if (norm.startsWith('curl')) return 'curl'
  if (norm.startsWith('find')) return 'find'
  if (norm.startsWith('cat')) return 'cat'
  if (norm.startsWith('head')) return 'head'
  if (norm.startsWith('ls')) return 'ls'
  if (norm.includes('|') && norm.includes('wc')) return 'wc-pipe'
  if (norm.includes('grep')) return 'grep'
  if (norm.includes('tail')) return 'tail'
  return 'unknown'
}

function extractPath(expected) {
  const match = (expected || '').match(/(\/[\w./-]+)/)
  return match ? match[1] : null
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
  const family = getCommandFamily(level.correctCommand)
  const path = extractPath(level.correctCommand)

  if (family === 'grep' || family === 'wc-pipe') {
    const expectedGrep = parseGrepCommand(expected)
    const userGrep = parseGrepCommand(cmd)
    if (expectedGrep?.pattern && userGrep?.pattern !== expectedGrep.pattern) {
      tips.push(`grep 关键字是否匹配题目要求（如 ${expectedGrep.pattern.toUpperCase()}）？`)
    }
    if (
      expectedGrep?.flags.context != null &&
      userGrep?.flags.context !== expectedGrep.flags.context
    ) {
      tips.push(`上下文行数是否用了 -C ${expectedGrep.flags.context}？`)
    }
    if (expectedGrep?.flags.invert && !userGrep?.flags.invert) {
      tips.push('是否需要 grep -v 排除 INFO 等干扰行？')
    }
    if (expectedGrep?.flags.ignoreCase && !userGrep?.flags.ignoreCase) {
      tips.push('大小写不确定时可用 grep -i。')
    }
    if (expectedGrep?.flags.extended && !userGrep?.flags.extended) {
      tips.push('多关键字可用 grep -E 与 | 组合。')
    }
    if (family === 'wc-pipe' && !cmd.includes('wc -l')) {
      tips.push('统计行数需用管道：grep … | wc -l')
    }
    if (path && !cmd.includes(path.toLowerCase())) {
      tips.push(`确认日志路径：${path}`)
    }
  } else if (family === 'tail') {
    const expectedCount = parseTailLineCount(level.correctCommand)
    const userCount = parseTailLineCount(raw)
    if (expected.includes('-f') && !/\btail\b[^\n]*\s-(?:f|F)\b/.test(cmd)) {
      tips.push('实时跟踪需 tail -f。')
    } else if (!userCount && !expected.includes('-f')) {
      tips.push('tail 需要指定行数，如 tail -n 100')
    } else if (expectedCount && userCount !== expectedCount) {
      tips.push(`题目要求最近 ${expectedCount} 行，当前 -n 为 ${userCount ?? '未指定'}`)
    }
    if (path && !cmd.includes('error.log') && !cmd.includes(path.toLowerCase())) {
      tips.push('路径是否指向正确日志文件？')
    }
  } else if (family === 'head') {
    if (!cmd.includes('head -n')) tips.push('查看文件开头用 head -n 行数 路径')
    if (path && !cmd.includes(path.toLowerCase())) tips.push(`确认文件路径：${path}`)
  } else if (family === 'cat') {
    if (!cmd.startsWith('cat ')) tips.push('读配置文件用 cat 文件路径')
    if (path && !cmd.includes(path.toLowerCase())) tips.push(`确认路径：${path}`)
  } else if (family === 'curl') {
    if (!cmd.startsWith('curl')) tips.push('探活用 curl 请求健康检查地址')
    const url = expected.match(/(https?:\/\/[^\s]+)/)?.[1]
    if (url && !cmd.includes(url)) tips.push(`确认 URL：${url}`)
  } else if (family === 'find') {
    if (!cmd.startsWith('find')) tips.push('找日志文件用 find 目录 -name 模式')
  } else if (family === 'ls') {
    if (!cmd.startsWith('ls')) tips.push('列目录用 ls，详情用 ls -la')
    if (expected.includes('-la') && !cmd.includes('-la')) tips.push('题目要求详细列表：ls -la')
  } else if (cmd === 'ls' || cmd.startsWith('cd ') || cmd === 'pwd') {
    tips.push('探索命令可用。本题需完成关卡要求的查看/筛选命令。')
  } else {
    tips.push('对照任务说明，确认命令类型与路径/参数。')
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
