/** 接受关键词的同义表述 —— 避免合理测试用语被误杀（拒绝词不做扩展） */
const ACCEPT_ALIASES = {
  错误: ['失败', '报错', '异常', '无效', '不合规', 'invalid', 'illegal'],
  失败: ['错误', '登录失败', '提交失败', '不成功'],
  不允许: ['拒绝', '不能', '无法', '阻止', '不予', '禁止', '不可'],
  拒绝: ['不允许', '不能', '无法'],
  不能: ['无法', '不允许', '不可', '无法提交'],
  提示: ['报错', 'message', 'messages', '提示语', '提示信息', '错误信息', '报错信息'],
  必填: ['required', '不能为空', '必填项', '必须填写', '未填'],
  空: ['为空', '留空', '未填', '缺失', '没填'],
  范围: ['合法', '边界', '区间', '合规', '有效'],
  合法: ['合规', '有效', 'valid', '符合规则', '符合要求'],
  超: ['超过', '超出', '超长', '上限', '过大', '超出范围'],
  超过: ['超出', '超', '上限', '不能超过'],
  超出: ['超过', '超'],
  超长: ['超过', '超出', '位数'],
  长度: ['位数', '字符'],
  特殊: ['非法字符', '特殊字符', '符号'],
  字符: ['字符类型', '字母数字'],
  401: ['unauthorized', '未授权', '密码错', '密码错误', 'invalid password'],
  400: ['bad request', '缺参', '缺少', 'required', '参数缺失', 'username is required'],
  200: ['ok', 'success', '成功'],
  token: ['access_token', 'access token', 'jwt', '令牌'],
  允许: ['可以', '能', '可', '正常', '通过', '成功'],
  成功: ['通过', '正常', '可以', '允许'],
  通过: ['成功', '正常', '可以', '允许'],
  正常: ['成功', '通过', '可以', '允许'],
  登录: ['登入', 'sign in'],
  下月: ['下个月', '下一个月'],
  计划: ['安排', '打算', '规划'],
  学到: ['学会', '掌握', '了解'],
  收获: ['体会', '感悟', '成长'],
  排查: ['定位', '分析', '查'],
  Bug: ['bug', '缺陷', '问题单'],
  模块: ['功能', '业务'],
  用例: ['case', '测试点'],
  索引: ['index', '慢查询'],
  监控: ['告警', '观测', 'apm'],
}

/** 拒绝词匹配：避免「不允许」误触「允许」等子串 */
function includesReject(text, keywords = []) {
  const lower = text.toLowerCase()
  for (const kw of keywords) {
    const k = String(kw).toLowerCase()
    if (!lower.includes(k)) continue
    if (k === '允许' && (lower.includes('不允许') || lower.includes('不予允许'))) continue
    if (k === '成功' && lower.includes('不成功')) continue
    if (k === '通过' && lower.includes('不通过')) continue
    if (k === '正常' && lower.includes('不正常')) continue
    return true
  }
  return false
}

function expandAcceptKeywords(keywords = []) {
  const out = new Set()
  for (const kw of keywords) {
    const base = String(kw)
    out.add(base)
    out.add(base.toLowerCase())
    const aliases = ACCEPT_ALIASES[base] || ACCEPT_ALIASES[base.toLowerCase()] || []
    for (const alias of aliases) {
      out.add(alias)
      out.add(alias.toLowerCase())
    }
  }
  return [...out]
}

function includesAccept(text, keywords = []) {
  const lower = text.toLowerCase()
  return expandAcceptKeywords(keywords).some((kw) => lower.includes(String(kw).toLowerCase()))
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
  if (rejectKeywords.length && includesReject(text, rejectKeywords)) {
    return { ok: false, message: `「${name}」判断可能有误。${getFieldHint(field, level)}` }
  }
  const keywords = getFieldKeywords(field, level)
  if (keywords.length && !includesAccept(text, keywords)) {
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
