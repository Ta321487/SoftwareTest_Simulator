/** 主线关卡 season 元数据（对应 levels.js 的 season 字段） */
export const seasonMeta = {
  bronze: { label: '青铜', shortLabel: '青铜段', className: 'season-bronze' },
  silver: { label: '白银', shortLabel: '白银段', className: 'season-silver' },
  gold: { label: '黄金', shortLabel: '黄金段', className: 'season-gold' },
  platinum: { label: '白金', shortLabel: '白金段', className: 'season-platinum' },
}

export function getSeasonMeta(season) {
  return seasonMeta[season] || null
}
