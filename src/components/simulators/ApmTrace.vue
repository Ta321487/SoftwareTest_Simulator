<script setup>
import { ref } from 'vue'

defineProps({
  traceTitle: { type: String, default: '订单创建接口 · P99 = 3.2s' },
  traceNodes: { type: Array, required: true },
  apmMetrics: { type: Array, default: null },
  correctClick: { type: String, default: '' },
  apmMode: { type: String, default: 'trace' },
})

const emit = defineEmits(['submit'])

const selected = ref(null)

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
  <div class="sim-card apm-trace">
    <header class="apm-trace__header">
      <span>📈 APM · SkyWalking</span>
      <span class="apm-trace__env">order-service · 灰度</span>
    </header>

    <div v-if="apmMode === 'trace'" class="apm-trace__body">
      <p class="apm-trace__title">{{ traceTitle }}</p>
      <div class="apm-trace__nodes">
        <button
          v-for="node in traceNodes"
          :key="node.id"
          type="button"
          class="apm-trace__node"
          :class="{
            'apm-trace__node--active': selected === node.id,
            'apm-trace__node--hot': node.bottleneck,
          }"
          @click="select(node.id)"
        >
          <span class="apm-trace__label">{{ node.label }}</span>
          <span class="apm-trace__bar">
            <span class="apm-trace__fill" :style="{ width: `${node.pct || 10}%` }" />
          </span>
          <span class="apm-trace__ms">{{ node.latency }}ms · {{ node.pct }}%</span>
        </button>
      </div>
      <p class="apm-trace__guide">点击耗时占比最大的环节，或题目指定的告警指标。</p>
    </div>

    <div v-else class="apm-trace__metrics">
      <p class="apm-trace__title">告警面板 · 5 分钟窗口</p>
      <button
        v-for="m in apmMetrics"
        :key="m.id"
        type="button"
        class="apm-trace__metric"
        :class="[
          `apm-trace__metric--${m.tone || 'neutral'}`,
          { 'apm-trace__metric--active': selected === m.id },
        ]"
        @click="select(m.id)"
      >
        <span>{{ m.label }}</span>
        <strong>{{ m.value }}</strong>
      </button>
      <p class="apm-trace__guide">发布夜优先盯错误率与核心转化率，UI 样式不是监控项。</p>
    </div>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">✓ 确认选择</button>
  </div>
</template>

<style scoped>
.apm-trace__header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.apm-trace__env {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.apm-trace__title {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
.apm-trace__nodes {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}
.apm-trace__node {
  display: grid;
  grid-template-columns: 6rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
  text-align: left;
  font-size: 0.8125rem;
}
.apm-trace__node--hot {
  border-color: var(--terminal-error);
}
.apm-trace__node--active {
  outline: 2px solid var(--accent);
}
.apm-trace__bar {
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  overflow: hidden;
}
.apm-trace__fill {
  display: block;
  height: 100%;
  background: var(--accent);
}
.apm-trace__node--hot .apm-trace__fill {
  background: var(--terminal-error);
}
.apm-trace__ms {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}
.apm-trace__metrics {
  display: grid;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}
.apm-trace__metric {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
  font-size: 0.8125rem;
}
.apm-trace__metric--error {
  border-color: var(--terminal-error);
}
.apm-trace__metric--warn {
  border-color: #f59e0b;
}
.apm-trace__metric--active {
  outline: 2px solid var(--accent);
}
.apm-trace__guide {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}
</style>
