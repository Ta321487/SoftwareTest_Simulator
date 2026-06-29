/**
 * Pointer drag-to-scroll for horizontal overflow rows (mobile tab bars).
 * Suppresses accidental tab clicks when the user was dragging.
 */
export function useHorizontalDragScroll(options = {}) {
  const threshold = options.threshold ?? 8

  function bind(el) {
    if (!el) return () => {}

    let startX = 0
    let scrollLeft = 0
    let active = false
    let dragged = false

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      active = true
      dragged = false
      startX = e.clientX
      scrollLeft = el.scrollLeft
      el.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e) => {
      if (!active) return
      const dx = e.clientX - startX
      if (!dragged && Math.abs(dx) <= threshold) return
      dragged = true
      el.scrollLeft = scrollLeft - dx
    }

    const end = (e) => {
      if (!active) return
      active = false
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* already released */
      }
    }

    const onClick = (e) => {
      if (!dragged) return
      e.preventDefault()
      e.stopPropagation()
      dragged = false
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
    el.addEventListener('click', onClick, true)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
      el.removeEventListener('click', onClick, true)
    }
  }

  return { bind }
}
