<script setup>
import { useAppNav } from '../composables/useAppNav'

const { goHomeSection } = useAppNav()

const items = [
  { id: 'home-career', label: '职场剧本' },
  { id: 'home-progress', label: '我的进度' },
  { id: 'home-side', label: '番外池' },
  { id: 'home-phases', label: '关卡图' },
  { id: 'home-achievements', label: '成就墙' },
]
</script>

<template>
  <div class="app-nav-archive">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="workbench__dock-item app-nav-archive__item"
      @click="goHomeSection(item.id)"
    >
      <span class="workbench__dock-text">{{ item.label }}</span>
    </button>
  </div>
</template>
