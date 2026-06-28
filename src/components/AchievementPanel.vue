<script setup>
import { computed } from 'vue'
import { achievements, getAchievementById } from '../data/achievements'
import { useProgressStore } from '../stores/progressStore'

const progressStore = useProgressStore()

const items = computed(() =>
  achievements.map((a) => ({
    ...a,
    unlocked: progressStore.achievements.includes(a.id),
  }))
)

const unlockedCount = computed(() => items.value.filter((i) => i.unlocked).length)
</script>

<template>
  <section class="achievement-panel">
    <header class="achievement-panel__header">
      <h2 class="achievement-panel__title">🏆 成就</h2>
      <span class="achievement-panel__count">{{ unlockedCount }}/{{ items.length }}</span>
    </header>
    <ul class="achievement-panel__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="achievement-panel__item"
        :class="{ 'achievement-panel__item--locked': !item.unlocked }"
      >
        <span class="achievement-panel__icon">{{ item.unlocked ? item.icon : '🔒' }}</span>
        <div>
          <p class="achievement-panel__name">{{ item.title }}</p>
          <p class="achievement-panel__desc">{{ item.desc }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
