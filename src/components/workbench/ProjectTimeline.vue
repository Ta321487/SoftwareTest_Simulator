<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { projects } from '../../data/projects'
import { useProgressStore } from '../../stores/progressStore'
import { useProjectStore } from '../../stores/projectStore'
import { getProjectImmersion } from '../../utils/projectImmersion'

const props = defineProps({
  projectId: {
    type: String,
    default: 'login-module',
  },
})

const router = useRouter()
const progressStore = useProgressStore()
const projectStore = useProjectStore()

const project = computed(() => projects[props.projectId])

const immersion = computed(() => getProjectImmersion(props.projectId, projectStore))

const days = computed(() =>
  project.value.days.map((day) => ({
    ...day,
    status: progressStore.getStatus(day.levelId),
  }))
)

const completedCount = computed(
  () => days.value.filter((d) => d.status === 'completed').length
)

function goToDay(levelId) {
  const status = progressStore.getStatus(levelId)
  if (status === 'locked') return
  router.push('/level/' + levelId)
}
</script>

<template>
  <section class="project-timeline">
    <div class="project-timeline__header">
      <div>
        <h2 class="project-timeline__title">{{ project.name }}</h2>
        <p class="project-timeline__subtitle">{{ project.subtitle }}</p>
      </div>
      <span class="project-timeline__progress">{{ completedCount }}/{{ days.length }} 天</span>
    </div>

    <div v-if="immersion.total" class="project-timeline__immersion">
      <span class="project-timeline__immersion-label">{{ immersion.label }}</span>
      <div class="project-timeline__immersion-tags">
        <span
          v-for="item in immersion.items"
          :key="item.key"
          class="project-timeline__immersion-tag"
          :class="{ 'project-timeline__immersion-tag--done': item.done }"
        >
          {{ item.done ? '✓' : '○' }} {{ item.label }}
        </span>
      </div>
    </div>

    <div class="project-timeline__track">
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
