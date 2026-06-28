import { getItem, setItem, removeItem } from './storage'

export const BACKUP_VERSION = 2

const STORAGE_KEYS = {
  progress: 'user_progress',
  artifacts: 'project_artifacts',
  loginSut: 'project_sut',
  paymentSut: 'payment_sut',
  orderSut: 'order_sut',
  onboardSut: 'onboard_sut',
  theme: 'theme',
}

/** 从 Pinia store 快照构建可导出的存档 */
export function buildBackup(progressStore, projectStore) {
  return {
    version: BACKUP_VERSION,
    app: 'softwaretest-simulator',
    exportedAt: new Date().toISOString(),
    progress: {
      completedLevelIds: progressStore.completedLevelIds,
      levelMeta: progressStore.levelMeta,
      attemptCounts: progressStore.attemptCounts,
      hintsUsed: progressStore.hintsUsed,
      levelMistakes: progressStore.levelMistakes,
      levelSubmissions: progressStore.levelSubmissions || {},
      achievements: progressStore.achievements,
      dailyCompletedDate: progressStore.dailyCompletedDate,
      dailyStreak: progressStore.dailyStreak,
      lastDailyDate: progressStore.lastDailyDate,
      loginBugReproduced: progressStore.loginBugReproduced,
      loginFixVerified: progressStore.loginFixVerified,
      paymentCallbackMiss: progressStore.paymentCallbackMiss,
      paymentErrorReproduced: progressStore.paymentErrorReproduced,
      orderBottleneckIdentified: progressStore.orderBottleneckIdentified,
      prodSlowReproduced: progressStore.prodSlowReproduced,
      logReviewed: progressStore.logReviewed,
    },
    project: {
      artifacts: projectStore.artifacts,
      loginSut: projectStore.loginSut,
      paymentSut: projectStore.paymentSut,
      orderSut: projectStore.orderSut,
      onboardSut: projectStore.onboardSut,
    },
    theme: getItem(STORAGE_KEYS.theme, 'light'),
  }
}

function validateBackup(data) {
  if (!data || typeof data !== 'object') {
    return { ok: false, message: '文件格式无效' }
  }
  if (data.app !== 'softwaretest-simulator') {
    return { ok: false, message: '这不是「测试人一生」的存档文件' }
  }
  if (!data.progress || !Array.isArray(data.progress.completedLevelIds)) {
    return { ok: false, message: '存档缺少进度数据' }
  }
  return { ok: true }
}

/** 将存档写入 store 并持久化 */
export function applyBackup(data, progressStore, projectStore, themeStore) {
  const check = validateBackup(data)
  if (!check.ok) return check

  const p = data.progress
  progressStore.importSnapshot({
    completedLevelIds: p.completedLevelIds,
    levelMeta: p.levelMeta || {},
    attemptCounts: p.attemptCounts || {},
    hintsUsed: p.hintsUsed || {},
    levelMistakes: p.levelMistakes || {},
    levelSubmissions: p.levelSubmissions || {},
    achievements: p.achievements || [],
    dailyCompletedDate: p.dailyCompletedDate ?? null,
    dailyStreak: p.dailyStreak ?? 0,
    lastDailyDate: p.lastDailyDate ?? null,
    loginBugReproduced: Boolean(p.loginBugReproduced),
    loginFixVerified: Boolean(p.loginFixVerified),
    paymentCallbackMiss: Boolean(p.paymentCallbackMiss),
    paymentErrorReproduced: Boolean(p.paymentErrorReproduced),
    orderBottleneckIdentified: Boolean(p.orderBottleneckIdentified),
    prodSlowReproduced: Boolean(p.prodSlowReproduced),
    logReviewed: Boolean(p.logReviewed),
  })

  const proj = data.project || {}
  projectStore.importSnapshot({
    artifacts: proj.artifacts || {},
    loginSut: proj.loginSut || {},
    paymentSut: proj.paymentSut || {},
    orderSut: proj.orderSut || {},
    onboardSut: proj.onboardSut || {},
  })

  if (data.theme && themeStore) {
    themeStore.setTheme(data.theme === 'dark' ? 'dark' : 'light')
  }

  return { ok: true, message: '存档已恢复' }
}

export function downloadBackup(backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `测试人一生-存档-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function readBackupFile(file) {
  const text = await file.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('无法解析 JSON 文件')
  }
}
