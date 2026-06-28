<script setup>
import { ref, computed } from 'vue'
import { getItem, setItem } from '../utils/storage'

const STORAGE_KEY = 'onboarding_v1'

const emit = defineEmits(['close'])

const visible = ref(!getItem(STORAGE_KEY, false))
const step = ref(0)

const steps = [
  {
    icon: '🎮',
    title: '欢迎来到测试人一生',
    body: '这是一款软件测试职场模拟闯关游戏。从备考、面试、笔试到入职，在 Jira、终端、企微等工具里完成真实测试任务，攒 XP 升职级。',
  },
  {
    icon: '🗺️',
    title: '主线四阶段',
    body: '首页按「备考 → 面试 → 笔试 → 入职」排列 27 关主线。点「继续挑战」接着玩，或点任意已解锁关卡重玩冲三星。',
  },
  {
    icon: '💻',
    title: '关卡工作台',
    body: '进入关卡后，左侧 Dock 切换当日工具（用例库、Jira、终端…）。部分项目还有被测 App、APM 监控等可选沉浸体验——做完更像真上班。',
  },
  {
    icon: '🎬',
    title: '番外 & 每日特训',
    body: '完成主线里程碑解锁番外（安全、性能、流水线等）。通关登录模块第 5 关后开启每日一题，连续打卡有成就。',
  },
  {
    icon: '💾',
    title: '记得备份存档',
    body: '进度保存在浏览器本地。换设备或清缓存前，请在首页「导出存档」备份；通关后可到「测试手札」复习要点。',
  },
]

const current = computed(() => steps[step.value])
const isLast = computed(() => step.value >= steps.length - 1)

function finish() {
  setItem(STORAGE_KEY, true)
  visible.value = false
  emit('close')
}

function next() {
  if (isLast.value) {
    finish()
    return
  }
  step.value += 1
}

function skip() {
  finish()
}

/** 供首页「再看引导」调用 */
function reopen() {
  step.value = 0
  visible.value = true
}

defineExpose({ reopen })
</script>

<template>
  <div v-if="visible" class="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
    <div class="onboarding__backdrop" @click="skip" />
    <article class="onboarding__panel">
      <header class="onboarding__header">
        <span class="onboarding__step">{{ step + 1 }} / {{ steps.length }}</span>
        <button type="button" class="onboarding__skip" @click="skip">跳过</button>
      </header>

      <div class="onboarding__body">
        <span class="onboarding__icon" aria-hidden="true">{{ current.icon }}</span>
        <h2 id="onboarding-title" class="onboarding__title">{{ current.title }}</h2>
        <p class="onboarding__text">{{ current.body }}</p>
      </div>

      <div class="onboarding__dots" aria-hidden="true">
        <span
          v-for="(_, i) in steps"
          :key="i"
          class="onboarding__dot"
          :class="{ 'onboarding__dot--active': i === step }"
        />
      </div>

      <footer class="onboarding__footer">
        <button
          v-if="step > 0"
          type="button"
          class="sim-btn sim-btn--ghost"
          @click="step -= 1"
        >
          上一步
        </button>
        <button type="button" class="sim-btn sim-btn--primary" @click="next">
          {{ isLast ? '开始闯关 →' : '下一步' }}
        </button>
      </footer>
    </article>
  </div>
</template>
