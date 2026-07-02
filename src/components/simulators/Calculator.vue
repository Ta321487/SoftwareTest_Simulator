<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  calculatorFields: {
    type: Array,
    required: true,
  },
  calculatorFormula: {
    type: String,
    default: 'schedule',
  },
  calculatorReadonly: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['submit'])

const values = reactive({})
const userResult = ref('')

watch(
  () => props.calculatorFields,
  (fields) => {
    fields.forEach((field) => {
      if (!(field.field in values)) values[field.field] = field.defaultValue
    })
  },
  { immediate: true }
)

function handleSubmit() {
  emit('submit', { values: { ...values }, userResult: userResult.value.trim() })
}

function reset() {
  userResult.value = ''
  props.calculatorFields.forEach((field) => {
    values[field.field] = field.defaultValue
  })
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card calculator">
    <div class="calculator__grid">
      <div v-for="field in calculatorFields" :key="field.field" class="sim-field">
        <label class="sim-field__label">{{ field.label }}</label>
        <input
          v-model.number="values[field.field]"
          type="number"
          class="sim-field__input"
          min="0"
          :readonly="calculatorReadonly"
          :class="{ 'sim-field__input--readonly': calculatorReadonly }"
        />
      </div>
    </div>

    <div class="calculator__formula calculator__formula--hint">
      <p v-if="calculatorFormula === 'density'" class="calculator__formula-text">
        缺陷密度 = Bug 数 ÷ 用例数 × 100%
      </p>
      <p v-else class="calculator__formula-text">所需天数 = 总用例 ÷ 每小时条数 ÷ 日有效工时</p>
      <p class="calculator__formula-note">请填写计算结果，单位可省略。</p>
    </div>

    <div class="sim-field calculator__answer">
      <label class="sim-field__label">计算结果</label>
      <input v-model="userResult" type="text" class="sim-field__input" placeholder="数字" />
    </div>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">✓ 提交结果</button>
  </div>
</template>
