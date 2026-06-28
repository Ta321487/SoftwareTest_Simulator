<script setup>
import { onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  build: {
    type: String,
    default: 'buggy',
    validator: (v) => ['buggy', 'fixed'].includes(v),
  },
  compact: {
    type: Boolean,
    default: false,
  },
  initialReproduced: {
    type: Boolean,
    default: false,
  },
  initialFixVerified: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['bug-reproduced', 'fix-verified', 'sms-requested'])

const phone = ref('13800138000')
const password = ref('')
const countdown = ref(null)
const smsRequested = ref(false)
const reproduced = ref(props.initialReproduced)
const fixVerified = ref(props.initialFixVerified)

let tickTimer = null

function clearTick() {
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}

function startFixedCountdown() {
  clearTick()
  countdown.value = 60
  tickTimer = setInterval(() => {
    if (countdown.value === null || countdown.value <= 0) {
      clearTick()
      return
    }
    countdown.value -= 1
  }, 1000)
}

function requestSms() {
  smsRequested.value = true
  clearTick()
  emit('sms-requested')

  if (props.build === 'buggy') {
    countdown.value = -1
    if (!reproduced.value) {
      reproduced.value = true
      emit('bug-reproduced', { countdown: -1 })
    }
    return
  }

  startFixedCountdown()
  if (!fixVerified.value) {
    fixVerified.value = true
    emit('fix-verified', { countdown: 60 })
  }
}

watch(
  () => props.build,
  () => {
    countdown.value = null
    smsRequested.value = false
    clearTick()
  }
)

onUnmounted(clearTick)
</script>

<template>
  <div class="login-app-mock sim-card" :class="{ 'login-app-mock--compact': compact }">
    <header class="login-app-mock__header">
      <div>
        <p class="login-app-mock__brand">登录模块 · App</p>
        <p class="login-app-mock__version">
          {{ build === 'fixed' ? 'v2.3.1 · 灰度' : 'v2.3.0 · 测试包' }}
        </p>
      </div>
      <span class="login-app-mock__env">测试环境</span>
    </header>

    <div class="login-app-mock__device">
      <div class="login-app-mock__screen">
        <p class="login-app-mock__title">欢迎登录</p>
        <label class="login-app-mock__field">
          <span>手机号</span>
          <input v-model="phone" type="tel" class="login-app-mock__input" placeholder="11 位手机号" />
        </label>
        <label class="login-app-mock__field">
          <span>密码</span>
          <input
            v-model="password"
            type="password"
            class="login-app-mock__input"
            placeholder="6–12 位字母数字"
          />
        </label>
        <div class="login-app-mock__sms-row">
          <button type="button" class="login-app-mock__sms-btn" @click="requestSms">
            {{ smsRequested && build === 'fixed' ? '重新获取' : '获取验证码' }}
          </button>
          <span
            v-if="countdown !== null"
            class="login-app-mock__countdown"
            :class="{ 'login-app-mock__countdown--bug': countdown < 0 }"
          >
            {{ countdown }} 秒
          </span>
          <span v-else class="login-app-mock__countdown login-app-mock__countdown--idle">未请求</span>
        </div>
        <button type="button" class="login-app-mock__submit" disabled>登录</button>
      </div>
    </div>

    <p v-if="build === 'buggy'" class="login-app-mock__guide">
      执行用例：点击「获取验证码」，观察倒计时是否异常。
    </p>
    <p v-else class="login-app-mock__guide">
      回归验证：修复后倒计时应从 60 递减，不应出现负数。
    </p>

    <p v-if="reproduced && build === 'buggy'" class="login-app-mock__status login-app-mock__status--bug">
      ✓ 已复现 Bug：倒计时显示 -1 秒 —— 可以写 Jira 了
    </p>
    <p v-if="fixVerified && build === 'fixed'" class="login-app-mock__status login-app-mock__status--ok">
      ✓ 修复验证：倒计时正常 —— 可对照报告勾选回归项
    </p>
  </div>
</template>
