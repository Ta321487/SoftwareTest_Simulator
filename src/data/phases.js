import { getLevelById } from '../utils/levelRegistry'

export const phases = {
  prepare: {
    id: 'prepare',
    name: '备考',
    icon: '📚',
    subtitle: 'PRD、用例、Bug、回归、终面查日志、接口与边界值——把基本功练扎实',
    audience: '零基础想入行？从这里开始，像培训班作业一样练。',
    veteranLine: '谁还没被一段没原型的 PRD 折磨过。',
    levelIds: [1, 2, 3, 4, 5, 34, 35, 16, 26, 17, 36, 37, 38],
    debriefTipLabel: '备考提示',
  },
  interview: {
    id: 'interview',
    name: '面试',
    icon: '🎤',
    subtitle: '终面实操 + 上机配置 + HR 面 + 测试策略——现场能不能扛住',
    audience: '简历过了、HR 过了，最后一关看真本事。',
    veteranLine: '「你本地是好的啊」——这句话的含金量，懂的都懂。',
    levelIds: [6, 18, 19, 39, 40, 41],
    debriefTipLabel: '面试经验',
  },
  written: {
    id: 'written',
    name: '笔试',
    icon: '📝',
    subtitle: '部门卷：协作、工单、分支、日报、接口设计、计算与分析题',
    audience: 'Offer 前的摸底考，考的是测试思维不是背题。',
    veteranLine: '笔试里写日报，入职后天天写日报——闭环了。',
    levelIds: [7, 8, 9, 10, 20, 27, 21, 42],
    debriefTipLabel: '笔试要点',
  },
  onboard: {
    id: 'onboard',
    name: '入职',
    icon: '💼',
    subtitle: '订单模块 + 线上救火：估时、链路、灰度、Bug、升级、满月总结',
    audience: '工牌领到了，真实项目来了——老测试会边玩边笑。',
    veteranLine: 'P0 复盘写三条改进，写五条也行，别写「加强测试」就完事。',
    levelIds: [11, 12, 13, 14, 51, 15, 50, 43, 49, 44, 22, 23, 24, 25, 45, 46],
    debriefTipLabel: '职场老手说',
  },
  lead: {
    id: 'lead',
    name: '进阶',
    icon: '🚀',
    subtitle: '带新人、排期、抓包、跨团队——Senior 后的下一程',
    audience: '第一季全通后解锁（主线地图 · 进阶 Tab）。开始带人、做决策、扛跨团队质量。',
    veteranLine: '带人不只是改文档，是在别人踩坑之前把坑标出来。',
    levelIds: [28, 29, 30, 31, 32, 33, 47, 48],
    debriefTipLabel: 'Lead 笔记',
  },
}

export const phaseOrder = ['prepare', 'interview', 'written', 'onboard', 'lead']

export function getPhaseForLevel(levelId) {
  return Object.values(phases).find((phase) => phase.levelIds.includes(levelId)) || null
}

export function getPhaseStep(phase, levelId) {
  const index = phase.levelIds.indexOf(levelId)
  if (index < 0) return null
  return { index: index + 1, total: phase.levelIds.length }
}

export function getPhaseProgress(phase, completedLevelIds) {
  const done = phase.levelIds.filter((id) => completedLevelIds.includes(id)).length
  return { done, total: phase.levelIds.length }
}

export function getLevelTitle(levelId) {
  return getLevelById(levelId)?.title || ''
}
