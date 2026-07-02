import { ref } from 'vue'
import { validateSimulation } from '../utils/validator'
import { shouldOfferChatFollowUp, getChatFollowUpThread, getChatSuccessThread, combineChatMessages, getChatFollowUpNotice } from '../utils/chatValidation'
import { getFailureHint } from '../utils/failureHints'
import { trackLevelFail, trackLevelPass } from '../utils/analytics'
import { getRankForXp } from '../data/ranks'
import { getAchievementById } from '../data/achievements'
import {
  getPassDebriefNote,
  shouldRecordMistake,
  computeArtifactQuality,
} from '../data/consequences'
import { getPhaseMilestoneForLevel } from '../data/phaseMilestones'
import { isDailyQuestId } from '../utils/levelRegistry'
import { PAYMENT_MODULE_ID } from '../utils/paymentSut'
import { getImmersionEntries, syncDbConnectedStep } from '../utils/sutImmersion'

export function getDebriefDelay(simType) {
  switch (simType) {
    case 'jira':
    case 'terminal':
      return 1400
    case 'chat':
      return 1800
    case 'config':
      return 1200
    default:
      return 700
  }
}

export function buildSimEpilogue(level, storyContext, submitData) {
  if (!level) return null

  switch (level.simType) {
    case 'chat': {
      if (!storyContext.chatReply) return null
      const history = storyContext.chatHistory || []
      const lastOther = [...history].reverse().find((m) => m.role === 'other') || history[0]
      return {
        kind: 'quote',
        label: `${lastOther?.sender || '对方'} · 回应`,
        text: storyContext.chatReply,
      }
    }
    case 'terminal':
      return {
        kind: 'quote',
        label: '命令结果',
        text: level.terminalSuccessMsg || '日志已加载，发现多条 ERROR，建议结合业务现象继续排查。',
      }
    case 'jira': {
      const values = submitData?.values
      if (!values) return null
      const fields = level.jiraFields || {}
      const items = Object.entries(fields).map(([key, config]) => ({
        title: config.label,
        text: values[key] || '—',
      }))
      return {
        kind: 'list',
        label: '工单已提交',
        badge: `TEST-${1000 + level.id}`,
        items,
      }
    }
    case 'config': {
      const value = submitData?.value
      if (value == null || value === '') return null
      const key = level.configKey || 'DB_HOST'
      return {
        kind: 'quote',
        label: '环境检测',
        text: `✓ 连接成功 — ${key}=${value}，数据库连通正常。`,
      }
    }
    default:
      return null
  }
}

/** 关卡提交、校验、通关与失败反馈 */
export function useLevelSubmit({
  level,
  storyContext,
  progressStore,
  projectStore,
  sessionHintUsed,
  sessionAttempts,
  simRef,
}) {
  const showFeedback = ref(false)
  const feedbackMessage = ref('')
  const failureHint = ref('')
  const showDebrief = ref(false)
  const isSubmitting = ref(false)
  const jiraInvalidFields = ref([])
  const jiraPreview = ref(null)
  const xpBeforeLevel = ref(0)
  const rankBeforeLevel = ref(null)
  const levelReward = ref({ stars: 1, bonusXp: 0, sessionStars: 0, improved: false })
  const newAchievements = ref([])
  const passDebriefNote = ref(null)
  const sessionJiraTier = ref(null)
  const phaseMilestone = ref(null)
  const passSimEpilogue = ref(null)
  const submitFlash = ref('')
  const chatPriorMessages = ref([])

  function resetSubmitState() {
    showFeedback.value = false
    feedbackMessage.value = ''
    failureHint.value = ''
    showDebrief.value = false
    isSubmitting.value = false
    jiraInvalidFields.value = []
    jiraPreview.value = null
    levelReward.value = { stars: 1, bonusXp: 0, sessionStars: 0, improved: false }
    newAchievements.value = []
    sessionAttempts.value = 0
    passDebriefNote.value = null
    sessionJiraTier.value = null
    passSimEpilogue.value = null
    simRef.value?.reset?.()
    chatPriorMessages.value = []
  }

  function saveStoryArtifact(submitData) {
    const lv = level.value
    if (!lv?.projectId) return
    const mistakesOnLevel = progressStore.getLevelMistakes(lv.id)
    const quality = computeArtifactQuality(
      sessionAttempts.value,
      sessionHintUsed.value,
      mistakesOnLevel,
      sessionJiraTier.value
    )
    projectStore.saveArtifact(lv.projectId, lv.id, {
      ...submitData,
      _meta: {
        quality,
        mistakes: mistakesOnLevel,
        attempts: sessionAttempts.value,
        hintsUsed: sessionHintUsed.value,
        jiraTier: sessionJiraTier.value,
      },
    })

    if (lv.id === 6 && lv.projectId === PAYMENT_MODULE_ID) {
      projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { dbConnected: true })
      const dbEntry = getImmersionEntries(PAYMENT_MODULE_ID).find((e) => e.key === 'dbConnected')
      if (dbEntry) {
        syncDbConnectedStep(dbEntry, projectStore, PAYMENT_MODULE_ID, progressStore)
      }
    }
  }

  function handlePass(submitData) {
    const lv = level.value
    if (!lv) return
    xpBeforeLevel.value = progressStore.totalXp
    rankBeforeLevel.value = getRankForXp(progressStore.totalXp)
    saveStoryArtifact(submitData)
    progressStore.saveSubmission(lv.id, lv.simType, submitData)

    const prevAchievements = [...progressStore.achievements]
    levelReward.value = progressStore.completeLevel(lv.id, lv.xpReward, {
      attempts: sessionAttempts.value,
      hintsUsed: isDailyQuestId(lv.id) ? false : sessionHintUsed.value,
      jiraTier: sessionJiraTier.value,
    })
    newAchievements.value = progressStore.achievements
      .filter((id) => !prevAchievements.includes(id))
      .map((id) => getAchievementById(id))
      .filter(Boolean)

    if (lv.simType === 'jira' && submitData?.values) {
      jiraPreview.value = { ...submitData.values }
    }

    passDebriefNote.value = getPassDebriefNote(lv.id, progressStore, projectStore)
    phaseMilestone.value = getPhaseMilestoneForLevel(lv.id)

    showFeedback.value = false
    feedbackMessage.value = ''
    failureHint.value = ''
    isSubmitting.value = true
    submitFlash.value = `✓ 通过 +${lv.xpReward} XP`
    passSimEpilogue.value = buildSimEpilogue(lv, storyContext.value, submitData)

    const debriefDelay = getDebriefDelay(lv.simType)
    setTimeout(() => {
      submitFlash.value = ''
      showDebrief.value = true
      trackLevelPass(lv.id, lv.simType, levelReward.value.stars)
    }, debriefDelay)
  }

  function handleFail(data, result) {
    const lv = level.value
    showFeedback.value = true
    feedbackMessage.value = result.message
    failureHint.value = getFailureHint(lv, data, result)

    if (lv && shouldRecordMistake(lv.simType)) {
      progressStore.recordMistake(lv.id)
    }
    trackLevelFail(lv?.id, lv?.simType)
  }

  function handleSimSubmit(data) {
    const lv = level.value
    if (!lv || isSubmitting.value || showDebrief.value) return

    sessionAttempts.value += 1
    progressStore.recordAttempt(lv.id)
    const result = validateSimulation(lv, data)

    if (lv.simType === 'jira') {
      jiraInvalidFields.value = result.invalidFields || []
    }

    if (lv.simType === 'terminal' || lv.simType === 'redis') {
      if (result.isPass) {
        simRef.value?.markSuccess?.()
        handlePass(data)
      } else {
        simRef.value?.markError?.()
        handleFail(data, result)
      }
      return
    }

    if (lv.simType === 'sqlclient') {
      if (result.isPass) {
        handlePass(data)
      } else {
        handleFail(data, result)
      }
      return
    }

    if (lv.simType === 'chat') {
      const prior = [...chatPriorMessages.value]
      if (prior.length) {
        showFeedback.value = false
        feedbackMessage.value = ''
      }
      const chatResult = validateSimulation(lv, { message: data.message, chatPriorMessages: prior })
      const combined = combineChatMessages(prior, data.message)

      if (chatResult.isPass) {
        const history = storyContext.value.chatHistory || []
        const messages = getChatSuccessThread(lv, history, {
          chatReply: storyContext.value.chatReply,
          chatManagerReply: storyContext.value.chatManagerReply,
        })
        simRef.value?.markSuccess?.({ messages })
        handlePass({ ...data, message: combined, chatPriorMessages: prior })
        chatPriorMessages.value = []
        return
      }

      if (shouldOfferChatFollowUp(lv, prior)) {
        chatPriorMessages.value.push(data.message)
        const combined = combineChatMessages(prior, data.message)
        const history = storyContext.value.chatHistory || []
        const thread = getChatFollowUpThread(lv, combined, history)
        simRef.value?.markFollowUp?.({
          messages: thread.messages,
          placeholder: thread.placeholder,
          hint: thread.hint,
        })
        showFeedback.value = true
        feedbackMessage.value = getChatFollowUpNotice(lv, history)
        failureHint.value = ''
        return
      }

      simRef.value?.markError?.()
      handleFail(data, chatResult)
      return
    }

    if (result.isPass) {
      if (lv.simType === 'jira') {
        sessionJiraTier.value = result.jiraTier || null
      }
      handlePass(data)
      return
    }

    handleFail(data, result)
  }

  return {
    showFeedback,
    feedbackMessage,
    failureHint,
    showDebrief,
    isSubmitting,
    jiraInvalidFields,
    jiraPreview,
    xpBeforeLevel,
    rankBeforeLevel,
    levelReward,
    newAchievements,
    passDebriefNote,
    sessionJiraTier,
    phaseMilestone,
    passSimEpilogue,
    submitFlash,
    resetSubmitState,
    handleSimSubmit,
  }
}
