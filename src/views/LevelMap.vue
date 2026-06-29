<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'
import { useProjectStore } from '../stores/projectStore'
import CareerScript from '../components/CareerScript.vue'
import CareerMap from '../components/CareerMap.vue'
import PlayerDashboard from '../components/PlayerDashboard.vue'
import SideQuestHub from '../components/SideQuestHub.vue'
import AchievementPanel from '../components/AchievementPanel.vue'
import OnboardingTour from '../components/OnboardingTour.vue'
import ProgressSettings from '../components/ProgressSettings.vue'
import { getWorkBrief } from '../data/careerScript'
import { sideLevels } from '../data/sideQuests'
import { DAILY_LEVEL_ID, getTodayDailyChallenge, getDailyFocusHint } from '../data/dailyChallenges'
import { getRankForXp, getRankProgress } from '../data/ranks'
import { getWeakAreas } from '../utils/weakAreas'
import { getLevelById } from '../utils/levelRegistry'
import { getNextAchievementHint } from '../utils/achievementProgress'
import ThemeToggle from '../components/ThemeToggle.vue'
import AppNavDock from '../components/AppNavDock.vue'
import { useMobileLayout } from '../composables/useMobileLayout'

const router = useRouter()
const route = useRoute()
const progressStore = useProgressStore()
const onboardingRef = ref(null)
const { isMobile } = useMobileLayout()
const homeTab = ref('quest')

const HOME_TABS = [
  { id: 'quest', icon: '⚔️', label: '任务' },
  { id: 'career', icon: '📖', label: '剧本' },
  { id: 'side', icon: '🎬', label: '番外', count: () => `${progressStore.sideCompletedCount}/${sideLevels.length}` },
  { id: 'map', icon: '🗺️', label: '关卡图' },
  { id: 'profile', icon: '👤', label: '档案' },
  { id: 'achievements', icon: '🏆', label: '成就' },
]

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

const nextAchievement = computed(() =>
  getNextAchievementHint({
    achievements: progressStore.achievements,
    completedLevelIds: progressStore.completedLevelIds,
    levelMeta: progressStore.levelMeta,
    levelMistakes: progressStore.levelMistakes,
    dailyStreak: progressStore.dailyStreak,
  })
)

function continueChallenge() {
  const nextId = progressStore.firstAvailableLevelId
  if (nextId) {
    router.push('/level/' + nextId)
  }
}

function resetProgress() {
  if (window.confirm('确定重置所有进度？职级、XP、通关记录和项目档案将被清空。')) {
    progressStore.resetProgress()
    useProjectStore().resetAll()
  }
}

function showOnboarding() {
  onboardingRef.value?.reopen?.()
}

function setHomeTab(id) {
  homeTab.value = id
  const hashMap = {
    quest: '',
    career: '#home-career',
    side: '#home-side',
    map: '#home-phases',
    profile: '#home-progress',
    achievements: '#home-achievements',
  }
  const hash = hashMap[id] || ''
  if (route.hash !== hash) {
    router.replace({ hash })
  }
}

function sectionVisible(tabId) {
  if (tabId === 'quest') return homeTab.value === 'quest'
  return homeTab.value === tabId
}

onMounted(() => {
  const hashTab = {
    '#home-career': 'career',
    '#home-side': 'side',
    '#home-phases': 'map',
    '#home-progress': 'profile',
    '#home-achievements': 'achievements',
  }
  if (!route.hash) {
    homeTab.value = 'quest'
  } else if (hashTab[route.hash]) {
    homeTab.value = hashTab[route.hash]
  }
})

watch(
  () => route.hash,
  (hash) => {
    const hashTab = {
      '#home-career': 'career',
      '#home-side': 'side',
      '#home-phases': 'map',
      '#home-progress': 'profile',
      '#home-achievements': 'achievements',
    }
    if (!hash) {
      homeTab.value = 'quest'
      return
    }
    if (hashTab[hash]) homeTab.value = hashTab[hash]
  }
)
</script>

<template>
  <div class="workbench home-map">
    <OnboardingTour ref="onboardingRef" />
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
        <nav class="game-tabs" role="tablist" aria-label="首页分区">
          <button
            v-for="tab in HOME_TABS"
            :key="tab.id"
            type="button"
            role="tab"
            class="game-tabs__btn"
            :class="{ 'game-tabs__btn--active': homeTab === tab.id }"
            :aria-selected="homeTab === tab.id"
            @click="setHomeTab(tab.id)"
          >
            <span class="game-tabs__icon" aria-hidden="true">{{ tab.icon }}</span>
            {{ tab.label }}
            <span v-if="tab.count" class="game-tabs__count">{{ tab.count() }}</span>
          </button>
        </nav>

        <div v-show="sectionVisible('quest')" class="game-section game-section--quest">
          <section class="home-map__hero quest-panel">
            <span class="quest-panel__badge">▸ 当前任务</span>

            <div class="home-map__hero-head">
              <div class="home-map__hero-rank-pill">
                <span class="home-map__hero-rank-icon" aria-hidden="true">{{ rank.icon }}</span>
                <span>{{ rank.title }}</span>
              </div>
              <p class="home-map__hero-rank-meta">
                XP {{ progressStore.totalXp }} · ★ {{ progressStore.totalStars }} · 主线
                {{ progressStore.mainCompletedCount }}/{{ progressStore.totalLevelCount }}
              </p>
            </div>

            <p v-if="workBrief.chapterTitle" class="home-map__hero-tag">
              {{ workBrief.chapterTitle }}
            </p>
            <h2 class="home-map__hero-title">
              <template v-if="workBrief.complete">🎉 {{ workBrief.title }}</template>
              <template v-else>
                <template v-if="progressStore.firstAvailableLevelId">
                  #{{ progressStore.firstAvailableLevelId }}
                </template>
                {{ workBrief.title }}
                <span v-if="workBrief.beatLabel" class="home-map__hero-beat"
                  >· {{ workBrief.beatLabel }}</span
                >
              </template>
            </h2>
            <p class="home-map__hero-desc">{{ workBrief.desc }}</p>

            <div class="home-map__hero-foot">
              <div class="home-map__hero-metrics">
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

              <div
                v-if="!allCompleted && progressStore.firstAvailableLevelId"
                class="home-map__hero-cta"
              >
                <button
                  type="button"
                  class="level-map__btn level-map__btn--primary level-map__btn--game quest-panel__play home-map__hero-cta-btn"
                  @click="continueChallenge"
                >
                  开始任务
                  <span v-if="nextLevelXp" class="home-map__action-xp">+{{ nextLevelXp }} XP</span>
                  →
                </button>
              </div>
            </div>

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
          </section>

          <div class="home-map__actions">
            <div class="home-map__action-btns">
              <button type="button" class="level-map__btn level-map__btn--ghost" @click="resetProgress">
                重置进度
              </button>
            </div>
          </div>

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
                <span v-if="progressStore.dailyStreak">🔥 连续 {{ progressStore.dailyStreak }} 天 · </span>
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
          <p v-else class="home-map__daily-locked">
            📅 每日特训 · 完成第 5 关「登录收官」后解锁
          </p>
        </div>

        <div
          v-show="sectionVisible('career')"
          id="home-career"
          class="game-section game-section--career quest-log"
        >
          <header class="quest-log__head">
            <span class="quest-log__head-icon">📖</span>
            职场剧本
            <span v-if="workBrief.chapterTitle" class="home-fold__summary-meta">
              · {{ workBrief.chapterTitle }}
            </span>
          </header>
          <div class="quest-log__body">
            <CareerScript />
          </div>
        </div>

        <div v-show="sectionVisible('side')" id="home-side" class="game-section game-section--side quest-log">
          <header class="quest-log__head">
            <span class="quest-log__head-icon">🎬</span>
            番外 & 特训
            <span class="game-tabs__count"
              >{{ progressStore.sideCompletedCount }}/{{ sideLevels.length }}</span
            >
          </header>
          <div class="quest-log__body">
            <SideQuestHub compact />
          </div>
        </div>

        <div v-show="sectionVisible('map')" id="home-phases" class="game-section game-section--map quest-log">
          <header class="quest-log__head">
            <span class="quest-log__head-icon">🗺️</span>
            关卡地图
          </header>
          <div class="quest-log__body">
            <CareerMap />
          </div>
        </div>

        <div
          v-show="sectionVisible('profile')"
          id="home-progress"
          class="game-section game-section--profile quest-log"
        >
          <header class="quest-log__head">
            <span class="quest-log__head-icon">👤</span>
            玩家档案
          </header>
          <div class="quest-log__body">
            <PlayerDashboard compact />
            <ProgressSettings @show-onboarding="showOnboarding" />
          </div>
        </div>

        <div
          v-show="sectionVisible('achievements')"
          id="home-achievements"
          class="game-section game-section--achievements quest-log"
        >
          <header class="quest-log__head">
            <span class="quest-log__head-icon">🏆</span>
            成就墙
          </header>
          <div class="quest-log__body">
            <AchievementPanel class="home-map__achievements" />
          </div>
        </div>
      </main>
    </div>

    <footer
      v-if="isMobile && !allCompleted && progressStore.firstAvailableLevelId"
      class="game-playbar"
    >
      <div class="game-playbar__main">
        <p class="game-playbar__label">当前任务</p>
        <p class="game-playbar__title">
          #{{ progressStore.firstAvailableLevelId }} {{ workBrief.title }}
        </p>
      </div>
      <button type="button" class="game-playbar__btn" @click="continueChallenge">
        开始 →
      </button>
    </footer>
  </div>
</template>
