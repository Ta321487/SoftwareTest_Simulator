<script setup>
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLevelById, isDailyQuestId, isSideQuestId, levels } from '../utils/levelRegistry'
import { getProjectForLevel, getProjectDay, getDockShortLabel } from '../data/projects'
import { getPhaseForLevel, getPhaseStep } from '../data/phases'
import { getRankForXp } from '../data/ranks'
import { getStoryContext } from '../data/storyContext'
import { getDebrief } from '../data/debriefs'
import { getReferenceAnswer } from '../data/referenceAnswers'
import { getAchievementById } from '../data/achievements'
import { useProgressStore } from '../stores/progressStore'
import { useProjectStore } from '../stores/projectStore'
import { validateSimulation } from '../utils/validator'
import { getValidationCriteria } from '../utils/validationCriteria'
import { getSimGuide } from '../utils/simGuides'
import { getFailureHint, getLevelHint } from '../utils/failureHints'
import { getLevelXpPreview } from '../utils/levelXp'
import { getLevelDeliverable } from '../data/levelDeliverables'
import { getPhaseMilestoneForLevel } from '../data/phaseMilestones'
import { useMobileLayout } from '../composables/useMobileLayout'
import {
  buildSutRoute,
  buildMainLevelRoute,
  getSutEntriesForLevel,
  isSutModeRoute,
  getSutDockQuery,
  resolveSutEntry,
  getImmersionStepsProgress,
  setImmersionStepProgress,
  initPassiveSutStep,
  syncDbConnectedStep,
  getImmersionEntries,
} from '../utils/sutImmersion'
import {
  shouldRecordMistake,
  computeArtifactQuality,
  getPassDebriefNote,
} from '../data/consequences'
import { getHandbookLinksForLevel } from '../utils/handbookLinks'
import DebriefPanel from '../components/DebriefPanel.vue'
import PreviousSubmission from '../components/PreviousSubmission.vue'
import WorkbenchShell from '../components/workbench/WorkbenchShell.vue'
import ProjectContextPanel from '../components/workbench/ProjectContextPanel.vue'
import {
  simComponentMap,
  LoginAppMock,
  PaymentAppMock,
  OrderObsPanel,
  OnCallPanel,
} from '../components/simulators/loadSimulators.js'
import {
  LOGIN_SUT_DOCK_ID,
  LOGIN_MODULE_ID,
  getLoginBuildVersion,
  shouldShowLoginAppDock,
  getLoginSutLead,
  isLoginModuleProject,
} from '../utils/loginSut'
import {
  PAYMENT_SUT_DOCK_ID,
  PAYMENT_MODULE_ID,
  getPaymentScenario,
  shouldShowPaymentAppDock,
  getPaymentSutLead,
  isPaymentModuleProject,
} from '../utils/paymentSut'
import {
  ORDER_OBS_DOCK_ID,
  ORDER_MODULE_ID,
  getOrderObsMode,
  shouldShowOrderObsDock,
  getOrderObsLead,
  isOrderModuleProject,
} from '../utils/orderSut'
import {
  ONCALL_DOCK_ID,
  ONBOARD_WEEK2_ID,
  getOnCallMode,
  shouldShowOnCallDock,
  getOnCallLead,
  isOnboardWeek2Project,
  DEFAULT_PROD_LOGS,
} from '../utils/onboardSut'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()
const projectStore = useProjectStore()
const { isMobile } = useMobileLayout()

const showFeedback = ref(false)
const feedbackMessage = ref('')
const failureHint = ref('')
const showHint = ref(false)
const hintText = ref('')
const showDebrief = ref(false)
const isSubmitting = ref(false)
const jiraInvalidFields = ref([])
const jiraPreview = ref(null)
const simRef = ref(null)
const simSessionKey = ref(0)
const freshRetrySession = ref(false)
const activeDockLevelId = ref(1)
const xpBeforeLevel = ref(0)
const rankBeforeLevel = ref(null)
const levelReward = ref({ stars: 1, bonusXp: 0, sessionStars: 0, improved: false })
const newAchievements = ref([])
const sessionAttempts = ref(0)
const sessionHintUsed = ref(false)
const passDebriefNote = ref(null)
const sessionJiraTier = ref(null)
const phaseMilestone = ref(null)
const passSimEpilogue = ref(null)
const sutToast = ref('')
const submitFlash = ref('')
const taskReturnFlash = ref('')
const taskFocusPulse = ref(false)
let taskReturnTimer = null
let taskPulseTimer = null

const levelId = computed(() => Number(route.params.id))
const level = computed(() => getLevelById(levelId.value))
const isSutMode = computed(() => isSutModeRoute(route))
const sutDockQuery = computed(() => getSutDockQuery(route))
const isExtraLevel = computed(
  () => level.value && (isSideQuestId(levelId.value) || isDailyQuestId(levelId.value))
)
const project = computed(() =>
  level.value && !isExtraLevel.value ? getProjectForLevel(level.value.id) : null
)
const sutEntry = computed(() => {
  if (!isSutMode.value || !project.value) return null
  return resolveSutEntry(route, project.value.id)
})
const deliverable = computed(() =>
  level.value && !isExtraLevel.value ? getLevelDeliverable(level.value.id) : null
)
const sutEntriesOnLevel = computed(() =>
  project.value ? getSutEntriesForLevel(levelId.value, project.value.id) : []
)
const phase = computed(() =>
  level.value && !isExtraLevel.value ? getPhaseForLevel(level.value.id) : null
)
const phaseStep = computed(() =>
  phase.value && level.value ? getPhaseStep(phase.value, level.value.id) : null
)
const projectDay = computed(() =>
  project.value && level.value ? getProjectDay(project.value, level.value.id) : null
)

const storyContext = computed(() =>
  level.value
    ? getStoryContext(level.value.id, projectStore, progressStore)
    : { inbox: [], envStatus: [] }
)

const referenceAnswer = computed(() => (level.value ? getReferenceAnswer(level.value.id) : null))

const previousSubmission = computed(() =>
  level.value ? progressStore.getSubmission(level.value.id) : null
)

const submissionInitialValues = computed(() => {
  if (freshRetrySession.value) return null
  const sub = previousSubmission.value
  if (!sub?.data) return null
  if (sub.simType === 'template' || sub.simType === 'apiclient') {
    return sub.data.values || null
  }
  return null
})

const submissionInitialSelected = computed(() => {
  if (freshRetrySession.value) return null
  const sub = previousSubmission.value
  if (!sub?.data?.selected) return null
  if (sub.simType === 'checklist' || sub.simType === 'apiclient') {
    return sub.data.selected
  }
  return null
})

const existingStars = computed(() => progressStore.getLevelMeta(levelId.value)?.stars || 0)

const xpPreview = computed(() =>
  level.value ? getLevelXpPreview(level.value.xpReward, existingStars.value) : null
)

const nextLevelAfterPass = computed(() => {
  const id = progressStore.firstAvailableLevelId
  if (!id) return null
  const next = getLevelById(id)
  return next ? { id: next.id, title: next.title } : null
})

const levelStatus = computed(() =>
  level.value ? progressStore.getStatus(level.value.id) : 'locked'
)

const simGuide = computed(() => (level.value ? getSimGuide(level.value.simType) : null))
const validationCriteria = computed(() => (level.value ? getValidationCriteria(level.value) : ''))
const debrief = computed(() =>
  level.value ? getDebrief(level.value.id, level.value.dailyKey) : null
)

const handbookLinks = computed(() =>
  level.value && debrief.value ? getHandbookLinksForLevel(level.value.id) : null
)

const simComponent = computed(() => (level.value ? simComponentMap[level.value.simType] : null))

const MOBILE_HEAVY_SIMS = new Set(['terminal', 'apiclient', 'packet'])
const showMobileSimHint = computed(() => level.value && MOBILE_HEAVY_SIMS.has(level.value.simType))

const isTaskView = computed(
  () => level.value && !isSutMode.value && activeDockLevelId.value === level.value.id
)

const sutSteps = computed(() => {
  if (!sutEntry.value || !project.value) return []
  return getImmersionStepsProgress(sutEntry.value, projectStore, project.value.id)
})

function sutContext() {
  return { entry: sutEntry.value, projectId: project.value?.id }
}

function advanceSutSteps(completedSteps) {
  const { entry, projectId } = sutContext()
  if (!entry || !projectId) return
  setImmersionStepProgress(entry, projectStore, projectId, completedSteps)
}

function finishSutImmersion() {
  const { entry, projectId } = sutContext()
  if (!entry || !projectId) return
  setImmersionStepProgress(entry, projectStore, projectId, entry.steps.length)
}

function setupSutSession() {
  if (!isSutMode.value || !sutEntry.value || !project.value) return
  initPassiveSutStep(sutEntry.value, projectStore, project.value.id)
  syncDbConnectedStep(sutEntry.value, projectStore, project.value.id, progressStore)
}

function handleDockChange(id) {
  const item = dockItems.value.find((d) => d.levelId === id)
  if (item?.isSutEntry && item.sutDock) {
    router.push(buildSutRoute(levelId.value, item.sutDock))
    return
  }
  const wasArchive = level.value && activeDockLevelId.value !== level.value.id
  const returningToTask = level.value && id === level.value.id && wasArchive
  activeDockLevelId.value = id
  nextTick(() => {
    scrollLevelMain()
    if (returningToTask) {
      showTaskReturnFeedback()
    }
  })
}

function scrollLevelMain(behavior = 'smooth') {
  document.querySelector('.workbench--level .workbench__main')?.scrollTo({ top: 0, behavior })
}

function showTaskReturnFeedback() {
  const dayLabel = projectDay.value?.label || `第 ${level.value?.id} 关`
  const toolLabel = simGuide.value?.label || '答题区'
  taskReturnFlash.value = `已回到今日任务 · ${dayLabel} · ${toolLabel}`
  taskFocusPulse.value = true
  if (taskReturnTimer) clearTimeout(taskReturnTimer)
  if (taskPulseTimer) clearTimeout(taskPulseTimer)
  taskReturnTimer = setTimeout(() => {
    taskReturnFlash.value = ''
    taskReturnTimer = null
  }, 2800)
  taskPulseTimer = setTimeout(() => {
    taskFocusPulse.value = false
    taskPulseTimer = null
  }, 1200)
}

function goToMainTask() {
  router.push(buildMainLevelRoute(levelId.value))
}

function openSutEntry(entry) {
  router.push(buildSutRoute(entry.levelId, entry.dock))
}

function showSutCompleteToast(message) {
  sutToast.value = message
  setTimeout(() => {
    sutToast.value = ''
  }, 4000)
}

const loginBuild = computed(() => (level.value ? getLoginBuildVersion(level.value.id) : 'buggy'))

const loginSutState = computed(() => projectStore.getLoginSut(LOGIN_MODULE_ID))

const showInlineLoginSut = computed(
  () =>
    isSutMode.value &&
    sutDockQuery.value === 'app' &&
    isLoginModuleProject(project.value) &&
    level.value &&
    shouldShowLoginAppDock(level.value.id)
)

const loginSutLead = computed(() => (level.value ? getLoginSutLead(level.value.id) : ''))

const paymentScenario = computed(() =>
  level.value ? getPaymentScenario(level.value.id, projectStore, progressStore) : 'no-db'
)

const paymentSutState = computed(() => projectStore.getPaymentSut(PAYMENT_MODULE_ID))

const showInlinePaymentSut = computed(
  () =>
    isSutMode.value &&
    sutDockQuery.value === 'pay' &&
    isPaymentModuleProject(project.value) &&
    level.value &&
    shouldShowPaymentAppDock(level.value.id)
)

const paymentSutLead = computed(() => (level.value ? getPaymentSutLead(level.value.id) : ''))

const orderObsMode = computed(() => (level.value ? getOrderObsMode(level.value.id) : 'overview'))

const orderSutState = computed(() => projectStore.getOrderSut(ORDER_MODULE_ID))

const showInlineOrderObs = computed(
  () =>
    isSutMode.value &&
    sutDockQuery.value === 'obs' &&
    isOrderModuleProject(project.value) &&
    level.value &&
    shouldShowOrderObsDock(level.value.id)
)

const orderObsLead = computed(() => (level.value ? getOrderObsLead(level.value.id) : ''))

const onCallMode = computed(() => (level.value ? getOnCallMode(level.value.id) : 'release-board'))

const onboardSutState = computed(() => projectStore.getOnboardSut(ONBOARD_WEEK2_ID))

const onCallLogLines = computed(() =>
  level.value?.storyLogs?.length ? level.value.storyLogs : DEFAULT_PROD_LOGS
)

const showInlineOnCall = computed(
  () =>
    isSutMode.value &&
    sutDockQuery.value === 'oncall' &&
    isOnboardWeek2Project(project.value) &&
    level.value &&
    shouldShowOnCallDock(level.value.id)
)

const onCallLead = computed(() => (level.value ? getOnCallLead(level.value.id) : ''))

const dockItems = computed(() => {
  if (!level.value) return []
  if (!project.value) {
    return [
      {
        levelId: level.value.id,
        simType: level.value.simType,
        shortLabel: getDockShortLabel(level.value.simType, level.value.id),
        dayLabel: '',
        locked: false,
        hasArtifact: false,
      },
    ]
  }
  const items = project.value.days.map((day) => {
    const srcLevel = levels.find((lv) => lv.id === day.levelId)
    return {
      levelId: day.levelId,
      simType: srcLevel.simType,
      shortLabel: getDockShortLabel(srcLevel.simType, day.levelId),
      dayLabel: day.label,
      locked: day.levelId > level.value.id,
      lockReason: lockedLabel(day.levelId, srcLevel.projectDay),
      hasArtifact: projectStore.hasArtifact(project.value.id, day.levelId),
    }
  })

  if (isLoginModuleProject(project.value) && shouldShowLoginAppDock(level.value.id)) {
    items.push({
      levelId: LOGIN_SUT_DOCK_ID,
      simType: 'loginapp',
      shortLabel: 'App',
      dayLabel: '实操',
      locked: false,
      lockReason: '',
      isSutEntry: true,
      sutDock: 'app',
      hasArtifact: Boolean(loginSutState.value.reproducedBug || loginSutState.value.verifiedFix),
    })
  }

  if (isPaymentModuleProject(project.value) && shouldShowPaymentAppDock(level.value.id)) {
    items.push({
      levelId: PAYMENT_SUT_DOCK_ID,
      simType: 'paymentapp',
      shortLabel: '支付',
      dayLabel: '实操',
      locked: false,
      lockReason: '',
      isSutEntry: true,
      sutDock: 'pay',
      hasArtifact: Boolean(
        paymentSutState.value.callbackMiss ||
        paymentSutState.value.payErrorReproduced ||
        paymentSutState.value.payVerified ||
        paymentSutState.value.dbConnected
      ),
    })
  }

  if (isOrderModuleProject(project.value) && shouldShowOrderObsDock(level.value.id)) {
    items.push({
      levelId: ORDER_OBS_DOCK_ID,
      simType: 'orderobs',
      shortLabel: '监控',
      dayLabel: '实操',
      locked: false,
      lockReason: '',
      isSutEntry: true,
      sutDock: 'obs',
      hasArtifact: Boolean(orderSutState.value.bottleneckIdentified),
    })
  }

  if (isOnboardWeek2Project(project.value) && shouldShowOnCallDock(level.value.id)) {
    items.push({
      levelId: ONCALL_DOCK_ID,
      simType: 'oncall',
      shortLabel: '值班',
      dayLabel: '实操',
      locked: false,
      lockReason: '',
      isSutEntry: true,
      sutDock: 'oncall',
      hasArtifact: Boolean(
        onboardSutState.value.prodSlowReproduced || onboardSutState.value.logReviewed
      ),
    })
  }

  return items
})

function lockedLabel(levelId, projectDay) {
  return `完成本阶段第 ${projectDay} 关后解锁`
}

function getLinkedJiraIssue(projectId) {
  if (!projectId) return null
  const jiraLevel = levels.find((l) => l.projectId === projectId && l.simType === 'jira')
  if (jiraLevel && projectStore.hasArtifact(projectId, jiraLevel.id)) {
    return `TEST-${1000 + jiraLevel.id}`
  }
  return null
}

const simProps = computed(() => {
  if (!level.value) return {}
  const lv = level.value
  const ctx = storyContext.value

  switch (lv.simType) {
    case 'jira':
      return {
        jiraFields: lv.jiraFields,
        externalInvalidFields: jiraInvalidFields.value,
        preview: jiraPreview.value,
        levelId: lv.id,
        jiraRules: lv.jiraRules,
        projectName: project.value?.name || '通用',
        jiraMode: ctx.jiraMode,
        jiraDraft: ctx.jiraDraft,
        jiraBacklog: ctx.jiraBacklog,
      }
    case 'terminal':
      return {
        terminalHint: lv.terminalHint,
        terminalSuccessMsg: lv.terminalSuccessMsg,
        logPath: lv.logPath || '/var/log/app/error.log',
        storyLogs: lv.storyLogs,
        correctCommand: lv.correctCommand,
        fileContent: lv.fileContent,
        findResults: lv.findResults,
        lsListing: lv.lsListing,
        curlResponse: lv.curlResponse,
      }
    case 'chat':
      return {
        chatContext: lv.chatContext,
        chatGroup: lv.chatGroup,
        chatHistory: ctx.chatHistory,
        composeHint: lv.chatHint,
        placeholder: lv.chatPlaceholder,
        chatPreviewConfig:
          lv.chatStructure || lv.chatKeywords?.length
            ? {
                chatStructure: lv.chatStructure,
                chatKeywords: lv.chatKeywords,
                chatMinLength: lv.chatMinLength,
                chatMinKeywords: lv.chatMinKeywords,
              }
            : null,
      }
    case 'config':
      return {
        configContent: lv.configContent,
        configKey: lv.configKey || 'DB_HOST',
        defaultValue: '127.0.0.1',
        correctValue: lv.correctValue,
      }
    case 'report':
      return {
        reportItems: lv.reportItems,
        storyRef: lv.storyRef,
        linkedIssueFromStore: getLinkedJiraIssue(lv.projectId),
        projectLabel: project.value ? `${project.value.name}回归流水线 #428` : '',
      }
    case 'checklist':
      return { checklistItems: lv.checklistItems, prdContent: ctx.prdContent }
    case 'clickcard':
      return {
        clickOptions: lv.clickOptions,
        clickVariant: ctx.clickVariant || lv.clickVariant,
      }
    case 'template':
      return {
        templateFields: lv.templateFields,
        requirement: lv.requirement,
        fillHint: lv.fillHint,
        templateMinLength: lv.templateMinLength || 0,
        initialValues: submissionInitialValues.value,
      }
    case 'apiclient':
      return {
        apiMethod: lv.apiMethod || 'POST',
        apiUrl: lv.apiUrl || '/api/login',
        apiRequestBody: lv.apiRequestBody || '{}',
        templateFields: lv.templateFields || [],
        checklistItems: lv.checklistItems || [],
        requirement: lv.requirement,
        fillHint: lv.fillHint,
        templateMinLength: lv.templateMinLength || 0,
        initialValues: submissionInitialValues.value,
        initialSelected: submissionInitialSelected.value,
      }
    case 'calculator':
      return {
        calculatorFields: lv.calculatorFields,
        calculatorFormula: lv.calculatorFormula || 'schedule',
        calculatorReadonly: lv.calculatorReadonly !== false,
      }
    case 'packet':
      return {
        packetRequests: lv.packetRequests,
      }
    default:
      return {}
  }
})

function resetState() {
  showFeedback.value = false
  feedbackMessage.value = ''
  failureHint.value = ''
  showHint.value = false
  hintText.value = ''
  showDebrief.value = false
  isSubmitting.value = false
  jiraInvalidFields.value = []
  jiraPreview.value = null
  levelReward.value = { stars: 1, bonusXp: 0, sessionStars: 0, improved: false }
  newAchievements.value = []
  sessionAttempts.value = 0
  sessionHintUsed.value = false
  passDebriefNote.value = null
  sessionJiraTier.value = null
  passSimEpilogue.value = null
  simRef.value?.reset?.()
}

function getChatEpilogue() {
  const ctx = storyContext.value
  if (!ctx.chatReply) return null
  const history = ctx.chatHistory || []
  const lastOther = [...history].reverse().find((m) => m.role === 'other') || history[0]
  return {
    sender: lastOther?.sender || '对方',
    text: ctx.chatReply,
  }
}

function buildSimEpilogue(simType, submitData) {
  const lv = level.value
  if (!lv) return null

  switch (simType) {
    case 'chat': {
      const epilogue = getChatEpilogue()
      if (!epilogue) return null
      return { kind: 'quote', label: `${epilogue.sender} · 回应`, text: epilogue.text }
    }
    case 'terminal':
      return {
        kind: 'quote',
        label: '命令结果',
        text: lv.terminalSuccessMsg || '日志已加载，发现多条 ERROR，建议结合业务现象继续排查。',
      }
    case 'jira': {
      const values = submitData?.values
      if (!values) return null
      const fields = lv.jiraFields || {}
      const items = Object.entries(fields).map(([key, config]) => ({
        title: config.label,
        text: values[key] || '—',
      }))
      return {
        kind: 'list',
        label: '工单已提交',
        badge: `TEST-${1000 + lv.id}`,
        items,
      }
    }
    case 'config': {
      const value = submitData?.value
      if (value == null || value === '') return null
      const key = lv.configKey || 'DB_HOST'
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

function getDebriefDelay(simType) {
  switch (simType) {
    case 'jira':
      return 1400
    case 'chat':
      return 1800
    case 'terminal':
      return 1400
    case 'config':
      return 1200
    default:
      return 700
  }
}

function revealHint() {
  if (!level.value) return
  const text = getLevelHint(level.value)
  if (!text) return
  sessionHintUsed.value = true
  hintText.value = text
  showHint.value = true
}

watch(
  () => [levelId.value, route.name, route.params.dock, route.query.mode, route.query.dock],
  () => {
    const currentLevel = level.value
    if (!currentLevel) {
      router.replace('/')
      return
    }
    if (progressStore.getStatus(currentLevel.id) === 'locked') {
      router.replace('/')
      return
    }

    // 旧链接 ?mode=sut → 新路径 /level/:id/sut/:dock
    if (route.name === 'LevelDetail' && route.query.mode === 'sut') {
      const legacyDock = getSutDockQuery(route) || 'app'
      router.replace(buildSutRoute(currentLevel.id, legacyDock))
      return
    }

    if (isSutMode.value) {
      if (!project.value) {
        router.replace(buildMainLevelRoute(currentLevel.id))
        return
      }
      const dock = getSutDockQuery(route)
      const entry = resolveSutEntry(route, project.value.id)
      if (!dock && entry) {
        router.replace(buildSutRoute(currentLevel.id, entry.dock))
        return
      }
      if (dock && !entry) {
        router.replace(buildMainLevelRoute(currentLevel.id))
        return
      }
    } else {
      activeDockLevelId.value = currentLevel.id
    }

    freshRetrySession.value = false
    resetState()
    setupSutSession()
  },
  { immediate: true }
)

watch(
  () => [
    paymentSutState.value.dbConnected,
    progressStore.completedLevelIds.includes(6),
    sutEntry.value?.key,
    isSutMode.value,
  ],
  () => {
    if (isSutMode.value && sutEntry.value?.key === 'dbConnected' && project.value) {
      syncDbConnectedStep(sutEntry.value, projectStore, project.value.id, progressStore)
    }
  }
)

function onLoginSmsRequested() {
  const { entry } = sutContext()
  if (!entry) return
  if (entry.key === 'reproducedBug') advanceSutSteps(2)
  if (entry.key === 'verifiedFix') advanceSutSteps(1)
}

function onLoginBugReproduced() {
  finishSutImmersion()
  projectStore.patchLoginSut(LOGIN_MODULE_ID, { reproducedBug: true })
  progressStore.recordLoginBugReproduced()
  showSutCompleteToast('✓ App 复现 Bug 完成 · 可返回主线写 Jira')
}

function onLoginFixVerified() {
  finishSutImmersion()
  projectStore.patchLoginSut(LOGIN_MODULE_ID, { verifiedFix: true })
  progressStore.recordLoginFixVerified()
  showSutCompleteToast('✓ 修复已验证 · 可返回主线勾选回归')
}

function onPaymentDbConnected() {
  const { entry } = sutContext()
  if (entry?.key === 'dbConnected') advanceSutSteps(1)
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { dbConnected: true })
  showSutCompleteToast('✓ 沙箱已连通 · 可返回主线继续配置任务')
}

function onPaymentPayAttempt() {
  const { entry } = sutContext()
  if (entry?.key === 'payErrorReproduced') advanceSutSteps(1)
  if (entry?.key === 'callbackMiss') advanceSutSteps(1)
}

function onPaymentPaySuccess() {
  const { entry } = sutContext()
  if (entry?.key === 'dbConnected') {
    finishSutImmersion()
    projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { dbConnected: true })
    showSutCompleteToast('✓ 沙箱连通已验证 · 可返回主线继续')
    return
  }
  if (entry?.key === 'callbackMiss') advanceSutSteps(1)
}

function onPaymentCallbackMiss() {
  finishSutImmersion()
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { callbackMiss: true })
  progressStore.recordPaymentCallbackMiss()
  showSutCompleteToast('✓ 回调缺失已复现 · 可返回主线写企微回复')
}

function onPaymentErrorReproduced() {
  finishSutImmersion()
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { payErrorReproduced: true })
  progressStore.recordPaymentErrorReproduced()
  showSutCompleteToast('✓ 支付失败已复现 · 可返回主线补 Bug 单')
}

function onPaymentVerified() {
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { payVerified: true })
  progressStore.recordPaymentVerified()
}

function onOrderBottleneckIdentified() {
  finishSutImmersion()
  projectStore.patchOrderSut(ORDER_MODULE_ID, { bottleneckIdentified: true })
  progressStore.recordOrderBottleneckIdentified()
  showSutCompleteToast('✓ 瓶颈已定位 · 可返回主线提交选择')
}

function onProdLoginStarted() {
  const { entry } = sutContext()
  if (entry?.key === 'prodSlowReproduced') advanceSutSteps(2)
}

function onProdSlowReproduced() {
  finishSutImmersion()
  projectStore.patchOnboardSut(ONBOARD_WEEK2_ID, { prodSlowReproduced: true })
  progressStore.recordProdSlowReproduced()
  showSutCompleteToast('✓ 慢登录已复现 · 可返回主线写 Bug 单')
}

function onLogReviewed() {
  finishSutImmersion()
  projectStore.patchOnboardSut(ONBOARD_WEEK2_ID, { logReviewed: true })
  progressStore.recordLogReviewed()
  showSutCompleteToast('✓ 日志已核对 · 可返回主线 grep 终端')
}

const paymentConfigArtifact = computed(() => projectStore.getArtifact(PAYMENT_MODULE_ID, 6))

const showDbConnectedMainLink = computed(
  () =>
    isSutMode.value &&
    sutEntry.value?.key === 'dbConnected' &&
    !paymentSutState.value.dbConnected &&
    !progressStore.completedLevelIds.includes(6)
)

function saveStoryArtifact(submitData) {
  if (!level.value?.projectId) return
  const mistakesOnLevel = progressStore.getLevelMistakes(level.value.id)
  const quality = computeArtifactQuality(
    sessionAttempts.value,
    sessionHintUsed.value,
    mistakesOnLevel,
    sessionJiraTier.value
  )
  projectStore.saveArtifact(level.value.projectId, level.value.id, {
    ...submitData,
    _meta: {
      quality,
      mistakes: mistakesOnLevel,
      attempts: sessionAttempts.value,
      hintsUsed: sessionHintUsed.value,
      jiraTier: sessionJiraTier.value,
    },
  })

  if (level.value.id === 6 && level.value.projectId === PAYMENT_MODULE_ID) {
    projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { dbConnected: true })
    const dbEntry = getImmersionEntries(PAYMENT_MODULE_ID).find((e) => e.key === 'dbConnected')
    if (dbEntry) {
      syncDbConnectedStep(dbEntry, projectStore, PAYMENT_MODULE_ID, progressStore)
    }
  }
}

const rankUp = computed(() => {
  if (!showDebrief.value || rankBeforeLevel.value == null) return null
  const after = getRankForXp(progressStore.totalXp)
  if (after.minXp > rankBeforeLevel.value.minXp) return after
  return null
})

function handlePass(submitData) {
  if (!level.value) return
  xpBeforeLevel.value = progressStore.totalXp
  rankBeforeLevel.value = getRankForXp(progressStore.totalXp)
  saveStoryArtifact(submitData)
  progressStore.saveSubmission(level.value.id, level.value.simType, submitData)

  const prevAchievements = [...progressStore.achievements]
  levelReward.value = progressStore.completeLevel(level.value.id, level.value.xpReward, {
    attempts: sessionAttempts.value,
    hintsUsed: isDailyQuestId(level.value.id) ? false : sessionHintUsed.value,
    jiraTier: sessionJiraTier.value,
  })
  newAchievements.value = progressStore.achievements
    .filter((id) => !prevAchievements.includes(id))
    .map((id) => getAchievementById(id))
    .filter(Boolean)

  if (level.value.simType === 'jira' && submitData?.values) {
    jiraPreview.value = { ...submitData.values }
  }

  passDebriefNote.value = getPassDebriefNote(level.value.id, progressStore, projectStore)
  phaseMilestone.value = getPhaseMilestoneForLevel(level.value.id)

  showFeedback.value = false
  feedbackMessage.value = ''
  failureHint.value = ''
  isSubmitting.value = true
  submitFlash.value = `✓ 通过 +${level.value.xpReward} XP`
  passSimEpilogue.value = buildSimEpilogue(level.value.simType, submitData)

  const debriefDelay = getDebriefDelay(level.value.simType)
  setTimeout(() => {
    submitFlash.value = ''
    showDebrief.value = true
  }, debriefDelay)
}

function handleFail(data, result) {
  showFeedback.value = true
  feedbackMessage.value = result.message
  failureHint.value = getFailureHint(level.value, data, result)

  if (level.value && shouldRecordMistake(level.value.simType)) {
    progressStore.recordMistake(level.value.id)
  }
}

function handleSimSubmit(data) {
  if (!level.value || isSubmitting.value || showDebrief.value) return

  sessionAttempts.value += 1
  progressStore.recordAttempt(level.value.id)
  const result = validateSimulation(level.value, data)

  if (level.value.simType === 'jira') {
    jiraInvalidFields.value = result.invalidFields || []
  }

  if (level.value.simType === 'terminal') {
    if (result.isPass) {
      simRef.value?.markSuccess?.()
      handlePass(data)
    } else {
      simRef.value?.markError?.()
      handleFail(data, result)
    }
    return
  }

  if (level.value.simType === 'chat') {
    if (result.isPass) {
      simRef.value?.markSuccess?.(storyContext.value.chatReply)
      handlePass(data)
    } else {
      simRef.value?.markError?.()
      handleFail(data, result)
    }
    return
  }

  if (result.isPass) {
    if (level.value.simType === 'jira') {
      sessionJiraTier.value = result.jiraTier || null
    }
    handlePass(data)
    return
  }

  handleFail(data, result)
}

function closeDebrief() {
  router.push('/')
}

function goToNextLevel() {
  const id = progressStore.firstAvailableLevelId
  if (id) {
    router.push(`/level/${id}`)
  }
}

function retryFromDebrief() {
  freshRetrySession.value = true
  simSessionKey.value += 1
  resetState()
}

function openHandbookNote(levelId) {
  router.push({ path: '/handbook', query: { note: levelId } })
}

function openHandbookTerm(termId) {
  router.push({ path: '/handbook', query: { view: 'glossary', term: termId } })
}

function openHandbookPlaybook(playbookId) {
  router.push({ path: '/handbook', query: { view: 'playbooks', playbook: playbookId } })
}

function goBack() {
  if (isSutMode.value) {
    goToMainTask()
    return
  }
  router.push('/')
}

onUnmounted(() => {
  if (taskReturnTimer) clearTimeout(taskReturnTimer)
  if (taskPulseTimer) clearTimeout(taskPulseTimer)
})
</script>

<template>
  <WorkbenchShell
    v-if="level && simGuide"
    :level="level"
    :project="project"
    :phase="phase"
    :phase-step="phaseStep"
    :project-day="projectDay"
    :active-dock-level-id="activeDockLevelId"
    :dock-items="dockItems"
    :inbox-messages="storyContext.inbox"
    :env-status="storyContext.envStatus"
    :view-mode="isSutMode ? 'sut' : 'main'"
    :sut-label="sutEntry?.label || ''"
    level-page
    @dock-change="handleDockChange"
    @back="goBack"
  >
    <section v-if="!showDebrief && isSutMode" class="sut-mode">
      <div class="sut-mode__toolbar">
        <button type="button" class="sut-mode__back-main" @click="goToMainTask">
          ← 返回主线任务
        </button>
        <span v-if="sutEntry" class="sut-mode__goal">{{ sutEntry.label }}</span>
      </div>

      <ol v-if="sutSteps.length" class="sut-mode__steps">
        <li
          v-for="(step, idx) in sutSteps"
          :key="idx"
          class="sut-mode__step"
          :class="{
            'sut-mode__step--done': step.done,
            'sut-mode__step--active': step.active,
          }"
        >
          {{ step.done ? '✓' : step.active ? '→' : idx + 1 }}. {{ step.text }}
        </li>
      </ol>

      <div v-if="showDbConnectedMainLink" class="sut-mode__main-link">
        <p>沙箱连通需先在主线第 6 关修改配置并测试连接。</p>
        <button
          type="button"
          class="sim-btn sim-btn--ghost sim-btn--sm"
          @click="router.push(buildMainLevelRoute(6))"
        >
          前往主线第 6 关配置
        </button>
      </div>

      <p
        v-else-if="sutEntry?.key === 'dbConnected' && paymentConfigArtifact"
        class="sut-mode__config-hint"
      >
        主线已保存配置 · 支付 App 可验证连通
      </p>

      <p v-if="sutToast" class="sut-mode__toast">{{ sutToast }}</p>

      <div v-if="showInlineLoginSut" class="sut-mode__panel">
        <p class="login-sut-panel__lead">{{ loginSutLead || '在被测 App 中完成上述步骤。' }}</p>
        <LoginAppMock
          :build="loginBuild"
          :initial-reproduced="loginSutState.reproducedBug"
          :initial-fix-verified="loginSutState.verifiedFix"
          @sms-requested="onLoginSmsRequested"
          @bug-reproduced="onLoginBugReproduced"
          @fix-verified="onLoginFixVerified"
        />
      </div>

      <div v-else-if="showInlinePaymentSut" class="sut-mode__panel">
        <p class="login-sut-panel__lead">{{ paymentSutLead || '在支付 App 中完成上述步骤。' }}</p>
        <PaymentAppMock
          :scenario="paymentScenario"
          :initial-callback-miss="paymentSutState.callbackMiss"
          :initial-pay-error="paymentSutState.payErrorReproduced"
          :initial-pay-verified="paymentSutState.payVerified"
          @pay-attempt="onPaymentPayAttempt"
          @pay-success="onPaymentPaySuccess"
          @callback-miss="onPaymentCallbackMiss"
          @pay-error-reproduced="onPaymentErrorReproduced"
          @pay-verified="onPaymentVerified"
        />
      </div>

      <div v-else-if="showInlineOrderObs" class="sut-mode__panel">
        <p class="login-sut-panel__lead">{{ orderObsLead || '在 APM 面板中完成上述步骤。' }}</p>
        <OrderObsPanel
          :mode="orderObsMode"
          :initial-bottleneck="orderSutState.bottleneckIdentified"
          @bottleneck-identified="onOrderBottleneckIdentified"
        />
      </div>

      <div v-else-if="showInlineOnCall" class="sut-mode__panel">
        <p class="login-sut-panel__lead">{{ onCallLead || '在值班面板中完成上述步骤。' }}</p>
        <OnCallPanel
          :mode="onCallMode"
          :log-lines="onCallLogLines"
          :initial-prod-slow="onboardSutState.prodSlowReproduced"
          :initial-log-reviewed="onboardSutState.logReviewed"
          @prod-login-started="onProdLoginStarted"
          @prod-slow-reproduced="onProdSlowReproduced"
          @log-reviewed="onLogReviewed"
        />
      </div>
    </section>

    <ProjectContextPanel
      v-if="!showDebrief && !isSutMode && !isTaskView && project"
      :project="project"
      :source-level-id="activeDockLevelId"
      :current-level-id="level.id"
    />

    <p v-if="taskReturnFlash && isTaskView" class="workbench__task-return-flash">
      {{ taskReturnFlash }}
    </p>

    <details
      v-if="!showDebrief && isTaskView"
      class="task-panel-fold"
      :class="{ 'task-panel-fold--pulse': taskFocusPulse }"
      :open="isMobile ? undefined : true"
    >
      <summary class="task-panel-fold__summary">
        <span class="task-panel-fold__icon">📋</span>
        <span class="task-panel-fold__text">{{ level.content }}</span>
        <span v-if="xpPreview" class="task-panel-fold__xp">
          +{{ xpPreview.base }} XP
          <template v-if="xpPreview.canImprove"> · 冲星最多 +{{ xpPreview.maxTotal }}</template>
        </span>
      </summary>
      <section class="task-panel task-panel--compact">
        <p v-if="isExtraLevel" class="task-panel__extra-tag">
          {{ isDailyQuestId(levelId) ? '📅 每日特训' : '🎬 番外关卡' }}
        </p>
        <p v-if="deliverable" class="task-panel__deliverable">
          <span class="task-panel__deliverable-label">今日交付物</span>
          {{ deliverable }}
        </p>
        <div class="task-panel__action task-panel__action--full">
          <span class="task-panel__action-icon">📋</span>
          <p>{{ level.content }}</p>
        </div>
        <div v-if="sutEntriesOnLevel.length" class="task-panel__sut-links">
          <span class="task-panel__sut-label">可选上机实操（不影响通关）：</span>
          <button
            v-for="entry in sutEntriesOnLevel"
            :key="entry.key"
            type="button"
            class="task-panel__sut-link"
            @click="openSutEntry(entry)"
          >
            ▶ {{ entry.label }}
          </button>
        </div>
        <details class="task-panel__details">
          <summary>背景与判定标准</summary>
          <p class="task-panel__text">{{ level.description }}</p>
          <p class="task-panel__criteria-inline">{{ validationCriteria }}</p>
        </details>
      </section>
    </details>

    <section
      v-if="!showDebrief && isTaskView"
      class="workbench__sim-area"
      :class="{
        'workbench__sim-area--mobile-heavy': showMobileSimHint && isMobile,
        'workbench__sim-area--pulse': taskFocusPulse,
      }"
    >
      <p v-if="submitFlash" class="workbench__submit-flash">{{ submitFlash }}</p>
      <p v-if="showMobileSimHint" class="workbench__mobile-hint workbench__mobile-hint--heavy">
        💡 终端 / 接口 / 抓包关建议横屏或电脑浏览器；手机可先读任务，大屏实操更顺手。
      </p>
      <div class="sim-workspace__header">
        <span class="sim-workspace__tag">{{ simGuide.label }}</span>
        <span
          v-if="levelStatus === 'completed'"
          class="level-detail__badge level-detail__badge--completed"
        >
          {{ existingStars ? `★${existingStars} · 冲星重玩` : '已通关' }}
        </span>
        <button
          v-if="getLevelHint(level)"
          type="button"
          class="level-detail__hint-btn"
          @click="revealHint"
        >
          💡
          {{
            isDailyQuestId(levelId)
              ? sessionHintUsed
                ? '再看思路'
                : '思路提示'
              : levelStatus === 'completed'
                ? '冲星提示'
                : sessionHintUsed
                  ? '再看提示'
                  : '提示（影响星级）'
          }}
        </button>
      </div>

      <div v-if="showHint && hintText" class="level-detail__hint-box">
        <p>{{ hintText }}</p>
      </div>

      <PreviousSubmission
        v-if="previousSubmission && levelStatus === 'completed'"
        :sim-type="previousSubmission.simType"
        :data="previousSubmission.data"
        :saved-at="previousSubmission.savedAt"
      />

      <component
        :is="simComponent"
        v-if="simComponent"
        :key="`${levelId}-${simSessionKey}`"
        ref="simRef"
        v-bind="simProps"
        @submit="handleSimSubmit"
        @db-connected="onPaymentDbConnected"
      />
    </section>

    <footer v-if="feedbackMessage && !showDebrief && isTaskView" class="workbench__feedback">
      <p class="level-detail__feedback" :class="{ 'level-detail__feedback--error': showFeedback }">
        {{ feedbackMessage }}
      </p>
      <p v-if="failureHint && failureHint !== feedbackMessage" class="level-detail__failure-hint">
        {{ failureHint }}
      </p>
    </footer>

    <DebriefPanel
      v-if="showDebrief && debrief"
      :level-title="level.title"
      :xp-reward="level.xpReward"
      :bonus-xp="levelReward.bonusXp"
      :stars="levelReward.stars"
      :session-stars="levelReward.sessionStars"
      :improved="levelReward.improved"
      :debrief="debrief"
      :reference-answer="referenceAnswer"
      :new-achievements="newAchievements"
      :consequence-note="passDebriefNote"
      :jira-tier="sessionJiraTier"
      :tip-label="phase?.debriefTipLabel || '职场建议'"
      :rank-up="rankUp"
      :phase-milestone="phaseMilestone"
      :next-level="nextLevelAfterPass"
      :sim-epilogue="passSimEpilogue"
      :handbook-links="handbookLinks"
      :handbook-note-level-id="level?.id"
      @close="closeDebrief"
      @next="goToNextLevel"
      @retry="retryFromDebrief"
      @handbook="openHandbookNote"
      @handbook-term="openHandbookTerm"
      @handbook-playbook="openHandbookPlaybook"
    />
  </WorkbenchShell>
</template>
