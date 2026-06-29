<script setup>
import { ref } from 'vue'
import { executeRedisCommand } from '../../utils/redisValidation'

const props = defineProps({
  redisHint: { type: String, default: '' },
  redisStore: { type: Object, default: () => ({}) },
  redisKeys: { type: Array, default: null },
  correctCommand: { type: String, default: '' },
  redisSuccessMsg: { type: String, default: '键值读取成功，可与接口/日志交叉验证。' },
})

const emit = defineEmits(['submit'])

const command = ref('')
const output = ref('')
const error = ref(false)
const success = ref(false)
const history = ref([])

function levelContext() {
  return {
    redisStore: props.redisStore,
    redisKeys: props.redisKeys,
    correctCommand: props.correctCommand,
  }
}

function handleEnter() {
  const raw = command.value.trim()
  if (!raw || success.value) return

  history.value.push({ type: 'cmd', text: `127.0.0.1:6379> ${raw}` })
  const result = executeRedisCommand(raw, levelContext())

  if (result.error) {
    history.value.push({ type: 'err', text: result.error })
    error.value = true
  } else {
    history.value.push({ type: 'out', text: result.output })
    error.value = !result.validation.isPass
    if (result.validation.isPass) {
      success.value = true
      emit('submit', { command: raw })
    }
  }
  command.value = ''
}

function reset() {
  command.value = ''
  output.value = ''
  error.value = false
  success.value = false
  history.value = []
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card redis-client">
    <header class="redis-client__header">
      <span>🔴 Redis CLI · session 集群</span>
      <span class="redis-client__env">db0 · 只读</span>
    </header>

    <div class="redis-client__screen">
      <p class="redis-client__line">Connected to redis-session.internal:6379</p>
      <p
        v-for="(entry, idx) in history"
        :key="idx"
        class="redis-client__line"
        :class="{
          'redis-client__line--cmd': entry.type === 'cmd',
          'redis-client__line--out': entry.type === 'out',
          'redis-client__line--err': entry.type === 'err',
        }"
      >
        {{ entry.text }}
      </p>
    </div>

    <div
      class="redis-client__input-row"
      :class="{
        'redis-client__input-row--error': error && !success,
        'redis-client__input-row--success': success,
      }"
    >
      <span class="redis-client__prompt">&gt;</span>
      <input
        v-model="command"
        class="redis-client__input"
        type="text"
        :disabled="success"
        placeholder="GET / TTL / KEYS …"
        @keydown.enter="handleEnter"
      />
      <span v-if="success" class="redis-client__ok">✓</span>
    </div>

    <p v-if="redisHint && !success" class="redis-client__hint">{{ redisHint }}</p>
    <p v-if="success" class="redis-client__success">{{ redisSuccessMsg }}</p>
  </div>
</template>

<style scoped>
.redis-client__header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
.redis-client__env {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.redis-client__screen {
  background: var(--terminal-bg);
  border-radius: 6px;
  padding: 0.625rem;
  min-height: 5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
}
.redis-client__line {
  color: var(--terminal-muted);
  margin: 0.125rem 0;
}
.redis-client__line--out {
  color: var(--terminal-text);
}
.redis-client__line--err {
  color: var(--terminal-error);
}
.redis-client__input-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--terminal-bg);
}
.redis-client__input-row--error {
  border-color: var(--terminal-error);
}
.redis-client__input-row--success {
  border-color: var(--terminal-text);
}
.redis-client__prompt {
  color: var(--terminal-text);
}
.redis-client__input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--terminal-text);
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
}
.redis-client__ok {
  color: var(--terminal-text);
}
.redis-client__hint,
.redis-client__success {
  font-size: 0.8125rem;
  margin-top: 0.5rem;
  color: var(--text-muted);
}
.redis-client__success {
  color: var(--terminal-text);
}
</style>
