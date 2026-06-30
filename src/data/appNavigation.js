/** 全站主导航：桌面侧栏 / 手机底栏共用同一套条目与顺序 */
export const APP_NAV_ITEMS = [
  { id: 'home', label: '首页', icon: '🏠', kind: 'home' },
  { id: 'main', label: '进关卡', icon: '▶️', kind: 'main', needsMainLevel: true },
  { id: 'side', label: '番外', icon: '🎬', kind: 'section', section: 'home-side', count: 'side' },
  { id: 'profile', label: '档案', icon: '👤', kind: 'section', section: 'home-progress' },
  { id: 'achievements', label: '成就', icon: '🏆', kind: 'section', section: 'home-achievements' },
  { id: 'handbook', label: '手札', icon: '📖', kind: 'handbook' },
]

export const HOME_HASH_TO_TAB = {
  '': 'quest',
  '#home-side': 'side',
  '#home-progress': 'profile',
  '#home-achievements': 'achievements',
  '#home-career': 'quest',
  '#home-mainline': 'quest',
  '#home-phases': 'quest',
}

export const HOME_TAB_TO_HASH = {
  quest: '',
  side: '#home-side',
  profile: '#home-progress',
  achievements: '#home-achievements',
}

export function resolveNavActive(item, ctx) {
  const { route, current, activeLevelId, highlightMainTask, mainLevelId } = ctx
  if (item.kind === 'handbook') return current === 'handbook'
  if (item.kind === 'main') {
    return Boolean(
      highlightMainTask &&
      current === 'level' &&
      activeLevelId != null &&
      activeLevelId === mainLevelId
    )
  }
  if (route.path !== '/') return false
  if (item.kind === 'home') return current === 'home' && !route.hash
  if (item.kind === 'section') return current === 'home' && route.hash === `#${item.section}`
  return false
}

export function isNavDisabled(item, active) {
  if (item.kind === 'handbook' || item.kind === 'home') return active
  return false
}
