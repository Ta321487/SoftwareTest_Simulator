export function validateMockServer(level, data) {
  const rules = data.rules || {}
  const path = (rules.path || '').trim()
  const status = String(rules.status || '').trim()
  const body = (rules.body || '').trim()

  if (!path) {
    return { isPass: false, message: '请填写 Mock 路径。' }
  }

  const expectedPath = level.mockPath || '/callback'
  if (path !== expectedPath) {
    return { isPass: false, message: `路径应为 ${expectedPath}` }
  }

  const expectedStatus = String(level.mockStatus ?? 200)
  if (status !== expectedStatus) {
    return { isPass: false, message: `HTTP 状态码应为 ${expectedStatus}` }
  }

  const mustInclude = level.mockBodyIncludes || []
  const bodyLower = body.toLowerCase()
  for (const token of mustInclude) {
    if (!bodyLower.includes(String(token).toLowerCase())) {
      return { isPass: false, message: `响应 body 需包含「${token}」` }
    }
  }

  if (level.mockDelayMs != null) {
    const delay = Number(rules.delayMs)
    if (Number.isNaN(delay) || delay !== level.mockDelayMs) {
      return { isPass: false, message: `延迟应设为 ${level.mockDelayMs} ms` }
    }
  }

  return { isPass: true, message: 'Mock 规则配置正确！' }
}
