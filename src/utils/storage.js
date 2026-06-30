import { showStorageWarning } from './storageWarning'

const NAMESPACE = 'app_progress'

export function storageKey(key) {
  return `${NAMESPACE}_${key}`
}

export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (raw === null) return defaultValue
    return JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

/**
 * @returns {{ ok: true } | { ok: false, reason: 'quota' | 'unknown', message?: string }}
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value))
    return { ok: true }
  } catch (err) {
    const isQuota =
      (err instanceof DOMException && err.name === 'QuotaExceededError') || err?.code === 22
    const reason = isQuota ? 'quota' : 'unknown'
    const message = isQuota
      ? '浏览器存储空间已满，进度可能未保存。请立即导出存档。'
      : '进度保存失败，请导出存档备份。'
    showStorageWarning(message)
    return { ok: false, reason, message }
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(storageKey(key))
  } catch {
    /* ignore */
  }
}
