import { getPhaseForLevel } from '../data/phases'
import { getLevelById } from './levelRegistry'
import { simTypeLabels } from '../data/levels'

/** simType → 百科向术语标签（游戏 + 教学） */
const SIM_GLOSSARY_TAGS = {
  jira: ['Bug 单', 'Blocker'],
  terminal: ['grep', '回归'],
  checklist: ['测试点', '黑盒'],
  template: ['用例', '等价类'],
  apiclient: ['接口测试', 'HTTP'],
  report: ['冒烟', '回归'],
  chat: ['协作排查'],
  config: ['环境配置'],
  clickcard: ['风险驱动'],
  calculator: ['缺陷密度'],
  packet: ['抓包'],
}

/**
 * 分享用「最近在练」上下文
 * @param {number|null} focusLevelId - 当前进行关或刚完成关
 */
export function getSharePracticeContext(focusLevelId) {
  const levelId = focusLevelId != null ? Number(focusLevelId) : null
  const level = levelId ? getLevelById(levelId) : null
  const phase = levelId ? getPhaseForLevel(levelId) : null

  if (!level || !phase) {
    return {
      phaseLabel: '备考',
      phaseIcon: '📚',
      levelLine: '从第 1 关圈 PRD 测试点开始',
      tags: ['黑盒', '测试点', 'PRD'],
    }
  }

  const simLabel = simTypeLabels[level.simType] || level.simType
  const tags = SIM_GLOSSARY_TAGS[level.simType] || [simLabel]
  const uniqueTags = [...new Set([simLabel, ...tags])].slice(0, 3)

  return {
    phaseLabel: phase.name,
    phaseIcon: phase.icon,
    levelLine: `#${level.id} ${level.title}`,
    tags: uniqueTags,
  }
}

export function formatPracticeLine(context) {
  const tags = context.tags.join(' · ')
  return `${context.phaseIcon} ${context.phaseLabel} · ${context.levelLine} · ${tags}`
}
