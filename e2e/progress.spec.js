import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import {
  PROGRESS_KEY,
  EMPTY_PROGRESS,
  seedAppStorage,
  openSavePanel,
  buildSampleBackup,
} from './helpers.js'

test('completes checklist level 1 and shows debrief', async ({ page }) => {
  await seedAppStorage(page, { progress: EMPTY_PROGRESS })
  await page.goto('/level/1')

  for (const id of ['a', 'b', 'c', 'e', 'f']) {
    await page.locator(`.checklist-item input[value="${id}"]`).check()
  }
  await page.getByRole('button', { name: '✓ 确认勾选' }).click()

  await expect(page.locator('.debrief-overlay')).toBeVisible()
  await expect(page.getByText('✅ 任务完成')).toBeVisible()
  await expect(page.locator('#debrief-title')).toHaveText('接PRD，圈测试点')

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY)
  expect(saved.completedLevelIds).toContain(1)
})

test('exports backup JSON with current progress', async ({ page }) => {
  await seedAppStorage(page, {
    progress: {
      ...EMPTY_PROGRESS,
      completedLevelIds: [1, 2, 3],
      levelMeta: { 1: { stars: 2 } },
    },
  })
  await page.goto('/')
  await openSavePanel(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出存档' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/测试人一生-存档-\d{4}-\d{2}-\d{2}\.json/)

  const path = await download.path()
  const payload = JSON.parse(readFileSync(path, 'utf8'))
  expect(payload.app).toBe('softwaretest-simulator')
  expect(payload.progress.completedLevelIds).toEqual([1, 2, 3])
})

test('imports backup JSON and restores progress', async ({ page }) => {
  await seedAppStorage(page, { progress: EMPTY_PROGRESS })
  await page.goto('/')

  await openSavePanel(page)

  page.once('dialog', (dialog) => dialog.accept())

  const backup = buildSampleBackup([1, 2, 3, 4, 5])
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '导入存档' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: '测试人一生-存档-test.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(backup)),
  })

  await expect(page.getByText('存档已恢复')).toBeVisible()
  await expect(page.locator('.workbench__level-tag')).toContainText('5/')

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY)
  expect(saved.completedLevelIds).toEqual([1, 2, 3, 4, 5])
})
