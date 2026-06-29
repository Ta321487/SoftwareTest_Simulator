<script setup>
import { computed, ref, watch } from 'vue'
import { phaseOrder, phases, getPhaseProgress } from '../data/phases'
import { TOTAL_MAIN_LEVELS, SEASON1_LEVEL_COUNT } from '../data/mainlineMeta'
import { useProgressStore } from '../stores/progressStore'
import { useMobileLayout } from '../composables/useMobileLayout'
import PhaseTimeline from './workbench/PhaseTimeline.vue'

const progressStore = useProgressStore()
const { isMobile } = useMobileLayout()
const expandedPhaseIds = ref(new Set())

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

const tabsActiveId = computed(() => {
  for (const id of phaseOrder) {
    const locked = id === 'lead' && progressStore.getStatus(LEAD_UNLOCK_LEVEL) === 'locked'
    if (locked) continue
    const { done, total } = getPhaseProgress(phases[id], progressStore.completedLevelIds)
    if (done < total) return id
  }
  return phaseOrder.find(
    (id) => id !== 'lead' || progressStore.getStatus(LEAD_UNLOCK_LEVEL) !== 'locked'
  )
})

const tabs = computed(() =>
  phaseOrder.map((id) => {
    const phase = phases[id]
    const { done, total } = getPhaseProgress(phase, progressStore.completedLevelIds)
    const locked = id === 'lead' && progressStore.getStatus(LEAD_UNLOCK_LEVEL) === 'locked'
    return {
      id,
      icon: phase.icon,
      name: phase.name,
      done,
      total,
      locked,
      active: !locked && tabsActiveId.value === id && done < total,
      phase,
    }
  })
)

function phaseFoldOpen(tab) {
  if (!isMobile.value) return true
  return tab.active || expandedPhaseIds.value.has(tab.id)
}

function onPhaseToggle(tab, event) {
  if (!isMobile.value) return
  if (event.target.open) expandedPhaseIds.value.add(tab.id)
  else expandedPhaseIds.value.delete(tab.id)
}
</script>

<template>
  <section class="career-map">
    <header class="career-map__head">
      <h2 class="career-map__title">主线关卡</h2>
      <p class="career-map__hint">按阶段分类浏览全部 {{ TOTAL_MAIN_LEVELS }} 关，方便查漏补缺</p>
    </header>

    <template v-if="!isMobile">
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
          <span v-if="tab.locked" class="career-map__tab-lock">🔒 第一季结业后解锁</span>
          <span class="career-map__tab-progress">{{ tab.done }}/{{ tab.total }}</span>
        </button>
      </div>

      <PhaseTimeline :phase-id="activePhaseId" compact />
    </template>

    <div v-else class="career-map__phases">
      <details
        v-for="tab in tabs"
        :key="tab.id"
        class="career-map__phase-fold"
        :class="{
          'career-map__phase-fold--active': tab.active,
          'career-map__phase-fold--locked': tab.locked,
          'career-map__phase-fold--done': !tab.locked && tab.done >= tab.total,
        }"
        :open="phaseFoldOpen(tab)"
        @toggle="onPhaseToggle(tab, $event)"
      >
        <summary class="career-map__phase-summary">
          <span class="career-map__phase-icon">{{ tab.icon }}</span>
          <span class="career-map__phase-name">{{ tab.name }}</span>
          <span class="career-map__phase-meta">
            <span v-if="tab.locked" class="career-map__phase-lock">🔒</span>
            <span v-else-if="tab.done >= tab.total" class="career-map__phase-badge">通关</span>
            <span v-else class="career-map__phase-progress">{{ tab.done }}/{{ tab.total }}</span>
          </span>
        </summary>
        <div v-if="!tab.locked" class="career-map__phase-body">
          <PhaseTimeline :phase-id="tab.id" compact :next-focus="isMobile" />
        </div>
        <p v-else class="career-map__phase-locked-hint">第一季 {{ SEASON1_LEVEL_COUNT }} 关全通后解锁进阶线</p>
      </details>
    </div>
  </section>
</template>
