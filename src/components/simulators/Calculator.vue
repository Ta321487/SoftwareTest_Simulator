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
        公式：缺陷密度 = Bug 数 ÷ 用例数 × 100%
      </p>
      <p v-else class="calculator__formula-text">
        公式：总用例量 ÷ 每小时执行数 ÷ 日有效工时 = 所需天数
      </p>
      <p class="calculator__formula-note">
        请自行计算，下方填写结果（保留两位小数，如 3.33 或 4.00）
      </p>
    </div>

    <div class="sim-field calculator__answer">
      <label class="sim-field__label">你的计算结果</label>
      <input
        v-model="userResult"
        type="text"
        class="sim-field__input"
        :placeholder="calculatorFormula === 'density' ? '例如：4.00' : '例如：3.33'"
      />
    </div>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">✓ 提交结果</button>
  </div>
</template>
