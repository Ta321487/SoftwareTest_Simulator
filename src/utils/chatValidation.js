export function includesAny(text, keywords = []) {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(String(kw).toLowerCase()))
}

export function validateChatStructure(level, message) {
  const lower = message.toLowerCase()

  if (level.chatStructure === 'collaboration') {
    const actionWords = ['查', '核对', '确认', '看', '排查', '对比', '验证', '检查']
    const requestWords = ['请', '麻烦', '配合', '协调', '支持', '帮忙']
    const hasAction = actionWords.some((w) => message.includes(w))
    const hasRequest = requestWords.some((w) => message.includes(w))
    if (!hasAction) {
      return {
        ok: false,
        message: '回复缺少具体动作。写清你会先查/核对什么（如回调地址、配置、日志）。',
      }
    }
    if (!hasRequest) {
      return {
        ok: false,
        message: '回复缺少协作请求。请明确请对方配合做什么（如一起看日志、确认分支）。',
      }
    }
  }

  if (level.chatStructure === 'escalation') {
    const riskWords = ['阻塞', '风险', '影响', '上线', '延期', '来不及']
    const requestWords = ['请', '麻烦', '协调', '优先', '资源', '支持', '安排']
    const hasRisk = riskWords.some((w) => message.includes(w))
    const hasRequest = requestWords.some((w) => message.includes(w))
    if (!hasRisk) {
      return { ok: false, message: '对 PM 的升级需说清：什么卡住了、对上线有什么影响。' }
    }
    if (!hasRequest) {
      return { ok: false, message: '请提出明确的协调请求（如优先修复、加资源、调整排期）。' }
    }
  }

  if (level.chatStructure === 'hr') {
    const valueWords = ['质量', '用户', '缺陷', '体验', '风险', '验证', '细致', '负责']
    const hasValue = valueWords.some((w) => lower.includes(w))
    if (!hasValue) {
      return {
        ok: false,
        message: '结合「为用户发现风险」「保证质量」等说说为什么选测试、你能带来什么。',
      }
    }
  }

  return { ok: true }
}

const CHAT_TIER_LABELS = {
  empty: '待输入',
  weak: '偏笼统',
  ok: '基本合格',
  good: '协作到位',
}

/** 企微发送前预览（不卡关，帮冲星） */
export function getChatComposePreview(level, message) {
  const text = String(message || '').trim()
  const hasPreview = Boolean(level?.chatStructure || level?.chatKeywords?.length)
  if (!hasPreview) {
    return { hasPreview: false, tier: null, tips: [], matchedKeywords: [], tierLabel: '' }
  }

  const keywords = level.chatKeywords || []
  const minLen = level.chatMinLength ?? 8
  const minKw = level.chatMinKeywords ?? 1
  const matched = keywords.filter((kw) => includesAny(text, [kw]))
  const tips = []

  if (!text) {
    return {
      hasPreview: true,
      tier: 'empty',
      tierLabel: CHAT_TIER_LABELS.empty,
      tips: ['写清你会做什么、需要谁配合——别只回「收到」。'],
      matchedKeywords: [],
      keywordProgress: `0/${minKw}`,
    }
  }

  if (text.length < minLen) {
    tips.push(`回复偏短（至少 ${minLen} 字）。说明具体排查动作。`)
  }

  if (matched.length < minKw) {
    tips.push(`协作关键词不足（${matched.length}/${minKw}）。可提：测试环境、回调、配置、日志等。`)
  }

  const structure = validateChatStructure(level, text)
  if (!structure.ok) {
    tips.push(structure.message)
  }

  let tier = 'good'
  if (tips.length > 1 || (tips.length === 1 && text.length < minLen)) {
    tier = 'weak'
  } else if (tips.length === 1) {
    tier = 'ok'
  }

  return {
    hasPreview: true,
    tier,
    tierLabel: CHAT_TIER_LABELS[tier],
    tips,
    matchedKeywords: matched,
    keywordProgress: `${Math.min(matched.length, minKw)}/${minKw}`,
  }
}
