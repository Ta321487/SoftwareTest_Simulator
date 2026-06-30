import { ref, computed, nextTick } from 'vue'
import { levels } from '../utils/levelRegistry'
import { getDockShortLabel } from '../data/projects'
import { LOGIN_SUT_DOCK_ID, shouldShowLoginAppDock, isLoginModuleProject } from '../utils/loginSut'
import {
  PAYMENT_SUT_DOCK_ID,
  shouldShowPaymentAppDock,
  isPaymentModuleProject,
} from '../utils/paymentSut'
import { ORDER_OBS_DOCK_ID, shouldShowOrderObsDock, isOrderModuleProject } from '../utils/orderSut'
import { ONCALL_DOCK_ID, shouldShowOnCallDock, isOnboardWeek2Project } from '../utils/onboardSut'
import {
  LEAD_DOCK_ID,
  shouldShowLeadDock,
  isSeason2LeadProject,
  SEASON2_LEAD_ID,
} from '../utils/leadSut'

import { LOGIN_MODULE_ID } from '../utils/loginSut'
import { PAYMENT_MODULE_ID } from '../utils/paymentSut'
import { ORDER_MODULE_ID } from '../utils/orderSut'
import { ONBOARD_WEEK2_ID } from '../utils/onboardSut'

/** 关卡 Dock 导航与任务区回焦反馈 */
export function useLevelDock({
  level,
  project,
  projectStore,
  router,
  buildSutRoute,
  projectDay,
  simGuide,
}) {
  const activeDockLevelId = ref(1)
  const taskReturnFlash = ref('')
  const taskFocusPulse = ref(false)
  let taskReturnTimer = null
  let taskPulseTimer = null

  const loginSutState = computed(() => projectStore.getLoginSut(LOGIN_MODULE_ID))
  const paymentSutState = computed(() => projectStore.getPaymentSut(PAYMENT_MODULE_ID))
  const orderSutState = computed(() => projectStore.getOrderSut(ORDER_MODULE_ID))
  const onboardSutState = computed(() => projectStore.getOnboardSut(ONBOARD_WEEK2_ID))
  const leadSutState = computed(() => projectStore.getLeadSut(SEASON2_LEAD_ID))

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

    if (isSeason2LeadProject(project.value) && shouldShowLeadDock(level.value.id)) {
      items.push({
        levelId: LEAD_DOCK_ID,
        simType: 'leadboard',
        shortLabel: '看板',
        dayLabel: '实操',
        locked: false,
        lockReason: '',
        isSutEntry: true,
        sutDock: 'lead',
        hasArtifact: Boolean(
          leadSutState.value.gonogoReviewed ||
            leadSutState.value.tasksAssigned ||
            leadSutState.value.loadReportReviewed
        ),
      })
    }

    return items
  })

  function lockedLabel(levelId, projectDay) {
    return `完成本阶段第 ${projectDay} 关后解锁`
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

  function handleDockChange(id) {
    const item = dockItems.value.find((d) => d.levelId === id)
    if (item?.isSutEntry && item.sutDock) {
      router.push(buildSutRoute(level.value.id, item.sutDock))
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

  function cleanupDockTimers() {
    if (taskReturnTimer) clearTimeout(taskReturnTimer)
    if (taskPulseTimer) clearTimeout(taskPulseTimer)
  }

  return {
    activeDockLevelId,
    taskReturnFlash,
    taskFocusPulse,
    dockItems,
    handleDockChange,
    cleanupDockTimers,
  }
}
