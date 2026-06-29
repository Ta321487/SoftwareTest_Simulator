import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'
import { DAILY_LEVEL_ID } from '../data/dailyChallenges'

export function useAppNav() {
  const router = useRouter()
  const route = useRoute()
  const progressStore = useProgressStore()

  const mainLevelId = computed(() => progressStore.firstAvailableLevelId)
  const dailyStatus = computed(() => progressStore.getDailyStatus())
  const dailyOpen = computed(() => dailyStatus.value !== 'locked')
  const dailyDone = computed(() => dailyStatus.value === 'completed')

  function goHome() {
    if (route.path !== '/') {
      router.push('/')
      return
    }
    if (route.hash) router.replace({ hash: '' })
  }

  function goMain() {
    if (mainLevelId.value) router.push('/level/' + mainLevelId.value)
  }

  function goDaily() {
    router.push('/level/' + DAILY_LEVEL_ID)
  }

  function goHandbook() {
    router.push('/handbook')
  }

  function goHomeSection(id) {
    const hash = '#' + id
    if (route.path !== '/') {
      router.push({ path: '/', hash })
      return
    }
    router.replace({ hash })
  }

  return {
    mainLevelId,
    dailyStatus,
    dailyOpen,
    dailyDone,
    goHome,
    goMain,
    goDaily,
    goHandbook,
    goHomeSection,
  }
}
