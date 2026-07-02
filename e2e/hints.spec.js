import { test, expect } from '@playwright/test'
import { seedAppStorage, PROGRESS_KEY, PROGRESS_SEED, EMPTY_PROGRESS } from './helpers.js'

const DAILY_LEVEL_ID = 900

test('level hint reveals text and can rotate when pool has multiple entries', async ({ page }) => {
  await seedAppStorage(page, { progress: EMPTY_PROGRESS })
  await page.goto('/level/1')

  const hintBtn = page.locator('.level-detail__hint-btn')
  await expect(hintBtn).toBeVisible()
  await expect(hintBtn).toContainText('查看提示（会少一颗星）')

  await hintBtn.click()
  await expect(page.locator('.level-detail__hint-box')).toBeVisible()
  await expect(page.locator('.level-detail__hint-box p')).not.toBeEmpty()
  await expect(hintBtn).toContainText(/换一条提示|再看提示/)

  const progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY)
  expect(progress.hintsUsed['1']).toBe(true)
})

test('daily quest hint does not persist hintsUsed', async ({ page }) => {
  await seedAppStorage(page, {
    progress: {
      ...PROGRESS_SEED,
      completedLevelIds: [1, 2, 3, 4, 5],
    },
  })
  await page.goto(`/level/${DAILY_LEVEL_ID}`)

  const hintBtn = page.getByRole('button', { name: /思路提示/ })
  await expect(hintBtn).toBeVisible()
  await hintBtn.click()

  await expect(page.locator('.level-detail__hint-box')).toBeVisible()

  const progress = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY)
  expect(progress.hintsUsed[DAILY_LEVEL_ID]).toBeFalsy()
})
