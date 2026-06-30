import { onMounted, onUnmounted } from 'vue'
import {
  getKeyboardInset,
  isFocusableField,
  isMobileViewport,
  MOBILE_KEYBOARD_SCROLL_DELAY_MS,
  scrollFieldIntoView,
} from '../utils/mobileKeyboard'

const INSET_VAR = '--keyboard-inset'

function setKeyboardInset(px) {
  document.documentElement.style.setProperty(INSET_VAR, `${Math.max(0, Math.round(px))}px`)
}

/** 移动端：输入聚焦时滚入可视区，并根据软键盘高度增加主内容区底部留白 */
export function useMobileKeyboardScroll() {
  let scrollTimer = null
  let blurTimer = null
  let focusedEl = null

  function syncInsetAndScroll() {
    if (!isMobileViewport()) return
    setKeyboardInset(getKeyboardInset())
    if (focusedEl && document.activeElement === focusedEl) {
      scrollFieldIntoView(focusedEl)
    }
  }

  function onFocusIn(event) {
    if (!isMobileViewport()) return
    const target = event.target
    if (!isFocusableField(target)) return

    focusedEl = target
    if (scrollTimer) clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      scrollTimer = null
      syncInsetAndScroll()
    }, MOBILE_KEYBOARD_SCROLL_DELAY_MS)
  }

  function onFocusOut() {
    if (blurTimer) clearTimeout(blurTimer)
    blurTimer = setTimeout(() => {
      blurTimer = null
      const active = document.activeElement
      if (isFocusableField(active)) {
        focusedEl = active
        return
      }
      focusedEl = null
      setKeyboardInset(0)
    }, 120)
  }

  function onViewportChange() {
    syncInsetAndScroll()
  }

  onMounted(() => {
    setKeyboardInset(0)
    document.addEventListener('focusin', onFocusIn, true)
    document.addEventListener('focusout', onFocusOut, true)
    window.visualViewport?.addEventListener('resize', onViewportChange)
    window.visualViewport?.addEventListener('scroll', onViewportChange)
  })

  onUnmounted(() => {
    if (scrollTimer) clearTimeout(scrollTimer)
    if (blurTimer) clearTimeout(blurTimer)
    focusedEl = null
    setKeyboardInset(0)
    document.removeEventListener('focusin', onFocusIn, true)
    document.removeEventListener('focusout', onFocusOut, true)
    window.visualViewport?.removeEventListener('resize', onViewportChange)
    window.visualViewport?.removeEventListener('scroll', onViewportChange)
  })
}
