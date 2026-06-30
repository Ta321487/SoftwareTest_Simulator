import { debriefs, getDebrief } from '../data/debriefs'

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
      return detail || pitfall || ''
    }
    case 'apiclient': {
      if (level.checklistItems?.length) {
        const detail = diffChecklist(
          data.selected || [],
          level.correctChecks || [],
          level.checklistItems || []
        )
        return detail || pitfall || ''
      }
      return pitfall || ''
    }
    case 'report': {
      const detail = diffReport(
        data.selected || [],
        level.correctSelections || [],
        level.reportItems || []
      )
      return detail || pitfall || ''
    }
    case 'clickcard': {
      const picked = level.clickOptions?.find((o) => o.id === data.selected)
      return picked
        ? `你选了「${picked.label}」。${pitfall || '请结合场景中的数据与环境背景重新分析。'}`
        : pitfall || ''
    }
    case 'packet': {
      const picked = level.packetRequests?.find((o) => o.id === data.selected)
      return picked
        ? `你选了 ${picked.method} ${picked.url}（${picked.status}）。${pitfall || '对照回调链路与 Host 环境重新分析。'}`
        : pitfall || ''
    }
    case 'jira':
      return pitfall ? `常见坑：${pitfall}` : ''
    case 'template':
    case 'chat':
    case 'terminal':
    case 'config':
    case 'calculator':
      return pitfall || ''
    default:
      return ''
  }
}

function uniqueHintStrings(list) {
  const seen = new Set()
  const out = []
  for (const item of list) {
    const text = String(item || '').trim()
    if (!text || seen.has(text)) continue
    seen.add(text)
    out.push(text)
  }
  return out
}

function simTypeFallbackHint(level) {
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
        return '优先选 HTTP 层验证项：状态码、响应体、响应头、异常场景；UI 细节是干扰项。'
      }
      return level.templateFields?.[0]?.validationHint || level.fillHint || ''
    default:
      return ''
  }
}

function levelFieldHints(level) {
  const parts = []
  if (level.terminalHint) parts.push(level.terminalHint)
  if (level.fillHint) parts.push(level.fillHint)
  if (Array.isArray(level.templateFields)) {
    for (const field of level.templateFields) {
      if (field.validationHint) parts.push(field.validationHint)
    }
  }
  return parts
}

/** 关卡内可轮换的提示池（均为本题或本题 debrief，不含无关题型通则） */
export function getLevelHintPool(level) {
  if (!level) return []

  const debrief = getDebrief(level.id, level.dailyKey)
  const parts = []

  if (Array.isArray(level.hints)) {
    parts.push(...level.hints)
  }
  if (level.hint) parts.push(level.hint)
  parts.push(...levelFieldHints(level))
  if (debrief?.workplace) parts.push(debrief.workplace)
  if (debrief?.pitfalls) parts.push(`常见遗漏：${debrief.pitfalls}`)

  // 仅有 debrief、无 hint 的关（如部分终端题）可补一条「为什么」
  if (!level.hint && debrief?.why) {
    parts.push(debrief.why)
  }

  // 完全没有本题资料时，才退回题型通则
  if (!parts.length) {
    const fallback = simTypeFallbackHint(level)
    if (fallback) parts.push(fallback)
  }

  return uniqueHintStrings(parts)
}

export function getLevelHint(level) {
  return getLevelHintPool(level)[0] || ''
}

/** 再次点击提示时随机换一条（尽量不重复上一条） */
export function pickNextLevelHint(pool, currentText = '') {
  if (!pool.length) return ''
  if (pool.length === 1) return pool[0]
  const others = pool.filter((text) => text !== currentText)
  const candidates = others.length ? others : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}
