<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
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
import { DAILY_LEVEL_ID } from '../data/dailyChallenges'
import { getRankForXp, getRankProgress } from '../data/ranks'
import { getWeakAreas } from '../utils/weakAreas'
import { getLevelById } from '../utils/levelRegistry'
import { getNextAchievementHint } from '../utils/achievementProgress'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useMobileLayout } from '../composables/useMobileLayout'

const router = useRouter()
const progressStore = useProgressStore()
const onboardingRef = ref(null)
const { isMobile } = useMobileLayout()

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
      <aside class="workbench__dock">
        <p class="workbench__dock-label">导航</p>
        <button type="button" class="workbench__dock-item workbench__dock-item--active" disabled>
          <span class="workbench__dock-icon">🏠</span>
          <span class="workbench__dock-text">首页</span>
        </button>
        <button type="button" class="workbench__dock-item" @click="router.push('/handbook')">
          <span class="workbench__dock-icon">📖</span>
          <span class="workbench__dock-text">手札·百科</span>
        </button>
      </aside>

      <main class="workbench__main home-map__main">
        <section class="home-map__hero">
          <p class="home-map__hero-rank">
            <span>{{ rank.icon }} {{ rank.title }}</span>
            <span class="home-map__hero-rank-meta">
              XP {{ progressStore.totalXp }} · ★ {{ progressStore.totalStars }} · 主线
              {{ progressStore.mainCompletedCount }}/{{ progressStore.totalLevelCount }}
            </span>
          </p>
          <p v-if="workBrief.chapterTitle" class="home-map__hero-tag">
            {{ workBrief.chapterTitle }}
          </p>
          <h2 class="home-map__hero-title">
            <template v-if="workBrief.complete">🎉 {{ workBrief.title }}</template>
            <template v-else>
              今日任务
              <span v-if="workBrief.beatLabel" class="home-map__hero-beat"
                >· {{ workBrief.beatLabel }}</span
              >
              ：{{ workBrief.title }}
            </template>
          </h2>
          <p class="home-map__hero-desc">{{ workBrief.desc }}</p>
          <div v-if="rankProgress.next" class="home-map__hero-xp">
            <div class="home-map__hero-xp-head">
              <span>升职进度</span>
              <span class="home-map__hero-xp-target">
                → {{ rankProgress.next.icon }} {{ rankProgress.next.title }}
                <span class="home-map__hero-xp-need">还差 {{ rankProgress.xpToNext }} XP</span>
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
                :style="{ width: `${rankProgress.percent}%` }"
              />
            </div>
          </div>
          <p v-else class="home-map__hero-xp-max">🛡️ 已达最高职级 · 质量 Owner</p>
          <div v-if="nextAchievement" class="home-map__hero-achievement">
            <div class="home-map__hero-achievement-head">
              <span>🏆 下一成就 · {{ nextAchievement.icon }} {{ nextAchievement.title }}</span>
              <span class="home-map__hero-achievement-meta"
                >{{ nextAchievement.current }}/{{ nextAchievement.target }}</span
              >
            </div>
            <div class="home-map__hero-achievement-bar">
              <div
                class="home-map__hero-achievement-fill"
                :style="{ width: `${nextAchievement.percent}%` }"
              />
            </div>
            <p class="home-map__hero-achievement-desc">{{ nextAchievement.desc }}</p>
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
          <button
            v-if="!allCompleted && progressStore.firstAvailableLevelId"
            type="button"
            class="level-map__btn level-map__btn--primary"
            @click="continueChallenge"
          >
            开始今日任务
            <span v-if="nextLevelXp" class="home-map__action-xp">+{{ nextLevelXp }} XP</span>
            →
          </button>
          <button
            v-if="dailyStatus === 'available'"
            type="button"
            class="level-map__btn level-map__btn--ghost home-map__daily-chip"
            @click="router.push('/level/' + DAILY_LEVEL_ID)"
          >
            📅 每日特训
            <span v-if="progressStore.dailyStreak" class="home-map__streak"
              >🔥 {{ progressStore.dailyStreak }}</span
            >
          </button>
          <button type="button" class="level-map__btn level-map__btn--ghost" @click="resetProgress">
            重置进度
          </button>
        </div>

        <details
          class="home-fold home-fold--mobile-collapsible home-fold--progress"
          :open="isMobile ? undefined : true"
        >
          <summary class="home-fold__summary">我的进度 · 分享成绩 · 存档</summary>
          <div class="home-fold__body">
            <PlayerDashboard compact />
            <ProgressSettings @show-onboarding="showOnboarding" />
          </div>
        </details>

        <details
          class="home-fold home-fold--mobile-collapsible home-fold--career"
          :open="isMobile ? undefined : true"
        >
          <summary class="home-fold__summary">职场剧本</summary>
          <div class="home-fold__body">
            <CareerScript />
          </div>
        </details>

        <details
          class="home-fold home-fold--mobile-collapsible home-fold--side"
          :open="isMobile ? undefined : true"
        >
          <summary class="home-fold__summary">番外 & 每日特训（{{ progressStore.sideCompletedCount }}/{{ sideLevels.length }}）</summary>
          <div class="home-fold__body">
            <SideQuestHub />
          </div>
        </details>

        <details
          class="home-fold home-fold--mobile-collapsible home-fold--phases"
          :open="isMobile ? undefined : true"
        >
          <summary class="home-fold__summary">按阶段查全部关卡</summary>
          <div class="home-fold__body">
            <p class="home-map__projects-desc">
              与上方剧本顺序一致，此处按备考 / 面试 / 笔试 / 入职 / 进阶分类浏览，方便查漏补缺。
            </p>
            <CareerMap />
          </div>
        </details>

        <details
          class="home-fold home-fold--mobile-collapsible home-fold--achievements"
          :open="isMobile ? undefined : true"
        >
          <summary class="home-fold__summary">成就墙</summary>
          <div class="home-fold__body">
            <AchievementPanel class="home-map__achievements" />
          </div>
        </details>
      </main>
    </div>
  </div>
</template>
