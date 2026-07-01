/** App 手工冒烟选修番外（3 关链式解锁，接主线 #34 验证码登录） */
export const appSmokeQuestLevels = [
  {
    id: 187,
    sideArc: 'appsmoke',
    title: '验证码倒计时 Bug',
    season: 'extra',
    isSideQuest: true,
    description:
      '【App 冒烟 · 解锁于主线 #34 之后】登录 App v2.3.0 测试包：点击「获取验证码」，观察倒计时是否异常。',
    simType: 'loginapp',
    content: '在登录 App 点击「获取验证码」，复现倒计时 Bug：',
    appBuild: 'buggy',
    appAction: 'bug-reproduced',
    hint: '手工冒烟：按用例操作，观察 UI 现象——倒计时 -1 秒是典型展示层 Bug。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 34 },
  },
  {
    id: 188,
    sideArc: 'appsmoke',
    title: '支付成功无到账通知',
    season: 'extra',
    isSideQuest: true,
    description:
      '【App 冒烟 · 解锁于 #187 之后】支付 App 测试包：点击「微信支付」，检查支付成功后是否收到到账通知。',
    simType: 'paymentapp',
    content: '在支付 App 完成支付，复现「支付成功但未收到到账通知」：',
    paymentScenario: 'callback-bug',
    appAction: 'callback-miss',
    hint: '支付冒烟：不仅看 App 状态「已支付」，还要核对测试环境到账通知/回调。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 187 },
  },
  {
    id: 189,
    sideArc: 'appsmoke',
    title: 'App 冒烟必测项',
    season: 'extra',
    isSideQuest: true,
    description:
      '【App 冒烟 · 解锁于 #188 之后】小版本 App 发布，只有 1 小时手工冒烟。圈出必须覆盖的验证项。',
    simType: 'checklist',
    content: '勾选 App 手工冒烟【必须覆盖】的项：',
    checklistItems: [
      { id: 'a', label: '登录/注册主流程可走通' },
      { id: 'b', label: '核心支付/下单流程与状态展示正确' },
      { id: 'c', label: '本次改动相关的 UI/交互点' },
      { id: 'd', label: 'App 图标圆角像素值' },
      { id: 'e', label: '崩溃/闪退、ANR 等稳定性现象' },
      { id: 'f', label: '关于页版权文案标点' },
    ],
    correctChecks: ['a', 'b', 'c', 'e'],
    hint: 'App 冒烟：主流程 + 改动面 + 稳定性；图标圆角和版权文案不是 1 小时冒烟重点。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 188 },
  },
]

export const appSmokeQuestArc = {
  id: 'appsmoke',
  name: 'App 冒烟 · 选修',
  icon: '📲',
  tagline: '点 App 复现、支付通知、冒烟清单——手工测试体感链',
}
