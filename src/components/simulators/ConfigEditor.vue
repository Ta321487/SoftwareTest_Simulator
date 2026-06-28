<script setup>
import { ref } from 'vue'

const props = defineProps({
  configContent: {
    type: String,
    required: true,
  },
  configKey: {
    type: String,
    default: 'DB_HOST',
  },
  defaultValue: {
    type: String,
    default: '127.0.0.1',
  },
  correctValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'db-connected'])

const hostValue = ref(props.defaultValue)
const saved = ref(false)
const testing = ref(false)
const testResult = ref(null)

function handleSave() {
  saved.value = true
  testResult.value = null
}

function onHostInput() {
  saved.value = false
  testResult.value = null
}

function handleTest() {
  if (testing.value) return
  testing.value = true
  testResult.value = null

  setTimeout(() => {
    testing.value = false
    const ok = hostValue.value.trim() === props.correctValue
    testResult.value = ok
      ? {
          ok: true,
          text: `✓ 连接成功 — ${props.configKey}=${hostValue.value}，支付沙箱数据库响应 42ms`,
        }
      : {
          ok: false,
          text: `✗ 连接失败 — Connection refused: ${hostValue.value}:3306（地址不可达或仍为占位符）`,
        }
    if (ok) {
      emit('db-connected', { value: hostValue.value.trim() })
    }
  }, 1200)
}

function handleConfirm() {
  emit('submit', { value: hostValue.value })
}

function reset() {
  hostValue.value = props.defaultValue
  saved.value = false
  testing.value = false
  testResult.value = null
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card config-editor">
    <header class="config-editor__toolbar">
      <span class="config-editor__file">payment-test.env</span>
      <span class="config-editor__env-tag">测试环境</span>
    </header>

    <pre class="config-editor__code">{{ configContent }}</pre>

    <div class="config-editor__edit">
      <label class="sim-field__label">{{ configKey }} =</label>
      <input
        v-model="hostValue"
        type="text"
        class="sim-field__input config-editor__input"
        placeholder="填写测试环境的真实地址"
        @input="onHostInput"
      />
    </div>

    <div class="config-editor__actions">
      <button type="button" class="sim-btn sim-btn--ghost" @click="handleSave">保存配置</button>
      <button
        type="button"
        class="sim-btn sim-btn--secondary"
        :disabled="!saved || testing"
        @click="handleTest"
      >
        {{ testing ? '连接测试中…' : '🔌 测试连接' }}
      </button>
      <button
        type="button"
        class="sim-btn sim-btn--primary"
        :disabled="!testResult?.ok"
        @click="handleConfirm"
      >
        ✓ 确认环境就绪
      </button>
    </div>

    <p
      v-if="testResult"
      class="config-editor__result"
      :class="testResult.ok ? 'config-editor__result--ok' : 'config-editor__result--fail'"
    >
      {{ testResult.text }}
    </p>
    <p v-else-if="!saved" class="config-editor__hint">
      先改地址并保存，再用「测试连接」验证；占位符 127.0.0.1 通常连不通。
    </p>
  </div>
</template>
