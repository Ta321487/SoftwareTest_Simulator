/** 手札卡片/检索用摘要：参考笔记口吻，不用通关复盘 summary */
export function getHandbookBlurb(entry) {
  if (!entry) return ''
  return entry.takeaway || entry.why || entry.summary || ''
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
