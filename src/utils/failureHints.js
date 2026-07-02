import { getDebrief } from '../data/debriefs'

function diffChecklist(selected, correct, items) {
  const missed = correct.filter((id) => !selected.includes(id))
  const extra = selected.filter((id) => !correct.includes(id))
  const label = (id) => items.find((i) => i.id === id)?.label || id

  const parts = []
  if (missed.length) {
    parts.push(`漏选：${missed.map(label).join('；')}`)
  }
  if (extra.length) {
    parts.push(`多选了：${extra.map(label).join('；')}（这些通常不是重点）`)
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

function getPitfall(level) {
  return getDebrief(level?.id, level?.dailyKey)?.pitfalls || ''
}

function findSelectionLabel(level, selectedId) {
  if (!selectedId || !level) return null

  const pools = [
    level.clickOptions,
    level.apmMetrics,
    level.causeOptions,
    level.gitOptions,
    level.pipelineStages?.map((s) => ({ id: s.id, label: s.name })),
    level.traceNodes?.map((n) => ({ id: n.id, label: n.label })),
    level.gitCommits?.map((c) => ({ id: c.id, label: c.message || c.sha })),
    level.mqMessages?.map((m) => ({
      id: m.id,
      label: `${m.routingKey || m.from || '消息'} · ${(m.payload || m.text || '').slice(0, 40)}`,
    })),
  ]

  for (const pool of pools) {
    if (!Array.isArray(pool)) continue
    const picked = pool.find((o) => o.id === selectedId)
    if (picked) return picked.label || picked.name || picked.message || picked.text
  }
  return null
}

function clickSelectionFailure(level, selectedId, pitfall, defaultMsg) {
  const label = findSelectionLabel(level, selectedId)
  return label ? `你选了「${label}」。${pitfall || defaultMsg}` : pitfall || ''
}

function pitfallOrFieldHint(level, pitfall) {
  const fieldHint = levelFieldHints(level)[0]
  return pitfall || fieldHint || ''
}

export function getFailureHint(level, data, _result) {
  if (!level) return ''

  const pitfall = getPitfall(level)

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
      return pitfallOrFieldHint(level, pitfall)
    }
    case 'report': {
      const detail = diffReport(
        data.selected || [],
        level.correctSelections || [],
        level.reportItems || []
      )
      return detail || pitfall || ''
    }
    case 'clickcard':
      return clickSelectionFailure(
        level,
        data.selected,
        pitfall,
        '请结合场景中的数据与环境背景重新分析。'
      )
    case 'packet': {
      const picked = level.packetRequests?.find((o) => o.id === data.selected)
      return picked
        ? `你选了 ${picked.method} ${picked.url}（${picked.status}）。${pitfall || '对照回调链路与 Host 环境重新分析。'}`
        : pitfall || ''
    }
    case 'jira':
      return pitfall ? `常见坑：${pitfall}` : ''
    case 'chat':
      return level.chatFailHint || pitfall || ''
    case 'template':
    case 'terminal':
    case 'config':
    case 'calculator':
      return pitfallOrFieldHint(level, pitfall)
    case 'sqlclient':
    case 'redis':
    case 'mockserver':
      return pitfallOrFieldHint(level, pitfall)
    case 'cipipeline': {
      if (level.correctCause && data.selectedCause && data.selectedCause !== level.correctCause) {
        return clickSelectionFailure(
          level,
          data.selectedCause,
          pitfall,
          '请对照日志关键字与环境信息重新分析。'
        )
      }
      if (level.correctStage && data.selectedStage && data.selectedStage !== level.correctStage) {
        const stage = level.pipelineStages?.find((s) => s.id === data.selectedStage)
        return stage
          ? `你点了「${stage.name}」。${pitfall || '集成/回归失败通常是测试最该介入的环节。'}`
          : pitfall || ''
      }
      return pitfallOrFieldHint(level, pitfall)
    }
    case 'apmtrace':
    case 'gitrelease':
      return clickSelectionFailure(
        level,
        data.selected,
        pitfall,
        '请结合场景中的数据与环境背景重新分析。'
      )
    case 'mqinbox': {
      if (level.correctMessageId && data.selectedMessageId) {
        return clickSelectionFailure(
          level,
          data.selectedMessageId,
          pitfall,
          '对照业务单号/时间与 payload 重新找。'
        )
      }
      return pitfallOrFieldHint(level, pitfall)
    }
    default:
      return pitfall || ''
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
        return '接口题优先看状态码、返回内容、响应头和异常场景，UI 细节通常不用选。'
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
  if (level.chatHint) parts.push(level.chatHint)
  if (level.sqlHint) parts.push(level.sqlHint)
  if (level.redisHint) parts.push(level.redisHint)
  if (level.mockHint) parts.push(level.mockHint)
  if (level.mqHint) parts.push(level.mqHint)
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
