<script setup>
import { computed } from 'vue'
import { getRankProgress } from '../data/ranks'

const props = defineProps({
  xp: {
    type: Number,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const progress = computed(() => getRankProgress(props.xp))
</script>

<template>
  <div class="rank-badge" :class="{ 'rank-badge--compact': compact }">
    <div class="rank-badge__main">
      <span class="rank-badge__icon">{{ progress.current.icon }}</span>
      <div class="rank-badge__text">
        <span class="rank-badge__title">{{ progress.current.title }}</span>
        <span v-if="!compact" class="rank-badge__tagline">{{ progress.current.tagline }}</span>
      </div>
      <span class="rank-badge__xp">{{ xp }} XP</span>
    </div>
    <div v-if="progress.next && !compact" class="rank-badge__bar-wrap">
      <div class="rank-badge__bar">
        <div class="rank-badge__bar-fill" :style="{ width: progress.percent + '%' }" />
      </div>
      <span class="rank-badge__next">
        距 {{ progress.next.title }} 还差 {{ progress.xpToNext }} XP
      </span>
    </div>
  </div>
</template>
