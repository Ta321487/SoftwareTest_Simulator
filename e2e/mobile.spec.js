import { test, expect } from '@playwright/test'
import { seedAppStorage } from './helpers.js'

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('home shows task-first hero and rank progress', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/')
    await expect(page.locator('.game-playbar__btn')).toBeVisible()
    await expect(page.getByText('升职进度')).toBeVisible()
  })

  test('career tab shows chapter content', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/#home-career')
    await expect(page.locator('.chapter-strip__node').first()).toBeVisible({
      timeout: 15000,
    })
    await expect(page.locator('.career-script__panel-title')).toBeVisible()
  })

  test('profile tab contains export save button', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/#home-progress')
    await expect(page.getByRole('button', { name: '导出存档' })).toBeVisible({
      timeout: 15000,
    })
  })
})
