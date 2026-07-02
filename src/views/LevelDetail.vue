<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLevelById, isDailyQuestId, isSideQuestId } from '../utils/levelRegistry'
import { getProjectForLevel, getProjectDay } from '../data/projects'
import { getPhaseForLevel, getPhaseStep } from '../data/phases'
import { getRankForXp } from '../data/ranks'
import { getStoryContext } from '../data/storyContext'
import { getDebrief } from '../data/debriefs'
import { getSkillForLevel, getSpiralNote } from '../data/testingSkills'
import { getReferenceAnswer } from '../data/referenceAnswers'
import { useProgressStore } from '../stores/progressStore'
import { useProjectStore } from '../stores/projectStore'
import { getValidationCriteria } from '../utils/validationCriteria'
import { getSimGuide } from '../utils/simGuides'
import { getLevelHint } from '../utils/failureHints'
import { getLevelXpPreview } from '../utils/levelXp'
import { getLevelDeliverable } from '../data/levelDeliverables'
import { useMobileLayout } from '../composables/useMobileLayout'
import { useLevelHints } from '../composables/useLevelHints'
import { useLevelSubmit } from '../composables/useLevelSubmit'
import { useLevelDock } from '../composables/useLevelDock'
import { useLevelSut } from '../composables/useLevelSut'
import { trackLevelStart } from '../utils/analytics'
import { buildSimProps, getLinkedJiraIssue as resolveLinkedJiraIssue } from '../utils/simProps'
import {
  buildSutRoute,
  buildMainLevelRoute,
  getSutEntriesForLevel,
  isSutModeRoute,
  getSutDockQuery,
  resolveSutEntry,
} from '../utils/sutImmersion'
import { getHandbookLinksForLevel } from '../utils/handbookLinks'
import DebriefPanel from '../components/DebriefPanel.vue'
import LevelFailureLearning from '../components/LevelFailureLearning.vue'
import PreviousSubmission from '../components/PreviousSubmission.vue'
import WorkbenchShell from '../components/workbench/WorkbenchShell.vue'
import ProjectContextPanel from '../components/workbench/ProjectContextPanel.vue'
import {
  simComponentMap,
  LoginAppMock,
  PaymentAppMock,
  OrderObsPanel,
  OnCallPanel,
  LeadPanel,
} from '../components/simulators/loadSimulators.js'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()
const projectStore = useProjectStore()
const { isMobile } = useMobileLayout()

const simRef = ref(null)
const simSessionKey = ref(0)
const freshRetrySession = ref(false)
const sessionAttempts = ref(0)
const taskPanelOpen = ref(true)

const {
  showHint,
  hintText,
  sessionHintUsed,
  hintPoolSize,
  resetHints,
  revealHint: revealLevelHint,
} = useLevelHints(progressStore)

const levelId = computed(() => Number(route.params.id))
const level = computed(() => getLevelById(levelId.value))
const hasLevelHint = computed(() => (level.value ? Boolean(getLevelHint(level.value)) : false))
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

const {
  showFeedback,
  feedbackMessage,
  failureHint,
  showDebrief,
  jiraInvalidFields,
  jiraPreview,
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
} = useLevelSubmit({
  level,
  storyContext,
  progressStore,
  projectStore,
  sessionHintUsed,
  sessionAttempts,
  simRef,
})

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

const hintButtonLabel = computed(() => {
  if (isDailyQuestId(levelId.value)) {
    if (!sessionHintUsed.value) return '思路提示'
    return hintPoolSize.value > 1 ? '换一条思路' : '再看思路'
  }
  if (levelStatus.value === 'completed') {
    return sessionHintUsed.value && hintPoolSize.value > 1 ? '换一条提示（冲三星）' : '提示（冲三星）'
  }
  if (sessionHintUsed.value) {
    return hintPoolSize.value > 1 ? '换一条提示' : '再看提示'
  }
  return '查看提示（会少一颗星）'
})

const simGuide = computed(() => (level.value ? getSimGuide(level.value.simType) : null))
const validationCriteria = computed(() => (level.value ? getValidationCriteria(level.value) : ''))
const debrief = computed(() => {
  if (!level.value) return null
  const base = getDebrief(level.value.id, level.value.dailyKey)
  if (!base) return null
  const skill = getSkillForLevel(level.value.id)
  if (!skill) return base
  return { ...base, skill, spiralNote: getSpiralNote(level.value.id) }
})

const handbookLinks = computed(() =>
  level.value && debrief.value ? getHandbookLinksForLevel(level.value.id) : null
)

const simComponent = computed(() => (level.value ? simComponentMap[level.value.simType] : null))

const MOBILE_HEAVY_SIMS = new Set(['terminal', 'apiclient', 'packet'])
const showMobileSimHint = computed(() => level.value && MOBILE_HEAVY_SIMS.has(level.value.simType))

const {
  activeDockLevelId,
  taskReturnFlash,
  taskFocusPulse,
  dockItems,
  handleDockChange,
  cleanupDockTimers,
} = useLevelDock({
  level,
  project,
  projectStore,
  progressStore,
  router,
  buildSutRoute,
  projectDay,
  simGuide,
})

const {
  loginSutState,
  paymentSutState,
  orderSutState,
  onboardSutState,
  leadSutState,
  sutToast,
  loginBuild,
  paymentScenario,
  orderObsMode,
  showInlineLoginSut,
  loginSutLead,
  showInlinePaymentSut,
  paymentSutLead,
  showInlineOrderObs,
  orderObsLead,
  showInlineOnCall,
  onCallLead,
  onCallLogLines,
  onCallMode,
  showInlineLead,
  leadSutLead,
  leadMode,
  sutSteps,
  paymentConfigArtifact,
  showDbConnectedMainLink,
  setupSutSession,
  onLoginSmsRequested,
  onLoginBugReproduced,
  onLoginFixVerified,
  onPaymentDbConnected,
  onPaymentPayAttempt,
  onPaymentPaySuccess,
  onPaymentCallbackMiss,
  onPaymentErrorReproduced,
  onPaymentVerified,
  onOrderBottleneckIdentified,
  onProdLoginStarted,
  onProdSlowReproduced,
  onLogReviewed,
  onLeadMetricsFlagged,
  onLeadGonogoReviewed,
  onLeadTasksDraftUpdated,
  onLeadTasksAssigned,
  onLeadLoadReportReviewed,
} = useLevelSut({
  level,
  project,
  isSutMode,
  sutEntry,
  sutDockQuery,
  progressStore,
  projectStore,
  buildMainLevelRoute,
})

const isTaskView = computed(
  () => level.value && !isSutMode.value && activeDockLevelId.value === level.value.id
)

function goToMainTask() {
  router.push(buildMainLevelRoute(levelId.value))
}

function openSutEntry(entry) {
  router.push(buildSutRoute(entry.levelId, entry.dock))
}

function getLinkedJiraIssue(projectId) {
  return resolveLinkedJiraIssue(projectId, projectStore.hasArtifact.bind(projectStore))
}

const simProps = computed(() =>
  buildSimProps({
    level: level.value,
    storyContext: storyContext.value,
    project: project.value,
    jiraInvalidFields: jiraInvalidFields.value,
    jiraPreview: jiraPreview.value,
    submissionInitialValues: submissionInitialValues.value,
    submissionInitialSelected: submissionInitialSelected.value,
    getLinkedJiraIssue,
  })
)

function resetState() {
  resetHints()
  resetSubmitState()
}

function revealHint() {
  revealLevelHint(level.value)
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
    taskPanelOpen.value = true
    resetState()
    setupSutSession()
    if (currentLevel) {
      trackLevelStart(currentLevel.id, currentLevel.simType)
    }
  },
  { immediate: true }
)

const rankUp = computed(() => {
  if (!showDebrief.value || rankBeforeLevel.value == null) return null
  const after = getRankForXp(progressStore.totalXp)
  if (after.minXp > rankBeforeLevel.value.minXp) return after
  return null
})

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
  cleanupDockTimers()
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

      <div v-else-if="showInlineLead" class="sut-mode__panel">
        <p class="login-sut-panel__lead">{{ leadSutLead || '在 Lead 看板中完成上述步骤。' }}</p>
        <LeadPanel
          :mode="leadMode"
          :initial-gonogo-reviewed="leadSutState.gonogoReviewed"
          :initial-tasks-assigned="leadSutState.tasksAssigned"
          :initial-load-report-reviewed="leadSutState.loadReportReviewed"
          @metrics-flagged="onLeadMetricsFlagged"
          @gonogo-reviewed="onLeadGonogoReviewed"
          @tasks-draft-updated="onLeadTasksDraftUpdated"
          @tasks-assigned="onLeadTasksAssigned"
          @load-report-reviewed="onLeadLoadReportReviewed"
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

    <section
      v-if="!showDebrief && isTaskView"
      class="task-panel task-panel--compact task-panel-brief task-panel-brief--desktop"
      :class="{ 'task-panel-brief--pulse': taskFocusPulse }"
    >
      <p class="quest-panel__badge task-panel-brief__badge">▸ 当前任务</p>
      <p v-if="isExtraLevel" class="task-panel__extra-tag">
        {{ isDailyQuestId(levelId) ? '📅 每日特训' : '🎬 番外关卡' }}
      </p>
      <p v-if="deliverable" class="task-panel__deliverable">
        <span class="task-panel__deliverable-label">今日交付物</span>
        {{ deliverable }}
      </p>
      <div class="task-panel__action">
        <span class="task-panel__action-icon">📋</span>
        <p>{{ level.content }}</p>
      </div>
      <div v-if="sutEntriesOnLevel.length" class="task-panel__sut-links">
        <span class="task-panel__sut-label">可选 App 实操（不影响通关）：</span>
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

    <details
      v-if="!showDebrief && isTaskView"
      class="task-panel-fold task-panel-brief task-panel-brief--mobile"
      :class="{ 'task-panel-brief--pulse': taskFocusPulse }"
      :open="taskPanelOpen"
      @toggle="taskPanelOpen = $event.target.open"
    >
      <summary class="task-panel-fold__summary">
        <span class="quest-panel__badge task-panel-fold__badge task-panel-fold__badge--inline">
          <span class="task-panel-fold__caret" aria-hidden="true"></span>任务
        </span>
        <span class="task-panel-fold__icon">📋</span>
        <span class="task-panel-fold__text">{{ level.content }}</span>
        <span v-if="xpPreview" class="task-panel-fold__xp">
          +{{ xpPreview.base }} XP
          <template v-if="xpPreview.canImprove"> · 重玩最多 +{{ xpPreview.maxTotal }}</template>
        </span>
      </summary>
      <section class="task-panel task-panel--compact">
        <div class="task-panel__action task-panel__action--full">
          <span class="task-panel__action-icon">📋</span>
          <p>{{ level.content }}</p>
        </div>
        <p v-if="isExtraLevel" class="task-panel__extra-tag">
          {{ isDailyQuestId(levelId) ? '📅 每日特训' : '🎬 番外关卡' }}
        </p>
        <p v-if="deliverable" class="task-panel__deliverable">
          <span class="task-panel__deliverable-label">今日交付物</span>
          {{ deliverable }}
        </p>
        <div v-if="sutEntriesOnLevel.length" class="task-panel__sut-links">
          <span class="task-panel__sut-label">可选 App 实操（不影响通关）：</span>
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
        <div class="task-panel__details task-panel__details--open">
          <p class="task-panel__details-label">背景与判定标准</p>
          <p class="task-panel__text">{{ level.description }}</p>
          <p class="task-panel__criteria-inline">{{ validationCriteria }}</p>
        </div>
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
        💡 这类关卡建议在电脑或横屏完成，手机可以先读题。
      </p>
      <div class="sim-workspace__header">
        <span class="sim-workspace__tag">{{ simGuide.label }}</span>
        <span
          v-if="levelStatus === 'completed'"
          class="level-detail__badge level-detail__badge--completed"
        >
          {{ existingStars ? `★${existingStars} · 重玩冲三星` : '已通关' }}
        </span>
        <button
          v-if="hasLevelHint"
          type="button"
          class="level-detail__hint-btn"
          @click="revealHint"
        >
          💡 {{ hintButtonLabel }}
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
      <LevelFailureLearning
        v-if="showFeedback"
        :level-id="levelId"
        :completed-level-ids="progressStore.completedLevelIds"
      />
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
