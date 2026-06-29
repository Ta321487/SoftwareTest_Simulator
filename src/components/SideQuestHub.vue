<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { sideLevels, sideArcs, getUnlockHint } from '../data/sideQuests'
import { DAILY_LEVEL_ID, getTodayDailyChallenge } from '../data/dailyChallenges'
import { useProgressStore } from '../stores/progressStore'
import { useMobileLayout } from '../composables/useMobileLayout'

const router = useRouter()
const progressStore = useProgressStore()
const { isMobile } = useMobileLayout()
const expandedArcIds = ref(new Set())
const arcToast = ref('')
let arcToastTimer = null

const dailyXp = computed(() => getTodayDailyChallenge().xpReward ?? 0)

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

const activeArcId = computed(() => {
  for (const arc of sideArcs) {
    const levels = sideCards.value.filter((c) => c.sideArc === arc.id)
    if (!levels.length) continue
    const done = levels.filter((l) => l.status === 'completed').length
    if (done < levels.length && levels.some((l) => l.status !== 'locked')) return arc.id
  }
  const available = sideCards.value.find((c) => c.status === 'available')
  return available?.sideArc ?? sideArcs[0]?.id
})

const arcsWithLevels = computed(() =>
  sideArcs.map((arc) => {
    const levels = sideCards.value.filter((c) => c.sideArc === arc.id)
    const done = levels.filter((l) => l.status === 'completed').length
    return {
      ...arc,
      levels,
      done,
      total: levels.length,
      complete: levels.length > 0 && done >= levels.length,
      active: activeArcId.value === arc.id && done < levels.length,
    }
  })
)

function starLine(n) {
  if (!n) return ''
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}

function goLevel(id) {
  router.push('/level/' + id)
}

function arcOpen(arc) {
  if (!isMobile.value) return true
  return arc.active || expandedArcIds.value.has(arc.id)
}

function onArcToggle(arc, event) {
  if (!isMobile.value) return
  if (event.target.open) expandedArcIds.value.add(arc.id)
  else expandedArcIds.value.delete(arc.id)
}

watch(
  arcsWithLevels,
  (arcs, prev) => {
    if (!prev?.length) return
    for (const arc of arcs) {
      if (!arc.complete) continue
      const was = prev.find((a) => a.id === arc.id)
      if (was && !was.complete) {
        arcToast.value = `🎉 ${arc.icon} ${arc.name} 番外线通关！`
        if (arcToastTimer) clearTimeout(arcToastTimer)
        arcToastTimer = setTimeout(() => {
          arcToast.value = ''
          arcToastTimer = null
        }, 4000)
      }
    }
  },
  { deep: true }
)

onUnmounted(() => {
  if (arcToastTimer) clearTimeout(arcToastTimer)
})
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
          <span v-if="progressStore.dailyStreak" class="side-hub__streak"
            >🔥 连续 {{ progressStore.dailyStreak }} 天</span
          >
          <span v-if="dailyStatus === 'completed'"> · 今日已完成 · 明日刷新</span>
          <span v-else-if="dailyStatus === 'available'" class="side-hub__xp-hint">
            · 通关 +{{ dailyXp }} XP</span
          >
        </p>
      </div>
      <button
        type="button"
        class="side-hub__daily-btn"
        :disabled="dailyStatus === 'locked'"
        @click="goLevel(DAILY_LEVEL_ID)"
      >
        {{ dailyStatus === 'completed' ? '明日刷新' : dailyStatus === 'locked' ? '🔒' : '开始 →' }}
      </button>
    </article>

    <div v-if="!isMobile" class="side-hub__grid">
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
          <span v-if="card.xpReward && card.status === 'available'" class="side-hub__card-xp"
            >+{{ card.xpReward }} XP</span
          >
          <span v-else-if="card.stars" class="side-hub__card-stars">{{
            starLine(card.stars)
          }}</span>
          <span class="side-hub__card-status">
            {{ card.status === 'completed' ? '✓' : card.status === 'available' ? '▶' : '🔒' }}
          </span>
        </div>
        <p v-if="card.status === 'locked'" class="side-hub__card-lock">{{ card.unlockHint }}</p>
      </button>
    </div>

    <div v-else class="side-hub__arcs">
      <details
        v-for="arc in arcsWithLevels"
        :key="arc.id"
        class="side-hub__arc-fold"
        :class="{
          'side-hub__arc-fold--active': arc.active,
          'side-hub__arc-fold--done': arc.complete,
        }"
        :open="arcOpen(arc)"
        @toggle="onArcToggle(arc, $event)"
      >
        <summary class="side-hub__arc-summary">
          <span class="side-hub__arc-summary-icon">{{ arc.icon }}</span>
          <span class="side-hub__arc-summary-name">{{ arc.name }}</span>
          <span class="side-hub__arc-summary-meta">
            <span v-if="arc.complete" class="side-hub__arc-badge">通关</span>
            <span class="side-hub__arc-progress">{{ arc.done }}/{{ arc.total }}</span>
          </span>
        </summary>
        <div class="side-hub__arc-body">
          <p class="side-hub__arc-tagline">{{ arc.tagline }}</p>
          <div class="side-hub__arc-grid">
            <button
              v-for="card in arc.levels"
              :key="card.id"
              type="button"
              class="side-hub__card side-hub__card--compact"
              :class="[`side-hub__card--${card.status}`, `side-hub__card--arc-${card.sideArc}`]"
              :disabled="card.status === 'locked'"
              @click="goLevel(card.id)"
            >
              <span class="side-hub__card-id">EX-{{ card.id - 100 }}</span>
              <h3 class="side-hub__card-title">{{ card.title }}</h3>
              <div class="side-hub__card-foot">
                <span v-if="card.xpReward && card.status === 'available'" class="side-hub__card-xp"
                  >+{{ card.xpReward }} XP</span
                >
                <span v-else-if="card.stars" class="side-hub__card-stars">{{
                  starLine(card.stars)
                }}</span>
                <span class="side-hub__card-status">
                  {{ card.status === 'completed' ? '✓' : card.status === 'available' ? '▶' : '🔒' }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </details>
    </div>
    <p v-if="arcToast" class="side-hub__toast">{{ arcToast }}</p>
  </section>
</template>
