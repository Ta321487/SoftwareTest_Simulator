<script setup>
import { ref } from 'vue'

const props = defineProps({
  pipelineStages: { type: Array, required: true },
  pipelineLog: { type: String, default: '' },
  correctStage: { type: String, default: '' },
  causeOptions: { type: Array, default: null },
  correctCause: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const selectedStage = ref(null)
const selectedCause = ref(null)
const showLog = ref(false)

function selectStage(id) {
  selectedStage.value = id
  const stage = props.pipelineStages.find((s) => s.id === id)
  showLog.value = stage?.status === 'failed'
}

function selectCause(id) {
  selectedCause.value = selectedCause.value === id ? null : id
}

function handleSubmit() {
  if (props.correctCause) {
    emit('submit', {
      selectedStage: selectedStage.value,
      selectedCause: selectedCause.value,
    })
    return
  }
  emit('submit', { selectedStage: selectedStage.value })
}

function reset() {
  selectedStage.value = null
  selectedCause.value = null
  showLog.value = false
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card ci-pipeline">
    <header class="ci-pipeline__header">
      <span>🔄 GitLab CI · build #4287</span>
      <span class="ci-pipeline__branch">release/pay-v2.3.1</span>
    </header>

    <ol class="ci-pipeline__stages">
      <li
        v-for="stage in pipelineStages"
        :key="stage.id"
        class="ci-pipeline__stage"
        :class="[
          `ci-pipeline__stage--${stage.status}`,
          { 'ci-pipeline__stage--active': selectedStage === stage.id },
        ]"
      >
        <button type="button" class="ci-pipeline__stage-btn" @click="selectStage(stage.id)">
          <span class="ci-pipeline__stage-icon">
            {{ stage.status === 'passed' ? '✓' : stage.status === 'failed' ? '✗' : '○' }}
          </span>
          <span>{{ stage.name }}</span>
          <span class="ci-pipeline__stage-time">{{ stage.duration || '' }}</span>
        </button>
      </li>
    </ol>

    <pre v-if="showLog && pipelineLog" class="ci-pipeline__log">{{ pipelineLog }}</pre>
    <p v-else-if="!selectedStage" class="ci-pipeline__guide">
      点击各阶段查看状态；失败阶段会展开日志片段。
    </p>

    <div v-if="causeOptions?.length && showLog" class="ci-pipeline__causes">
      <p class="ci-pipeline__causes-title">根据日志，最可能的失败原因是？</p>
      <button
        v-for="opt in causeOptions"
        :key="opt.id"
        type="button"
        class="ci-pipeline__cause"
        :class="{ 'ci-pipeline__cause--active': selectedCause === opt.id }"
        @click="selectCause(opt.id)"
      >
        {{ opt.label }}
      </button>
    </div>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">✓ 确认判断</button>
  </div>
</template>

<style scoped>
.ci-pipeline__header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.ci-pipeline__branch {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.ci-pipeline__stages {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.ci-pipeline__stage-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
  text-align: left;
  font-size: 0.875rem;
}
.ci-pipeline__stage--failed .ci-pipeline__stage-btn {
  border-color: var(--terminal-error);
}
.ci-pipeline__stage--active .ci-pipeline__stage-btn {
  outline: 2px solid var(--accent);
}
.ci-pipeline__stage-icon {
  width: 1.25rem;
  text-align: center;
}
.ci-pipeline__stage--passed .ci-pipeline__stage-icon {
  color: var(--terminal-text);
}
.ci-pipeline__stage--failed .ci-pipeline__stage-icon {
  color: var(--terminal-error);
}
.ci-pipeline__stage-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.ci-pipeline__log {
  background: var(--terminal-bg);
  color: var(--terminal-muted);
  padding: 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
  max-height: 8rem;
}
.ci-pipeline__guide {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}
.ci-pipeline__causes-title {
  font-size: 0.8125rem;
  margin-bottom: 0.5rem;
}
.ci-pipeline__cause {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  margin-bottom: 0.375rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
  font-size: 0.8125rem;
}
.ci-pipeline__cause--active {
  border-color: var(--accent);
  background: var(--surface-2);
}
</style>
