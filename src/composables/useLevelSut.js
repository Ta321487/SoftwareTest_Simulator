import { ref, computed, watch } from 'vue'
import {
  getImmersionStepsProgress,
  setImmersionStepProgress,
  initPassiveSutStep,
  syncDbConnectedStep,
} from '../utils/sutImmersion'
import {
  LOGIN_MODULE_ID,
  getLoginBuildVersion,
  shouldShowLoginAppDock,
  getLoginSutLead,
  isLoginModuleProject,
} from '../utils/loginSut'
import {
  PAYMENT_MODULE_ID,
  getPaymentScenario,
  shouldShowPaymentAppDock,
  getPaymentSutLead,
  isPaymentModuleProject,
} from '../utils/paymentSut'
import {
  ORDER_MODULE_ID,
  getOrderObsMode,
  shouldShowOrderObsDock,
  getOrderObsLead,
  isOrderModuleProject,
} from '../utils/orderSut'
import {
  ONBOARD_WEEK2_ID,
  getOnCallMode,
  shouldShowOnCallDock,
  getOnCallLead,
  isOnboardWeek2Project,
  DEFAULT_PROD_LOGS,
} from '../utils/onboardSut'
import {
  SEASON2_LEAD_ID,
  getLeadMode,
  shouldShowLeadDock,
  getLeadSutLead,
  isSeason2LeadProject,
} from '../utils/leadSut'

/** 上机实操（SUT）模式状态与事件处理 */
export function useLevelSut({
  level,
  project,
  isSutMode,
  sutEntry,
  sutDockQuery,
  progressStore,
  projectStore,
  buildMainLevelRoute,
}) {
  const sutToast = ref('')

  const loginBuild = computed(() => (level.value ? getLoginBuildVersion(level.value.id) : 'buggy'))
  const loginSutState = computed(() => projectStore.getLoginSut(LOGIN_MODULE_ID))
  const paymentScenario = computed(() =>
    level.value ? getPaymentScenario(level.value.id, projectStore, progressStore) : 'no-db'
  )
  const paymentSutState = computed(() => projectStore.getPaymentSut(PAYMENT_MODULE_ID))
  const orderObsMode = computed(() => (level.value ? getOrderObsMode(level.value.id) : 'overview'))
  const orderSutState = computed(() => projectStore.getOrderSut(ORDER_MODULE_ID))
  const onCallMode = computed(() => (level.value ? getOnCallMode(level.value.id) : 'release-board'))
  const onboardSutState = computed(() => projectStore.getOnboardSut(ONBOARD_WEEK2_ID))
  const leadSutState = computed(() => projectStore.getLeadSut(SEASON2_LEAD_ID))
  const onCallLogLines = computed(() =>
    level.value?.storyLogs?.length ? level.value.storyLogs : DEFAULT_PROD_LOGS
  )

  const showInlineLoginSut = computed(
    () =>
      isSutMode.value &&
      sutDockQuery.value === 'app' &&
      isLoginModuleProject(project.value) &&
      level.value &&
      shouldShowLoginAppDock(level.value.id)
  )
  const loginSutLead = computed(() => (level.value ? getLoginSutLead(level.value.id) : ''))

  const showInlinePaymentSut = computed(
    () =>
      isSutMode.value &&
      sutDockQuery.value === 'pay' &&
      isPaymentModuleProject(project.value) &&
      level.value &&
      shouldShowPaymentAppDock(level.value.id)
  )
  const paymentSutLead = computed(() => (level.value ? getPaymentSutLead(level.value.id) : ''))

  const showInlineOrderObs = computed(
    () =>
      isSutMode.value &&
      sutDockQuery.value === 'obs' &&
      isOrderModuleProject(project.value) &&
      level.value &&
      shouldShowOrderObsDock(level.value.id)
  )
  const orderObsLead = computed(() => (level.value ? getOrderObsLead(level.value.id) : ''))

  const showInlineOnCall = computed(
    () =>
      isSutMode.value &&
      sutDockQuery.value === 'oncall' &&
      isOnboardWeek2Project(project.value) &&
      level.value &&
      shouldShowOnCallDock(level.value.id)
  )
  const onCallLead = computed(() => (level.value ? getOnCallLead(level.value.id) : ''))

  const leadMode = computed(() => (level.value ? getLeadMode(level.value.id) : 'gonogo'))
  const showInlineLead = computed(
    () =>
      isSutMode.value &&
      sutDockQuery.value === 'lead' &&
      isSeason2LeadProject(project.value) &&
      level.value &&
      shouldShowLeadDock(level.value.id)
  )
  const leadSutLead = computed(() => (level.value ? getLeadSutLead(level.value.id) : ''))

  const sutSteps = computed(() => {
    if (!sutEntry.value || !project.value) return []
    return getImmersionStepsProgress(sutEntry.value, projectStore, project.value.id)
  })

  const paymentConfigArtifact = computed(() => projectStore.getArtifact(PAYMENT_MODULE_ID, 6))

  const showDbConnectedMainLink = computed(
    () =>
      isSutMode.value &&
      sutEntry.value?.key === 'dbConnected' &&
      !paymentSutState.value.dbConnected &&
      !progressStore.completedLevelIds.includes(6)
  )

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

  function showSutCompleteToast(message) {
    sutToast.value = message
    setTimeout(() => {
      sutToast.value = ''
    }, 4000)
  }

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

  function onLeadMetricsFlagged() {
    const { entry } = sutContext()
    if (entry?.key === 'gonogoReviewed') advanceSutSteps(2)
  }

  function onLeadGonogoReviewed() {
    finishSutImmersion()
    projectStore.patchLeadSut(SEASON2_LEAD_ID, { gonogoReviewed: true })
    progressStore.recordLeadGonogoReviewed()
    showSutCompleteToast('✓ Go/No-Go 已记录 · 可返回主线选发布建议')
  }

  function onLeadTasksDraftUpdated() {
    const { entry } = sutContext()
    if (entry?.key === 'tasksAssigned') advanceSutSteps(2)
  }

  function onLeadTasksAssigned() {
    finishSutImmersion()
    projectStore.patchLeadSut(SEASON2_LEAD_ID, { tasksAssigned: true })
    progressStore.recordLeadTasksAssigned()
    showSutCompleteToast('✓ 任务已分派 · 可返回主线填写说明')
  }

  function onLeadLoadReportReviewed() {
    finishSutImmersion()
    projectStore.patchLeadSut(SEASON2_LEAD_ID, { loadReportReviewed: true })
    progressStore.recordLeadLoadReportReviewed()
    showSutCompleteToast('✓ 压测报告已确认 · 可返回主线拍板')
  }

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

  return {
    loginSutState,
    paymentSutState,
    orderSutState,
    onboardSutState,
    leadSutState,
    sutToast,
    loginBuild,
    paymentScenario,
    orderObsMode,
    onCallMode,
    leadMode,
    onCallLogLines,
    showInlineLoginSut,
    loginSutLead,
    showInlinePaymentSut,
    paymentSutLead,
    showInlineOrderObs,
    orderObsLead,
    showInlineOnCall,
    onCallLead,
    showInlineLead,
    leadSutLead,
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
    buildMainLevelRoute,
  }
}
