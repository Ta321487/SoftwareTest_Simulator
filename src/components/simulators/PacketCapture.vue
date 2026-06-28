<script setup>
import { ref } from 'vue'

const props = defineProps({
  packetRequests: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submit'])

const selected = ref(null)

function methodClass(method) {
  const m = (method || 'GET').toUpperCase()
  if (m === 'POST') return 'packet-capture__method--post'
  if (m === 'PUT' || m === 'PATCH') return 'packet-capture__method--mutate'
  if (m === 'DELETE') return 'packet-capture__method--delete'
  return 'packet-capture__method--get'
}

function statusClass(status) {
  const code = Number(status)
  if (code >= 500) return 'packet-capture__status--5xx'
  if (code >= 400) return 'packet-capture__status--4xx'
  return 'packet-capture__status--ok'
}

function select(id) {
  selected.value = selected.value === id ? null : id
}

function handleSubmit() {
  emit('submit', { selected: selected.value })
}

defineExpose({
  reset() {
    selected.value = null
  },
  markError() {},
  markSuccess() {},
})
</script>

<template>
  <div class="sim-card packet-capture">
    <header class="packet-capture__header">
      <span>🔍 Charles · 测试环境会话</span>
      <span class="packet-capture__hint">对照 status、Host 与业务链路判断</span>
    </header>

    <button
      v-for="req in packetRequests"
      :key="req.id"
      type="button"
      class="packet-capture__row"
      :class="{ 'packet-capture__row--active': selected === req.id }"
      @click="select(req.id)"
    >
      <span class="packet-capture__method" :class="methodClass(req.method)">{{ req.method }}</span>
      <span class="packet-capture__url">{{ req.url }}</span>
      <span class="packet-capture__status" :class="statusClass(req.status)">{{ req.status }}</span>
      <span class="packet-capture__summary">{{ req.summary }}</span>
    </button>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">✓ 确认选择</button>
  </div>
</template>
