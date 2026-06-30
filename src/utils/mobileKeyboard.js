const MOBILE_MQ = '(max-width: 768px)'

const SKIP_INPUT_TYPES = new Set([
  'hidden',
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
  'file',
  'image',
])

export function isMobileViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MQ).matches
}

/** 软键盘占用的高度（px），无 visualViewport 时为 0 */
export function getKeyboardInset() {
  if (typeof window === 'undefined' || !window.visualViewport) return 0
  const vv = window.visualViewport
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
}

export function isFocusableField(el) {
  if (!el || typeof el !== 'object' || typeof el.tagName !== 'string') return false
  if (el.isContentEditable) return true

  const tag = el.tagName
  if (tag === 'TEXTAREA') {
    return !el.disabled && !el.readOnly
  }
  if (tag === 'SELECT') {
    return !el.disabled
  }
  if (tag !== 'INPUT') return false
  if (el.disabled || el.readOnly) return false
  const type = (el.getAttribute('type') || 'text').toLowerCase()
  return !SKIP_INPUT_TYPES.has(type)
}

export function scrollFieldIntoView(el, { behavior = 'smooth' } = {}) {
  if (!el?.scrollIntoView) return
  el.scrollIntoView({ block: 'center', inline: 'nearest', behavior })
}

export const MOBILE_KEYBOARD_SCROLL_DELAY_MS = 320
