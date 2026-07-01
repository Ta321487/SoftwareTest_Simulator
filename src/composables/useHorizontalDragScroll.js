/**
 * Pointer drag-to-scroll for horizontal overflow rows (mobile tab bars).
 * Suppresses accidental tab clicks when the user was dragging.
 */
export function useHorizontalDragScroll(options = {}) {
  const threshold = options.threshold ?? 8

  function bind(el) {
    if (!el) return () => {}

    // Skip when content fits; caller should re-bind after layout changes (e.g. expand +N strip).
    if (!options.alwaysBind && el.scrollWidth <= el.clientWidth) return () => {}

    let startX = 0
    let scrollLeft = 0
    let active = false
    let dragged = false
    let captured = false
    let dragResetTimer = null

    const skipSelector =
      options.skipSelector ??
      '[aria-disabled="true"], button:disabled, .app-mobile-dock__chip--locked'

    const clearDragResetTimer = () => {
      if (dragResetTimer != null) {
        clearTimeout(dragResetTimer)
        dragResetTimer = null
      }
    }

    const scheduleDragReset = () => {
      clearDragResetTimer()
      dragResetTimer = window.setTimeout(() => {
        dragged = false
        dragResetTimer = null
      }, 0)
    }

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (e.target.closest(skipSelector)) return
      clearDragResetTimer()
      active = true
      dragged = false
      captured = false
      startX = e.clientX
      scrollLeft = el.scrollLeft
    }

    const onPointerMove = (e) => {
      if (!active) return
      const dx = e.clientX - startX
      if (!dragged && Math.abs(dx) <= threshold) return
      if (!captured) {
        captured = true
        dragged = true
        el.setPointerCapture(e.pointerId)
      }
      el.scrollLeft = scrollLeft - dx
    }

    const end = (e) => {
      if (!active) return
      active = false
      if (captured) {
        try {
          el.releasePointerCapture(e.pointerId)
        } catch {
          /* already released */
        }
        captured = false
      }
      // Mobile often skips click after drag; reset so later taps are not swallowed.
      if (dragged) scheduleDragReset()
    }

    const onClick = (e) => {
      if (!dragged) return
      e.preventDefault()
      e.stopPropagation()
      clearDragResetTimer()
      dragged = false
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
    el.addEventListener('click', onClick, true)

    return () => {
      clearDragResetTimer()
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
      el.removeEventListener('click', onClick, true)
    }
  }

  return { bind }
}
