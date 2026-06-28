import { levelOrder } from './levels'
import { sideLevels } from './sideQuests'

function mainCompletedCount(completedLevelIds) {
  if (!Array.isArray(completedLevelIds)) return 0
  return completedLevelIds.filter((id) => id >= 1 && id <= 99 && levelOrder.includes(id)).length
}

function sideCompletedCount(completedLevelIds) {
  if (!Array.isArray(completedLevelIds)) return 0
  return sideLevels.filter((l) => completedLevelIds.includes(l.id)).length
}

export const achievements = [
  {
    id: 'first_step',
    icon: '👣',
    title: '第一步',
    desc: '完成任意 1 关',
    check: (s) => s.completedLevelIds.length >= 1,
  },
  {
    id: 'login_arc',
    icon: '🔐',
    title: '登录项目通关',
    desc: '完成登录模块 Day 1–5',
    check: (s) => [1, 2, 3, 4, 5].every((id) => s.completedLevelIds.includes(id)),
  },
  {
    id: 'first_perfect',
    icon: '⭐',
    title: '首秀满分',
    desc: '任意一关获得 ★★★',
    check: (s) => Object.values(s.levelMeta).some((m) => m.stars >= 3),
  },
  {
    id: 'star_collector',
    icon: '🌟',
    title: '星光收集者',
    desc: '累计获得 60 颗星级',
    check: (s) =>
      s.completedLevelIds.reduce((sum, id) => sum + (s.levelMeta[id]?.stars || 0), 0) >= 60,
  },
  {
    id: 'prepare_done',
    icon: '📚',
    title: '备考结业',
    desc: '完成备考阶段全部 8 关',
    check: (s) => [1, 2, 3, 4, 5, 16, 26, 17].every((id) => s.completedLevelIds.includes(id)),
  },
  {
    id: 'veteran',
    icon: '🏅',
    title: '测试老兵',
    desc: '主线 27 关全部通关',
    check: (s) => mainCompletedCount(s.completedLevelIds) >= 27,
  },
  {
    id: 'jira_tracker',
    icon: '🎫',
    title: '工单追踪者',
    desc: '提交 3 份 Jira Bug 单（关 3、8、22）',
    check: (s) => [3, 8, 22].every((id) => s.completedLevelIds.includes(id)),
  },
  {
    id: 'firefighter',
    icon: '🚒',
    title: '线上救火',
    desc: '完成线上值班项目（关 22–25）',
    check: (s) => [22, 23, 24, 25].every((id) => s.completedLevelIds.includes(id)),
  },
  {
    id: 'side_explorer',
    icon: '🎬',
    title: '番外开拓者',
    desc: '完成任意 1 个番外关',
    check: (s) => sideCompletedCount(s.completedLevelIds) >= 1,
  },
  {
    id: 'side_master',
    icon: '🏆',
    title: '番外全通',
    desc: `完成全部 ${sideLevels.length} 个番外关`,
    check: (s) => sideCompletedCount(s.completedLevelIds) >= sideLevels.length,
  },
  {
    id: 'daily_streak',
    icon: '📅',
    title: '每日打卡',
    desc: '每日特训连续完成 3 天',
    check: (s) => (s.dailyStreak || 0) >= 3,
  },
  {
    id: 'clean_login',
    icon: '✨',
    title: '滴水不漏',
    desc: '登录项目 Day 1–4 零失误通关',
    check: (s) =>
      [1, 2, 3, 4, 5].every((id) => s.completedLevelIds.includes(id)) &&
      [1, 2, 3, 4].every((id) => !(s.levelMistakes[id] > 0)),
  },
  {
    id: 'fire_drill',
    icon: '🧯',
    title: '绝处逢生',
    desc: '回归漏项后仍完成登录模块终面查日志',
    check: (s) => s.completedLevelIds.includes(5) && (s.levelMistakes[4] || 0) > 0,
  },
  {
    id: 'jira_craft',
    icon: '📝',
    title: '工单达人',
    desc: '任意 Jira 关以「优秀」质量提交',
    check: (s) =>
      [3, 8, 22].some((id) => s.completedLevelIds.includes(id) && s.levelMeta[id]?.jiraTier === 'excellent'),
  },
  {
    id: 'repro_first',
    icon: '🔍',
    title: '先复现再报单',
    desc: '登录 Day 3 在被测 App 中复现验证码 Bug',
    check: (s) => s.loginBugReproduced === true,
  },
  {
    id: 'callback_hunter',
    icon: '💳',
    title: '回调猎手',
    desc: '支付 Day 2 在 App 中复现到账通知缺失',
    check: (s) => s.paymentCallbackMiss === true,
  },
  {
    id: 'pay_repro',
    icon: '🧾',
    title: '支付先复现',
    desc: '支付 Day 3 在 App 中复现支付失败后再补工单',
    check: (s) => s.paymentErrorReproduced === true,
  },
  {
    id: 'apm_eye',
    icon: '📈',
    title: '链路鹰眼',
    desc: '订单 Day 2 在 APM 面板定位 MySQL 瓶颈',
    check: (s) => s.orderBottleneckIdentified === true,
  },
  {
    id: 'oncall_prod',
    icon: '🚨',
    title: '线上先复现',
    desc: '值班第 1 天在生产 App 复现 4G 登录慢',
    check: (s) => s.prodSlowReproduced === true,
  },
  {
    id: 'log_reader',
    icon: '📋',
    title: '日志先看一眼',
    desc: '值班 grep 关先阅 error.log 摘要',
    check: (s) => s.logReviewed === true,
  },
  {
    id: 'lead_graduate',
    icon: '🚀',
    title: '进阶结业',
    desc: '完成进阶线全部 6 关',
    check: (s) => [28, 29, 30, 31, 32, 33].every((id) => s.completedLevelIds.includes(id)),
  },
  {
    id: 'packet_pro',
    icon: '🔍',
    title: '抓包能手',
    desc: '完成任意抓包关卡（番外 113 或进阶 31）',
    check: (s) => [113, 31].some((id) => s.completedLevelIds.includes(id)),
  },
]

export function evaluateAchievements(state) {
  return achievements.filter((a) => a.check(state)).map((a) => a.id)
}

export function getAchievementById(id) {
  return achievements.find((a) => a.id === id) || null
}
