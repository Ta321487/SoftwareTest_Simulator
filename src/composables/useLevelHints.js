import { ref } from 'vue'
import { getLevelHint } from '../utils/failureHints'

/** 关卡内提示状态与展示 */
export function useLevelHints(progressStore) {
  const showHint = ref(false)
  const hintText = ref('')
  const sessionHintUsed = ref(false)

  function resetHints() {
    showHint.value = false
    hintText.value = ''
    sessionHintUsed.value = false
  }

  function revealHint(level) {
    if (!level) return
    const text = getLevelHint(level)
    if (!text) return
    sessionHintUsed.value = true
    progressStore.useHint(level.id)
    hintText.value = text
    showHint.value = true
  }

  return {
    showHint,
    hintText,
    sessionHintUsed,
    resetHints,
    revealHint,
  }
}
