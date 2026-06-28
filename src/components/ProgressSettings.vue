<script setup>
import { ref } from 'vue'
import { useProgressStore } from '../stores/progressStore'
import { useProjectStore } from '../stores/projectStore'
import { useThemeStore } from '../stores/themeStore'
import {
  buildBackup,
  applyBackup,
  downloadBackup,
  readBackupFile,
  BACKUP_VERSION,
} from '../utils/progressBackup'

const emit = defineEmits(['show-onboarding'])

const progressStore = useProgressStore()
const projectStore = useProjectStore()
const themeStore = useThemeStore()

const importMsg = ref('')
const importError = ref(false)
const fileInput = ref(null)

function exportSave() {
  const backup = buildBackup(progressStore, projectStore)
  downloadBackup(backup)
  importMsg.value = '存档已下载到本地'
  importError.value = false
}

async function onFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  importMsg.value = ''
  try {
    const data = await readBackupFile(file)
    if (!window.confirm('导入将覆盖当前进度、项目档案与沉浸状态。确定继续？')) {
      return
    }
    const result = applyBackup(data, progressStore, projectStore, themeStore)
    if (result.ok) {
      importMsg.value = result.message
      importError.value = false
    } else {
      importMsg.value = result.message
      importError.value = true
    }
  } catch (err) {
    importMsg.value = err.message || '导入失败'
    importError.value = true
  }
}

function triggerImport() {
  fileInput.value?.click()
}
</script>

<template>
  <section class="save-panel">
    <h2 class="save-panel__title">存档管理</h2>
    <p class="save-panel__desc">
      进度保存在浏览器本地。换设备或清缓存前请先导出；支持 JSON 存档导入恢复。 当前存档格式 v{{
        BACKUP_VERSION
      }}
      · 含上机分步进度。
    </p>
    <div class="save-panel__actions">
      <button type="button" class="level-map__btn level-map__btn--primary" @click="exportSave">
        导出存档
      </button>
      <button type="button" class="level-map__btn level-map__btn--ghost" @click="triggerImport">
        导入存档
      </button>
      <button
        type="button"
        class="level-map__btn level-map__btn--ghost"
        @click="emit('show-onboarding')"
      >
        再看引导
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="save-panel__file-input"
        @change="onFileChange"
      />
    </div>
    <p v-if="importMsg" class="save-panel__msg" :class="{ 'save-panel__msg--error': importError }">
      {{ importMsg }}
    </p>
  </section>
</template>
