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
