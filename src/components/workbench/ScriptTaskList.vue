<script setup>
import { computed } from 'vue'
import QuestPathMap from './QuestPathMap.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  nextFocus: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
  },
})

const nodes = computed(() =>
  props.items.map((item) => ({
    levelId: item.levelId,
    label: item.label,
    title: item.title,
  }))
)
</script>

<template>
  <QuestPathMap :nodes="nodes" :size="size" />
</template>
