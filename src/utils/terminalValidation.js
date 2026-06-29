function normalize(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
}

function extractPath(expectedCommand) {
  const match = expectedCommand.match(/(\/[\w./-]+)/)
  return match ? match[1] : null
}

function parseGrepPattern(command) {
  const norm = normalize(command)
  const parts = norm.split(/\s+/)
  const grepIdx = parts.indexOf('grep')
  if (grepIdx < 0) return null
  for (let i = grepIdx + 1; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith('-')) continue
    if (part.startsWith('/')) return null
    return part
  }
  return null
}

function extractGrepKeyword(expectedCommand) {
  const norm = normalize(expectedCommand)
  const parts = norm.split(/\s+/)
  const grepIdx = parts.indexOf('grep')
  if (grepIdx < 0) return null
  for (let i = grepIdx + 1; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith('-')) continue
    if (part.startsWith('/')) break
    return part
  }
  return null
}

function hasTailLineCount(norm) {
  return /(?:-n\s+\d+|-\d+\b|\btail\b[^\n]*\s+\d+\s)/.test(norm)
}

function isTailFollowMode(expected) {
  return /\btail\b[^\n]*\s-(?:f|F)\b/.test(expected)
}

function hasTailFollowFlag(norm) {
  return /\btail\b[^\n]*\s-(?:f|F)\b/.test(norm)
}

export function parseTailLineCount(command) {
  const norm = normalize(command)
  let match = norm.match(/tail\s+-n\s+(\d+)/)
  if (match) return parseInt(match[1], 10)
  match = norm.match(/tail\s+-(\d+)/)
  if (match) return parseInt(match[1], 10)
  return null
}

export function validateTerminalCommand(command, level) {
  const norm = normalize(command)
  const expected = normalize(level.correctCommand || '')

  if (!norm) {
    return { isPass: false, message: '请输入命令后按 Enter。' }
  }

  if (norm === expected) {
    return { isPass: true, message: '命令执行成功！' }
  }

  const path = extractPath(level.correctCommand)
  const failMsg = expected.includes('grep')
    ? '命令未能筛出目标日志。请用 grep 关键字 + 文件路径。'
    : '命令未能读取目标日志。请确认路径正确，并使用查看文件末尾内容的命令。'

  if (expected.includes('tail')) {
    if (!norm.includes('tail')) {
      return { isPass: false, message: failMsg }
    }
    if (path && !norm.includes(path.toLowerCase())) {
      return { isPass: false, message: `请指定日志路径：${path}` }
    }
    if (isTailFollowMode(expected)) {
      if (!hasTailFollowFlag(norm)) {
        return { isPass: false, message: '实时跟踪日志需使用 tail -f 参数。' }
      }
      return { isPass: true, message: '命令执行成功！' }
    }
    if (!hasTailLineCount(norm)) {
      return { isPass: false, message: '查看末尾日志需指定行数，如 tail -n 100 或 tail -100。' }
    }
    const expectedCount = parseTailLineCount(level.correctCommand)
    const userCount = parseTailLineCount(command)
    if (expectedCount && userCount !== expectedCount) {
      return {
        isPass: false,
        message: `题目要求查看最近 ${expectedCount} 行，当前为 ${userCount} 行，请调整 tail 的行数参数。`,
      }
    }
    return { isPass: true, message: '命令执行成功！' }
  }

  if (expected.includes('grep')) {
    if (!norm.includes('grep')) {
      return { isPass: false, message: failMsg }
    }
    if (path && !norm.includes(path.toLowerCase())) {
      return { isPass: false, message: `请指定日志文件路径：${path}` }
    }
    const keyword = extractGrepKeyword(level.correctCommand)
    const userPattern = parseGrepPattern(command)
    if (!keyword || !userPattern || userPattern !== keyword.toLowerCase()) {
      return {
        isPass: false,
        message: `请用 grep 筛选关键字「${keyword?.toUpperCase() || 'ERROR'}」。`,
      }
    }
    return { isPass: true, message: '命令执行成功！' }
  }

  return { isPass: false, message: failMsg }
}
