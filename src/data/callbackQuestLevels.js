/** 抓包回调专项选修番外（3 关链式解锁，接主线 #31 抓包） */
export const callbackQuestLevels = [
  {
    id: 165,
    sideArc: 'callback',
    title: '抓包：回调域名配错',
    season: 'extra',
    isSideQuest: true,
    description:
      '【抓包回调 · 解锁于主线 #31 之后】staging 支付成功但订单仍「待支付」。Charles 抓到以下请求，找出问题请求。',
    simType: 'packet',
    content: '点击【最可疑、应优先排查】的请求：',
    packetRequests: [
      {
        id: 'a',
        method: 'POST',
        url: 'https://api.staging.com/v2/order/pay',
        status: 200,
        summary: '发起支付 200 · 58ms',
      },
      {
        id: 'b',
        method: 'POST',
        url: 'https://notify.prod.example.com/pay/callback',
        status: 404,
        summary: '支付回调 404 · Host 为生产 notify 域名',
      },
      {
        id: 'c',
        method: 'GET',
        url: 'https://cdn.staging.com/static/pay-icon.png',
        status: 200,
        summary: '静态资源 200 · 10ms',
      },
    ],
    correctClick: 'b',
    hint: '订单 pending 时优先看回调：404 + 生产域名 = notify URL 配错环境。',
    xpReward: 22,
    unlock: { type: 'level', levelId: 31 },
  },
  {
    id: 166,
    sideArc: 'callback',
    title: 'HTTP 200 算不算成功',
    season: 'extra',
    isSideQuest: true,
    description:
      '【抓包回调 · 解锁于 #165 之后】支付回调返回 HTTP 200，但 body 是 {"status":"FAIL","reason":"sign error"}。选出测试应如何判定。',
    simType: 'clickcard',
    content: '点击【最合理的测试判定】：',
    clickOptions: [
      { id: 'a', label: 'HTTP 200 即成功，订单应更新为已支付' },
      { id: 'b', label: 'HTTP 200 但 body 报 FAIL——应视为回调失败，订单保持待支付并告警' },
      { id: 'c', label: '只看响应时间，200ms 内就算成功' },
      { id: 'd', label: '回调失败不影响订单，用户可手动刷新' },
    ],
    correctClick: 'b',
    hint: '回调成功看 body 业务状态 + 验签，不能只看 HTTP 状态码。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 165 },
  },
  {
    id: 167,
    sideArc: 'callback',
    title: '回调联调必测项',
    season: 'extra',
    isSideQuest: true,
    description:
      '【抓包回调 · 解锁于 #166 之后】支付回调联调资源有限。圈出回调集成必须覆盖的验证项。',
    simType: 'checklist',
    content: '勾选支付回调联调中【必须覆盖】的验证项：',
    checklistItems: [
      { id: 'a', label: 'notify URL 指向正确环境（staging 不能打生产）' },
      { id: 'b', label: '回调验签失败应拒绝，不能静默更新订单' },
      { id: 'c', label: '同一 orderId 重复 SUCCESS 回调不重复变更状态（幂等）' },
      { id: 'd', label: '回调超时/失败后的订单最终状态与重试策略' },
      { id: 'e', label: '支付按钮圆角像素值' },
      { id: 'f', label: '回调请求 Content-Type 是否为 application/json' },
    ],
    correctChecks: ['a', 'b', 'c', 'd'],
    hint: '回调测环境、验签、幂等、超时终态；圆角和 Content-Type 不是冒烟核心。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 166 },
  },
]

export const callbackQuestArc = {
  id: 'callback',
  name: '抓包回调 · 选修',
  icon: '📡',
  tagline: '支付成功了订单没动？先看回调 URL',
}
