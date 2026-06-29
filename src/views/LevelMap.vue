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
import { scrollToHomeHash } from '../utils/homeScroll'

const router = useRouter()
const route = useRoute()
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

onMounted(() => scrollToHomeHash(route.hash))
watch(() => route.hash, (hash) => scrollToHomeHash(hash))
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
        <section class="home-map__hero">
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
              今日任务
              <span v-if="workBrief.beatLabel" class="home-map__hero-beat"
                >· {{ workBrief.beatLabel }}</span
              >
              ：{{ workBrief.title }}
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

            <div v-if="!allCompleted && progressStore.firstAvailableLevelId" class="home-map__hero-cta">
              <button
                type="button"
                class="level-map__btn level-map__btn--primary home-map__hero-cta-btn"
                @click="continueChallenge"
              >
                开始今日任务
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
            <button
              v-if="!allCompleted && progressStore.firstAvailableLevelId"
              type="button"
              class="level-map__btn level-map__btn--primary home-map__action-primary--mobile"
              @click="continueChallenge"
            >
              开始今日任务
              <span v-if="nextLevelXp" class="home-map__action-xp">+{{ nextLevelXp }} XP</span>
              →
            </button>
            <button type="button" class="level-map__btn level-map__btn--ghost" @click="resetProgress">
              重置进度
            </button>
          </div>
          <div
            v-if="dailyStatus !== 'locked'"
            class="home-map__daily-wrap home-map__daily--mobile"
          >
            <button
              type="button"
              class="level-map__btn level-map__btn--ghost home-map__daily-chip"
              :class="{ 'home-map__daily-chip--done': dailyStatus === 'completed' }"
              :disabled="dailyStatus === 'completed'"
              @click="router.push('/level/' + DAILY_LEVEL_ID)"
            >
              <template v-if="dailyStatus === 'completed'">📅 今日已完成 · 明日刷新</template>
              <template v-else>
                📅 每日特训
                <span class="home-map__action-xp">+{{ dailyXp }} XP</span>
                <span v-if="progressStore.dailyStreak" class="home-map__streak"
                  >🔥 {{ progressStore.dailyStreak }}</span
                >
              </template>
            </button>
            <p v-if="dailyFocus" class="home-map__daily-focus">{{ dailyFocus }}</p>
          </div>
        </div>

        <article
          v-if="dailyStatus !== 'locked'"
          class="home-map__daily-banner home-map__daily--desktop"
          :class="{ 'home-map__daily-banner--done': dailyStatus === 'completed' }"
        >
          <div class="home-map__daily-banner-body">
            <span class="home-map__daily-banner-badge">每日特训</span>
            <h3 class="home-map__daily-banner-title">{{ dailyTitle }}</h3>
            <p v-if="dailyFocus" class="home-map__daily-banner-focus">{{ dailyFocus }}</p>
            <p class="home-map__daily-banner-meta">
              <span v-if="progressStore.dailyStreak" class="home-map__streak"
                >🔥 连续 {{ progressStore.dailyStreak }} 天</span
              >
              <span v-if="dailyStatus === 'completed'">今日已完成 · 明日刷新</span>
              <span v-else-if="dailyStatus === 'available'" class="home-map__xp-hint"
                >通关 +{{ dailyXp }} XP</span
              >
            </p>
          </div>
          <button
            type="button"
            class="home-map__daily-banner-btn"
            :disabled="dailyStatus === 'completed'"
            @click="router.push('/level/' + DAILY_LEVEL_ID)"
          >
            {{ dailyStatus === 'completed' ? '明日刷新' : '开始 →' }}
          </button>
        </article>
        <p v-else class="home-map__daily-locked home-map__daily--desktop">
          📅 每日特训 · 完成第 5 关「登录收官」后解锁
        </p>

        <p v-if="isMobile" class="home-map__fold-hint">
          下方可展开：<strong>职场剧本</strong>、<strong>番外特训</strong>、<strong
            >我的进度</strong
          >
        </p>

        <details
          id="home-progress"
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
          id="home-career"
          class="home-fold home-fold--mobile-collapsible home-fold--career"
          :open="isMobile ? undefined : true"
        >
          <summary class="home-fold__summary">
            职场剧本
            <span v-if="isMobile && workBrief.chapterTitle" class="home-fold__summary-meta">
              {{ workBrief.chapterTitle }}
            </span>
          </summary>
          <div class="home-fold__body">
            <CareerScript />
          </div>
        </details>

        <details
          id="home-side"
          class="home-fold home-fold--mobile-collapsible home-fold--side"
          :open="isMobile ? undefined : true"
        >
          <summary class="home-fold__summary">
            番外 & 每日特训（{{ progressStore.sideCompletedCount }}/{{ sideLevels.length }}）
          </summary>
          <div class="home-fold__body">
            <SideQuestHub />
          </div>
        </details>

        <details
          id="home-phases"
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
          id="home-achievements"
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
