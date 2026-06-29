<script setup>
import { computed } from 'vue'

const props = defineProps({
  simType: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  savedAt: {
    type: String,
    default: '',
  },
})

const lines = computed(() => {
  const d = props.data
  switch (props.simType) {
    case 'template':
    case 'apiclient': {
      const values = d.values || {}
      return Object.entries(values).map(([key, val]) => ({
        label: key,
        text: String(val || '').trim(),
      }))
    }
    case 'jira': {
      const v = d.values || {}
      return Object.entries(v)
        .filter(([, val]) => String(val || '').trim())
        .map(([key, val]) => ({ label: key, text: String(val).trim() }))
    }
    case 'chat':
      return [{ label: '回复', text: d.message || '' }]
    case 'checklist':
      return [{ label: '已勾选', text: (d.selected || []).join(', ') }]
    case 'report':
      return [{ label: '回归项', text: (d.selected || []).join(', ') }]
    case 'terminal':
      return [{ label: '命令', text: d.command || '' }]
    case 'sqlclient':
      return [{ label: 'SQL', text: d.query || '' }]
    case 'redis':
      return [{ label: '命令', text: d.command || '' }]
    case 'cipipeline':
      return [
        { label: '阶段', text: d.selectedStage || '' },
        { label: '原因', text: d.selectedCause || '' },
      ]
    case 'mockserver': {
      const r = d.rules || {}
      return [{ label: 'Mock', text: `${r.path} → ${r.status}` }]
    }
    case 'mqinbox':
      if (d.code) return [{ label: '验证码', text: d.code }]
      return [{ label: '消息', text: d.selectedMessageId || '' }]
    case 'config':
      return [{ label: '配置值', text: d.value || '' }]
    case 'clickcard':
    case 'apmtrace':
    case 'gitrelease':
      return [{ label: '选择', text: d.selected || '' }]
    case 'calculator':
      return [{ label: '结果', text: d.result || '' }]
    default:
      return []
  }
})

const hasContent = computed(() => lines.value.some((l) => l.text))
</script>

<template>
  <details v-if="hasContent" class="prev-submission">
    <summary class="prev-submission__summary">
      📂 上次提交
      <span v-if="savedAt" class="prev-submission__date">{{ savedAt.slice(0, 10) }}</span>
    </summary>
    <dl class="prev-submission__list">
      <div v-for="(line, idx) in lines" :key="idx" class="prev-submission__item">
        <dt>{{ line.label }}</dt>
        <dd>{{ line.text }}</dd>
      </div>
    </dl>
  </details>
</template>
