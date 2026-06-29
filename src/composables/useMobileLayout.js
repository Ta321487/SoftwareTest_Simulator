import { onMounted, onUnmounted, ref } from 'vue'

const MOBILE_MQ = '(max-width: 768px)'

export function useMobileLayout() {
  const query =
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ) : null
  const isMobile = ref(query?.matches ?? false)
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
