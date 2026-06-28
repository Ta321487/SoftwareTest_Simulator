<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { projects } from '../../data/projects'
import { useProgressStore } from '../../stores/progressStore'
import { useProjectStore } from '../../stores/projectStore'
import { getProjectImmersion } from '../../utils/projectImmersion'
import { buildSutRoute } from '../../utils/sutImmersion'
import ScriptTaskList from './ScriptTaskList.vue'

const props = defineProps({
  projectId: {
    type: String,
    default: 'login-module',
  },
  levelIds: {
    type: Array,
    default: null,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const progressStore = useProgressStore()
const projectStore = useProjectStore()

const project = computed(() => projects[props.projectId])

const immersion = computed(() => getProjectImmersion(props.projectId, projectStore))

const days = computed(() => {
  const filter = props.levelIds?.length
    ? new Set(props.levelIds)
    : null
  return project.value.days
    .filter((day) => !filter || filter.has(day.levelId))
    .map((day) => ({
      ...day,
      status: progressStore.getStatus(day.levelId),
    }))
})

const completedCount = computed(
  () => days.value.filter((d) => d.status === 'completed').length
)

function openImmersion(item) {
  const status = progressStore.getStatus(item.levelId)
  if (status === 'locked') return
  router.push(buildSutRoute(item.levelId, item.dock))
}

function goToDay(levelId) {
  if (progressStore.getStatus(levelId) === 'locked') return
  router.push({ name: 'LevelDetail', params: { id: String(levelId) } })
}

function immersionLocked(item) {
  return progressStore.getStatus(item.levelId) === 'locked'
}
</script>

<template>
  <section
    class="project-timeline"
    :class="[`project-timeline--${projectId}`, { 'project-timeline--embedded': embedded }]"
  >
    <div v-if="!embedded" class="project-timeline__header">
      <div>
        <h2 class="project-timeline__title">{{ project.name }}</h2>
        <p class="project-timeline__subtitle">{{ project.subtitle }}</p>
      </div>
      <span class="project-timeline__progress">{{ completedCount }}/{{ days.length }} 天</span>
    </div>

    <p v-if="!embedded" class="project-timeline__hint">
      点击任务卡片进入当日工作台；上方 <strong>▶</strong> 为上机实操（可选，不影响通关）。
    </p>

    <div v-if="embedded" class="project-timeline__module">
      <h4 class="project-timeline__module-name">{{ project.name }}</h4>
      <p class="project-timeline__module-desc">{{ project.subtitle }}</p>
    </div>

    <div v-if="immersion.total" class="project-timeline__immersion">
      <span class="project-timeline__immersion-label">{{ immersion.label }}</span>
      <div class="project-timeline__immersion-actions">
        <button
          v-for="item in immersion.items"
          :key="item.key"
          type="button"
          class="project-timeline__immersion-btn"
          :class="{
            'project-timeline__immersion-btn--done': item.done,
            'project-timeline__immersion-btn--locked': immersionLocked(item),
          }"
          :disabled="immersionLocked(item)"
          :title="immersionLocked(item) ? `先解锁主线第 ${item.levelId} 关` : `进入上机实操：${item.label}`"
          :data-lock-hint="immersionLocked(item) ? `需先通主线 #${item.levelId}` : ''"
          @click="openImmersion(item)"
        >
          {{ item.done ? '✓' : '▶' }} {{ item.label }}
        </button>
      </div>
    </div>

    <ScriptTaskList
      v-if="embedded"
      :items="days.map((d) => ({ levelId: d.levelId, label: d.label }))"
    />

    <div v-else class="project-timeline__track">
      <button
        v-for="(day, index) in days"
        :key="day.levelId"
        type="button"
        class="project-timeline__day"
        :class="[
          `project-timeline__day--${day.status}`,
          { 'project-timeline__day--last': index === days.length - 1 },
        ]"
        :disabled="day.status === 'locked'"
        :title="day.status === 'locked' ? '完成前一关主线后解锁' : `进入主线：${day.title}`"
        @click="goToDay(day.levelId)"
      >
        <span class="project-timeline__day-label">{{ day.label }}</span>
        <span class="project-timeline__day-title">{{ day.title }}</span>
        <span class="project-timeline__day-status">
          {{ day.status === 'completed' ? '✓' : day.status === 'available' ? '▶' : '🔒' }}
        </span>
      </button>
    </div>
  </section>
</template>
