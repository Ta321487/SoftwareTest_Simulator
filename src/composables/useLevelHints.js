import { ref } from 'vue'
import { getLevelHintPool, pickNextLevelHint } from '../utils/failureHints'
import { isDailyQuestId } from '../utils/levelRegistry'

/** 关卡内提示状态与展示 */
export function useLevelHints(progressStore) {
  const showHint = ref(false)
  const hintText = ref('')
  const sessionHintUsed = ref(false)
  const hintPoolSize = ref(0)

  function resetHints() {
    showHint.value = false
    hintText.value = ''
    sessionHintUsed.value = false
    hintPoolSize.value = 0
  }

  function revealHint(level) {
    if (!level) return
    const pool = getLevelHintPool(level)
    if (!pool.length) return

    hintPoolSize.value = pool.length

    const next =
      sessionHintUsed.value && hintText.value ? pickNextLevelHint(pool, hintText.value) : pool[0]

    if (!sessionHintUsed.value) {
      sessionHintUsed.value = true
      if (!isDailyQuestId(level.id)) {
        progressStore.useHint(level.id)
      }
    }

    hintText.value = next
    showHint.value = true
  }

  return {
    showHint,
    hintText,
    sessionHintUsed,
    hintPoolSize,
    resetHints,
    revealHint,
  }
}
