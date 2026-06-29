<script setup>
import { ref } from 'vue'

const props = defineProps({
  mockPath: { type: String, default: '/callback' },
  mockStatus: { type: Number, default: 200 },
  mockBodyIncludes: { type: Array, default: () => ['success'] },
  mockDelayMs: { type: Number, default: null },
  mockHint: { type: String, default: '' },
  defaultBody: { type: String, default: '{"code":0,"message":"ok"}' },
})

const emit = defineEmits(['submit'])

const path = ref(props.mockPath)
const status = ref(String(props.mockStatus))
const body = ref(props.defaultBody)
const delayMs = ref(props.mockDelayMs != null ? String(props.mockDelayMs) : '0')
const tested = ref(false)
const testOk = ref(false)

function handleTest() {
  tested.value = true
  const statusOk = status.value.trim() === String(props.mockStatus)
  const bodyOk = props.mockBodyIncludes.every((t) =>
    body.value.toLowerCase().includes(String(t).toLowerCase())
  )
  const pathOk = path.value.trim() === props.mockPath
  let delayOk = true
  if (props.mockDelayMs != null) {
    delayOk = Number(delayMs.value) === props.mockDelayMs
  }
  testOk.value = statusOk && bodyOk && pathOk && delayOk
}

function handleSubmit() {
  emit('submit', {
    rules: {
      path: path.value.trim(),
      status: status.value.trim(),
      body: body.value.trim(),
      delayMs: Number(delayMs.value) || 0,
    },
  })
}

function reset() {
  path.value = props.mockPath
  status.value = String(props.mockStatus)
  body.value = props.defaultBody
  delayMs.value = props.mockDelayMs != null ? String(props.mockDelayMs) : '0'
  tested.value = false
  testOk.value = false
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card mock-server">
    <header class="mock-server__header">
      <span>🎭 WireMock · 支付回调 Mock</span>
      <span class="mock-server__env">测试沙箱</span>
    </header>

    <div class="mock-server__fields">
      <label class="sim-field__label">Path</label>
      <input v-model="path" class="sim-field__input" type="text" />

      <label class="sim-field__label">HTTP Status</label>
      <input v-model="status" class="sim-field__input" type="text" />

      <label v-if="mockDelayMs != null" class="sim-field__label">Delay (ms)</label>
      <input v-if="mockDelayMs != null" v-model="delayMs" class="sim-field__input" type="text" />

      <label class="sim-field__label">Response Body (JSON)</label>
      <textarea v-model="body" class="mock-server__body" rows="4" spellcheck="false" />
    </div>

    <div class="mock-server__actions">
      <button type="button" class="sim-btn sim-btn--secondary" @click="handleTest">🔌 测试 Mock</button>
      <button type="button" class="sim-btn sim-btn--primary" :disabled="!testOk" @click="handleSubmit">
        ✓ 保存并提交
      </button>
    </div>

    <p v-if="tested && !testOk" class="mock-server__fail">Mock 探测未通过，请对照任务调整 path/status/body。</p>
    <p v-if="testOk" class="mock-server__ok">✓ Mock 响应符合预期，可提交。</p>
    <p v-if="mockHint && !testOk" class="mock-server__hint">{{ mockHint }}</p>
  </div>
</template>

<style scoped>
.mock-server__header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.mock-server__env {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.mock-server__fields {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}
.mock-server__body {
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
}
.mock-server__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.mock-server__fail {
  color: var(--terminal-error);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}
.mock-server__ok {
  color: var(--terminal-text);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}
.mock-server__hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}
</style>
