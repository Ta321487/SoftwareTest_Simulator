const NAMESPACE = 'app_progress'

export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(`${NAMESPACE}_${key}`)
    if (raw === null) return defaultValue
    return JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

export function setItem(key, value) {
  localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
}

export function removeItem(key) {
  localStorage.removeItem(`${NAMESPACE}_${key}`)
}
