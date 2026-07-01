<script setup>
import { ref } from 'vue'
import PaymentAppMock from './PaymentAppMock.vue'

const props = defineProps({
  paymentScenario: { type: String, default: 'callback-bug' },
  appAction: { type: String, required: true },
})

const emit = defineEmits(['submit'])
const actionDone = ref(false)

function onCallbackMiss() {
  if (props.appAction === 'callback-miss') actionDone.value = true
}

function onPayErrorReproduced() {
  if (props.appAction === 'pay-error-reproduced') actionDone.value = true
}

function onPayVerified() {
  if (props.appAction === 'pay-verified') actionDone.value = true
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
    <PaymentAppMock
      :scenario="paymentScenario"
      compact
      @callback-miss="onCallbackMiss"
      @pay-error-reproduced="onPayErrorReproduced"
      @pay-verified="onPayVerified"
    />
    <button
      type="button"
      class="sim-btn sim-btn--primary sut-quest__submit"
      :disabled="!actionDone"
      @click="handleSubmit"
    >
      ✓ 确认提交
    </button>
    <p v-if="!actionDone" class="sut-quest__hint">请先在支付 App 里完成用例操作，再提交。</p>
  </div>
</template>
