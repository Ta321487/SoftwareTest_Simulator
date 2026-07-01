/** Lead 带教选修番外（4 关链式解锁，接主线 #47 分派任务） */
export const leadQuestLevels = [
  {
    id: 176,
    sideArc: 'lead',
    title: 'Go/No-Go 标红指标',
    season: 'extra',
    isSideQuest: true,
    description:
      '【Lead 带教 · 解锁于主线 #47 之后】大促压测评审：下单 P99 480ms 达标，但库存错误率 2.1%。在 Lead 看板标出超标项并记录 No-Go。',
    simType: 'leadboard',
    content: '点击超标指标卡片，再点击「记录 No-Go · 待复测」：',
    leadMode: 'gonogo',
    leadAction: 'gonogo-reviewed',
    hint: '库存错误率 2.1% 远超 0.5% 目标——核心链路风险应 No-Go，别被 P99 达标迷惑。',
    xpReward: 22,
    unlock: { type: 'level', levelId: 47 },
  },
  {
    id: 177,
    sideArc: 'lead',
    title: '分派实习生回归任务',
    season: 'extra',
    isSideQuest: true,
    description:
      '【Lead 带教 · 解锁于 #176 之后】大版本前要把登录回归分给实习生。在看板填写任务范围、交付标准与截止时间。',
    simType: 'leadboard',
    content: '填写三项任务说明，点击「确认分派」：',
    leadMode: 'roster',
    leadAction: 'tasks-assigned',
    hint: '带人要写清：测什么、交什么、什么时候交——范围/交付/截止缺一不可。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 176 },
  },
  {
    id: 178,
    sideArc: 'lead',
    title: '大版本资源怎么排',
    season: 'extra',
    isSideQuest: true,
    description:
      '【Lead 带教 · 解锁于 #177 之后】距上线 3 天，人力只够做一轮完整回归。选出最合理的测试资源分配。',
    simType: 'clickcard',
    content: '点击【最合理的资源分配策略】：',
    clickOptions: [
      { id: 'a', label: '全员只做 UI 走查，接口回归全部暂缓' },
      { id: 'b', label: '核心链路（登录/支付/下单）+ 本次改动模块优先，低风险 UI 抽样' },
      { id: 'c', label: '随机分配模块，谁空闲谁测' },
      { id: 'd', label: '只测开发自测报告里 PASS 的用例' },
    ],
    correctClick: 'b',
    hint: 'Lead 排期：核心链路 + 改动面 + 高风险 FAIL 优先，不是随机或只做 UI。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 177 },
  },
  {
    id: 179,
    sideArc: 'lead',
    title: 'Review 交付物优先级',
    season: 'extra',
    isSideQuest: true,
    description:
      '【Lead 带教 · 解锁于 #178 之后】实习生交了 3 份交付物，你只有 30 分钟 Review。选出最该优先看的一项。',
    simType: 'clickcard',
    content: '点击【最应优先 Review】的交付物：',
    clickOptions: [
      { id: 'a', label: '登录主流程 FAIL 用例的执行记录与截图' },
      { id: 'b', label: '关于页版本号字体大小截图' },
      { id: 'c', label: '登录按钮 hover 颜色对比稿' },
      { id: 'd', label: '个人中心背景渐变色差异' },
    ],
    correctClick: 'a',
    hint: 'Lead Review 先看核心链路 FAIL 和高风险项；纯视觉差异可后排。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 178 },
  },
]

export const leadQuestArc = {
  id: 'lead',
  name: 'Lead 带教 · 选修',
  icon: '🚀',
  tagline: 'Go/No-Go、分任务、排资源、Review 交付——带人发布四步',
}
