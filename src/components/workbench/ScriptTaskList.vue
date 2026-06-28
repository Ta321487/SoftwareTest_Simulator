<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '../../stores/progressStore'
import { getScriptBeatDetail } from '../../utils/scriptBeatDetail'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const router = useRouter()
const progressStore = useProgressStore()

const tasks = computed(() =>
  props.items.map((item) => ({
    ...getScriptBeatDetail(item.levelId, progressStore),
    label: item.label,
  }))
)

function goToLevel(levelId) {
  if (progressStore.getStatus(levelId) === 'locked') return
  router.push({ name: 'LevelDetail', params: { id: String(levelId) } })
}

function starDisplay(n) {
  if (!n) return ''
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}
</script>

<template>
  <ul class="script-task-list">
    <li v-for="task in tasks" :key="task.levelId" class="script-task-list__row">
      <button
        type="button"
        class="script-task-list__item"
        :class="`script-task-list__item--${task.status}`"
        :disabled="task.status === 'locked'"
        @click="goToLevel(task.levelId)"
      >
        <div class="script-task-list__head">
          <span class="script-task-list__label">{{ task.label }}</span>
          <span v-if="task.toolLabel" class="script-task-list__tool">{{ task.toolLabel }}</span>
          <span class="script-task-list__status">
            {{ task.status === 'completed' ? '✓' : task.status === 'available' ? '▶' : '🔒' }}
          </span>
        </div>
        <h4 class="script-task-list__title">{{ task.title }}</h4>
        <p v-if="task.hook" class="script-task-list__hook">{{ task.hook }}</p>
        <p v-if="task.deliverable" class="script-task-list__deliverable">
          📎 交付：{{ task.deliverable }}
        </p>
        <span v-if="task.stars" class="script-task-list__stars">{{ starDisplay(task.stars) }}</span>
      </button>
    </li>
  </ul>
</template>
