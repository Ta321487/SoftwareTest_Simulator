/**
 * 番外关卡题型选用指南：按「题的属性」选 simType，而非固定四关公式。
 *
 * 选择（判断 / 圈范围）
 * - clickcard：单一场景决策、优先级、Go/No-Go
 * - checklist：必测项 / 回归范围 / 章程条目（多选）
 * - report：从测试报告里勾选必须补测项
 * - apmtrace / gitrelease（点选节点或 commit）：监控/发布判断
 *
 * 填空（交付物 / 沟通）
 * - template：用例预期、变更说明、探索笔记、报告段落
 * - chat：企微协作、升级 PM、确认需求、风险沟通
 * - apiclient + templateFields：写接口断言/预期（不是只勾选）
 * - calculator：通过率、缺陷密度等计算
 *
 * 实操（动手 / 工具）
 * - loginapp / paymentapp：App 手工复现
 * - jira：完整 Bug 工单
 * - terminal / sqlclient / redis：命令与查库
 * - config / mockserver / cipipeline：环境、Mock、流水线
 * - mqinbox / packet / oncall / leadboard：消息、抓包、值班
 */

/** @typedef {'choice' | 'fill' | 'hands-on'} QuestInteractionKind */

/** @type {Record<string, QuestInteractionKind>} */
export const simTypeByKind = {
  clickcard: 'choice',
  checklist: 'choice',
  report: 'choice',
  template: 'fill',
  chat: 'fill',
  calculator: 'fill',
  jira: 'hands-on',
  loginapp: 'hands-on',
  paymentapp: 'hands-on',
  terminal: 'hands-on',
  sqlclient: 'hands-on',
  redis: 'hands-on',
  config: 'hands-on',
  mockserver: 'hands-on',
  cipipeline: 'hands-on',
  apmtrace: 'hands-on',
  gitrelease: 'hands-on',
  mqinbox: 'hands-on',
  packet: 'hands-on',
  oncall: 'hands-on',
  leadboard: 'hands-on',
  apiclient: 'hands-on',
}

/** mini-arc 推荐节奏：选择 1 + 填空 1 + 实操 1（短链 3 关；需要时可加到 4 关） */
export const recommendedArcMix = {
  choice: 1,
  fill: 1,
  handsOn: 1,
}
