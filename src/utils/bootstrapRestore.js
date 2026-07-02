import { getItem, setItem } from './storage'
import { loadIndexedDBBackup, hasMeaningfulProgress } from './storageBackup'
import { applyBackup } from './progressBackup'

/**
 * localStorage 无有效进度时，尝试从 IndexedDB 自动备份恢复。
 * @returns {Promise<boolean>} 是否已恢复
 */
export async function tryRestoreFromIndexedDB(progressStore, projectStore, themeStore) {
  const saved = getItem('user_progress', {})
  if (hasMeaningfulProgress(saved)) return false

  const backup = await loadIndexedDBBackup()
  if (!hasMeaningfulProgress(backup?.progress)) return false

  const completed = backup.progress.completedLevelIds.length
  const ok = window.confirm(
    `本地没有存档进度，但检测到自动备份（已通关 ${completed} 关）。\n\n是否恢复？建议点「确定」找回进度。`
  )
  if (!ok) return false

  const result = applyBackup(backup, progressStore, projectStore, themeStore)
  if (!result.ok) {
    window.alert(result.message || '恢复失败')
    return false
  }
  return true
}

export const BACKUP_REMINDER_THRESHOLD = 5

export function shouldShowBackupReminder(completedCount) {
  if (completedCount < BACKUP_REMINDER_THRESHOLD) return false
  if (getItem('backup_reminder_dismissed', false)) return false
  if (getItem('last_export_at', null)) return false
  return true
}

export function dismissBackupReminder() {
  setItem('backup_reminder_dismissed', true)
}

export function markExported() {
  setItem('last_export_at', new Date().toISOString())
}
