import { defineAsyncComponent } from 'vue'

/** 主线任务模拟器 — 按 simType 懒加载 */
export const simComponentMap = {
  jira: defineAsyncComponent(() => import('./JiraForm.vue')),
  terminal: defineAsyncComponent(() => import('./Terminal.vue')),
  chat: defineAsyncComponent(() => import('./ChatBox.vue')),
  config: defineAsyncComponent(() => import('./ConfigEditor.vue')),
  report: defineAsyncComponent(() => import('./ReportChecker.vue')),
  checklist: defineAsyncComponent(() => import('./Checklist.vue')),
  clickcard: defineAsyncComponent(() => import('./ClickCard.vue')),
  template: defineAsyncComponent(() => import('./TemplateFiller.vue')),
  calculator: defineAsyncComponent(() => import('./Calculator.vue')),
  apiclient: defineAsyncComponent(() => import('./ApiClient.vue')),
  packet: defineAsyncComponent(() => import('./PacketCapture.vue')),
  sqlclient: defineAsyncComponent(() => import('./SqlClient.vue')),
  redis: defineAsyncComponent(() => import('./RedisClient.vue')),
  cipipeline: defineAsyncComponent(() => import('./CiPipeline.vue')),
  mockserver: defineAsyncComponent(() => import('./MockServer.vue')),
  apmtrace: defineAsyncComponent(() => import('./ApmTrace.vue')),
  gitrelease: defineAsyncComponent(() => import('./GitRelease.vue')),
  mqinbox: defineAsyncComponent(() => import('./MqInbox.vue')),
}

/** 上机实操面板 — 进入对应 SUT 模式时再加载 */
export const LoginAppMock = defineAsyncComponent(() => import('./LoginAppMock.vue'))
export const PaymentAppMock = defineAsyncComponent(() => import('./PaymentAppMock.vue'))
export const OrderObsPanel = defineAsyncComponent(() => import('./OrderObsPanel.vue'))
export const OnCallPanel = defineAsyncComponent(() => import('./OnCallPanel.vue'))
export const LeadPanel = defineAsyncComponent(() => import('./LeadPanel.vue'))
