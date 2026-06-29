/** 首页 main 区域内滚动，避免 scrollIntoView 滚整页导致侧栏「跟不上」 */
export function getHomeScrollContainer() {
  return document.querySelector('.home-map .workbench__main')
}

export function scrollToHomeSection(id, offset = 16) {
  const el = document.getElementById(id)
  if (!el) return false

  const container = getHomeScrollContainer()
  if (!container) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return true
  }

  const top =
    container.scrollTop +
    (el.getBoundingClientRect().top - container.getBoundingClientRect().top) -
    offset
  container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  return true
}

export function scrollToHomeHash(hash) {
  const id = String(hash || '').replace(/^#/, '')
  if (!id) return
  requestAnimationFrame(() => scrollToHomeSection(id))
}
