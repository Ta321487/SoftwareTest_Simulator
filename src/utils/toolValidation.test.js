import { describe, it, expect } from 'vitest'
import { validateSqlQuery } from './sqlValidation.js'
import { validateRedisCommand } from './redisValidation.js'
import { validatePipelineSubmission } from './cipipelineValidation.js'
import { validateMockServer } from './mockserverValidation.js'
import { validateMqInbox } from './mqinboxValidation.js'

describe('sqlValidation', () => {
  const level = {
    sqlTable: 'orders',
    sqlMustInclude: ['8821'],
  }

  it('accepts valid select', () => {
    expect(validateSqlQuery("SELECT * FROM orders WHERE order_id = '8821'", level).isPass).toBe(
      true
    )
  })

  it('rejects non-select', () => {
    expect(validateSqlQuery('DELETE FROM orders', level).isPass).toBe(false)
  })
})

describe('redisValidation', () => {
  it('accepts GET command', () => {
    const level = { correctCommand: 'GET session:u10086:web' }
    expect(validateRedisCommand('GET session:u10086:web', level).isPass).toBe(true)
  })
})

describe('cipipelineValidation', () => {
  it('requires integration stage and cause', () => {
    const level = { correctStage: 'integration', correctCause: 'b' }
    expect(
      validatePipelineSubmission(level, {
        selectedStage: 'integration',
        selectedCause: 'b',
      }).isPass
    ).toBe(true)
  })
})

describe('mockserverValidation', () => {
  it('validates mock rules', () => {
    const level = {
      mockPath: '/callback',
      mockStatus: 200,
      mockBodyIncludes: ['success'],
    }
    expect(
      validateMockServer(level, {
        rules: { path: '/callback', status: '200', body: '{"success":true}' },
      }).isPass
    ).toBe(true)
  })
})

describe('mqinboxValidation', () => {
  it('validates message id', () => {
    const level = { correctMessageId: 'b' }
    expect(validateMqInbox(level, { selectedMessageId: 'b' }).isPass).toBe(true)
  })
})
