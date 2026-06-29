<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppNav } from '../composables/useAppNav'

const route = useRoute()
const { goHomeSection } = useAppNav()

const items = [
  { id: 'home-career', label: '剧本', tab: 'career' },
  { id: 'home-progress', label: '档案', tab: 'profile' },
  { id: 'home-side', label: '番外', tab: 'side' },
  { id: 'home-phases', label: '关卡图', tab: 'map' },
  { id: 'home-achievements', label: '成就', tab: 'achievements' },
]

const activeId = computed(() => {
  if (route.path !== '/') return ''
  const hash = route.hash || ''
  if (hash) return hash.replace(/^#/, '')
  return ''
})
</script>

<template>
  <div class="app-nav-archive">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="workbench__dock-item app-nav-archive__item"
      :class="{ 'workbench__dock-item--active': activeId === item.id }"
      @click="goHomeSection(item.id)"
    >
      <span class="workbench__dock-text">{{ item.label }}</span>
    </button>
  </div>
</template>
