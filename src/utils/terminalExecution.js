import { validateTerminalCommand } from './terminalValidation'

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

export function parseTailLineCount(command) {
  const norm = normalize(command)
  let match = norm.match(/tail\s+-n\s+(\d+)/)
  if (match) return parseInt(match[1], 10)
  match = norm.match(/tail\s+-(\d+)/)
  if (match) return parseInt(match[1], 10)
  return null
}

export function parseGrepKeyword(command) {
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

export function getLogCorpus(level) {
  return level.storyLogs?.length ? [...level.storyLogs] : [...DEFAULT_LOGS]
}

/**
 * 模拟 tail / grep 执行，返回终端输出与校验结果
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

  if (norm.startsWith('tail')) {
    const count = parseTailLineCount(raw)
    if (!norm.includes('tail')) {
      return {
        outputLines: [],
        errorLine: 'bash: tail: command not found',
        validation,
      }
    }
    if (!count) {
      return {
        outputLines: [],
        errorLine: 'tail: 需要指定行数，例如 tail -n 100 或 tail -100',
        validation,
      }
    }
    if (!norm.includes(path.toLowerCase())) {
      return {
        outputLines: [],
        errorLine: `tail: cannot open '${path}' for reading: No such file or directory`,
        validation,
      }
    }
    const lines = corpus.slice(-Math.min(count, corpus.length))
    return {
      outputLines: [`--- last ${count} lines of ${path} ---`, ...lines],
      errorLine: null,
      validation,
    }
  }

  if (norm.includes('grep')) {
    if (!norm.includes('grep')) {
      return {
        outputLines: [],
        errorLine: 'bash: grep: command not found',
        validation,
      }
    }
    const keyword = parseGrepKeyword(raw)
    if (!keyword) {
      return {
        outputLines: [],
        errorLine: 'grep: 缺少搜索模式',
        validation,
      }
    }
    if (!norm.includes(path.toLowerCase())) {
      return {
        outputLines: [],
        errorLine: `grep: ${path}: No such file or directory`,
        validation,
      }
    }
    const filtered = corpus.filter((line) => line.toLowerCase().includes(keyword.toLowerCase()))
    const outputLines =
      filtered.length > 0 ? filtered : [`grep: 未在 ${path} 中找到匹配「${keyword}」的行`]
    return {
      outputLines,
      errorLine: null,
      validation,
    }
  }

  const bin = raw.split(/\s+/)[0]
  return {
    outputLines: [],
    errorLine: `bash: ${bin}: command not found`,
    validation,
  }
}
