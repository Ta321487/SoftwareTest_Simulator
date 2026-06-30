import { ref } from 'vue'

export const storageWarning = ref(null)

let dismissTimer = null

export function showStorageWarning(message, { durationMs = 8000 } = {}) {
  storageWarning.value = message
  if (dismissTimer) clearTimeout(dismissTimer)
  dismissTimer = setTimeout(() => {
    storageWarning.value = null
    dismissTimer = null
  }, durationMs)
}

export function clearStorageWarning() {
  storageWarning.value = null
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}
