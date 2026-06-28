<script setup>
import { computed } from 'vue'
import { levels } from '../../data/levels'
import { useProjectStore } from '../../stores/projectStore'
import { getArtifactQualityLabel } from '../../data/consequences'
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  sourceLevelId: {
    type: Number,
    required: true,
  },
  currentLevelId: {
    type: Number,
    required: true,
  },
})

const projectStore = useProjectStore()

const sourceLevel = computed(() => levels.find((lv) => lv.id === props.sourceLevelId))

const artifact = computed(() => {
  if (!sourceLevel.value || sourceLevel.value.id >= props.currentLevelId) return null
  return projectStore.getArtifact(props.project.id, sourceLevel.value.id)
})

const lockReason = computed(() => {
  if (!sourceLevel.value) return '本项目暂无此工具档案'
  if (sourceLevel.value.id >= props.currentLevelId) {
    return `完成 Day ${sourceLevel.value.projectDay} 任务后可在此查看`
  }
  return '尚未产生存档，请先完成对应关卡'
})

const simType = computed(() => sourceLevel.value?.simType)

const artifactMeta = computed(() => artifact.value?._meta || null)

const qualityBadge = computed(() => {
  if (!artifactMeta.value?.quality) return null
  return getArtifactQualityLabel(artifactMeta.value.quality)
})
</script>
<template>
  <div class="context-panel">
    <template v-if="artifact && sourceLevel">
      <header class="context-panel__header">
        <h3>{{ sourceLevel.title }}</h3>
        <span v-if="qualityBadge" class="context-panel__tag" :class="`context-panel__tag--${qualityBadge.tone}`">
          {{ qualityBadge.text }}
        </span>
        <span v-else class="context-panel__tag">Day {{ sourceLevel.projectDay }} 存档</span>
      </header>
      <div v-if="artifactMeta?.jiraTier === 'draft' && simType === 'jira'" class="context-panel__flaw-note">
        王工曾反馈：工单为草稿档，描述略笼统，后续关卡回归时请对照现象再核一遍。
      </div>
      <div v-else-if="artifactMeta?.mistakes > 0 && simType === 'jira'" class="context-panel__flaw-note">
        李工曾反馈：描述略笼统，后续关卡回归时请对照现象再核一遍。
      </div>

      <div v-if="simType === 'checklist'" class="context-panel__body">        <p class="context-panel__intro">你在 PRD 评审中圈定的测试维度：</p>
        <ul class="context-panel__list">
          <li
            v-for="id in artifact.selected"
            :key="id"
            class="context-panel__list-item context-panel__list-item--checked"
          >
            ✓ {{ sourceLevel.checklistItems?.find((i) => i.id === id)?.label || id }}
          </li>
        </ul>
      </div>

      <div v-else-if="simType === 'template'" class="context-panel__body">
        <p class="context-panel__intro">已填写的内容：</p>
        <dl class="context-panel__dl">
          <template v-for="field in sourceLevel.templateFields" :key="field.field">
            <dt>{{ field.scenario || field.label }}</dt>
            <dd>{{ artifact.values?.[field.field] || '—' }}</dd>
          </template>
        </dl>
      </div>

      <div v-else-if="simType === 'jira'" class="context-panel__body">
        <p class="context-panel__intro">
          工单 <strong>TEST-{{ 1000 + sourceLevel.id }}</strong> 已提交：
        </p>
        <dl class="context-panel__dl">
          <template v-for="(config, key) in sourceLevel.jiraFields" :key="key">
            <dt>{{ config.label }}</dt>
            <dd>{{ artifact.values?.[key] || '—' }}</dd>
          </template>
        </dl>
      </div>

      <div v-else-if="simType === 'report'" class="context-panel__body">
        <p class="context-panel__intro">回归范围选择记录：</p>
        <ul class="context-panel__list">
          <li v-for="id in artifact.selected" :key="id" class="context-panel__list-item">
            {{ sourceLevel.reportItems?.find((i) => i.id === id)?.title || id }}
          </li>
        </ul>
      </div>

      <div v-else-if="simType === 'terminal'" class="context-panel__body">
        <p class="context-panel__intro">执行的排查命令：</p>
        <pre class="context-panel__code">{{ artifact.command }}</pre>
      </div>

      <div v-else-if="simType === 'config'" class="context-panel__body">
        <p class="context-panel__intro">保存的环境配置：</p>
        <pre class="context-panel__code">{{ sourceLevel.configKey || 'DB_HOST' }}={{ artifact.value }}</pre>
      </div>

      <div v-else-if="simType === 'chat'" class="context-panel__body">
        <p class="context-panel__intro">你在 {{ sourceLevel.chatGroup || '协作群' }} 中的回复：</p>
        <blockquote class="context-panel__quote">{{ artifact.message }}</blockquote>
      </div>

      <div v-else-if="simType === 'clickcard'" class="context-panel__body">
        <p class="context-panel__intro">确认的分支/选项：</p>
        <p class="context-panel__choice">
          {{ sourceLevel.clickOptions?.find((o) => o.id === artifact.selected)?.label || artifact.selected }}
        </p>
      </div>

      <div v-else-if="simType === 'calculator'" class="context-panel__body">
        <p class="context-panel__intro">工时评估参数：</p>
        <dl class="context-panel__dl">
          <template v-for="(val, key) in artifact.values" :key="key">
            <dt>{{ key }}</dt>
            <dd>{{ val }}</dd>
          </template>
        </dl>
      </div>
    </template>

    <div v-else class="context-panel__empty">
      <p class="context-panel__empty-icon">📭</p>
      <p>{{ lockReason }}</p>
    </div>
  </div>
</template>
