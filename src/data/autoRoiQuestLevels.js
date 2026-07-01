/** 自动化 ROI 加深选修番外（3 关，接番外 #109） */
export const autoRoiQuestLevels = [
  {
    id: 236,
    sideArc: 'autoroi',
    title: '别进硬门禁的用例',
    season: 'extra',
    isSideQuest: true,
    description:
      '【自动化 ROI · 解锁于番外 #109 之后】团队要把 5 条用例接入 CI 硬门禁。圈出【不应】作为发布阻断项的。',
    simType: 'checklist',
    content: '勾选【不应作为 CI 硬门禁】的自动化项：',
    checklistItems: [
      { id: 'a', label: '登录主流程冒烟（稳定、高频、核心）' },
      { id: 'b', label: '首页 Banner 像素 diff（易受 UI 微调影响）' },
      { id: 'c', label: '支付回调验签接口用例（高风险、稳定）' },
      { id: 'd', label: '偶发 flaky 的 E2E（历史 15% 失败率）' },
      { id: 'e', label: '订单创建 API 契约回归（稳定、核心）' },
    ],
    correctChecks: ['b', 'd'],
    hint: '硬门禁要稳定+高价值；像素 diff 和 flaky E2E 会随机阻断发布。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 109 },
  },
  {
    id: 237,
    sideArc: 'autoroi',
    title: 'CI 里标 unstable 阶段',
    season: 'extra',
    isSideQuest: true,
    description:
      '【自动化 ROI · 解锁于 #236 之后】E2E 阶段历史 flaky。根据流水线判断应如何处理。',
    simType: 'cipipeline',
    content: '先看 E2E 阶段，再选最合理的流水线策略：',
    pipelineStages: [
      { id: 'build', name: 'Build', status: 'passed', duration: '2m' },
      { id: 'unit', name: 'Unit Test', status: 'passed', duration: '1m' },
      { id: 'e2e', name: 'E2E UI', status: 'failed', duration: '9m' },
      { id: 'deploy', name: 'Deploy', status: 'skipped', duration: '—' },
    ],
    pipelineLog:
      'E2E flaky history: 6/10 recent builds failed on #banner-pixel\nUI pixel diff mismatch 2px\nCore login spec: 10/10 passed',
    correctStage: 'e2e',
    correctCause: 'b',
    causeOptions: [
      { id: 'a', label: '立即删除全部 E2E，只留单元测试' },
      { id: 'b', label: '像素 diff 移出硬门禁或标 unstable，核心冒烟保留阻断' },
      { id: 'c', label: '忽略失败继续 deploy' },
      { id: 'd', label: '编译失败导致 E2E 红' },
    ],
    hint: '日志显示 pixel diff flaky、login 稳定——拆开门禁，别一刀切删 E2E。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 236 },
  },
  {
    id: 238,
    sideArc: 'autoroi',
    title: '写自动化立项说明',
    season: 'extra',
    isSideQuest: true,
    description:
      '【自动化 ROI · 解锁于 #237 之后】向 Lead 申请把「支付回调验签」纳入自动化。填写 ROI 说明要点。',
    simType: 'template',
    content: '填写自动化立项说明（两项必填）：',
    templateMinLength: 12,
    templateFields: [
      {
        field: 'value',
        label: '💡 为什么要自动化',
        placeholder: '频率、风险、人工成本…',
        rows: 2,
        fieldKeywords: ['高频', '风险', '回调', '验签', '重复', '回归', '人工'],
      },
      {
        field: 'scope',
        label: '🎯 范围与维护成本',
        placeholder: '先自动化哪条、预计维护代价…',
        rows: 2,
        fieldKeywords: ['范围', '维护', '稳定', '接口', '用例', '门禁', 'ROI'],
      },
    ],
    hint: 'ROI 说明写价值（频率×风险）+ 范围与维护成本——Lead 靠这个排优先级。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 237 },
  },
]

export const autoRoiQuestArc = {
  id: 'autoroi',
  name: '自动化 ROI · 选修',
  icon: '🤖',
  tagline: '门禁取舍 → 读 CI → 写立项（3 关短链）',
}
