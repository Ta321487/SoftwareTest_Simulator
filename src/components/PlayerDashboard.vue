<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useProgressStore } from '../stores/progressStore'
import { achievements } from '../data/achievements'
import { getRankForXp } from '../data/ranks'
import { sideLevels } from '../data/sideQuests'
import { buildShareText, copyShareText, PLAY_URL } from '../utils/shareProgress'
import { getSharePracticeContext, formatPracticeLine } from '../utils/sharePractice'
import { downloadShareCard } from '../utils/shareCard'
import { getWeakAreas } from '../utils/weakAreas'
import { buildWeakDrillCards, getLowStarLevels } from '../utils/learningPath'
import { phaseOrder, phases, getPhaseProgress } from '../data/phases'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const progressStore = useProgressStore()
const shareMsg = ref('')
const shareError = ref(false)
let shareMsgTimer = null

function showShareMsg(message, isError = false) {
  if (shareMsgTimer) {
    clearTimeout(shareMsgTimer)
    shareMsgTimer = null
  }
  shareMsg.value = message
  shareError.value = isError
  shareMsgTimer = setTimeout(
    () => {
      shareMsg.value = ''
      shareMsgTimer = null
    },
    isError ? 5000 : 3500
  )
}

onUnmounted(() => {
  if (shareMsgTimer) clearTimeout(shareMsgTimer)
})

const rank = computed(() => getRankForXp(progressStore.totalXp))

const focusLevelId = computed(() => {
  const next = progressStore.firstAvailableLevelId
  if (next) return next
  const ids = progressStore.completedLevelIds
  if (!ids.length) return 1
  return Math.max(...ids)
})

const practiceContext = computed(() => getSharePracticeContext(focusLevelId.value))

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
    practiceLine: formatPracticeLine(practiceContext.value),
  })
)

function shareCardPayload() {
  return {
    rankTitle: rank.value.title,
    rankIcon: rank.value.icon,
    xp: progressStore.totalXp,
    stars: progressStore.totalStars,
    mainDone: progressStore.mainCompletedCount,
    mainTotal: progressStore.totalLevelCount,
    sideDone: progressStore.sideCompletedCount,
    sideTotal: sideLevels.length,
    streak: progressStore.dailyStreak || 0,
    practiceContext: practiceContext.value,
  }
}

const weakAreas = computed(() =>
  getWeakAreas({
    levelMistakes: progressStore.levelMistakes,
    levelMeta: progressStore.levelMeta,
    hintsUsed: progressStore.hintsUsed,
    completedLevelIds: progressStore.completedLevelIds,
  })
)

const weakDrillCards = computed(() =>
  buildWeakDrillCards({
    levelMistakes: progressStore.levelMistakes,
    levelMeta: progressStore.levelMeta,
    hintsUsed: progressStore.hintsUsed,
    completedLevelIds: progressStore.completedLevelIds,
  })
)

const lowStarLevels = computed(() =>
  getLowStarLevels(progressStore.levelMeta, progressStore.completedLevelIds)
)

const phaseRows = computed(() =>
  phaseOrder.map((id) => {
    const phase = phases[id]
    const { done, total } = getPhaseProgress(phase, progressStore.completedLevelIds)
    const percent = total ? Math.round((done / total) * 100) : 0
    return { id, icon: phase.icon, name: phase.name, done, total, percent }
  })
)

async function handleShare() {
  try {
    const result = await copyShareText(shareText.value)
    if (result.ok) {
      showShareMsg('成绩已复制，可粘贴到微信；也可点「保存分享图」')
    } else {
      showShareMsg(result.message || '复制失败', true)
    }
  } catch {
    showShareMsg('复制失败，请手动复制下方文本', true)
  }
}

function handleSaveShareImage() {
  try {
    downloadShareCard(shareCardPayload())
    showShareMsg('分享图已下载，可发朋友圈或聊天')
  } catch {
    showShareMsg('生成分享图失败，请稍后重试', true)
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
        <button
          type="button"
          class="level-map__btn level-map__btn--ghost"
          @click="handleSaveShareImage"
        >
          保存分享图
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

    <div class="player-dashboard__phases" :class="{ 'player-dashboard__phases--compact': compact }">
      <div v-for="row in phaseRows" :key="row.id" class="player-dashboard__phase-row">
        <div class="player-dashboard__phase-head">
          <span>{{ row.icon }} {{ row.name }}</span>
          <span>{{ row.done }}/{{ row.total }}</span>
        </div>
        <div class="player-dashboard__phase-bar">
          <div
            class="player-dashboard__phase-fill"
            :class="`player-dashboard__phase-fill--${row.id}`"
            :style="{ width: `${row.percent}%` }"
          />
        </div>
      </div>
    </div>

    <div v-if="!compact && weakDrillCards.length" class="player-dashboard__drill">
      <h3 class="player-dashboard__weak-title">按题型特训</h3>
      <p class="player-dashboard__drill-desc">根据你的薄弱记录，优先巩固这些题型：</p>
      <ul class="player-dashboard__drill-list">
        <li v-for="card in weakDrillCards" :key="card.simType" class="player-dashboard__drill-item">
          <span class="player-dashboard__drill-type">{{ card.simLabel }}</span>
          <span class="player-dashboard__drill-meta">{{ card.weakCount }} 关待加强</span>
          <router-link
            :to="`/level/${card.retryLevelId}`"
            class="player-dashboard__drill-btn"
          >
            冲星 #{{ card.retryLevelId }}
          </router-link>
          <router-link
            v-if="card.sideQuest"
            :to="`/level/${card.sideQuest.levelId}`"
            class="player-dashboard__drill-btn"
          >
            番外 #{{ card.sideQuest.levelId }}
          </router-link>
        </li>
      </ul>
    </div>

    <div v-if="!compact && lowStarLevels.length" class="player-dashboard__weak">
      <h3 class="player-dashboard__weak-title">可冲星重玩</h3>
      <ul class="player-dashboard__weak-list">
        <li v-for="item in lowStarLevels" :key="item.levelId" class="player-dashboard__weak-item">
          <router-link :to="`/level/${item.levelId}`" class="player-dashboard__weak-link">
            #{{ item.levelId }} {{ item.title }}
          </router-link>
          <span class="player-dashboard__weak-reason">当前 ★{{ item.stars }}</span>
        </li>
      </ul>
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
