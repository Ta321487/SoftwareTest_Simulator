<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'
import { useProjectStore } from '../stores/projectStore'
import { phaseOrder } from '../data/phases'
import PhaseTimeline from '../components/workbench/PhaseTimeline.vue'
import RankBadge from '../components/RankBadge.vue'
import AchievementPanel from '../components/AchievementPanel.vue'
import SideQuestHub from '../components/SideQuestHub.vue'
import ProjectTimeline from '../components/workbench/ProjectTimeline.vue'
import PlayerDashboard from '../components/PlayerDashboard.vue'
import OnboardingTour from '../components/OnboardingTour.vue'
import ProgressSettings from '../components/ProgressSettings.vue'
import { HOME_PROJECT_IDS } from '../utils/projectImmersion'
import { sideLevels } from '../data/sideQuests'
import { DAILY_POOL_SIZE } from '../data/dailyChallenges'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const progressStore = useProgressStore()
const onboardingRef = ref(null)

const sideTotal = sideLevels.length

const allCompleted = computed(
  () => progressStore.completedLevelIds.length >= progressStore.totalLevelCount
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
          <p class="workbench__subtitle">主线 27 关 + 番外支线 + 每日特训</p>
        </div>
      </div>
      <div class="workbench__topbar-right">
        <span class="workbench__level-tag">
          {{ progressStore.completedLevelIds.length }}/{{ progressStore.totalLevelCount }} 关
          · ★ {{ progressStore.totalStars }}
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
          <span class="workbench__dock-text">手札</span>
        </button>
      </aside>

      <main class="workbench__main home-map__main">
        <RankBadge :xp="progressStore.totalXp" class="home-map__rank" />

        <PlayerDashboard />

        <section class="home-map__hero">
          <p class="home-map__hero-tag">软件测试 · 闯关游戏</p>
          <h2 class="home-map__hero-title">想学测试的人能玩懂，已经在测的人会心一笑</h2>
          <p class="home-map__hero-desc">
            主线走完测试人上路；番外练安全、性能、流水线；每日特训保持手感。
            攒 XP 升职级——这不只是 demo，是可持续玩的模拟器。
          </p>
        </section>

        <div class="home-map__actions">
          <button
            v-if="!allCompleted && progressStore.firstAvailableLevelId"
            type="button"
            class="level-map__btn level-map__btn--primary"
            @click="continueChallenge"
          >
            继续挑战 →
          </button>
          <button type="button" class="level-map__btn level-map__btn--ghost" @click="resetProgress">
            重置进度
          </button>
        </div>

        <PhaseTimeline
          v-for="phaseId in phaseOrder"
          :key="phaseId"
          :phase-id="phaseId"
        />

        <section class="home-map__projects">
          <h2 class="home-map__projects-title">项目剧本 · 沉浸进度</h2>
          <p class="home-map__projects-desc">
            四大项目线含可选 App / 监控 / 值班体验。通关不依赖这些，但做完更像真实上班。
          </p>
          <ProjectTimeline
            v-for="projectId in HOME_PROJECT_IDS"
            :key="projectId"
            :project-id="projectId"
          />
        </section>

        <SideQuestHub />

        <p class="home-map__extra-note">
          主线 27 关 + 番外 {{ sideTotal }} 关 + 每日特训（{{ DAILY_POOL_SIZE }} 题轮换）
        </p>

        <AchievementPanel class="home-map__achievements" />

        <ProgressSettings @show-onboarding="showOnboarding" />
      </main>
    </div>
  </div>
</template>
