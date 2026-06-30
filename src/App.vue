<template>
  <router-view />
  <StorageWarningToast />
</template>

<script setup>
import StorageWarningToast from './components/StorageWarningToast.vue'
import { useMobileKeyboardScroll } from './composables/useMobileKeyboardScroll'

useMobileKeyboardScroll()
</script>
