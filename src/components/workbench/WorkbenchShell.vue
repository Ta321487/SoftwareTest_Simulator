<script setup>
import { computed, ref } from 'vue'
import { dockApps } from '../../data/projects'
import ThemeToggle from '../ThemeToggle.vue'
import WorkInbox from './WorkInbox.vue'
import WorkStatusBar from './WorkStatusBar.vue'
import RankBadge from '../RankBadge.vue'
import { useProgressStore } from '../../stores/progressStore'
import { useMobileLayout } from '../../composables/useMobileLayout'

const progressStore = useProgressStore()
const { isMobile } = useMobileLayout()
const dockExpanded = ref(false)

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

const sortedDockItems = computed(() => {
  const current = props.dockItems.find((d) => d.levelId === props.level.id)
  const rest = props.dockItems.filter((d) => d.levelId !== props.level.id)
  return current ? [current, ...rest] : [...props.dockItems]
})

const MOBILE_DOCK_VISIBLE = 4

const visibleDockItems = computed(() => {
  if (!isMobile.value || dockExpanded.value || sortedDockItems.value.length <= MOBILE_DOCK_VISIBLE) {
    return sortedDockItems.value
  }
  return sortedDockItems.value.slice(0, MOBILE_DOCK_VISIBLE - 1)
})

const hiddenDockCount = computed(() => {
  if (!isMobile.value || dockExpanded.value) return 0
  return Math.max(0, sortedDockItems.value.length - visibleDockItems.value.length)
})

function toggleDockExpanded() {
  dockExpanded.value = !dockExpanded.value
}

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
</script>

<template>
  <div class="workbench" :class="{ 'workbench--level': levelPage }">
    <header class="workbench__topbar">
      <div class="workbench__topbar-left">
        <button type="button" class="workbench__back" @click="$emit('back')">← 地图</button>
        <div class="workbench__title-block">
          <h1 class="workbench__title">{{ headerTitle }}</h1>
          <p v-if="headerSubtitle" class="workbench__subtitle">{{ headerSubtitle }}</p>
        </div>
      </div>
      <div class="workbench__topbar-right">
        <WorkInbox :messages="inboxMessages" />
        <RankBadge :xp="progressStore.totalXp" compact class="workbench__rank-compact" />
        <span class="workbench__level-tag"
          >{{ viewMode === 'sut' ? '上机' : '主线' }} · #{{ level.id }}</span
        >
        <ThemeToggle />
      </div>
    </header>

    <WorkStatusBar :items="envStatus" class="workbench__status-bar" />

    <div class="workbench__body" :class="{ 'workbench__body--sut': viewMode === 'sut' }">
      <aside v-if="viewMode === 'main'" class="workbench__dock">
        <p class="workbench__dock-label">工作台</p>
        <button
          v-for="item in visibleDockItems"
          :key="item.levelId"
          type="button"
          class="workbench__dock-item"
          :class="{
            'workbench__dock-item--active': activeDockLevelId === item.levelId,
            'workbench__dock-item--task': item.levelId === level.id,
            'workbench__dock-item--locked': item.locked,
          }"
          :title="item.locked ? item.lockReason : dockApps[item.simType]?.label"
          @click="!item.locked && $emit('dock-change', item.levelId)"
        >
          <span class="workbench__dock-icon">{{ dockApps[item.simType]?.icon }}</span>
          <span class="workbench__dock-text">{{
            item.shortLabel || dockApps[item.simType]?.shortLabel
          }}</span>
          <span v-if="item.levelId === level.id" class="workbench__dock-dot" />
          <span v-if="item.hasArtifact && item.levelId !== level.id" class="workbench__dock-check"
            >✓</span
          >
        </button>
        <button
          v-if="hiddenDockCount > 0"
          type="button"
          class="workbench__dock-item workbench__dock-item--more"
          @click="toggleDockExpanded"
        >
          <span class="workbench__dock-icon">⋯</span>
          <span class="workbench__dock-text">更多 +{{ hiddenDockCount }}</span>
        </button>
        <button
          v-else-if="dockExpanded && sortedDockItems.length > MOBILE_DOCK_VISIBLE"
          type="button"
          class="workbench__dock-item workbench__dock-item--more"
          @click="toggleDockExpanded"
        >
          <span class="workbench__dock-icon">↑</span>
          <span class="workbench__dock-text">收起</span>
        </button>
      </aside>

      <main class="workbench__main">
        <div v-if="!isTaskDock" class="workbench__context-banner">
          <span
            >📂 阶段档案 ·
            {{ dockItems.find((d) => d.levelId === activeDockLevelId)?.dayLabel || '产出' }}</span
          >
          <button
            type="button"
            class="workbench__context-back"
            @click="$emit('dock-change', level.id)"
          >
            返回当前任务 →
          </button>
        </div>

        <slot />
      </main>
    </div>
  </div>
</template>
