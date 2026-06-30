<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { dockApps } from '../data/projects'
import AppNavGlobal from './AppNavGlobal.vue'
import { useMobileLayout } from '../composables/useMobileLayout'
import { useHorizontalDragScroll } from '../composables/useHorizontalDragScroll'

const props = defineProps({
  current: {
    type: String,
    default: 'home',
  },
  activeLevelId: {
    type: Number,
    default: null,
  },
  taskLevelId: {
    type: Number,
    default: null,
  },
  projectName: {
    type: String,
    default: '',
  },
  projectItems: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['dock-change'])

const { isMobile } = useMobileLayout()
const dockExpanded = ref(false)
const projectStripRef = ref(null)
const { bind: bindProjectStripDragScroll } = useHorizontalDragScroll()
let unbindProjectStripDragScroll = null

const MOBILE_PROJECT_VISIBLE = 5

const navCurrent = computed(() => (props.projectItems.length ? 'level' : props.current))
const hasProject = computed(() => props.projectItems.length > 0)

const visibleProjectItems = computed(() => {
  const items = props.projectItems
  if (!isMobile.value || dockExpanded.value || items.length <= MOBILE_PROJECT_VISIBLE) {
    return items
  }
  return items.slice(0, MOBILE_PROJECT_VISIBLE - 1)
})

const hiddenProjectCount = computed(() => {
  if (!isMobile.value || dockExpanded.value) return 0
  return Math.max(0, props.projectItems.length - visibleProjectItems.value.length)
})

function projectShortLabel(item) {
  return item.dayLabel || `Day ${item.levelId}`
}

function projectIcon(item) {
  return dockApps[item.simType]?.icon || '📎'
}

function toggleDockExpanded() {
  dockExpanded.value = !dockExpanded.value
}

async function setupProjectStripDragScroll() {
  unbindProjectStripDragScroll?.()
  await nextTick()
  unbindProjectStripDragScroll = bindProjectStripDragScroll(projectStripRef.value)
}

onMounted(setupProjectStripDragScroll)
watch([hasProject, isMobile], setupProjectStripDragScroll)
onUnmounted(() => unbindProjectStripDragScroll?.())
</script>

<template>
  <Teleport to="body" :disabled="!isMobile">
    <aside
      class="workbench__dock app-nav app-sidebar"
      :class="{
        'app-sidebar--has-project': hasProject,
        'app-mobile-dock': isMobile,
        'app-mobile-dock--level': isMobile && hasProject,
      }"
    >
      <div v-if="isMobile && hasProject" ref="projectStripRef" class="app-mobile-dock__project">
        <button
          v-for="item in visibleProjectItems"
          :key="item.levelId"
          type="button"
          class="app-mobile-dock__chip"
          :class="{
            'app-mobile-dock__chip--active': activeLevelId === item.levelId,
            'app-mobile-dock__chip--locked': item.locked,
          }"
          :aria-disabled="item.locked || undefined"
          :title="item.locked ? item.lockReason : dockApps[item.simType]?.label"
          @click="!item.locked && emit('dock-change', item.levelId)"
        >
          <span class="app-mobile-dock__chip-icon" aria-hidden="true">{{ projectIcon(item) }}</span>
          <span>{{ projectShortLabel(item) }}</span>
        </button>
        <button
          v-if="hiddenProjectCount > 0"
          type="button"
          class="app-mobile-dock__chip app-mobile-dock__chip--more"
          @click="toggleDockExpanded"
        >
          +{{ hiddenProjectCount }}
        </button>
        <button
          v-else-if="dockExpanded && projectItems.length > MOBILE_PROJECT_VISIBLE"
          type="button"
          class="app-mobile-dock__chip app-mobile-dock__chip--more"
          @click="toggleDockExpanded"
        >
          收起
        </button>
      </div>

      <div class="app-sidebar__core">
        <p class="workbench__dock-label">工作台</p>

        <AppNavGlobal
          :current="navCurrent"
          :active-level-id="activeLevelId"
          :highlight-main-task="!hasProject"
        />
      </div>

      <div v-if="hasProject && !isMobile" class="app-sidebar__project">
        <p class="app-nav__group app-sidebar__project-label">{{ projectName || '本项目' }}</p>

        <button
          v-for="item in visibleProjectItems"
          :key="item.levelId"
          type="button"
          class="workbench__dock-item app-sidebar__project-item"
          :class="{
            'workbench__dock-item--active': activeLevelId === item.levelId,
            'workbench__dock-item--task': item.levelId === taskLevelId,
            'workbench__dock-item--locked': item.locked,
          }"
          :title="item.locked ? item.lockReason : dockApps[item.simType]?.label"
          @click="!item.locked && emit('dock-change', item.levelId)"
        >
          <span class="workbench__dock-text">
            {{
              item.dayLabel
                ? `${item.dayLabel} ${dockApps[item.simType]?.shortLabel || ''}`
                : '工具'
            }}
          </span>
          <span
            v-if="item.hasArtifact && item.levelId !== taskLevelId"
            class="app-sidebar__check"
            aria-hidden="true"
            >✓</span
          >
        </button>
      </div>
    </aside>
  </Teleport>
</template>
