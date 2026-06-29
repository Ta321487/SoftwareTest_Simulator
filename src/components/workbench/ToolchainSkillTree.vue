<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { sideLevels, sideArcs } from '../../data/sideQuests'
import { TOOLCHAIN_ARC_IDS } from '../../data/sideQuestChapters'
import { useProgressStore } from '../../stores/progressStore'
import QuestPathMap from './QuestPathMap.vue'

const router = useRouter()
const progressStore = useProgressStore()

const selectedArcId = ref(null)

const arcNodes = computed(() =>
  TOOLCHAIN_ARC_IDS.map((arcId) => {
    const arc = sideArcs.find((a) => a.id === arcId)
    const levels = sideLevels.filter((l) => l.sideArc === arcId)
    const done = levels.filter((l) => progressStore.getSideQuestStatus(l.id) === 'completed').length
    const hasAvailable = levels.some((l) => progressStore.getSideQuestStatus(l.id) === 'available')
    const allLocked =
      levels.length > 0 && levels.every((l) => progressStore.getSideQuestStatus(l.id) === 'locked')
    const complete = levels.length > 0 && done >= levels.length
    return {
      id: arcId,
      icon: arc?.icon || '🔧',
      name: arc?.name?.replace(/ · 实操$/, '') || arcId,
      shortName: arc?.name?.split(' ')[0] || arcId,
      done,
      total: levels.length,
      hasAvailable,
      allLocked,
      complete,
      levels,
    }
  })
)

const activeArcId = computed(() => {
  for (const arc of arcNodes.value) {
    if (arc.hasAvailable) return arc.id
  }
  for (const arc of arcNodes.value) {
    if (!arc.complete && !arc.allLocked) return arc.id
  }
  return TOOLCHAIN_ARC_IDS[0]
})

const currentArcId = computed(() => selectedArcId.value || activeArcId.value)

const currentArc = computed(() => arcNodes.value.find((a) => a.id === currentArcId.value))

const levelNodes = computed(() =>
  (currentArc.value?.levels || []).map((level, index) => ({
    levelId: level.id,
    label: `EX-${level.id - 100}`,
    title: level.title,
    status: progressStore.getSideQuestStatus(level.id),
  }))
)

const totalProgress = computed(() => {
  const done = arcNodes.value.reduce((sum, a) => sum + a.done, 0)
  const total = arcNodes.value.reduce((sum, a) => sum + a.total, 0)
  return { done, total }
})

function selectArc(arcId) {
  selectedArcId.value = arcId
}

function continueNext() {
  for (const arc of arcNodes.value) {
    const next = arc.levels.find((l) => progressStore.getSideQuestStatus(l.id) === 'available')
    if (next) {
      router.push('/level/' + next.id)
      return
    }
  }
}

watch(activeArcId, (id) => {
  if (!selectedArcId.value) selectedArcId.value = id
})
</script>

<template>
  <div class="skill-tree">
    <div class="skill-tree__head">
      <div>
        <h3 class="skill-tree__title">排查工具链</h3>
        <p class="skill-tree__hint">
          按路线解锁 · {{ totalProgress.done }}/{{ totalProgress.total }} 关
        </p>
      </div>
      <button type="button" class="skill-tree__continue" @click="continueNext">继续下一关 →</button>
    </div>

    <div class="skill-tree__arcs" role="tablist">
      <button
        v-for="(arc, index) in arcNodes"
        :key="arc.id"
        type="button"
        role="tab"
        class="skill-tree__arc"
        :class="{
          'skill-tree__arc--active': currentArcId === arc.id,
          'skill-tree__arc--available': arc.hasAvailable,
          'skill-tree__arc--done': arc.complete,
          'skill-tree__arc--locked': arc.allLocked,
          'skill-tree__arc--last': index === arcNodes.length - 1,
        }"
        :aria-selected="currentArcId === arc.id"
        @click="selectArc(arc.id)"
      >
        <span class="skill-tree__arc-icon">{{ arc.icon }}</span>
        <span class="skill-tree__arc-name">{{ arc.shortName }}</span>
        <span class="skill-tree__arc-progress">{{ arc.done }}/{{ arc.total }}</span>
      </button>
    </div>

    <div v-if="currentArc" class="skill-tree__levels">
      <p class="skill-tree__arc-tagline">
        {{ sideArcs.find((a) => a.id === currentArc.id)?.tagline }}
      </p>
      <QuestPathMap :nodes="levelNodes" size="sm" />
    </div>
  </div>
</template>
