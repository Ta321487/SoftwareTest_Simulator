<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { getTemplateComposePreview } from '../../utils/templateValidation'

const props = defineProps({
  apiMethod: {
    type: String,
    default: 'POST',
  },
  apiUrl: {
    type: String,
    default: '/api/login',
  },
  apiRequestBody: {
    type: String,
    default: '{\n  "username": "testuser",\n  "password": "wrong_pass"\n}',
  },
  templateFields: {
    type: Array,
    default: () => [],
  },
  checklistItems: {
    type: Array,
    default: () => [],
  },
  initialSelected: {
    type: Array,
    default: null,
  },
  requirement: {
    type: String,
    default: '',
  },
  fillHint: {
    type: String,
    default: '',
  },
  templateMinLength: {
    type: Number,
    default: 0,
  },
  initialValues: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit'])

const values = reactive({})
const selected = ref([])
const activeTab = ref(0)
const sending = ref(false)
const lastStatus = ref(null)

const isChecklistMode = computed(() => props.checklistItems.length > 0)

const levelConfig = computed(() => ({
  templateFields: props.templateFields,
  templateMinLength: props.templateMinLength,
  requirement: props.requirement,
}))

const composePreview = computed(() => {
  if (isChecklistMode.value) return { hasPreview: false }
  return getTemplateComposePreview(levelConfig.value, values)
})

const scenarios = computed(() =>
  props.templateFields.map((field, index) => {
    const raw = field.scenario || field.label || ''
    const lines = raw.split('\n')
    const title = lines[0] || `样本 ${index + 1}`
    const statusLine = lines.find((l) => l.startsWith('HTTP/')) || ''
    const statusMatch = statusLine.match(/HTTP\/[\d.]+\s+(\d+)/)
    const status = statusMatch ? statusMatch[1] : '—'
    const bodyStart = lines.findIndex((l) => l.trim().startsWith('{'))
    const responseBody =
      bodyStart >= 0 ? lines.slice(bodyStart).join('\n') : lines.slice(1).join('\n')
    return { field, title, status, responseBody, statusLine }
  })
)

const activeScenario = computed(() => scenarios.value[activeTab.value])

watch(
  () => props.templateFields,
  (fields) => {
    fields.forEach((field) => {
      if (!(field.field in values)) {
        values[field.field] = props.initialValues?.[field.field] || ''
      }
    })
    if (activeTab.value >= fields.length) activeTab.value = 0
  },
  { immediate: true }
)

watch(
  () => props.initialSelected,
  (init) => {
    selected.value = init ? [...init] : []
  },
  { immediate: true }
)

watch(
  () => props.initialValues,
  (init) => {
    if (!init) return
    props.templateFields.forEach((field) => {
      if (init[field.field] != null) values[field.field] = init[field.field]
    })
  },
  { deep: true }
)

function mockSend() {
  if (sending.value) return
  if (!isChecklistMode.value && !activeScenario.value) return
  sending.value = true
  lastStatus.value = null
  setTimeout(() => {
    sending.value = false
    lastStatus.value = isChecklistMode.value ? '200' : activeScenario.value.status
  }, 600)
}

function handleSubmit() {
  if (isChecklistMode.value) {
    emit('submit', { selected: [...selected.value] })
    return
  }
  emit('submit', { values: { ...values } })
}

function reset() {
  props.templateFields.forEach((field) => {
    values[field.field] = ''
  })
  selected.value = []
  activeTab.value = 0
  lastStatus.value = null
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card api-client">
    <div class="api-client__toolbar">
      <span class="api-client__brand">API 调试</span>
      <span class="api-client__env">测试环境</span>
    </div>

    <div class="api-client__request">
      <div class="api-client__line">
        <select class="api-client__method" disabled :value="apiMethod">
          <option>{{ apiMethod }}</option>
        </select>
        <input class="api-client__url" type="text" :value="apiUrl" readonly />
        <button
          type="button"
          class="sim-btn sim-btn--primary api-client__send"
          :disabled="sending"
          @click="mockSend"
        >
          {{ sending ? '发送中…' : '发送' }}
        </button>
      </div>
      <div class="api-client__section">
        <span class="api-client__section-label">Body · JSON</span>
        <pre class="api-client__body">{{ apiRequestBody }}</pre>
      </div>
      <p v-if="lastStatus" class="api-client__send-result">
        响应状态码：<strong>{{ lastStatus }}</strong
        ><template v-if="!isChecklistMode">（样本 {{ activeTab + 1 }}）</template>
      </p>
    </div>

    <div v-if="requirement" class="template-filler__requirement">
      <span class="template-filler__requirement-label">{{
        isChecklistMode ? '接口说明' : '断言规则'
      }}</span>
      <p>{{ requirement }}</p>
    </div>
    <p v-if="fillHint" class="template-filler__hint">{{ fillHint }}</p>

    <div v-if="isChecklistMode" class="api-client__checklist">
      <header class="api-client__checklist-header">接口测试覆盖项 · 请勾选</header>
      <label
        v-for="item in checklistItems"
        :key="item.id"
        class="checklist-item"
        :class="{ 'checklist-item--selected': selected.includes(item.id) }"
      >
        <input v-model="selected" type="checkbox" :value="item.id" />
        <span>{{ item.label }}</span>
      </label>
    </div>

    <template v-else>
      <div class="api-client__scenarios">
        <div class="api-client__tabs" role="tablist">
          <button
            v-for="(sc, idx) in scenarios"
            :key="sc.field.field"
            type="button"
            role="tab"
            class="api-client__tab"
            :class="{ 'api-client__tab--active': activeTab === idx }"
            :aria-selected="activeTab === idx"
            @click="activeTab = idx"
          >
            样本 {{ idx + 1 }}
          </button>
        </div>

        <div v-if="activeScenario" class="api-client__response">
          <div class="api-client__response-head">
            <span>{{ activeScenario.title }}</span>
            <span class="api-client__status">{{
              activeScenario.statusLine || `HTTP ${activeScenario.status}`
            }}</span>
          </div>
          <pre class="api-client__response-body">{{ activeScenario.responseBody }}</pre>
        </div>

        <label class="sim-field__label">测试断言（status + body 要点）</label>
        <textarea
          v-model="values[activeScenario.field.field]"
          class="sim-field__textarea"
          rows="3"
          :placeholder="activeScenario.field.placeholder"
        />
      </div>

      <div
        v-if="composePreview.hasPreview"
        class="template-filler__preview"
        :class="`template-filler__preview--${composePreview.tier}`"
      >
        <p class="template-filler__preview-title">
          提交前预览 · {{ composePreview.tierLabel }}
          <span class="template-filler__preview-progress">样本 {{ composePreview.progress }}</span>
        </p>
        <ul v-if="composePreview.tips.length" class="template-filler__preview-tips">
          <li v-for="(tip, idx) in composePreview.tips" :key="idx">{{ tip }}</li>
        </ul>
        <p v-else class="template-filler__preview-ok">各样本断言达标，可以提交。</p>
      </div>
    </template>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">
      ✓ {{ isChecklistMode ? '确认勾选' : '提交断言' }}
    </button>
  </div>
</template>
