import { test, expect } from '@playwright/test'

const PROGRESS_KEY = 'app_progress_user_progress'
const ONBOARDING_KEY = 'app_progress_onboarding_v1'

const PROGRESS_SEED = {
  completedLevelIds: [1, 2],
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

async function seedAppStorage(page, { skipOnboarding = true, progress = PROGRESS_SEED } = {}) {
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

test('home page loads with continue challenge', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/')
  await expect(page.locator('h1.workbench__title')).toHaveText('测试人一生')
  await expect(page.getByRole('button', { name: /开始今日任务|继续挑战/ })).toBeVisible()
})

test('main level route shows deliverable banner', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/level/3')
  await expect(page.locator('.workbench__topbar-right .workbench__level-tag')).toHaveText('主线 · #3')
  await expect(page.getByText('今日交付物')).toBeVisible()
  await expect(page.locator('.sut-mode')).toHaveCount(0)
})

test('sut route shows immersion steps and tag', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/level/3/sut/app')
  await expect(page.locator('.workbench__topbar-right .workbench__level-tag')).toHaveText('上机 · #3')
  await expect(page.locator('.sut-mode__steps')).toBeVisible()
  await expect(page.locator('.sut-mode__goal')).toHaveText('App 复现 Bug')
})
