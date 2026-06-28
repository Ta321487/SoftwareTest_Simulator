import { describe, it, expect } from 'vitest'
import { buildBackup, applyBackup, BACKUP_VERSION } from './progressBackup.js'

describe('progressBackup', () => {
  const progressStore = {
    completedLevelIds: [1, 2],
    levelMeta: { 1: { stars: 3 } },
    attemptCounts: { 1: 1 },
    hintsUsed: {},
    levelMistakes: {},
    levelSubmissions: { 2: { simType: 'template', data: { values: { a: 'x' } } } },
    achievements: ['first_step'],
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
    importSnapshot(data) {
      Object.assign(this, data, { importSnapshot: this.importSnapshot })
    },
  }

  const projectStore = {
    artifacts: {},
    loginSut: {},
    paymentSut: {},
    orderSut: {},
    onboardSut: {},
    importSnapshot(data) {
      Object.assign(this, data, { importSnapshot: this.importSnapshot })
    },
  }

  it('builds valid backup envelope', () => {
    const backup = buildBackup(progressStore, projectStore)
    expect(backup.version).toBe(2)
    expect(backup.app).toBe('softwaretest-simulator')
    expect(backup.progress.completedLevelIds).toEqual([1, 2])
  })

  it('rejects invalid backup', () => {
    const result = applyBackup({ app: 'other' }, progressStore, projectStore)
    expect(result.ok).toBe(false)
  })

  it('applies backup to stores', () => {
    const backup = buildBackup(progressStore, projectStore)
    const target = {
      ...progressStore,
      completedLevelIds: [],
      importSnapshot(data) {
        Object.assign(this, data, { importSnapshot: this.importSnapshot })
      },
    }
    const result = applyBackup(backup, target, projectStore)
    expect(result.ok).toBe(true)
    expect(target.completedLevelIds).toEqual([1, 2])
  })
})
