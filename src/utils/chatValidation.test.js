import { describe, it, expect } from 'vitest'
import {
  getChatComposePreview,
  validateChatStructure,
  analyzeChatReply,
  getChatFollowUp,
  shouldOfferChatFollowUp,
  validateChatReply,
  combineChatMessages,
  getChatFollowUpNotice,
  shouldShowChatComposePreview,
  isAckStyleReply,
  isPassiveCollabReply,
  isOffTopicReply,
  isMeaninglessReply,
  hasOwnCollabAction,
  hasCollabRequest,
  hasEscalationRisk,
  hasEscalationRequest,
  getLevelTopicContext,
  extractUserEcho,
  isKeywordStuffing,
  resolveChatFollowUpSender,
  resolveChatManagerSpeaker,
  getChatFollowUpThread,
  getChatSuccessThread,
} from './chatValidation.js'

describe('chatValidation', () => {
  const collabLevel = {
    chatStructure: 'collaboration',
    chatKeywords: ['测试环境', '回调', '配置', '日志'],
    chatMinLength: 16,
    chatMinKeywords: 2,
  }

  const hrLevel = {
    chatStructure: 'hr',
    chatKeywords: ['测试', '质量', '细致', '学习', '经验', '用户', '缺陷', '负责', '项目', '培训'],
    chatMinLength: 30,
    chatMinKeywords: 2,
  }

  it('validateChatStructure requires action and request for collaboration', () => {
    expect(validateChatStructure(collabLevel, '好的收到').ok).toBe(false)
    expect(validateChatStructure(collabLevel, '我先核对测试环境回调地址，麻烦配合看日志').ok).toBe(
      true
    )
  })

  it('getChatComposePreview tips for weak reply', () => {
    const preview = getChatComposePreview(collabLevel, '收到')
    expect(preview.hasPreview).toBe(true)
    expect(preview.tier).toBe('weak')
    expect(preview.tips.length).toBeGreaterThan(0)
  })

  it('getChatComposePreview good for complete reply', () => {
    const preview = getChatComposePreview(
      collabLevel,
      '我先核对测试环境的回调地址和配置，麻烦李工配合一起看支付网关日志排查。'
    )
    expect(preview.tier).toBe('good')
    expect(preview.tips).toHaveLength(0)
  })

  it('shouldOfferChatFollowUp for structured chat on first turn only', () => {
    expect(shouldOfferChatFollowUp(hrLevel, [])).toBe(true)
    expect(shouldOfferChatFollowUp(collabLevel, [])).toBe(true)
    expect(shouldOfferChatFollowUp({ chatStructure: 'escalation' }, [])).toBe(true)
    expect(shouldOfferChatFollowUp(hrLevel, ['已有首轮'])).toBe(false)
  })

  it('getChatFollowUp picks structure prompt when value words missing', () => {
    const weak = '我参加过测试培训，做过登录模块练习和项目实战，还在团队里帮忙做过记录。'
    const followUp = getChatFollowUp(hrLevel, weak)
    expect(followUp.text).toMatch(/为什么想做测试/)
  })

  it('validateChatReply merges prior messages on second turn', () => {
    const first = '我参加过测试培训，做过登录模块练习。'
    const second = '我想做测试是因为能在上线前帮用户发现缺陷，做事比较细致负责。'
    const r1 = validateChatReply(hrLevel, { message: first })
    expect(r1.isPass).toBe(false)
    const r2 = validateChatReply(hrLevel, { message: second, chatPriorMessages: [first] })
    expect(r2.isPass).toBe(true)
    expect(combineChatMessages([first], second).length).toBeGreaterThan(30)
  })

  it('analyzeChatReply lists weaknesses for partial hr answer', () => {
    const analysis = analyzeChatReply(hrLevel, '我做过登录模块练习。')
    expect(analysis.weaknesses).toContain('tooShort')
  })

  it('shouldShowChatComposePreview off for structured chat', () => {
    expect(shouldShowChatComposePreview(hrLevel)).toBe(false)
    expect(shouldShowChatComposePreview(collabLevel)).toBe(false)
    expect(shouldShowChatComposePreview({ chatKeywords: ['日志'], chatMinKeywords: 1 })).toBe(true)
    expect(shouldShowChatComposePreview({ ...collabLevel, chatPreview: true })).toBe(true)
  })

  it('getChatFollowUp picks collaboration action prompt', () => {
    const followUp = getChatFollowUp(
      collabLevel,
      '好的收到，这个问题我先跟进，麻烦李工那边配合一下。'
    )
    expect(followUp.text).toMatch(/测试环境|回调|配置|查|核对/)
  })

  it('getChatFollowUp tooShort uses dev-peer tone when reply is not ack-style', () => {
    const followUp = getChatFollowUp(collabLevel, '麻烦配合看一下。')
    expect(followUp.text).toMatch(/哪步|哪块|先/)
    expect(followUp.text).not.toMatch(/别光回/)
    expect(isAckStyleReply('麻烦配合看一下。')).toBe(false)
  })

  it('getChatFollowUp tooShort nudges ack-style replies from dev peer', () => {
    const followUp = getChatFollowUp(collabLevel, '收到')
    expect(followUp.text).toMatch(/别光回/)
    expect(followUp.text).toMatch(/测试环境|这块/)
    expect(isAckStyleReply('收到')).toBe(true)
  })

  it('validateChatReply merges collaboration turns', () => {
    const first = '我先看看。'
    const second = '我先核对测试环境回调地址，麻烦李工配合看日志排查。'
    expect(validateChatReply(collabLevel, { message: first }).isPass).toBe(false)
    expect(
      validateChatReply(collabLevel, { message: second, chatPriorMessages: [first] }).isPass
    ).toBe(true)
  })

  it('passes natural short one-liner for collaboration', () => {
    const msg = '我先对一下回调，麻烦配合看网关日志'
    expect(hasOwnCollabAction(msg)).toBe(true)
    expect(validateChatReply(collabLevel, { message: msg }).isPass).toBe(true)
  })

  it('passes realistic two-turn collab without essay answer', () => {
    const first = '你配合我看看网关'
    const second = '我先对测试环境回调地址'
    expect(validateChatReply(collabLevel, { message: first }).isPass).toBe(false)
    expect(
      validateChatReply(collabLevel, { message: second, chatPriorMessages: [first] }).isPass
    ).toBe(true)
  })

  it('accepts 我看看 + 一起看 as natural collab phrasing', () => {
    const msg = '我看看回调地址，麻烦李工一起看日志'
    expect(hasOwnCollabAction(msg)).toBe(true)
    expect(hasCollabRequest(msg)).toBe(true)
    expect(validateChatReply(collabLevel, { message: msg }).isPass).toBe(true)
  })

  it('getChatFollowUpNotice varies by structure', () => {
    const history = [
      { sender: '李工', avatar: '👨‍💻', role: 'other' },
      { sender: '测试组长', avatar: '👩‍💼', role: 'other' },
    ]
    expect(getChatFollowUpNotice({ chatStructure: 'collaboration' }, history)).toMatch(/李工/)
  })

  it('resolveChatFollowUpSender picks dev peer over manager in collaboration', () => {
    const history = [
      { sender: '李工', avatar: '👨‍💻', role: 'other' },
      { sender: '测试组长', avatar: '👩‍💼', role: 'other' },
    ]
    const speaker = resolveChatFollowUpSender({ chatStructure: 'collaboration' }, history)
    expect(speaker.sender).toBe('李工')
  })

  it('getChatFollowUpThread includes manager nudge in collaboration', () => {
    const history = [
      { sender: '李工', avatar: '👨‍💻', role: 'other' },
      { sender: '测试组长', avatar: '👩‍💼', role: 'other' },
    ]
    const thread = getChatFollowUpThread(collabLevel, '收到', history)
    expect(thread.messages).toHaveLength(2)
    expect(thread.messages[0].sender).toBe('李工')
    expect(thread.messages[1].sender).toBe('测试组长')
    expect(thread.messages[1].text).toMatch(/排查|方案|测试环境/)
  })

  it('getChatSuccessThread returns dev reply and manager ack', () => {
    const history = [
      { sender: '李工', avatar: '👨‍💻', role: 'other' },
      { sender: '测试组长', avatar: '👩‍💼', role: 'other' },
    ]
    const messages = getChatSuccessThread(collabLevel, history, {
      chatReply: '行，我先配合看日志。',
      chatManagerReply: '好，有进展同步。',
    })
    expect(messages).toHaveLength(2)
    expect(messages[0].sender).toBe('李工')
    expect(messages[1].sender).toBe('测试组长')
    expect(resolveChatManagerSpeaker(history)?.sender).toBe('测试组长')
  })

  it('passive collab reply acknowledges logs and asks for own plan', () => {
    const msg = '你帮我看看日志'
    expect(isPassiveCollabReply(msg)).toBe(true)
    expect(hasOwnCollabAction(msg)).toBe(false)
    const followUp = getChatFollowUp(collabLevel, msg)
    expect(followUp.key).toBe('passiveReply')
    expect(followUp.text).toMatch(/日志/)
    expect(followUp.text).toMatch(/测试这边先|你先/)
  })

  it('off-topic reply gets structure-specific redirect', () => {
    expect(isOffTopicReply(collabLevel, '今天想吃火锅')).toBe(true)
    expect(isOffTopicReply(collabLevel, '你帮我看看日志')).toBe(false)

    const collabFu = getChatFollowUp(collabLevel, '今天想吃火锅')
    expect(collabFu.text).toMatch(/测试环境|回调|排查/)

    const hrFu = getChatFollowUp(hrLevel, '周末想去爬山')
    expect(hrFu.text).toMatch(/面试|测试/)

    const escFu = getChatFollowUp(
      { chatStructure: 'escalation', chatKeywords: ['阻塞', '上线'] },
      '哈哈哈无聊'
    )
    expect(escFu.text).toMatch(/发版|阻塞|上线/)
  })

  it('ellipsis-only reply gets in-character nudge not generic off-topic', () => {
    const dots = '………………'
    expect(isMeaninglessReply(dots)).toBe(true)
    expect(isOffTopicReply(collabLevel, dots)).toBe(false)

    const followUp = getChatFollowUp(collabLevel, dots)
    expect(followUp.key).toBe('meaningless')
    expect(followUp.text).toMatch(/卡住/)

    const history = [
      { sender: '李工', avatar: '👨‍💻', role: 'other' },
      { sender: '测试组长', avatar: '👩‍💼', role: 'other' },
    ]
    const thread = getChatFollowUpThread(collabLevel, dots, history)
    expect(thread.messages[0].text).toMatch(/卡住了/)
    expect(thread.messages[1].text).toMatch(/潜水|方案/)
  })

  it('reactive filler like 啊？ or 哈哈 gets tone-matched hint not ellipsis tip', () => {
    expect(isMeaninglessReply('啊？')).toBe(true)
    expect(isMeaninglessReply('哈哈、')).toBe(true)

    const ahFollowUp = getChatFollowUp(collabLevel, '啊？')
    expect(ahFollowUp.text).toMatch(/怎么了/)
    expect(ahFollowUp.hint).toMatch(/语气词/)
    expect(ahFollowUp.hint).not.toMatch(/省略号/)

    const haFollowUp = getChatFollowUp(collabLevel, '哈哈、')
    expect(haFollowUp.text).toMatch(/不好笑|这条线/)
    expect(isOffTopicReply(collabLevel, '哈哈、')).toBe(false)
  })

  it('dynamic follow-up uses level keywords not hardcoded callback', () => {
    const flakyLevel = {
      chatStructure: 'collaboration',
      chatKeywords: ['竞态', '异步', 'PENDING', '复现', '日志', '回调'],
      chatMinLength: 24,
      chatMinKeywords: 2,
    }
    const followUp = getChatFollowUp(flakyLevel, '今天想吃火锅')
    expect(followUp.text).toMatch(/竞态/)
    expect(followUp.text).not.toMatch(/notify/)

    const ctx = getLevelTopicContext(flakyLevel)
    expect(ctx.pair).toBe('竞态、异步')
  })

  it('keyword stuffing gets dedicated nudge', () => {
    const stuffed = '测试环境回调配置日志配合排查'
    expect(isKeywordStuffing(collabLevel, stuffed)).toBe(true)
    const followUp = getChatFollowUp(collabLevel, stuffed)
    expect(followUp.key).toBe('keywordStuffing')
    expect(followUp.text).toMatch(/具体|哪一步/)
  })

  it('accepts natural phrasing without 我先 prefix', () => {
    const msg = '测试环境回调地址我去核对一下，麻烦帮忙看网关日志'
    expect(hasOwnCollabAction(msg)).toBe(true)
    expect(validateChatStructure(collabLevel, msg).ok).toBe(true)
  })

  it('echoes user mention in passive reply', () => {
    const echo = extractUserEcho('你帮我看看日志', collabLevel)
    expect(echo.mentionsLog).toBe(true)
    const followUp = getChatFollowUp(collabLevel, '你帮我看看日志')
    expect(followUp.text).toMatch(/日志/)
  })

  it('passes realistic two-turn hr interview', () => {
    const first = '我参加过测试培训，做过登录模块练习。'
    const second = '想做测试是因为能在上线前帮用户发现缺陷，做事比较细致。'
    expect(validateChatReply(hrLevel, { message: first }).isPass).toBe(false)
    expect(validateChatReply(hrLevel, { message: second, chatPriorMessages: [first] }).isPass).toBe(
      true
    )
  })

  it('passes realistic two-turn escalation to PM', () => {
    const escLevel = {
      chatStructure: 'escalation',
      chatKeywords: ['阻塞', '风险', '上线', '协调', '优先', '修复', '影响'],
      chatMinLength: 20,
      chatMinKeywords: 2,
    }
    const first = '支付 Bug 还没修，阻塞回归了'
    const second = '麻烦协调开发优先修复，怕影响周五上线'
    expect(validateChatReply(escLevel, { message: first }).isPass).toBe(false)
    expect(
      validateChatReply(escLevel, { message: second, chatPriorMessages: [first] }).isPass
    ).toBe(true)
  })

  it('passes short one-liner escalation when complete', () => {
    const escLevel = {
      chatStructure: 'escalation',
      chatKeywords: ['阻塞', '上线', '协调', '优先', '修复', '影响'],
      chatMinLength: 20,
      chatMinKeywords: 2,
    }
    const msg = '支付Bug阻塞回归，怕影响周五上线，麻烦协调优先修复'
    expect(hasEscalationRisk(msg)).toBe(true)
    expect(hasEscalationRequest(msg)).toBe(true)
    expect(validateChatReply(escLevel, { message: msg }).isPass).toBe(true)
  })
})
