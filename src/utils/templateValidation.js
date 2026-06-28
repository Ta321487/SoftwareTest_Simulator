function includesAny(text, keywords = []) {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(String(kw).toLowerCase()))
}

function getFieldName(field) {
  return field.label || field.scenario || field.field
}

function getFieldKeywords(field, level) {
  return field.fieldKeywords || level?.templateKeywords || []
}

function getFieldHint(field, level) {
  if (field.validationHint) return field.validationHint
  if (level?.requirement) {
    return `请结合需求规则（${level.requirement}）描述系统在该场景下的反应。`
  }
  return '请描述系统在该场景下的反应：是否允许、界面或提示如何。'
}

function validateField(field, text, level, defaultMinLength) {
  const name = getFieldName(field)
  const minLength = field.minLength ?? defaultMinLength

  if (!text) {
    return { ok: false, message: `「${name}」还未填写。${getFieldHint(field, level)}` }
  }
  if (minLength > 0 && text.length < minLength) {
    return {
      ok: false,
      message: `「${name}」描述过短（至少 ${minLength} 字）。${getFieldHint(field, level)}`,
    }
  }
  const rejectKeywords = field.fieldRejectKeywords || []
  if (rejectKeywords.length && includesAny(text, rejectKeywords)) {
    return { ok: false, message: `「${name}」判断可能有误。${getFieldHint(field, level)}` }
  }
  const keywords = getFieldKeywords(field, level)
  if (keywords.length && !includesAny(text, keywords)) {
    return { ok: false, message: `「${name}」描述不够完整。${getFieldHint(field, level)}` }
  }
  return { ok: true }
}

export function validateTemplateSubmission(level, values) {
  const defaultMinLength = level.templateMinLength || 0
  for (const field of level.templateFields) {
    const text = (values[field.field] || '').trim()
    const result = validateField(field, text, level, defaultMinLength)
    if (!result.ok) return result
  }
  return { ok: true }
}

const TIER_LABELS = {
  empty: '待填写',
  weak: '待完善',
  ok: '基本合格',
  good: '可以提交',
}

/** 模板提交前预览（不卡关，帮冲星） */
export function getTemplateComposePreview(level, values) {
  const fields = level?.templateFields || []
  if (!fields.length) {
    return { hasPreview: false, tier: null, tips: [], tierLabel: '', progress: '' }
  }

  const defaultMinLength = level.templateMinLength || 0
  const tips = []
  let okCount = 0

  for (const field of fields) {
    const text = (values[field.field] || '').trim()
    const result = validateField(field, text, level, defaultMinLength)
    if (result.ok) {
      okCount += 1
    } else if (tips.length < 3) {
      tips.push(result.message)
    }
  }

  let tier = 'good'
  if (okCount === 0) tier = 'empty'
  else if (okCount < fields.length) tier = tips.length > 1 ? 'weak' : 'ok'

  return {
    hasPreview: true,
    tier,
    tierLabel: TIER_LABELS[tier],
    tips,
    progress: `${okCount}/${fields.length}`,
  }
}
