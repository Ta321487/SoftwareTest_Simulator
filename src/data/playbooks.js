/** 手札 · 套路卡：可复用的检查清单与流程 */

export const playbookCategories = [
  { id: 'defect', name: '缺陷与工单', icon: '🎫' },
  { id: 'oncall', name: '值班排查', icon: '🚨' },
  { id: 'api', name: '接口测试', icon: '🔌' },
  { id: 'release', name: '发布回归', icon: '🚀' },
]

export const playbooks = [
  {
    id: 'bug-report',
    title: 'Bug 单怎么写',
    category: 'defect',
    icon: '🎫',
    summary: '让开发不用找你也能复现：标题含页面+现象，步骤可执行，预期≠实际。',
    steps: [
      '标题：页面/功能 + 具体现象（必要时加环境/网络）',
      '模块：与现象一致（登录/支付/订单/个人中心）',
      '步骤：分步写操作路径，每步一行，附测试账号',
      '预期：正常情况下应出现什么',
      '实际：你观察到的现象（含量化数据更好）',
      '严重度：按用户影响面选 Blocker/Critical/Major/Trivial',
    ],
    relatedTermIds: ['bug', 'blocker', 'major'],
    relatedLevelIds: [3, 8, 22, 114, 122],
  },
  {
    id: 'oncall-triage',
    title: 'On-call 前 15 分钟',
    category: 'oncall',
    icon: '🚨',
    summary: '告警响了别慌：先确认是否仍在发生，再看变更与日志，最后尝试复现。',
    steps: [
      '确认告警是否持续（非误报/已自动恢复）',
      '查最近发布、配置变更、依赖故障公告',
      '看核心指标曲线 + grep/tail 错误日志',
      '在测试/预发尝试复现（能复现再报单）',
      '评估影响面：核心链路？多少用户？',
      '需要升级时：阻塞点 + 风险 + 需要谁做什么',
    ],
    relatedTermIds: ['gray-box', 'p99'],
    relatedLevelIds: [5, 23, 45, 46, 108, 115],
  },
  {
    id: 'api-smoke',
    title: '接口冒烟 8 项',
    category: 'api',
    icon: '🔌',
    summary: '新接口或发版前过一遍：正常、缺参、错参、鉴权、限流、协议、幂等、错误信息。',
    steps: [
      'Happy path：合法参数 → 正确 status + body 关键字段',
      '缺参：逐个去掉必填字段 → 400 + 明确 message',
      '错参：类型/格式/边界非法 → 拒绝 + 提示',
      '鉴权：未登录 / 过期 token / 越权 → 401 或 403',
      '限流：高频重复请求 → 429 或业务限流码',
      'Content-Type：非 JSON 或缺失 → 正确处理',
      '幂等：重复提交（支付/下单）→ 状态不重复变更',
      '错误信息：不泄露敏感内部细节',
    ],
    relatedTermIds: ['api-test', 'http-status'],
    relatedLevelIds: [16, 26, 27, 44, 120],
  },
  {
    id: 'regression-scope',
    title: '回归范围怎么圈',
    category: 'release',
    icon: '🎯',
    summary: '时间不够时：改动点 + FAIL 项 + 高风险 + 核心链路，其余写清暂缓理由。',
    steps: [
      '先看 diff：本次改了哪些模块/接口/页面',
      '自动化/手工报告：FAIL + high risk 必纳入',
      '与修复 Bug 同模块的其他 FAIL 项一并回归',
      '核心公共流程（登录/支付/下单）抽测即使 PASS',
      '低风险 PASS 可暂缓，但要在报告里写明',
      '输出：必测清单 + 暂缓清单 + 补测时间',
    ],
    relatedTermIds: ['regression', 'smoke', 'risk-driven'],
    relatedLevelIds: [4, 21, 41, 42, 106, 117, 121],
  },
  {
    id: 'env-checklist',
    title: '新环境第一天',
    category: 'release',
    icon: '⚙️',
    summary: '环境不通后面全白测。配置、分支、回调 URL、DB 连通逐项打勾。',
    steps: [
      '配置中心 / .env：API 地址、DB Host、回调 notify URL',
      '点「测试连接」或跑一条冒烟接口验证',
      '确认部署分支与 Jira/发布单一致',
      '支付/第三方：沙箱账号与文档是否到位',
      '日志路径、SSH 权限、监控大盘是否可访问',
      '把核对结果发给开发/运维留痕',
    ],
    relatedTermIds: ['cicd', 'callback'],
    relatedLevelIds: [6, 9, 119],
  },
  {
    id: 'payment-debug',
    title: '支付联调三板斧',
    category: 'api',
    icon: '💳',
    summary: '付了款但订单不更新：抓包看回调 → 对配置 → 查网关日志。',
    steps: [
      '确认支付发起是否 200（创建/预下单成功）',
      '抓包查回调 notify：Host 是否测试环境、status 是否 2xx',
      '核对 PAY_CALLBACK_URL / notify 配置与当前环境',
      'grep 回调相关 ERROR + 对 orderId 查业务库状态',
      '排查重试队列：网关成功但业务库延迟落库',
      '企微协作：说明已查项 + 请开发配合看什么',
    ],
    relatedTermIds: ['callback', 'api-test'],
    relatedLevelIds: [7, 8, 31, 42, 113, 111],
  },
  {
    id: 'pm-escalation',
    title: '升级 PM 怎么说',
    category: 'defect',
    icon: '📣',
    summary: '对 PM 说人话：什么卡住了、对上线有什么影响、需要谁协调。',
    steps: [
      '阻塞项：哪个 Bug/依赖还没好',
      '影响：能否按时上线？核心功能是否可用？',
      '风险：若强行发布会怎样（资金/数据/用户体验）',
      '建议：延期 / 裁剪 scope / 加资源 / 热修复',
      '需要决策：请 PM 拍板并协调开发优先级',
      '留痕：群里或邮件写清，避免口头扯皮',
    ],
    relatedTermIds: ['blocker', 'go-nogo'],
    relatedLevelIds: [24, 117],
  },
  {
    id: 'log-grep',
    title: '日志排查口诀',
    category: 'oncall',
    icon: '📋',
    summary: '单号 → 时间窗 → 关键字；需要上下文用 grep -C，持续观察用 tail -f。',
    steps: [
      '单笔问题：先用 orderId / userId grep 精确定位',
      '批量超时/错误率：grep ERROR 或业务关键字聚合',
      '需要上下文：grep -C 3 ERROR /path/error.log',
      '看最新：tail -n 100 /path/error.log',
      '持续观察：tail -f /path/error.log',
      '对照 APM/traceId 与业务现象交叉验证',
    ],
    relatedTermIds: ['gray-box', 'apm'],
    relatedLevelIds: [5, 23, 46, 115],
  },
]

export function getPlaybook(id) {
  return playbooks.find((p) => p.id === id) || null
}

export function getPlaybookCategory(categoryId) {
  return playbookCategories.find((c) => c.id === categoryId) || null
}
