<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMobileLayout } from '../../composables/useMobileLayout'

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
})

const open = ref(false)
const toggleRef = ref(null)
const panelStyle = ref({})
const { isMobile } = useMobileLayout()

const unreadCount = computed(() => props.messages.filter((m) => !m.read).length)

defineEmits(['close-all'])

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function updatePanelPos() {
  if (isMobile.value || !open.value || !toggleRef.value) {
    panelStyle.value = {}
    return
  }
  const rect = toggleRef.value.getBoundingClientRect()
  panelStyle.value = {
    top: `${rect.bottom + 8}px`,
    right: `${Math.max(12, window.innerWidth - rect.right)}px`,
  }
}

function onDocKeydown(e) {
  if (e.key === 'Escape' && open.value) close()
}

watch(open, async (visible) => {
  if (visible) {
    await nextTick()
    updatePanelPos()
    document.addEventListener('keydown', onDocKeydown)
  } else {
    document.removeEventListener('keydown', onDocKeydown)
  }
})

watch(isMobile, () => {
  if (open.value) nextTick(updatePanelPos)
})

onMounted(() => {
  window.addEventListener('resize', updatePanelPos)
  window.addEventListener('scroll', updatePanelPos, true)
})

onUnmounted(() => {
  window.removeEventListener('resize', updatePanelPos)
  window.removeEventListener('scroll', updatePanelPos, true)
  document.removeEventListener('keydown', onDocKeydown)
})
</script>

<template>
  <div class="work-inbox">
    <button
      ref="toggleRef"
      type="button"
      class="work-inbox__toggle"
      :class="{ 'work-inbox__toggle--unread': unreadCount }"
      :aria-expanded="open"
      aria-haspopup="dialog"
      :aria-label="unreadCount ? `${unreadCount} 条未读工作消息` : '工作消息'"
      @click="toggle"
    >
      <span class="work-inbox__toggle-icon" aria-hidden="true">📬</span>
      <span v-if="unreadCount" class="work-inbox__count">{{ unreadCount }}</span>
      <span class="work-inbox__toggle-label">{{
        unreadCount ? `${unreadCount} 未读` : '消息'
      }}</span>
    </button>

    <Teleport to="body">
      <div v-if="open" class="work-inbox__backdrop" aria-hidden="true" @click="close" />
      <div
        v-if="open"
        class="work-inbox__panel"
        :class="{ 'work-inbox__panel--anchored': !isMobile }"
        :style="isMobile ? undefined : panelStyle"
        role="dialog"
        aria-label="工作消息"
      >
        <header class="work-inbox__header">
          <span>工作消息</span>
          <button type="button" class="work-inbox__close" aria-label="关闭" @click="close">
            ×
          </button>
        </header>
        <ul class="work-inbox__list">
          <li
            v-for="msg in messages"
            :key="msg.id"
            class="work-inbox__item"
            :class="{ 'work-inbox__item--unread': !msg.read }"
          >
            <span class="work-inbox__avatar">{{ msg.avatar }}</span>
            <div class="work-inbox__body">
              <div class="work-inbox__meta">
                <strong>{{ msg.from }}</strong>
                <span>{{ msg.time }}</span>
              </div>
              <p>{{ msg.text }}</p>
            </div>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
