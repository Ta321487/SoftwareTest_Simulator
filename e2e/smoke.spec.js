import { test, expect } from '@playwright/test'
import { seedAppStorage, LEAD_GONOGO_PROGRESS } from './helpers.js'

test('home page loads with continue challenge', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/')
  await expect(page.locator('h1.workbench__title')).toHaveText('测试人一生')
  await expect(page.getByRole('button', { name: /进入关卡/ })).toBeVisible()
})

test('main level route shows deliverable banner', async ({ page }) => {
  await seedAppStorage(page)
  await page.goto('/level/3')
  await expect(page.locator('.workbench__topbar-right .workbench__level-tag')).toHaveText(
    '主线 · #3'
  )
  await expect(
    page.locator('.task-panel-brief--desktop .task-panel__deliverable-label')
  ).toBeVisible()
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

test('lead sut route shows Go/No-Go board', async ({ page }) => {
  await seedAppStorage(page, { progress: LEAD_GONOGO_PROGRESS })
  await page.goto('/level/33/sut/lead')
  await expect(page.locator('.workbench__topbar-right .workbench__level-tag')).toHaveText(
    '上机 · #33'
  )
  await expect(page.locator('.sut-mode__goal')).toHaveText('Go/No-Go 看板')
  await expect(page.locator('.lead-panel')).toBeVisible()
})
