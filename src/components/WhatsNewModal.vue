<script setup>
import { ref, computed } from 'vue'
import { getItem, setItem } from '../utils/storage'
import { APP_VERSION, WHATS_NEW_ENTRIES } from '../data/whatsNew'

const emit = defineEmits(['close'])

const STORAGE_KEY = 'whats_new_seen_version'

const visible = ref(false)

const latestEntry = computed(() => WHATS_NEW_ENTRIES[0] || null)

function shouldShow() {
  const entry = latestEntry.value
  if (!entry) return false
  const seen = getItem(STORAGE_KEY, '')
  return seen !== APP_VERSION
}

function open() {
  if (shouldShow()) visible.value = true
}

function dismiss() {
  setItem(STORAGE_KEY, APP_VERSION)
  visible.value = false
  emit('close')
}

defineExpose({ open, shouldShow })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible && latestEntry"
      class="whats-new"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
    >
      <div class="whats-new__backdrop" @click="dismiss" />
      <div class="whats-new__panel">
        <header class="whats-new__header">
          <span class="whats-new__badge">✨ 更新说明</span>
          <span class="whats-new__version">v{{ latestEntry.version }}</span>
        </header>
        <h2 id="whats-new-title" class="whats-new__title">{{ latestEntry.title }}</h2>
        <ul class="whats-new__list">
          <li v-for="(item, idx) in latestEntry.items" :key="idx">{{ item }}</li>
        </ul>
        <footer class="whats-new__footer">
          <button type="button" class="level-map__btn level-map__btn--primary" @click="dismiss">
            知道了
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.whats-new {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.whats-new__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.whats-new__panel {
  position: relative;
  width: min(440px, 100%);
  padding: 20px 22px;
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--surface-elevated, var(--bg-card));
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.whats-new__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.whats-new__badge {
  font-size: 0.78rem;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
}

.whats-new__version {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.whats-new__title {
  margin: 0 0 12px;
  font-size: 1.15rem;
}

.whats-new__list {
  margin: 0 0 18px;
  padding-left: 1.2rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.65;
}

.whats-new__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
