import { phases } from './phases'

const MILESTONES = {
  prepare: {
    title: '备考阶段结业',
    icon: '📚',
    message: 'PRD、用例、Bug、回归、日志——基本功已练完。下一章：面试现场。',
  },
  interview: {
    title: '面试阶段通过',
    icon: '🎤',
    message: '终面实操、环境配置、HR 面都扛过来了。下一章：部门笔试。',
  },
  written: {
    title: '笔试阶段通关',
    icon: '📝',
    message: '协作、工单、分支、日报、接口题——Offer 在望。下一章：正式入职。',
  },
  onboard: {
    title: '入职第一季完结',
    icon: '💼',
    message: '订单模块与线上值班都经历了。第一季全通后可解锁进阶线。',
  },
  lead: {
    title: '进阶线结业',
    icon: '🚀',
    message: '带人、排期、抓包、跨团队决策——测试 Lead 线通关。恭喜毕业！',
  },
}

export function isPhaseFinaleLevel(phaseId, levelId) {
  const phase = phases[phaseId]
  if (!phase?.levelIds?.length) return false
  return phase.levelIds[phase.levelIds.length - 1] === levelId
}

export function getPhaseMilestone(phaseId) {
  return MILESTONES[phaseId] || null
}

export function getPhaseMilestoneForLevel(levelId) {
  const phase = Object.values(phases).find((p) => p.levelIds.includes(levelId))
  if (!phase || !isPhaseFinaleLevel(phase.id, levelId)) return null
  return getPhaseMilestone(phase.id)
}
