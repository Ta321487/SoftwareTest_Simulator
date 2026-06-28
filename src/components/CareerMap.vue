<script setup>
import { computed, ref, watch } from 'vue'
import { phaseOrder, phases, getPhaseProgress } from '../data/phases'
import { useProgressStore } from '../stores/progressStore'
import PhaseTimeline from './workbench/PhaseTimeline.vue'

const progressStore = useProgressStore()

function firstIncompletePhase() {
  for (const id of phaseOrder) {
    const { done, total } = getPhaseProgress(phases[id], progressStore.completedLevelIds)
    if (done < total) return id
  }
  return phaseOrder[0]
}

const activePhaseId = ref(firstIncompletePhase())

watch(
  () => progressStore.completedLevelIds.length,
  () => {
    const current = getPhaseProgress(phases[activePhaseId.value], progressStore.completedLevelIds)
    if (current.done >= current.total) {
      activePhaseId.value = firstIncompletePhase()
    }
  }
)

const tabs = computed(() =>
  phaseOrder.map((id) => {
    const phase = phases[id]
    const { done, total } = getPhaseProgress(phase, progressStore.completedLevelIds)
    return { id, icon: phase.icon, name: phase.name, done, total }
  })
)
</script>

<template>
  <section class="career-map">
    <header class="career-map__head">
      <h2 class="career-map__title">主线关卡</h2>
      <p class="career-map__hint">按阶段选关，不用一路滚到底</p>
    </header>

    <div class="career-map__tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="career-map__tab"
        :class="{ 'career-map__tab--active': activePhaseId === tab.id }"
        :aria-selected="activePhaseId === tab.id"
        @click="activePhaseId = tab.id"
      >
        <span class="career-map__tab-label">{{ tab.icon }} {{ tab.name }}</span>
        <span class="career-map__tab-progress">{{ tab.done }}/{{ tab.total }}</span>
      </button>
    </div>

    <PhaseTimeline :phase-id="activePhaseId" compact />
  </section>
</template>
