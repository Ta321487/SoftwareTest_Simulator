import { test, expect } from '@playwright/test'
import { seedAppStorage, PROGRESS_SEED } from './helpers.js'

/** 各 simType 代表关：需 seed 足够进度以解锁 */
const SIM_TYPE_LEVELS = [
  { simType: 'checklist', levelId: 1, marker: '确认勾选' },
  { simType: 'template', levelId: 2, marker: '提交' },
  { simType: 'jira', levelId: 3, marker: 'Jira' },
  { simType: 'report', levelId: 4, marker: '回归' },
  { simType: 'terminal', levelId: 5, marker: 'SSH' },
  { simType: 'config', levelId: 6, marker: '测试连接' },
  { simType: 'chat', levelId: 7, marker: '发送' },
]

const UNLOCK_BEFORE_CHAT = [
  1, 2, 3, 4, 5, 34, 35, 16, 26, 17, 36, 37, 38, 6, 18, 19, 39, 40, 41,
]

const UNLOCK_SEED = {
  ...PROGRESS_SEED,
  completedLevelIds: UNLOCK_BEFORE_CHAT,
}

test.beforeEach(async ({ page }) => {
  await seedAppStorage(page, {
    progress: UNLOCK_SEED,
  })
})

for (const { simType, levelId, marker } of SIM_TYPE_LEVELS) {
  test(`simType ${simType} level ${levelId} loads simulator`, async ({ page }) => {
    await page.goto(`/level/${levelId}`)
    await expect(page.locator('.workbench__level-tag')).toContainText(`#${levelId}`)
    await expect(page.locator('.workbench__sim-area')).toBeVisible()
    const body = page.locator('.workbench__sim-area')
    await expect(body).toContainText(new RegExp(marker, 'i'))
  })
}

test('side quest checklist loads', async ({ page }) => {
  await page.goto('/level/101')
  await expect(page.locator('.task-panel__extra-tag').first()).toContainText('番外')
  await expect(page.getByRole('button', { name: /确认勾选/ })).toBeVisible()
})

test('backup export button visible in profile tab', async ({ page }) => {
  await page.goto('/#home-progress')
  await expect(page.getByRole('button', { name: '导出存档' })).toBeVisible()
})
