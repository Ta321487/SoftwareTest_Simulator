<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'
import { useProjectStore } from '../stores/projectStore'
import CareerMap from '../components/CareerMap.vue'
import PlayerDashboard from '../components/PlayerDashboard.vue'
import SideQuestHub from '../components/SideQuestHub.vue'
import ProjectTimeline from '../components/workbench/ProjectTimeline.vue'
import AchievementPanel from '../components/AchievementPanel.vue'
import OnboardingTour from '../components/OnboardingTour.vue'
import ProgressSettings from '../components/ProgressSettings.vue'
import { HOME_PROJECT_IDS } from '../utils/projectImmersion'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const progressStore = useProgressStore()
const onboardingRef = ref(null)

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
          <p class="workbench__subtitle">主线 27 关 · 番外支线 · 每日特训</p>
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
        <PlayerDashboard />

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

        <CareerMap />

        <SideQuestHub />

        <details class="home-fold">
          <summary class="home-fold__summary">项目剧本 · 沉浸进度（可选）</summary>
          <div class="home-fold__body">
            <p class="home-map__projects-desc">
              四大项目线含 App / 监控 / 值班体验。通关不依赖这些，但做完更像真实上班。
            </p>
            <ProjectTimeline
              v-for="projectId in HOME_PROJECT_IDS"
              :key="projectId"
              :project-id="projectId"
            />
          </div>
        </details>

        <details class="home-fold">
          <summary class="home-fold__summary">成就与存档</summary>
          <div class="home-fold__body">
            <AchievementPanel class="home-map__achievements" />
            <ProgressSettings @show-onboarding="showOnboarding" />
          </div>
        </details>
      </main>
    </div>
  </div>
</template>
