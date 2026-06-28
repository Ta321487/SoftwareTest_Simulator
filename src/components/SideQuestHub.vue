<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { sideLevels, sideArcs, getUnlockHint } from '../data/sideQuests'
import { DAILY_LEVEL_ID } from '../data/dailyChallenges'
import { useProgressStore } from '../stores/progressStore'

const router = useRouter()
const progressStore = useProgressStore()

const sideCards = computed(() =>
  sideLevels.map((level) => {
    const arc = sideArcs.find((a) => a.id === level.sideArc)
    const status = progressStore.getSideQuestStatus(level.id)
    const meta = progressStore.getLevelMeta(level.id)
    return {
      ...level,
      arc,
      status,
      stars: meta?.stars || 0,
      unlockHint: getUnlockHint(level),
    }
  })
)

const sideProgress = computed(() => {
  const done = sideCards.value.filter((c) => c.status === 'completed').length
  return { done, total: sideCards.value.length }
})

const dailyStatus = computed(() => progressStore.getDailyStatus())

function starLine(n) {
  if (!n) return ''
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}

function goLevel(id) {
  router.push('/level/' + id)
}
</script>

<template>
  <section class="side-hub">
    <header class="side-hub__header">
      <div>
        <h2 class="side-hub__title">
          <span class="side-hub__icon">🎬</span>
          番外 & 特训
        </h2>
        <p class="side-hub__subtitle">
          主线之外的真实场景——安全、性能、流水线、兼容性。完成主线里程碑解锁，不影响职级晋升。
        </p>
      </div>
      <span class="side-hub__progress">{{ sideProgress.done }}/{{ sideProgress.total }} 番外</span>
    </header>

    <article
      class="side-hub__daily"
      :class="[
        `side-hub__daily--${dailyStatus}`,
        { 'side-hub__daily--done': dailyStatus === 'completed' },
      ]"
    >
      <div class="side-hub__daily-body">
        <span class="side-hub__daily-badge">📅 每日特训</span>
        <h3 class="side-hub__daily-title">
          {{ dailyStatus === 'locked' ? '完成登录收官关（第 5 关）后解锁' : '今日一题 · 轮换题库' }}
        </h3>
        <p v-if="dailyStatus !== 'locked'" class="side-hub__daily-meta">
          连续 {{ progressStore.dailyStreak }} 天
          <span v-if="dailyStatus === 'completed'"> · 今日已完成 ✓</span>
        </p>
      </div>
      <button
        type="button"
        class="side-hub__daily-btn"
        :disabled="dailyStatus === 'locked'"
        @click="goLevel(DAILY_LEVEL_ID)"
      >
        {{ dailyStatus === 'completed' ? '再看今日' : dailyStatus === 'locked' ? '🔒' : '开始 →' }}
      </button>
    </article>

    <div class="side-hub__grid">
      <button
        v-for="card in sideCards"
        :key="card.id"
        type="button"
        class="side-hub__card"
        :class="[`side-hub__card--${card.status}`, `side-hub__card--arc-${card.sideArc}`]"
        :disabled="card.status === 'locked'"
        @click="goLevel(card.id)"
      >
        <span class="side-hub__card-arc">{{ card.arc?.icon }} {{ card.arc?.name }}</span>
        <span class="side-hub__card-id">EX-{{ card.id - 100 }}</span>
        <h3 class="side-hub__card-title">{{ card.title }}</h3>
        <p class="side-hub__card-tagline">{{ card.arc?.tagline }}</p>
        <div class="side-hub__card-foot">
          <span v-if="card.stars" class="side-hub__card-stars">{{ starLine(card.stars) }}</span>
          <span class="side-hub__card-status">
            {{ card.status === 'completed' ? '✓' : card.status === 'available' ? '▶' : '🔒' }}
          </span>
        </div>
        <p v-if="card.status === 'locked'" class="side-hub__card-lock">{{ card.unlockHint }}</p>
      </button>
    </div>
  </section>
</template>
