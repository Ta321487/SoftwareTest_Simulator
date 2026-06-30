<script setup>
import { computed } from 'vue'
import { useProgressStore } from '../stores/progressStore'
import { shouldShowBackupReminder, dismissBackupReminder } from '../utils/bootstrapRestore'

const emit = defineEmits(['go-settings'])

const progressStore = useProgressStore()

const visible = computed(() =>
  shouldShowBackupReminder(progressStore.completedLevelIds.length)
)

function dismiss() {
  dismissBackupReminder()
}

function goExport() {
  emit('go-settings')
}
</script>

<template>
  <div v-if="visible" class="backup-reminder" role="status">
    <p class="backup-reminder__text">
      你已通关 {{ progressStore.completedLevelIds.length }} 关，建议导出存档以防换设备或清缓存丢进度。
    </p>
    <div class="backup-reminder__actions">
      <button type="button" class="level-map__btn level-map__btn--ghost" @click="goExport">
        去导出
      </button>
      <button type="button" class="backup-reminder__dismiss" @click="dismiss">稍后</button>
    </div>
  </div>
</template>

<style scoped>
.backup-reminder {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--accent-amber);
  background: rgba(245, 158, 11, 0.08);
}

.backup-reminder__text {
  margin: 0;
  flex: 1;
  min-width: 200px;
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.backup-reminder__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.backup-reminder__dismiss {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.82rem;
}
</style>
