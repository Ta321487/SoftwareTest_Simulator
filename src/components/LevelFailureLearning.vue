<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLearningPathForLevel } from '../utils/learningPath.js'

const props = defineProps({
  levelId: {
    type: Number,
    required: true,
  },
  completedLevelIds: {
    type: Array,
    default: () => [],
  },
})

const router = useRouter()

const path = computed(() => getLearningPathForLevel(props.levelId, props.completedLevelIds))

function openTerm(termId) {
  router.push({ path: '/handbook', query: { view: 'glossary', term: termId } })
}

function openPlaybook(playbookId) {
  router.push({ path: '/handbook', query: { view: 'playbooks', playbook: playbookId } })
}

function openNote(levelId) {
  router.push({ path: '/handbook', query: { note: levelId } })
}
</script>

<template>
  <div v-if="path" class="level-failure-learning">
    <p class="level-failure-learning__title">💡 建议下一步</p>
    <div v-if="path.terms.length" class="level-failure-learning__chips">
      <button
        v-for="term in path.terms"
        :key="term.id"
        type="button"
        class="level-failure-learning__chip"
        @click="openTerm(term.id)"
      >
        术语 · {{ term.term }}
      </button>
    </div>
    <div v-if="path.playbooks.length" class="level-failure-learning__chips">
      <button
        v-for="pb in path.playbooks"
        :key="pb.id"
        type="button"
        class="level-failure-learning__chip level-failure-learning__chip--playbook"
        @click="openPlaybook(pb.id)"
      >
        {{ pb.icon }} {{ pb.title }}
      </button>
    </div>
    <div class="level-failure-learning__actions">
      <button type="button" class="level-failure-learning__link" @click="openNote(path.levelId)">
        查看本关手札笔记 →
      </button>
      <router-link
        v-if="path.sideQuest"
        :to="`/level/${path.sideQuest.levelId}`"
        class="level-failure-learning__link level-failure-learning__link--side"
      >
        番外特训 · #{{ path.sideQuest.levelId }} {{ path.sideQuest.title }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.level-failure-learning {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px dashed var(--border-subtle);
  background: var(--bg-soft, rgba(255, 255, 255, 0.03));
  text-align: left;
}

.level-failure-learning__title {
  margin: 0 0 10px;
  font-size: 0.82rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.level-failure-learning__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.level-failure-learning__chip {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--surface-elevated, var(--bg-card));
  color: var(--accent-cyan);
  font-size: 0.78rem;
  cursor: pointer;
}

.level-failure-learning__chip--playbook {
  color: var(--text-primary);
}

.level-failure-learning__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.level-failure-learning__link {
  font-size: 0.82rem;
  color: var(--accent-cyan);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
}

.level-failure-learning__link--side {
  color: var(--accent-amber);
}
</style>
