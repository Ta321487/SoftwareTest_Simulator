import { describe, it, expect } from 'vitest'
import { getChatComposePreview, validateChatStructure } from './chatValidation.js'

describe('chatValidation', () => {
  const collabLevel = {
    chatStructure: 'collaboration',
    chatKeywords: ['测试环境', '回调', '配置', '日志'],
    chatMinLength: 16,
    chatMinKeywords: 2,
  }

  it('validateChatStructure requires action and request for collaboration', () => {
    expect(validateChatStructure(collabLevel, '好的收到').ok).toBe(false)
    expect(
      validateChatStructure(collabLevel, '我先核对测试环境回调地址，麻烦配合看日志').ok
    ).toBe(true)
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
})
