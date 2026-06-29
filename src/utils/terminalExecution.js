import { validateTerminalCommand, parseTailLineCount, parseGrepCommand } from './terminalValidation'

export { parseTailLineCount }

const DEFAULT_LOGS = [
  '[2026-06-28 14:30:01] INFO  Gateway - health check ok',
  '[2026-06-28 14:31:02] INFO  AuthController - session refresh',
  '[2026-06-28 14:32:01] ERROR PaymentService - timeout after 3000ms',
  '[2026-06-28 14:32:05] ERROR DBPool - connection pool exhausted (max=20)',
  '[2026-06-28 14:32:08] ERROR AuthController - NullPointerException at line 142',
  '[2026-06-28 14:32:12] ERROR Gateway - upstream 502 Bad Gateway',
  '[2026-06-28 14:32:15] ERROR OrderService - rollback transaction failed',
  '[2026-06-28 14:33:00] INFO  Gateway - health check ok',
]

function normalize(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
}

function extractPath(level) {
  const fromExpected = level.correctCommand?.match(/(\/[\w./-]+)/)
  if (fromExpected) return fromExpected[1]
  return level.logPath || '/var/log/app/error.log'
}

export function parseGrepKeyword(command) {
  return parseGrepCommand(command)?.pattern || null
}

export function getLogCorpus(level) {
  return level.storyLogs?.length ? [...level.storyLogs] : [...DEFAULT_LOGS]
}

function lineMatchesPattern(line, pattern, flags) {
  const text = line.toLowerCase()
  const pat = pattern.toLowerCase()
  if (flags.extended) {
    try {
      return new RegExp(pat, flags.ignoreCase ? 'i' : '').test(line)
    } catch {
      return text.includes(pat)
    }
  }
  if (flags.ignoreCase) return text.includes(pat)
  return text.includes(pat)
}

function filterGrepLines(corpus, parsed) {
  const { flags, pattern } = parsed
  if (!pattern) return []
  if (flags.invert) {
    return corpus.filter((line) => !lineMatchesPattern(line, pattern, flags))
  }
  return corpus.filter((line) => lineMatchesPattern(line, pattern, flags))
}

function grepWithContext(corpus, parsed) {
  const { flags, pattern } = parsed
  const context = flags.context ?? 0
  const result = []
  const seen = new Set()

  corpus.forEach((line, idx) => {
    if (!lineMatchesPattern(line, pattern, flags)) return
    for (let i = Math.max(0, idx - context); i <= Math.min(corpus.length - 1, idx + context); i++) {
      if (seen.has(i)) continue
      seen.add(i)
      const prefix = i === idx ? '' : i < idx ? '-- ' : '-- '
      result.push(i === idx ? line : `${prefix}${corpus[i]}`)
    }
  })
  return result
}

function executeGrep(raw, level, corpus, path) {
  const parsed = parseGrepCommand(raw)
  if (!parsed?.pattern) {
    return { outputLines: [], errorLine: 'grep: 缺少搜索模式' }
  }
  if (parsed.path && !normalize(raw).includes(parsed.path)) {
    return { outputLines: [], errorLine: `grep: ${path}: No such file or directory` }
  }

  let lines
  if (parsed.flags.context != null && parsed.flags.context > 0) {
    lines = grepWithContext(corpus, parsed)
  } else {
    lines = filterGrepLines(corpus, parsed)
  }

  if (parsed.pipeSegments.length > 0) {
    const wcPart = parsed.pipeSegments.join(' | ')
    if (/^wc\s+-l$/.test(wcPart)) {
      return {
        outputLines: [String(lines.length)],
        errorLine: null,
      }
    }
  }

  if (lines.length === 0) {
    return {
      outputLines: [`grep: 未在 ${path} 中找到匹配「${parsed.pattern}」的行`],
      errorLine: null,
    }
  }
  return { outputLines: lines, errorLine: null }
}

function executeTail(raw, level, corpus, path) {
  const norm = normalize(raw)
  if (parseTailLineCount(raw) == null && /\btail\b[^\n]*\s-(?:f|F)\b/.test(norm)) {
    const last = corpus.slice(-3)
    return {
      outputLines: [
        `--- following ${path} (last entries) ---`,
        ...last,
        '…（跟踪模式：新日志写入时会持续显示）',
      ],
      errorLine: null,
    }
  }

  const count = parseTailLineCount(raw)
  if (!count) {
    return { outputLines: [], errorLine: 'tail: 需要指定行数，例如 tail -n 100 或 tail -100' }
  }
  if (!norm.includes(path.toLowerCase())) {
    return {
      outputLines: [],
      errorLine: `tail: cannot open '${path}' for reading: No such file or directory`,
    }
  }
  const lines = corpus.slice(-Math.min(count, corpus.length))
  return {
    outputLines: [`--- last ${count} lines of ${path} ---`, ...lines],
    errorLine: null,
  }
}

function executeHead(raw, level) {
  const match = normalize(raw).match(/head\s+-n\s+(\d+)\s+(\/[\w./-]+)/)
  if (!match) {
    return { outputLines: [], errorLine: 'head: 需要 -n 行数与文件路径' }
  }
  const count = parseInt(match[1], 10)
  const filePath = match[2]
  const corpus = level.fileContent?.length ? level.fileContent : getLogCorpus(level)
  const lines = corpus.slice(0, Math.min(count, corpus.length))
  return {
    outputLines: [`--- first ${count} lines of ${filePath} ---`, ...lines],
    errorLine: null,
  }
}

function executeCat(raw, level) {
  const path = normalize(raw)
    .replace(/^cat\s+/, '')
    .trim()
  if (!path.startsWith('/')) {
    return { outputLines: [], errorLine: `cat: ${path}: No such file or directory` }
  }
  const content = level.fileContent?.length
    ? level.fileContent
    : ['spring.profiles.active=staging', 'server.port=8080']
  return {
    outputLines: [`--- ${path} ---`, ...content],
    errorLine: null,
  }
}

function executeCurl(raw, level) {
  const urlMatch = normalize(raw).match(/(https?:\/\/[^\s]+)/)
  if (!urlMatch) {
    return { outputLines: [], errorLine: 'curl: 缺少 URL' }
  }
  const body = level.curlResponse ?? '{"status":"ok","service":"auth-server"}'
  return {
    outputLines: [`HTTP/1.1 200 OK`, body],
    errorLine: null,
  }
}

function executeFind(raw, level) {
  const parsed = normalize(raw).match(/find\s+(\/[\w./-]+)/)
  if (!parsed) {
    return { outputLines: [], errorLine: 'find: 需要指定搜索目录' }
  }
  const results = level.findResults?.length
    ? level.findResults
    : [
        '/var/log/app/access.log',
        '/var/log/app/error.log',
        '/var/log/app/info.log',
        '/var/log/app/startup.log',
      ]
  return { outputLines: results, errorLine: null }
}

function executeLs(raw, level) {
  const listing = level.lsListing?.length
    ? level.lsListing
    : [
        'total 48',
        'drwxr-xr-x 2 app app 4096 Jun 28 09:00 .',
        '-rw-r--r-- 1 app app 128K error.log',
      ]
  return { outputLines: listing, errorLine: null }
}

/**
 * 模拟 Linux 命令执行，返回终端输出与校验结果
 */
export function executeTerminalCommand(command, level) {
  const raw = command.trim()
  const norm = normalize(raw)
  const path = extractPath(level)
  const corpus = getLogCorpus(level)
  const validation = validateTerminalCommand(raw, level)

  if (!norm) {
    return {
      outputLines: [],
      errorLine: null,
      validation: { isPass: false, message: '请输入命令后按 Enter。' },
    }
  }

  let result = { outputLines: [], errorLine: null }

  if (norm.startsWith('tail')) {
    result = executeTail(raw, level, corpus, path)
  } else if (norm.includes('grep')) {
    result = executeGrep(raw, level, corpus, path)
  } else if (norm.startsWith('head')) {
    result = executeHead(raw, level)
  } else if (norm.startsWith('cat')) {
    result = executeCat(raw, level)
  } else if (norm.startsWith('curl')) {
    result = executeCurl(raw, level)
  } else if (norm.startsWith('find')) {
    result = executeFind(raw, level)
  } else if (norm.startsWith('ls')) {
    result = executeLs(raw, level)
  } else {
    const bin = raw.split(/\s+/)[0]
    result = { outputLines: [], errorLine: `bash: ${bin}: command not found` }
  }

  return {
    outputLines: result.outputLines,
    errorLine: result.errorLine,
    validation,
  }
}
