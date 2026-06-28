<script setup>
import { computed, ref } from 'vue'
import { useProgressStore } from '../stores/progressStore'
import { achievements } from '../data/achievements'
import { getRankForXp } from '../data/ranks'
import { sideLevels } from '../data/sideQuests'
import { buildShareText, copyShareText, PLAY_URL } from '../utils/shareProgress'
import { getWeakAreas } from '../utils/weakAreas'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const progressStore = useProgressStore()
const shareMsg = ref('')
const shareError = ref(false)

const rank = computed(() => getRankForXp(progressStore.totalXp))

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

const weakAreas = computed(() =>
  getWeakAreas({
    levelMistakes: progressStore.levelMistakes,
    levelMeta: progressStore.levelMeta,
    hintsUsed: progressStore.hintsUsed,
    completedLevelIds: progressStore.completedLevelIds,
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
      <h2 class="player-dashboard__title">
        <span class="player-dashboard__rank-icon">{{ rank.icon }}</span>
        {{ rank.title }}
      </h2>
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
        <span class="player-dashboard__stat-value"
          >{{ progressStore.mainCompletedCount }}/{{ progressStore.totalLevelCount }}</span
        >
        <span class="player-dashboard__stat-label">主线</span>
      </div>
      <div class="player-dashboard__stat">
        <span class="player-dashboard__stat-value"
          >{{ progressStore.sideCompletedCount }}/{{ sideLevels.length }}</span
        >
        <span class="player-dashboard__stat-label">番外</span>
      </div>
      <div class="player-dashboard__stat">
        <span class="player-dashboard__stat-value">{{ progressStore.dailyStreak || 0 }}</span>
        <span class="player-dashboard__stat-label">每日连续</span>
      </div>
      <div class="player-dashboard__stat">
        <span class="player-dashboard__stat-value"
          >{{ progressStore.achievements.length }}/{{ achievements.length }}</span
        >
        <span class="player-dashboard__stat-label">成就</span>
      </div>
    </div>

    <div v-if="!compact && weakAreas.length" class="player-dashboard__weak">
      <h3 class="player-dashboard__weak-title">待加强</h3>
      <ul class="player-dashboard__weak-list">
        <li v-for="item in weakAreas" :key="item.levelId" class="player-dashboard__weak-item">
          <router-link :to="`/level/${item.levelId}`" class="player-dashboard__weak-link">
            #{{ item.levelId }} {{ item.title }}
          </router-link>
          <span class="player-dashboard__weak-reason">{{ item.reason }}</span>
        </li>
      </ul>
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
