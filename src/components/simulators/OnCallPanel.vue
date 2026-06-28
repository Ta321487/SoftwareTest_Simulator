<script setup>
import { ref } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'prod-login',
    validator: (v) => ['prod-login', 'log-preview', 'release-board', 'month-wrap'].includes(v),
  },
  logLines: {
    type: Array,
    default: () => [],
  },
  initialProdSlow: {
    type: Boolean,
    default: false,
  },
  initialLogReviewed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['prod-slow-reproduced', 'log-reviewed'])

const loggingIn = ref(false)
const loginElapsed = ref(null)
const prodSlow = ref(props.initialProdSlow)
const logReviewed = ref(props.initialLogReviewed)

async function handleProdLogin() {
  if (loggingIn.value || prodSlow.value) return
  loggingIn.value = true
  loginElapsed.value = 0

  await new Promise((r) => setTimeout(r, 2200))
  loggingIn.value = false
  loginElapsed.value = 8.2
  prodSlow.value = true
  emit('prod-slow-reproduced', { elapsedMs: 8200, network: '4G' })
}

function markLogReviewed() {
  if (logReviewed.value) return
  logReviewed.value = true
  emit('log-reviewed')
}

function isErrorLine(line) {
  return String(line).includes('ERROR')
}
</script>

<template>
  <div class="oncall-panel sim-card">
    <header class="oncall-panel__header">
      <div>
        <p class="oncall-panel__brand">线上值班 · {{ mode === 'prod-login' ? '生产复现' : mode === 'log-preview' ? '日志摘要' : mode === 'release-board' ? '发布看板' : '满月回顾' }}</p>
        <p class="oncall-panel__version">onboard-week2 · 入职第 2 周</p>
      </div>
      <span class="oncall-panel__env oncall-panel__env--prod">生产</span>
    </header>

    <!-- 生产登录慢 -->
    <div v-if="mode === 'prod-login'" class="oncall-panel__login">
      <p class="oncall-panel__network">📶 网络：<strong>4G</strong> · 用户投诉登录约 8 秒</p>
      <div class="oncall-panel__device">
        <p class="oncall-panel__title">App 登录 · 生产</p>
        <button
          type="button"
          class="oncall-panel__login-btn"
          :disabled="loggingIn || prodSlow"
          @click="handleProdLogin"
        >
          {{ loggingIn ? '登录中…' : '登录' }}
        </button>
        <p v-if="loggingIn" class="oncall-panel__wait">转圈中，请等待…</p>
        <p v-else-if="loginElapsed" class="oncall-panel__elapsed">
          本次登录耗时 <strong>{{ loginElapsed }}s</strong>
        </p>
      </div>
      <p class="oncall-panel__guide">复现线上慢登录后再写 TEST-1022：步骤含 4G、预期 3 秒内、实际约 8 秒。</p>
      <p v-if="prodSlow" class="oncall-panel__status oncall-panel__status--warn">
        ✓ 已复现：4G 下登录约 8 秒 —— 可以写 Jira 了
      </p>
    </div>

    <!-- 日志摘要 -->
    <div v-else-if="mode === 'log-preview'" class="oncall-panel__logs">
      <p class="oncall-panel__log-path">/var/log/app/error.log · 最近条目</p>
      <pre class="oncall-panel__log-body"><code
        v-for="(line, i) in logLines"
        :key="i"
        class="oncall-panel__log-line"
        :class="{ 'oncall-panel__log-line--error': isErrorLine(line) }"
      >{{ line }}
</code></pre>
      <button type="button" class="sim-btn sim-btn--ghost sim-btn--sm" @click="markLogReviewed">
        {{ logReviewed ? '✓ 已阅摘要' : '标记已阅摘要' }}
      </button>
      <p class="oncall-panel__guide">下方终端执行 grep ERROR，与摘要中带 ERROR 的行对照。</p>
      <p v-if="logReviewed" class="oncall-panel__status oncall-panel__status--ok">
        ✓ 已浏览日志摘要 —— 可以 grep 了
      </p>
    </div>

    <!-- 发布看板 -->
    <div v-else-if="mode === 'release-board'" class="oncall-panel__board">
      <div class="oncall-panel__board-grid">
        <div class="oncall-panel__board-item oncall-panel__board-item--error">
          <p class="oncall-panel__board-label">距上线</p>
          <p class="oncall-panel__board-value">2 天</p>
        </div>
        <div class="oncall-panel__board-item oncall-panel__board-item--error">
          <p class="oncall-panel__board-label">支付 Bug</p>
          <p class="oncall-panel__board-value">未关闭</p>
        </div>
        <div class="oncall-panel__board-item oncall-panel__board-item--warn">
          <p class="oncall-panel__board-label">TEST-1022</p>
          <p class="oncall-panel__board-value">排查中</p>
        </div>
      </div>
      <p class="oncall-panel__guide">升级 PM 时写清：什么阻塞、对上线影响、需要谁协调。</p>
    </div>

    <!-- 满月回顾 -->
    <div v-else class="oncall-panel__month">
      <ul class="oncall-panel__milestones">
        <li>登录 / 支付 / 订单 三大项目剧本</li>
        <li>线上 Bug 单 · grep 排障 · PM 升级</li>
        <li>总结写：成果 + 踩坑 + 下月计划</li>
      </ul>
      <p class="oncall-panel__guide">满月总结不用长，说重点——组长 30 秒能看懂即可。</p>
    </div>
  </div>
</template>
