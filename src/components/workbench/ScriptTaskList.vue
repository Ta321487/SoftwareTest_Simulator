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
  nextFocus: {
    type: Boolean,
    default: false,
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

const focusTaskId = computed(() => {
  if (!props.nextFocus || !tasks.value.length) return null
  const available = tasks.value.find((t) => t.status === 'available')
  if (available) return available.levelId
  const incomplete = tasks.value.find((t) => t.status !== 'completed' && t.status !== 'locked')
  if (incomplete) return incomplete.levelId
  return tasks.value[0].levelId
})

const focusTasks = computed(() => {
  if (!props.nextFocus || !focusTaskId.value) return tasks.value
  return tasks.value.filter((t) => t.levelId === focusTaskId.value)
})

const moreCount = computed(() => {
  if (!props.nextFocus) return 0
  return Math.max(0, tasks.value.length - focusTasks.value.length)
})

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
  <div class="script-task-list-wrap">
    <ul class="script-task-list">
      <li v-for="task in focusTasks" :key="task.levelId" class="script-task-list__row">
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

    <details v-if="moreCount > 0" class="script-task-list__more">
      <summary class="script-task-list__more-summary">全部 {{ tasks.length }} 项</summary>
      <ul class="script-task-list script-task-list--nested">
        <li v-for="task in tasks" :key="`all-${task.levelId}`" class="script-task-list__row">
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
          </button>
        </li>
      </ul>
    </details>
  </div>
</template>
