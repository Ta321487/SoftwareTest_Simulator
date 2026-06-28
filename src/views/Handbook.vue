<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { phaseOrder, phases, getLevelTitle } from '../data/phases'
import { debriefs } from '../data/debriefs'
import { sideLevels, sideArcs } from '../data/sideQuests'
import { sideDebriefs } from '../data/sideDebriefs'
import ThemeToggle from '../components/ThemeToggle.vue'
import { getHandbookBlurb, matchesHandbookSearch } from '../utils/handbook'

const router = useRouter()
const activePhase = ref('all')
const selectedEntry = ref(null)
const searchQuery = ref('')

const mainEntries = computed(() =>
  phaseOrder.flatMap((phaseId) => {
    const phase = phases[phaseId]
    return phase.levelIds
      .filter((id) => debriefs[id])
      .map((id) => ({
        levelId: id,
        title: getLevelTitle(id),
        phaseId: phase.id,
        phaseName: phase.name,
        phaseIcon: phase.icon,
        tipLabel: phase.debriefTipLabel,
        routeId: id,
        ...debriefs[id],
      }))
  })
)

const sideEntries = computed(() =>
  sideLevels
    .filter((l) => sideDebriefs[l.id])
    .map((l) => {
      const arc = sideArcs.find((a) => a.id === l.sideArc)
      return {
        levelId: l.id,
        title: l.title,
        phaseId: 'extra',
        phaseName: '番外',
        phaseIcon: arc?.icon || '🎬',
        tipLabel: '番外笔记',
        routeId: l.id,
        ...sideDebriefs[l.id],
      }
    })
)

const allEntries = computed(() => [...mainEntries.value, ...sideEntries.value])

const filteredEntries = computed(() => {
  let list = allEntries.value
  if (activePhase.value === 'extra') {
    list = sideEntries.value
  } else if (activePhase.value !== 'all') {
    list = list.filter((e) => e.phaseId === activePhase.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((e) => matchesHandbookSearch(e, q))
})

function openEntry(entry) {
  selectedEntry.value = entry
}

function closeModal() {
  selectedEntry.value = null
}
</script>

<template>
  <div class="workbench handbook">
    <header class="workbench__topbar">
      <div class="workbench__topbar-left">
        <button type="button" class="workbench__back" @click="router.push('/')">← 地图</button>
        <div class="workbench__title-block">
          <h1 class="workbench__title">测试手札</h1>
          <p class="workbench__subtitle">{{ allEntries.length }} 条知识点 · 随时查阅复习</p>
        </div>
      </div>
      <ThemeToggle />
    </header>

    <main class="handbook__main">
      <div class="handbook__search">
        <input
          v-model="searchQuery"
          type="search"
          class="handbook__search-input"
          placeholder="搜索标题、知识点、常见坑…"
          aria-label="搜索手札"
        />
      </div>

      <nav class="handbook__tabs" aria-label="阶段筛选">
        <button
          type="button"
          class="handbook__tab"
          :class="{ 'handbook__tab--active': activePhase === 'all' }"
          @click="activePhase = 'all'"
        >
          全部
        </button>
        <button
          v-for="phaseId in phaseOrder"
          :key="phaseId"
          type="button"
          class="handbook__tab"
          :class="{ 'handbook__tab--active': activePhase === phaseId }"
          @click="activePhase = phaseId"
        >
          {{ phases[phaseId].icon }} {{ phases[phaseId].name }}
        </button>
        <button
          type="button"
          class="handbook__tab"
          :class="{ 'handbook__tab--active': activePhase === 'extra' }"
          @click="activePhase = 'extra'"
        >
          🎬 番外
        </button>
      </nav>

      <div class="handbook__grid">
        <button
          v-for="entry in filteredEntries"
          :key="entry.levelId"
          type="button"
          class="handbook__card"
          :class="`handbook__card--${entry.phaseId}`"
          @click="openEntry(entry)"
        >
          <span class="handbook__card-phase">{{ entry.phaseIcon }} {{ entry.phaseName }}</span>
          <span class="handbook__card-id">#{{ entry.levelId }}</span>
          <h3 class="handbook__card-title">{{ entry.title }}</h3>
          <p class="handbook__card-summary">{{ getHandbookBlurb(entry) }}</p>
          <span class="handbook__card-more">展开笔记 →</span>
        </button>
      </div>

      <p v-if="!filteredEntries.length" class="handbook__empty">该阶段暂无手札内容</p>
    </main>

    <div v-if="selectedEntry" class="handbook-modal" @click.self="closeModal">
      <article class="handbook-modal__panel">
        <header class="handbook-modal__header">
          <div>
            <span class="handbook-modal__phase">
              {{ selectedEntry.phaseIcon }} {{ selectedEntry.phaseName }} · #{{ selectedEntry.levelId }}
            </span>
            <h2 class="handbook-modal__title">{{ selectedEntry.title }}</h2>
          </div>
          <button type="button" class="handbook-modal__close" aria-label="关闭" @click="closeModal">×</button>
        </header>

        <section class="handbook-modal__section handbook-modal__section--highlight">
          <h3>核心要点</h3>
          <p>{{ selectedEntry.why }}</p>
        </section>
        <section class="handbook-modal__section handbook-modal__section--warn">
          <h3>常见坑</h3>
          <p>{{ selectedEntry.pitfalls }}</p>
        </section>
        <section class="handbook-modal__section">
          <h3>{{ selectedEntry.tipLabel }}</h3>
          <p>{{ selectedEntry.workplace }}</p>
        </section>

        <footer class="handbook-modal__footer">
          <button type="button" class="sim-btn sim-btn--primary" @click="closeModal">关闭</button>
          <button
            type="button"
            class="sim-btn sim-btn--ghost"
            @click="router.push('/level/' + selectedEntry.routeId); closeModal()"
          >
            去这一关 →
          </button>
        </footer>
      </article>
    </div>
  </div>
</template>
