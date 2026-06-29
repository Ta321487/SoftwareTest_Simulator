<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  clickOptions: {
    type: Array,
    required: true,
  },
  clickVariant: {
    type: String,
    default: 'default',
  },
})

const emit = defineEmits(['submit'])

const selected = ref(null)

const maxLatencyMs = computed(() => {
  const values = props.clickOptions.map((o) => parseMs(o.label))
  return Math.max(...values, 1)
})

function parseMs(label) {
  const match = label.match(/(\d+)\s*ms/i)
  return match ? Number(match[1]) : 0
}

function latencyWidth(option) {
  const ms = parseMs(option.label)
  return `${Math.round((ms / maxLatencyMs.value) * 100)}%`
}

function select(id) {
  selected.value = selected.value === id ? null : id
}

function handleSubmit() {
  emit('submit', { selected: selected.value })
}

function reset() {
  selected.value = null
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card click-card" :class="`click-card--${clickVariant}`">
    <header v-if="clickVariant === 'git'" class="click-card__header">
      <span>🌿 Git 分支 · payment-test 环境</span>
      <span class="click-card__hint">对照发布计划与部署记录判断</span>
    </header>
    <header v-else-if="clickVariant === 'trace'" class="click-card__header">
      <span>📈 调用链监控 · 订单创建接口</span>
      <span class="click-card__hint">对比各环节耗时占比</span>
    </header>

    <button
      v-for="option in clickOptions"
      :key="option.id"
      type="button"
      class="click-card__option"
      :class="{ 'click-card__option--active': selected === option.id }"
      @click="select(option.id)"
    >
      <span v-if="clickVariant === 'git'" class="click-card__branch-icon">⎇</span>
      <span v-if="clickVariant === 'trace'" class="click-card__latency-bar">
        <span class="click-card__latency-fill" :style="{ width: latencyWidth(option) }" />
      </span>
      <span class="click-card__label">{{ option.label }}</span>
    </button>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">✓ 确认选择</button>
  </div>
</template>
