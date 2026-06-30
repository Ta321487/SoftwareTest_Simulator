<script setup>
import { useRoute } from 'vue-router'
import { useAppNav } from '../composables/useAppNav'
import { isNavDisabled, resolveNavActive } from '../data/appNavigation'

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

const route = useRoute()
const { mainLevelId, navItems, navCount, activateNavItem } = useAppNav()

function navContext() {
  return {
    route,
    current: props.current,
    activeLevelId: props.activeLevelId,
    highlightMainTask: props.highlightMainTask,
    mainLevelId: mainLevelId.value,
  }
}

function itemActive(item) {
  return resolveNavActive(item, navContext())
}

function itemDisabled(item) {
  return isNavDisabled(item, itemActive(item))
}

function itemTitle(item) {
  if (item.kind === 'home') return '当前任务与章节关卡'
  if (item.kind === 'main') return '打开当前关卡工作台'
  return item.label
}
</script>

<template>
  <nav class="app-nav-global" aria-label="主导航">
    <button
      v-for="item in navItems"
      :key="item.id"
      type="button"
      class="workbench__dock-item app-tab"
      :class="{
        'workbench__dock-item--active': itemActive(item),
        'app-tab--level': item.kind === 'main',
      }"
      :disabled="itemDisabled(item) || undefined"
      :title="itemTitle(item)"
      @click="activateNavItem(item)"
    >
      <span class="app-tab__icon-wrap">
        <span class="app-tab__icon" aria-hidden="true">{{ item.icon }}</span>
        <span v-if="item.kind === 'main' && mainLevelId" class="app-tab__badge"
          >#{{ mainLevelId }}</span
        >
        <span v-else-if="navCount(item)" class="app-tab__badge app-tab__badge--count">{{
          navCount(item)
        }}</span>
      </span>
      <span class="workbench__dock-text app-tab__label">
        {{ item.label }}
        <span v-if="navCount(item)" class="app-nav__count app-nav__count--desktop">{{
          navCount(item)
        }}</span>
      </span>
    </button>
  </nav>
</template>
