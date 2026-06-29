<script setup>
import { computed, ref } from 'vue'
import { careerChapters, getChapterProgress, isChapterLocked } from '../data/careerScript'
import { useProgressStore } from '../stores/progressStore'
import { useMobileLayout } from '../composables/useMobileLayout'
import ProjectTimeline from './workbench/ProjectTimeline.vue'
import ScriptBeatTrack from './workbench/ScriptBeatTrack.vue'

const progressStore = useProgressStore()
const { isMobile } = useMobileLayout()
const expandedChapterIds = ref(new Set())

const chapters = computed(() =>
  careerChapters.map((chapter) => {
    const locked = isChapterLocked(chapter, progressStore.completedLevelIds)
    const progress = getChapterProgress(chapter, progressStore.completedLevelIds)
    const active =
      !locked &&
      progress.done < progress.total &&
      careerChapters.find(
        (ch) =>
          !isChapterLocked(ch, progressStore.completedLevelIds) &&
          getChapterProgress(ch, progressStore.completedLevelIds).done <
            getChapterProgress(ch, progressStore.completedLevelIds).total
      )?.id === chapter.id
    return {
      ...chapter,
      locked,
      progress,
      active,
      done: !locked && progress.done >= progress.total,
    }
  })
)

function chapterOpen(chapter) {
  if (!isMobile.value) return true
  return chapter.active || expandedChapterIds.value.has(chapter.id)
}

function onChapterToggle(chapter, event) {
  if (!isMobile.value) return
  if (event.target.open) expandedChapterIds.value.add(chapter.id)
  else expandedChapterIds.value.delete(chapter.id)
}
</script>

<template>
  <section class="career-script" aria-label="职场全流程剧本">
    <header class="career-script__intro">
      <h2 class="career-script__title">职场剧本</h2>
      <p class="career-script__desc">
        假设你在一家软件公司的测试部上班——从新人营、求职、入职到值班与带团队，按章节推进即可。
      </p>
    </header>

    <details
      v-for="chapter in chapters"
      :key="chapter.id"
      class="career-script__chapter career-script__chapter-fold"
      :class="{
        'career-script__chapter--active': chapter.active,
        'career-script__chapter--done': chapter.done,
        'career-script__chapter--locked': chapter.locked,
      }"
      :open="chapterOpen(chapter)"
      @toggle="onChapterToggle(chapter, $event)"
    >
      <summary class="career-script__chapter-summary">
        <span class="career-script__summary-num">第 {{ chapter.chapter }} 章</span>
        <span class="career-script__summary-title">{{ chapter.title }}</span>
        <span class="career-script__summary-meta">
          <span v-if="chapter.locked" class="career-script__chapter-lock">🔒</span>
          <span v-else class="career-script__chapter-progress">
            {{ chapter.progress.done }}/{{ chapter.progress.total }}
          </span>
        </span>
      </summary>

      <div class="career-script__chapter-body">
        <header class="career-script__chapter-head">
          <div class="career-script__chapter-meta">
            <span class="career-script__chapter-num">第 {{ chapter.chapter }} 章</span>
            <span class="career-script__chapter-badge">{{ chapter.badge }}</span>
            <span v-if="chapter.period" class="career-script__chapter-period">{{
              chapter.period
            }}</span>
          </div>
          <div class="career-script__chapter-row">
            <h3 class="career-script__chapter-title">{{ chapter.title }}</h3>
            <span v-if="chapter.locked" class="career-script__chapter-lock">🔒 第一季结业后解锁</span>
            <span v-else class="career-script__chapter-progress">
              {{ chapter.progress.done }}/{{ chapter.progress.total }}
            </span>
          </div>
        </header>

        <details class="career-script__lore" :open="isMobile ? undefined : true">
          <summary class="career-script__lore-summary">背景 · 目标 · 带教</summary>
          <div class="career-script__lore-body">
            <p class="career-script__chapter-scene">{{ chapter.scene }}</p>
            <p v-if="chapter.goal" class="career-script__chapter-goal">
              <strong>本章目标</strong> {{ chapter.goal }}
            </p>
            <blockquote v-if="chapter.mentor" class="career-script__mentor">
              <span class="career-script__mentor-avatar">{{ chapter.mentor.avatar }}</span>
              <div class="career-script__mentor-body">
                <cite class="career-script__mentor-from">{{ chapter.mentor.from }}</cite>
                <p>{{ chapter.mentor.text }}</p>
              </div>
            </blockquote>
          </div>
        </details>

        <div v-if="!chapter.locked" class="career-script__beats">
          <template v-for="(beat, index) in chapter.beats" :key="`${chapter.id}-${index}`">
            <ProjectTimeline
              v-if="beat.type === 'project'"
              :project-id="beat.projectId"
              :level-ids="beat.levelIds"
              embedded
              :next-focus="isMobile"
            />
            <ScriptBeatTrack
              v-else-if="beat.type === 'levels'"
              :level-ids="beat.levelIds"
              :labels="beat.labels"
              :label-prefix="beat.labelPrefix"
              :next-focus="isMobile"
            />
          </template>
        </div>
      </div>
    </details>
  </section>
</template>
