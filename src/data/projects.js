export const projects = {
  'login-module': {
    id: 'login-module',
    name: '登录模块',
    subtitle: '新人营 · 登录模块从读需求到上线排障',
    levelIds: [1, 2, 3, 4, 5, 34, 35],
    days: [
      { levelId: 1, label: 'Day 1', title: '接 PRD，圈测试点' },
      { levelId: 2, label: 'Day 2', title: '补全测试用例' },
      { levelId: 3, label: 'Day 3', title: '提交 Bug 单' },
      { levelId: 4, label: 'Day 4', title: '定回归范围' },
      { levelId: 5, label: 'Day 5', title: '上线查日志' },
      { levelId: 34, label: 'Day 6', title: '验证码圈测试点' },
      { levelId: 35, label: 'Day 7', title: '锁定解锁场景' },
    ],
  },
  'payment-module': {
    id: 'payment-module',
    name: '支付模块',
    subtitle: '部门笔试 · 协作、工单、发布与日报',
    levelIds: [6, 7, 8, 9, 10],
    days: [
      { levelId: 6, label: 'Day 1', title: '接入测试环境' },
      { levelId: 7, label: 'Day 2', title: '协作排查回调' },
      { levelId: 8, label: 'Day 3', title: '补全 Bug 单' },
      { levelId: 9, label: 'Day 4', title: '确认发布分支' },
      { levelId: 10, label: 'Day 5', title: '提交工作日报' },
    ],
  },
  'order-module': {
    id: 'order-module',
    name: '订单模块',
    subtitle: '订单组 · 第一至二周真实项目',
    levelIds: [11, 12, 13, 14, 15, 43, 44],
    days: [
      { levelId: 11, label: 'Day 1', title: '评估测试工时' },
      { levelId: 12, label: 'Day 2', title: '定位性能瓶颈' },
      { levelId: 13, label: 'Day 3', title: '自动化框架选型' },
      { levelId: 14, label: 'Day 4', title: '灰度监控指标' },
      { levelId: 15, label: 'Day 5', title: 'P0 事故复盘' },
      { levelId: 43, label: 'Day 6', title: '订单状态机' },
      { levelId: 44, label: 'Day 7', title: '订单接口断言' },
    ],
  },
  'onboard-week2': {
    id: 'onboard-week2',
    name: '线上值班',
    subtitle: 'On-call · 第二周线上救火',
    levelIds: [22, 23, 24, 25, 45, 46],
    days: [
      { levelId: 22, label: 'Day 6', title: '线上 Bug 单' },
      { levelId: 23, label: 'Day 7', title: 'grep 查日志' },
      { levelId: 24, label: 'Day 8', title: '升级 PM' },
      { levelId: 25, label: 'Day 9', title: '满月总结' },
      { levelId: 45, label: 'Day 10', title: '告警响应排查' },
      { levelId: 46, label: 'Day 11', title: '实时跟踪日志' },
    ],
  },
  'season2-lead': {
    id: 'season2-lead',
    name: '测试 Lead 线',
    subtitle: 'Lead 线 · 带人、排期与跨团队',
    levelIds: [28, 29, 30, 31, 32, 33, 47, 48],
    days: [
      { levelId: 28, label: 'Week 1', title: 'Review 新人用例' },
      { levelId: 29, label: 'Week 1', title: '批改 Bug 单' },
      { levelId: 30, label: 'Week 2', title: '大版本排期' },
      { levelId: 31, label: 'Week 2', title: '抓包定位回调' },
      { levelId: 32, label: 'Week 3', title: '安全联合审计' },
      { levelId: 33, label: 'Week 3', title: '大促 Go/No-Go' },
      { levelId: 47, label: 'Week 4', title: '分派测试任务' },
      { levelId: 48, label: 'Week 4', title: '压测报告拍板' },
    ],
  },
}

export const dockApps = {
  checklist: { id: 'wiki', icon: '📄', label: '飞书文档', shortLabel: 'PRD' },
  template: { id: 'testcase', icon: '📋', label: '用例库', shortLabel: '用例' },
  apiclient: { id: 'api', icon: '🔌', label: 'API 调试', shortLabel: 'API' },
  jira: { id: 'jira', icon: '🎫', label: 'Jira', shortLabel: 'Jira' },
  report: { id: 'report', icon: '📊', label: '测试报告', shortLabel: '报告' },
  terminal: { id: 'terminal', icon: '💻', label: 'SSH 终端', shortLabel: '终端' },
  sqlclient: { id: 'sql', icon: '🗄️', label: 'SQL 客户端', shortLabel: 'SQL' },
  redis: { id: 'redis', icon: '🔴', label: 'Redis CLI', shortLabel: 'Redis' },
  cipipeline: { id: 'ci', icon: '🔄', label: 'CI 流水线', shortLabel: 'CI' },
  mockserver: { id: 'mock', icon: '🎭', label: 'Mock 服务', shortLabel: 'Mock' },
  apmtrace: { id: 'apm', icon: '📈', label: 'APM 链路', shortLabel: 'APM' },
  gitrelease: { id: 'git', icon: '⎇', label: 'Git 发布', shortLabel: 'Git' },
  mqinbox: { id: 'mq', icon: '📨', label: '消息队列', shortLabel: 'MQ' },
  chat: { id: 'chat', icon: '💬', label: '企业微信', shortLabel: '企微' },
  config: { id: 'config', icon: '⚙️', label: '配置中心', shortLabel: '配置' },
  clickcard: { id: 'decision', icon: '🎯', label: '决策板', shortLabel: '决策' },
  calculator: { id: 'calc', icon: '🧮', label: '工时计算', shortLabel: '计算' },
  packet: { id: 'packet', icon: '🔍', label: 'Charles 抓包', shortLabel: '抓包' },
  loginapp: { id: 'app', icon: '📱', label: '被测 App', shortLabel: 'App' },
  paymentapp: { id: 'payapp', icon: '💳', label: '支付 App', shortLabel: '支付' },
  orderobs: { id: 'obs', icon: '📈', label: 'APM / 监控', shortLabel: '监控' },
  oncall: { id: 'oncall', icon: '🚨', label: '值班面板', shortLabel: '值班' },
  leadboard: { id: 'lead', icon: '🎯', label: 'Lead 看板', shortLabel: '看板' },
}

export function getProjectForLevel(levelId) {
  return Object.values(projects).find((p) => p.levelIds.includes(levelId)) || null
}

export function getProjectDay(project, levelId) {
  return project?.days?.find((d) => d.levelId === levelId) || null
}

export function getDockShortLabel(simType, levelId) {
  if (simType === 'clickcard' && levelId === 12) return '链路'
  if (simType === 'clickcard' && levelId === 13) return '选型'
  return dockApps[simType]?.shortLabel
}
