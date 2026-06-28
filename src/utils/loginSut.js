/** 登录模块被测 App —— Dock 专用 ID（非主线关卡） */
export const LOGIN_SUT_DOCK_ID = 901

export const LOGIN_MODULE_ID = 'login-module'

export function isLoginModuleProject(project) {
  return project?.id === LOGIN_MODULE_ID
}

/** 当前关卡应加载的 App 版本：Day1–3 有 Bug，Day4+ 已修复 */
export function getLoginBuildVersion(currentLevelId) {
  if (currentLevelId >= 4 && currentLevelId <= 5) return 'fixed'
  return 'buggy'
}

export function shouldShowInlineLoginSut(levelId) {
  return levelId === 3 || levelId === 4
}

export function shouldShowLoginAppDock(currentLevelId) {
  return currentLevelId >= 3 && currentLevelId <= 5
}

export function getLoginSutLead(levelId) {
  if (levelId === 3) {
    return '先在右侧被测 App 里点击「获取验证码」复现 Bug，再填写下方 Jira 工单（不卡关，但复现后写单更准）。'
  }
  if (levelId === 4) {
    return 'TEST-1003 已合入。请先在 App 里点「获取验证码」确认倒计时正常，再勾选回归范围。'
  }
  return ''
}
