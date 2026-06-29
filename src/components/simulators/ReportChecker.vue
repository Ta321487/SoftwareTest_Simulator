<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  reportItems: {
    type: Array,
    required: true,
  },
  storyRef: {
    type: String,
    default: '',
  },
  projectLabel: {
    type: String,
    default: '',
  },
  linkedIssueFromStore: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['submit'])

const selected = ref([])

const stats = computed(() => {
  const total = props.reportItems.length
  const passed = props.reportItems.filter((i) => i.status === 'pass').length
  const failed = total - passed
  const passRate = total ? Math.round((passed / total) * 100) : 0
  return { total, passed, failed, passRate }
})

function handleSubmit() {
  emit('submit', { selected: [...selected.value] })
}

function reset() {
  selected.value = []
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card report-checker">
    <div v-if="storyRef || linkedIssueFromStore" class="report-checker__banner">
      关联工单：
      <strong>{{ linkedIssueFromStore || storyRef }}</strong>
      <template v-if="projectLabel"> · {{ projectLabel }}</template>
    </div>

    <div class="report-checker__stats">
      <div class="report-stat">
        <span class="report-stat__value">{{ stats.total }}</span>
        <span class="report-stat__label">总用例</span>
      </div>
      <div class="report-stat report-stat--pass">
        <span class="report-stat__value">{{ stats.passed }}</span>
        <span class="report-stat__label">PASS</span>
      </div>
      <div class="report-stat report-stat--fail">
        <span class="report-stat__value">{{ stats.failed }}</span>
        <span class="report-stat__label">FAIL</span>
      </div>
      <div class="report-stat">
        <span class="report-stat__value">{{ stats.passRate }}%</span>
        <span class="report-stat__label">通过率</span>
      </div>
    </div>

    <label
      v-for="item in reportItems"
      :key="item.id"
      class="report-item"
      :class="{ 'report-item--selected': selected.includes(item.id) }"
    >
      <input v-model="selected" type="checkbox" :value="item.id" />
      <div class="report-item__body">
        <span class="report-item__title">
          {{ item.title }}
          <span v-if="item.linkedIssue" class="report-item__link">{{ item.linkedIssue }}</span>
        </span>
        <div class="report-item__tags">
          <span class="report-tag" :class="`report-tag--${item.status}`">
            {{ item.status === 'fail' ? 'FAIL' : 'PASS' }}
          </span>
          <span class="report-tag" :class="`report-tag--risk-${item.risk}`">
            {{ item.risk.toUpperCase() }}
          </span>
        </div>
      </div>
    </label>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">
      ✓ 确认回归范围
    </button>
  </div>
</template>
