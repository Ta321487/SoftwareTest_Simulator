<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'gonogo',
    validator: (v) => ['gonogo', 'roster', 'loadtest'].includes(v),
  },
  initialGonogoReviewed: {
    type: Boolean,
    default: false,
  },
  initialTasksAssigned: {
    type: Boolean,
    default: false,
  },
  initialLoadReportReviewed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'metrics-flagged',
  'gonogo-reviewed',
  'tasks-draft-updated',
  'tasks-assigned',
  'load-report-reviewed',
])

const gonogoMetrics = [
  {
    id: 'p99',
    label: '核心下单 P99',
    value: '480ms',
    target: '≤ 500ms',
    tone: 'ok',
  },
  {
    id: 'inventory',
    label: '库存服务错误率',
    value: '2.1%',
    target: '< 0.5%',
    tone: 'error',
  },
  {
    id: 'qps',
    label: '峰值 QPS',
    value: '12,400',
    target: '目标 10,000+',
    tone: 'ok',
  },
]

const loadMetrics = [
  {
    id: 'p99',
    label: '下单 P99',
    value: '420ms',
    target: '≤ 500ms',
    tone: 'ok',
  },
  {
    id: 'pay-timeout',
    label: '支付网关超时率',
    value: '1.8%',
    target: '< 0.3%',
    tone: 'error',
  },
  {
    id: 'success',
    label: '下单成功率',
    value: '99.2%',
    target: '≥ 99.9%',
    tone: 'warn',
  },
]

const flaggedMetric = ref(props.initialGonogoReviewed ? 'inventory' : null)
const gonogoDone = ref(props.initialGonogoReviewed)
const rosterScope = ref('')
const rosterDeliver = ref('')
const rosterDeadline = ref('')
const rosterDone = ref(props.initialTasksAssigned)
const loadDone = ref(props.initialLoadReportReviewed)

const rosterReady = computed(
  () =>
    rosterScope.value.trim().length >= 4 &&
    rosterDeliver.value.trim().length >= 4 &&
    rosterDeadline.value.trim().length >= 2
)

function flagMetric(id) {
  flaggedMetric.value = id
  if (id === 'inventory') {
    emit('metrics-flagged')
  }
}

function confirmGonogo() {
  if (gonogoDone.value) return
  gonogoDone.value = true
  emit('gonogo-reviewed')
}

function onRosterInput() {
  if (rosterReady.value) {
    emit('tasks-draft-updated')
  }
}

function submitRoster() {
  if (!rosterReady.value || rosterDone.value) return
  rosterDone.value = true
  emit('tasks-assigned')
}

function confirmLoadReport() {
  if (loadDone.value) return
  loadDone.value = true
  emit('load-report-reviewed')
}
</script>

<template>
  <div class="lead-panel sim-card">
    <header class="lead-panel__header">
      <div>
        <p class="lead-panel__brand">
          Lead 管理台 ·
          {{ mode === 'gonogo' ? 'Go/No-Go' : mode === 'roster' ? '任务分派' : '压测报告' }}
        </p>
        <p class="lead-panel__version">season2-lead · 大促发布前</p>
      </div>
      <span class="lead-panel__env">预发 / 压测</span>
    </header>

    <div v-if="mode === 'gonogo'" class="lead-panel__metrics">
      <p class="lead-panel__title">大促压测 · 发布评审看板</p>
      <div class="lead-panel__metric-grid">
        <button
          v-for="m in gonogoMetrics"
          :key="m.id"
          type="button"
          class="lead-panel__metric"
          :class="[
            `lead-panel__metric--${m.tone}`,
            { 'lead-panel__metric--active': flaggedMetric === m.id },
          ]"
          @click="flagMetric(m.id)"
        >
          <p class="lead-panel__metric-label">{{ m.label }}</p>
          <p class="lead-panel__metric-value">{{ m.value }}</p>
          <p class="lead-panel__metric-target">目标 {{ m.target }}</p>
        </button>
      </div>
      <p v-if="flaggedMetric === 'inventory'" class="lead-panel__status lead-panel__status--warn">
        ⚠ 库存错误率 2.1% 远超 0.5% 目标 — 核心链路风险
      </p>
      <p v-else class="lead-panel__guide">点击指标卡片，找出不达标的项。</p>
      <button
        type="button"
        class="sim-btn sim-btn--primary lead-panel__action"
        :disabled="flaggedMetric !== 'inventory' || gonogoDone"
        @click="confirmGonogo"
      >
        {{ gonogoDone ? '✓ 已记录 No-Go' : '记录 No-Go · 待复测' }}
      </button>
    </div>

    <div v-else-if="mode === 'roster'" class="lead-panel__roster">
      <p class="lead-panel__title">分派给实习生 · 登录回归</p>
      <label class="lead-panel__field">
        <span>📋 任务范围</span>
        <textarea
          v-model="rosterScope"
          rows="2"
          placeholder="说明要测哪些模块/场景…"
          @input="onRosterInput"
        />
      </label>
      <label class="lead-panel__field">
        <span>✅ 交付标准</span>
        <textarea
          v-model="rosterDeliver"
          rows="2"
          placeholder="说明交付物与完成标准…"
          @input="onRosterInput"
        />
      </label>
      <label class="lead-panel__field">
        <span>⏰ 截止时间</span>
        <input
          v-model="rosterDeadline"
          type="text"
          placeholder="如：周五 18:00 前"
          @input="onRosterInput"
        />
      </label>
      <button
        type="button"
        class="sim-btn sim-btn--primary lead-panel__action"
        :disabled="!rosterReady || rosterDone"
        @click="submitRoster"
      >
        {{ rosterDone ? '✓ 任务已分派' : '确认分派' }}
      </button>
    </div>

    <div v-else class="lead-panel__loadtest">
      <p class="lead-panel__title">大促全链路压测报告 · v3</p>
      <div class="lead-panel__report-meta">
        <span>场景：下单 → 支付 → 库存扣减</span>
        <span>并发：8,000 · 时长 30min</span>
      </div>
      <div class="lead-panel__metric-grid">
        <div
          v-for="m in loadMetrics"
          :key="m.id"
          class="lead-panel__metric lead-panel__metric--static"
          :class="`lead-panel__metric--${m.tone}`"
        >
          <p class="lead-panel__metric-label">{{ m.label }}</p>
          <p class="lead-panel__metric-value">{{ m.value }}</p>
          <p class="lead-panel__metric-target">目标 {{ m.target }}</p>
        </div>
      </div>
      <p class="lead-panel__status lead-panel__status--warn">
        结论建议：支付超时率超标，应 No-Go 直到修复并复测通过
      </p>
      <button
        type="button"
        class="sim-btn sim-btn--primary lead-panel__action"
        :disabled="loadDone"
        @click="confirmLoadReport"
      >
        {{ loadDone ? '✓ 已确认发布建议' : '确认不建议发布' }}
      </button>
    </div>
  </div>
</template>
