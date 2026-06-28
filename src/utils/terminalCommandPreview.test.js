import { describe, it, expect } from 'vitest'
import { getTerminalCommandPreview } from './terminalCommandPreview.js'

describe('terminalCommandPreview', () => {
  const level = { correctCommand: 'grep ERROR /var/log/app/error.log' }

  it('returns no preview for empty input', () => {
    expect(getTerminalCommandPreview('', level).hasPreview).toBe(false)
  })

  it('tips when grep missing ERROR keyword', () => {
    const preview = getTerminalCommandPreview('grep Auth /var/log/app/error.log', level)
    expect(preview.hasPreview).toBe(true)
    expect(preview.tips.some((t) => t.includes('ERROR'))).toBe(true)
  })

  it('good tier for correct structure', () => {
    const preview = getTerminalCommandPreview('grep ERROR /var/log/app/error.log', level)
    expect(preview.tier).toBe('good')
    expect(preview.tips).toHaveLength(0)
  })
})
