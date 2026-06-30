import { test, expect } from '@playwright/test'
import { seedAppStorage } from './helpers.js'

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('home shows continue bar and chapter strip', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/')
    await expect(page.getByRole('button', { name: '进关卡' }).first()).toBeVisible()
    await expect(page.locator('.home-continue')).toBeVisible()
    await expect(page.locator('.chapter-strip__node').first()).toBeVisible()
  })

  test('legacy career hash scrolls to quest log on home', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/#home-career')
    await expect(page.locator('.chapter-strip__node').first()).toBeVisible({
      timeout: 15000,
    })
    await expect(page.locator('#quest-log')).toBeVisible()
  })

  test('profile tab contains export save button', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/#home-progress')
    await expect(page.getByRole('button', { name: '导出存档' })).toBeVisible({
      timeout: 15000,
    })
  })

  test('achievements tab shows flat list', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/#home-achievements')
    await expect(page.locator('.achievement-panel--flat')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.achievement-panel__list--flat')).toBeVisible()
    await expect(page.locator('.achievement-panel__item').first()).toBeVisible()
  })

  test('side tab shows chapter folds without outer frame', async ({ page }) => {
    await seedAppStorage(page)
    await page.goto('/#home-side')
    await expect(page.locator('.side-hub--compact')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.side-hub__chapter-summary').first()).toBeVisible()
  })
})
