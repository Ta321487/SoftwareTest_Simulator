import { describe, it, expect } from 'vitest'
import { getTemplateComposePreview, validateTemplateSubmission } from './templateValidation.js'

describe('templateValidation', () => {
  const level = {
    templateMinLength: 10,
    templateFields: [
      {
        field: 'case1',
        scenario: '用户名空',
        fieldKeywords: ['不允许', '提示'],
        fieldRejectKeywords: ['允许', '成功'],
      },
    ],
  }

  it('validateTemplateSubmission rejects empty field', () => {
    const result = validateTemplateSubmission(level, { case1: '' })
    expect(result.ok).toBe(false)
  })

  it('preview shows weak when keywords missing', () => {
    const preview = getTemplateComposePreview(level, { case1: '太短' })
    expect(preview.tier).not.toBe('good')
    expect(preview.tips.length).toBeGreaterThan(0)
  })

  it('preview good when field passes', () => {
    const preview = getTemplateComposePreview(level, {
      case1: '系统应拒绝提交，并提示用户名必填',
    })
    expect(preview.tier).toBe('good')
    expect(preview.progress).toBe('1/1')
  })
})
