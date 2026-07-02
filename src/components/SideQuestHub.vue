<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { sideLevels, sideArcs, getUnlockHint, sideChapters } from '../data/sideQuests'
import { DAILY_LEVEL_ID, getTodayDailyChallenge, getDailyFocusHint } from '../data/dailyChallenges'
import { useProgressStore } from '../stores/progressStore'
import { useMobileLayout } from '../composables/useMobileLayout'
import ToolchainSkillTree from './workbench/ToolchainSkillTree.vue'
import QuestPathMap from './workbench/QuestPathMap.vue'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const progressStore = useProgressStore()
const { isMobile } = useMobileLayout()
const expandedChapterIds = ref(new Set())
const selectedArcByChapter = ref({})
const arcToast = ref('')
let arcToastTimer = null

const chapterSubtitle = computed(() => {
  const parts = chaptersWithArcs.value.map((c) => {
    const short = c.name.replace(/^第[一二三四]章 · /, '')
    return c.recommended ? `${short}（${c.total} 关，推荐）` : `${short}（${c.total} 关）`
  })
  return `${parts.join(' · ')} · 每日一题，不影响主线进度。`
})

const dailyStatus = computed(() => progressStore.getDailyStatus())

const dailyXp = computed(() => getTodayDailyChallenge().xpReward ?? 0)
const todayDaily = computed(() => getTodayDailyChallenge())
const dailyFocus = computed(() =>
  dailyStatus.value === 'locked' ? '' : getDailyFocusHint(todayDaily.value)
)
const dailyTitle = computed(() => {
  if (dailyStatus.value === 'locked') return '完成登录收官关（第 5 关）后解锁'
  const raw = todayDaily.value?.title || ''
  return raw.replace(/^今日：/, '') || '今日一题'
})

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

const chaptersWithArcs = computed(() =>
  sideChapters.map((chapter) => {
    const arcs = arcsWithLevels.value.filter((a) => a.parentChapter === chapter.id)
    const done = arcs.reduce((sum, a) => sum + a.done, 0)
    const total = arcs.reduce((sum, a) => sum + a.total, 0)
    const complete = total > 0 && done >= total
    const active = arcs.some((a) => a.active)
    return {
      ...chapter,
      arcs,
      done,
      total,
      complete,
      active,
    }
  })
)

function activeArcIdForChapter(chapterId, arcs) {
  for (const arc of arcs) {
    if (arc.active) return arc.id
  }
  const available = arcs.find((a) => a.levels.some((l) => l.status === 'available'))
  return available?.id ?? arcs[0]?.id
}

function currentArcForChapter(chapter) {
  const arcs = chapter.arcs || []
  const selected = selectedArcByChapter.value[chapter.id]
  const activeId = activeArcIdForChapter(chapter.id, arcs)
  const id = selected || activeId
  return arcs.find((a) => a.id === id)
}

function pathNodesForChapter(chapter) {
  return (currentArcForChapter(chapter)?.levels || []).map((card) => ({
    levelId: card.id,
    label: `EX-${card.id - 100}`,
    title: card.title,
    status: card.status,
  }))
}

function selectChapterArc(chapterId, arcId) {
  selectedArcByChapter.value = { ...selectedArcByChapter.value, [chapterId]: arcId }
}

function formatArcTabLabel(name) {
  return String(name || '')
    .replace(/ · 选修$/, '')
    .replace(/ · 实操$/, '')
    .replace(/线$/, '')
}

watch(
  chaptersWithArcs,
  (chapters) => {
    for (const chapter of chapters) {
      if (chapter.recommended || !chapter.arcs?.length) continue
      if (selectedArcByChapter.value[chapter.id]) continue
      const activeId = activeArcIdForChapter(chapter.id, chapter.arcs)
      if (activeId) {
        selectedArcByChapter.value = { ...selectedArcByChapter.value, [chapter.id]: activeId }
      }
    }
  },
  { immediate: true }
)

function goLevel(id) {
  router.push('/level/' + id)
}

function chapterOpen(chapter) {
  if (!isMobile.value) {
    return expandedChapterIds.value.has(chapter.id)
  }
  return chapter.active || expandedChapterIds.value.has(chapter.id)
}

function onChapterToggle(chapter, event) {
  if (event.target.open) expandedChapterIds.value.add(chapter.id)
  else expandedChapterIds.value.delete(chapter.id)
}

watch(
  arcsWithLevels,
  (arcs, prev) => {
    if (!prev?.length) return
    for (const arc of arcs) {
      if (!arc.complete) continue
      const was = prev.find((a) => a.id === arc.id)
      if (was && !was.complete) {
        arcToast.value = `🎉 ${arc.icon} ${arc.name} 通关！`
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
  <section class="side-hub" :class="{ 'side-hub--compact': compact }">
    <header v-if="!compact" class="side-hub__header">
      <div>
        <h2 class="side-hub__title">
          <span class="side-hub__icon">🎬</span>
          番外 & 特训
        </h2>
        <p class="side-hub__subtitle">{{ chapterSubtitle }}</p>
      </div>
      <span class="side-hub__progress">{{ sideProgress.done }}/{{ sideProgress.total }} 番外</span>
    </header>

    <article
      v-if="!compact"
      class="side-hub__daily"
      :class="[
        `side-hub__daily--${dailyStatus}`,
        { 'side-hub__daily--done': dailyStatus === 'completed' },
      ]"
    >
      <div class="side-hub__daily-body">
        <span class="side-hub__daily-badge">每日特训</span>
        <h3 class="side-hub__daily-title">{{ dailyTitle }}</h3>
        <p v-if="dailyFocus" class="side-hub__daily-focus">{{ dailyFocus }}</p>
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
        {{
          dailyStatus === 'completed' ? '明日刷新' : dailyStatus === 'locked' ? '🔒 未解锁' : '开始'
        }}
      </button>
    </article>

    <div
      v-for="chapter in chaptersWithArcs"
      :key="chapter.id"
      class="side-hub__chapter"
      :class="{
        'side-hub__chapter--recommended': chapter.recommended,
        'side-hub__chapter--elective': chapter.elective,
        'side-hub__chapter--done': chapter.complete,
      }"
    >
      <details
        class="side-hub__chapter-fold"
        :open="chapterOpen(chapter)"
        @toggle="onChapterToggle(chapter, $event)"
      >
        <summary class="side-hub__chapter-summary">
          <span class="side-hub__chapter-icon">{{ chapter.icon }}</span>
          <span class="side-hub__chapter-name">{{ chapter.name }}</span>
          <span class="side-hub__chapter-badge">{{ chapter.badge }}</span>
          <span class="side-hub__chapter-progress">{{ chapter.done }}/{{ chapter.total }}</span>
        </summary>

        <div class="side-hub__chapter-body">
          <p v-if="!chapter.recommended" class="side-hub__chapter-tagline">{{ chapter.tagline }}</p>

          <ToolchainSkillTree v-if="chapter.recommended" />

          <template v-else>
            <div
              class="skill-tree__arcs side-hub__arc-grid"
              :class="{ 'side-hub__arc-grid--dense': chapter.arcs.length > 8 }"
              role="tablist"
            >
              <button
                v-for="arc in chapter.arcs"
                :key="arc.id"
                type="button"
                role="tab"
                class="skill-tree__arc"
                :class="{
                  'skill-tree__arc--active':
                    (selectedArcByChapter[chapter.id] ||
                      activeArcIdForChapter(chapter.id, chapter.arcs)) === arc.id,
                  'skill-tree__arc--available': arc.active,
                  'skill-tree__arc--done': arc.complete,
                }"
                :aria-selected="
                  (selectedArcByChapter[chapter.id] ||
                    activeArcIdForChapter(chapter.id, chapter.arcs)) === arc.id
                "
                @click="selectChapterArc(chapter.id, arc.id)"
              >
                <span class="skill-tree__arc-icon">{{ arc.icon }}</span>
                <span class="skill-tree__arc-name">{{ formatArcTabLabel(arc.name) }}</span>
                <span class="skill-tree__arc-progress">{{ arc.done }}/{{ arc.total }}</span>
              </button>
            </div>
            <p v-if="currentArcForChapter(chapter)" class="skill-tree__arc-tagline">
              {{ currentArcForChapter(chapter).tagline }}
            </p>
            <QuestPathMap
              v-if="pathNodesForChapter(chapter).length"
              :nodes="pathNodesForChapter(chapter)"
              size="sm"
            />
          </template>
        </div>
      </details>
    </div>

    <p v-if="arcToast" class="side-hub__toast">{{ arcToast }}</p>
  </section>
</template>
