<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '../../stores/progressStore'
import { getLevelById } from '../../utils/levelRegistry'
import { useMobileLayout } from '../../composables/useMobileLayout'
import { getSerpentineLayout, getSerpentineRowCount } from '../../utils/questPathLayout'
import { buildNodePath, getPathLength, getProgressRatio } from '../../utils/questPathSvg'

const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v),
  },
  cols: {
    type: Number,
    default: null,
  },
  layout: {
    type: String,
    default: 'serpentine',
    validator: (v) => ['serpentine', 'linear'].includes(v),
  },
})

const router = useRouter()
const progressStore = useProgressStore()
const { isMobile } = useMobileLayout()

const wrapRef = ref(null)
const pathD = ref('')
const pathLen = ref(0)
const svgSize = ref({ w: 0, h: 0 })

const resolved = computed(() =>
  props.nodes.map((node) => {
    const level = getLevelById(node.levelId)
    const status = node.status ?? progressStore.getStatus(node.levelId)
    const meta = progressStore.getLevelMeta(node.levelId)
    return {
      levelId: node.levelId,
      label: node.label ?? `#${node.levelId}`,
      title: node.title ?? level?.title ?? '',
      status,
      stars: meta?.stars || 0,
    }
  })
)

const colsPerRow = computed(() => {
  if (props.cols) return props.cols
  if (props.size === 'sm') return isMobile.value ? 3 : 4
  return isMobile.value ? 4 : 5
})

const serpentineNodes = computed(() => getSerpentineLayout(resolved.value, colsPerRow.value))

const rowCount = computed(() => getSerpentineRowCount(resolved.value.length, colsPerRow.value))

const progressRatio = computed(() => getProgressRatio(resolved.value))

const progressDash = computed(() => {
  if (!pathLen.value) return '0 9999'
  const filled = pathLen.value * progressRatio.value
  return `${filled} ${pathLen.value}`
})

async function drawPath() {
  await nextTick()
  const wrap = wrapRef.value
  if (!wrap || props.layout !== 'serpentine') return

  const rect = wrap.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return

  svgSize.value = { w: rect.width, h: rect.height }

  const buttons = [...wrap.querySelectorAll('.quest-path__node[data-index]')].sort(
    (a, b) => Number(a.dataset.index) - Number(b.dataset.index)
  )

  if (buttons.length < 2) {
    pathD.value = ''
    pathLen.value = 0
    return
  }

  const points = buttons.map((btn) => {
    const dot = btn.querySelector('.quest-path__dot')
    const r = (dot || btn).getBoundingClientRect()
    return {
      x: r.left + r.width / 2 - rect.left,
      y: r.top + r.height / 2 - rect.top,
    }
  })

  pathD.value = buildNodePath(points)
  pathLen.value = getPathLength(points)
}

let resizeObserver

onMounted(() => {
  drawPath()
  resizeObserver = new ResizeObserver(() => drawPath())
  if (wrapRef.value) resizeObserver.observe(wrapRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch([serpentineNodes, colsPerRow, () => props.layout], drawPath, { deep: true })

function go(levelId, status) {
  if (status === 'locked') return
  router.push('/level/' + levelId)
}

function starDisplay(n) {
  if (!n) return ''
  return '★'.repeat(n)
}
</script>

<template>
  <div
    v-if="layout === 'serpentine'"
    ref="wrapRef"
    class="quest-path-wrap"
    :class="`quest-path-wrap--${size}`"
  >
    <svg
      v-if="pathD"
      class="quest-path__svg"
      :width="svgSize.w"
      :height="svgSize.h"
      aria-hidden="true"
    >
      <path :d="pathD" class="quest-path__track-bg" fill="none" />
      <path
        :d="pathD"
        class="quest-path__track-fill"
        fill="none"
        :stroke-dasharray="progressDash"
      />
    </svg>

    <div
      class="quest-path quest-path--serpentine"
      :class="`quest-path--${size}`"
      role="list"
      :style="{
        '--path-cols': colsPerRow,
        '--path-rows': rowCount,
      }"
    >
      <button
        v-for="node in serpentineNodes"
        :key="node.levelId"
        type="button"
        role="listitem"
        class="quest-path__node"
        :class="`quest-path__node--${node.status}`"
        :data-index="node.index"
        :style="{ gridRow: node.gridRow, gridColumn: node.gridColumn }"
        :aria-disabled="node.status === 'locked' || undefined"
        :title="node.title"
        :aria-label="`${node.label} ${node.title}${node.status === 'locked' ? '（未解锁）' : ''}`"
        @click="go(node.levelId, node.status)"
      >
        <span class="quest-path__dot" aria-hidden="true">
          <template v-if="node.status === 'completed'">✓</template>
          <template v-else-if="node.status === 'available'">▶</template>
          <template v-else>🔒</template>
        </span>
        <span class="quest-path__label">{{ node.label }}</span>
        <span v-if="node.title" class="quest-path__title">{{ node.title }}</span>
        <span v-if="node.stars" class="quest-path__stars">{{ starDisplay(node.stars) }}</span>
      </button>
    </div>
  </div>

  <div v-else class="quest-path quest-path--linear" :class="`quest-path--${size}`" role="list">
    <button
      v-for="(node, index) in resolved"
      :key="node.levelId"
      type="button"
      role="listitem"
      class="quest-path__node"
      :class="[
        `quest-path__node--${node.status}`,
        { 'quest-path__node--last': index === resolved.length - 1 },
      ]"
      :aria-disabled="node.status === 'locked' || undefined"
      :title="node.title"
      @click="go(node.levelId, node.status)"
    >
      <span class="quest-path__dot" aria-hidden="true">
        <template v-if="node.status === 'completed'">✓</template>
        <template v-else-if="node.status === 'available'">▶</template>
        <template v-else>🔒</template>
      </span>
      <span class="quest-path__label">{{ node.label }}</span>
      <span v-if="node.title" class="quest-path__title">{{ node.title }}</span>
      <span v-if="node.stars" class="quest-path__stars">{{ starDisplay(node.stars) }}</span>
    </button>
  </div>
</template>
