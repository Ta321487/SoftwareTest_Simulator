<script setup>
import { computed, ref } from 'vue'
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
    default: '输入回复，@同事 推动排查…',
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

const composePreview = computed(() => {
  if (!props.chatPreviewConfig) {
    return { hasPreview: false, tier: null, tips: [], tierLabel: '', keywordProgress: '' }
  }
  return getChatComposePreview(props.chatPreviewConfig, message.value)
})

function handleSubmit() {
  const text = message.value.trim()
  if (!text || sent.value) return

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

function markSuccess(reply) {
  sent.value = true
  if (reply) {
    thread.value.push({
      sender: '李工',
      avatar: '👨‍💻',
      role: 'other',
      text: reply,
      time: '刚刚',
    })
  }
}

function markError() {
  const last = thread.value[thread.value.length - 1]
  if (last?.role === 'self') {
    thread.value.pop()
  }
}

function reset() {
  message.value = ''
  sent.value = false
  initThread()
}

defineExpose({ markSuccess, markError, reset })
</script>

<template>
  <div class="sim-card chat-box">
    <header class="chat-box__header">
      <span>{{ chatGroup }}</span>
      <span class="chat-box__online">3 人在线</span>
    </header>

    <div class="chat-box__messages">
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
    </div>

    <div v-if="!sent" class="chat-box__compose">
      <textarea
        v-model="message"
        class="chat-box__input"
        rows="3"
        :placeholder="placeholder"
      />
      <div
        v-if="composePreview.hasPreview"
        class="chat-box__preview"
        :class="composePreview.tier ? `chat-box__preview--${composePreview.tier}` : ''"
      >
        <p class="chat-box__preview-title">
          发送前预览 · {{ composePreview.tierLabel }}
          <span v-if="chatPreviewConfig?.chatKeywords?.length" class="chat-box__preview-kw">
            关键词 {{ composePreview.keywordProgress }}
          </span>
        </p>
        <ul v-if="composePreview.tips.length" class="chat-box__preview-tips">
          <li v-for="(tip, idx) in composePreview.tips" :key="idx">{{ tip }}</li>
        </ul>
        <p v-else class="chat-box__preview-ok">结构完整，可以发送。</p>
      </div>
      <p v-if="composeHint" class="chat-box__hint">{{ composeHint }}</p>
      <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">发送</button>
    </div>
    <p v-else class="chat-box__done">✓ 消息已发送，对方已回应</p>
  </div>
</template>
