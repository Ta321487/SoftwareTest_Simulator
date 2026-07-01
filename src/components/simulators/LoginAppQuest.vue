<script setup>
import { ref } from 'vue'
import LoginAppMock from './LoginAppMock.vue'

const props = defineProps({
  appBuild: { type: String, default: 'buggy' },
  appAction: { type: String, required: true },
})

const emit = defineEmits(['submit'])
const actionDone = ref(false)

function onBugReproduced() {
  if (props.appAction === 'bug-reproduced') actionDone.value = true
}

function onFixVerified() {
  if (props.appAction === 'fix-verified') actionDone.value = true
}

function handleSubmit() {
  emit('submit', { action: props.appAction, done: actionDone.value })
}

function reset() {
  actionDone.value = false
}

defineExpose({ reset })
</script>

<template>
  <div class="sut-quest">
    <LoginAppMock
      :build="appBuild"
      compact
      @bug-reproduced="onBugReproduced"
      @fix-verified="onFixVerified"
    />
    <button
      type="button"
      class="sim-btn sim-btn--primary sut-quest__submit"
      :disabled="!actionDone"
      @click="handleSubmit"
    >
      ✓ 确认提交
    </button>
    <p v-if="!actionDone" class="sut-quest__hint">请先在 App 里完成用例操作，再提交。</p>
  </div>
</template>
