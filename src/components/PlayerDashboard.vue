<script setup>
import { computed, ref } from 'vue'
import { useProgressStore } from '../stores/progressStore'
import { phaseOrder, phases, getPhaseProgress } from '../data/phases'
import { achievements } from '../data/achievements'
import { getRankForXp } from '../data/ranks'
import { sideLevels } from '../data/sideQuests'
import { buildShareText, copyShareText, PLAY_URL } from '../utils/shareProgress'

const progressStore = useProgressStore()
const shareMsg = ref('')
const shareError = ref(false)

const rank = computed(() => getRankForXp(progressStore.totalXp))

const phaseStats = computed(() =>
  phaseOrder.map((phaseId) => {
    const phase = phases[phaseId]
    const { done, total } = getPhaseProgress(phase, progressStore.completedLevelIds)
    return {
      id: phaseId,
      icon: phase.icon,
      name: phase.name,
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
    }
  })
)

const shareText = computed(() =>
  buildShareText({
    rankTitle: rank.value.title,
    rankIcon: rank.value.icon,
    xp: progressStore.totalXp,
    stars: progressStore.totalStars,
    mainDone: progressStore.mainCompletedCount,
    mainTotal: progressStore.totalLevelCount,
    sideDone: progressStore.sideCompletedCount,
    sideTotal: sideLevels.length,
    streak: progressStore.dailyStreak || 0,
    achievementDone: progressStore.achievements.length,
    achievementTotal: achievements.length,
  })
)

async function handleShare() {
  shareMsg.value = ''
  try {
    const result = await copyShareText(shareText.value)
    if (result.ok) {
      shareMsg.value = '成绩已复制，可以粘贴到微信/朋友圈'
      shareError.value = false
    } else {
      shareMsg.value = result.message || '复制失败'
      shareError.value = true
    }
  } catch {
    shareMsg.value = '复制失败，请手动复制下方文本'
    shareError.value = true
  }
}
</script>

<template>
  <section class="player-dashboard">
    <header class="player-dashboard__header">
      <h2 class="player-dashboard__title">我的进度</h2>
      <div class="player-dashboard__actions">
        <button type="button" class="level-map__btn level-map__btn--ghost" @click="handleShare">
          分享成绩
        </button>
        <a
          :href="PLAY_URL"
          class="level-map__btn level-map__btn--ghost player-dashboard__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          在线版 ↗
        </a>
      </div>
    </header>

    <div class="player-dashboard__grid">
      <div class="player-dashboard__stat">
        <span class="player-dashboard__stat-value">{{ progressStore.mainCompletedCount }}/{{ progressStore.totalLevelCount }}</span>
        <span class="player-dashboard__stat-label">主线</span>
      </div>
      <div class="player-dashboard__stat">
        <span class="player-dashboard__stat-value">{{ progressStore.sideCompletedCount }}/{{ sideLevels.length }}</span>
        <span class="player-dashboard__stat-label">番外</span>
      </div>
      <div class="player-dashboard__stat">
        <span class="player-dashboard__stat-value">{{ progressStore.dailyStreak || 0 }}</span>
        <span class="player-dashboard__stat-label">每日连续</span>
      </div>
      <div class="player-dashboard__stat">
        <span class="player-dashboard__stat-value">{{ progressStore.achievements.length }}/{{ achievements.length }}</span>
        <span class="player-dashboard__stat-label">成就</span>
      </div>
    </div>

    <div class="player-dashboard__phases">
      <div v-for="phase in phaseStats" :key="phase.id" class="player-dashboard__phase">
        <div class="player-dashboard__phase-head">
          <span>{{ phase.icon }} {{ phase.name }}</span>
          <span>{{ phase.done }}/{{ phase.total }}</span>
        </div>
        <div class="player-dashboard__phase-bar">
          <div
            class="player-dashboard__phase-fill"
            :class="`player-dashboard__phase-fill--${phase.id}`"
            :style="{ width: phase.percent + '%' }"
          />
        </div>
      </div>
    </div>

    <p
      v-if="shareMsg"
      class="player-dashboard__msg"
      :class="{ 'player-dashboard__msg--error': shareError }"
    >
      {{ shareMsg }}
    </p>
  </section>
</template>
