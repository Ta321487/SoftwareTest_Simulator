<script setup>
import { computed, ref, watch } from 'vue'
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
import { shouldRecordMistake, computeArtifactQuality, getPassDebriefNote } from '../data/consequences'
import DebriefPanel from '../components/DebriefPanel.vue'
import PreviousSubmission from '../components/PreviousSubmission.vue'
import WorkbenchShell from '../components/workbench/WorkbenchShell.vue'
import ProjectContextPanel from '../components/workbench/ProjectContextPanel.vue'
import JiraForm from '../components/simulators/JiraForm.vue'
import Terminal from '../components/simulators/Terminal.vue'
import ChatBox from '../components/simulators/ChatBox.vue'
import ConfigEditor from '../components/simulators/ConfigEditor.vue'
import ReportChecker from '../components/simulators/ReportChecker.vue'
import Checklist from '../components/simulators/Checklist.vue'
import ClickCard from '../components/simulators/ClickCard.vue'
import TemplateFiller from '../components/simulators/TemplateFiller.vue'
import Calculator from '../components/simulators/Calculator.vue'
import ApiClient from '../components/simulators/ApiClient.vue'
import PacketCapture from '../components/simulators/PacketCapture.vue'
import LoginAppMock from '../components/simulators/LoginAppMock.vue'
import PaymentAppMock from '../components/simulators/PaymentAppMock.vue'
import OrderObsPanel from '../components/simulators/OrderObsPanel.vue'
import OnCallPanel from '../components/simulators/OnCallPanel.vue'
import {
  LOGIN_SUT_DOCK_ID,
  LOGIN_MODULE_ID,
  getLoginBuildVersion,
  shouldShowInlineLoginSut,
  shouldShowLoginAppDock,
  getLoginSutLead,
  isLoginModuleProject,
} from '../utils/loginSut'
import {
  PAYMENT_SUT_DOCK_ID,
  PAYMENT_MODULE_ID,
  getPaymentScenario,
  shouldShowInlinePaymentSut,
  shouldShowPaymentAppDock,
  getPaymentSutLead,
  isPaymentModuleProject,
} from '../utils/paymentSut'
import {
  ORDER_OBS_DOCK_ID,
  ORDER_MODULE_ID,
  getOrderObsMode,
  shouldShowInlineOrderObs,
  shouldShowOrderObsDock,
  getOrderObsLead,
  isOrderModuleProject,
} from '../utils/orderSut'
import {
  ONCALL_DOCK_ID,
  ONBOARD_WEEK2_ID,
  getOnCallMode,
  shouldShowInlineOnCall,
  shouldShowOnCallDock,
  getOnCallLead,
  isOnboardWeek2Project,
  DEFAULT_PROD_LOGS,
} from '../utils/onboardSut'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()
const projectStore = useProjectStore()

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
const activeDockLevelId = ref(1)
const xpBeforeLevel = ref(0)
const rankBeforeLevel = ref(null)
const levelReward = ref({ stars: 1, bonusXp: 0, sessionStars: 0, improved: false })
const newAchievements = ref([])
const sessionAttempts = ref(0)
const sessionHintUsed = ref(false)
const passDebriefNote = ref(null)
const sessionJiraTier = ref(null)

const levelId = computed(() => Number(route.params.id))
const level = computed(() => getLevelById(levelId.value))
const isExtraLevel = computed(
  () => level.value && (isSideQuestId(levelId.value) || isDailyQuestId(levelId.value))
)
const project = computed(() =>
  level.value && !isExtraLevel.value ? getProjectForLevel(level.value.id) : null
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

const referenceAnswer = computed(() =>
  level.value ? getReferenceAnswer(level.value.id) : null
)

const previousSubmission = computed(() =>
  level.value ? progressStore.getSubmission(level.value.id) : null
)

const submissionInitialValues = computed(() => {
  const sub = previousSubmission.value
  if (!sub?.data) return null
  if (sub.simType === 'template' || sub.simType === 'apiclient') {
    return sub.data.values || null
  }
  return null
})

const submissionInitialSelected = computed(() => {
  const sub = previousSubmission.value
  if (!sub?.data?.selected) return null
  if (sub.simType === 'checklist' || sub.simType === 'apiclient') {
    return sub.data.selected
  }
  return null
})

const existingStars = computed(() => progressStore.getLevelMeta(levelId.value)?.stars || 0)

const levelStatus = computed(() =>
  level.value ? progressStore.getStatus(level.value.id) : 'locked'
)

const simGuide = computed(() => (level.value ? getSimGuide(level.value.simType) : null))
const validationCriteria = computed(() =>
  level.value ? getValidationCriteria(level.value) : ''
)
const debrief = computed(() =>
  level.value ? getDebrief(level.value.id, level.value.dailyKey) : null
)

const simComponentMap = {
  jira: JiraForm,
  terminal: Terminal,
  chat: ChatBox,
  config: ConfigEditor,
  report: ReportChecker,
  checklist: Checklist,
  clickcard: ClickCard,
  template: TemplateFiller,
  calculator: Calculator,
  apiclient: ApiClient,
  packet: PacketCapture,
}

const simComponent = computed(() =>
  level.value ? simComponentMap[level.value.simType] : null
)

const isTaskView = computed(
  () => level.value && activeDockLevelId.value === level.value.id
)

const isLoginAppView = computed(
  () => activeDockLevelId.value === LOGIN_SUT_DOCK_ID && isLoginModuleProject(project.value)
)

const loginBuild = computed(() =>
  level.value ? getLoginBuildVersion(level.value.id) : 'buggy'
)

const loginSutState = computed(() => projectStore.getLoginSut(LOGIN_MODULE_ID))

const showInlineLoginSut = computed(
  () =>
    isLoginModuleProject(project.value) &&
    level.value &&
    shouldShowInlineLoginSut(level.value.id)
)

const loginSutLead = computed(() =>
  level.value ? getLoginSutLead(level.value.id) : ''
)

const isPaymentAppView = computed(
  () => activeDockLevelId.value === PAYMENT_SUT_DOCK_ID && isPaymentModuleProject(project.value)
)

const paymentScenario = computed(() =>
  level.value
    ? getPaymentScenario(level.value.id, projectStore, progressStore)
    : 'no-db'
)

const paymentSutState = computed(() => projectStore.getPaymentSut(PAYMENT_MODULE_ID))

const showInlinePaymentSut = computed(
  () =>
    isPaymentModuleProject(project.value) &&
    level.value &&
    shouldShowInlinePaymentSut(level.value.id)
)

const paymentSutLead = computed(() =>
  level.value ? getPaymentSutLead(level.value.id) : ''
)

const isOrderObsView = computed(
  () => activeDockLevelId.value === ORDER_OBS_DOCK_ID && isOrderModuleProject(project.value)
)

const orderObsMode = computed(() =>
  level.value ? getOrderObsMode(level.value.id) : 'overview'
)

const orderSutState = computed(() => projectStore.getOrderSut(ORDER_MODULE_ID))

const showInlineOrderObs = computed(
  () =>
    isOrderModuleProject(project.value) &&
    level.value &&
    shouldShowInlineOrderObs(level.value.id)
)

const orderObsLead = computed(() =>
  level.value ? getOrderObsLead(level.value.id) : ''
)

const isOnCallView = computed(
  () => activeDockLevelId.value === ONCALL_DOCK_ID && isOnboardWeek2Project(project.value)
)

const onCallMode = computed(() =>
  level.value ? getOnCallMode(level.value.id) : 'release-board'
)

const onboardSutState = computed(() => projectStore.getOnboardSut(ONBOARD_WEEK2_ID))

const onCallLogLines = computed(() =>
  level.value?.storyLogs?.length ? level.value.storyLogs : DEFAULT_PROD_LOGS
)

const showInlineOnCall = computed(
  () =>
    isOnboardWeek2Project(project.value) &&
    level.value &&
    shouldShowInlineOnCall(level.value.id)
)

const onCallLead = computed(() =>
  level.value ? getOnCallLead(level.value.id) : ''
)

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
      dayLabel: '被测',
      locked: false,
      lockReason: '',
      hasArtifact: Boolean(
        loginSutState.value.reproducedBug || loginSutState.value.verifiedFix
      ),
    })
  }

  if (isPaymentModuleProject(project.value) && shouldShowPaymentAppDock(level.value.id)) {
    items.push({
      levelId: PAYMENT_SUT_DOCK_ID,
      simType: 'paymentapp',
      shortLabel: '支付',
      dayLabel: '被测',
      locked: false,
      lockReason: '',
      hasArtifact: Boolean(
        paymentSutState.value.callbackMiss ||
          paymentSutState.value.payErrorReproduced ||
          paymentSutState.value.payVerified
      ),
    })
  }

  if (isOrderModuleProject(project.value) && shouldShowOrderObsDock(level.value.id)) {
    items.push({
      levelId: ORDER_OBS_DOCK_ID,
      simType: 'orderobs',
      shortLabel: '监控',
      dayLabel: '可观测',
      locked: false,
      lockReason: '',
      hasArtifact: Boolean(orderSutState.value.bottleneckIdentified),
    })
  }

  if (isOnboardWeek2Project(project.value) && shouldShowOnCallDock(level.value.id)) {
    items.push({
      levelId: ONCALL_DOCK_ID,
      simType: 'oncall',
      shortLabel: '值班',
      dayLabel: '线上',
      locked: false,
      lockReason: '',
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
        projectName: project.value?.name || '通用',
        jiraMode: ctx.jiraMode,
        jiraDraft: ctx.jiraDraft,
        jiraBacklog: ctx.jiraBacklog,
      }
    case 'terminal':
      return {
        terminalHint: lv.terminalHint,
        logPath: '/var/log/app/error.log',
        storyLogs: lv.storyLogs,
        correctCommand: lv.correctCommand,
      }
    case 'chat':
      return {
        chatContext: lv.chatContext,
        chatGroup: lv.chatGroup,
        chatHistory: ctx.chatHistory,
        composeHint: lv.chatHint,
        placeholder: lv.chatPlaceholder,
        chatPreviewConfig: lv.chatStructure || lv.chatKeywords?.length
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
  simRef.value?.reset?.()
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
  level,
  (currentLevel) => {
    if (!currentLevel) {
      router.replace('/')
      return
    }
    if (progressStore.getStatus(currentLevel.id) === 'locked') {
      router.replace('/')
      return
    }
    activeDockLevelId.value = currentLevel.id
    resetState()
  },
  { immediate: true }
)

function onLoginBugReproduced() {
  projectStore.patchLoginSut(LOGIN_MODULE_ID, { reproducedBug: true })
  progressStore.recordLoginBugReproduced()
}

function onLoginFixVerified() {
  projectStore.patchLoginSut(LOGIN_MODULE_ID, { verifiedFix: true })
  progressStore.recordLoginFixVerified()
}

function onPaymentDbConnected() {
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { dbConnected: true })
}

function onPaymentCallbackMiss() {
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { callbackMiss: true })
  progressStore.recordPaymentCallbackMiss()
}

function onPaymentErrorReproduced() {
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { payErrorReproduced: true })
  progressStore.recordPaymentErrorReproduced()
}

function onPaymentVerified() {
  projectStore.patchPaymentSut(PAYMENT_MODULE_ID, { payVerified: true })
  progressStore.recordPaymentVerified()
}

function onOrderBottleneckIdentified() {
  projectStore.patchOrderSut(ORDER_MODULE_ID, { bottleneckIdentified: true })
  progressStore.recordOrderBottleneckIdentified()
}

function onProdSlowReproduced() {
  projectStore.patchOnboardSut(ONBOARD_WEEK2_ID, { prodSlowReproduced: true })
  progressStore.recordProdSlowReproduced()
}

function onLogReviewed() {
  projectStore.patchOnboardSut(ONBOARD_WEEK2_ID, { logReviewed: true })
  progressStore.recordLogReviewed()
}

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
    hintsUsed: sessionHintUsed.value,
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

  showFeedback.value = false
  feedbackMessage.value = ''
  failureHint.value = ''
  isSubmitting.value = true

  if (level.value.simType === 'jira') {
    setTimeout(() => {
      showDebrief.value = true
    }, 800)
    return
  }

  showDebrief.value = true
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

function goBack() {
  router.push('/')
}
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
    @dock-change="activeDockLevelId = $event"
    @back="goBack"
  >
    <section v-if="!showDebrief && isTaskView" class="task-panel task-panel--compact">
      <p v-if="isExtraLevel" class="task-panel__extra-tag">
        {{ isDailyQuestId(levelId) ? '📅 每日特训' : '🎬 番外关卡' }}
      </p>
      <div class="task-panel__action">
        <span class="task-panel__action-icon">📋</span>
        <p>{{ level.content }}</p>
      </div>
      <details class="task-panel__details">
        <summary>背景与判定标准</summary>
        <p class="task-panel__text">{{ level.description }}</p>
        <p class="task-panel__criteria-inline">{{ validationCriteria }}</p>
      </details>
    </section>

    <section v-if="!showDebrief && isTaskView" class="workbench__sim-area">
      <div v-if="showInlineLoginSut" class="login-sut-panel">
        <p class="login-sut-panel__lead">{{ loginSutLead }}</p>
        <LoginAppMock
          :build="loginBuild"
          :initial-reproduced="loginSutState.reproducedBug"
          :initial-fix-verified="loginSutState.verifiedFix"
          @bug-reproduced="onLoginBugReproduced"
          @fix-verified="onLoginFixVerified"
        />
      </div>

      <div v-if="showInlinePaymentSut" class="login-sut-panel">
        <p class="login-sut-panel__lead">{{ paymentSutLead }}</p>
        <PaymentAppMock
          :scenario="paymentScenario"
          :initial-callback-miss="paymentSutState.callbackMiss"
          :initial-pay-error="paymentSutState.payErrorReproduced"
          :initial-pay-verified="paymentSutState.payVerified"
          @callback-miss="onPaymentCallbackMiss"
          @pay-error-reproduced="onPaymentErrorReproduced"
          @pay-verified="onPaymentVerified"
        />
      </div>

      <div v-if="showInlineOrderObs" class="login-sut-panel">
        <p class="login-sut-panel__lead">{{ orderObsLead }}</p>
        <OrderObsPanel
          :mode="orderObsMode"
          :initial-bottleneck="orderSutState.bottleneckIdentified"
          @bottleneck-identified="onOrderBottleneckIdentified"
        />
      </div>

      <div v-if="showInlineOnCall" class="login-sut-panel">
        <p class="login-sut-panel__lead">{{ onCallLead }}</p>
        <OnCallPanel
          :mode="onCallMode"
          :log-lines="onCallLogLines"
          :initial-prod-slow="onboardSutState.prodSlowReproduced"
          :initial-log-reviewed="onboardSutState.logReviewed"
          @prod-slow-reproduced="onProdSlowReproduced"
          @log-reviewed="onLogReviewed"
        />
      </div>

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
          💡 {{ levelStatus === 'completed' ? '冲星提示' : sessionHintUsed ? '再看提示' : '提示（影响星级）' }}
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
        ref="simRef"
        v-bind="simProps"
        @submit="handleSimSubmit"
        @db-connected="onPaymentDbConnected"
      />
    </section>

    <section v-if="!showDebrief && isLoginAppView" class="workbench__sim-area">
      <div class="sim-workspace__header">
        <span class="sim-workspace__tag">被测 App</span>
        <span class="level-detail__tool">登录模块 · 测试包</span>
      </div>
      <LoginAppMock
        :build="loginBuild"
        :initial-reproduced="loginSutState.reproducedBug"
        :initial-fix-verified="loginSutState.verifiedFix"
        @bug-reproduced="onLoginBugReproduced"
        @fix-verified="onLoginFixVerified"
      />
    </section>

    <section v-if="!showDebrief && isPaymentAppView" class="workbench__sim-area">
      <div class="sim-workspace__header">
        <span class="sim-workspace__tag">支付 App</span>
        <span class="level-detail__tool">支付模块 · 测试包</span>
      </div>
      <PaymentAppMock
        :scenario="paymentScenario"
        :initial-callback-miss="paymentSutState.callbackMiss"
        :initial-pay-error="paymentSutState.payErrorReproduced"
        :initial-pay-verified="paymentSutState.payVerified"
        @callback-miss="onPaymentCallbackMiss"
        @pay-error-reproduced="onPaymentErrorReproduced"
        @pay-verified="onPaymentVerified"
      />
    </section>

    <section v-if="!showDebrief && isOrderObsView" class="workbench__sim-area">
      <div class="sim-workspace__header">
        <span class="sim-workspace__tag">可观测面板</span>
        <span class="level-detail__tool">订单模块 · APM / 监控</span>
      </div>
      <OrderObsPanel
        :mode="orderObsMode"
        :initial-bottleneck="orderSutState.bottleneckIdentified"
        @bottleneck-identified="onOrderBottleneckIdentified"
      />
    </section>

    <section v-if="!showDebrief && isOnCallView" class="workbench__sim-area">
      <div class="sim-workspace__header">
        <span class="sim-workspace__tag">值班面板</span>
        <span class="level-detail__tool">线上值班 · 入职第 2 周</span>
      </div>
      <OnCallPanel
        :mode="onCallMode"
        :log-lines="onCallLogLines"
        :initial-prod-slow="onboardSutState.prodSlowReproduced"
        :initial-log-reviewed="onboardSutState.logReviewed"
        @prod-slow-reproduced="onProdSlowReproduced"
        @log-reviewed="onLogReviewed"
      />
    </section>

    <ProjectContextPanel
      v-if="!showDebrief && !isTaskView && !isLoginAppView && !isPaymentAppView && !isOrderObsView && !isOnCallView && project"
      :project="project"
      :source-level-id="activeDockLevelId"
      :current-level-id="level.id"
    />

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
      @close="closeDebrief"
    />
  </WorkbenchShell>
</template>
