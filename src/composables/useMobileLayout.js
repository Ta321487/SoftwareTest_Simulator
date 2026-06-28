import { onMounted, onUnmounted, ref } from 'vue'

const MOBILE_MQ = '(max-width: 768px)'

export function useMobileLayout() {
  const isMobile = ref(false)
  let mq = null
  let handler = null

  onMounted(() => {
    mq = window.matchMedia(MOBILE_MQ)
    handler = () => {
      isMobile.value = mq.matches
    }
    handler()
    mq.addEventListener('change', handler)
  })

  onUnmounted(() => {
    if (mq && handler) mq.removeEventListener('change', handler)
  })

  return { isMobile }
}
