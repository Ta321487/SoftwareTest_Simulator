<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { phaseOrder, phases, getLevelTitle } from '../data/phases'
import { debriefs } from '../data/debriefs'
import { sideLevels, sideArcs } from '../data/sideQuests'
import { sideDebriefs, getDailyHandbookEntries } from '../data/sideDebriefs'
import { DAILY_POOL } from '../data/dailyChallenges'
import {
  glossaryCategories,
  glossaryTerms,
  getGlossaryCategory,
  getGlossaryTerm,
} from '../data/glossary'
import { playbooks, playbookCategories, getPlaybook, getPlaybookCategory } from '../data/playbooks'
import {
  handbookDomains,
  getHandbookDomain,
  getDomainCounts,
  filterPlaybooksByDomain,
  filterTermsByDomain,
  filterEntriesByDomain,
} from '../data/handbookDomains'
import { getPlaybooksForTerm, getHandbookLinksForLevel } from '../utils/handbookLinks'
import ThemeToggle from '../components/ThemeToggle.vue'
import AppNavDock from '../components/AppNavDock.vue'
import { useMobileLayout } from '../composables/useMobileLayout'
import {
  getHandbookBlurb,
  getGlossaryBlurb,
  getPlaybookBlurb,
  matchesHandbookSearch,
  matchesDailySearch,
  filterGlossaryTerms,
  filterPlaybooks,
} from '../utils/handbook'
import { getRecentTermIds, recordRecentTerm } from '../utils/handbookRecent'
import { useProgressStore } from '../stores/progressStore'
import {
  isHandbookLevelLocked,
  isPlaybookHandbookLocked,
  isGlossaryHandbookLocked,
  isDailyHandbookLocked,
} from '../utils/handbookUnlock'
import { getSkillsByCategory, getSkillProgress, getSkillCategory } from '../data/testingSkills'

const router = useRouter()
const route = useRoute()
const progressStore = useProgressStore()
const { isMobile } = useMobileLayout()

const viewMode = ref('notes')
const activePhase = ref('all')
const activeGlossaryCategory = ref('all')
const activePlaybookCategory = ref('all')
const activeDomainId = ref('functional')
const selectedEntry = ref(null)
const selectedTerm = ref(null)
const selectedPlaybook = ref(null)
const selectedDaily = ref(null)
const selectedSkill = ref(null)
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
  if (viewMode.value === 'playbooks') return `playbooks:${activePlaybookCategory.value}`
  if (viewMode.value === 'daily') return 'daily'
  if (viewMode.value === 'domains') return `domains:${activeDomainId.value}`
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

const dailyEntries = computed(() => getDailyHandbookEntries(DAILY_POOL))

const skillProgress = computed(() => getSkillProgress(progressStore.completedLevelIds))

const skillsByCategory = computed(() =>
  getSkillsByCategory(progressStore.completedLevelIds)
)

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

const filteredPlaybooks = computed(() =>
  filterPlaybooks(
    playbooks,
    {
      query: searchQuery.value,
      categoryId: isSearching.value ? 'all' : activePlaybookCategory.value,
    },
    (categoryId) => getPlaybookCategory(categoryId)?.name || ''
  )
)

const filteredDailyEntries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return dailyEntries.value
  return dailyEntries.value.filter((e) => matchesDailySearch(e, q))
})

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

const searchResultPlaybooks = computed(() =>
  isSearching.value
    ? filterPlaybooks(
        playbooks,
        { query: searchQuery.value, categoryId: 'all' },
        (categoryId) => getPlaybookCategory(categoryId)?.name || ''
      )
    : []
)

const searchResultDaily = computed(() =>
  isSearching.value
    ? dailyEntries.value.filter((e) => matchesDailySearch(e, searchQuery.value))
    : []
)

const visibleGlossaryTerms = computed(() => limitedList(filteredGlossaryTerms.value))
const visibleEntries = computed(() => limitedList(filteredEntries.value))
const visiblePlaybooks = computed(() => limitedList(filteredPlaybooks.value))
const visibleDaily = computed(() => limitedList(filteredDailyEntries.value))
const visibleSearchTerms = computed(() => limitedList(searchResultTerms.value))
const visibleSearchNotes = computed(() => limitedList(searchResultNotes.value))
const visibleSearchPlaybooks = computed(() => limitedList(searchResultPlaybooks.value))
const visibleSearchDaily = computed(() => limitedList(searchResultDaily.value))

const showLoadMoreGlossary = computed(() => remainingCount(filteredGlossaryTerms.value) > 0)
const showLoadMoreNotes = computed(() => remainingCount(filteredEntries.value) > 0)
const showLoadMorePlaybooks = computed(() => remainingCount(filteredPlaybooks.value) > 0)
const showLoadMoreDaily = computed(() => remainingCount(filteredDailyEntries.value) > 0)
const showLoadMoreSearchTerms = computed(() => remainingCount(searchResultTerms.value) > 0)
const showLoadMoreSearchNotes = computed(() => remainingCount(searchResultNotes.value) > 0)
const showLoadMoreSearchPlaybooks = computed(() => remainingCount(searchResultPlaybooks.value) > 0)
const showLoadMoreSearchDaily = computed(() => remainingCount(searchResultDaily.value) > 0)

const domainOverview = computed(() =>
  getDomainCounts({
    entries: allEntries.value,
    terms: glossaryTerms,
    playbooks,
  })
)

const activeDomain = computed(() => getHandbookDomain(activeDomainId.value))

const domainPlaybooks = computed(() => filterPlaybooksByDomain(playbooks, activeDomainId.value))

const domainTerms = computed(() => filterTermsByDomain(glossaryTerms, activeDomainId.value))

const domainNotes = computed(() => filterEntriesByDomain(allEntries.value, activeDomainId.value))

const visibleDomainPlaybooks = computed(() => limitedList(domainPlaybooks.value))
const visibleDomainTerms = computed(() => limitedList(domainTerms.value))
const visibleDomainNotes = computed(() => limitedList(domainNotes.value))

const showLoadMoreDomainPlaybooks = computed(() => remainingCount(domainPlaybooks.value) > 0)
const showLoadMoreDomainTerms = computed(() => remainingCount(domainTerms.value) > 0)
const showLoadMoreDomainNotes = computed(() => remainingCount(domainNotes.value) > 0)

const recentTerms = computed(() =>
  getRecentTermIds()
    .map((id) => getGlossaryTerm(id))
    .filter(Boolean)
)

function closeAllModals() {
  selectedEntry.value = null
  selectedTerm.value = null
  selectedPlaybook.value = null
  selectedDaily.value = null
  selectedSkill.value = null
}

function openEntry(entry) {
  if (cardLocked('note', entry)) return
  closeAllModals()
  selectedEntry.value = entry
}

function openTerm(term) {
  if (cardLocked('glossary', term)) return
  closeAllModals()
  selectedTerm.value = term
  recordRecentTerm(term.id)
}

function openPlaybook(pb) {
  if (cardLocked('playbook', pb)) return
  closeAllModals()
  selectedPlaybook.value = pb
}

function openDaily(entry) {
  if (cardLocked('daily', entry)) return
  closeAllModals()
  selectedDaily.value = entry
}

function closeModal() {
  closeAllModals()
}

function goToLevelFromEntry() {
  if (!selectedEntry.value) return
  router.push('/level/' + selectedEntry.value.routeId)
  closeModal()
}

function goToLevelFromTerm(levelId) {
  if (isHandbookLevelLocked(levelId, progressStore)) return
  router.push('/level/' + levelId)
  closeModal()
}

function levelLinkLocked(levelId) {
  return isHandbookLevelLocked(levelId, progressStore)
}

function openRelatedTerm(termId) {
  const term = getGlossaryTerm(termId)
  if (term) openTerm(term)
}

function getTermCategory(term) {
  return getGlossaryCategory(term?.category)
}

function getPlaybookCat(pb) {
  return getPlaybookCategory(pb?.category)
}

function cardLocked(kind, item) {
  if (kind === 'note') return isHandbookLevelLocked(item.levelId, progressStore)
  if (kind === 'playbook') return isPlaybookHandbookLocked(item, progressStore)
  if (kind === 'glossary') return isGlossaryHandbookLocked(item, progressStore)
  if (kind === 'daily') return isDailyHandbookLocked(progressStore)
  return false
}

function noteCardSummary(entry) {
  if (cardLocked('note', entry)) return `通关 #${entry.levelId} 后解锁`
  return getHandbookBlurb(entry)
}

function playbookCardSummary(pb) {
  if (cardLocked('playbook', pb)) {
    const id = pb.relatedLevelIds?.[0]
    return id ? `通关 #${id} 等关联关卡后解锁` : '通关相关关卡后解锁'
  }
  return getPlaybookBlurb(pb)
}

function glossaryCardSummary(term) {
  if (cardLocked('glossary', term)) {
    const id = term.relatedLevelIds?.[0]
    return id ? `通关 #${id} 等关联关卡后解锁` : '通关相关关卡后解锁'
  }
  return getGlossaryBlurb(term)
}

function dailyCardSummary(entry) {
  if (cardLocked('daily', entry)) return '完成第 5 关「登录收官」后解锁每日特训'
  return getHandbookBlurb(entry)
}

function openEntryByLevelId(levelId) {
  const numId = Number(levelId)
  const entry = allEntries.value.find((e) => e.levelId === numId)
  if (entry) {
    viewMode.value = 'notes'
    openEntry(entry)
  }
}

function openSkill(skill) {
  if (!skill.unlocked) return
  closeAllModals()
  selectedSkill.value = skill.detail || skill
}

function goToLevelFromSkill(levelId) {
  if (isHandbookLevelLocked(levelId, progressStore)) return
  router.push('/level/' + levelId)
  closeModal()
}

function applyRouteQuery(query) {
  if (query.view === 'glossary') viewMode.value = 'glossary'
  if (query.view === 'playbooks') viewMode.value = 'playbooks'
  if (query.view === 'daily') viewMode.value = 'daily'
  if (query.view === 'domains') viewMode.value = 'domains'
  if (query.view === 'skills') viewMode.value = 'skills'
  if (query.domain && handbookDomains.some((d) => d.id === query.domain)) {
    activeDomainId.value = String(query.domain)
  }
  if (query.term) {
    const term = getGlossaryTerm(String(query.term))
    if (term) {
      viewMode.value = 'glossary'
      openTerm(term)
    }
  }
  if (query.playbook) {
    const pb = getPlaybook(String(query.playbook))
    if (pb) {
      viewMode.value = 'playbooks'
      openPlaybook(pb)
    }
  }
  if (query.note) {
    openEntryByLevelId(query.note)
  }
}

watch(
  () => route.query,
  (query) => applyRouteQuery(query),
  { immediate: true }
)

const selectedEntryLinks = computed(() =>
  selectedEntry.value
    ? getHandbookLinksForLevel(selectedEntry.value.levelId)
    : { terms: [], playbooks: [] }
)

const selectedTermPlaybooks = computed(() =>
  selectedTerm.value ? getPlaybooksForTerm(selectedTerm.value.id) : []
)

watch(allEntries, () => {
  if (route.query.note) openEntryByLevelId(route.query.note)
})
</script>

<template>
  <div class="workbench home-map handbook">
    <header class="workbench__topbar">
      <div class="workbench__topbar-left">
        <div class="workbench__title-block">
          <h1 class="workbench__title">测试手札 · 百科</h1>
          <p class="workbench__subtitle">
            {{ allEntries.length }} 条关卡笔记 · {{ glossaryTerms.length }} 条术语 ·
            {{ playbooks.length }} 张套路卡 · {{ skillProgress.done }}/{{ skillProgress.total }}
            项能力
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
              placeholder="搜索笔记、术语、套路卡、每日精选…"
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
            <button
              type="button"
              class="handbook__view-tab"
              :class="{ 'handbook__view-tab--active': viewMode === 'playbooks' }"
              @click="viewMode = 'playbooks'"
            >
              📋 套路卡
            </button>
            <button
              type="button"
              class="handbook__view-tab"
              :class="{ 'handbook__view-tab--active': viewMode === 'daily' }"
              @click="viewMode = 'daily'"
            >
              📅 每日精选
            </button>
            <button
              type="button"
              class="handbook__view-tab"
              :class="{ 'handbook__view-tab--active': viewMode === 'skills' }"
              @click="viewMode = 'skills'"
            >
              ✨ 我的能力
            </button>
            <button
              type="button"
              class="handbook__view-tab"
              :class="{ 'handbook__view-tab--active': viewMode === 'domains' }"
              @click="viewMode = 'domains'"
            >
              🗂️ 能力域
            </button>
          </nav>

          <nav
            v-if="!isSearching && viewMode === 'domains'"
            class="handbook__tabs"
            aria-label="能力域"
          >
            <button
              v-for="domain in domainOverview"
              :key="domain.id"
              type="button"
              class="handbook__tab"
              :class="{ 'handbook__tab--active': activeDomainId === domain.id }"
              @click="activeDomainId = domain.id"
            >
              {{ domain.icon }} {{ domain.name }}
              <span class="handbook__tab-count">{{
                domain.counts.notes + domain.counts.terms + domain.counts.playbooks
              }}</span>
            </button>
          </nav>

          <nav
            v-if="!isSearching && viewMode === 'playbooks'"
            class="handbook__tabs"
            aria-label="套路卡分类"
          >
            <button
              type="button"
              class="handbook__tab"
              :class="{ 'handbook__tab--active': activePlaybookCategory === 'all' }"
              @click="activePlaybookCategory = 'all'"
            >
              全部
            </button>
            <button
              v-for="cat in playbookCategories"
              :key="cat.id"
              type="button"
              class="handbook__tab"
              :class="{ 'handbook__tab--active': activePlaybookCategory === cat.id }"
              @click="activePlaybookCategory = cat.id"
            >
              {{ cat.icon }} {{ cat.name }}
            </button>
          </nav>

          <nav
            v-if="!isSearching && viewMode === 'glossary'"
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

          <nav
            v-if="!isSearching && viewMode === 'notes'"
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
                :class="{ 'handbook__card--locked': cardLocked('glossary', term) }"
                :aria-disabled="cardLocked('glossary', term) || undefined"
                @click="openTerm(term)"
              >
                <span class="handbook__card-phase">
                  {{ getTermCategory(term)?.icon }} {{ getTermCategory(term)?.name }}
                </span>
                <h3 class="handbook__card-title">{{ term.term }}</h3>
                <p class="handbook__card-summary">{{ glossaryCardSummary(term) }}</p>
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
                :class="[
                  `handbook__card--${entry.phaseId}`,
                  { 'handbook__card--locked': cardLocked('note', entry) },
                ]"
                :aria-disabled="cardLocked('note', entry) || undefined"
                @click="openEntry(entry)"
              >
                <span class="handbook__card-phase"
                  >{{ entry.phaseIcon }} {{ entry.phaseName }}</span
                >
                <span class="handbook__card-id">#{{ entry.levelId }}</span>
                <h3 class="handbook__card-title">{{ entry.title }}</h3>
                <p class="handbook__card-summary">{{ noteCardSummary(entry) }}</p>
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

          <section v-if="searchResultPlaybooks.length" class="handbook__section">
            <h2 class="handbook__section-title">套路卡 · {{ searchResultPlaybooks.length }}</h2>
            <div class="handbook__grid">
              <button
                v-for="pb in visibleSearchPlaybooks"
                :key="pb.id"
                type="button"
                class="handbook__card handbook__card--playbook"
                :class="{ 'handbook__card--locked': cardLocked('playbook', pb) }"
                :aria-disabled="cardLocked('playbook', pb) || undefined"
                @click="openPlaybook(pb)"
              >
                <span class="handbook__card-phase">
                  {{ getPlaybookCat(pb)?.icon }} {{ getPlaybookCat(pb)?.name }}
                </span>
                <h3 class="handbook__card-title">{{ pb.icon }} {{ pb.title }}</h3>
                <p class="handbook__card-summary">{{ playbookCardSummary(pb) }}</p>
                <span class="handbook__card-more">展开套路 →</span>
              </button>
            </div>
            <button
              v-if="showLoadMoreSearchPlaybooks"
              type="button"
              class="handbook__load-more"
              @click="loadMore"
            >
              加载更多（还剩 {{ remainingCount(searchResultPlaybooks) }} 条）
            </button>
          </section>

          <section v-if="searchResultDaily.length" class="handbook__section">
            <h2 class="handbook__section-title">每日精选 · {{ searchResultDaily.length }}</h2>
            <div class="handbook__grid">
              <button
                v-for="entry in visibleSearchDaily"
                :key="entry.key"
                type="button"
                class="handbook__card handbook__card--daily"
                :class="{ 'handbook__card--locked': cardLocked('daily', entry) }"
                :aria-disabled="cardLocked('daily', entry) || undefined"
                @click="openDaily(entry)"
              >
                <span class="handbook__card-phase">📅 每日特训</span>
                <h3 class="handbook__card-title">{{ entry.title }}</h3>
                <p class="handbook__card-summary">{{ dailyCardSummary(entry) }}</p>
                <span class="handbook__card-more">展开心得 →</span>
              </button>
            </div>
            <button
              v-if="showLoadMoreSearchDaily"
              type="button"
              class="handbook__load-more"
              @click="loadMore"
            >
              加载更多（还剩 {{ remainingCount(searchResultDaily) }} 条）
            </button>
          </section>

          <p
            v-if="
              !searchResultTerms.length &&
              !searchResultNotes.length &&
              !searchResultPlaybooks.length &&
              !searchResultDaily.length
            "
            class="handbook__empty"
          >
            没有匹配「{{ searchQuery.trim() }}」的内容
          </p>
        </template>

        <template v-else-if="viewMode === 'playbooks'">
          <div class="handbook__grid">
            <button
              v-for="pb in visiblePlaybooks"
              :key="pb.id"
              type="button"
              class="handbook__card handbook__card--playbook"
              :class="{ 'handbook__card--locked': cardLocked('playbook', pb) }"
              :aria-disabled="cardLocked('playbook', pb) || undefined"
              @click="openPlaybook(pb)"
            >
              <span class="handbook__card-phase">
                {{ getPlaybookCat(pb)?.icon }} {{ getPlaybookCat(pb)?.name }}
              </span>
              <h3 class="handbook__card-title">{{ pb.icon }} {{ pb.title }}</h3>
              <p class="handbook__card-summary">{{ playbookCardSummary(pb) }}</p>
              <span class="handbook__card-more">展开套路 →</span>
            </button>
          </div>
          <button
            v-if="showLoadMorePlaybooks"
            type="button"
            class="handbook__load-more"
            @click="loadMore"
          >
            加载更多（还剩 {{ remainingCount(filteredPlaybooks) }} 条）
          </button>
          <p v-if="!filteredPlaybooks.length" class="handbook__empty">该分类暂无套路卡</p>
        </template>

        <template v-else-if="viewMode === 'skills'">
          <header class="handbook__domain-head">
            <h2 class="handbook__domain-title">✨ 我的测试能力</h2>
            <p class="handbook__domain-tagline">
              通关主线后解锁「我会…」式能力句——同一能力会在不同关卡螺旋复现。
            </p>
            <p class="handbook__domain-stats">
              已掌握 {{ skillProgress.done }}/{{ skillProgress.total }} 项（{{
                skillProgress.percent
              }}%）
            </p>
            <div class="handbook__skill-progress">
              <div
                class="handbook__skill-progress-fill"
                :style="{ width: `${skillProgress.percent}%` }"
              />
            </div>
          </header>

          <section v-for="group in skillsByCategory" :key="group.id" class="handbook__section">
            <h2 class="handbook__section-title">
              {{ group.icon }} {{ group.name }}
              <span class="handbook__tab-count">{{ group.done }}/{{ group.total }}</span>
            </h2>
            <div class="handbook__grid">
              <button
                v-for="skill in group.skills"
                :key="skill.id"
                type="button"
                class="handbook__card handbook__card--skill"
                :class="{ 'handbook__card--locked': !skill.unlocked }"
                :aria-disabled="!skill.unlocked || undefined"
                @click="openSkill(skill)"
              >
                <span class="handbook__card-phase">
                  {{ getSkillCategory(skill.category)?.icon }}
                  {{ getSkillCategory(skill.category)?.name }}
                </span>
                <h3 class="handbook__card-title">{{ skill.icon }} {{ skill.label }}</h3>
                <p class="handbook__card-summary">
                  {{
                    skill.unlocked
                      ? `已在 ${skill.detail?.sourceLevels?.length || 1} 关练过`
                      : '通关对应主线后解锁'
                  }}
                </p>
                <span class="handbook__card-more">{{
                  skill.unlocked ? '查看来源关卡 →' : '未解锁'
                }}</span>
              </button>
            </div>
          </section>
        </template>

        <template v-else-if="viewMode === 'domains'">
          <header v-if="activeDomain" class="handbook__domain-head">
            <h2 class="handbook__domain-title">{{ activeDomain.icon }} {{ activeDomain.name }}</h2>
            <p class="handbook__domain-tagline">{{ activeDomain.tagline }}</p>
            <p class="handbook__domain-stats">
              {{ domainNotes.length }} 条笔记 · {{ domainTerms.length }} 条术语 ·
              {{ domainPlaybooks.length }} 张套路卡
            </p>
          </header>

          <section v-if="domainPlaybooks.length" class="handbook__section">
            <h2 class="handbook__section-title">套路卡</h2>
            <div class="handbook__grid">
              <button
                v-for="pb in visibleDomainPlaybooks"
                :key="pb.id"
                type="button"
                class="handbook__card handbook__card--playbook"
                :class="{ 'handbook__card--locked': cardLocked('playbook', pb) }"
                :aria-disabled="cardLocked('playbook', pb) || undefined"
                @click="openPlaybook(pb)"
              >
                <span class="handbook__card-phase">{{ pb.icon }} 套路</span>
                <h3 class="handbook__card-title">{{ pb.title }}</h3>
                <p class="handbook__card-summary">{{ playbookCardSummary(pb) }}</p>
                <span class="handbook__card-more">展开 →</span>
              </button>
            </div>
            <button
              v-if="showLoadMoreDomainPlaybooks"
              type="button"
              class="handbook__load-more"
              @click="loadMore"
            >
              加载更多套路卡
            </button>
          </section>

          <section v-if="domainTerms.length" class="handbook__section">
            <h2 class="handbook__section-title">核心术语</h2>
            <div class="handbook__grid">
              <button
                v-for="term in visibleDomainTerms"
                :key="term.id"
                type="button"
                class="handbook__card handbook__card--glossary"
                :class="{ 'handbook__card--locked': cardLocked('glossary', term) }"
                :aria-disabled="cardLocked('glossary', term) || undefined"
                @click="openTerm(term)"
              >
                <span class="handbook__card-phase">
                  {{ getTermCategory(term)?.icon }} {{ getTermCategory(term)?.name }}
                </span>
                <h3 class="handbook__card-title">{{ term.term }}</h3>
                <p class="handbook__card-summary">{{ glossaryCardSummary(term) }}</p>
                <span class="handbook__card-more">展开词条 →</span>
              </button>
            </div>
            <button
              v-if="showLoadMoreDomainTerms"
              type="button"
              class="handbook__load-more"
              @click="loadMore"
            >
              加载更多术语
            </button>
          </section>

          <section v-if="domainNotes.length" class="handbook__section">
            <h2 class="handbook__section-title">代表关卡笔记</h2>
            <div class="handbook__grid">
              <button
                v-for="entry in visibleDomainNotes"
                :key="entry.levelId"
                type="button"
                class="handbook__card"
                :class="[
                  `handbook__card--${entry.phaseId}`,
                  { 'handbook__card--locked': cardLocked('note', entry) },
                ]"
                :aria-disabled="cardLocked('note', entry) || undefined"
                @click="openEntry(entry)"
              >
                <span class="handbook__card-phase"
                  >{{ entry.phaseIcon }} {{ entry.phaseName }}</span
                >
                <span class="handbook__card-id">#{{ entry.levelId }}</span>
                <h3 class="handbook__card-title">{{ entry.title }}</h3>
                <p class="handbook__card-summary">{{ noteCardSummary(entry) }}</p>
                <span class="handbook__card-more">展开笔记 →</span>
              </button>
            </div>
            <button
              v-if="showLoadMoreDomainNotes"
              type="button"
              class="handbook__load-more"
              @click="loadMore"
            >
              加载更多笔记
            </button>
          </section>

          <p
            v-if="!domainPlaybooks.length && !domainTerms.length && !domainNotes.length"
            class="handbook__empty"
          >
            该能力域暂无内容
          </p>
        </template>

        <template v-else-if="viewMode === 'daily'">
          <p class="handbook__daily-hint">
            来自每日特训题库，按主题归档便于复习（与当天轮换题目一致）。
          </p>
          <div class="handbook__grid">
            <button
              v-for="entry in visibleDaily"
              :key="entry.key"
              type="button"
              class="handbook__card handbook__card--daily"
              :class="{ 'handbook__card--locked': cardLocked('daily', entry) }"
              :aria-disabled="cardLocked('daily', entry) || undefined"
              @click="openDaily(entry)"
            >
              <span class="handbook__card-phase">📅 每日特训</span>
              <h3 class="handbook__card-title">{{ entry.title }}</h3>
              <p class="handbook__card-summary">{{ dailyCardSummary(entry) }}</p>
              <span class="handbook__card-more">展开心得 →</span>
            </button>
          </div>
          <button
            v-if="showLoadMoreDaily"
            type="button"
            class="handbook__load-more"
            @click="loadMore"
          >
            加载更多（还剩 {{ remainingCount(filteredDailyEntries) }} 条）
          </button>
        </template>

        <template v-else-if="viewMode === 'glossary'">
          <div class="handbook__grid">
            <button
              v-for="term in visibleGlossaryTerms"
              :key="term.id"
              type="button"
              class="handbook__card handbook__card--glossary"
              :class="{ 'handbook__card--locked': cardLocked('glossary', term) }"
              :aria-disabled="cardLocked('glossary', term) || undefined"
              @click="openTerm(term)"
            >
              <span class="handbook__card-phase">
                {{ getTermCategory(term)?.icon }} {{ getTermCategory(term)?.name }}
              </span>
              <h3 class="handbook__card-title">{{ term.term }}</h3>
              <p v-if="term.aliases?.length" class="handbook__card-aliases">
                {{ term.aliases.slice(0, 3).join(' · ') }}
              </p>
              <p class="handbook__card-summary">{{ glossaryCardSummary(term) }}</p>
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
              :class="[
                `handbook__card--${entry.phaseId}`,
                { 'handbook__card--locked': cardLocked('note', entry) },
              ]"
              :aria-disabled="cardLocked('note', entry) || undefined"
              @click="openEntry(entry)"
            >
              <span class="handbook__card-phase">{{ entry.phaseIcon }} {{ entry.phaseName }}</span>
              <span class="handbook__card-id">#{{ entry.levelId }}</span>
              <h3 class="handbook__card-title">{{ entry.title }}</h3>
              <p class="handbook__card-summary">{{ noteCardSummary(entry) }}</p>
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
          <section
            v-if="selectedEntryLinks.terms.length || selectedEntryLinks.playbooks.length"
            class="handbook-modal__section"
          >
            <h3>延伸阅读</h3>
            <div v-if="selectedEntryLinks.terms.length" class="handbook-modal__links">
              <button
                v-for="term in selectedEntryLinks.terms"
                :key="term.id"
                type="button"
                class="handbook-modal__link-chip"
                @click="openTerm(term)"
              >
                {{ term.term }}
              </button>
            </div>
            <div v-if="selectedEntryLinks.playbooks.length" class="handbook-modal__links">
              <button
                v-for="pb in selectedEntryLinks.playbooks"
                :key="pb.id"
                type="button"
                class="handbook-modal__link-chip handbook-modal__link-chip--playbook"
                @click="openPlaybook(pb)"
              >
                {{ pb.icon }} {{ pb.title }}
              </button>
            </div>
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
                :class="{ 'handbook-modal__link-chip--locked': levelLinkLocked(levelId) }"
                :aria-disabled="levelLinkLocked(levelId) || undefined"
                @click="goToLevelFromTerm(levelId)"
              >
                #{{ levelId }} {{ getLevelTitle(levelId) }}
              </button>
            </div>
          </section>
          <section v-if="selectedTermPlaybooks.length" class="handbook-modal__section">
            <h3>相关套路卡</h3>
            <div class="handbook-modal__links">
              <button
                v-for="pb in selectedTermPlaybooks"
                :key="pb.id"
                type="button"
                class="handbook-modal__link-chip handbook-modal__link-chip--playbook"
                @click="openPlaybook(pb)"
              >
                {{ pb.icon }} {{ pb.title }}
              </button>
            </div>
          </section>

          <footer class="handbook-modal__footer">
            <button type="button" class="sim-btn sim-btn--primary" @click="closeModal">关闭</button>
          </footer>
        </div>
      </article>
    </div>

    <div v-if="selectedPlaybook" class="handbook-modal" @click.self="closeModal">
      <article class="handbook-modal__panel handbook-modal__panel--playbook">
        <div class="handbook-modal__sticky-head">
          <button v-if="isMobile" type="button" class="handbook-modal__back" @click="closeModal">
            ← 返回列表
          </button>
          <header class="handbook-modal__header">
            <div>
              <span class="handbook-modal__phase">
                {{ getPlaybookCat(selectedPlaybook)?.icon }}
                {{ getPlaybookCat(selectedPlaybook)?.name }}
              </span>
              <h2 class="handbook-modal__title">
                {{ selectedPlaybook.icon }} {{ selectedPlaybook.title }}
              </h2>
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
            <h3>什么时候用</h3>
            <p>{{ selectedPlaybook.summary }}</p>
          </section>
          <section class="handbook-modal__section">
            <h3>步骤清单</h3>
            <ol class="handbook-modal__steps">
              <li v-for="(step, idx) in selectedPlaybook.steps" :key="idx">{{ step }}</li>
            </ol>
          </section>
          <section v-if="selectedPlaybook.relatedTermIds?.length" class="handbook-modal__section">
            <h3>相关术语</h3>
            <div class="handbook-modal__links">
              <button
                v-for="termId in selectedPlaybook.relatedTermIds"
                :key="termId"
                type="button"
                class="handbook-modal__link-chip"
                @click="openRelatedTerm(termId)"
              >
                {{ getGlossaryTerm(termId)?.term || termId }}
              </button>
            </div>
          </section>
          <section v-if="selectedPlaybook.relatedLevelIds?.length" class="handbook-modal__section">
            <h3>练手关卡</h3>
            <div class="handbook-modal__links">
              <button
                v-for="levelId in selectedPlaybook.relatedLevelIds"
                :key="levelId"
                type="button"
                class="handbook-modal__link-chip"
                :class="{ 'handbook-modal__link-chip--locked': levelLinkLocked(levelId) }"
                :aria-disabled="levelLinkLocked(levelId) || undefined"
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

    <div v-if="selectedSkill" class="handbook-modal" @click.self="closeModal">
      <article class="handbook-modal__panel handbook-modal__panel--skill">
        <div class="handbook-modal__sticky-head">
          <button v-if="isMobile" type="button" class="handbook-modal__back" @click="closeModal">
            ← 返回列表
          </button>
          <header class="handbook-modal__header">
            <div>
              <span class="handbook-modal__phase">
                {{ getSkillCategory(selectedSkill.category)?.icon }}
                {{ getSkillCategory(selectedSkill.category)?.name }}
              </span>
              <h2 class="handbook-modal__title">{{ selectedSkill.icon }} {{ selectedSkill.label }}</h2>
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
            <h3>练过这些关</h3>
            <div class="handbook-modal__links">
              <button
                v-for="src in selectedSkill.sourceLevels"
                :key="src.levelId"
                type="button"
                class="handbook-modal__link-chip"
                :class="{ 'handbook-modal__link-chip--locked': levelLinkLocked(src.levelId) }"
                :aria-disabled="levelLinkLocked(src.levelId) || undefined"
                @click="goToLevelFromSkill(src.levelId)"
              >
                #{{ src.levelId }} {{ src.title }}
                <span v-if="src.spiralFrom" class="handbook-modal__spiral-tag"
                  >↻ 进阶自 #{{ src.spiralFrom }}</span
                >
              </button>
            </div>
          </section>
          <footer class="handbook-modal__footer">
            <button type="button" class="sim-btn sim-btn--primary" @click="closeModal">关闭</button>
          </footer>
        </div>
      </article>
    </div>

    <div v-if="selectedDaily" class="handbook-modal" @click.self="closeModal">
      <article class="handbook-modal__panel handbook-modal__panel--daily">
        <div class="handbook-modal__sticky-head">
          <button v-if="isMobile" type="button" class="handbook-modal__back" @click="closeModal">
            ← 返回列表
          </button>
          <header class="handbook-modal__header">
            <div>
              <span class="handbook-modal__phase">📅 每日特训精选</span>
              <h2 class="handbook-modal__title">{{ selectedDaily.title }}</h2>
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
            <h3>要点</h3>
            <p>{{ selectedDaily.summary }}</p>
          </section>
          <section class="handbook-modal__section">
            <h3>为什么</h3>
            <p>{{ selectedDaily.why }}</p>
          </section>
          <section class="handbook-modal__section handbook-modal__section--warn">
            <h3>常见坑</h3>
            <p>{{ selectedDaily.pitfalls }}</p>
          </section>
          <section class="handbook-modal__section">
            <h3>{{ selectedDaily.tipLabel }}</h3>
            <p>{{ selectedDaily.workplace }}</p>
          </section>
          <footer class="handbook-modal__footer">
            <button type="button" class="sim-btn sim-btn--primary" @click="closeModal">关闭</button>
          </footer>
        </div>
      </article>
    </div>
  </div>
</template>
