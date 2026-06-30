import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getItem, setItem, storageKey } from './storage.js'
import { showStorageWarning, storageWarning, clearStorageWarning } from './storageWarning.js'

function createLocalStorage() {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
}

describe('storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorage())
    clearStorageWarning()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('round-trips JSON values', () => {
    setItem('test_key', { a: 1 })
    expect(getItem('test_key')).toEqual({ a: 1 })
  })

  it('returns default when key missing', () => {
    expect(getItem('missing', [])).toEqual([])
  })

  it('namespaces keys', () => {
    setItem('foo', 'bar')
    expect(localStorage.getItem(storageKey('foo'))).toBeTruthy()
  })

  it('shows warning on quota exceeded', () => {
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    const result = setItem('big', { data: 'x'.repeat(9999) })
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('quota')
    expect(storageWarning.value).toMatch(/导出存档/)
    spy.mockRestore()
  })
})

describe('storageWarning', () => {
  it('sets and clears warning message', () => {
    showStorageWarning('test warning', { durationMs: 60000 })
    expect(storageWarning.value).toBe('test warning')
    clearStorageWarning()
    expect(storageWarning.value).toBeNull()
  })
})
