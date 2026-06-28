/** 每日特训题库 — 按日期轮换 */
const DAILY_POOL = [
  {
    key: 'regression-mini',
    title: '今日：小版本回归',
    description: '【每日特训】消息中心 v1.2 只改了推送文案。选手测回归范围。',
    simType: 'report',
    content: '勾选【必须回归】的用例：',
    reportItems: [
      { id: 'a', title: '推送文案展示', status: 'fail', risk: 'high' },
      { id: 'b', title: '推送点击跳转', status: 'fail', risk: 'high' },
      { id: 'c', title: '消息列表分页', status: 'pass', risk: 'low' },
      { id: 'd', title: '设置页主题色', status: 'pass', risk: 'low' },
    ],
    correctSelections: ['a', 'b'],
    hint: '改了什么测什么；FAIL + 高风险优先，低风险 PASS 可暂缓。',
    xpReward: 12,
  },
  {
    key: 'bug-title',
    title: '今日：Bug 标题怎么写',
    description: '【每日特训】同事标题只写「页面有问题」。选出最规范的改写。',
    simType: 'clickcard',
    content: '点击【最规范的 Bug 标题】：',
    clickOptions: [
      { id: 'a', label: '页面有问题' },
      { id: 'b', label: '订单详情页点击「申请退款」无响应（Chrome 128）' },
      { id: 'c', label: '测试一下' },
    ],
    correctClick: 'b',
    hint: '好标题 = 页面/功能 + 现象 + 必要时加环境。',
    xpReward: 10,
  },
  {
    key: 'density-calc',
    title: '今日：缺陷密度速算',
    description: '【每日特训】迭代跑了 80 条用例，发现 4 个 Bug。算缺陷密度（%）。',
    simType: 'calculator',
    calculatorFormula: 'density',
    content: '填写缺陷密度（%，两位小数）：',
    calculatorFields: [
      { field: 'totalCases', label: '执行用例数', defaultValue: 80 },
      { field: 'bugsFound', label: '有效 Bug 数', defaultValue: 4 },
    ],
    correctResult: '5.00',
    hint: '缺陷密度 = Bug 数 ÷ 用例数 × 100%。',
    xpReward: 10,
  },
  {
    key: 'api-checklist',
    title: '今日：下单接口测什么',
    description: '【每日特训】POST /api/order 创建订单。圈出接口层必测项。',
    simType: 'checklist',
    content: '勾选【必须覆盖】的验证项：',
    checklistItems: [
      { id: 'a', label: '正常参数返回 201 + orderId' },
      { id: 'b', label: '缺 productId 返回 400' },
      { id: 'c', label: '库存不足返回业务错误码' },
      { id: 'd', label: '下单按钮圆角' },
      { id: 'e', label: '重复 submit 幂等性' },
    ],
    correctChecks: ['a', 'b', 'c', 'e'],
    hint: '接口测正常/缺参/业务异常/幂等；UI 不属于接口层。',
    xpReward: 12,
  },
  {
    key: 'grep-daily',
    title: '今日：日志关键字',
    description: '【每日特训】支付回调失败，从 error.log 筛 PAYMENT 相关 ERROR。',
    simType: 'terminal',
    content: '输入命令筛选日志：',
    terminalHint: 'grep 关键字 文件路径',
    correctCommand: 'grep PAYMENT /var/log/app/error.log',
    storyLogs: [
      '[ERROR] PAYMENT callback timeout orderId=8821',
      '[ERROR] PAYMENT sign verify failed',
      '[INFO] OrderService created order 8821',
    ],
    hint: 'grep + 关键字 + 路径；关键字用大写 PAYMENT 与日志一致。',
    xpReward: 12,
  },
  {
    key: 'chat-daily',
    title: '今日：催开发修 Bug',
    description: '【每日特训】Blocker 级 Bug 已提 2 天未动。在群里催进度。',
    simType: 'chat',
    content: '回复开发：说明 Bug 影响，并请求优先级处理。',
    chatGroup: '项目攻坚群',
    chatKeywords: ['Blocker', '阻塞', '优先', '上线', '影响', '修复', '协调'],
    chatMinKeywords: 2,
    chatMinLength: 18,
    chatStructure: 'escalation',
    chatHint: '说清严重程度和业务影响，请对方协调优先修复。',
    chatPlaceholder: '例：TEST-1025 是 Blocker，阻塞回归，影响周五上线…',
    xpReward: 12,
  },
  {
    key: 'boundary-daily',
    title: '今日：优惠券面额边界',
    description: '【每日特训】规则：面额 1–500 整数。写出边界场景预期。',
    simType: 'template',
    content: '填写边界场景的预期结果：',
    requirement: '面额必填；合法范围 1–500 整数',
    templateMinLength: 8,
    templateFields: [
      {
        field: 'case1',
        scenario: '面额 = 0',
        validationHint: '对照下界，0 是否合法？',
        fieldKeywords: ['不允许', '拒绝', '0', '错误', '范围'],
        fieldRejectKeywords: ['允许', '成功'],
      },
      {
        field: 'case2',
        scenario: '面额 = 501',
        validationHint: '对照上界，501 是否合法？',
        fieldKeywords: ['不允许', '拒绝', '501', '超', '错误'],
        fieldRejectKeywords: ['允许', '成功'],
      },
    ],
    hint: '0 和 501 都应拒绝；写清提示或报错。',
    xpReward: 12,
  },
  {
    key: 'severity-pick',
    title: '今日：严重程度怎么选',
    description: '【每日特训】用户无法登录但可绕过。选出最合理的 Severity。',
    simType: 'clickcard',
    content: '点击【最合适的严重程度】：',
    clickOptions: [
      { id: 'a', label: 'Trivial（ cosmetic ）' },
      { id: 'b', label: 'Major（核心功能受损，有临时绕过）' },
      { id: 'c', label: 'Blocker（全站不可用）' },
    ],
    correctClick: 'b',
    hint: '能绕过但仍严重影响核心功能 → Major；全站挂才 Blocker。',
    xpReward: 10,
  },
  {
    key: 'env-config',
    title: '今日：环境变量核对',
    description: '【每日特训】测试环境接口 404。配置里哪项最该先核对？',
    simType: 'clickcard',
    content: '点击【最应先核对】的配置：',
    clickOptions: [
      { id: 'a', label: 'API_BASE_URL 是否指向测试网关' },
      { id: 'b', label: 'IDE 主题颜色' },
      { id: 'c', label: '同事工位号' },
    ],
    correctClick: 'a',
    hint: '环境 404 先查 base URL / 网关 / 部署分支。',
    xpReward: 10,
  },
  {
    key: 'case-priority',
    title: '今日：用例优先级',
    description: '【每日特训】时间只够测 10 条。圈出必测项。',
    simType: 'checklist',
    content: '勾选【必须执行】的用例：',
    checklistItems: [
      { id: 'a', label: '本次需求改动点相关用例' },
      { id: 'b', label: '核心支付链路 happy path' },
      { id: 'c', label: '5 年前已废弃模块' },
      { id: 'd', label: '历史线上 Bug 同区域回归' },
    ],
    correctChecks: ['a', 'b', 'd'],
    hint: '改动点 + 核心链路 + 历史缺陷区；废弃模块可跳过。',
    xpReward: 12,
  },
]

export const DAILY_LEVEL_ID = 900

function dateSeed(dateStr) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getTodayDateStr(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function getDailyIndex(dateStr = getTodayDateStr()) {
  return dateSeed(dateStr) % DAILY_POOL.length
}

export function getTodayDailyChallenge(dateStr = getTodayDateStr()) {
  const template = DAILY_POOL[getDailyIndex(dateStr)]
  return {
    ...template,
    id: DAILY_LEVEL_ID,
    isDaily: true,
    season: 'daily',
    title: template.title,
    description: template.description.replace('【每日特训】', `【每日特训 · ${dateStr}】`),
    dailyKey: `${dateStr}-${template.key}`,
  }
}

export function isDailyQuestId(id) {
  return id === DAILY_LEVEL_ID
}

export function getDailyUnlockLevelId() {
  return 5
}
