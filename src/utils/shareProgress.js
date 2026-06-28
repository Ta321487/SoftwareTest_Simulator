export const PLAY_URL = 'https://ta321487.github.io/SoftwareTest_Simulator/'
export const OG_IMAGE_URL = `${PLAY_URL}og.png`

export function buildShareText({
  rankTitle,
  rankIcon,
  xp,
  stars,
  mainDone,
  mainTotal,
  sideDone,
  sideTotal,
  streak,
  achievementDone,
  achievementTotal,
  practiceLine = null,
}) {
  const lines = [
    `${rankIcon} 我在「测试人一生」打到【${rankTitle}】`,
    `XP ${xp} · ★${stars} · 主线 ${mainDone}/${mainTotal} · 番外 ${sideDone}/${sideTotal}`,
    `每日连续 ${streak} 天 · 成就 ${achievementDone}/${achievementTotal}`,
  ]
  if (practiceLine) {
    lines.push(`最近在练：${practiceLine}`)
  }
  lines.push('来挑战软件测试职场模拟 👇', PLAY_URL)
  return lines.join('\n')
}

export async function copyShareText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return { ok: true }
  }

  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  return ok ? { ok: true } : { ok: false, message: '复制失败，请手动复制' }
}
