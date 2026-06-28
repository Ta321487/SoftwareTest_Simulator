<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

defineProps({
  checklistItems: {
    type: Array,
    required: true,
  },
  prdContent: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit'])

const selected = ref([])
const prdExpanded = ref(true)
let prdMedia = null

function syncPrdExpanded() {
  prdExpanded.value = !prdMedia?.matches
}

onMounted(() => {
  prdMedia = window.matchMedia('(max-width: 768px)')
  syncPrdExpanded()
  prdMedia.addEventListener('change', syncPrdExpanded)
})

onUnmounted(() => {
  prdMedia?.removeEventListener('change', syncPrdExpanded)
})

function handleSubmit() {
  emit('submit', { selected: [...selected.value] })
}
</script>

<template>
  <div class="sim-card checklist" :class="{ 'checklist--split': prdContent }">
    <aside v-if="prdContent" class="checklist__prd">
      <details
        class="checklist__prd-fold"
        :open="prdExpanded"
        @toggle="prdExpanded = $event.target.open"
      >
        <summary class="checklist__prd-header">
          <span>📄 飞书文档 · PRD</span>
          <span class="checklist__prd-badge">只读</span>
        </summary>
        <pre class="checklist__prd-body">{{ prdContent }}</pre>
      </details>
    </aside>

    <div class="checklist__main">
      <header v-if="prdContent" class="checklist__main-header">测试点清单 · 请勾选</header>
      <label
        v-for="item in checklistItems"
        :key="item.id"
        class="checklist-item"
        :class="{ 'checklist-item--selected': selected.includes(item.id) }"
      >
        <input v-model="selected" type="checkbox" :value="item.id" />
        <span>{{ item.label }}</span>
      </label>

      <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">
        ✓ 确认勾选
      </button>
    </div>
  </div>
</template>
