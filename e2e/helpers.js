import { readFileSync } from 'node:fs'
import { APP_VERSION } from '../src/data/whatsNew.js'

export const PROGRESS_KEY = 'app_progress_user_progress'
export const ONBOARDING_KEY = 'app_progress_onboarding_v1'
export const WHATS_NEW_KEY = 'app_progress_whats_new_seen_version'
/** 与 whatsNew APP_VERSION 同步，避免 e2e 被更新弹窗遮挡 */
export const WHATS_NEW_SEEN_VERSION = APP_VERSION

export const EMPTY_PROGRESS = {
  completedLevelIds: [],
  levelMeta: {},
  attemptCounts: {},
  hintsUsed: {},
  levelMistakes: {},
  levelSubmissions: {},
  achievements: [],
  dailyCompletedDate: null,
  dailyStreak: 0,
  lastDailyDate: null,
  loginBugReproduced: false,
  loginFixVerified: false,
  paymentCallbackMiss: false,
  paymentErrorReproduced: false,
  orderBottleneckIdentified: false,
  prodSlowReproduced: false,
  logReviewed: false,
  leadGonogoReviewed: false,
  leadTasksAssigned: false,
  leadLoadReportReviewed: false,
}

/** 已解锁 Lead #33 Go/No-Go 关（完成 #32 及之前全部主线） */
export const LEAD_GONOGO_PROGRESS = {
  ...EMPTY_PROGRESS,
  completedLevelIds: [
    1, 2, 3, 4, 5, 34, 35, 16, 26, 17, 36, 37, 38, 6, 18, 19, 39, 40, 41, 7, 8, 9, 10, 20, 27, 21,
    42, 11, 12, 13, 14, 51, 15, 50, 43, 49, 44, 22, 23, 24, 25, 45, 46, 28, 29, 30, 31, 32,
  ],
}

export const PROGRESS_SEED = {
  ...EMPTY_PROGRESS,
  completedLevelIds: [1, 2],
}

export async function seedAppStorage(
  page,
  { skipOnboarding = true, progress = PROGRESS_SEED } = {}
) {
  await page.addInitScript(
    ({
      progressKey,
      onboardingKey,
      whatsNewKey,
      whatsNewVersion,
      progressData,
      dismissOnboarding,
    }) => {
      localStorage.setItem(progressKey, JSON.stringify(progressData))
      if (dismissOnboarding) {
        localStorage.setItem(onboardingKey, JSON.stringify(true))
        localStorage.setItem(whatsNewKey, JSON.stringify(whatsNewVersion))
      }
    },
    {
      progressKey: PROGRESS_KEY,
      onboardingKey: ONBOARDING_KEY,
      whatsNewKey: WHATS_NEW_KEY,
      whatsNewVersion: WHATS_NEW_SEEN_VERSION,
      progressData: progress,
      dismissOnboarding: skipOnboarding,
    }
  )
}

export async function openSavePanel(page) {
  const exportBtn = page.getByRole('button', { name: '导出存档' })
  if (await exportBtn.isVisible()) return

  await page.goto('/#home-progress')
  await exportBtn.waitFor({ state: 'visible', timeout: 15000 })
}

export function buildSampleBackup(completedLevelIds = [1, 2, 3]) {
  return {
    version: 2,
    app: 'softwaretest-simulator',
    exportedAt: '2026-06-28T00:00:00.000Z',
    progress: {
      ...EMPTY_PROGRESS,
      completedLevelIds,
      levelMeta: { 1: { stars: 3 } },
      achievements: ['first_step'],
    },
    project: {
      artifacts: {},
      loginSut: {},
      paymentSut: {},
      orderSut: {},
      onboardSut: {},
      leadSut: {},
    },
    theme: 'light',
  }
}
