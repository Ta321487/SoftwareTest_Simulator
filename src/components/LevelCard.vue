<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { simTypeLabels } from '../data/levels'

const props = defineProps({
  level: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    required: true,
    validator: (value) => ['locked', 'available', 'completed'].includes(value),
  },
})

const router = useRouter()
const toast = ref('')

const statusConfig = {
  locked: { icon: '🔒', label: '未解锁', className: 'status-locked' },
  available: { icon: '▶️', label: '可挑战', className: 'status-available' },
  completed: { icon: '✅', label: '已通关', className: 'status-completed' },
}

function showToast(message) {
  toast.value = message
  window.setTimeout(() => {
    toast.value = ''
  }, 2000)
}

function handleClick() {
  if (props.status === 'locked') {
    showToast('请先完成上一关')
    return
  }
  router.push('/level/' + props.level.id)
}

function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <article
    class="level-card"
    :class="[`level-card--${status}`, statusConfig[status].className]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div class="level-card__header">
      <span class="level-card__index">#{{ level.id }}</span>
      <span class="level-card__status">
        {{ statusConfig[status].icon }} {{ statusConfig[status].label }}
      </span>
    </div>
    <h3 class="level-card__title">{{ level.title }}</h3>
    <p class="level-card__desc">{{ level.description }}</p>
    <div class="level-card__footer">
      <span class="level-card__xp">+{{ level.xpReward }} XP</span>
      <span class="level-card__type">{{ simTypeLabels[level.simType] || '模拟' }}</span>
      <span v-if="status === 'available'" class="level-card__enter">开始 →</span>
      <span v-if="status === 'completed'" class="level-card__enter level-card__enter--review"
        >复习 →</span
      >
    </div>

    <p v-if="toast" class="level-card__toast">{{ toast }}</p>
  </article>
</template>
