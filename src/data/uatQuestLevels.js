/** UAT 验收选修番外（3 关链式解锁） */
export const uatQuestLevels = [
  {
    id: 151,
    sideArc: 'uat',
    title: 'UAT 谁签字验收',
    season: 'extra',
    isSideQuest: true,
    description:
      '【UAT 验收 · 解锁于 Go/No-Go 之后】大版本上线前，业务方问「UAT 过了是不是就不用测试签字了？」选出最合理的协作方式。',
    simType: 'clickcard',
    content: '请点击【最合理的验收协作方式】：',
    clickOptions: [
      { id: 'a', label: 'UAT 通过即可上线，测试签字可有可无' },
      { id: 'b', label: '业务 UAT 验需求满足，测试签字保质量门禁——两者都要、分工不同' },
      { id: 'c', label: '测试替业务做 UAT，业务只口头确认' },
    ],
    correctClick: 'b',
    hint: 'UAT 验「做对了吗」；测试签字验「测够了吗、风险可控吗」——不是二选一。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 33 },
  },
  {
    id: 152,
    sideArc: 'uat',
    title: '圈 UAT 验收标准',
    season: 'extra',
    isSideQuest: true,
    description:
      '【UAT 验收 · 解锁于 #151 之后】运营要在周五做登录模块 UAT。资源有限，圈出业务验收必须覆盖的项。',
    simType: 'checklist',
    content: '勾选【UAT 必须覆盖】的验收项：',
    checklistItems: [
      { id: 'a', label: '手机号/邮箱登录主流程可走通' },
      { id: 'b', label: '密码错误 5 次锁定与解锁体验符合 PRD' },
      { id: 'c', label: '登录页背景渐变色与品牌稿一致' },
      { id: 'd', label: '验证码获取与过期规则符合运营预期' },
      { id: 'e', label: '登录成功后跳转至用户期望的首页/工作台' },
      { id: 'f', label: '开发自测报告里的单元测试覆盖率数值' },
    ],
    correctChecks: ['a', 'b', 'd', 'e'],
    hint: 'UAT 圈业务可感知的主流程与规则；UI 品牌色、单元测试覆盖率通常不是 UAT 首轮重点。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 151 },
  },
  {
    id: 153,
    sideArc: 'uat',
    title: 'UAT 缺陷怎么定级',
    season: 'extra',
    isSideQuest: true,
    description:
      '【UAT 验收 · 解锁于 #152 之后】业务在 UAT 提了 3 个问题，选出最该按「阻塞验收」处理的一条。',
    simType: 'clickcard',
    content: '点击【应定为 UAT 阻塞项】的问题：',
    clickOptions: [
      { id: 'a', label: '登录成功后未跳转到工作台，仍停在登录页' },
      { id: 'b', label: '登录按钮 hover 颜色与稿差 1 个色阶' },
      { id: 'c', label: '帮助文案「忘记密码」改为「找回密码」更好读' },
      { id: 'd', label: 'Loading 动画比设计稿慢 0.2 秒' },
    ],
    correctClick: 'a',
    hint: '阻塞 UAT = 主流程走不通或核心业务规则不符；纯视觉/文案优化通常排期修复而非挡验收。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 152 },
  },
]

export const uatQuestArc = {
  id: 'uat',
  name: 'UAT 验收 · 选修',
  icon: '✅',
  tagline: '业务验收、签字分工、阻塞定级——上线前最后一道门',
}
