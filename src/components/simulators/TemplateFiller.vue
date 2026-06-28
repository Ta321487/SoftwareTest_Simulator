<script setup>
import { computed, reactive, watch } from 'vue'
import { getTemplateComposePreview } from '../../utils/templateValidation'

const props = defineProps({
  templateFields: {
    type: Array,
    required: true,
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
const levelConfig = computed(() => ({
  templateFields: props.templateFields,
  templateMinLength: props.templateMinLength,
  requirement: props.requirement,
}))

const composePreview = computed(() =>
  getTemplateComposePreview(levelConfig.value, values)
)

const isTableMode = () => props.templateFields.some((field) => field.scenario)

watch(
  () => props.templateFields,
  (fields) => {
    fields.forEach((field) => {
      if (!(field.field in values)) {
        values[field.field] = props.initialValues?.[field.field] || ''
      }
    })
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

function getLabel(field) {
  return field.scenario || field.label
}

function handleSubmit() {
  emit('submit', { values: { ...values } })
}
</script>

<template>
  <div class="sim-card template-filler">
    <div v-if="requirement" class="template-filler__requirement">
      <span class="template-filler__requirement-label">📋 需求规则</span>
      <p>{{ requirement }}</p>
    </div>

    <p v-if="fillHint" class="template-filler__hint">{{ fillHint }}</p>

    <div v-if="isTableMode()" class="template-table">
      <div class="template-table__head">
        <span class="template-table__col template-table__col--scenario">测试场景</span>
        <span class="template-table__col template-table__col--result">预期结果（你来填写）</span>
      </div>
      <div
        v-for="(field, index) in templateFields"
        :key="field.field"
        class="template-table__row"
      >
        <div class="template-table__col template-table__col--scenario">
          <span class="template-table__index">#{{ index + 1 }}</span>
          {{ getLabel(field) }}
        </div>
        <div class="template-table__col template-table__col--result">
          <textarea
            v-model="values[field.field]"
            class="sim-field__textarea"
            :rows="field.rows || 2"
            :placeholder="field.placeholder"
          />
        </div>
      </div>
    </div>

    <template v-else>
      <div v-for="field in templateFields" :key="field.field" class="sim-field">
        <label class="sim-field__label">{{ field.label }}</label>
        <textarea
          v-model="values[field.field]"
          class="sim-field__textarea"
          :rows="field.rows || 2"
          :placeholder="field.placeholder"
        />
      </div>
    </template>

    <div
      v-if="composePreview.hasPreview"
      class="template-filler__preview"
      :class="`template-filler__preview--${composePreview.tier}`"
    >
      <p class="template-filler__preview-title">
        提交前预览 · {{ composePreview.tierLabel }}
        <span class="template-filler__preview-progress">字段 {{ composePreview.progress }}</span>
      </p>
      <ul v-if="composePreview.tips.length" class="template-filler__preview-tips">
        <li v-for="(tip, idx) in composePreview.tips" :key="idx">{{ tip }}</li>
      </ul>
      <p v-else class="template-filler__preview-ok">各字段达标，可以提交。</p>
    </div>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">
      ✓ 提交
    </button>
  </div>
</template>
