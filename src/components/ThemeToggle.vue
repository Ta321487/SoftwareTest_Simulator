<script setup>
import { useThemeStore } from '../stores/themeStore'

const themeStore = useThemeStore()
</script>

<template>
  <button type="button" class="theme-toggle" :title="themeStore.label" @click="themeStore.toggle()">
    <span class="theme-toggle__icon">{{ themeStore.icon }}</span>
    <span class="theme-toggle__label">{{ themeStore.label }}</span>
  </button>
</template>
