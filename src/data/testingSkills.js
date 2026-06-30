import { getLevelById } from '../utils/levelRegistry'
import { levelOrder } from './levels'

/** 能力分类（手札 · 我的能力 Tab） */
export const skillCategories = [
  { id: 'functional', name: '功能与用例', icon: '📋' },
  { id: 'defect', name: '缺陷与质量', icon: '🎫' },
  { id: 'env', name: '环境发布', icon: '⚙️' },
  { id: 'collab', name: '协作沟通', icon: '💬' },
  { id: 'api', name: '接口测试', icon: '🔌' },
  { id: 'ops', name: '线上运维', icon: '🖥️' },
  { id: 'strategy', name: '策略决策', icon: '🎯' },
  { id: 'lead', name: '带教管理', icon: '🚀' },
]

/** 能力目录：id → 展示文案 */
export const skillCatalog = {
  'prd-testpoints': {
    id: 'prd-testpoints',
    label: '我会从 PRD 圈测试点',
    icon: '📄',
    category: 'functional',
  },
  'testcase-expected': {
    id: 'testcase-expected',
    label: '我会补全用例预期',
    icon: '📋',
    category: 'functional',
  },
  'boundary-value': {
    id: 'boundary-value',
    label: '我会写边界值与等价类预期',
    icon: '📐',
    category: 'functional',
  },
  'state-machine': {
    id: 'state-machine',
    label: '我会判断状态机流转是否合理',
    icon: '🔀',
    category: 'functional',
  },
  'bug-report': {
    id: 'bug-report',
    label: '我会写可复现的 Bug 单',
    icon: '🎫',
    category: 'defect',
  },
  'bug-review': {
    id: 'bug-review',
    label: '我会批改不规范 Bug 单',
    icon: '✏️',
    category: 'defect',
  },
  'regression-scope': {
    id: 'regression-scope',
    label: '我会定回归测试范围',
    icon: '🔄',
    category: 'defect',
  },
  'env-config': {
    id: 'env-config',
    label: '我会配置并验证测试环境',
    icon: '⚙️',
    category: 'env',
  },
  'release-branch': {
    id: 'release-branch',
    label: '我会确认发布分支与环境一致',
    icon: '⎇',
    category: 'env',
  },
  'collab-chat': {
    id: 'collab-chat',
    label: '我会推动跨角色协作排查',
    icon: '💬',
    category: 'collab',
  },
  'escalate-risk': {
    id: 'escalate-risk',
    label: '我会在发布群升级阻塞风险',
    icon: '📢',
    category: 'collab',
  },
  'daily-report': {
    id: 'daily-report',
    label: '我会写模块测试日报',
    icon: '📊',
    category: 'collab',
  },
  'hr-interview': {
    id: 'hr-interview',
    label: '我会表达测试动机与优势',
    icon: '🎤',
    category: 'collab',
  },
  'api-checklist': {
    id: 'api-checklist',
    label: '我会圈接口必验维度',
    icon: '🔌',
    category: 'api',
  },
  'api-status': {
    id: 'api-status',
    label: '我会读懂 HTTP 状态码语义',
    icon: '🌐',
    category: 'api',
  },
  'api-assert': {
    id: 'api-assert',
    label: '我会写接口断言要点',
    icon: '✅',
    category: 'api',
  },
  'api-case-design': {
    id: 'api-case-design',
    label: '我会设计接口层用例场景',
    icon: '📝',
    category: 'api',
  },
  'packet-debug': {
    id: 'packet-debug',
    label: '我会用抓包定位回调问题',
    icon: '🔍',
    category: 'api',
  },
  'log-tail': {
    id: 'log-tail',
    label: '我会用 tail 查看日志',
    icon: '📜',
    category: 'ops',
  },
  'grep-log': {
    id: 'grep-log',
    label: '我会用 grep 筛选日志',
    icon: '🔎',
    category: 'ops',
  },
  'log-follow': {
    id: 'log-follow',
    label: '我会用 tail -f 实时跟踪日志',
    icon: '👁️',
    category: 'ops',
  },
  'oncall-triage': {
    id: 'oncall-triage',
    label: '我会按顺序响应线上告警',
    icon: '🚨',
    category: 'ops',
  },
  'prod-bug': {
    id: 'prod-bug',
    label: '我会提线上 Bug 单',
    icon: '🎧',
    category: 'ops',
  },
  estimate: {
    id: 'estimate',
    label: '我会评估测试工时',
    icon: '⏱️',
    category: 'strategy',
  },
  'perf-bottleneck': {
    id: 'perf-bottleneck',
    label: '我会从链路找性能瓶颈',
    icon: '📈',
    category: 'strategy',
  },
  'auto-select': {
    id: 'auto-select',
    label: '我会选型自动化框架',
    icon: '🤖',
    category: 'strategy',
  },
  'gray-metrics': {
    id: 'gray-metrics',
    label: '我会定灰度监控指标',
    icon: '📡',
    category: 'strategy',
  },
  'p0-review': {
    id: 'p0-review',
    label: '我会写 P0 复盘改进措施',
    icon: '🔥',
    category: 'strategy',
  },
  'test-strategy-time': {
    id: 'test-strategy-time',
    label: '我会在时间有限时排测试优先级',
    icon: '⏳',
    category: 'strategy',
  },
  'test-methodology': {
    id: 'test-methodology',
    label: '我会选择黑盒/白盒策略',
    icon: '🧠',
    category: 'strategy',
  },
  'defect-density': {
    id: 'defect-density',
    label: '我会算缺陷密度',
    icon: '🧮',
    category: 'strategy',
  },
  'schedule-calc': {
    id: 'schedule-calc',
    label: '我会算大版本测试排期',
    icon: '📅',
    category: 'strategy',
  },
  'security-audit': {
    id: 'security-audit',
    label: '我会圈安全审计必测项',
    icon: '🛡️',
    category: 'strategy',
  },
  'go-nogo': {
    id: 'go-nogo',
    label: '我会做 Go/No-Go 发布决策',
    icon: '🚦',
    category: 'strategy',
  },
  'review-cases': {
    id: 'review-cases',
    label: '我会 Review 新人用例',
    icon: '👀',
    category: 'lead',
  },
  'task-assign': {
    id: 'task-assign',
    label: '我会分派测试任务与交付标准',
    icon: '📌',
    category: 'lead',
  },
  'month-summary': {
    id: 'month-summary',
    label: '我会写阶段性工作总结',
    icon: '📖',
    category: 'lead',
  },
}

/**
 * 主线关卡 → 能力（spiralFrom 表示与哪关同一类判断的进阶复现）
 */
export const levelSkillEntries = [
  { levelId: 1, skillId: 'prd-testpoints' },
  { levelId: 2, skillId: 'testcase-expected' },
  { levelId: 3, skillId: 'bug-report' },
  { levelId: 4, skillId: 'regression-scope' },
  { levelId: 5, skillId: 'log-tail' },
  { levelId: 6, skillId: 'env-config' },
  { levelId: 7, skillId: 'collab-chat' },
  {
    levelId: 8,
    skillId: 'bug-review',
    spiralFrom: 3,
    spiralHint: '帮新人补全 Bug 单，标准和你第 3 关自己写的一样。',
  },
  { levelId: 9, skillId: 'release-branch' },
  { levelId: 10, skillId: 'daily-report' },
  { levelId: 11, skillId: 'estimate' },
  { levelId: 12, skillId: 'perf-bottleneck' },
  { levelId: 13, skillId: 'auto-select' },
  { levelId: 14, skillId: 'gray-metrics' },
  { levelId: 15, skillId: 'p0-review' },
  { levelId: 16, skillId: 'api-checklist' },
  { levelId: 17, skillId: 'boundary-value' },
  { levelId: 18, skillId: 'hr-interview' },
  { levelId: 19, skillId: 'test-strategy-time' },
  { levelId: 20, skillId: 'defect-density' },
  {
    levelId: 21,
    skillId: 'regression-scope',
    spiralFrom: 4,
    spiralHint: '小版本改头像上传，仍是「改动面 + 高风险 FAIL 优先」。',
  },
  { levelId: 22, skillId: 'prod-bug' },
  {
    levelId: 23,
    skillId: 'grep-log',
    spiralFrom: 5,
    spiralHint: '上线救火：先 tail 看概况，再 grep 精筛 ERROR。',
  },
  { levelId: 24, skillId: 'escalate-risk' },
  { levelId: 25, skillId: 'month-summary' },
  {
    levelId: 26,
    skillId: 'api-assert',
    spiralFrom: 16,
    spiralHint: '上次圈了接口维度，这次对着真实响应写断言。',
  },
  { levelId: 27, skillId: 'api-case-design' },
  { levelId: 28, skillId: 'review-cases' },
  {
    levelId: 29,
    skillId: 'bug-review',
    spiralFrom: 8,
    spiralHint: '从「自己写单」到「帮实习生改单」——Lead 的日常。',
  },
  {
    levelId: 30,
    skillId: 'schedule-calc',
    spiralFrom: 11,
    spiralHint: '和第 11 关一样用数字说话，只是规模变成大版本排期。',
  },
  { levelId: 31, skillId: 'packet-debug' },
  { levelId: 32, skillId: 'security-audit' },
  { levelId: 33, skillId: 'go-nogo' },
  {
    levelId: 34,
    skillId: 'prd-testpoints',
    spiralFrom: 1,
    spiralHint: '验证码 PRD 补充，仍是圈必测维度——别漏锁定与过期。',
  },
  {
    levelId: 35,
    skillId: 'testcase-expected',
    spiralFrom: 2,
    spiralHint: '锁定/解锁场景补预期，和第 2 关补用例表同一套路。',
  },
  {
    levelId: 36,
    skillId: 'boundary-value',
    spiralFrom: 17,
    spiralHint: '手机号等价类，边界值思维的换题复现。',
  },
  {
    levelId: 37,
    skillId: 'api-status',
    spiralFrom: 16,
    spiralHint: '接口层：密码错该返回什么 HTTP 码。',
  },
  {
    levelId: 38,
    skillId: 'security-audit',
    spiralFrom: 32,
    spiralHint: '登录接口上线前的安全必测清单。',
  },
  {
    levelId: 39,
    skillId: 'hr-interview',
    spiralFrom: 18,
    spiralHint: '终面自我介绍，仍是讲清楚为什么做测试。',
  },
  { levelId: 40, skillId: 'test-methodology' },
  {
    levelId: 41,
    skillId: 'test-strategy-time',
    spiralFrom: 19,
    spiralHint: '800 条用例 2 小时跑不完——冒烟策略与限时排期同一类判断。',
  },
  {
    levelId: 42,
    skillId: 'api-case-design',
    spiralFrom: 27,
    spiralHint: '支付回调：除「能收到通知」外的必测维度。',
  },
  { levelId: 43, skillId: 'state-machine' },
  {
    levelId: 44,
    skillId: 'api-assert',
    spiralFrom: 26,
    spiralHint: '订单查询接口：200 与 404 两场景的断言要点。',
  },
  { levelId: 45, skillId: 'oncall-triage' },
  {
    levelId: 46,
    skillId: 'log-follow',
    spiralFrom: 23,
    spiralHint: 'grep 之后切 tail -f，实时盯用户复现时的 ERROR。',
  },
  { levelId: 47, skillId: 'task-assign' },
  {
    levelId: 48,
    skillId: 'go-nogo',
    spiralFrom: 33,
    spiralHint: '压测报告拍板：核心链路指标超标时 No-Go。',
  },
]

const levelSkillById = new Map(levelSkillEntries.map((e) => [e.levelId, e]))

export const MAINLINE_SKILL_COUNT = new Set(levelSkillEntries.map((e) => e.skillId)).size

export function getLevelSkillEntry(levelId) {
  return levelSkillById.get(Number(levelId)) || null
}

export function getSkillDefinition(skillId) {
  return skillCatalog[skillId] || null
}

export function getSkillForLevel(levelId) {
  const entry = getLevelSkillEntry(levelId)
  if (!entry) return null
  const def = getSkillDefinition(entry.skillId)
  if (!def) return null
  return {
    ...def,
    levelId: entry.levelId,
    spiralFrom: entry.spiralFrom,
    spiralHint: entry.spiralHint,
  }
}

export function getSpiralNote(levelId) {
  const entry = getLevelSkillEntry(levelId)
  if (!entry?.spiralFrom) return null
  const prefix = `这和第 ${entry.spiralFrom} 关是同一类判断`
  return entry.spiralHint ? `${prefix}——${entry.spiralHint}` : `${prefix}，只是场景换了。`
}

export function getSkillCategory(categoryId) {
  return skillCategories.find((c) => c.id === categoryId) || null
}

/** 已解锁能力（按 levelOrder 首次通关顺序） */
export function getUnlockedSkills(completedLevelIds = []) {
  const done = new Set(completedLevelIds)
  const bySkill = new Map()

  for (const levelId of levelOrder) {
    if (!done.has(levelId)) continue
    const entry = getLevelSkillEntry(levelId)
    if (!entry) continue
    const def = getSkillDefinition(entry.skillId)
    if (!def) continue

    const existing = bySkill.get(entry.skillId)
    const source = {
      levelId: entry.levelId,
      title: getLevelById(entry.levelId)?.title || `#${entry.levelId}`,
      spiralFrom: entry.spiralFrom,
    }

    if (existing) {
      existing.sourceLevels.push(source)
    } else {
      bySkill.set(entry.skillId, {
        ...def,
        firstLevelId: entry.levelId,
        sourceLevels: [source],
      })
    }
  }

  return [...bySkill.values()]
}

export function getSkillProgress(completedLevelIds = []) {
  const unlocked = getUnlockedSkills(completedLevelIds)
  return {
    done: unlocked.length,
    total: MAINLINE_SKILL_COUNT,
    percent: MAINLINE_SKILL_COUNT ? Math.round((unlocked.length / MAINLINE_SKILL_COUNT) * 100) : 0,
    skills: unlocked,
  }
}

/** 按分类分组，含未解锁占位 */
export function getSkillsByCategory(completedLevelIds = []) {
  const unlocked = getUnlockedSkills(completedLevelIds)
  const unlockedIds = new Set(unlocked.map((s) => s.id))

  return skillCategories.map((cat) => {
    const allInCat = Object.values(skillCatalog).filter((s) => s.category === cat.id)
    const unlockedInCat = unlocked.filter((s) => s.category === cat.id)
    return {
      ...cat,
      total: allInCat.length,
      done: unlockedInCat.length,
      skills: allInCat.map((skill) => ({
        ...skill,
        unlocked: unlockedIds.has(skill.id),
        detail: unlocked.find((u) => u.id === skill.id) || null,
      })),
    }
  })
}
