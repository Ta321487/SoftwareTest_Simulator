<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { phaseOrder, phases, getLevelTitle } from '../data/phases'
import { debriefs } from '../data/debriefs'
import { sideLevels, sideArcs } from '../data/sideQuests'
import { sideDebriefs } from '../data/sideDebriefs'
import {
  glossaryCategories,
  glossaryTerms,
  getGlossaryCategory,
  getGlossaryTerm,
} from '../data/glossary'
import ThemeToggle from '../components/ThemeToggle.vue'
import AppNavDock from '../components/AppNavDock.vue'
import { useMobileLayout } from '../composables/useMobileLayout'
import {
  getHandbookBlurb,
  getGlossaryBlurb,
  matchesHandbookSearch,
  filterGlossaryTerms,
} from '../utils/handbook'
import { getRecentTermIds, recordRecentTerm } from '../utils/handbookRecent'

const router = useRouter()
const route = useRoute()
const { isMobile } = useMobileLayout()

const viewMode = ref('notes')
const activePhase = ref('all')
const activeGlossaryCategory = ref('all')
const selectedEntry = ref(null)
const selectedTerm = ref(null)
const searchQuery = ref('')

const LIST_BATCH = 15
const listLimit = ref(LIST_BATCH)

watch(isMobile, (mobile) => {
  if (!mobile) listLimit.value = LIST_BATCH
})

const listScopeKey = computed(() => {
  const q = searchQuery.value.trim()
  if (q) return `search:${q}`
  if (viewMode.value === 'glossary') return `glossary:${activeGlossaryCategory.value}`
  return `notes:${activePhase.value}`
})

watch(listScopeKey, () => {
  listLimit.value = LIST_BATCH
})

function limitedList(list) {
  if (!isMobile.value) return list
  return list.slice(0, listLimit.value)
}

function remainingCount(list) {
  if (!isMobile.value) return 0
  return Math.max(0, list.length - listLimit.value)
}

function loadMore() {
  listLimit.value += LIST_BATCH
}

const isSearching = computed(() => searchQuery.value.trim().length > 0)

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

const filteredGlossaryTerms = computed(() =>
  filterGlossaryTerms(
    glossaryTerms,
    {
      query: searchQuery.value,
      categoryId: isSearching.value ? 'all' : activeGlossaryCategory.value,
    },
    (categoryId) => getGlossaryCategory(categoryId)?.name || ''
  )
)

const searchResultNotes = computed(() =>
  isSearching.value
    ? allEntries.value.filter((e) => matchesHandbookSearch(e, searchQuery.value))
    : []
)

const searchResultTerms = computed(() =>
  isSearching.value
    ? filterGlossaryTerms(
        glossaryTerms,
        { query: searchQuery.value, categoryId: 'all' },
        (categoryId) => getGlossaryCategory(categoryId)?.name || ''
      )
    : []
)

const visibleGlossaryTerms = computed(() => limitedList(filteredGlossaryTerms.value))
const visibleEntries = computed(() => limitedList(filteredEntries.value))
const visibleSearchTerms = computed(() => limitedList(searchResultTerms.value))
const visibleSearchNotes = computed(() => limitedList(searchResultNotes.value))

const showLoadMoreGlossary = computed(() => remainingCount(filteredGlossaryTerms.value) > 0)
const showLoadMoreNotes = computed(() => remainingCount(filteredEntries.value) > 0)
const showLoadMoreSearchTerms = computed(() => remainingCount(searchResultTerms.value) > 0)
const showLoadMoreSearchNotes = computed(() => remainingCount(searchResultNotes.value) > 0)

const recentTerms = computed(() =>
  getRecentTermIds()
    .map((id) => getGlossaryTerm(id))
    .filter(Boolean)
)

function openEntry(entry) {
  selectedTerm.value = null
  selectedEntry.value = entry
}

function openTerm(term) {
  selectedEntry.value = null
  selectedTerm.value = term
  recordRecentTerm(term.id)
}

function closeModal() {
  selectedEntry.value = null
  selectedTerm.value = null
}

function goToLevelFromEntry() {
  if (!selectedEntry.value) return
  router.push('/level/' + selectedEntry.value.routeId)
  closeModal()
}

function goToLevelFromTerm(levelId) {
  router.push('/level/' + levelId)
  closeModal()
}

function openRelatedTerm(termId) {
  const term = getGlossaryTerm(termId)
  if (term) selectedTerm.value = term
}

function getTermCategory(term) {
  return getGlossaryCategory(term?.category)
}

watch(
  () => route.query,
  (query) => {
    if (query.view === 'glossary') viewMode.value = 'glossary'
    if (query.term) {
      const term = getGlossaryTerm(String(query.term))
      if (term) {
        viewMode.value = 'glossary'
        selectedTerm.value = term
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="workbench home-map handbook">
    <header class="workbench__topbar">
      <div class="workbench__topbar-left">
        <div class="workbench__title-block">
          <h1 class="workbench__title">测试手札 · 百科</h1>
          <p class="workbench__subtitle">
            {{ allEntries.length }} 条关卡笔记 · {{ glossaryTerms.length }} 条术语 · 统一搜索
          </p>
        </div>
      </div>
      <ThemeToggle />
    </header>

    <div class="workbench__body">
      <AppNavDock current="handbook" />

      <main class="workbench__main handbook__main">
        <div class="handbook__toolbar">
          <div class="handbook__search">
            <input
              v-model="searchQuery"
              type="search"
              class="handbook__search-input"
              placeholder="搜索关卡笔记、Blocker、回归、P99…"
              aria-label="搜索手札与术语"
            />
          </div>

          <nav v-if="!isSearching" class="handbook__view-tabs" aria-label="内容类型">
            <button
              type="button"
              class="handbook__view-tab"
              :class="{ 'handbook__view-tab--active': viewMode === 'notes' }"
              @click="viewMode = 'notes'"
            >
              📚 关卡笔记
            </button>
            <button
              type="button"
              class="handbook__view-tab"
              :class="{ 'handbook__view-tab--active': viewMode === 'glossary' }"
              @click="viewMode = 'glossary'"
            >
              📖 术语百科
            </button>
          </nav>

          <nav
            v-if="!isSearching && viewMode === 'glossary' && !isMobile"
            class="handbook__tabs"
            aria-label="术语分类"
          >
            <button
              type="button"
              class="handbook__tab"
              :class="{ 'handbook__tab--active': activeGlossaryCategory === 'all' }"
              @click="activeGlossaryCategory = 'all'"
            >
              全部
            </button>
            <button
              v-for="cat in glossaryCategories"
              :key="cat.id"
              type="button"
              class="handbook__tab"
              :class="{ 'handbook__tab--active': activeGlossaryCategory === cat.id }"
              @click="activeGlossaryCategory = cat.id"
            >
              {{ cat.icon }} {{ cat.name }}
            </button>
          </nav>

          <label
            v-if="!isSearching && viewMode === 'glossary' && isMobile"
            class="handbook__filter"
          >
            <span class="handbook__filter-label">术语分类</span>
            <select v-model="activeGlossaryCategory" class="handbook__filter-select">
              <option value="all">全部</option>
              <option v-for="cat in glossaryCategories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </label>

          <nav
            v-if="!isSearching && viewMode === 'notes' && !isMobile"
            class="handbook__tabs"
            aria-label="阶段筛选"
          >
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

          <label v-if="!isSearching && viewMode === 'notes' && isMobile" class="handbook__filter">
            <span class="handbook__filter-label">笔记分类</span>
            <select v-model="activePhase" class="handbook__filter-select">
              <option value="all">全部</option>
              <option v-for="phaseId in phaseOrder" :key="phaseId" :value="phaseId">
                {{ phases[phaseId].icon }} {{ phases[phaseId].name }}
              </option>
              <option value="extra">🎬 番外</option>
            </select>
          </label>
        </div>

        <section v-if="!isSearching && recentTerms.length" class="handbook__recent">
          <h2 class="handbook__section-title">最近查阅</h2>
          <div class="handbook__recent-chips">
            <button
              v-for="term in recentTerms"
              :key="term.id"
              type="button"
              class="handbook__recent-chip"
              @click="openTerm(term)"
            >
              {{ term.term }}
            </button>
          </div>
        </section>

        <template v-if="isSearching">
          <section v-if="searchResultTerms.length" class="handbook__section">
            <h2 class="handbook__section-title">术语百科 · {{ searchResultTerms.length }}</h2>
            <div class="handbook__grid">
              <button
                v-for="term in visibleSearchTerms"
                :key="term.id"
                type="button"
                class="handbook__card handbook__card--glossary"
                @click="openTerm(term)"
              >
                <span class="handbook__card-phase">
                  {{ getTermCategory(term)?.icon }} {{ getTermCategory(term)?.name }}
                </span>
                <h3 class="handbook__card-title">{{ term.term }}</h3>
                <p class="handbook__card-summary">{{ getGlossaryBlurb(term) }}</p>
                <span class="handbook__card-more">展开词条 →</span>
              </button>
            </div>
            <button
              v-if="showLoadMoreSearchTerms"
              type="button"
              class="handbook__load-more"
              @click="loadMore"
            >
              加载更多（还剩 {{ remainingCount(searchResultTerms) }} 条）
            </button>
          </section>

          <section v-if="searchResultNotes.length" class="handbook__section">
            <h2 class="handbook__section-title">关卡笔记 · {{ searchResultNotes.length }}</h2>
            <div class="handbook__grid">
              <button
                v-for="entry in visibleSearchNotes"
                :key="entry.levelId"
                type="button"
                class="handbook__card"
                :class="`handbook__card--${entry.phaseId}`"
                @click="openEntry(entry)"
              >
                <span class="handbook__card-phase"
                  >{{ entry.phaseIcon }} {{ entry.phaseName }}</span
                >
                <span class="handbook__card-id">#{{ entry.levelId }}</span>
                <h3 class="handbook__card-title">{{ entry.title }}</h3>
                <p class="handbook__card-summary">{{ getHandbookBlurb(entry) }}</p>
                <span class="handbook__card-more">展开笔记 →</span>
              </button>
            </div>
            <button
              v-if="showLoadMoreSearchNotes"
              type="button"
              class="handbook__load-more"
              @click="loadMore"
            >
              加载更多（还剩 {{ remainingCount(searchResultNotes) }} 条）
            </button>
          </section>

          <p v-if="!searchResultTerms.length && !searchResultNotes.length" class="handbook__empty">
            没有匹配「{{ searchQuery.trim() }}」的内容
          </p>
        </template>

        <template v-else-if="viewMode === 'glossary'">
          <div class="handbook__grid">
            <button
              v-for="term in visibleGlossaryTerms"
              :key="term.id"
              type="button"
              class="handbook__card handbook__card--glossary"
              @click="openTerm(term)"
            >
              <span class="handbook__card-phase">
                {{ getTermCategory(term)?.icon }} {{ getTermCategory(term)?.name }}
              </span>
              <h3 class="handbook__card-title">{{ term.term }}</h3>
              <p v-if="term.aliases?.length" class="handbook__card-aliases">
                {{ term.aliases.slice(0, 3).join(' · ') }}
              </p>
              <p class="handbook__card-summary">{{ getGlossaryBlurb(term) }}</p>
              <span class="handbook__card-more">展开词条 →</span>
            </button>
          </div>

          <button
            v-if="showLoadMoreGlossary"
            type="button"
            class="handbook__load-more"
            @click="loadMore"
          >
            加载更多（还剩 {{ remainingCount(filteredGlossaryTerms) }} 条）
          </button>

          <p v-if="!filteredGlossaryTerms.length" class="handbook__empty">该分类暂无术语</p>
        </template>

        <template v-else>
          <div class="handbook__grid">
            <button
              v-for="entry in visibleEntries"
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

          <button
            v-if="showLoadMoreNotes"
            type="button"
            class="handbook__load-more"
            @click="loadMore"
          >
            加载更多（还剩 {{ remainingCount(filteredEntries) }} 条）
          </button>

          <p v-if="!filteredEntries.length" class="handbook__empty">该阶段暂无手札内容</p>
        </template>
      </main>
    </div>

    <div v-if="selectedEntry" class="handbook-modal" @click.self="closeModal">
      <article class="handbook-modal__panel">
        <div class="handbook-modal__sticky-head">
          <button v-if="isMobile" type="button" class="handbook-modal__back" @click="closeModal">
            ← 返回列表
          </button>
          <header class="handbook-modal__header">
            <div>
              <span class="handbook-modal__phase">
                {{ selectedEntry.phaseIcon }} {{ selectedEntry.phaseName }} · #{{
                  selectedEntry.levelId
                }}
              </span>
              <h2 class="handbook-modal__title">{{ selectedEntry.title }}</h2>
            </div>
            <button
              type="button"
              class="handbook-modal__close"
              aria-label="关闭"
              @click="closeModal"
            >
              ×
            </button>
          </header>
        </div>

        <div class="handbook-modal__body">
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
            <button type="button" class="sim-btn sim-btn--ghost" @click="goToLevelFromEntry">
              去这一关 →
            </button>
          </footer>
        </div>
      </article>
    </div>

    <div v-if="selectedTerm" class="handbook-modal" @click.self="closeModal">
      <article class="handbook-modal__panel handbook-modal__panel--glossary">
        <div class="handbook-modal__sticky-head">
          <button v-if="isMobile" type="button" class="handbook-modal__back" @click="closeModal">
            ← 返回列表
          </button>
          <header class="handbook-modal__header">
            <div>
              <span class="handbook-modal__phase">
                {{ getTermCategory(selectedTerm)?.icon }} {{ getTermCategory(selectedTerm)?.name }}
              </span>
              <h2 class="handbook-modal__title">{{ selectedTerm.term }}</h2>
              <p v-if="selectedTerm.aliases?.length" class="handbook-modal__aliases">
                也叫：{{ selectedTerm.aliases.join('、') }}
              </p>
            </div>
            <button
              type="button"
              class="handbook-modal__close"
              aria-label="关闭"
              @click="closeModal"
            >
              ×
            </button>
          </header>
        </div>

        <div class="handbook-modal__body">
          <section class="handbook-modal__section handbook-modal__section--highlight">
            <h3>是什么意思</h3>
            <p>{{ selectedTerm.definition }}</p>
          </section>
          <section class="handbook-modal__section">
            <h3>游戏里怎么用</h3>
            <p>{{ selectedTerm.example }}</p>
          </section>
          <section v-if="selectedTerm.seeAlso?.length" class="handbook-modal__section">
            <h3>相关术语</h3>
            <div class="handbook-modal__links">
              <button
                v-for="relatedId in selectedTerm.seeAlso"
                :key="relatedId"
                type="button"
                class="handbook-modal__link-chip"
                @click="openRelatedTerm(relatedId)"
              >
                {{ getGlossaryTerm(relatedId)?.term || relatedId }}
              </button>
            </div>
          </section>
          <section v-if="selectedTerm.relatedLevelIds?.length" class="handbook-modal__section">
            <h3>相关关卡</h3>
            <div class="handbook-modal__links">
              <button
                v-for="levelId in selectedTerm.relatedLevelIds"
                :key="levelId"
                type="button"
                class="handbook-modal__link-chip"
                @click="goToLevelFromTerm(levelId)"
              >
                #{{ levelId }} {{ getLevelTitle(levelId) }}
              </button>
            </div>
          </section>

          <footer class="handbook-modal__footer">
            <button type="button" class="sim-btn sim-btn--primary" @click="closeModal">关闭</button>
          </footer>
        </div>
      </article>
    </div>
  </div>
</template>
