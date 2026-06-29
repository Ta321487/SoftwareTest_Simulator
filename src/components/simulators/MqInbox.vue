<script setup>
import { ref } from 'vue'

defineProps({
  inboxMode: { type: String, default: 'mq' },
  mqMessages: { type: Array, default: () => [] },
  smsMessages: { type: Array, default: () => [] },
  correctMessageId: { type: String, default: '' },
  correctCode: { type: String, default: '' },
  mqHint: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const selectedId = ref(null)
const code = ref('')

function selectMessage(id) {
  selectedId.value = selectedId.value === id ? null : id
}

function handleSubmitMq() {
  emit('submit', { selectedMessageId: selectedId.value })
}

function handleSubmitSms() {
  emit('submit', { code: code.value.trim() })
}

function reset() {
  selectedId.value = null
  code.value = ''
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card mq-inbox">
    <header class="mq-inbox__header">
      <span>{{ inboxMode === 'mq' ? '📨 RabbitMQ · pay-callback 队列' : '📱 短信网关 · 测试收件箱' }}</span>
      <span class="mq-inbox__env">staging</span>
    </header>

    <template v-if="inboxMode === 'mq'">
      <p class="mq-inbox__guide">支付成功但订单未更新——在队列里找对应 orderId 的回调消息。</p>
      <button
        v-for="msg in mqMessages"
        :key="msg.id"
        type="button"
        class="mq-inbox__msg"
        :class="{ 'mq-inbox__msg--active': selectedId === msg.id }"
        @click="selectMessage(msg.id)"
      >
        <span class="mq-inbox__msg-head">
          <strong>{{ msg.routingKey }}</strong>
          <span>{{ msg.time }}</span>
        </span>
        <pre class="mq-inbox__payload">{{ msg.payload }}</pre>
      </button>
      <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmitMq">✓ 确认消息</button>
    </template>

    <template v-else>
      <p class="mq-inbox__guide">登录验证码 Bug 排查——从最新测试短信中读取 6 位验证码。</p>
      <ul class="mq-inbox__sms-list">
        <li v-for="sms in smsMessages" :key="sms.id" class="mq-inbox__sms">
          <span class="mq-inbox__sms-from">{{ sms.from }}</span>
          <span class="mq-inbox__sms-text">{{ sms.text }}</span>
          <span class="mq-inbox__sms-time">{{ sms.time }}</span>
        </li>
      </ul>
      <label class="sim-field__label">填写验证码</label>
      <input v-model="code" class="sim-field__input" type="text" maxlength="6" placeholder="6 位数字" />
      <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmitSms">✓ 提交验证码</button>
    </template>

    <p v-if="mqHint" class="mq-inbox__hint">{{ mqHint }}</p>
  </div>
</template>

<style scoped>
.mq-inbox__header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
.mq-inbox__env {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.mq-inbox__guide {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}
.mq-inbox__msg {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem;
  margin-bottom: 0.375rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
}
.mq-inbox__msg--active {
  border-color: var(--accent);
  background: var(--surface-2);
}
.mq-inbox__msg-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}
.mq-inbox__payload {
  font-size: 0.75rem;
  margin: 0;
  white-space: pre-wrap;
  color: var(--text-muted);
}
.mq-inbox__sms-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem;
}
.mq-inbox__sms {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.8125rem;
}
.mq-inbox__sms-from {
  display: block;
  font-weight: 600;
  font-size: 0.75rem;
}
.mq-inbox__sms-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  float: right;
}
.mq-inbox__hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.75rem;
}
</style>
