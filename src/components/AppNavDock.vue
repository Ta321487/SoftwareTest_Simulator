<script setup>
import AppSidebar from './AppSidebar.vue'

defineProps({
  current: {
    type: String,
    default: 'home',
  },
  activeLevelId: {
    type: Number,
    default: null,
  },
})
</script>

<template>
  <AppSidebar :current="current" :active-level-id="activeLevelId" />
</template>
