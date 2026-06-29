<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppNav } from '../composables/useAppNav'

const props = defineProps({
  current: {
    type: String,
    default: 'home',
  },
  activeLevelId: {
    type: Number,
    default: null,
  },
  /** 关卡页有本项目 Dock 时，不在全局区重复高亮「进行中」 */
  highlightMainTask: {
    type: Boolean,
    default: true,
  },
})

const { mainLevelId, dailyOpen, dailyDone, goHome, goMain, goDaily, goHandbook } = useAppNav()
const route = useRoute()

const mainTaskActive = computed(
  () =>
    props.highlightMainTask &&
    props.current === 'level' &&
    props.activeLevelId != null &&
    props.activeLevelId === mainLevelId.value
)
</script>

<template>
  <nav class="app-nav-global" aria-label="主导航">
    <button
      type="button"
      class="workbench__dock-item app-tab"
      :class="{ 'workbench__dock-item--active': current === 'home' && !route.hash }"
      :disabled="current === 'home' && !route.hash"
      @click="goHome"
    >
      <span class="app-tab__icon-wrap">
        <span class="app-tab__icon" aria-hidden="true">🏠</span>
      </span>
      <span class="workbench__dock-text app-tab__label">任务台</span>
    </button>

    <button
      v-if="mainLevelId"
      type="button"
      class="workbench__dock-item app-tab"
      :class="{ 'workbench__dock-item--active': mainTaskActive }"
      @click="goMain"
    >
      <span class="app-tab__icon-wrap">
        <span class="app-tab__icon" aria-hidden="true">▶️</span>
        <span class="app-tab__badge">#{{ mainLevelId }}</span>
      </span>
      <span class="workbench__dock-text app-tab__label">关卡</span>
    </button>

    <button
      v-if="dailyOpen"
      type="button"
      class="workbench__dock-item app-tab"
      :class="{ 'app-tab--done': dailyDone }"
      @click="goDaily"
    >
      <span class="app-tab__icon-wrap">
        <span class="app-tab__icon" aria-hidden="true">📅</span>
        <span v-if="dailyDone" class="app-tab__badge app-tab__badge--done">✓</span>
      </span>
      <span class="workbench__dock-text app-tab__label">每日</span>
    </button>

    <button
      type="button"
      class="workbench__dock-item app-tab"
      :class="{ 'workbench__dock-item--active': current === 'handbook' }"
      :disabled="current === 'handbook'"
      @click="goHandbook"
    >
      <span class="app-tab__icon-wrap">
        <span class="app-tab__icon" aria-hidden="true">📖</span>
      </span>
      <span class="workbench__dock-text app-tab__label">手札</span>
    </button>
  </nav>
</template>
