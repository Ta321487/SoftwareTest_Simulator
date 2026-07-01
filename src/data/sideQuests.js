/** 番外关卡（ID 101+），不影响主线 levelOrder */
import { mindsetQuestLevels, mindsetQuestArcs } from './mindsetQuestLevels.js'
import { linuxQuestLevels, linuxQuestArc } from './linuxQuestLevels.js'
import { toolQuestLevels, toolQuestArcs } from './toolQuestLevels.js'
import { uatQuestLevels, uatQuestArc } from './uatQuestLevels.js'
import { refundQuestLevels, refundQuestArc } from './refundQuestLevels.js'
import { smsQuestLevels, smsQuestArc } from './smsQuestLevels.js'
import { grayReleaseQuestLevels, grayReleaseQuestArc } from './grayReleaseQuestLevels.js'
import { callbackQuestLevels, callbackQuestArc } from './callbackQuestLevels.js'
import { orderStuckQuestLevels, orderStuckQuestArc } from './orderStuckQuestLevels.js'
import { oncallQuestLevels, oncallQuestArc } from './oncallQuestLevels.js'
import { leadQuestLevels, leadQuestArc } from './leadQuestLevels.js'
import { apiAuthQuestLevels, apiAuthQuestArc } from './apiAuthQuestLevels.js'
import { loadtestQuestLevels, loadtestQuestArc } from './loadtestQuestLevels.js'
import { appSmokeQuestLevels, appSmokeQuestArc } from './appSmokeQuestLevels.js'
import { exploreQuestLevels, exploreQuestArc } from './exploreQuestLevels.js'
import { testReportQuestLevels, testReportQuestArc } from './testReportQuestLevels.js'
import { configDriftQuestLevels, configDriftQuestArc } from './configDriftQuestLevels.js'
import { flakyQuestLevels, flakyQuestArc } from './flakyQuestLevels.js'
import { reqChangeQuestLevels, reqChangeQuestArc } from './reqChangeQuestLevels.js'
import { weaknetQuestLevels, weaknetQuestArc } from './weaknetQuestLevels.js'
import { datamaskQuestLevels, datamaskQuestArc } from './datamaskQuestLevels.js'
import { i18nQuestLevels, i18nQuestArc } from './i18nQuestLevels.js'
import { analyticsQuestLevels, analyticsQuestArc } from './analyticsQuestLevels.js'
import { contractQuestLevels, contractQuestArc } from './contractQuestLevels.js'
import { autoRoiQuestLevels, autoRoiQuestArc } from './autoRoiQuestLevels.js'
import { boundaryQuestLevels, boundaryQuestArc } from './boundaryQuestLevels.js'
import { enrichSideArcs } from './sideQuestChapters.js'

export const SIDE_QUEST_ID_MIN = 101
export const SIDE_QUEST_ID_MAX = 299

export const sideLevels = [
  ...mindsetQuestLevels,
  ...linuxQuestLevels,
  ...uatQuestLevels,
  ...refundQuestLevels,
  ...smsQuestLevels,
  ...grayReleaseQuestLevels,
  ...callbackQuestLevels,
  ...orderStuckQuestLevels,
  ...oncallQuestLevels,
  ...leadQuestLevels,
  ...apiAuthQuestLevels,
  ...loadtestQuestLevels,
  ...appSmokeQuestLevels,
  ...exploreQuestLevels,
  ...testReportQuestLevels,
  ...configDriftQuestLevels,
  ...flakyQuestLevels,
  ...reqChangeQuestLevels,
  ...weaknetQuestLevels,
  ...datamaskQuestLevels,
  ...i18nQuestLevels,
  ...analyticsQuestLevels,
  ...contractQuestLevels,
  ...autoRoiQuestLevels,
  ...boundaryQuestLevels,
  ...toolQuestLevels,
]

export const sideArcs = enrichSideArcs([
  ...mindsetQuestArcs,
  uatQuestArc,
  refundQuestArc,
  smsQuestArc,
  grayReleaseQuestArc,
  callbackQuestArc,
  orderStuckQuestArc,
  oncallQuestArc,
  leadQuestArc,
  apiAuthQuestArc,
  loadtestQuestArc,
  appSmokeQuestArc,
  exploreQuestArc,
  testReportQuestArc,
  configDriftQuestArc,
  flakyQuestArc,
  reqChangeQuestArc,
  weaknetQuestArc,
  datamaskQuestArc,
  i18nQuestArc,
  analyticsQuestArc,
  contractQuestArc,
  autoRoiQuestArc,
  boundaryQuestArc,
  linuxQuestArc,
  ...toolQuestArcs,
])

export {
  sideChapters,
  TOOLCHAIN_ARC_IDS,
  isToolchainArc,
  getToolchainProgress,
  getNextToolchainLevel,
} from './sideQuestChapters.js'

export const sideLevelIds = sideLevels.map((l) => l.id)

export function getSideLevel(id) {
  return sideLevels.find((l) => l.id === id) || null
}

export function isSideQuestId(id) {
  return id >= SIDE_QUEST_ID_MIN && id <= SIDE_QUEST_ID_MAX
}

export function isSideQuestUnlocked(level, completedLevelIds) {
  const unlock = level.unlock
  if (!unlock) return true
  if (unlock.type === 'level') {
    return completedLevelIds.includes(unlock.levelId)
  }
  if (unlock.type === 'mainCount') {
    const mainDone = completedLevelIds.filter((id) => id >= 1 && id <= 99).length
    return mainDone >= unlock.min
  }
  if (unlock.type === 'sideLevel') {
    return completedLevelIds.includes(unlock.sideLevelId)
  }
  return false
}

export function getUnlockHint(level) {
  const unlock = level.unlock
  if (!unlock) return ''
  if (unlock.type === 'level') {
    return `完成主线第 ${unlock.levelId} 关后解锁`
  }
  if (unlock.type === 'mainCount') {
    return `主线通关 ${unlock.min} 关后解锁`
  }
  if (unlock.type === 'sideLevel') {
    return `完成番外 #${unlock.sideLevelId} 后解锁`
  }
  return '完成更多主线后解锁'
}

export function getSideArc(sideArcId) {
  return sideArcs.find((a) => a.id === sideArcId) || null
}
