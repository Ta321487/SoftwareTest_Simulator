export const PROGRESS_KEY = 'app_progress_user_progress'
export const ONBOARDING_KEY = 'app_progress_onboarding_v1'

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
    ({ progressKey, onboardingKey, progressData, dismissOnboarding }) => {
      localStorage.setItem(progressKey, JSON.stringify(progressData))
      if (dismissOnboarding) {
        localStorage.setItem(onboardingKey, JSON.stringify(true))
      }
    },
    {
      progressKey: PROGRESS_KEY,
      onboardingKey: ONBOARDING_KEY,
      progressData: progress,
      dismissOnboarding: skipOnboarding,
    }
  )
}

export async function openSavePanel(page) {
  const panel = page.locator('details.home-fold').filter({ hasText: '成就与存档' })
  await panel.locator('summary').click()
  await page.getByRole('button', { name: '导出存档' }).waitFor({ state: 'visible' })
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
    },
    theme: 'light',
  }
}
