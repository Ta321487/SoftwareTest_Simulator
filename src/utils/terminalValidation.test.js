import { describe, it, expect } from 'vitest'
import { validateTerminalCommand, parseGrepCommand } from './terminalValidation.js'

describe('validateTerminalCommand', () => {
  const tailLevel = { correctCommand: 'tail -n 100 /var/log/app/error.log' }
  const grepLevel = { correctCommand: 'grep ERROR /var/log/app/error.log' }
  const grepContextLevel = { correctCommand: 'grep -C 3 ERROR /var/log/app/error.log' }

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

  it('accepts grep case-insensitively normalized keyword', () => {
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

  it('requires grep -C when expected', () => {
    expect(
      validateTerminalCommand('grep -C 3 ERROR /var/log/app/error.log', grepContextLevel).isPass
    ).toBe(true)
    const plain = validateTerminalCommand('grep ERROR /var/log/app/error.log', grepContextLevel)
    expect(plain.isPass).toBe(false)
    expect(plain.message).toContain('-C 3')
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

  it('accepts grep -v exclude', () => {
    const level = { correctCommand: 'grep -v INFO /var/log/app/info.log' }
    expect(validateTerminalCommand('grep -v INFO /var/log/app/info.log', level).isPass).toBe(true)
    expect(validateTerminalCommand('grep INFO /var/log/app/info.log', level).isPass).toBe(false)
  })

  it('accepts grep -i ignore case flag', () => {
    const level = { correctCommand: 'grep -i timeout /var/log/app/error.log' }
    expect(validateTerminalCommand('grep -i timeout /var/log/app/error.log', level).isPass).toBe(
      true
    )
    expect(validateTerminalCommand('grep timeout /var/log/app/error.log', level).isPass).toBe(false)
  })

  it('accepts grep -E extended pattern', () => {
    const level = { correctCommand: 'grep -E TIMEOUT|ERROR /var/log/app/error.log' }
    expect(
      validateTerminalCommand('grep -E TIMEOUT|ERROR /var/log/app/error.log', level).isPass
    ).toBe(true)
  })

  it('accepts grep pipe wc -l', () => {
    const level = { correctCommand: 'grep ERROR /var/log/app/error.log | wc -l' }
    expect(validateTerminalCommand('grep ERROR /var/log/app/error.log | wc -l', level).isPass).toBe(
      true
    )
  })

  it('accepts head -n', () => {
    const level = { correctCommand: 'head -n 30 /var/log/app/startup.log' }
    expect(validateTerminalCommand('head -n 30 /var/log/app/startup.log', level).isPass).toBe(true)
  })

  it('accepts cat config path', () => {
    const level = { correctCommand: 'cat /etc/app/application.yml' }
    expect(validateTerminalCommand('cat /etc/app/application.yml', level).isPass).toBe(true)
  })

  it('accepts curl health check', () => {
    const level = { correctCommand: 'curl -s http://localhost:8080/health' }
    expect(validateTerminalCommand('curl http://localhost:8080/health', level).isPass).toBe(true)
  })

  it('accepts find with name pattern', () => {
    const level = { correctCommand: 'find /var/log/app -name "*.log"' }
    expect(validateTerminalCommand('find /var/log/app -name "*.log"', level).isPass).toBe(true)
  })

  it('accepts ls -la path', () => {
    const level = { correctCommand: 'ls -la /var/log/app' }
    expect(validateTerminalCommand('ls -la /var/log/app', level).isPass).toBe(true)
    expect(validateTerminalCommand('ls /var/log/app', level).isPass).toBe(false)
  })
})

describe('parseGrepCommand', () => {
  it('parses grep -C flags and pipe segments', () => {
    const parsed = parseGrepCommand('grep -C 3 ERROR /var/log/app/error.log')
    expect(parsed.flags.context).toBe(3)
    expect(parsed.pattern).toBe('error')
    expect(parsed.path).toBe('/var/log/app/error.log')
  })
})
