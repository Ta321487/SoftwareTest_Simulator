function normalize(command) {
  return command.trim().replace(/\s+/g, ' ').toLowerCase()
}

function parseRedisCommand(command) {
  const norm = normalize(command)
  const parts = norm.split(/\s+/)
  const cmd = parts[0]
  if (cmd === 'get' && parts[1]) return { cmd: 'get', key: parts[1] }
  if (cmd === 'ttl' && parts[1]) return { cmd: 'ttl', key: parts[1] }
  if (cmd === 'keys' && parts[1])
    return { cmd: 'keys', pattern: parts[1].replace(/^['"]|['"]$/g, '') }
  return null
}

function parseExpected(command) {
  return parseRedisCommand(normalize(command))
}

export function validateRedisCommand(command, level) {
  const norm = normalize(command)
  const expected = normalize(level.correctCommand || '')

  if (!norm) {
    return { isPass: false, message: '请输入 Redis 命令后按 Enter。' }
  }

  if (norm === expected) {
    return { isPass: true, message: '命令执行成功！' }
  }

  const exp = parseExpected(level.correctCommand || '')
  const user = parseRedisCommand(command)
  if (!exp || !user) {
    return { isPass: false, message: '支持 GET、TTL、KEYS 三种命令，请按题目要求输入。' }
  }

  if (user.cmd !== exp.cmd) {
    const hint =
      exp.cmd === 'get'
        ? '用 GET 读取键值'
        : exp.cmd === 'ttl'
          ? '用 TTL 查看剩余秒数'
          : '用 KEYS 匹配键名'
    return { isPass: false, message: hint }
  }

  if (exp.cmd === 'keys') {
    if (user.pattern !== exp.pattern) {
      return { isPass: false, message: `KEYS 模式应为 ${exp.pattern}` }
    }
    return { isPass: true, message: '命令执行成功！' }
  }

  if (user.key !== exp.key) {
    return { isPass: false, message: `键名应为 ${exp.key}` }
  }

  return { isPass: true, message: '命令执行成功！' }
}

export function executeRedisCommand(command, level) {
  const validation = validateRedisCommand(command, level)
  const norm = normalize(command)
  const store = level.redisStore || {}

  if (norm.startsWith('get ')) {
    const key = parseRedisCommand(command)?.key
    const val = store[key]
    return {
      output: val != null ? String(val) : '(nil)',
      validation,
    }
  }

  if (norm.startsWith('ttl ')) {
    const key = parseRedisCommand(command)?.key
    const ttl = store[`${key}:ttl`]
    return {
      output: ttl != null ? String(ttl) : '-2',
      validation,
    }
  }

  if (norm.startsWith('keys ')) {
    const keys = level.redisKeys || Object.keys(store).filter((k) => !k.endsWith(':ttl'))
    return { output: keys.join('\n'), validation }
  }

  return { output: '', validation, error: 'ERR unknown command' }
}
