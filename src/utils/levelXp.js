import { calculateBonusXp } from './validator'

/** 关卡 XP 展示：基础奖励与冲星上限 */
export function getLevelXpPreview(baseXp, existingStars = 0) {
  const base = baseXp || 0
  const maxBonus = calculateBonusXp(base, 3)
  const star2Bonus = calculateBonusXp(base, 2)
  const maxTotal = base + maxBonus
  const canImprove = existingStars < 3

  return {
    base,
    maxBonus,
    star2Bonus,
    maxTotal,
    canImprove,
  }
}
