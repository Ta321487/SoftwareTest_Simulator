import { describe, it, expect } from 'vitest'
import { extractLevelHook, getScriptBeatDetail } from './scriptBeatDetail.js'

describe('scriptBeatDetail', () => {
  it('strips bracket tag from description hook', () => {
    expect(
      extractLevelHook('【备考 · 第1关】还在自学/培训班阶段。产品扔来一段需求。')
    ).toBe('还在自学/培训班阶段。')
  })

  it('builds beat detail with deliverable and tool', () => {
    const store = {
      getStatus: () => 'available',
      getLevelMeta: () => ({ stars: 2 }),
    }
    const detail = getScriptBeatDetail(1, store)
    expect(detail.title).toContain('PRD')
    expect(detail.deliverable).toContain('测试点清单')
    expect(detail.toolLabel).toBe('测试清单')
    expect(detail.stars).toBe(2)
  })
})
