<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { phases, getLevelTitle } from '../../data/phases'
import { useProgressStore } from '../../stores/progressStore'

const props = defineProps({
  phaseId: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const progressStore = useProgressStore()

const phase = computed(() => phases[props.phaseId])

const steps = computed(() =>
  phase.value.levelIds.map((levelId, index) => {
    const meta = progressStore.getLevelMeta(levelId)
    return {
      levelId,
      label: `第 ${index + 1} 关`,
      title: getLevelTitle(levelId),
      status: progressStore.getStatus(levelId),
      stars: meta?.stars || 0,
    }
  })
)

const progress = computed(() => {
  const done = steps.value.filter((s) => s.status === 'completed').length
  return { done, total: steps.value.length }
})

function goToLevel(levelId) {
  if (progressStore.getStatus(levelId) === 'locked') return
  router.push('/level/' + levelId)
}

function starDisplay(n) {
  if (!n) return ''
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}
</script>

<template>
  <section class="phase-timeline" :class="`phase-timeline--${phase.id}`">
    <div class="phase-timeline__header">
      <div>
        <h2 class="phase-timeline__title">
          <span class="phase-timeline__icon">{{ phase.icon }}</span>
          {{ phase.name }}
        </h2>
        <p class="phase-timeline__subtitle">{{ phase.subtitle }}</p>
        <p class="phase-timeline__audience">{{ phase.audience }}</p>
        <p class="phase-timeline__veteran">{{ phase.veteranLine }}</p>
      </div>
      <span class="phase-timeline__progress">{{ progress.done }}/{{ progress.total }} 关</span>
    </div>

    <div class="phase-timeline__track">
      <button
        v-for="(step, index) in steps"
        :key="step.levelId"
        type="button"
        class="phase-timeline__step"
        :class="[
          `phase-timeline__step--${step.status}`,
          { 'phase-timeline__step--last': index === steps.length - 1 },
        ]"
        :disabled="step.status === 'locked'"
        @click="goToLevel(step.levelId)"
      >
        <span class="phase-timeline__step-label">{{ step.label }}</span>
        <span class="phase-timeline__step-title">{{ step.title }}</span>
        <span class="phase-timeline__step-meta">
          <span v-if="step.stars" class="phase-timeline__step-stars" :title="`${step.stars} 星`">
            {{ starDisplay(step.stars) }}
          </span>
          <span class="phase-timeline__step-status">
            {{ step.status === 'completed' ? '✓' : step.status === 'available' ? '▶' : '🔒' }}
          </span>
        </span>
      </button>
    </div>
  </section>
</template>
