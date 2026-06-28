<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { getJiraTierPreview, JIRA_TIER_LABELS } from '../../utils/jiraValidation'

const props = defineProps({
  jiraFields: {
    type: Object,
    required: true,
  },
  externalInvalidFields: {
    type: Array,
    default: () => [],
  },
  preview: {
    type: Object,
    default: null,
  },
  levelId: {
    type: Number,
    default: 1,
  },
  projectName: {
    type: String,
    default: '通用',
  },
  jiraMode: {
    type: String,
    default: 'create',
  },
  jiraDraft: {
    type: Object,
    default: null,
  },
  jiraBacklog: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['submit'])

const values = reactive({})
const invalidFields = ref([])
const view = ref('list')

const issueKey = computed(() => `TEST-${1000 + props.levelId}`)

const navItems = ['项目', '问题', '看板', '报告']

watch(
  () => props.jiraFields,
  (fields) => {
    Object.keys(fields).forEach((key) => {
      if (!(key in values)) {
        values[key] = props.jiraDraft?.[key] || ''
      }
    })
  },
  { immediate: true }
)

watch(
  () => props.externalInvalidFields,
  (fields) => {
    if (fields.length) invalidFields.value = fields
  }
)

function isSelect(field) {
  return Array.isArray(field.options)
}

function fieldClass(key) {
  return invalidFields.value.includes(key) ? 'sim-field--error' : ''
}

function openEdit() {
  view.value = 'edit'
}

function handleSubmit() {
  const missing = []
  for (const [key, config] of Object.entries(props.jiraFields)) {
    if (config.required && !String(values[key] || '').trim()) {
      missing.push(key)
    }
  }
  invalidFields.value = missing
  if (missing.length) return
  emit('submit', { values: { ...values } })
}

const tierPreview = computed(() => getJiraTierPreview(props.levelId, values))

const showTierPreview = computed(
  () => tierPreview.value.hasRules && view.value !== 'list' && !props.preview
)
</script>

<template>
  <div class="sim-card jira-form">
    <div class="jira-form__layout">
      <aside class="jira-form__sidebar">
        <p class="jira-form__sidebar-title">SoftwareTest</p>
        <nav class="jira-form__nav">
          <span v-for="item in navItems" :key="item" class="jira-form__nav-item">{{ item }}</span>
        </nav>
      </aside>

      <div class="jira-form__main">
        <header class="jira-form__header">
          <div class="jira-form__brand">
            <span class="jira-form__logo">Jira</span>
            <span class="jira-form__project">{{ projectName }} / Bug</span>
          </div>
          <span v-if="view !== 'list'" class="jira-form__issue-key">{{ issueKey }}</span>
        </header>

        <div v-if="preview" class="jira-form__preview">
          <p class="jira-form__preview-title">✓ 工单已提交</p>
          <dl class="jira-preview">
            <template v-for="(config, key) in jiraFields" :key="key">
              <dt>{{ config.label }}</dt>
              <dd>{{ preview[key] || '—' }}</dd>
            </template>
          </dl>
        </div>

        <template v-else-if="view === 'list'">
          <div class="jira-form__list-header">
            <h3>问题列表</h3>
            <button v-if="jiraMode === 'create'" type="button" class="sim-btn sim-btn--primary sim-btn--sm" @click="view = 'create'">
              + 创建问题
            </button>
          </div>
          <table class="jira-form__table">
            <thead>
              <tr>
                <th>编号</th>
                <th>摘要</th>
                <th>模块</th>
                <th>状态</th>
                <th>经办人</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="issue in jiraBacklog"
                :key="issue.key"
                :class="{ 'jira-form__row--highlight': issue.highlight }"
                @click="issue.highlight && openEdit()"
              >
                <td>{{ issue.key }}</td>
                <td>{{ issue.summary }}</td>
                <td>{{ issue.module }}</td>
                <td><span class="jira-form__status">{{ issue.status }}</span></td>
                <td>{{ issue.assignee }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="jiraMode === 'edit'" class="jira-form__hint">点击高亮行 TEST-1008 进行补全。</p>
        </template>

        <template v-else>
          <button
            v-if="jiraBacklog.length"
            type="button"
            class="jira-form__back-list"
            @click="view = 'list'"
          >
            ← 返回列表
          </button>

          <div
            v-for="(config, key) in jiraFields"
            :key="key"
            class="sim-field"
            :class="fieldClass(key)"
          >
            <label class="sim-field__label">
              {{ config.label }}
              <span v-if="config.required" class="sim-field__required">*</span>
            </label>

            <select v-if="isSelect(config)" v-model="values[key]" class="sim-field__input">
              <option value="" disabled>请选择</option>
              <option v-for="opt in config.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <textarea
              v-else-if="config.rows"
              v-model="values[key]"
              class="sim-field__textarea"
              :rows="config.rows"
              :placeholder="config.placeholder"
            />

            <input
              v-else
              v-model="values[key]"
              type="text"
              class="sim-field__input"
              :placeholder="config.placeholder"
            />
          </div>

          <div
            v-if="showTierPreview"
            class="jira-form__quality-preview"
            :class="`jira-form__quality-preview--${tierPreview.tier}`"
          >
            <p class="jira-form__quality-title">
              提交前预览 · {{ JIRA_TIER_LABELS[tierPreview.tier] }}
              <span class="jira-form__quality-stars">最高 ★{{ tierPreview.starCap }}</span>
            </p>
            <ul v-if="tierPreview.tips.length" class="jira-form__quality-tips">
              <li v-for="(tip, idx) in tierPreview.tips" :key="idx">{{ tip }}</li>
            </ul>
            <p v-else class="jira-form__quality-ok">
              质量达标，提交后可拿 {{ JIRA_TIER_LABELS[tierPreview.tier] }} 档星级。
            </p>
          </div>

          <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">
            ✓ 提交工单
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
