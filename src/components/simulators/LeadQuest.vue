<script setup>
import { ref } from 'vue'
import LeadPanel from './LeadPanel.vue'

const props = defineProps({
  leadMode: { type: String, default: 'gonogo' },
  leadAction: { type: String, required: true },
})

const emit = defineEmits(['submit'])
const actionDone = ref(false)

function onGonogoReviewed() {
  if (props.leadAction === 'gonogo-reviewed') actionDone.value = true
}

function onTasksAssigned() {
  if (props.leadAction === 'tasks-assigned') actionDone.value = true
}

function onLoadReportReviewed() {
  if (props.leadAction === 'load-report-reviewed') actionDone.value = true
}

function handleSubmit() {
  emit('submit', { action: props.leadAction, done: actionDone.value })
}

function reset() {
  actionDone.value = false
}

defineExpose({ reset })
</script>

<template>
  <div class="sut-quest">
    <LeadPanel
      :mode="leadMode"
      @gonogo-reviewed="onGonogoReviewed"
      @tasks-assigned="onTasksAssigned"
      @load-report-reviewed="onLoadReportReviewed"
    />
    <button
      type="button"
      class="sim-btn sim-btn--primary sut-quest__submit"
      :disabled="!actionDone"
      @click="handleSubmit"
    >
      ✓ 确认提交
    </button>
    <p v-if="!actionDone" class="sut-quest__hint">请先完成看板上的操作，再提交。</p>
  </div>
</template>
