import { BACKUP_VERSION } from './progressBackup'

const DB_NAME = 'softwaretest-simulator-backup'
const DB_VERSION = 1
const STORE_NAME = 'snapshots'
const LATEST_KEY = 'latest'

let backupTimer = null

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function idbPut(key, value) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).put(value, key)
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error)
        }
      })
  )
}

function idbGet(key) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const request = tx.objectStore(STORE_NAME).get(key)
        request.onsuccess = () => {
          db.close()
          resolve(request.result ?? null)
        }
        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
  )
}

/** 将完整存档快照写入 IndexedDB（静默，失败不阻断主流程） */
export async function saveIndexedDBBackup(backup) {
  if (!backup?.progress) return false
  try {
    await idbPut(LATEST_KEY, {
      version: BACKUP_VERSION,
      savedAt: new Date().toISOString(),
      backup,
    })
    return true
  } catch {
    return false
  }
}

export async function loadIndexedDBBackup() {
  try {
    const record = await idbGet(LATEST_KEY)
    return record?.backup ?? null
  } catch {
    return null
  }
}

/** 防抖：进度变更后自动备份到 IndexedDB */
export function scheduleIndexedDBBackup(buildFn, delayMs = 2000) {
  if (typeof buildFn !== 'function') return
  if (backupTimer) clearTimeout(backupTimer)
  backupTimer = setTimeout(async () => {
    backupTimer = null
    try {
      const backup = buildFn()
      if (backup) await saveIndexedDBBackup(backup)
    } catch {
      /* silent */
    }
  }, delayMs)
}

export function hasMeaningfulProgress(progress) {
  if (!progress || typeof progress !== 'object') return false
  return Array.isArray(progress.completedLevelIds) && progress.completedLevelIds.length > 0
}
