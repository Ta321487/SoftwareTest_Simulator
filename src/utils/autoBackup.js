import { buildBackup } from './progressBackup'
import { scheduleIndexedDBBackup } from './storageBackup'

let progressStoreRef = null
let projectStoreRef = null
let themeStoreRef = null

export function registerAutoBackupStores({ progressStore, projectStore, themeStore }) {
  progressStoreRef = progressStore
  projectStoreRef = projectStore
  themeStoreRef = themeStore
}

export function scheduleAutoBackup() {
  if (!progressStoreRef || !projectStoreRef) return
  scheduleIndexedDBBackup(() => buildBackup(progressStoreRef, projectStoreRef, themeStoreRef))
}
