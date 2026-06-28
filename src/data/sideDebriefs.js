export const sideDebriefs = {
  101: {
    summary: '你圈出了 XSS 与注入相关的安全测试点。',
    why: '评论区是典型存储型 XSS 入口；要测输入过滤、输出编码及 SQL 注入防护。UI 样式不在安全冒烟范围。',
    pitfalls: '漏测存储型 XSS；只测反射不测持久化；把按钮颜色当安全项。',
    workplace: '安全冒烟：OWASP Top 10 前几条 + 业务敏感操作，首轮不必全量渗透。',
  },
  102: {
    summary: '你识别 Elasticsearch 920ms 为首要瓶颈。',
    why: '绝对耗时最大且占 P99 主导时，优先优化 ES 查询/索引，而不是 CDN 或缓存。',
    pitfalls: '被小耗时环节分散注意力；未结合占比判断。',
    workplace: '性能优化先找「最慢且最热」的调用，再考虑全链路微调。',
  },
  103: {
    summary: '你选对集成测试作为质量门禁关键节点。',
    why: '集成/回归阶段跑自动化 + 冒烟，能在进 staging 前拦住大部分缺陷。',
    pitfalls: '认为编译通过就够；把测试全部压到部署后。',
    workplace: '在流水线里为测试争取「集成回归」门禁，而不是事后补测。',
  },
  104: {
    summary: '你选择了核心链路真测 + 非核心 Mock 的折中策略。',
    why: '第三方支付不稳定时，完全 Mock 失去验证价值，完全真连又拖慢进度。分层策略最可持续。',
    pitfalls: '极端全 Mock 或全真实；没有不稳定时的降级方案。',
    workplace: '和开发对齐：哪些链路必须真连、哪些可 Mock、沙箱挂了怎么办。',
  },
  105: {
    summary: '你圈出了微信双端、弱网与分享链路等 H5 必测项。',
    why: '活动 H5 主战场是微信内置浏览器；分享卡片和弱网直接影响转化。IE6 和后台配色通常非首发重点。',
    pitfalls: '只测 Chrome 桌面；忽略分享回调；不测弱网首屏。',
    workplace: 'H5 兼容性矩阵：目标容器（微信/支付宝）× 系统 × 网络条件。',
  },
  106: {
    summary: '你选择了按风险选冒烟集的策略。',
    why: '3 小时跑不完 800 条时，改动点 + 核心流程 + 历史高频 Bug 区是理性选择。',
    pitfalls: '非全量不签字（教条）；开发测过直接放行（冒险）。',
    workplace: '压缩排期时用风险清单换签字，并明确补测时间与范围。',
  },
  107: {
    summary: '你选择了标准沙箱数据 + 脚本造异常的造数策略。',
    why: '支付联调需要可复现的标准账号/订单；异常场景靠脚本批量生成才可持续。',
    pitfalls: '随手测无文档；等开发给数据才开工。',
    workplace: '联调前向开发/运维要造数文档，自己维护一套最小测试数据集。',
  },
  108: {
    summary: '你优先升级了登录成功率下跌告警。',
    why: '核心链路指标持续恶化 > 单用户反馈 > 静态资源 404 > 测试环境磁盘。',
    pitfalls: '被单用户反馈带跑；忽略持续 15 分钟的核心指标。',
    workplace: '值班先看影响面 × 持续时间 × 是否核心链路。',
  },
  109: {
    summary: '你圈出了登录主流程与支付回调验签作为自动化优先项。',
    why: '高频稳定核心流程 + 高风险重复验证 ROI 最高；低频 UI 像素对比不值得先做。',
    pitfalls: '自动化从 UI 像素或低频报表开始；忽略支付验签。',
    workplace: '自动化 backlog 按：频率 × 风险 × 维护成本 排序。',
  },
}

export const dailyDebriefs = {
  'regression-mini': {
    summary: '你选了 FAIL + 高风险的推送相关用例。',
    why: '小版本改推送文案，必须回归失败项及同功能高风险用例。',
    pitfalls: '去测无关的低风险 PASS 项。',
    workplace: '每日回归前先问：这次 diff 影响了什么？',
  },
  'bug-title': {
    summary: '你选了含页面、现象、环境的规范标题。',
    why: '「页面有问题」无法定位；规范标题减少开发追问。',
    pitfalls: '标题过短或纯主观描述。',
    workplace: 'Bug 标题写「在哪 + 什么现象 + 环境/版本」。',
  },
  'density-calc': {
    summary: '缺陷密度 = 4 ÷ 80 × 100% = 5%。',
    why: '密度用于跨迭代对比测试有效性，不是 KPI 考核唯一指标。',
    pitfalls: '公式分子分母搞反；忘记乘百分比。',
    workplace: '复盘时结合密度 + 逃逸 Bug 看测试是否有效。',
  },
  'api-checklist': {
    summary: '你圈出了正常、缺参、业务异常与幂等场景。',
    why: '下单接口必须覆盖 happy path、参数校验、库存等业务规则及重复提交。',
    pitfalls: '只测 200；忽略幂等。',
    workplace: '接口用例从参数表推导，每个参数做缺/错/边界。',
  },
  'grep-daily': {
    summary: '你用 grep 从 error.log 筛出了 PAYMENT 相关记录。',
    why: '支付问题先 grep 业务关键字，比盲目 tail 更高效。',
    pitfalls: '路径错误；关键字大小写不匹配。',
    workplace: '日志排查：关键字 + 时间范围 + 关联 orderId。',
  },
  'chat-daily': {
    summary: '你的回复说明了 Blocker 影响并请求优先处理。',
    why: '催 Bug 要说严重级别、阻塞点、对上线的影响，而不是「在吗」。',
    pitfalls: '空泛催促；不说明业务影响。',
    workplace: '催修复 = 影响 + 阻塞 + 期望时间 + 可配合信息。',
  },
  'boundary-daily': {
    summary: '你写出 0 和 501 均应拒绝的预期。',
    why: '边界值测试要覆盖下界-1 和上界+1。',
    pitfalls: '把 0 当合法；501 写允许。',
    workplace: '金额/数量类字段：min-1, min, max, max+1 四件套。',
  },
  'severity-pick': {
    summary: 'Major 适用于核心功能受损但有绕过的场景。',
    why: 'Severity 看用户影响面，不是开发修起来难不难。',
    pitfalls: '一律 Blocker；功能受损却标 Trivial。',
    workplace: 'Blocker=不能用；Major=难用/受损；Critical 看团队定义。',
  },
  'env-config': {
    summary: 'API_BASE_URL 指向错误是测试环境 404 的常见原因。',
    why: '环境类问题先查 URL、网关、分支，再查代码。',
    pitfalls: '直接报 Bug 给开发；不核对配置。',
    workplace: '新环境第一天：配置清单逐项打勾。',
  },
  'case-priority': {
    summary: '你圈出了改动点、核心链路与历史缺陷区。',
    why: '时间不够时按风险排序，废弃模块可以明确跳过。',
    pitfalls: '随机抽 10 条；只测 happy path。',
    workplace: '压缩测试先写「必测清单」给 PM/开发对齐。',
  },
  'mock-strategy': {
    summary: '你选了核心链路真测 + 非核心 Mock 的折中方案。',
    why: '沙箱不稳定时，完全 Mock 失去验证价值，完全停摆又耽误进度。',
    pitfalls: '极端全 Mock 或无限等待沙箱恢复。',
    workplace: '和开发对齐哪些链路必须真连、不稳定时如何降级。',
  },
  'schedule-calc': {
    summary: '3×30÷8÷5 = 2.25 天。',
    why: '排期要基于用例总量与有效执行速率，而不是拍脑袋。',
    pitfalls: '忘记除每天有效小时；单位搞错。',
    workplace: '估时留 buffer，并说明假设（执行速率、是否含回归）。',
  },
  'token-assert': {
    summary: '你写清了 200 状态码与 token 字段断言。',
    why: '登录成功至少断言 HTTP 200 与 token 存在且非空。',
    pitfalls: '只断言 200 不检查 body；token 为空也通过。',
    workplace: '接口断言写进用例，避免「能调通就算过」。',
  },
  'avatar-regression': {
    summary: '你选了头像相关 FAIL + 高风险项。',
    why: '小版本改什么测什么；无关 PASS 低风险可暂缓。',
    pitfalls: '全量回归或测无关模块。',
    workplace: '回归范围与 diff 绑定，写在报告里。',
  },
  'branch-hotfix': {
    summary: '你识别 hotfix/pay-callback 为应验证分支。',
    why: '线上问题修复通常在 hotfix/* 分支，测错分支等于白测。',
    pitfalls: '在 develop 或 feature 上验 hotfix。',
    workplace: '部署前确认分支名 + commit + 环境标签。',
  },
  'equiv-class': {
    summary: '你覆盖了有效类、长度边界与非法字符类。',
    why: '等价类划分减少冗余用例，又保证覆盖代表场景。',
    pitfalls: '漏边界；把 UI 当等价类。',
    workplace: '先划等价类再写用例，比随机凑场景高效。',
  },
  'retro-one': {
    summary: '你写出了一条可落地的技术/流程改进。',
    why: '复盘措施要可执行，便于跟踪闭环。',
    pitfalls: '写「加强测试」「提高意识」等空话。',
    workplace: '每条措施对应责任人与验收方式。',
  },
  'callback-chat-daily': {
    summary: '你提出先核对回调地址/配置并请求配合排查。',
    why: '回调问题先查 URL、网关、环境配置，再查代码。',
    pitfalls: '空泛说「支付有问题」；不给出可验证步骤。',
    workplace: '协作排查 = 你的假设 + 需要的日志/配置信息。',
  },
  'doc-update': {
    summary: '接口变更应同步更新用例与断言说明。',
    why: '文档/用例滞后会导致回归漏测新字段或新规则。',
    pitfalls: '只改代码不更新测试资产。',
    workplace: '接口变更 checklist：用例、自动化、通知下游。',
  },
  'blocker-judge': {
    summary: 'Blocker 未修复时不建议按原计划全量上线。',
    why: 'Blocker 定义为核心路径不可用或数据风险，未关不应放行。',
    pitfalls: '其他模块 PASS 就签字；相信「今晚一定修完」。',
    workplace: '发布决策写清 Blocker 清单与延期/裁剪方案。',
  },
}

export function getSideDebrief(levelId) {
  return sideDebriefs[levelId] || null
}

export function getDailyDebrief(dailyKey) {
  if (!dailyKey) return null
  const key = dailyKey.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  return dailyDebriefs[key] || null
}
