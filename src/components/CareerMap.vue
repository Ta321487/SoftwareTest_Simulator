<script setup>
import { computed, ref, watch } from 'vue'
import { phaseOrder, phases, getPhaseProgress, getLevelTitle } from '../data/phases'
import { TOTAL_MAIN_LEVELS, SEASON1_LEVEL_COUNT } from '../data/mainlineMeta'
import { useProgressStore } from '../stores/progressStore'
import QuestPathMap from './workbench/QuestPathMap.vue'

const progressStore = useProgressStore()

const LEAD_UNLOCK_LEVEL = 28

function firstIncompletePhase() {
  for (const id of phaseOrder) {
    const locked = id === 'lead' && progressStore.getStatus(LEAD_UNLOCK_LEVEL) === 'locked'
    if (locked) continue
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
    const locked = id === 'lead' && progressStore.getStatus(LEAD_UNLOCK_LEVEL) === 'locked'
    const active = !locked && activePhaseId.value === id && done < total
    return {
      id,
      icon: phase.icon,
      name: phase.name,
      done,
      total,
      locked,
      active,
      phase,
    }
  })
)

const phaseNodes = computed(() => {
  const phase = phases[activePhaseId.value]
  if (!phase) return []
  return phase.levelIds.map((levelId, index) => ({
    levelId,
    label: `${index + 1}`,
    title: getLevelTitle(levelId),
  }))
})
</script>

<template>
  <section class="career-map career-map--path">
    <div class="career-map__tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="career-map__tab"
        :class="{
          'career-map__tab--active': activePhaseId === tab.id,
          'career-map__tab--locked': tab.locked,
        }"
        :aria-selected="activePhaseId === tab.id"
        :aria-disabled="tab.locked || undefined"
        @click="!tab.locked && (activePhaseId = tab.id)"
      >
        <span class="career-map__tab-label">{{ tab.icon }} {{ tab.name }}</span>
        <span v-if="tab.locked" class="career-map__tab-lock">🔒</span>
        <span v-else class="career-map__tab-progress">{{ tab.done }}/{{ tab.total }}</span>
      </button>
    </div>

    <p
      v-if="progressStore.getStatus(LEAD_UNLOCK_LEVEL) === 'locked' && activePhaseId === 'lead'"
      class="career-map__phase-locked-hint"
    >
      第一季 {{ SEASON1_LEVEL_COUNT }} 关全通后解锁进阶线
    </p>

    <QuestPathMap v-else :nodes="phaseNodes" />
    <p class="career-map__path-hint">共 {{ TOTAL_MAIN_LEVELS }} 关 · 点击节点进入关卡</p>
  </section>
</template>
