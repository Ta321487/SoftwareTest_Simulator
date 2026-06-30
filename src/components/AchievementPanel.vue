<script setup>
import { computed } from 'vue'
import { achievements } from '../data/achievements'
import { useProgressStore } from '../stores/progressStore'

const props = defineProps({
  flat: {
    type: Boolean,
    default: false,
  },
})

const progressStore = useProgressStore()

const items = computed(() =>
  achievements.map((a) => ({
    ...a,
    unlocked: progressStore.achievements.includes(a.id),
  }))
)

const unlockedCount = computed(() => items.value.filter((i) => i.unlocked).length)

const displayItems = computed(() => {
  if (!props.flat) return items.value
  const unlocked = items.value.filter((i) => i.unlocked)
  const locked = items.value.filter((i) => !i.unlocked)
  return [...unlocked, ...locked]
})
</script>

<template>
  <section class="achievement-panel" :class="{ 'achievement-panel--flat': flat }">
    <header class="achievement-panel__header">
      <h2 v-if="!flat" class="achievement-panel__title">🏆 成就</h2>
      <p v-else class="achievement-panel__meta">{{ unlockedCount }}/{{ items.length }} 已解锁</p>
      <span v-if="!flat" class="achievement-panel__count"
        >{{ unlockedCount }}/{{ items.length }}</span
      >
    </header>
    <ul class="achievement-panel__list" :class="{ 'achievement-panel__list--flat': flat }">
      <li
        v-for="item in displayItems"
        :key="item.id"
        class="achievement-panel__item"
        :class="{
          'achievement-panel__item--locked': !item.unlocked,
          'achievement-panel__item--unlocked': item.unlocked && flat,
        }"
      >
        <span class="achievement-panel__icon">{{ item.unlocked ? item.icon : '🔒' }}</span>
        <div class="achievement-panel__body">
          <p class="achievement-panel__name">{{ item.title }}</p>
          <p class="achievement-panel__desc">{{ item.desc }}</p>
        </div>
        <span v-if="flat && item.unlocked" class="achievement-panel__status" aria-hidden="true"
          >✓</span
        >
      </li>
    </ul>
  </section>
</template>
