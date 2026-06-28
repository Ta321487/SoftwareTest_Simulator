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
  {
    key: 'mock-strategy',
    title: '今日：沙箱挂了怎么办',
    description: '【每日特训】第三方支付沙箱又超时。选出最合理的测试策略。',
    simType: 'clickcard',
    content: '点击【最合理的策略】：',
    clickOptions: [
      { id: 'a', label: '全部 Mock，不再连沙箱' },
      { id: 'b', label: '核心支付链路真连沙箱，非核心 Mock，并记录不稳定窗口' },
      { id: 'c', label: '等沙箱好了再测，本周不提交报告' },
    ],
    correctClick: 'b',
    hint: '核心链路要有真实验证；全 Mock 或全停摆都不合理。',
    xpReward: 10,
  },
  {
    key: 'schedule-calc',
    title: '今日：测试排期速算',
    description: '【每日特训】3 个模块 × 30 条用例，每小时 8 条、每天 5 小时。算需要几天。',
    simType: 'calculator',
    calculatorFormula: 'schedule',
    content: '填写所需天数（两位小数）：',
    calculatorFields: [
      { field: 'modules', label: '模块数', defaultValue: 3 },
      { field: 'casesPerModule', label: '每模块用例数', defaultValue: 30 },
      { field: 'casesPerHour', label: '每小时执行条数', defaultValue: 8 },
      { field: 'hoursPerDay', label: '每天有效小时', defaultValue: 5 },
    ],
    correctResult: '2.25',
    hint: '总用例 ÷ 每小时条数 ÷ 每天小时 = 天数。',
    xpReward: 12,
  },
  {
    key: 'token-assert',
    title: '今日：登录成功断言',
    description: '【每日特训】POST /api/login 成功响应 200 + token。写出应断言要点。',
    simType: 'template',
    content: '填写成功登录时测试应断言的内容：',
    requirement: 'HTTP 200；body 含 token；token 非空',
    templateMinLength: 10,
    templateFields: [
      {
        field: 'case1',
        scenario: '登录成功样本 · HTTP 200',
        placeholder: '应断言 status=? body 哪些字段？',
        fieldKeywords: ['200', 'token'],
      },
    ],
    hint: '成功登录断言 status 200 + token 字段存在且非空。',
    xpReward: 12,
  },
  {
    key: 'avatar-regression',
    title: '今日：头像小改动回归',
    description: '【每日特训】个人中心只改了头像上传。自动化报告如下，选手测回归项。',
    simType: 'report',
    content: '勾选【必须回归】的用例：',
    reportItems: [
      { id: 'a', title: '头像上传与裁剪', status: 'fail', risk: 'high' },
      { id: 'b', title: '头像展示与刷新', status: 'fail', risk: 'high' },
      { id: 'c', title: '修改昵称', status: 'pass', risk: 'low' },
      { id: 'd', title: '关于页版本号', status: 'pass', risk: 'low' },
    ],
    correctSelections: ['a', 'b'],
    hint: '改了头像功能，FAIL + 高风险相关项必回归。',
    xpReward: 12,
  },
  {
    key: 'branch-hotfix',
    title: '今日：Hotfix 分支判断',
    description: '【每日特训】生产支付 Bug 需 hotfix。点选测试环境应部署的分支。',
    simType: 'clickcard',
    clickVariant: 'git',
    content: '点击【测试环境应验证的分支】：',
    clickOptions: [
      { id: 'a', label: 'feature/new-ui' },
      { id: 'b', label: 'hotfix/pay-callback-0428' },
      { id: 'c', label: 'develop' },
    ],
    correctClick: 'b',
    hint: 'Hotfix 分支名通常含 hotfix/ 且对应线上问题。',
    xpReward: 10,
  },
  {
    key: 'equiv-class',
    title: '今日：等价类划分',
    description: '【每日特训】密码规则 6–12 位字母数字。圈出必须覆盖的等价类。',
    simType: 'checklist',
    content: '勾选【必须设计】的用例类型：',
    checklistItems: [
      { id: 'a', label: '合法长度与字符（如 8 位字母数字）' },
      { id: 'b', label: '长度不足（5 位）' },
      { id: 'c', label: '长度超出（13 位）' },
      { id: 'd', label: '含非法字符（如 @）' },
      { id: 'e', label: '登录按钮颜色' },
    ],
    correctChecks: ['a', 'b', 'c', 'd'],
    hint: '有效类 + 长度边界 + 非法字符；UI 颜色不是功能等价类。',
    xpReward: 12,
  },
  {
    key: 'retro-one',
    title: '今日：一句话改进措施',
    description: '【每日特训】线上慢查询导致超时。写一条可落地的改进措施。',
    simType: 'template',
    templateMinLength: 12,
    content: '填写一条技术/流程改进措施：',
    templateFields: [
      {
        field: 'measure1',
        label: '改进措施',
        placeholder: '例如：慢 SQL 治理 + 索引优化 + 超时监控告警…',
        rows: 2,
        fieldKeywords: ['索引', 'SQL', '慢', '监控', '告警', '缓存', '连接池', '限流'],
      },
    ],
    hint: '写具体手段，别写「加强测试」。',
    xpReward: 10,
  },
  {
    key: 'callback-chat-daily',
    title: '今日：回调地址核对',
    description: '【每日特训】测试环境支付回调收不到。在群里写排查开场白。',
    simType: 'chat',
    chatGroup: '支付联调群',
    chatKeywords: ['回调', '地址', '配置', '环境', '日志', '核对', '网关'],
    chatMinKeywords: 2,
    chatMinLength: 20,
    chatStructure: 'collaboration',
    chatPlaceholder: '例：我先核对测试环境回调 URL 是否与配置中心一致…',
    content: '回复开发：说明先查什么，并请对方配合。',
    xpReward: 12,
  },
  {
    key: 'doc-update',
    title: '今日：该更新哪份文档',
    description: '【每日特训】接口字段变更上线前，选出测试最该更新的文档。',
    simType: 'clickcard',
    content: '点击【最该优先更新】的：',
    clickOptions: [
      { id: 'a', label: '接口用例与断言说明' },
      { id: 'b', label: '公司年会照片集' },
      { id: 'c', label: '工位绿植登记表' },
    ],
    correctClick: 'a',
    hint: '接口变更 → 用例、断言、回归范围要同步。',
    xpReward: 10,
  },
  {
    key: 'blocker-judge',
    title: '今日：能否上线',
    description: '【每日特训】支付 Blocker 未修复，其他模块 PASS。选出最合理的发布建议。',
    simType: 'clickcard',
    content: '点击【最合理的建议】：',
    clickOptions: [
      { id: 'a', label: '支付 Blocker 未关，不建议按原计划全量上线' },
      { id: 'b', label: '其他都过了，直接发' },
      { id: 'c', label: '开发说今晚修，不用测了' },
    ],
    correctClick: 'a',
    hint: 'Blocker 未修复不应按原计划发布；需评估延期或范围裁剪。',
    xpReward: 10,
  },
]

export const DAILY_POOL_SIZE = DAILY_POOL.length

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
