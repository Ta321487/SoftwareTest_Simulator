function normalize(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
}

function splitPipeSegments(command) {
  return command.split(/\s+\|\s+/).map((segment) => segment.trim())
}

function extractPathFromSegment(segment) {
  const match = segment.match(/(\/[\w./-]+)/)
  return match ? match[1] : null
}

function extractPath(expectedCommand) {
  return extractPathFromSegment(expectedCommand) || null
}

function parseGrepFlags(parts, startIdx) {
  const flags = { context: null, invert: false, ignoreCase: false, extended: false }
  let i = startIdx
  for (; i < parts.length; i++) {
    const part = parts[i]
    if (!part.startsWith('-')) break
    if (part === '-v') flags.invert = true
    else if (part === '-i') flags.ignoreCase = true
    else if (part === '-e') flags.extended = true
    else if (part === '-c') {
      const next = parts[i + 1]
      if (next && /^\d+$/.test(next)) {
        flags.context = parseInt(next, 10)
        i++
      }
    } else if (/^-c\d+$/.test(part)) {
      flags.context = parseInt(part.slice(2), 10)
    }
  }
  return { flags, nextIdx: i }
}

export function parseGrepCommand(command) {
  const norm = normalize(command)
  const segments = splitPipeSegments(norm)
  const grepSegment = segments[0]
  if (!grepSegment.includes('grep')) return null

  const parts = grepSegment.split(/\s+/)
  const grepIdx = parts.indexOf('grep')
  if (grepIdx < 0) return null

  const { flags, nextIdx } = parseGrepFlags(parts, grepIdx + 1)
  let pattern = null
  let path = null
  for (let i = nextIdx; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith('/')) {
      path = part
      break
    }
    if (!pattern) pattern = part.replace(/^['"]|['"]$/g, '')
  }

  return {
    flags,
    pattern,
    path,
    pipeSegments: segments.slice(1),
  }
}

function parseHeadCommand(command) {
  const norm = normalize(command)
  if (!norm.startsWith('head')) return null
  const match = norm.match(/head\s+-n\s+(\d+)\s+(\/[\w./-]+)/)
  if (!match) return null
  return { count: parseInt(match[1], 10), path: match[2] }
}

function parseCatCommand(command) {
  const norm = normalize(command)
  if (!norm.startsWith('cat ')) return null
  const path = extractPathFromSegment(norm)
  return path ? { path } : null
}

function parseCurlCommand(command) {
  const norm = normalize(command)
  if (!norm.startsWith('curl')) return null
  const urlMatch = norm.match(/(https?:\/\/[^\s]+)/)
  return urlMatch
    ? { url: urlMatch[1], silent: /\s-s\b/.test(norm) || norm.includes(' -s ') }
    : null
}

function parseFindCommand(command) {
  const norm = normalize(command)
  if (!norm.startsWith('find ')) return null
  const pathMatch = norm.match(/find\s+(\/[\w./-]+)/)
  const nameMatch = norm.match(/-name\s+(['"]?)([\w.*-]+)\1/)
  if (!pathMatch) return null
  return {
    root: pathMatch[1],
    namePattern: nameMatch ? nameMatch[2].replace(/^['"]|['"]$/g, '') : null,
  }
}

function parseLsCommand(command) {
  const norm = normalize(command)
  if (!norm.startsWith('ls')) return null
  const path = extractPathFromSegment(norm) || '.'
  return {
    path,
    long: norm.includes('-la') || norm.includes('-al'),
  }
}

function parseWcPipe(command) {
  const segments = splitPipeSegments(normalize(command))
  if (segments.length < 2) return null
  const wcPart = segments[segments.length - 1]
  if (!/^wc\s+-l$/.test(wcPart)) return null
  return { grepSegment: segments.slice(0, -1).join(' | ') }
}

function parseTailFollowMode(expected) {
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

function getCommandFamily(expected) {
  const norm = normalize(expected)
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

function grepFlagsMatch(expectedFlags, userFlags) {
  if (!!expectedFlags.invert !== !!userFlags.invert) return false
  if (!!expectedFlags.ignoreCase !== !!userFlags.ignoreCase) return false
  if (!!expectedFlags.extended !== !!userFlags.extended) return false
  if (expectedFlags.context != null && expectedFlags.context !== userFlags.context) return false
  if (expectedFlags.context == null && userFlags.context != null) return false
  return true
}

function patternsMatch(expectedPattern, userPattern, ignoreCase) {
  if (!expectedPattern || !userPattern) return false
  const exp = expectedPattern.toLowerCase()
  const usr = userPattern.toLowerCase()
  if (ignoreCase) return exp === usr
  return exp === usr
}

function validateGrep(userCmd, expectedCmd) {
  const expected = parseGrepCommand(expectedCmd)
  const user = parseGrepCommand(userCmd)
  if (!expected || !user) {
    return { isPass: false, message: '请用 grep 关键字 + 文件路径筛选日志。' }
  }
  if (!grepFlagsMatch(expected.flags, user.flags)) {
    if (expected.flags.context != null) {
      return {
        isPass: false,
        message: `用 grep -C ${expected.flags.context}，每条匹配结果前后各显示 ${expected.flags.context} 行。`,
      }
    }
    if (expected.flags.invert) {
      return { isPass: false, message: '用 grep -v 把 INFO 这类无关日志过滤掉。' }
    }
    if (expected.flags.ignoreCase) {
      return { isPass: false, message: '请使用 grep -i 进行大小写不敏感搜索。' }
    }
    if (expected.flags.extended) {
      return { isPass: false, message: '请使用 grep -E 支持多关键字匹配（如 TIMEOUT|ERROR）。' }
    }
    return { isPass: false, message: 'grep 参数与题目要求不一致，请对照提示调整。' }
  }
  if (expected.path && user.path !== expected.path) {
    return { isPass: false, message: `请指定日志文件路径：${expected.path}` }
  }
  if (
    !patternsMatch(
      expected.pattern,
      user.pattern,
      expected.flags.ignoreCase || expected.flags.extended
    )
  ) {
    return {
      isPass: false,
      message: `请用 grep 筛选关键字「${expected.pattern?.toUpperCase() || 'ERROR'}」。`,
    }
  }
  if (expected.pipeSegments.length !== user.pipeSegments.length) {
    return { isPass: false, message: '命令不完整，检查 | 后面的部分是否漏了。' }
  }
  for (let i = 0; i < expected.pipeSegments.length; i++) {
    if (expected.pipeSegments[i] !== user.pipeSegments[i]) {
      return { isPass: false, message: '管道后半段命令不正确，请对照题目要求。' }
    }
  }
  return { isPass: true, message: '命令执行成功！' }
}

function validateTail(userCmd, expectedCmd) {
  const norm = normalize(userCmd)
  const expected = normalize(expectedCmd)
  const path = extractPath(expectedCmd)
  const failMsg = '命令未能读取目标日志。请确认路径正确，并使用查看文件末尾内容的命令。'

  if (!norm.includes('tail')) {
    return { isPass: false, message: failMsg }
  }
  if (path && !norm.includes(path.toLowerCase())) {
    return { isPass: false, message: `请指定日志路径：${path}` }
  }
  if (parseTailFollowMode(expected)) {
    if (!hasTailFollowFlag(norm)) {
      return { isPass: false, message: '实时跟踪日志需使用 tail -f 参数。' }
    }
    return { isPass: true, message: '命令执行成功！' }
  }
  if (!parseTailLineCount(userCmd)) {
    return { isPass: false, message: '查看末尾日志需指定行数，如 tail -n 100 或 tail -100。' }
  }
  const expectedCount = parseTailLineCount(expectedCmd)
  const userCount = parseTailLineCount(userCmd)
  if (expectedCount && userCount !== expectedCount) {
    return {
      isPass: false,
      message: `题目要求查看最近 ${expectedCount} 行，当前为 ${userCount} 行，请调整 tail 的行数参数。`,
    }
  }
  return { isPass: true, message: '命令执行成功！' }
}

function validateHead(userCmd, expectedCmd) {
  const expected = parseHeadCommand(expectedCmd)
  const user = parseHeadCommand(userCmd)
  if (!expected || !user) {
    return { isPass: false, message: '请使用 head -n 行数 文件路径 查看文件开头。' }
  }
  if (user.path !== expected.path) {
    return { isPass: false, message: `请指定文件路径：${expected.path}` }
  }
  if (user.count !== expected.count) {
    return {
      isPass: false,
      message: `题目要求查看前 ${expected.count} 行，当前为 ${user.count} 行。`,
    }
  }
  return { isPass: true, message: '命令执行成功！' }
}

function validateCat(userCmd, expectedCmd) {
  const expected = parseCatCommand(expectedCmd)
  const user = parseCatCommand(userCmd)
  if (!expected || !user) {
    return { isPass: false, message: '请使用 cat 文件路径 查看文件内容。' }
  }
  if (user.path !== expected.path) {
    return { isPass: false, message: `请指定配置文件路径：${expected.path}` }
  }
  return { isPass: true, message: '命令执行成功！' }
}

function validateCurl(userCmd, expectedCmd) {
  const expected = parseCurlCommand(expectedCmd)
  const user = parseCurlCommand(userCmd)
  if (!expected || !user) {
    return { isPass: false, message: '请使用 curl 请求健康检查或接口地址。' }
  }
  if (user.url !== expected.url) {
    return { isPass: false, message: `请请求地址：${expected.url}` }
  }
  return { isPass: true, message: '命令执行成功！' }
}

function validateFind(userCmd, expectedCmd) {
  const expected = parseFindCommand(expectedCmd)
  const user = parseFindCommand(userCmd)
  if (!expected || !user) {
    return { isPass: false, message: '请使用 find 目录 -name 模式 查找文件。' }
  }
  if (user.root !== expected.root) {
    return { isPass: false, message: `请在目录 ${expected.root} 下查找。` }
  }
  if (expected.namePattern && user.namePattern !== expected.namePattern) {
    return {
      isPass: false,
      message: `请使用 -name "${expected.namePattern}" 匹配文件名。`,
    }
  }
  return { isPass: true, message: '命令执行成功！' }
}

function validateLs(userCmd, expectedCmd) {
  const expected = parseLsCommand(expectedCmd)
  const user = parseLsCommand(userCmd)
  if (!expected || !user) {
    return { isPass: false, message: '请使用 ls 查看目录内容。' }
  }
  if (expected.long && !user.long) {
    return { isPass: false, message: '请使用 ls -la 查看详细列表。' }
  }
  if (user.path !== expected.path) {
    return { isPass: false, message: `请列出目录：${expected.path}` }
  }
  return { isPass: true, message: '命令执行成功！' }
}

function validateWcPipe(userCmd, expectedCmd) {
  const expectedPipe = parseWcPipe(expectedCmd)
  const userPipe = parseWcPipe(userCmd)
  if (!expectedPipe || !userPipe) {
    return { isPass: false, message: '请先用 grep 筛选，再通过 | wc -l 统计行数。' }
  }
  return validateGrep(userPipe.grepSegment, expectedPipe.grepSegment)
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

  const family = getCommandFamily(level.correctCommand || '')

  switch (family) {
    case 'tail':
      return validateTail(command, level.correctCommand)
    case 'grep':
      return validateGrep(command, level.correctCommand)
    case 'head':
      return validateHead(command, level.correctCommand)
    case 'cat':
      return validateCat(command, level.correctCommand)
    case 'curl':
      return validateCurl(command, level.correctCommand)
    case 'find':
      return validateFind(command, level.correctCommand)
    case 'ls':
      return validateLs(command, level.correctCommand)
    case 'wc-pipe':
      return validateWcPipe(command, level.correctCommand)
    default:
      return { isPass: false, message: '命令未能完成关卡目标，请对照任务说明调整。' }
  }
}
