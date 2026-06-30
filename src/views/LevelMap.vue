<script setup>
import { computed, ref, onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'

const tabLoading = { template: '<p class="tab-loading" role="status">加载中…</p>' }

function lazyTab(loader) {
  return defineAsyncComponent({
    loader,
    loadingComponent: tabLoading,
    delay: 100,
  })
}

const CareerScript = lazyTab(() => import('../components/CareerScript.vue'))
const SideQuestHub = lazyTab(() => import('../components/SideQuestHub.vue'))
const PlayerDashboard = lazyTab(() => import('../components/PlayerDashboard.vue'))
const AchievementPanel = lazyTab(() => import('../components/AchievementPanel.vue'))
const ProgressSettings = lazyTab(() => import('../components/ProgressSettings.vue'))
const OnboardingTour = lazyTab(() => import('../components/OnboardingTour.vue'))
import { getWorkBrief } from '../data/careerScript'
import { DAILY_LEVEL_ID, getTodayDailyChallenge, getDailyFocusHint } from '../data/dailyChallenges'
import { getRankForXp, getRankProgress } from '../data/ranks'
import { getWeakAreas } from '../utils/weakAreas'
import { getLevelById } from '../utils/levelRegistry'
import { getNextAchievementHint } from '../utils/achievementProgress'
import ThemeToggle from '../components/ThemeToggle.vue'
import AppNavDock from '../components/AppNavDock.vue'
import BackupReminder from '../components/BackupReminder.vue'
import WhatsNewModal from '../components/WhatsNewModal.vue'
import { useAppNav } from '../composables/useAppNav'
import { HOME_HASH_TO_TAB } from '../data/appNavigation'

const router = useRouter()
const route = useRoute()
const progressStore = useProgressStore()
const { goHomeSection } = useAppNav()
const onboardingRef = ref(null)
const whatsNewRef = ref(null)
const onboardingReady = ref(false)
const homeTab = ref('quest')
const visitedTabs = ref(new Set(['quest']))

const allCompleted = computed(
  () => progressStore.completedLevelIds.length >= progressStore.totalLevelCount
)

const workBrief = computed(() =>
  getWorkBrief({
    firstAvailableLevelId: progressStore.firstAvailableLevelId,
    completedLevelIds: progressStore.completedLevelIds,
    getStatus: (id) => progressStore.getStatus(id),
  })
)

const reinforcementHint = computed(() => {
  if (homeTab.value !== 'quest') return null
  const nextId = progressStore.firstAvailableLevelId
  const top = getWeakAreas({
    levelMistakes: progressStore.levelMistakes,
    levelMeta: progressStore.levelMeta,
    hintsUsed: progressStore.hintsUsed,
    completedLevelIds: progressStore.completedLevelIds,
  }).find((item) => item.levelId !== nextId)
  return top || null
})

const rank = computed(() => getRankForXp(progressStore.totalXp))
const rankProgress = computed(() => getRankProgress(progressStore.totalXp))
const dailyStatus = computed(() => progressStore.getDailyStatus())
const dailyXp = computed(() => getTodayDailyChallenge().xpReward ?? 0)
const todayDaily = computed(() => getTodayDailyChallenge())
const dailyFocus = computed(() =>
  dailyStatus.value === 'locked' ? '' : getDailyFocusHint(todayDaily.value)
)
const dailyTitle = computed(() => {
  const raw = todayDaily.value?.title || ''
  return raw.replace(/^今日：/, '') || '今日一题'
})

const nextLevelXp = computed(() => {
  const id = progressStore.firstAvailableLevelId
  if (!id) return 0
  return getLevelById(id)?.xpReward ?? 0
})

const nextAchievement = computed(() => {
  if (homeTab.value !== 'quest') return null
  return getNextAchievementHint({
    achievements: progressStore.achievements,
    completedLevelIds: progressStore.completedLevelIds,
    levelMeta: progressStore.levelMeta,
    levelMistakes: progressStore.levelMistakes,
    dailyStreak: progressStore.dailyStreak,
  })
})

function continueChallenge() {
  const nextId = progressStore.firstAvailableLevelId
  if (nextId) {
    router.push('/level/' + nextId)
  }
}

function showOnboarding() {
  onboardingReady.value = true
  queueMicrotask(() => onboardingRef.value?.reopen?.())
}

function syncHomeTabFromHash(hash) {
  const tab = HOME_HASH_TO_TAB[hash || '']
  if (tab) {
    homeTab.value = tab
    visitedTabs.value.add(tab)
    if (
      (hash === '#home-career' || hash === '#home-mainline' || hash === '#home-phases') &&
      route.hash
    ) {
      router.replace({ hash: '', query: {} })
    }
    if (hash === '#home-career' || hash === '#home-mainline' || hash === '#home-phases') {
      scrollToQuestLog()
    }
    return
  }
  homeTab.value = 'quest'
  visitedTabs.value.add('quest')
}

function scrollToQuestLog() {
  nextTick(() => {
    document.getElementById('quest-log')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function tabActive(tabId) {
  return homeTab.value === tabId
}

function tabMounted(tabId) {
  return visitedTabs.value.has(tabId)
}

function goToSettings() {
  goHomeSection('home-progress')
}

onMounted(() => {
  syncHomeTabFromHash(route.hash)
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300))
  idle(() => {
    onboardingReady.value = true
    queueMicrotask(() => whatsNewRef.value?.open?.())
  })
})

watch(
  () => route.hash,
  (hash) => syncHomeTabFromHash(hash)
)
</script>

<template>
  <div class="workbench home-map">
    <OnboardingTour v-if="onboardingReady" ref="onboardingRef" />
    <WhatsNewModal ref="whatsNewRef" />
    <header class="workbench__topbar">
      <div class="workbench__topbar-left">
        <div class="workbench__title-block">
          <h1 class="workbench__title workbench__title--app">测试人一生</h1>
          <p class="workbench__subtitle">星云科技 · 测试部职场模拟</p>
        </div>
      </div>
      <div class="workbench__topbar-right">
        <span class="workbench__level-tag">
          {{ progressStore.completedLevelIds.length }}/{{ progressStore.totalLevelCount }} 关 · ★
          {{ progressStore.totalStars }}
        </span>
        <ThemeToggle />
      </div>
    </header>

    <div class="workbench__body">
      <AppNavDock current="home" />

      <main class="workbench__main home-map__main">
        <div v-if="tabActive('quest')" class="game-section game-section--quest">
          <BackupReminder @go-settings="goToSettings" />

          <section class="home-continue quest-panel">
            <div class="home-continue__body">
              <span class="quest-panel__badge">▸ 当前任务</span>
              <template v-if="workBrief.complete">
                <h2 class="home-continue__title">🎉 {{ workBrief.title }}</h2>
              </template>
              <template v-else>
                <p v-if="workBrief.chapterTitle" class="home-continue__chapter">
                  {{ workBrief.chapterTitle }}
                </p>
                <h2 class="home-continue__title">
                  <template v-if="progressStore.firstAvailableLevelId">
                    #{{ progressStore.firstAvailableLevelId }}
                  </template>
                  {{ workBrief.title }}
                  <span v-if="workBrief.beatLabel" class="home-continue__beat"
                    >· {{ workBrief.beatLabel }}</span
                  >
                </h2>
              </template>
              <p class="home-continue__meta">
                <span>{{ rank.icon }} {{ rank.title }}</span>
                <span>XP {{ progressStore.totalXp }}</span>
                <span>★ {{ progressStore.totalStars }}</span>
                <span
                  >{{ progressStore.mainCompletedCount }}/{{ progressStore.totalLevelCount }}</span
                >
              </p>
            </div>
            <button
              v-if="!allCompleted && progressStore.firstAvailableLevelId"
              type="button"
              class="level-map__btn level-map__btn--primary level-map__btn--game home-continue__btn"
              @click="continueChallenge"
            >
              进入关卡
              <span v-if="nextLevelXp" class="home-map__action-xp">+{{ nextLevelXp }} XP</span>
              →
            </button>
          </section>

          <section id="quest-log" class="home-quest-log">
            <CareerScript flat />
          </section>

          <details v-if="rankProgress.next || nextAchievement" class="home-stats-fold">
            <summary class="home-stats-fold__summary">升职 / 成就</summary>
            <div class="home-stats-fold__body">
              <div v-if="rankProgress.next" class="home-map__hero-xp">
                <div class="home-map__hero-xp-head">
                  <span>升职进度</span>
                  <span class="home-map__hero-xp-target">
                    {{ rankProgress.next.icon }} {{ rankProgress.next.title }}
                  </span>
                </div>
                <div
                  class="home-map__hero-xp-bar"
                  role="progressbar"
                  :aria-valuenow="rankProgress.percent"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    class="home-map__hero-xp-fill"
                    :style="{ width: `${Math.max(rankProgress.percent, 2)}%` }"
                  />
                </div>
                <p class="home-map__hero-xp-meta">
                  <span>{{ progressStore.totalXp }} / {{ rankProgress.next.minXp }} XP</span>
                  <span class="home-map__hero-xp-need">还差 {{ rankProgress.xpToNext }} XP</span>
                </p>
              </div>
              <p v-else class="home-map__hero-xp-max">🛡️ 已达最高职级 · 质量 Owner</p>

              <div v-if="nextAchievement" class="home-map__hero-achievement">
                <div class="home-map__hero-achievement-head">
                  <span>🏆 {{ nextAchievement.icon }} {{ nextAchievement.title }}</span>
                  <span class="home-map__hero-achievement-meta"
                    >{{ nextAchievement.current }}/{{ nextAchievement.target }}</span
                  >
                </div>
                <div class="home-map__hero-achievement-bar">
                  <div
                    class="home-map__hero-achievement-fill"
                    :style="{ width: `${Math.max(nextAchievement.percent, 2)}%` }"
                  />
                </div>
                <p class="home-map__hero-achievement-desc">{{ nextAchievement.desc }}</p>
              </div>
            </div>
          </details>

          <p v-if="reinforcementHint" class="home-map__hero-reinforce">
            有空可重温
            <router-link
              :to="`/level/${reinforcementHint.levelId}`"
              class="home-map__hero-reinforce-link"
            >
              #{{ reinforcementHint.levelId }} {{ reinforcementHint.title }}
            </router-link>
            <span class="home-map__hero-reinforce-reason">（{{ reinforcementHint.reason }}）</span>
          </p>

          <article
            v-if="dailyStatus !== 'locked'"
            class="quest-daily"
            :class="{ 'quest-daily--done': dailyStatus === 'completed' }"
          >
            <div class="quest-daily__body">
              <span class="quest-daily__badge">📅 每日特训</span>
              <h3 class="quest-daily__title">{{ dailyTitle }}</h3>
              <p v-if="dailyFocus" class="quest-daily__meta">{{ dailyFocus }}</p>
              <p v-else class="quest-daily__meta">
                <span v-if="progressStore.dailyStreak"
                  >🔥 连续 {{ progressStore.dailyStreak }} 天 ·
                </span>
                <span v-if="dailyStatus === 'completed'">今日已完成</span>
                <span v-else>通关 +{{ dailyXp }} XP</span>
              </p>
            </div>
            <button
              type="button"
              class="quest-daily__btn"
              :disabled="dailyStatus === 'completed'"
              @click="router.push('/level/' + DAILY_LEVEL_ID)"
            >
              {{ dailyStatus === 'completed' ? '明日刷新' : '开始 →' }}
            </button>
          </article>
          <p v-else class="home-map__daily-locked">📅 每日特训 · 完成第 5 关「登录收官」后解锁</p>
        </div>

        <div
          v-if="tabMounted('side')"
          v-show="tabActive('side')"
          id="home-side"
          class="game-section game-section--side"
        >
          <SideQuestHub compact />
        </div>

        <div
          v-if="tabMounted('profile')"
          v-show="tabActive('profile')"
          id="home-progress"
          class="game-section game-section--profile"
        >
          <PlayerDashboard compact />
          <ProgressSettings embedded @show-onboarding="showOnboarding" />
        </div>

        <div
          v-if="tabMounted('achievements')"
          v-show="tabActive('achievements')"
          id="home-achievements"
          class="game-section game-section--achievements"
        >
          <AchievementPanel flat class="home-map__achievements" />
        </div>
      </main>
    </div>
  </div>
</template>
