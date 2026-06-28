import { test, expect } from '@playwright/test'
import { seedAppStorage } from './helpers.js'

test('home page loads with continue challenge', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/')
  await expect(page.locator('h1.workbench__title')).toHaveText('测试人一生')
  await expect(page.getByRole('button', { name: /开始今日任务|继续挑战/ })).toBeVisible()
})

test('main level route shows deliverable banner', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/level/3')
  await expect(page.locator('.workbench__topbar-right .workbench__level-tag')).toHaveText(
    '主线 · #3'
  )
  await expect(page.getByText('今日交付物')).toBeVisible()
  await expect(page.locator('.sut-mode')).toHaveCount(0)
})

test('sut route shows immersion steps and tag', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/level/3/sut/app')
  await expect(page.locator('.workbench__topbar-right .workbench__level-tag')).toHaveText(
    '上机 · #3'
  )
  await expect(page.locator('.sut-mode__steps')).toBeVisible()
  await expect(page.locator('.sut-mode__goal')).toHaveText('App 复现 Bug')
})
