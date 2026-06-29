import { test, expect } from '@playwright/test'
import { seedAppStorage } from './helpers.js'

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('home shows task-first hero and rank progress', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/')
    await expect(page.getByRole('button', { name: /开始今日任务/ })).toBeVisible()
    await expect(page.getByText('升职进度')).toBeVisible()
  })

  test('career fold expands to show chapter summary', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/')
    const careerFold = page.locator('details.home-fold--career')
    await careerFold.locator('summary').click()
    await expect(careerFold.locator('.career-script__chapter-summary').first()).toBeVisible()
  })

  test('progress fold contains export save button', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/')
    const progressFold = page.locator('details.home-fold--progress')
    await progressFold.locator('summary').click()
    await expect(page.getByRole('button', { name: '导出存档' })).toBeVisible()
  })
})
