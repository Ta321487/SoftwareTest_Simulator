<script setup>
import { ref } from 'vue'

defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
})

const open = ref(false)

defineEmits(['close-all'])
</script>

<template>
  <div class="work-inbox">
    <button type="button" class="work-inbox__toggle" @click="open = !open">
      📬 消息
      <span v-if="messages.filter((m) => !m.read).length" class="work-inbox__dot">
        {{ messages.filter((m) => !m.read).length }}
      </span>
    </button>

    <div v-if="open" class="work-inbox__panel">
      <header class="work-inbox__header">
        <span>工作消息</span>
        <button type="button" class="work-inbox__close" @click="open = false">×</button>
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
  </div>
</template>
