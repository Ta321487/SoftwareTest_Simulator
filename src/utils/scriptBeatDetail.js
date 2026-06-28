import { simTypeLabels } from '../data/levels'
import { getLevelDeliverable } from '../data/levelDeliverables'
import { getLevelById } from './levelRegistry'

/** 从关卡 description 提取一句场景 hook（去掉【标签】） */
export function extractLevelHook(description) {
  if (!description) return ''
  const text = String(description)
    .replace(/^【[^】]+】\s*/, '')
    .trim()
  const sentence = text.match(/^[^。！？\n]+[。！？]?/)?.[0] || text
  return sentence.length > 80 ? `${sentence.slice(0, 78)}…` : sentence
}

export function getScriptBeatDetail(levelId, progressStore) {
  const level = getLevelById(levelId)
  const meta = progressStore?.getLevelMeta?.(levelId) || {}
  return {
    levelId,
    title: level?.title || `#${levelId}`,
    hook: extractLevelHook(level?.description),
    deliverable: getLevelDeliverable(levelId),
    toolLabel: simTypeLabels[level?.simType] || level?.simType || '',
    stars: meta.stars || 0,
    status: progressStore?.getStatus?.(levelId) || 'locked',
  }
}
