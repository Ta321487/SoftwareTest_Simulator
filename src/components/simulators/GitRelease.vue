<script setup>
import { ref } from 'vue'

defineProps({
  gitTitle: { type: String, default: '选择发布 / Hotfix 分支' },
  gitOptions: { type: Array, required: true },
  gitCommits: { type: Array, default: null },
  correctClick: { type: String, default: '' },
  gitMode: { type: String, default: 'branch' },
})

const emit = defineEmits(['submit'])

const selected = ref(null)

function select(id) {
  selected.value = selected.value === id ? null : id
}

function handleSubmit() {
  emit('submit', { selected: selected.value })
}

function reset() {
  selected.value = null
}

defineExpose({ reset })
</script>

<template>
  <div class="sim-card git-release">
    <header class="git-release__header">
      <span>⎇ GitLab · {{ gitMode === 'branch' ? 'Branches' : 'Commits' }}</span>
      <span class="git-release__env">payment-service</span>
    </header>

    <p class="git-release__title">{{ gitTitle }}</p>

    <div v-if="gitMode === 'branch'" class="git-release__list">
      <button
        v-for="opt in gitOptions"
        :key="opt.id"
        type="button"
        class="git-release__item"
        :class="{ 'git-release__item--active': selected === opt.id }"
        @click="select(opt.id)"
      >
        <span class="git-release__icon">⎇</span>
        <span class="git-release__label">{{ opt.label }}</span>
        <span v-if="opt.meta" class="git-release__meta">{{ opt.meta }}</span>
      </button>
    </div>

    <div v-else class="git-release__list">
      <button
        v-for="commit in gitCommits"
        :key="commit.id"
        type="button"
        class="git-release__item git-release__item--commit"
        :class="{ 'git-release__item--active': selected === commit.id }"
        @click="select(commit.id)"
      >
        <code class="git-release__sha">{{ commit.sha }}</code>
        <span class="git-release__msg">{{ commit.message }}</span>
        <span class="git-release__meta">{{ commit.author }} · {{ commit.time }}</span>
      </button>
    </div>

    <button type="button" class="sim-btn sim-btn--primary" @click="handleSubmit">✓ 确认选择</button>
  </div>
</template>

<style scoped>
.git-release__header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}
.git-release__env {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.git-release__title {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}
.git-release__list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}
.git-release__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
  text-align: left;
  font-size: 0.8125rem;
  flex-wrap: wrap;
}
.git-release__item--commit {
  flex-direction: column;
  align-items: flex-start;
}
.git-release__item--active {
  border-color: var(--accent);
  background: var(--surface-2);
}
.git-release__icon {
  color: var(--accent);
}
.git-release__meta {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
}
.git-release__item--commit .git-release__meta {
  margin-left: 0;
}
.git-release__sha {
  font-size: 0.75rem;
  color: var(--terminal-text);
}
.git-release__msg {
  font-weight: 500;
}
</style>
