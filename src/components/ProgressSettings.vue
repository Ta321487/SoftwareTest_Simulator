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
} from '../utils/progressBackup'
import { markExported } from '../utils/bootstrapRestore'
import { trackBackupExport, trackBackupImport } from '../utils/analytics'

const emit = defineEmits(['show-onboarding'])

defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const progressStore = useProgressStore()
const projectStore = useProjectStore()
const themeStore = useThemeStore()

const importMsg = ref('')
const importError = ref(false)
const fileInput = ref(null)

function exportSave() {
  const backup = buildBackup(progressStore, projectStore)
  downloadBackup(backup)
  markExported()
  trackBackupExport()
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
    if (!window.confirm('导入会覆盖当前所有进度和项目记录，确定继续吗？')) {
      return
    }
    const result = applyBackup(data, progressStore, projectStore, themeStore)
    if (result.ok) {
      importMsg.value = result.message
      importError.value = false
      trackBackupImport()
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
  <section class="save-panel" :class="{ 'save-panel--embedded': embedded }">
    <h2 class="save-panel__title">存档管理</h2>
    <p class="save-panel__desc">
      进度保存在浏览器本地。换设备或清缓存前请先导出；支持 JSON 存档导入恢复。存档包含关卡进度和 App 实操记录。
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
