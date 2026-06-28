<script setup>
import { ref } from 'vue'

const props = defineProps({
  scenario: {
    type: String,
    default: 'no-db',
    validator: (v) => ['no-db', 'callback-bug', 'pay-error', 'fixed'].includes(v),
  },
  compact: {
    type: Boolean,
    default: false,
  },
  initialCallbackMiss: {
    type: Boolean,
    default: false,
  },
  initialPayError: {
    type: Boolean,
    default: false,
  },
  initialPayVerified: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['callback-miss', 'pay-error-reproduced', 'pay-verified', 'pay-success', 'pay-attempt'])

const paying = ref(false)
const orderStatus = ref('待支付')
const lastPayResult = ref(null)
const callbackMiss = ref(props.initialCallbackMiss)
const payErrorReproduced = ref(props.initialPayError)
const payVerified = ref(props.initialPayVerified)

async function handlePay() {
  if (props.scenario === 'no-db' || paying.value) return

  paying.value = true
  lastPayResult.value = null
  emit('pay-attempt')
  await new Promise((r) => setTimeout(r, 900))
  paying.value = false

  if (props.scenario === 'pay-error') {
    orderStatus.value = '支付失败'
    lastPayResult.value = 'error'
    if (!payErrorReproduced.value) {
      payErrorReproduced.value = true
      emit('pay-error-reproduced', { message: '支付网关返回 500' })
    }
    return
  }

  orderStatus.value = '已支付'
  lastPayResult.value = 'success'
  emit('pay-success', { scenario: props.scenario })

  if (props.scenario === 'callback-bug') {
    if (!callbackMiss.value) {
      callbackMiss.value = true
      emit('callback-miss', { notification: false })
    }
    return
  }

  if (props.scenario === 'fixed' && !payVerified.value) {
    payVerified.value = true
    emit('pay-verified', { notification: true })
  }
}
</script>

<template>
  <div class="payment-app-mock sim-card" :class="{ 'payment-app-mock--compact': compact }">
    <header class="payment-app-mock__header">
      <div>
        <p class="payment-app-mock__brand">订单支付 · App</p>
        <p class="payment-app-mock__version">
          {{
            scenario === 'fixed'
              ? 'v2.3.1 · release/payment-2.3'
              : scenario === 'no-db'
                ? 'v2.3.0 · 沙箱未就绪'
                : 'v2.3.0 · 测试包'
          }}
        </p>
      </div>
      <span
        class="payment-app-mock__env"
        :class="{ 'payment-app-mock__env--warn': scenario === 'no-db' }"
      >
        {{ scenario === 'no-db' ? '沙箱离线' : '测试环境' }}
      </span>
    </header>

    <div class="payment-app-mock__device">
      <div class="payment-app-mock__screen">
        <p class="payment-app-mock__order-id">订单 #ORD-2026062801</p>
        <p class="payment-app-mock__amount">¥ 99.00</p>
        <p class="payment-app-mock__goods">测试商品 · 微信支付</p>

        <button
          type="button"
          class="payment-app-mock__pay-btn"
          :disabled="scenario === 'no-db' || paying"
          @click="handlePay"
        >
          {{ paying ? '支付中…' : scenario === 'no-db' ? '沙箱未连通' : '微信支付' }}
        </button>

        <p class="payment-app-mock__status-line">
          订单状态：<strong>{{ orderStatus }}</strong>
        </p>

        <div
          class="payment-app-mock__notify"
          :class="{
            'payment-app-mock__notify--miss':
              scenario === 'callback-bug' && lastPayResult === 'success',
            'payment-app-mock__notify--ok':
              scenario === 'fixed' && lastPayResult === 'success',
            'payment-app-mock__notify--error': lastPayResult === 'error',
          }"
        >
          <template v-if="scenario === 'no-db'">到账通知：— 需先连通沙箱</template>
          <template v-else-if="lastPayResult === 'error'">到账通知：× 支付失败，未发起回调</template>
          <template v-else-if="scenario === 'callback-bug' && lastPayResult === 'success'">
            到账通知：× 未收到（支付已成功）
          </template>
          <template v-else-if="scenario === 'fixed' && lastPayResult === 'success'">
            到账通知：✓ 已收到
          </template>
          <template v-else>到账通知：— 支付后可见</template>
        </div>
      </div>
    </div>

    <p v-if="scenario === 'no-db'" class="payment-app-mock__guide">
      沙箱数据库未连通。请先在配置中心改对 PAYMENT_DB_HOST 并测试连接。
    </p>
    <p v-else-if="scenario === 'callback-bug'" class="payment-app-mock__guide">
      执行用例：支付成功后，检查测试环境是否收到到账通知。
    </p>
    <p v-else-if="scenario === 'pay-error'" class="payment-app-mock__guide">
      复现 Bug：点击微信支付，观察报错现象后再写 Jira。
    </p>
    <p v-else class="payment-app-mock__guide">TEST-1008 已修复，支付与到账通知应均正常。</p>

    <p
      v-if="callbackMiss && scenario === 'callback-bug'"
      class="payment-app-mock__status payment-app-mock__status--warn"
    >
      ✓ 已复现：支付成功但未收到到账通知 —— 可写企微回复
    </p>
    <p
      v-if="payErrorReproduced && scenario === 'pay-error'"
      class="payment-app-mock__status payment-app-mock__status--bug"
    >
      ✓ 已复现：支付网关 500 —— 可以补全 Jira 了
    </p>
    <p v-if="payVerified && scenario === 'fixed'" class="payment-app-mock__status payment-app-mock__status--ok">
      ✓ 验证通过：支付与到账通知均正常
    </p>
  </div>
</template>
