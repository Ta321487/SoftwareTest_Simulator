const STORAGE_KEY = 'handbook_recent_terms'
const MAX = 5

let memoryCache = null

function getStorage() {
  if (typeof localStorage === 'undefined') return null
  try {
    const probe = '__handbook_recent_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    return null
  }
}

function readIds() {
  const storage = getStorage()
  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
    } catch {
      return []
    }
  }
  return memoryCache ? [...memoryCache] : []
}

function writeIds(ids) {
  const storage = getStorage()
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(ids))
      return
    } catch {
      /* fall through to memory */
    }
  }
  memoryCache = [...ids]
}

export function recordRecentTerm(termId) {
  if (!termId) return
  const prev = readIds().filter((id) => id !== termId)
  writeIds([termId, ...prev].slice(0, MAX))
}

export function getRecentTermIds() {
  return readIds()
}

export function clearRecentTerms() {
  const storage = getStorage()
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
  memoryCache = null
}
