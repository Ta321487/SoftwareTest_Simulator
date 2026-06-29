<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProgressStore } from '../stores/progressStore'
import { DAILY_LEVEL_ID } from '../data/dailyChallenges'

defineProps({
  current: {
    type: String,
    default: 'home',
  },
})

const router = useRouter()
const route = useRoute()
const progressStore = useProgressStore()

const mainLevelId = computed(() => progressStore.firstAvailableLevelId)
const dailyStatus = computed(() => progressStore.getDailyStatus())
const dailyOpen = computed(() => dailyStatus.value !== 'locked')
const dailyDone = computed(() => dailyStatus.value === 'completed')

function goHome() {
  if (route.path !== '/') router.push('/')
}

function goMain() {
  if (mainLevelId.value) router.push('/level/' + mainLevelId.value)
}

function goDaily() {
  router.push('/level/' + DAILY_LEVEL_ID)
}

function goHandbook() {
  router.push('/handbook')
}

function goHomeSection(id) {
  if (route.path !== '/') {
    router.push({ path: '/', hash: '#' + id })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <aside class="workbench__dock app-nav">
    <p class="workbench__dock-label">工作台</p>

    <button
      type="button"
      class="workbench__dock-item"
      :class="{ 'workbench__dock-item--active': current === 'home' }"
      :disabled="current === 'home'"
      @click="goHome"
    >
      <span class="workbench__dock-text">任务台</span>
    </button>

    <button v-if="mainLevelId" type="button" class="workbench__dock-item" @click="goMain">
      <span class="workbench__dock-text">进行中</span>
      <span class="app-nav__sub">#{{ mainLevelId }}</span>
    </button>

    <button
      v-if="dailyOpen"
      type="button"
      class="workbench__dock-item"
      :class="{ 'app-nav__done': dailyDone }"
      @click="goDaily"
    >
      <span class="workbench__dock-text">每日一题</span>
      <span v-if="dailyDone" class="app-nav__tag">完</span>
    </button>

    <button
      type="button"
      class="workbench__dock-item"
      :class="{ 'workbench__dock-item--active': current === 'handbook' }"
      :disabled="current === 'handbook'"
      @click="goHandbook"
    >
      <span class="workbench__dock-text">概念速查</span>
    </button>

    <p class="app-nav__group">档案</p>

    <button type="button" class="workbench__dock-item" @click="goHomeSection('home-progress')">
      <span class="workbench__dock-text">我的进度</span>
    </button>

    <button type="button" class="workbench__dock-item" @click="goHomeSection('home-side')">
      <span class="workbench__dock-text">番外池</span>
    </button>

    <button type="button" class="workbench__dock-item" @click="goHomeSection('home-phases')">
      <span class="workbench__dock-text">关卡图</span>
    </button>

    <button type="button" class="workbench__dock-item" @click="goHomeSection('home-achievements')">
      <span class="workbench__dock-text">成就墙</span>
    </button>
  </aside>
</template>
