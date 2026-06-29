/** 手札卡片/检索用摘要：参考笔记口吻，不用通关复盘 summary */
export function getHandbookBlurb(entry) {
  if (!entry) return ''
  return entry.takeaway || entry.why || entry.workplace || entry.summary || ''
}

export function matchesHandbookSearch(entry, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    entry.title?.toLowerCase().includes(q) ||
    getHandbookBlurb(entry).toLowerCase().includes(q) ||
    entry.why?.toLowerCase().includes(q) ||
    entry.pitfalls?.toLowerCase().includes(q) ||
    entry.workplace?.toLowerCase().includes(q) ||
    String(entry.levelId).includes(q) ||
    entry.phaseName?.toLowerCase().includes(q)
  )
}

export function getGlossaryBlurb(term) {
  if (!term) return ''
  return term.definition || ''
}

export function matchesGlossarySearch(term, query, categoryName = '') {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const aliasHit = term.aliases?.some((a) => a.toLowerCase().includes(q))
  return (
    term.term?.toLowerCase().includes(q) ||
    aliasHit ||
    term.definition?.toLowerCase().includes(q) ||
    term.example?.toLowerCase().includes(q) ||
    categoryName.toLowerCase().includes(q)
  )
}

export function getPlaybookBlurb(playbook) {
  if (!playbook) return ''
  return playbook.summary || ''
}

export function matchesPlaybookSearch(playbook, query, categoryName = '') {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const stepHit = playbook.steps?.some((s) => s.toLowerCase().includes(q))
  return (
    playbook.title?.toLowerCase().includes(q) ||
    playbook.summary?.toLowerCase().includes(q) ||
    stepHit ||
    categoryName.toLowerCase().includes(q)
  )
}

export function filterPlaybooks(
  playbooks,
  { query = '', categoryId = 'all' } = {},
  getCategoryName
) {
  const q = query.trim()
  return playbooks.filter((pb) => {
    const categoryName = getCategoryName?.(pb.category) || pb.category || ''
    if (categoryId !== 'all' && pb.category !== categoryId) return false
    if (!q) return true
    return matchesPlaybookSearch(pb, q, categoryName)
  })
}

export function matchesDailySearch(entry, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    entry.title?.toLowerCase().includes(q) ||
    entry.summary?.toLowerCase().includes(q) ||
    entry.why?.toLowerCase().includes(q) ||
    entry.workplace?.toLowerCase().includes(q) ||
    entry.key?.toLowerCase().includes(q)
  )
}

export function filterGlossaryTerms(
  terms,
  { query = '', categoryId = 'all' } = {},
  getCategoryName
) {
  const q = query.trim()
  return terms.filter((term) => {
    const categoryName = getCategoryName?.(term.category) || term.category || ''
    if (categoryId !== 'all' && term.category !== categoryId) return false
    if (!q) return true
    return matchesGlossarySearch(term, q, categoryName)
  })
}
