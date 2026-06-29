<script setup>
import { ref } from 'vue'
import { executeSqlQuery } from '../../utils/sqlValidation'

const props = defineProps({
  sqlHint: { type: String, default: '' },
  sqlTable: { type: String, default: 'orders' },
  sqlSchema: { type: String, default: '' },
  sqlMustInclude: { type: Array, default: () => [] },
  sqlMustIncludeAny: { type: Array, default: () => [] },
  sqlResultRows: { type: Array, default: () => [] },
  correctQuery: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const query = ref('')
const rows = ref([])
const error = ref('')
const success = ref(false)

function levelContext() {
  return {
    sqlTable: props.sqlTable,
    sqlMustInclude: props.sqlMustInclude,
    sqlMustIncludeAny: props.sqlMustIncludeAny,
    sqlResultRows: props.sqlResultRows,
    correctQuery: props.correctQuery,
  }
}

function handleRun() {
  if (success.value) return
  const result = executeSqlQuery(query.value, levelContext())
  if (!result.validation.isPass) {
    error.value = result.validation.message
    rows.value = []
    return
  }
  error.value = ''
  rows.value = result.rows
  success.value = true
  emit('submit', { query: query.value.trim() })
}

function reset() {
  query.value = ''
  rows.value = []
  error.value = ''
  success.value = false
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card sql-client">
    <header class="sql-client__header">
      <span class="sql-client__brand">🗄️ DBeaver · 只读查询</span>
      <span class="sql-client__env">pay_test @ 10.0.1.5</span>
    </header>

    <pre v-if="sqlSchema" class="sql-client__schema">{{ sqlSchema }}</pre>
    <p v-else class="sql-client__schema sql-client__schema--hint">
      表 <code>{{ sqlTable }}</code> · 测试库只读账号，仅允许 SELECT
    </p>

    <textarea
      v-model="query"
      class="sql-client__input"
      rows="3"
      :disabled="success"
      placeholder="SELECT … FROM … WHERE …"
      spellcheck="false"
    />

    <div class="sql-client__actions">
      <button type="button" class="sim-btn sim-btn--primary" :disabled="success" @click="handleRun">
        ▶ 执行查询
      </button>
    </div>

    <p v-if="error && !success" class="sql-client__error">{{ error }}</p>

    <div v-if="rows.length" class="sql-client__result">
      <p class="sql-client__result-title">{{ rows.length }} row(s)</p>
      <table class="sql-client__table">
        <thead>
          <tr>
            <th v-for="col in Object.keys(rows[0] || {})" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="idx">
            <td v-for="col in Object.keys(row)" :key="col">{{ row[col] }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="sqlHint && !success" class="sql-client__hint">{{ sqlHint }}</p>
    <p v-if="success" class="sql-client__ok">✓ 查询结果与接口现象一致，可提交结论。</p>
  </div>
</template>

<style scoped>
.sql-client__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}
.sql-client__env {
  color: var(--text-muted);
  font-size: 0.75rem;
}
.sql-client__schema {
  background: var(--terminal-bg);
  color: var(--terminal-muted);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
  overflow-x: auto;
}
.sql-client__schema--hint code {
  color: var(--terminal-text);
}
.sql-client__input {
  width: 100%;
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  padding: 0.625rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  resize: vertical;
}
.sql-client__actions {
  margin-top: 0.5rem;
}
.sql-client__error {
  color: var(--terminal-error);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}
.sql-client__result {
  margin-top: 0.75rem;
  overflow-x: auto;
}
.sql-client__result-title {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}
.sql-client__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.sql-client__table th,
.sql-client__table td {
  border: 1px solid var(--border);
  padding: 0.375rem 0.5rem;
  text-align: left;
}
.sql-client__table th {
  background: var(--surface-2);
}
.sql-client__hint,
.sql-client__ok {
  font-size: 0.8125rem;
  margin-top: 0.75rem;
  color: var(--text-muted);
}
.sql-client__ok {
  color: var(--terminal-text);
}
</style>
