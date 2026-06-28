<script setup>
import { JIRA_TIER_LABELS } from '../utils/jiraValidation'

defineProps({
  levelTitle: {
    type: String,
    required: true,
  },
  xpReward: {
    type: Number,
    required: true,
  },
  bonusXp: {
    type: Number,
    default: 0,
  },
  stars: {
    type: Number,
    default: 1,
  },
  sessionStars: {
    type: Number,
    default: 0,
  },
  improved: {
    type: Boolean,
    default: false,
  },
  debrief: {
    type: Object,
    required: true,
  },
  referenceAnswer: {
    type: Object,
    default: null,
  },
  tipLabel: {
    type: String,
    default: '职场建议',
  },
  rankUp: {
    type: Object,
    default: null,
  },
  newAchievements: {
    type: Array,
    default: () => [],
  },
  consequenceNote: {
    type: String,
    default: null,
  },
  jiraTier: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['close'])

function starLabel(n) {
  return n >= 3 ? '完美通关' : n >= 2 ? '良好' : '通关'
}
</script>

<template>
  <div class="debrief-overlay">
    <div class="debrief-panel">
      <header class="debrief-panel__header">
        <span class="debrief-panel__badge">✅ 任务完成</span>
        <div class="debrief-panel__rewards">
          <span class="debrief-panel__stars" :title="starLabel(stars)">
            <span
              v-for="i in 3"
              :key="i"
              class="debrief-panel__star"
              :class="{ 'debrief-panel__star--filled': i <= stars }"
            >★</span>
          </span>
          <span class="debrief-panel__xp">
            +{{ xpReward }} XP
            <span v-if="bonusXp > 0" class="debrief-panel__bonus">+{{ bonusXp }} 奖励</span>
          </span>
        </div>
      </header>

      <p v-if="improved" class="debrief-panel__improved">🎉 刷新最高星级记录！</p>
      <p v-else-if="sessionStars && sessionStars < stars" class="debrief-panel__improved debrief-panel__improved--muted">
        本次 {{ starLabel(sessionStars) }}；历史最高 {{ starLabel(stars) }}（继续冲星）
      </p>

      <p v-if="consequenceNote" class="debrief-panel__consequence">{{ consequenceNote }}</p>

      <p v-if="jiraTier" class="debrief-panel__jira-tier">
        工单质量：<strong>{{ JIRA_TIER_LABELS[jiraTier] || jiraTier }}</strong>
        <span v-if="jiraTier === 'draft'"> · 可冲星重玩本关</span>
        <span v-else-if="jiraTier === 'excellent'"> · 已达三星上限</span>
      </p>

      <div v-if="newAchievements.length" class="debrief-panel__achievements">
        <p class="debrief-panel__achievements-title">🏆 解锁成就</p>
        <ul>
          <li v-for="item in newAchievements" :key="item.id">
            {{ item.icon }} {{ item.title }} — {{ item.desc }}
          </li>
        </ul>
      </div>

      <div v-if="rankUp" class="debrief-panel__rank-up">
        <span class="debrief-panel__rank-icon">{{ rankUp.icon }}</span>
        <div>
          <p class="debrief-panel__rank-title">职级提升 · {{ rankUp.title }}</p>
          <p class="debrief-panel__rank-tagline">{{ rankUp.tagline }}</p>
        </div>
      </div>

      <h2 class="debrief-panel__title">{{ levelTitle }} · 复盘</h2>

      <section class="debrief-section">
        <h3 class="debrief-section__label">本次要点</h3>
        <p>{{ debrief.summary }}</p>
      </section>

      <section class="debrief-section debrief-section--highlight">
        <h3 class="debrief-section__label">为什么这样做</h3>
        <p>{{ debrief.why }}</p>
      </section>

      <section v-if="referenceAnswer" class="debrief-section debrief-section--reference">
        <h3 class="debrief-section__label">{{ referenceAnswer.label || '参考写法' }}</h3>
        <dl class="debrief-reference">
          <template v-for="(item, idx) in referenceAnswer.items" :key="idx">
            <dt>{{ item.title }}</dt>
            <dd>{{ item.text }}</dd>
          </template>
        </dl>
      </section>

      <section class="debrief-section">
        <h3 class="debrief-section__label">常见坑</h3>
        <p>{{ debrief.pitfalls }}</p>
      </section>

      <section class="debrief-section">
        <h3 class="debrief-section__label">{{ tipLabel }}</h3>
        <p>{{ debrief.workplace }}</p>
      </section>

      <button type="button" class="sim-btn sim-btn--primary debrief-panel__btn" @click="emit('close')">
        返回地图
      </button>
    </div>
  </div>
</template>
