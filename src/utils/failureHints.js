import { debriefs } from '../data/debriefs'

function diffChecklist(selected, correct, items) {
  const missed = correct.filter((id) => !selected.includes(id))
  const extra = selected.filter((id) => !correct.includes(id))
  const label = (id) => items.find((i) => i.id === id)?.label || id

  const parts = []
  if (missed.length) {
    parts.push(`漏选：${missed.map(label).join('；')}`)
  }
  if (extra.length) {
    parts.push(`多选：${extra.map(label).join('；')}（多为干扰项）`)
  }
  return parts.join('。')
}

function diffReport(selected, correct, items) {
  const missed = correct.filter((id) => !selected.includes(id))
  const extra = selected.filter((id) => !correct.includes(id))
  const label = (id) => items.find((i) => i.id === id)?.title || id

  const parts = []
  if (missed.length) {
    parts.push(`应回归但未选：${missed.map(label).join('、')}`)
  }
  if (extra.length) {
    parts.push(`不必优先回归：${extra.map(label).join('、')}`)
  }
  return parts.join('。')
}

export function getFailureHint(level, data, result) {
  const debrief = debriefs[level.id]
  const pitfall = debrief?.pitfalls

  switch (level.simType) {
    case 'checklist': {
      const detail = diffChecklist(
        data.selected || [],
        level.correctChecks || [],
        level.checklistItems || []
      )
      return detail || pitfall || result.message
    }
    case 'apiclient': {
      if (level.checklistItems?.length) {
        const detail = diffChecklist(
          data.selected || [],
          level.correctChecks || [],
          level.checklistItems || []
        )
        return detail || pitfall || result.message
      }
      return pitfall ? `${result.message} 提示：${pitfall}` : result.message
    }
    case 'report': {
      const detail = diffReport(
        data.selected || [],
        level.correctSelections || [],
        level.reportItems || []
      )
      return detail || pitfall || result.message
    }
    case 'clickcard': {
      const picked = level.clickOptions?.find((o) => o.id === data.selected)
      return picked
        ? `你选了「${picked.label}」。${pitfall || '请结合场景中的数据与环境背景重新分析。'}`
        : pitfall || result.message
    }
    case 'jira':
      return pitfall
        ? `${result.message} 常见坑：${pitfall}`
        : result.message
    case 'template':
    case 'chat':
    case 'terminal':
    case 'config':
    case 'calculator':
      return pitfall ? `${result.message} 提示：${pitfall}` : result.message
    default:
      return result.message
  }
}

export function getLevelHint(level) {
  if (level.hint) return level.hint

  const debrief = debriefs[level.id]
  if (debrief?.workplace) return debrief.workplace

  switch (level.simType) {
    case 'template':
      return level.templateFields?.[0]?.validationHint || level.fillHint || ''
    case 'jira':
      return 'Bug 单要让开发不用找你就能复现：标题说清现象，步骤分步写，预期/实际分开写。'
    case 'report':
      return '优先选 FAIL + 高风险的用例；低风险 PASS 项可暂缓。'
    case 'checklist':
      return '优先选功能性、边界、异常、安全相关项；UI 审美类通常是干扰项。'
    case 'apiclient':
      if (level.checklistItems?.length) {
        return level.hint || '优先选 HTTP 层验证项：状态码、响应体、响应头、异常场景；UI 细节是干扰项。'
      }
      return level.templateFields?.[0]?.validationHint || level.fillHint || ''
    default:
      return ''
  }
}
