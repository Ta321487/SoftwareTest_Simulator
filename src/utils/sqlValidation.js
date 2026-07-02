export function normalizeSql(query) {
  return String(query || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function validateSqlQuery(query, level) {
  const norm = normalizeSql(query)

  if (!norm) {
    return { isPass: false, message: '请输入 SELECT 语句后点击执行。' }
  }

  if (!norm.startsWith('select')) {
    return { isPass: false, message: '这里只能查数据（SELECT），不要改或删数据。' }
  }

  const table = (level.sqlTable || '').toLowerCase()
  if (table && !norm.includes(table)) {
    return { isPass: false, message: `请查询表 ${level.sqlTable}。` }
  }

  const mustInclude = level.sqlMustInclude || []
  for (const token of mustInclude) {
    if (!norm.includes(String(token).toLowerCase())) {
      return { isPass: false, message: `WHERE 条件需包含「${token}」。` }
    }
  }

  if (level.sqlMustIncludeAny?.length) {
    const hit = level.sqlMustIncludeAny.some((token) => norm.includes(String(token).toLowerCase()))
    if (!hit) {
      return {
        isPass: false,
        message: `需筛选字段或条件：${level.sqlMustIncludeAny.join(' / ')}。`,
      }
    }
  }

  return { isPass: true, message: '查询正确！' }
}

export function executeSqlQuery(query, level) {
  const validation = validateSqlQuery(query, level)
  const rows = level.sqlResultRows || []
  return { rows, validation }
}
