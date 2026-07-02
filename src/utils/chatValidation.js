export function includesAny(text, keywords = []) {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(String(kw).toLowerCase()))
}

const COLLAB_REQUEST_WORDS = ['请', '麻烦', '配合', '协调', '支持', '帮忙', '帮我', '@']
const SELF_ACTION_RE = /(我先|我来|我会|我这边|我去|我打算|我准备).{0,24}(查|核对|确认|看|排查|对比|验证|检查|复现|跟进|更新|同步|说明|整理|圈|补|对)/
const PASSIVE_ASK_RE = /^你(来|帮|帮忙|配合|看|查|核对)|^你配合我|麻烦你|请.*(看|查|核对)/

const SELF_ACTION_PATTERNS = [
  SELF_ACTION_RE,
  /(?:^|[^你])我.{0,10}(去|来).{0,16}(核对|查|看|排查|验证|确认|复现|跟进|更新|同步|说明|对)/,
  /(?:^|[^你])我.{0,8}(看看|查|核对|对(一下|对)|排查).{0,24}(回调|网关|日志|配置|环境|地址|通知|路由|集成|流水线|竞态)/,
  /(?:^|[^你])我.{0,6}先.{0,10}(查|对|核对|看|排查)/,
  /(?:网关|回调|日志|配置|环境|地址|通知|路由|集成).{0,14}(我|先).{0,10}(查|看|核对|对|排查)/,
  /(?:测试|环境|staging|配置|回调|接口|订单|流水线).{0,24}(核对|排查|验证|检查|确认|说明)/,
  /(?:核对|排查|验证|确认|检查|复现|更新|同步|说明).{0,10}(一下|先看|下)/,
  /(?:打算|准备|计划).{0,14}(查|核对|排查|验证|更新|同步|说明|回归|补)/,
]

/** 协作里是否带了请对方配合（含口语「一起看日志」） */
export function hasCollabRequest(text) {
  const t = String(text || '')
  if (COLLAB_REQUEST_WORDS.some((w) => t.includes(w))) return true
  return /一起(看|查|核对|排查|对|弄)/.test(t)
}

/** 协作回复里是否写清「我会先…」 */
export function hasOwnCollabAction(text) {
  const t = String(text || '').trim()
  const ownIntent = /(?:^|\s)(我先|我来|我会|我去|我打算|我准备|我对)/.test(t)

  if (/^你(帮|来|配合)/.test(t)) {
    if (ownIntent) return true
    const afterAsk = t.replace(/^你(帮|来|配合)(我)?(看看|查|核对|看)?/u, '').trim()
    return afterAsk.length > 0 && SELF_ACTION_PATTERNS.some((re) => re.test(afterAsk))
  }

  return ownIntent || SELF_ACTION_PATTERNS.some((re) => re.test(t))
}

/** 只让开发干活、没写自己先做什么（整句以「你…」甩锅开头） */
export function isPassiveCollabReply(text) {
  const t = String(text || '').trim()
  if (hasOwnCollabAction(t)) return false
  if (/^你(帮|来|配合)/.test(t)) return true
  if (PASSIVE_ASK_RE.test(t)) return true
  return false
}

function getEffectiveMinLength(level, priorCount = 0) {
  const base = level?.chatMinLength ?? 8
  switch (level?.chatStructure) {
    case 'collaboration':
      if (priorCount > 0) return Math.max(8, base - 10)
      return Math.max(8, base - 6)
    case 'hr':
      if (priorCount > 0) return Math.max(10, base - 14)
      return Math.max(12, base - 8)
    case 'escalation':
      if (priorCount > 0) return Math.max(8, base - 12)
      return Math.max(10, base - 6)
    default:
      if (priorCount > 0) return Math.max(8, base - 8)
      return base
  }
}

const HR_VALUE_WORDS = ['质量', '用户', '缺陷', '体验', '风险', '验证', '细致', '负责', '价值']
const HR_BACKGROUND_WORDS = ['培训', '练习', '项目', '经验', '背景', '登录', '模块', '学习', '大学', '计算机']

export function hasHrValueIntent(text) {
  const lower = String(text || '').toLowerCase()
  if (HR_VALUE_WORDS.some((w) => lower.includes(w))) return true
  return /想做测试|为什么.*测试|帮.*用户|发现.*问题|保证.*质量/.test(text)
}

export function hasHrBackground(text) {
  const t = String(text || '')
  return HR_BACKGROUND_WORDS.some((w) => t.includes(w)) || /做过|参加过|练过|毕业/.test(t)
}

export function hasEscalationRisk(text) {
  const t = String(text || '')
  const riskWords = ['阻塞', '风险', '影响', '上线', '延期', '来不及', 'Blocker', 'Major', '发版', '卡点', '没修']
  return riskWords.some((w) => t.includes(w)) || /怕.*上线|没法.*发布|来不及/.test(t)
}

export function hasEscalationRequest(text) {
  const t = String(text || '')
  if (['请', '麻烦', '协调', '优先', '资源', '支持', '安排', '@', '帮忙'].some((w) => t.includes(w))) {
    return true
  }
  return /需要.*(协调|支持|优先|资源|排期)/.test(t)
}

function getEffectiveMinKeywords(level, text, priorCount = 0) {
  const base = level?.chatMinKeywords ?? 1

  if (level?.chatStructure === 'collaboration') {
    const hasAction = hasOwnCollabAction(text)
    const hasRequest = hasCollabRequest(text)
    const keywords = level.chatKeywords || []
    const matched = keywords.filter((kw) => String(text).toLowerCase().includes(String(kw).toLowerCase()))
    const hasTopic =
      matched.length > 0 || STRUCTURE_TOPIC_ANCHORS.collaboration.some((a) => text.includes(a))
    if (hasAction && hasRequest && (hasTopic || priorCount > 0)) {
      return Math.max(1, base - 1)
    }
    return base
  }

  if (level?.chatStructure === 'hr') {
    if (hasHrValueIntent(text) && (hasHrBackground(text) || priorCount > 0)) {
      return Math.max(1, base - 1)
    }
    if (priorCount > 0 && (hasHrBackground(text) || hasHrValueIntent(text))) {
      return Math.max(1, base - 1)
    }
    return base
  }

  if (level?.chatStructure === 'escalation') {
    if (hasEscalationRisk(text) && hasEscalationRequest(text)) {
      return Math.max(1, base - 1)
    }
    if (priorCount > 0 && hasEscalationRisk(text)) {
      return Math.max(1, base - 1)
    }
    return base
  }

  return base
}

const OFF_TOPIC_RE = /天气|吃饭|外卖|游戏|请假|工资|恋爱|电影|周末|无聊|不知道说|随便|跑题/
const STRUCTURE_TOPIC_ANCHORS = {
  hr: ['测试', '质量', '培训', '项目', '工作', '面试', '背景', '经验', '用户', '缺陷', '细致', '学习', '计算机', '编程', '大学', '专业'],
  collaboration: [
    '测试',
    '环境',
    '配置',
    '日志',
    '回调',
    '排查',
    '配合',
    '接口',
    '通知',
    '地址',
    '网关',
    '抓包',
  ],
  escalation: ['阻塞', '上线', '风险', '排期', '协调', '发版', '资源', 'bug', '延期', '影响', '修复'],
}

/** 与当前关卡话题明显无关（各 structured chat 通用） */
export function isOffTopicReply(level, message) {
  const text = String(message || '').trim()
  if (!text || isAckStyleReply(text) || isMeaninglessReply(text)) return false
  if (OFF_TOPIC_RE.test(text)) return true

  const keywords = level?.chatKeywords || []
  if (keywords.some((kw) => text.toLowerCase().includes(String(kw).toLowerCase()))) return false

  const anchors = [
    ...keywords,
    ...(STRUCTURE_TOPIC_ANCHORS[level?.chatStructure] || []),
    ...(level?.chatTopicAnchors || []),
  ]
  if (anchors.some((a) => text.includes(a))) return false

  if (level?.chatStructure === 'collaboration' && isPassiveCollabReply(text)) return false

  return text.length >= 6
}

export function validateChatStructure(level, message) {
  if (level.chatStructure === 'collaboration') {
    const hasAction = hasOwnCollabAction(message)
    const hasRequest = hasCollabRequest(message)
    if (!hasAction) {
      return {
        ok: false,
        message: isPassiveCollabReply(message)
          ? '别只让开发查。写清你会先核对什么，再请对方配合（如一起看日志）。'
          : '回复缺少具体动作。写清你会先查/核对什么（如回调地址、配置、日志）。',
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
    if (!hasEscalationRisk(message)) {
      return { ok: false, message: '对 PM 的升级需说清：什么卡住了、对上线有什么影响。' }
    }
    if (!hasEscalationRequest(message)) {
      return { ok: false, message: '请提出明确的协调请求（如优先修复、加资源、调整排期）。' }
    }
  }

  if (level.chatStructure === 'hr') {
    if (!hasHrValueIntent(message)) {
      return {
        ok: false,
        message: hasHrBackground(message)
          ? '背景听到了。结合用户或质量角度，说说为什么想做测试、你能带来什么。'
          : '结合「为用户发现风险」「保证质量」等说说为什么选测试、你能带来什么。',
      }
    }
  }

  return { ok: true }
}

/** 合并多轮回复为一条判题文本 */
export function combineChatMessages(priorMessages = [], latestMessage = '') {
  const parts = [...(priorMessages || []), latestMessage].map((s) => String(s || '').trim()).filter(Boolean)
  return parts.join(' ')
}

/** 分析 chat 回复缺口，供弱答追问选用 */
export function analyzeChatReply(level, message, options = {}) {
  const text = String(message || '').trim()
  const lower = text.toLowerCase()
  const keywords = level.chatKeywords || []
  const matched = keywords.filter((kw) => lower.includes(String(kw).toLowerCase()))
  const priorCount = options.priorMessages?.length ?? 0
  const minLen = getEffectiveMinLength(level, priorCount)
  const minKw = getEffectiveMinKeywords(level, text, priorCount)
  const structure = validateChatStructure(level, text)

  const weaknesses = []
  if (isMeaninglessReply(text)) weaknesses.push('meaningless')
  if (isOffTopicReply(level, text)) weaknesses.push('offTopic')
  if (text.length < minLen) weaknesses.push('tooShort')
  if (matched.length < minKw) weaknesses.push('missingKeywords')
  if (isKeywordStuffing(level, text, matched, priorCount)) weaknesses.push('keywordStuffing')

  if (level.chatStructure === 'collaboration') {
    if (isPassiveCollabReply(text)) weaknesses.push('passiveReply')
    if (!hasOwnCollabAction(text)) weaknesses.push('missingAction')
    if (!hasCollabRequest(text)) weaknesses.push('missingRequest')
  } else if (level.chatStructure === 'escalation') {
    if (!hasEscalationRisk(text)) weaknesses.push('missingRisk')
    if (!hasEscalationRequest(text)) weaknesses.push('missingRequest')
  } else if (level.chatStructure === 'hr') {
    if (!hasHrValueIntent(text)) weaknesses.push('missingStructure')
  } else if (!structure.ok) {
    weaknesses.push('missingStructure')
  }

  return { text, matched, weaknesses, structure, minLen, minKw }
}

const ACK_ONLY_RE = /^(收到|好的|嗯|行|ok|OK)[，,。.!！\s]*$/

/** 是否属于「收到 / 我看看」式空应付（用于追问措辞，避免误伤已有协作意图的短句） */
export function isAckStyleReply(text) {
  const t = String(text || '').trim()
  if (!t) return false
  if (ACK_ONLY_RE.test(t)) return true
  if (/^(收到|好的)[，,。.]?我?(看看|跟进|了解)/.test(t)) return true
  if (/^(我看看|先看看|跟进一下)[，,。.!！]?$/.test(t)) return true
  return false
}

const MEANINGLESS_FILLER_RE = /^(额+|呃+|emmm+|emm+|啊+|哦+|恩+|嗯+)[。！？.…~～]*$/i

/** 省略号、纯标点、嗯啊等无有效内容的输入 */
export function isMeaninglessReply(text) {
  const t = String(text || '').trim()
  if (!t) return true
  if (isAckStyleReply(t)) return false

  const compact = t.replace(/\s/g, '')
  if (!compact) return true
  if (/^[.。…·]{2,}$/.test(compact)) return true
  if (/^[.?!！？…~～\-—_·]{2,}$/.test(compact)) return true

  const meaningful = compact.replace(/[.。…·,!！?？~～\-—_…\s]/g, '')
  if (meaningful.length === 0) return true
  if (MEANINGLESS_FILLER_RE.test(t)) return true
  if (/^(哈+|啊[？?]?|哦+[？?]?)[，,、。.!！?？…~～]*$/.test(t)) return true

  return false
}

function getMeaninglessComposeHint(text, structure) {
  const t = String(text || '').trim()
  if (/^[.。…·]{2,}$/.test(t.replace(/\s/g, ''))) return '别发省略号，用完整句子说清楚。'
  if (/^(哈+|啊|哦|嗯|额|呃)/.test(t)) {
    if (structure === 'hr') return '别只回语气词，说说背景或为什么想做测试。'
    if (structure === 'escalation') return '别只回语气词，说清阻塞点和需要的协调。'
    return '别只回语气词，写清你会先做什么、需要谁配合。'
  }
  return '用完整句子回答，别只发标点或符号。'
}

/** 从关卡配置提取话题上下文，供动态追问 */
export function getLevelTopicContext(level) {
  const kw = level?.chatKeywords || []
  return {
    k1: kw[0] || '这块',
    k2: kw[1] || kw[0] || '配置',
    k3: kw[2] || kw[1] || '环境',
    pair: kw.slice(0, 2).join('、') || '相关项',
    triple: kw.slice(0, 3).join('、') || '排查点',
    hint: level?.chatHint || '',
    placeholder: level?.chatPlaceholder || '',
    isCallbackScenario: kw.some((k) => /回调|通知|notify/i.test(k)) || /回调|通知/.test(level?.content || ''),
  }
}

/** 从用户回复里提取可接话的片段 */
export function extractUserEcho(text, level) {
  const keywords = level?.chatKeywords || []
  const lower = String(text || '').toLowerCase()
  const matched = keywords.filter((kw) => lower.includes(String(kw).toLowerCase()))
  return {
    matched,
    firstKw: matched[0] || null,
    mentionsLog: /日志|grep/i.test(text),
    mentionsCallback: /回调|notify|通知/i.test(text),
    mentionsConfig: /配置|环境|staging|网关|路由/i.test(text),
    mentionsTraining: /培训|练习|项目|登录/i.test(text),
    mentionsRisk: /阻塞|风险|影响|上线|延期|Major|Blocker/i.test(text),
  }
}

/** 关键词堆叠但缺少完整表述 */
export function isKeywordStuffing(level, text, matchedKeywords, priorCount = 0) {
  const keywords = level?.chatKeywords || []
  const matched =
    matchedKeywords ??
    keywords.filter((kw) => String(text).toLowerCase().includes(String(kw).toLowerCase()))
  const minLen = getEffectiveMinLength(level, priorCount)
  const minKw = level?.chatMinKeywords ?? 2
  if (matched.length < minKw) return false

  const hasSentenceFlow = /[，,。；]|因为|所以|先|然后|麻烦|请|我会|我先|打算|需要|建议|申请|一起/.test(
    text
  )
  if (text.length >= minLen && hasSentenceFlow) return false
  if (priorCount > 0 && hasSentenceFlow) return false
  if (text.length < minLen && matched.length >= minKw) return true
  if (matched.length >= minKw + 1 && text.length < minLen + 10 && !hasSentenceFlow) return true
  return false
}

function buildDynamicFollowUp(level, key, message, analysis, chatHistory = []) {
  const text = String(message || '').trim()
  const ctx = getLevelTopicContext(level)
  const echo = extractUserEcho(text, level)
  const dev = resolveChatFollowUpSender(level, chatHistory)
  const devName = dev.sender?.split(/[·\s]/)[0] || '同事'
  const defaults = FOLLOW_UP_SETS[level.chatStructure] || HR_FOLLOW_UPS
  const fallback = defaults[key] || defaults.missingKeywords

  let textOut = fallback.text
  let hint = fallback.hint || ctx.hint
  let placeholder = fallback.placeholder || ctx.placeholder

  switch (level.chatStructure) {
    case 'collaboration':
      switch (key) {
        case 'meaningless':
          if (/^啊[？?]?$/.test(text)) {
            textOut = `怎么了？${ctx.k1} 这事还没说完——你打算先核对哪一块？`
          } else if (/^哈+/.test(text)) {
            textOut = `…这不好笑吧。${ctx.k1} 这条线，你打算先做什么？`
          } else if (/^[.。…]/.test(text.replace(/\s/g, ''))) {
            textOut = `……卡住了？${ctx.k1} 这条线，你打算先核对哪一块？`
          } else {
            textOut = `…没看懂。${ctx.k1} 你先查什么、需要我配合什么？`
          }
          hint = getMeaninglessComposeHint(text, level.chatStructure)
          break
        case 'offTopic':
          textOut = `这跟 ${ctx.k1} 不太相关。你说说你这边先做什么、需要我配合什么？`
          break
        case 'passiveReply':
          if (echo.mentionsLog) {
            textOut = `日志可以一起看——但你测试这边先核对什么？${ctx.pair}？`
          } else if (echo.firstKw) {
            textOut = `「${echo.firstKw}」这条可以聊——但你打算先做什么？别光让我这边查。`
          } else {
            textOut = `测试这边你先做什么？比如核对 ${ctx.pair}，需要我配合再说一声。`
          }
          break
        case 'tooShort':
          if (isAckStyleReply(text)) {
            textOut = ctx.isCallbackScenario
              ? `别光回「收到」。我这边 ${ctx.k1} 看着正常——你打算先对哪块？${ctx.pair}？`
              : `别光回「收到」。${ctx.k1} 这块你打算先对哪一步？`
          } else if (echo.firstKw) {
            textOut = `嗯，${echo.firstKw} 提到了——展开说说：你先查什么、要我配合什么？`
          } else {
            textOut = `嗯，打算从哪步开始？${ctx.pair} 里你先对哪块？`
          }
          break
        case 'keywordStuffing':
          textOut = `词列了不少，但没说清你接下来具体做什么——${ctx.pair} 里你先动哪一步？`
          hint = '用完整句子：我会先…，麻烦配合…'
          break
        case 'missingAction':
          textOut = echo.firstKw
            ? `「${echo.firstKw}」方向对，但你这边具体先做什么？查、核对还是复现？`
            : `你那边先查哪步？${ctx.triple} 里先从哪块下手？`
          break
        case 'missingRequest':
          textOut = echo.mentionsLog
            ? `需要我配合 grep 日志还是抓包？把要看的点 @ 我一下。`
            : `需要我配合看什么？一起对 ${ctx.k2} 还是看日志？`
          break
        case 'missingKeywords':
          textOut = `把 ${ctx.pair} 这些点带上，我好判断怎么配合。`
          break
        default:
          break
      }
      break

    case 'escalation':
      switch (key) {
        case 'meaningless':
          if (/^啊[？?]?$/.test(text)) {
            textOut = `在吗？${ctx.k1} 阻塞的事——先说卡在哪、对 ${ctx.k2 || '上线'} 影响多大。`
          } else if (/^哈+/.test(text)) {
            textOut = `…先别乐。${ctx.k1} 什么状况，对 ${ctx.k2 || '上线'} 影响多大？`
          } else {
            textOut = `在吗？${ctx.k1} 什么状况——先说卡在哪、对 ${ctx.k2 || '上线'} 影响多大。`
          }
          hint = getMeaninglessComposeHint(text, level.chatStructure)
          break
        case 'offTopic':
          textOut = `先回到 ${ctx.k1 || '发版'}——什么阻塞了、影响什么？`
          break
        case 'tooShort':
          textOut = echo.mentionsRisk
            ? `${echo.firstKw || '阻塞'} 听到了——对上线/排期影响多大？需要协调什么？`
            : `稍等，什么卡住了？对 ${ctx.k2 || '上线'} 影响多大？`
          break
        case 'keywordStuffing':
          textOut = `列了 ${echo.matched.length} 个词，但没说清阻塞点和影响——展开成两句？`
          break
        case 'missingRisk':
          textOut = `对 ${ctx.k2 || '排期'} 有什么影响？测试签字能不能给？`
          break
        case 'missingRequest':
          textOut = `需要协调什么？优先级、资源还是排期？`
          break
        case 'missingKeywords':
          textOut = `把 ${ctx.pair} 和需要协调的点写清楚。`
          break
        default:
          break
      }
      break

    case 'hr':
    default:
      switch (key) {
        case 'meaningless':
          if (/^哈+/.test(text)) {
            textOut = `…咱们在面试呢。能再说说为什么想做测试吗？`
          } else {
            textOut = `嗯？没听清——能再说说为什么想做测试吗？`
          }
          hint = getMeaninglessComposeHint(text, level.chatStructure)
          break
        case 'offTopic':
          textOut = `咱们先回到面试——你为什么选测试？结合背景或经历说说就行。`
          break
        case 'tooShort':
          textOut = echo.mentionsTraining
            ? `培训/项目经历可以展开一点——你还做过哪些跟测试相关的练习？`
            : `嗯，能具体一点吗？简单说说背景，以及做过哪些跟测试相关的练习。`
          break
        case 'keywordStuffing':
          textOut = `这几个词都听到了——用一两句话串起来：背景 + 为什么想做测试？`
          break
        case 'missingStructure':
          textOut = echo.mentionsTraining
            ? `培训经历听到了。你为什么想做测试？从用户或质量角度，你怎么理解这份工作的价值？`
            : `背景我大概了解了。你为什么想做测试？从用户或质量角度说说。`
          break
        case 'missingKeywords':
          textOut = echo.firstKw
            ? `「${echo.firstKw}」可以展开——结合具体体会，再说说为什么适合测试。`
            : `能结合培训或项目里的具体体会再说说吗？`
          break
        default:
          break
      }
      break
  }

  return { text: textOut, hint, placeholder }
}

function buildDynamicManagerNudge(key, level, devName = '同事') {
  const ctx = getLevelTopicContext(level)
  const custom = level?.chatManagerNudges?.[key]
  if (custom) return custom

  switch (key) {
    case 'meaningless':
      return `@你 别潜水，跟 ${devName} 说一下打算先做什么。`
    case 'offTopic':
      return `别跑题，${ctx.k1} 这事还没结论，跟 ${devName} 把方案说清楚。`
    case 'passiveReply':
      return `对，测试先写清自己做什么，再请 ${devName} 配合。`
    case 'keywordStuffing':
      return `别堆词，跟 ${devName} 用完整句子说排查/协作方案。`
    case 'tooShort':
      return `对，别空泛回复，跟 ${devName} 把 ${ctx.k1} 的方案说清楚。`
    case 'missingAction':
      return `写清你打算先查哪块，${devName} 才好配合。`
    case 'missingRequest':
      return `需要 ${devName} 配合什么，也一并 @ 说清楚。`
    case 'missingKeywords':
      return `把 ${ctx.pair} 这些关键信息带上。`
    default:
      return `跟 ${devName} 对一下，先把 ${ctx.k1} 的方案讲清楚。`
  }
}


const MANAGER_SENDER_RE = /组长|经理|PM|主管|总监|Leader|顾问/i

/** 协作关追问默认由开发同事接话，而非派活的组长/PM */
export function resolveChatFollowUpSender(level, chatHistory = []) {
  const others = (chatHistory || []).filter((m) => m.role === 'other' || m.role == null)
  if (!others.length) {
    return { sender: '同事', avatar: '👨‍💻' }
  }

  if (level?.chatFollowUpSender) {
    const hit = others.find((m) => m.sender === level.chatFollowUpSender)
    if (hit) return { sender: hit.sender, avatar: hit.avatar }
  }

  if (level?.chatStructure === 'collaboration') {
    const devPeer = others.find((m) => !MANAGER_SENDER_RE.test(String(m.sender || '')))
    const pick = devPeer || others[0]
    return { sender: pick.sender, avatar: pick.avatar }
  }

  const last = others[others.length - 1]
  return { sender: last.sender, avatar: last.avatar }
}

/** 协作群里派活/跟进的组长、PM 等角色 */
export function resolveChatManagerSpeaker(chatHistory = []) {
  const others = (chatHistory || []).filter((m) => m.role === 'other' || m.role == null)
  const manager = others.find((m) => MANAGER_SENDER_RE.test(String(m.sender || '')))
  if (!manager) return null
  return { sender: manager.sender, avatar: manager.avatar }
}

const DEFAULT_COLLAB_MANAGER_REPLY = '好，你们先排查，有结论群里同步一下。'

const HR_FOLLOW_UPS = {
  meaningless: {
    text: '嗯？没听清——能再说说为什么想做测试吗？',
    placeholder: '例：我参加过测试培训，在登录模块练过圈测试点…',
    hint: '别发省略号，用完整句子回答。',
  },
  offTopic: {
    text: '咱们先回到面试题——你为什么想做测试？可以结合背景或培训经历说说。',
    placeholder: '例：我参加过测试培训，在登录模块练过圈测试点…',
    hint: '回到「为什么做测试 / 你的优势」。',
  },
  tooShort: {
    text: '嗯，能具体一点吗？简单说说你的背景，以及做过哪些跟测试相关的练习。',
    placeholder: '例：我参加过测试培训，在登录模块练过圈测试点、写用例…',
    hint: '补背景即可，不用一次说满。',
  },
  missingStructure: {
    text: '培训经历我听到了。你为什么想做测试？从用户或质量角度，你怎么理解这份工作的价值？',
    placeholder: '例：测试能在上线前帮用户发现缺陷，我做事比较细致…',
    hint: '这一遍重点说动机和价值，别背定义。',
  },
  missingKeywords: {
    text: '能结合你在登录模块（或培训）里的具体体会再说说吗？',
    placeholder: '例：练过 PRD 圈点、提交 Bug，更关注用户能不能顺利用…',
    hint: '带上「测试 / 质量 / 用户 / 细致」里的一两个词就行。',
  },
}

const COLLAB_FOLLOW_UPS = {
  meaningless: {
    text: '……你这是卡住了？说句话——打算先核对回调 notify 地址，还是网关配置？',
    placeholder: '例：我先核对测试环境的回调 notify 地址…',
    hint: '别发省略号，写清你会先查什么。',
  },
  offTopic: {
    text: '这跟回调通知不太相关。你说说你打算先核对测试环境哪块？',
    placeholder: '例：我先核对测试环境的回调 notify 地址…',
    hint: '回到排查：你会先查什么、需要谁配合。',
  },
  passiveReply: {
    text: '测试这边你先做什么？核对回调地址还是配置？需要我配合再说清楚。',
    placeholder: '例：我先核对 STAGING 回调 URL，麻烦配合 grep 通知日志…',
    hint: '先写「我会先…」，再写「麻烦配合…」。',
  },
  tooShort: {
    text: '嗯，你打算先对测试环境哪块？回调 notify 地址还是网关配置？',
    placeholder: '例：我先核对测试环境的回调 notify 地址…',
    hint: '跟开发说清楚：你会先查 / 核对什么。',
  },
  missingAction: {
    text: '你那边先查哪步？回调 URL、notify 配置还是路由？',
    placeholder: '例：我先核对 STAGING 的回调 URL 是否配对…',
    hint: '补上动作：查、核对、确认、排查。',
  },
  missingRequest: {
    text: '需要我配合看什么？一起 grep 日志还是抓包？',
    placeholder: '例：麻烦 @李工 配合看支付网关回调日志…',
    hint: '加上「麻烦 / 请 / 配合」，明确要开发帮什么。',
  },
  missingKeywords: {
    text: '把测试环境回调 / 日志里你要对的点说一下，我好配合。',
    placeholder: '例：测试环境回调 404，麻烦配合 grep 通知日志…',
    hint: '带上环境、回调、配置、日志等词。',
  },
}

const ESCALATION_FOLLOW_UPS = {
  meaningless: {
    text: '在吗？什么卡住了发版——先说阻塞点和对上线的影响。',
    placeholder: '例：支付回调未验收，阻塞今晚 staging 签字…',
    hint: '别发省略号，说清楚阻塞和影响。',
  },
  offTopic: {
    text: '先回到发版阻塞——什么卡住了？对今晚上线影响多大？',
    placeholder: '例：支付回调未验收，阻塞 staging 签字…',
    hint: '回到阻塞点、影响面和协调请求。',
  },
  tooShort: {
    text: '稍等，什么卡住了？对上线影响多大？',
    placeholder: '例：支付回调未验收，阻塞今晚 staging 签字…',
    hint: '先说阻塞点和影响面。',
  },
  missingRisk: {
    text: '对上线 / 排期有什么影响？测试签字能不能给？',
    placeholder: '例：阻塞回归，今晚发版可能来不及…',
    hint: '补上：阻塞、风险、影响、上线、延期。',
  },
  missingRequest: {
    text: '需要 PM 协调什么？优先级、资源还是排期？',
    placeholder: '例：麻烦协调开发优先修回调，或调整今晚发版…',
    hint: '加上明确的协调请求。',
  },
  missingKeywords: {
    text: '把卡住的原因和需要协调的点写清楚。',
    placeholder: '例：Flaky 门禁阻断发布，请协调先标 unstable…',
    hint: '带上阻塞、风险、协调、排期等词。',
  },
}

const FOLLOW_UP_SETS = {
  hr: HR_FOLLOW_UPS,
  collaboration: COLLAB_FOLLOW_UPS,
  escalation: ESCALATION_FOLLOW_UPS,
}

const FOLLOW_UP_ORDER = {
  hr: ['meaningless', 'offTopic', 'keywordStuffing', 'tooShort', 'missingStructure', 'missingKeywords'],
  collaboration: [
    'meaningless',
    'offTopic',
    'passiveReply',
    'keywordStuffing',
    'tooShort',
    'missingAction',
    'missingRequest',
    'missingKeywords',
  ],
  escalation: ['meaningless', 'offTopic', 'keywordStuffing', 'tooShort', 'missingRisk', 'missingRequest', 'missingKeywords'],
}

/** 结构化 chat：首轮弱答是否触发一次追问 */
export function shouldOfferChatFollowUp(level, priorMessages = []) {
  if (level.chatFollowUp === false) return false
  if (!level.chatStructure || !FOLLOW_UP_SETS[level.chatStructure]) return false
  if (priorMessages.length > 0) return false
  return true
}

export function getChatFollowUpNotice(level, chatHistory = []) {
  switch (level?.chatStructure) {
    case 'hr':
      return '面试官想再听几句，接着上面的聊。'
    case 'collaboration': {
      const dev = resolveChatFollowUpSender(level, chatHistory)
      const manager = resolveChatManagerSpeaker(chatHistory)
      const devName = dev.sender?.split(/[·\s]/)[0] || '同事'
      return manager
        ? `${devName} 和 ${manager.sender?.split(/[·\s]/)[0] || '组长'} 在等你的方案，接着回。`
        : `${devName} 在等你说具体方案，接着回。`
    }
    case 'escalation':
      return 'PM 需要你补充影响面和协调请求。'
    default:
      return '对方想再听几句，接着上面的聊。'
  }
}

/** 按缺口选一句追问（动态接话，关卡 chatFollowUps 可覆盖） */
export function getChatFollowUp(level, message, chatHistory = []) {
  const analysis = analyzeChatReply(level, message)
  const order = FOLLOW_UP_ORDER[level.chatStructure] || FOLLOW_UP_ORDER.hr
  const key = order.find((k) => analysis.weaknesses.includes(k)) || order.at(-1)
  const custom = level.chatFollowUps?.[key]
  if (custom) return { ...custom, key }

  const dynamic = buildDynamicFollowUp(level, key, message, analysis, chatHistory)
  return { ...dynamic, key }
}

/** 协作关弱答：开发同事追问 + 组长补一句（群聊感） */
export function getChatFollowUpThread(level, message, chatHistory = []) {
  const followUp = getChatFollowUp(level, message, chatHistory)
  const { key, text, placeholder, hint } = followUp

  if (level?.chatStructure !== 'collaboration') {
    const speaker = resolveChatFollowUpSender(level, chatHistory)
    return { messages: [{ ...speaker, text }], placeholder, hint }
  }

  const dev = resolveChatFollowUpSender(level, chatHistory)
  const manager = resolveChatManagerSpeaker(chatHistory)
  const devName = dev.sender?.split(/[·\s]/)[0] || '同事'
  const messages = [{ ...dev, text }]
  if (manager) {
    messages.push({ ...manager, text: buildDynamicManagerNudge(key, level, devName) })
  }
  return { messages, placeholder, hint }
}

/** 协作关过关：开发接话 + 组长确认 */
export function getChatSuccessThread(level, chatHistory = [], replies = {}) {
  const chatReply = replies.chatReply || ''
  const chatManagerReply = replies.chatManagerReply || ''

  if (level?.chatStructure !== 'collaboration') {
    const speaker = resolveChatFollowUpSender(level, chatHistory)
    return chatReply ? [{ ...speaker, text: chatReply }] : []
  }

  const dev = resolveChatFollowUpSender(level, chatHistory)
  const manager = resolveChatManagerSpeaker(chatHistory)
  const messages = []
  if (chatReply) messages.push({ ...dev, text: chatReply })
  if (manager) {
    messages.push({
      ...manager,
      text: chatManagerReply || DEFAULT_COLLAB_MANAGER_REPLY,
    })
  }
  return messages
}

/** 统一 chat 判题（支持合并 priorMessages） */
export function validateChatReply(level, data = {}) {
  const prior = data.chatPriorMessages || []
  const latest = String(data.message || '').trim()
  const message = combineChatMessages(prior, latest)
  const analysis = analyzeChatReply(level, message, { priorMessages: prior })

  if (analysis.weaknesses.includes('meaningless')) {
    return {
      isPass: false,
      message:
        level.chatMeaninglessHint ||
        '对方没看懂你的回复。别只发省略号或标点，用完整句子说明你会先做什么。',
      analysis,
    }
  }

  if (analysis.weaknesses.includes('offTopic')) {
    return {
      isPass: false,
      message:
        level.chatOffTopicHint ||
        '回复跟当前话题不太相关。回到本题，说明你会先做什么、需要谁配合。',
      analysis,
    }
  }

  if (analysis.weaknesses.includes('passiveReply')) {
    return {
      isPass: false,
      message: '别只让开发查。写清你会先核对什么，再请对方配合（如一起看日志）。',
      analysis,
    }
  }

  if (analysis.weaknesses.includes('keywordStuffing')) {
    return {
      isPass: false,
      message: '别只堆关键词。用完整句子说：你会先做什么、需要谁配合。',
      analysis,
    }
  }

  if (analysis.weaknesses.includes('tooShort')) {
    return {
      isPass: false,
      message: level.chatFailHint || '回复太短或太笼统。说明你会先查什么，并请对方配合排查。',
      analysis,
    }
  }

  if (analysis.weaknesses.includes('missingKeywords')) {
    return {
      isPass: false,
      message:
        level.chatFailHint ||
        '回复偏被动。试着写：①你会先核对测试环境的配置/地址 ②请李工配合查日志或抓包。',
      analysis,
    }
  }

  if (analysis.weaknesses.includes('missingAction')) {
    return { isPass: false, message: analysis.structure.message, analysis }
  }

  if (analysis.weaknesses.includes('missingRequest')) {
    return {
      isPass: false,
      message:
        level.chatStructure === 'escalation'
          ? '请提出明确的协调请求（如优先修复、加资源、调整排期）。'
          : '回复缺少协作请求。请明确请对方配合做什么（如一起看日志、确认分支）。',
      analysis,
    }
  }

  if (analysis.weaknesses.includes('missingRisk')) {
    return { isPass: false, message: '对 PM 的升级需说清：什么卡住了、对上线有什么影响。', analysis }
  }

  if (analysis.weaknesses.includes('missingStructure')) {
    return {
      isPass: false,
      message: analysis.structure.message,
      analysis,
    }
  }

  return { isPass: true, message: '回复专业得体！', analysis }
}

const CHAT_TIER_LABELS = {
  empty: '待输入',
  weak: '偏笼统',
  ok: '基本合格',
  good: '协作到位',
}

/** 结构化 chat 走弱答追问，不展示「发送前预览」；仅 chatPreview: true 时强制开启 */
export function shouldShowChatComposePreview(level) {
  if (!level) return false
  if (level.chatPreview === true) {
    return Boolean(level.chatStructure || level.chatKeywords?.length)
  }
  if (level.chatPreview === false) return false
  if (level.chatStructure) return false
  return Boolean(level.chatKeywords?.length)
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
      tips: ['写清你会先查什么、需要谁配合，别空泛应付。'],
      matchedKeywords: [],
      keywordProgress: `0/${minKw}`,
    }
  }

  if (text.length < minLen) {
    tips.push(`回复偏短（至少 ${minLen} 字）。说明具体排查动作。`)
  }

  if (matched.length < minKw) {
    if (level.chatStructure === 'hr') {
      tips.push(`相关表述还偏少（${matched.length}/${minKw}）。可提：质量、用户、细致、培训等。`)
    } else {
      tips.push(`协作关键词不足（${matched.length}/${minKw}）。可提：测试环境、回调、配置、日志等。`)
    }
  }

  if (text.length < minLen && level.chatStructure === 'hr') {
    const idx = tips.findIndex((t) => t.includes('偏短'))
    if (idx >= 0) tips[idx] = `回复偏短（至少 ${minLen} 字）。说说背景、动机或优势。`
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
