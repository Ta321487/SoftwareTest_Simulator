import { describe, it, expect } from 'vitest'
import { isFocusableField } from './mobileKeyboard.js'

function mockField(tagName, attrs = {}) {
  return { tagName: tagName.toUpperCase(), ...attrs }
}

describe('isFocusableField', () => {
  it('accepts editable text inputs and textareas', () => {
    expect(isFocusableField(mockField('input', { getAttribute: () => 'text' }))).toBe(true)
    expect(isFocusableField(mockField('textarea'))).toBe(true)
  })

  it('rejects readonly, disabled, and non-text controls', () => {
    expect(
      isFocusableField(mockField('input', { readOnly: true, getAttribute: () => 'text' }))
    ).toBe(false)
    expect(isFocusableField(mockField('textarea', { disabled: true }))).toBe(false)
    expect(isFocusableField(mockField('input', { getAttribute: () => 'checkbox' }))).toBe(false)
    expect(isFocusableField(mockField('input', { getAttribute: () => 'hidden' }))).toBe(false)
  })

  it('accepts select elements', () => {
    expect(isFocusableField(mockField('select'))).toBe(true)
  })
})
