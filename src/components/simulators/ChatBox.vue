<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { getChatComposePreview } from '../../utils/chatValidation'

const props = defineProps({
  chatHistory: {
    type: Array,
    default: () => [],
  },
  chatContext: {
    type: String,
    default: '',
  },
  chatGroup: {
    type: String,
    default: '项目协作群',
  },
  composeHint: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '输入回复，可以 @同事 请对方配合…',
  },
  chatPreviewConfig: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit'])

const message = ref('')
const thread = ref([])
const sent = ref(false)
const followUpRound = ref(false)
const lockedPriorText = ref('')
const activePlaceholder = ref('')
const activeHint = ref('')
const isRevealing = ref(false)
const typingPeer = ref(null)
const messagesEl = ref(null)
const revealTimers = []

function clearRevealTimers() {
  while (revealTimers.length) {
    clearTimeout(revealTimers.pop())
  }
  typingPeer.value = null
  isRevealing.value = false
}

function delay(ms) {
  return new Promise((resolve) => {
    revealTimers.push(setTimeout(resolve, ms))
  })
}

function typingDuration(text = '') {
  const len = String(text).length
  return Math.min(1600, Math.max(650, 420 + len * 16))
}

async function scrollToLatest() {
  await nextTick()
  const el = messagesEl.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(
  () => thread.value.length,
  () => {
    scrollToLatest()
  }
)

function initThread() {
  const history = [...props.chatHistory]
  if (!history.length && props.chatContext) {
    history.push({
      sender: '同事',
      avatar: '👨‍💻',
      role: 'other',
      text: props.chatContext,
      time: '刚刚',
    })
  }
  thread.value = history
}

initThread()

const composeText = computed(() => {
  const cur = message.value.trim()
  if (followUpRound.value && lockedPriorText.value) {
    return cur ? `${lockedPriorText.value} ${cur}` : lockedPriorText.value
  }
  return cur
})

const composePreview = computed(() => {
  if (!props.chatPreviewConfig) {
    return { hasPreview: false, tier: null, tips: [], tierLabel: '', keywordProgress: '' }
  }
  return getChatComposePreview(props.chatPreviewConfig, composeText.value)
})

const inputPlaceholder = computed(() => activePlaceholder.value || props.placeholder)
const composeHintText = computed(() => activeHint.value || props.composeHint)

function handleSubmit() {
  const text = message.value.trim()
  if (!text || sent.value || isRevealing.value) return

  thread.value.push({
    sender: '我',
    avatar: '🧑‍💻',
    role: 'self',
    text,
    time: '刚刚',
  })
  message.value = ''
  emit('submit', { message: text })
}

function pushOtherMessage(msg) {
  if (!msg?.text) return
  thread.value.push({
    sender: msg.sender || '对方',
    avatar: msg.avatar || '👨‍💻',
    role: 'other',
    text: msg.text,
    time: '刚刚',
  })
}

async function revealOtherMessages(messages = [], { onComplete, startDelay = 520 } = {}) {
  clearRevealTimers()
  const queue = messages.filter((m) => m?.text)
  if (!queue.length) {
    onComplete?.()
    return
  }

  isRevealing.value = true
  await delay(startDelay)

  for (let i = 0; i < queue.length; i++) {
    const msg = queue[i]
    typingPeer.value = { sender: msg.sender || '对方', avatar: msg.avatar || '👨‍💻' }
    await delay(typingDuration(msg.text))
    typingPeer.value = null
    pushOtherMessage(msg)
    if (i < queue.length - 1) await delay(480)
  }

  isRevealing.value = false
  onComplete?.()
}

function markSuccess(reply) {
  if (Array.isArray(reply?.messages) && reply.messages.length) {
    revealOtherMessages(reply.messages, {
      onComplete: () => {
        sent.value = true
      },
    })
    return
  }
  const payload = typeof reply === 'string' ? { text: reply } : reply || {}
  if (!payload.text) return
  revealOtherMessages([{ sender: payload.sender, avatar: payload.avatar, text: payload.text }], {
    onComplete: () => {
      sent.value = true
    },
    startDelay: 420,
  })
}

function markFollowUp(payload) {
  const lastSelf = [...thread.value].reverse().find((m) => m.role === 'self')
  lockedPriorText.value = lastSelf?.text || ''
  activePlaceholder.value = payload.placeholder || ''
  activeHint.value = payload.hint || ''

  const messages =
    Array.isArray(payload.messages) && payload.messages.length
      ? payload.messages
      : payload.text
        ? [{ sender: payload.sender, avatar: payload.avatar, text: payload.text }]
        : []

  revealOtherMessages(messages, {
    onComplete: () => {
      followUpRound.value = true
    },
  })
}

function markError() {
  clearRevealTimers()
  const last = thread.value[thread.value.length - 1]
  if (last?.role === 'self') {
    thread.value.pop()
  }
}

function reset() {
  clearRevealTimers()
  message.value = ''
  sent.value = false
  followUpRound.value = false
  lockedPriorText.value = ''
  activePlaceholder.value = ''
  activeHint.value = ''
  initThread()
}

defineExpose({ markSuccess, markError, markFollowUp, reset, followUpRound, lockedPriorText })

onBeforeUnmount(clearRevealTimers)
</script>

<template>
  <div class="sim-card chat-box">
    <header class="chat-box__header">
      <span>{{ chatGroup }}</span>
      <span class="chat-box__online">3 人在线</span>
    </header>

    <div ref="messagesEl" class="chat-box__messages">
      <div
        v-for="(msg, index) in thread"
        :key="index"
        class="chat-box__row"
        :class="msg.role === 'self' ? 'chat-box__row--self' : 'chat-box__row--other'"
      >
        <span class="chat-box__avatar">{{ msg.avatar }}</span>
        <div class="chat-box__bubble-wrap">
          <span class="chat-box__sender">{{ msg.sender }} · {{ msg.time }}</span>
          <div class="chat-box__bubble">{{ msg.text }}</div>
        </div>
      </div>
      <div v-if="typingPeer" class="chat-box__row chat-box__row--other chat-box__row--typing">
        <span class="chat-box__avatar">{{ typingPeer.avatar }}</span>
        <div class="chat-box__bubble-wrap">
          <span class="chat-box__sender">{{ typingPeer.sender }} · 输入中…</span>
          <div class="chat-box__bubble chat-box__bubble--typing" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!sent" class="chat-box__compose">
      <textarea
        v-model="message"
        class="chat-box__input"
        rows="3"
        :placeholder="inputPlaceholder"
        :disabled="isRevealing"
      />
      <div
        v-if="composePreview.hasPreview"
        class="chat-box__preview"
        :class="composePreview.tier ? `chat-box__preview--${composePreview.tier}` : ''"
      >
        <p class="chat-box__preview-title">
          发送前检查 · {{ composePreview.tierLabel }}
          <span v-if="chatPreviewConfig?.chatKeywords?.length" class="chat-box__preview-kw">
            关键词 {{ composePreview.keywordProgress }}
          </span>
        </p>
        <ul v-if="composePreview.tips.length" class="chat-box__preview-tips">
          <li v-for="(tip, idx) in composePreview.tips" :key="idx">{{ tip }}</li>
        </ul>
        <p v-else class="chat-box__preview-ok">信息够了，可以发送。</p>
      </div>
      <p v-if="composeHintText && !isRevealing" class="chat-box__hint">{{ composeHintText }}</p>
      <button
        type="button"
        class="sim-btn sim-btn--primary"
        :disabled="isRevealing || !message.trim()"
        @click="handleSubmit"
      >
        {{ isRevealing ? '对方输入中…' : '发送' }}
      </button>
    </div>
    <p v-else class="chat-box__done">✓ 消息已发送，对方已回应</p>
  </div>
</template>
