<script setup>
import { storageWarning, clearStorageWarning } from '../utils/storageWarning'
</script>

<template>
  <Teleport to="body">
    <div v-if="storageWarning" class="storage-warning" role="alert" aria-live="assertive">
      <p class="storage-warning__text">{{ storageWarning }}</p>
      <button type="button" class="storage-warning__close" @click="clearStorageWarning">
        知道了
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.storage-warning {
  position: fixed;
  bottom: max(16px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(520px, calc(100vw - 32px));
  padding: 12px 16px;
  border-radius: 12px;
  background: #7f1d1d;
  color: #fef2f2;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  font-size: 0.88rem;
  line-height: 1.5;
}

.storage-warning__text {
  margin: 0;
  flex: 1;
}

.storage-warning__close {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.82rem;
}

.storage-warning__close:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
