import { defineStore } from 'pinia'
import { getItem, setItem, removeItem } from '../utils/storage'
import { levelOrder } from '../data/levels'
import { getSideLevel, isSideQuestUnlocked, isSideQuestId } from '../data/sideQuests'
import {
  getTodayDateStr,
  getDailyUnlockLevelId,
  DAILY_LEVEL_ID,
  isDailyQuestId,
} from '../data/dailyChallenges'
import { getLevelById, isMainQuestId } from '../utils/levelRegistry'
import { countMainlineCompleted, TOTAL_MAIN_LEVELS } from '../data/mainlineMeta'
import { calculateStars, calculateBonusXp } from '../utils/validator'
import { evaluateAchievements } from '../data/achievements'

const STORAGE_KEY = 'user_progress'

function getPreviousLevelId(levelId) {
  const index = levelOrder.indexOf(levelId)
  if (index <= 0) return null
  return levelOrder[index - 1]
}

function sanitizeIds(raw) {
  if (!Array.isArray(raw)) return []
  return raw.filter((id) => typeof id === 'number' && Number.isFinite(id))
}

function sanitizeRecord(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw
}

function snapshot(state) {
  return {
    completedLevelIds: state.completedLevelIds,
    levelMeta: state.levelMeta,
    levelMistakes: state.levelMistakes,
    levelSubmissions: state.levelSubmissions,
    dailyStreak: state.dailyStreak || 0,
    loginBugReproduced: Boolean(state.loginBugReproduced),
    loginFixVerified: Boolean(state.loginFixVerified),
    paymentCallbackMiss: Boolean(state.paymentCallbackMiss),
    paymentErrorReproduced: Boolean(state.paymentErrorReproduced),
    orderBottleneckIdentified: Boolean(state.orderBottleneckIdentified),
    prodSlowReproduced: Boolean(state.prodSlowReproduced),
    logReviewed: Boolean(state.logReviewed),
  }
}

function defaultState() {
  const saved = getItem(STORAGE_KEY, {})
  const state = {
    completedLevelIds: sanitizeIds(saved.completedLevelIds),
    levelMeta: sanitizeRecord(saved.levelMeta),
    attemptCounts: sanitizeRecord(saved.attemptCounts),
    hintsUsed: sanitizeRecord(saved.hintsUsed),
    levelMistakes: sanitizeRecord(saved.levelMistakes),
    levelSubmissions: sanitizeRecord(saved.levelSubmissions),
    achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
    dailyCompletedDate:
      typeof saved.dailyCompletedDate === 'string' ? saved.dailyCompletedDate : null,
    dailyStreak: typeof saved.dailyStreak === 'number' ? saved.dailyStreak : 0,
    lastDailyDate: typeof saved.lastDailyDate === 'string' ? saved.lastDailyDate : null,
    loginBugReproduced: Boolean(saved.loginBugReproduced),
    loginFixVerified: Boolean(saved.loginFixVerified),
    paymentCallbackMiss: Boolean(saved.paymentCallbackMiss),
    paymentErrorReproduced: Boolean(saved.paymentErrorReproduced),
    orderBottleneckIdentified: Boolean(saved.orderBottleneckIdentified),
    prodSlowReproduced: Boolean(saved.prodSlowReproduced),
    logReviewed: Boolean(saved.logReviewed),
  }
  try {
    if (state.completedLevelIds.length && !state.achievements.length) {
      state.achievements = evaluateAchievements(snapshot(state))
    }
  } catch {
    state.achievements = []
  }
  return state
}

export const useProgressStore = defineStore('progress', {
  state: () => defaultState(),

  getters: {
    totalLevelCount() {
      return TOTAL_MAIN_LEVELS
    },

    mainCompletedCount(state) {
      return countMainlineCompleted(state.completedLevelIds)
    },

    sideCompletedCount(state) {
      return state.completedLevelIds.filter((id) => isSideQuestId(id)).length
    },

    isDailyUnlocked(state) {
      return state.completedLevelIds.includes(getDailyUnlockLevelId())
    },

    isDailyDoneToday(state) {
      return state.dailyCompletedDate === getTodayDateStr()
    },

    unlockedLevels(state) {
      return levelOrder.filter((levelId) => {
        if (levelId === levelOrder[0]) return true
        const prev = getPreviousLevelId(levelId)
        return prev && state.completedLevelIds.includes(prev)
      })
    },

    totalXp(state) {
      return state.completedLevelIds.reduce((sum, id) => {
        const level = getLevelById(id)
        if (!level) return sum
        const meta = state.levelMeta[id] || {}
        return sum + level.xpReward + (meta.bonusXp || 0)
      }, 0)
    },

    firstAvailableLevelId(state) {
      for (const levelId of levelOrder) {
        if (state.completedLevelIds.includes(levelId)) continue
        const prev = getPreviousLevelId(levelId)
        if (!prev || state.completedLevelIds.includes(prev)) {
          return levelId
        }
      }
      return null
    },

    totalStars(state) {
      return state.completedLevelIds.reduce((sum, id) => {
        return sum + (state.levelMeta[id]?.stars || 1)
      }, 0)
    },

    newAchievements(state) {
      const current = evaluateAchievements(snapshot(state))
      return current.filter((id) => !state.achievements.includes(id))
    },
  },

  actions: {
    getStatus(levelId) {
      if (!isMainQuestId(levelId)) {
        return this.getExtraStatus(levelId)
      }
      if (this.completedLevelIds.includes(levelId)) {
        return 'completed'
      }
      const prev = getPreviousLevelId(levelId)
      if (!prev || this.completedLevelIds.includes(prev)) {
        return 'available'
      }
      return 'locked'
    },

    getExtraStatus(levelId) {
      if (isDailyQuestId(levelId)) {
        return this.getDailyStatus()
      }
      if (isSideQuestId(levelId)) {
        return this.getSideQuestStatus(levelId)
      }
      return 'locked'
    },

    getSideQuestStatus(levelId) {
      if (this.completedLevelIds.includes(levelId)) {
        return 'completed'
      }
      const sideLevel = getSideLevel(levelId)
      if (!sideLevel) return 'locked'
      if (isSideQuestUnlocked(sideLevel, this.completedLevelIds)) {
        return 'available'
      }
      return 'locked'
    },

    getDailyStatus() {
      if (!this.isDailyUnlocked) return 'locked'
      if (this.isDailyDoneToday) return 'completed'
      return 'available'
    },

    getLevelMeta(levelId) {
      return this.levelMeta[levelId] || null
    },

    getAttemptCount(levelId) {
      return this.attemptCounts[levelId] || 0
    },

    getLevelMistakes(levelId) {
      return this.levelMistakes[levelId] || 0
    },

    hasUsedHint(levelId) {
      return Boolean(this.hintsUsed[levelId])
    },

    getSubmission(levelId) {
      return this.levelSubmissions[levelId] || null
    },

    saveSubmission(levelId, simType, data) {
      this.levelSubmissions[levelId] = {
        simType,
        data,
        savedAt: new Date().toISOString(),
      }
      this.persist()
    },

    recordAttempt(levelId) {
      this.attemptCounts[levelId] = (this.attemptCounts[levelId] || 0) + 1
      this.persist()
    },

    recordMistake(levelId) {
      this.levelMistakes[levelId] = (this.levelMistakes[levelId] || 0) + 1
      this.persist()
    },

    useHint(levelId) {
      this.hintsUsed[levelId] = true
      this.persist()
    },

    completeLevel(id, baseXp, session = {}) {
      const attempts = session.attempts ?? 1
      const hintsUsed = session.hintsUsed ?? false
      const sessionStars = calculateStars(attempts, hintsUsed, {
        jiraTier: session.jiraTier,
      })
      const alreadyDone = this.completedLevelIds.includes(id)
      const prev = this.levelMeta[id]

      const finalStars = prev ? Math.max(prev.stars, sessionStars) : sessionStars
      const finalBonus = calculateBonusXp(baseXp, finalStars)
      const improved = !prev || finalStars > prev.stars

      if (!alreadyDone) {
        this.completedLevelIds.push(id)
      }

      this.levelMeta[id] = {
        stars: finalStars,
        bonusXp: finalBonus,
        sessionStars,
        improved,
        attempts: (prev?.attempts || 0) + attempts,
        hintsUsed: prev?.hintsUsed || hintsUsed,
        jiraTier: session.jiraTier || prev?.jiraTier || null,
      }

      if (isDailyQuestId(id)) {
        this.markDailyComplete()
      }

      this.syncAchievements()
      this.persist()

      return {
        stars: finalStars,
        bonusXp: finalBonus,
        sessionStars,
        improved,
        attempts,
        hintsUsed,
      }
    },

    markDailyComplete() {
      const today = getTodayDateStr()
      if (this.dailyCompletedDate === today) return

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)

      if (this.lastDailyDate === yesterdayStr) {
        this.dailyStreak += 1
      } else if (this.lastDailyDate !== today) {
        this.dailyStreak = 1
      }

      this.dailyCompletedDate = today
      this.lastDailyDate = today
    },

    syncAchievements() {
      this.achievements = evaluateAchievements(snapshot(this))
    },

    recordLoginBugReproduced() {
      if (this.loginBugReproduced) return
      this.loginBugReproduced = true
      this.syncAchievements()
      this.persist()
    },

    recordLoginFixVerified() {
      if (this.loginFixVerified) return
      this.loginFixVerified = true
      this.syncAchievements()
      this.persist()
    },

    recordPaymentCallbackMiss() {
      if (this.paymentCallbackMiss) return
      this.paymentCallbackMiss = true
      this.syncAchievements()
      this.persist()
    },

    recordPaymentErrorReproduced() {
      if (this.paymentErrorReproduced) return
      this.paymentErrorReproduced = true
      this.syncAchievements()
      this.persist()
    },

    recordPaymentVerified() {
      this.persist()
    },

    recordOrderBottleneckIdentified() {
      if (this.orderBottleneckIdentified) return
      this.orderBottleneckIdentified = true
      this.syncAchievements()
      this.persist()
    },

    recordProdSlowReproduced() {
      if (this.prodSlowReproduced) return
      this.prodSlowReproduced = true
      this.syncAchievements()
      this.persist()
    },

    recordLogReviewed() {
      if (this.logReviewed) return
      this.logReviewed = true
      this.syncAchievements()
      this.persist()
    },

    importSnapshot(data) {
      this.completedLevelIds = sanitizeIds(data.completedLevelIds)
      this.levelMeta = sanitizeRecord(data.levelMeta)
      this.attemptCounts = sanitizeRecord(data.attemptCounts)
      this.hintsUsed = sanitizeRecord(data.hintsUsed)
      this.levelMistakes = sanitizeRecord(data.levelMistakes)
      this.levelSubmissions = sanitizeRecord(data.levelSubmissions)
      this.achievements = Array.isArray(data.achievements) ? data.achievements : []
      this.dailyCompletedDate = data.dailyCompletedDate ?? null
      this.dailyStreak = typeof data.dailyStreak === 'number' ? data.dailyStreak : 0
      this.lastDailyDate = data.lastDailyDate ?? null
      this.loginBugReproduced = Boolean(data.loginBugReproduced)
      this.loginFixVerified = Boolean(data.loginFixVerified)
      this.paymentCallbackMiss = Boolean(data.paymentCallbackMiss)
      this.paymentErrorReproduced = Boolean(data.paymentErrorReproduced)
      this.orderBottleneckIdentified = Boolean(data.orderBottleneckIdentified)
      this.prodSlowReproduced = Boolean(data.prodSlowReproduced)
      this.logReviewed = Boolean(data.logReviewed)
      this.syncAchievements()
      this.persist()
    },

    resetProgress() {
      this.completedLevelIds = []
      this.levelMeta = {}
      this.attemptCounts = {}
      this.hintsUsed = {}
      this.levelMistakes = {}
      this.levelSubmissions = {}
      this.achievements = []
      this.dailyCompletedDate = null
      this.dailyStreak = 0
      this.lastDailyDate = null
      this.loginBugReproduced = false
      this.loginFixVerified = false
      this.paymentCallbackMiss = false
      this.paymentErrorReproduced = false
      this.orderBottleneckIdentified = false
      this.prodSlowReproduced = false
      this.logReviewed = false
      removeItem(STORAGE_KEY)
    },

    persist() {
      setItem(STORAGE_KEY, {
        completedLevelIds: this.completedLevelIds,
        levelMeta: this.levelMeta,
        attemptCounts: this.attemptCounts,
        hintsUsed: this.hintsUsed,
        levelMistakes: this.levelMistakes,
        levelSubmissions: this.levelSubmissions,
        achievements: this.achievements,
        dailyCompletedDate: this.dailyCompletedDate,
        dailyStreak: this.dailyStreak,
        lastDailyDate: this.lastDailyDate,
        loginBugReproduced: this.loginBugReproduced,
        loginFixVerified: this.loginFixVerified,
        paymentCallbackMiss: this.paymentCallbackMiss,
        paymentErrorReproduced: this.paymentErrorReproduced,
        orderBottleneckIdentified: this.orderBottleneckIdentified,
        prodSlowReproduced: this.prodSlowReproduced,
        logReviewed: this.logReviewed,
      })
    },
  },
})
