/** 订单卡单排查选修番外（4 关链式解锁，接主线 #43 订单状态机） */
export const orderStuckQuestLevels = [
  {
    id: 168,
    sideArc: 'orderstuck',
    title: 'PAID 但不出货',
    season: 'extra',
    isSideQuest: true,
    description:
      '【订单卡单 · 解锁于主线 #43 之后】用户反馈 orderId=9905 已支付 2 小时仍显示「待发货」。以下哪种状态流转最可疑？',
    simType: 'clickcard',
    content: '请点击【最可疑、不符合业务预期】的状态：',
    clickVariant: 'trace',
    clickOptions: [
      { id: 'a', label: 'PENDING → PAID（支付成功）' },
      { id: 'b', label: 'PAID → PAID（支付成功后长时间未流转到 SHIPPED）' },
      { id: 'c', label: 'SHIPPED → COMPLETED（用户确认收货）' },
      { id: 'd', label: 'PENDING → CANCELLED（超时未支付取消）' },
    ],
    correctClick: 'b',
    hint: '已支付应流转到发货；长时间停在 PAID 说明下游消费/状态机卡住了。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 43 },
  },
  {
    id: 169,
    sideArc: 'orderstuck',
    title: 'SQL 查订单卡在哪',
    season: 'extra',
    isSideQuest: true,
    description:
      '【订单卡单 · 解锁于 #168 之后】界面显示「待发货」，去 order_test 库核对 orderId=9905 的真实状态。',
    simType: 'sqlclient',
    content: '编写 SELECT 查询 orders 表中 order_id=9905 的记录：',
    sqlTable: 'orders',
    sqlSchema:
      '-- orders(order_id, user_id, amount, status, paid_at, updated_at)\n-- status: PENDING | PAID | SHIPPED | COMPLETED | CANCELLED',
    sqlMustInclude: ['9905'],
    sqlResultRows: [
      {
        order_id: '9905',
        user_id: 'u30005',
        amount: '128.00',
        status: 'PAID',
        paid_at: '2026-06-29 09:10:00',
        updated_at: '2026-06-29 09:10:02',
      },
    ],
    correctQuery: "SELECT * FROM orders WHERE order_id = '9905'",
    sqlHint: 'SELECT * FROM orders WHERE order_id = …；看 status 是否卡在 PAID。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 168 },
  },
  {
    id: 170,
    sideArc: 'orderstuck',
    title: 'Redis 查发货锁',
    season: 'extra',
    isSideQuest: true,
    description:
      '【订单卡单 · 解锁于 #169 之后】DB 显示 PAID，开发怀疑发货分布式锁未释放。查 order:lock:9905 是否仍被占用。',
    simType: 'redis',
    content: '输入命令读取 order:lock:9905 的值：',
    redisHint: 'GET 键名',
    correctCommand: 'GET order:lock:9905',
    redisStore: {
      'order:lock:9905': 'worker-ship-03:held',
    },
    redisSuccessMsg: '锁仍被 worker-ship-03 持有——可能是消费端 crash 未释放，导致后续发货任务阻塞。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 169 },
  },
  {
    id: 171,
    sideArc: 'orderstuck',
    title: '死信队列找发货卡单',
    season: 'extra',
    isSideQuest: true,
    description:
      '【订单卡单 · 解锁于 #170 之后】DB 卡在 PAID，发货服务日志无新 ERROR。在 order 相关队列里找最该优先排查的消息。',
    simType: 'mqinbox',
    content: '选中【最应优先排查】的消息：',
    inboxMode: 'mq',
    mqMessages: [
      {
        id: 'a',
        routingKey: 'order.created',
        time: '09:08:55',
        payload: '{"orderId":"9905","status":"PENDING","amount":128.00}',
      },
      {
        id: 'b',
        routingKey: 'order.paid',
        time: '09:10:02',
        payload: '{"orderId":"9905","status":"PAID","amount":128.00}',
      },
      {
        id: 'c',
        routingKey: 'order.ship.dlq',
        time: '09:12:44',
        payload:
          '{"orderId":"9905","status":"PAID","reason":"ship service timeout","retry":"max exceeded"}',
      },
    ],
    correctMessageId: 'c',
    mqHint: 'PAID 长时间不变 → 查 order.ship.dlq 死信，别盯 order.created 的 PENDING。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 170 },
  },
]

export const orderStuckQuestArc = {
  id: 'orderstuck',
  name: '订单卡单 · 选修',
  icon: '📦',
  tagline: '状态机、SQL、Redis 锁、MQ 死信——PAID 但不出货排查链',
}
