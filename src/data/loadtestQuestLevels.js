/** 压测报告解读选修番外（3 关链式解锁，接主线 #48 压测拍板） */
export const loadtestQuestLevels = [
  {
    id: 184,
    sideArc: 'loadtest',
    title: '读压测报告标红项',
    season: 'extra',
    isSideQuest: true,
    description:
      '【压测解读 · 解锁于主线 #48 之后】大促全链路压测报告：下单 P99 420ms 达标，支付网关超时率 1.8%。在 Lead 看板确认 No-Go 建议。',
    simType: 'leadboard',
    content: '阅读压测报告，点击「确认 No-Go 建议」：',
    leadMode: 'loadtest',
    leadAction: 'load-report-reviewed',
    hint: '支付超时率 1.8% 远超 0.3% 目标——比 P99 略好更致命，应 No-Go。',
    xpReward: 22,
    unlock: { type: 'level', levelId: 48 },
  },
  {
    id: 185,
    sideArc: 'loadtest',
    title: '压测超标怎么拍板',
    season: 'extra',
    isSideQuest: true,
    description:
      '【压测解读 · 解锁于 #184 之后】压测结论：核心下单 P99 480ms（目标 500ms），库存服务错误率 2.1%（目标 <0.5%）。选发布建议。',
    simType: 'clickcard',
    content: '点击【最合理的 Go/No-Go 建议】：',
    clickOptions: [
      { id: 'a', label: 'P99 达标，库存错误率可接受，Go' },
      { id: 'b', label: '库存错误率超标，No-Go 直到修复并复测通过' },
      { id: 'c', label: '大促流量大，错误率正常，先上' },
      { id: 'd', label: '只修 UI Bug，性能问题下个版本再说' },
    ],
    correctClick: 'b',
    hint: '核心链路错误率超标比 P99 达标更致命——No-Go 要有复测标准。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 184 },
  },
  {
    id: 186,
    sideArc: 'loadtest',
    title: '复测通过标准',
    season: 'extra',
    isSideQuest: true,
    description:
      '【压测解读 · 解锁于 #185 之后】开发修复后申请复测。圈出压测复测必须满足的通过标准。',
    simType: 'checklist',
    content: '勾选压测复测【必须通过】的标准：',
    checklistItems: [
      { id: 'a', label: '超标指标（错误率/超时率）回到目标阈值内' },
      { id: 'b', label: '核心链路 P99 仍满足 SLA' },
      { id: 'c', label: '复测场景与首次压测一致（并发/时长/数据量）' },
      { id: 'd', label: '登录页按钮圆角与 UI 稿一致' },
      { id: 'e', label: '有压测报告截图/数据留档供复盘' },
      { id: 'f', label: '开发口头说修好了即可，无需复测' },
    ],
    correctChecks: ['a', 'b', 'c', 'e'],
    hint: '复测看指标回归 + 场景一致 + 留证据；UI 圆角和口头确认不是复测标准。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 185 },
  },
]

export const loadtestQuestArc = {
  id: 'loadtest',
  name: '压测解读 · 选修',
  icon: '📊',
  tagline: '压测报告一片红，敢不敢签字',
}
