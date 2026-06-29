<script setup>
import { computed } from 'vue'
import ScriptTaskList from './ScriptTaskList.vue'

const props = defineProps({
  levelIds: {
    type: Array,
    required: true,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  labelPrefix: {
    type: String,
    default: '',
  },
  nextFocus: {
    type: Boolean,
    default: false,
  },
})

const items = computed(() =>
  props.levelIds.map((levelId, index) => ({
    levelId,
    label:
      props.labels[levelId] ||
      (props.labelPrefix ? `${props.labelPrefix} ${index + 1}` : `任务 ${index + 1}`),
  }))
)
</script>

<template>
  <ScriptTaskList :items="items" :next-focus="nextFocus" />
</template>
