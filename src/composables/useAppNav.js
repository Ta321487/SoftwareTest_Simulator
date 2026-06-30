import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'
import { DAILY_LEVEL_ID } from '../data/dailyChallenges'
import { sideLevels } from '../data/sideQuests'
import { APP_NAV_ITEMS } from '../data/appNavigation'

export function useAppNav() {
  const router = useRouter()
  const route = useRoute()
  const progressStore = useProgressStore()

  const mainLevelId = computed(() => progressStore.firstAvailableLevelId)
  const dailyStatus = computed(() => progressStore.getDailyStatus())
  const dailyOpen = computed(() => dailyStatus.value !== 'locked')
  const dailyDone = computed(() => dailyStatus.value === 'completed')

  const navItems = computed(() =>
    APP_NAV_ITEMS.filter((item) => !item.needsMainLevel || mainLevelId.value)
  )

  function navCount(item) {
    if (item.count === 'side') {
      return `${progressStore.sideCompletedCount}/${sideLevels.length}`
    }
    return ''
  }

  function goHome() {
    if (route.path !== '/') {
      router.push('/')
      return
    }
    if (route.hash || Object.keys(route.query).length) {
      router.replace({ path: '/', hash: '', query: {} })
    }
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
    const hash = id.startsWith('#') ? id : `#${id}`
    if (route.path !== '/') {
      router.push({ path: '/', hash })
      return
    }
    router.replace({ path: '/', hash, query: {} })
  }

  function activateNavItem(item) {
    switch (item.kind) {
      case 'home':
        goHome()
        break
      case 'main':
        goMain()
        break
      case 'section':
        goHomeSection(item.section)
        break
      case 'handbook':
        goHandbook()
        break
      default:
        break
    }
  }

  return {
    mainLevelId,
    dailyStatus,
    dailyOpen,
    dailyDone,
    navItems,
    navCount,
    goHome,
    goMain,
    goDaily,
    goHandbook,
    goHomeSection,
    activateNavItem,
  }
}
