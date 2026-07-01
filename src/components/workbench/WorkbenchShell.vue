<script setup>
import { computed } from 'vue'
import { dockApps } from '../../data/projects'
import { getSeasonMeta } from '../../data/seasonMeta'
import ThemeToggle from '../ThemeToggle.vue'
import AppSidebar from '../AppSidebar.vue'
import WorkInbox from './WorkInbox.vue'
import WorkStatusBar from './WorkStatusBar.vue'
import RankBadge from '../RankBadge.vue'
import { useProgressStore } from '../../stores/progressStore'

const progressStore = useProgressStore()

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
  phase: {
    type: Object,
    default: null,
  },
  phaseStep: {
    type: Object,
    default: null,
  },
  level: {
    type: Object,
    required: true,
  },
  projectDay: {
    type: Object,
    default: null,
  },
  activeDockLevelId: {
    type: Number,
    required: true,
  },
  dockItems: {
    type: Array,
    default: () => [],
  },
  inboxMessages: {
    type: Array,
    default: () => [],
  },
  envStatus: {
    type: Array,
    default: () => [],
  },
  viewMode: {
    type: String,
    default: 'main',
  },
  sutLabel: {
    type: String,
    default: '',
  },
  levelPage: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['dock-change', 'back'])

const isTaskDock = computed(() => props.activeDockLevelId === props.level.id)

const activeArchiveItem = computed(() =>
  props.dockItems.find((d) => d.levelId === props.activeDockLevelId)
)

const headerTitle = computed(() => {
  if (props.viewMode === 'sut') {
    return `🎮 上机实操${props.project ? ` · ${props.project.name}` : ''}`
  }
  if (props.phase && props.phaseStep) {
    return `${props.phase.icon} ${props.phase.name} · 第 ${props.phaseStep.index} 关`
  }
  if (props.project && props.projectDay) {
    return `${props.project.name} · ${props.projectDay.label}`
  }
  return props.level.title
})

const headerSubtitle = computed(() => {
  if (props.viewMode === 'sut') {
    return props.sutLabel || '可选实操，不影响主线通关'
  }
  if (props.phase) return props.level.title
  return props.project?.subtitle || ''
})

const seasonBadge = computed(() => {
  const season = props.level?.season
  if (!season || season === 'extra' || season === 'daily') return null
  return getSeasonMeta(season)
})
</script>

<template>
  <div class="workbench" :class="{ 'workbench--level': levelPage }">
    <header class="workbench__topbar">
      <div class="workbench__topbar-left">
        <button type="button" class="workbench__back" @click="$emit('back')">
          <span class="workbench__back-arrow" aria-hidden="true">←</span
          ><span class="workbench__back-label">首页</span>
        </button>
        <div class="workbench__title-block">
          <h1 class="workbench__title">{{ headerTitle }}</h1>
          <p v-if="headerSubtitle" class="workbench__subtitle">{{ headerSubtitle }}</p>
        </div>
      </div>
      <div class="workbench__topbar-right">
        <WorkInbox :messages="inboxMessages" />
        <RankBadge :xp="progressStore.totalXp" compact class="workbench__rank-compact" />
        <span
          v-if="seasonBadge"
          class="workbench__season-tag"
          :class="seasonBadge.className"
          :title="`${seasonBadge.label}段位`"
          >{{ seasonBadge.label }}</span
        >
        <span class="workbench__level-tag"
          >{{ viewMode === 'sut' ? '上机' : '主线' }} · #{{ level.id }}</span
        >
        <ThemeToggle />
      </div>
    </header>

    <WorkStatusBar :items="envStatus" class="workbench__status-bar" />

    <div class="workbench__body" :class="{ 'workbench__body--sut': viewMode === 'sut' }">
      <AppSidebar
        v-if="viewMode === 'main'"
        current="level"
        :active-level-id="activeDockLevelId"
        :task-level-id="level.id"
        :project-name="project?.name"
        :project-items="dockItems"
        @dock-change="$emit('dock-change', $event)"
      />

      <main
        class="workbench__main"
        :class="{ 'workbench__main--archive': viewMode === 'main' && !isTaskDock }"
      >
        <div
          v-if="!isTaskDock"
          class="workbench__context-banner workbench__context-banner--archive"
        >
          <div class="workbench__context-banner-text">
            <span class="workbench__context-banner-badge">历史档案</span>
            <span class="workbench__context-banner-label">
              {{ activeArchiveItem?.dayLabel || '产出' }} ·
              {{ dockApps[activeArchiveItem?.simType]?.label || '阶段工具' }}
            </span>
            <span class="workbench__context-banner-hint">只读回顾，不能在此提交判题</span>
          </div>
          <button
            type="button"
            class="workbench__context-back"
            @click="$emit('dock-change', level.id)"
          >
            ← 回到今日任务
          </button>
        </div>

        <slot />
      </main>
    </div>
  </div>
</template>
