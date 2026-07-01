/** 退款异步选修番外（4 关链式解锁，接主线 #49 状态机） */
export const refundQuestLevels = [
  {
    id: 154,
    sideArc: 'refund',
    title: '重复点击申请退款',
    season: 'extra',
    isSideQuest: true,
    description:
      '【退款异步 · 解锁于主线 #49 之后】用户连点 3 次「申请退款」，PM 问会不会出 3 笔退款。选出最该优先验证的行为。',
    simType: 'clickcard',
    content: '请点击【最应优先验证】的退款幂等行为：',
    clickOptions: [
      { id: 'a', label: '同一订单多次点击只产生 1 笔退款单，后续请求被幂等拦截' },
      { id: 'b', label: '每次点击都新建一笔退款单，用户可能收到多笔退款' },
      { id: 'c', label: '按钮 hover 时颜色与稿一致' },
      { id: 'd', label: 'Loading 动画帧率与 UI 稿一致' },
    ],
    correctClick: 'a',
    hint: '主线 #49 练状态流转；这里练幂等——重复提交不能产生多笔有效退款。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 49 },
  },
  {
    id: 155,
    sideArc: 'refund',
    title: '退款回调必测项',
    season: 'extra',
    isSideQuest: true,
    description:
      '【退款异步 · 解锁于 #154 之后】退款走第三方异步回调，测试资源有限。圈出回调联调必须覆盖的验证项。',
    simType: 'checklist',
    content: '勾选退款回调联调中【必须覆盖】的验证项：',
    checklistItems: [
      { id: 'a', label: '同一 refundId 重复回调只落库/入账一次（幂等）' },
      { id: 'b', label: '订单已 REFUNDED 后再次收到 SUCCESS 回调仍保持终态' },
      { id: 'c', label: '退款金额不超过订单可退余额' },
      { id: 'd', label: '退款列表页按钮圆角是否为 4px' },
      { id: 'e', label: '回调验签失败应拒绝并记录，不能静默成功' },
      { id: 'f', label: '退款说明文案标点是否全角' },
    ],
    correctChecks: ['a', 'b', 'c', 'e'],
    hint: '回调测幂等、终态、金额、验签；UI 圆角和文案标点不是回调冒烟重点。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 154 },
  },
  {
    id: 156,
    sideArc: 'refund',
    title: 'SQL 查退款卡单',
    season: 'extra',
    isSideQuest: true,
    description:
      '【退款异步 · 解锁于 #155 之后】用户反馈 orderId=5520 一直显示「退款中」2 小时。去 pay_test 库核对退款记录。',
    simType: 'sqlclient',
    content: '编写 SELECT 查询 refunds 表中 order_id=5520 的记录：',
    sqlTable: 'refunds',
    sqlSchema:
      '-- refunds(refund_id, order_id, amount, status, updated_at)\n-- status: REFUNDING | REFUNDED | FAILED',
    sqlMustInclude: ['5520'],
    sqlResultRows: [
      {
        refund_id: 'r2008',
        order_id: '5520',
        amount: '49.00',
        status: 'REFUNDING',
        updated_at: '2026-06-29 11:02:18',
      },
    ],
    correctQuery: "SELECT * FROM refunds WHERE order_id = '5520'",
    sqlHint: 'SELECT * FROM refunds WHERE order_id = …；看 status 是否卡在 REFUNDING。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 155 },
  },
  {
    id: 157,
    sideArc: 'refund',
    title: '死信队列找卡单',
    season: 'extra',
    isSideQuest: true,
    description:
      '【退款异步 · 解锁于 #156 之后】DB 显示 REFUNDING，消费端日志无新 ERROR。在 refund 相关队列里找最该优先排查的消息。',
    simType: 'mqinbox',
    content: '选中【最应优先排查】的消息：',
    inboxMode: 'mq',
    mqMessages: [
      {
        id: 'a',
        routingKey: 'pay.callback',
        time: '11:00:01',
        payload: '{"orderId":"5520","status":"PAID","amount":49.00}',
      },
      {
        id: 'b',
        routingKey: 'refund.callback',
        time: '11:02:20',
        payload: '{"refundId":"r2008","orderId":"5520","status":"SUCCESS","amount":49.00}',
      },
      {
        id: 'c',
        routingKey: 'refund.dlq',
        time: '11:05:44',
        payload:
          '{"refundId":"r2008","orderId":"5520","status":"REFUNDING","reason":"max retry exceeded"}',
      },
    ],
    correctMessageId: 'c',
    mqHint: '卡在 REFUNDING 且重试耗尽 → 查 refund.dlq 死信，别盯已成功的 pay.callback。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 156 },
  },
]

export const refundQuestArc = {
  id: 'refund',
  name: '退款异步 · 选修',
  icon: '↩️',
  tagline: '幂等、回调验签、落库、死信——接主线状态机后的异步老坑',
}
