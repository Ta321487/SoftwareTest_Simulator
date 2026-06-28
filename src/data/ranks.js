export const ranks = [
  { minXp: 0, title: '路人', icon: '🚶', tagline: '还没上车，或刚打开地图' },
  { minXp: 10, title: '备考萌新', icon: '📖', tagline: '开始圈 PRD 了，入门即实战' },
  { minXp: 65, title: '刷题党', icon: '✏️', tagline: '用例、Bug、回归——基本功在涨' },
  { minXp: 100, title: '面试候场', icon: '🪑', tagline: '简历过了，等叫号进终面' },
  { minXp: 175, title: '笔试通关者', icon: '📝', tagline: '部门卷写完了，Offer 在望' },
  { minXp: 290, title: 'Junior 测试', icon: '🔰', tagline: '工牌到手，正式跟项目' },
  { minXp: 425, title: 'Mid 测试', icon: '⚡', tagline: '能独立扛模块，线上也会救火' },
  { minXp: 510, title: 'Senior 测试', icon: '🏅', tagline: '链路、灰度、复盘都见过世面' },
  { minXp: 605, title: '测试老兵', icon: '👨‍💻', tagline: '第一季 27 关全通——这行你算入门了' },
  { minXp: 720, title: '测试 Lead', icon: '🎯', tagline: '带人、排期、抓包——开始扛项目' },
  { minXp: 850, title: '质量 Owner', icon: '🛡️', tagline: '进阶线全通，质量决策扛得住' },
]

export function getRankForXp(xp) {
  let current = ranks[0]
  for (const rank of ranks) {
    if (xp >= rank.minXp) current = rank
  }
  return current
}

export function getNextRank(xp) {
  const current = getRankForXp(xp)
  const idx = ranks.indexOf(current)
  return idx < ranks.length - 1 ? ranks[idx + 1] : null
}

export function getRankProgress(xp) {
  const current = getRankForXp(xp)
  const next = getNextRank(xp)
  if (!next) return { current, next: null, percent: 100, xpToNext: 0 }
  const range = next.minXp - current.minXp
  const gained = xp - current.minXp
  return {
    current,
    next,
    percent: Math.min(100, Math.round((gained / range) * 100)),
    xpToNext: next.minXp - xp,
  }
}
