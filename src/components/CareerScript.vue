<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  careerChapters,
  getChapterProgress,
  isChapterLocked,
  getBeatLevelIds,
  findActiveChapter,
} from '../data/careerScript'
import { projects } from '../data/projects'
import { getLevelById } from '../utils/levelRegistry'
import { useProgressStore } from '../stores/progressStore'
import { useProjectStore } from '../stores/projectStore'
import { getProjectImmersion } from '../utils/projectImmersion'
import { buildSutRoute } from '../utils/sutImmersion'
import QuestPathMap from './workbench/QuestPathMap.vue'

const router = useRouter()
const progressStore = useProgressStore()
const projectStore = useProjectStore()

const chapters = computed(() =>
  careerChapters.map((chapter) => {
    const locked = isChapterLocked(chapter, progressStore.completedLevelIds)
    const progress = getChapterProgress(chapter, progressStore.completedLevelIds)
    const active =
      !locked &&
      progress.done < progress.total &&
      findActiveChapter(progressStore.completedLevelIds)?.id === chapter.id
    return {
      ...chapter,
      locked,
      progress,
      active,
      done: !locked && progress.done >= progress.total,
    }
  })
)

const activeChapterId = computed(() => findActiveChapter(progressStore.completedLevelIds)?.id)
const selectedChapterId = ref(activeChapterId.value || careerChapters[0]?.id)

watch(activeChapterId, (id) => {
  if (id) selectedChapterId.value = id
})

const selectedChapter = computed(
  () => chapters.value.find((c) => c.id === selectedChapterId.value) || chapters.value[0]
)

function selectChapter(chapter) {
  if (chapter.locked) return
  selectedChapterId.value = chapter.id
}

function beatNodes(beat) {
  const ids = getBeatLevelIds(beat)
  if (beat.type === 'project') {
    const project = projects[beat.projectId]
    return ids.map((levelId) => {
      const day = project?.days?.find((d) => d.levelId === levelId)
      const level = getLevelById(levelId)
      return {
        levelId,
        label: day?.label || `#${levelId}`,
        title: day?.title || level?.title || '',
      }
    })
  }
  return ids.map((levelId) => {
    const level = getLevelById(levelId)
    return {
      levelId,
      label: beat.labels?.[levelId] || `#${levelId}`,
      title: level?.title || '',
    }
  })
}

function immersionForBeat(beat) {
  if (beat.type !== 'project') return null
  return getProjectImmersion(beat.projectId, projectStore)
}

function openImmersion(item, levelId) {
  if (progressStore.getStatus(levelId) === 'locked') return
  router.push(buildSutRoute(levelId, item.dock))
}
</script>

<template>
  <section class="career-script career-script--compact" aria-label="职场全流程剧本">
    <nav class="chapter-strip" aria-label="章节选择">
      <button
        v-for="(chapter, index) in chapters"
        :key="chapter.id"
        type="button"
        class="chapter-strip__node"
        :class="{
          'chapter-strip__node--active': chapter.active,
          'chapter-strip__node--done': chapter.done,
          'chapter-strip__node--locked': chapter.locked,
          'chapter-strip__node--selected': selectedChapterId === chapter.id,
          'chapter-strip__node--last': index === chapters.length - 1,
        }"
        :aria-disabled="chapter.locked || undefined"
        :title="chapter.title"
        @click="selectChapter(chapter)"
      >
        <span class="chapter-strip__dot">
          <template v-if="chapter.locked">🔒</template>
          <template v-else-if="chapter.done">✓</template>
          <template v-else>{{ chapter.chapter }}</template>
        </span>
        <span class="chapter-strip__num">第{{ chapter.chapter }}章</span>
        <span class="chapter-strip__name">{{ chapter.title }}</span>
      </button>
    </nav>

    <article
      v-if="selectedChapter"
      class="career-script__panel"
      :class="{ 'career-script__panel--active': selectedChapter.active }"
    >
      <header class="career-script__panel-head">
        <h3 class="career-script__panel-title">
          第 {{ selectedChapter.chapter }} 章 · {{ selectedChapter.title }}
        </h3>
        <span v-if="selectedChapter.locked" class="career-script__panel-meta"
          >🔒 第一季结业后解锁</span
        >
        <span v-else class="career-script__panel-meta">
          {{ selectedChapter.progress.done }}/{{ selectedChapter.progress.total }} ·
          {{ selectedChapter.badge }}
        </span>
      </header>

      <details class="career-script__lore">
        <summary class="career-script__lore-summary">背景与带教</summary>
        <div class="career-script__lore-body">
          <p class="career-script__chapter-scene">{{ selectedChapter.scene }}</p>
          <p v-if="selectedChapter.goal" class="career-script__chapter-goal">
            <strong>目标</strong> {{ selectedChapter.goal }}
          </p>
          <blockquote v-if="selectedChapter.mentor" class="career-script__mentor">
            <span class="career-script__mentor-avatar">{{ selectedChapter.mentor.avatar }}</span>
            <div class="career-script__mentor-body">
              <cite class="career-script__mentor-from">{{ selectedChapter.mentor.from }}</cite>
              <p>{{ selectedChapter.mentor.text }}</p>
            </div>
          </blockquote>
        </div>
      </details>

      <div v-if="!selectedChapter.locked" class="career-script__beats">
        <template
          v-for="(beat, index) in selectedChapter.beats"
          :key="`${selectedChapter.id}-${index}`"
        >
          <p v-if="beat.type === 'project'" class="career-script__beat-label">
            {{ projects[beat.projectId]?.name }}
          </p>
          <div
            v-if="beat.type === 'project' && immersionForBeat(beat)?.total"
            class="career-script__immersion-row"
          >
            <button
              v-for="item in immersionForBeat(beat).items"
              :key="item.key"
              type="button"
              class="career-script__immersion-chip"
              :class="{
                'career-script__immersion-chip--done': item.done,
                'career-script__immersion-chip--locked':
                  progressStore.getStatus(item.levelId) === 'locked',
              }"
              :aria-disabled="progressStore.getStatus(item.levelId) === 'locked' || undefined"
              @click="openImmersion(item, item.levelId)"
            >
              {{ item.done ? '✓' : '▶' }} {{ item.label }}
            </button>
          </div>
          <QuestPathMap :nodes="beatNodes(beat)" size="sm" />
        </template>
      </div>
    </article>
  </section>
</template>
