import { describe, it, expect } from 'vitest'
import { validateTerminalCommand } from './terminalValidation.js'

describe('validateTerminalCommand', () => {
  const tailLevel = { correctCommand: 'tail -n 100 /var/log/app/error.log' }
  const grepLevel = { correctCommand: 'grep ERROR /var/log/app/error.log' }

  it('rejects empty command', () => {
    const result = validateTerminalCommand('   ', tailLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('Enter')
  })

  it('accepts exact tail command', () => {
    expect(validateTerminalCommand('tail -n 100 /var/log/app/error.log', tailLevel).isPass).toBe(
      true
    )
  })

  it('accepts tail shorthand line count', () => {
    expect(validateTerminalCommand('tail -100 /var/log/app/error.log', tailLevel).isPass).toBe(true)
  })

  it('rejects tail without line count', () => {
    const result = validateTerminalCommand('tail /var/log/app/error.log', tailLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('行数')
  })

  it('rejects tail with wrong line count', () => {
    const result = validateTerminalCommand('tail -n 5 /var/log/app/error.log', tailLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('100')
    expect(result.message).toContain('5')
  })

  it('rejects tail with wrong path', () => {
    const result = validateTerminalCommand('tail -n 100 /var/log/wrong.log', tailLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('/var/log/app/error.log')
  })

  it('rejects tail level answer without tail command', () => {
    const result = validateTerminalCommand('cat /var/log/app/error.log', tailLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('末尾')
  })

  it('accepts grep with keyword and path', () => {
    expect(validateTerminalCommand('grep ERROR /var/log/app/error.log', grepLevel).isPass).toBe(
      true
    )
  })

  it('accepts grep case-insensitively normalized', () => {
    expect(validateTerminalCommand('grep error /var/log/app/error.log', grepLevel).isPass).toBe(
      true
    )
  })

  it('rejects grep with wrong keyword', () => {
    const result = validateTerminalCommand('grep Auth /var/log/app/error.log', grepLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('ERROR')
  })

  it('rejects grep with wrong path', () => {
    const result = validateTerminalCommand('grep ERROR /tmp/other.log', grepLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('/var/log/app/error.log')
  })

  it('rejects grep level answer without grep', () => {
    const result = validateTerminalCommand('tail -n 100 /var/log/app/error.log', grepLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('grep')
  })

  const tailFollowLevel = { correctCommand: 'tail -f /var/log/app/error.log' }

  it('accepts tail -f for follow mode', () => {
    expect(validateTerminalCommand('tail -f /var/log/app/error.log', tailFollowLevel).isPass).toBe(
      true
    )
  })

  it('rejects tail -f level without follow flag', () => {
    const result = validateTerminalCommand('tail -n 100 /var/log/app/error.log', tailFollowLevel)
    expect(result.isPass).toBe(false)
    expect(result.message).toContain('-f')
  })
})
