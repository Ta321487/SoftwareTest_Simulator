<script setup>
import { ref } from 'vue'
import OnCallPanel from './OnCallPanel.vue'

const props = defineProps({
  oncallMode: { type: String, default: 'prod-login' },
  logLines: { type: Array, default: () => [] },
  oncallAction: { type: String, required: true },
})

const emit = defineEmits(['submit'])
const actionDone = ref(false)

function onProdSlow() {
  if (props.oncallAction === 'prod-slow-reproduced') actionDone.value = true
}

function onLogReviewed() {
  if (props.oncallAction === 'log-reviewed') actionDone.value = true
}

function handleSubmit() {
  emit('submit', { action: props.oncallAction, done: actionDone.value })
}

function reset() {
  actionDone.value = false
}

defineExpose({ reset })
</script>

<template>
  <div class="sut-quest">
    <OnCallPanel
      :mode="oncallMode"
      :log-lines="logLines"
      @prod-slow-reproduced="onProdSlow"
      @log-reviewed="onLogReviewed"
    />
    <button
      type="button"
      class="sim-btn sim-btn--primary sut-quest__submit"
      :disabled="!actionDone"
      @click="handleSubmit"
    >
      ✓ 确认提交
    </button>
    <p v-if="!actionDone" class="sut-quest__hint">请先完成面板上的操作，再提交。</p>
  </div>
</template>
