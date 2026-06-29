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
  compact: {
    type: Boolean,
    default: false,
  },
  nextFocus: {
    type: Boolean,
    default: false,
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

const focusStepId = computed(() => {
  if (!props.nextFocus || !steps.value.length) return null
  const available = steps.value.find((s) => s.status === 'available')
  if (available) return available.levelId
  const incomplete = steps.value.find((s) => s.status !== 'completed' && s.status !== 'locked')
  if (incomplete) return incomplete.levelId
  return steps.value[0].levelId
})

const focusSteps = computed(() => {
  if (!props.nextFocus || !focusStepId.value) return steps.value
  return steps.value.filter((s) => s.levelId === focusStepId.value)
})

const moreStepCount = computed(() => {
  if (!props.nextFocus) return 0
  return Math.max(0, steps.value.length - focusSteps.value.length)
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
  <section
    class="phase-timeline"
    :class="[`phase-timeline--${phase.id}`, { 'phase-timeline--compact': compact }]"
  >
    <div v-if="!compact" class="phase-timeline__header">
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

    <div v-else class="phase-timeline__intro">
      <p class="phase-timeline__subtitle">{{ phase.subtitle }}</p>
      <details class="phase-timeline__meta">
        <summary>阶段说明</summary>
        <p class="phase-timeline__audience">{{ phase.audience }}</p>
        <p class="phase-timeline__veteran">{{ phase.veteranLine }}</p>
      </details>
    </div>

    <div class="phase-timeline__track">
      <button
        v-for="(step, index) in focusSteps"
        :key="step.levelId"
        type="button"
        class="phase-timeline__step"
        :class="[
          `phase-timeline__step--${step.status}`,
          { 'phase-timeline__step--last': index === focusSteps.length - 1 && moreStepCount === 0 },
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

    <details v-if="moreStepCount > 0" class="phase-timeline__more">
      <summary class="phase-timeline__more-summary">全部 {{ steps.length }} 关</summary>
      <div class="phase-timeline__track phase-timeline__track--nested">
        <button
          v-for="(step, index) in steps"
          :key="`all-${step.levelId}`"
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
            <span class="phase-timeline__step-status">
              {{ step.status === 'completed' ? '✓' : step.status === 'available' ? '▶' : '🔒' }}
            </span>
          </span>
        </button>
      </div>
    </details>
  </section>
</template>
