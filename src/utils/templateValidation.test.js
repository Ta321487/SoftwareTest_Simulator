import { describe, it, expect } from 'vitest'
import { getTemplateComposePreview, validateTemplateSubmission } from './templateValidation.js'
import { levels } from '../data/levels.js'
import { DAILY_POOL } from '../data/dailyChallenges.js'

function levelById(id) {
  return levels.find((lv) => lv.id === id)
}

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

  describe('level 2 boundary phrasing', () => {
    const lv2 = levelById(2)

    it('accepts login fail + max length for 13-char password', () => {
      const result = validateTemplateSubmission(lv2, {
        case1: '不允许提交，提示用户名必填',
        case2: '可以正常登录，6位数字符合规则',
        case3: '登录失败，密码不能超过12位',
        case4: '登录失败，密码不能有特殊字符',
      })
      expect(result.ok).toBe(true)
    })

    it('does not reject 不允许 because of 允许 substring', () => {
      const field = lv2.templateFields.find((f) => f.field === 'case1')
      const result = validateTemplateSubmission(
        { ...lv2, templateFields: [field] },
        { case1: '不允许提交，提示用户名必填' }
      )
      expect(result.ok).toBe(true)
    })

    it('rejects wrong pass judgment for valid 6-digit password', () => {
      const result = validateTemplateSubmission(lv2, {
        case1: '不允许提交，提示用户名必填',
        case2: '登录失败，密码不符合',
        case3: '登录失败，密码不能超过12位',
        case4: '登录失败，密码不能有特殊字符',
      })
      expect(result.ok).toBe(false)
    })
  })

  describe('level 17 age boundary phrasing', () => {
    const lv17 = levelById(17)

    it('accepts natural reject wording for empty and out-of-range ages', () => {
      const result = validateTemplateSubmission(lv17, {
        case1: '提交失败，年龄不能为空',
        case2: '年龄为0无效，提示超出合法范围',
        case3: '年龄121不合规，超过120上限',
      })
      expect(result.ok).toBe(true)
    })
  })

  describe('level 26 API assertions', () => {
    const lv26 = levelById(26)

    it('accepts status wording without bare numeric only dependency', () => {
      const result = validateTemplateSubmission(lv26, {
        case1: '断言 HTTP Unauthorized，body 含 message 与 code',
        case2: '缺 username 时返回 Bad Request，message 说明必填',
      })
      expect(result.ok).toBe(true)
    })
  })

  describe('daily template challenges', () => {
    const boundaryDaily = DAILY_POOL.find((d) => d.key === 'boundary-daily')
    const tokenDaily = DAILY_POOL.find((d) => d.key === 'token-assert')

    it('accepts coupon boundary natural phrasing', () => {
      const result = validateTemplateSubmission(boundaryDaily, {
        case1: '面额0无效，提示不能低于1',
        case2: '面额501超过上限500，提交失败',
      })
      expect(result.ok).toBe(true)
    })

    it('accepts token assert with success synonyms', () => {
      const result = validateTemplateSubmission(tokenDaily, {
        case1: 'HTTP 200 OK，响应 body 含 access_token 且非空',
      })
      expect(result.ok).toBe(true)
    })
  })

  describe('level 25 monthly summary', () => {
    const lv25 = levelById(25)

    it('accepts 下个月 as plan wording', () => {
      const result = validateTemplateSubmission(lv25, {
        result: '完成登录与支付模块测试用例',
        lesson: '排查线上日志定位回调问题，收获很大',
        plan: '下个月推进订单模块自动化回归',
      })
      expect(result.ok).toBe(true)
    })
  })
})
