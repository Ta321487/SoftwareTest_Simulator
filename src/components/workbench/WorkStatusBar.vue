<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div v-if="items.length" class="work-status">
    <span
      v-for="(item, index) in items"
      :key="index"
      class="work-status__item"
      :class="`work-status__item--${item.tone || 'neutral'}`"
    >
      <span class="work-status__label">{{ item.label }}</span>
      <span class="work-status__value">{{ item.value }}</span>
    </span>
  </div>
</template>
