import { getProjectDay, getProjectForLevel, projects } from './projects'
import { getLevelById } from '../utils/levelRegistry'
import { isSeason1Complete } from './mainlineMeta'

/** 全流程职场剧本：按 levelOrder 叙事，从培训营到 Lead */
export const careerChapters = [
  {
    id: 'bootcamp-login',
    chapter: 1,
    title: '新人培训营',
    period: '第 1 周',
    badge: '培训期',
    scene:
      '你刚参加完测试培训班，进了「星云科技」新人营。带教给你第一个模块——登录，从读 PRD 到上线排障，按天交作业。',
    goal: '7 天内独立完成登录模块从需求到上线的完整测试闭环。',
    mentor: {
      from: '带教 · 小陈',
      avatar: '👩‍🏫',
      text: '别等原型齐再动手——PRD 口头描述也要能圈测试点。每天下班前把交付物发我 Review。',
    },
    beats: [{ type: 'project', projectId: 'login-module' }],
  },
  {
    id: 'skills-drill',
    chapter: 2,
    title: '基本功加练',
    period: '课后作业',
    badge: '培训期',
    scene: '导师布置的加练：接口、断言、边界值——面试和笔试都会用到。',
    goal: '把基本功练到「看到字段就能想到测什么」。',
    mentor: {
      from: '导师 · 老王',
      avatar: '🧑‍💼',
      text: '这三题不是走过场——你后面写用例、做接口、算边界全靠它们。卡住了先对照需求再提交。',
    },
    beats: [
      {
        type: 'levels',
        levelIds: [16, 26, 17, 36, 37, 38],
        labels: {
          16: '加练 1',
          26: '加练 2',
          17: '加练 3',
          36: '加练 4',
          37: '加练 5',
          38: '加练 6',
        },
      },
    ],
  },
  {
    id: 'job-hunt',
    chapter: 3,
    title: '求职季',
    period: 'Offer 前',
    badge: '面试',
    scene: '训练营结业，开始投简历。终面上机搭环境，再面 HR 和技术面。',
    goal: '拿到 Offer：环境能独立搭，面试能讲清测试思路。',
    mentor: {
      from: '就业顾问 · Lily',
      avatar: '💼',
      text: '终面上机考的是「没人带也能干活」。HR 面别背标准答案，技术面要讲你会怎么排优先级。',
    },
    beats: [
      {
        type: 'levels',
        levelIds: [6, 18, 19, 39, 40, 41],
        labels: {
          6: '终面上机',
          18: 'HR 面',
          19: '技术面',
          39: '开场自我介绍',
          40: '黑盒白盒',
          41: '冒烟策略',
        },
      },
    ],
  },
  {
    id: 'written-offer',
    chapter: 4,
    title: '笔试与部门卷',
    period: 'Offer 前',
    badge: '笔试',
    scene: '通过终面后，用人部门发来笔试：协作排查、工单、发布分支与日报，再加几道计算与设计题。',
    goal: '证明你能融入团队：会协作、会写单、懂发布流程。',
    mentor: {
      from: '用人经理 · 张工',
      avatar: '👨‍💻',
      text: '笔试不是考背题——看你在真实项目里会不会找人、会不会写清楚、会不会估工作量。',
    },
    beats: [
      { type: 'project', projectId: 'payment-module', levelIds: [7, 8, 9, 10] },
      {
        type: 'levels',
        levelIds: [20, 27, 21, 42],
        labels: { 20: '笔试加试 1', 27: '笔试加试 2', 21: '笔试加试 3', 42: '笔试加试 4' },
      },
    ],
  },
  {
    id: 'onboard-order',
    chapter: 5,
    title: '正式入职 · 订单组',
    period: '第 1–2 周',
    badge: '入职',
    scene:
      '拿到 Offer，工牌到手。你被分到订单组，估时、链路、自动化、灰度、P0 复盘——真实项目节奏来了。',
    goal: '第一至二周：跟版本、做决策、能扛住一次线上压力。',
    mentor: {
      from: '组长 · 阿Ken',
      avatar: '🧑‍🔧',
      text: '入职后没人逐题教你了——估时要敢写数字，P0 复盘别只写「加强测试」。',
    },
    beats: [{ type: 'project', projectId: 'order-module' }],
  },
  {
    id: 'onboard-oncall',
    chapter: 6,
    title: '线上值班',
    period: '第 2 周',
    badge: '入职',
    scene: '轮值线上 on-call：用户反馈登录慢、grep 查 ERROR、升级 PM、满月总结——救火也是测试日常。',
    goal: '值班周：快速定位、正确升级、留下可复盘记录。',
    mentor: {
      from: 'On-call 手册',
      avatar: '🚨',
      text: '线上慢 ≠ 立刻改代码。先复现、再 grep、再判断要不要拉 PM——顺序错了越忙越乱。',
    },
    beats: [{ type: 'project', projectId: 'onboard-week2' }],
  },
  {
    id: 'lead-track',
    chapter: 7,
    title: '测试 Lead 线',
    period: '进阶',
    badge: 'Lead',
    scene:
      '第一季全通后解锁。带新人 Review 用例、排大版本、抓包、跨团队审计、大促 Go/No-Go。',
    goal: '从「自己测好」到「帮团队测好」——带人、排期、跨团队决策。',
    mentor: {
      from: '测试总监 · 周总',
      avatar: '🚀',
      text: 'Lead 不是 Title，是在别人踩坑之前把坑标出来。大促前那一票，你代表的是整个质量面。',
    },
    requiresSeason1: true,
    beats: [{ type: 'project', projectId: 'season2-lead' }],
  },
]

export function getBeatLevelIds(beat) {
  if (beat.type === 'project') {
    return beat.levelIds || projects[beat.projectId]?.levelIds || []
  }
  if (beat.type === 'levels') {
    return beat.levelIds || []
  }
  return []
}

export function getChapterLevelIds(chapter) {
  return chapter.beats.flatMap(getBeatLevelIds)
}

export function getChapterProgress(chapter, completedLevelIds) {
  const ids = getChapterLevelIds(chapter)
  const done = ids.filter((id) => completedLevelIds.includes(id)).length
  return { done, total: ids.length }
}

export function isChapterLocked(chapter, completedLevelIds) {
  if (chapter.requiresSeason1) {
    return !isSeason1Complete(completedLevelIds)
  }
  return false
}

export function findChapterForLevel(levelId) {
  for (const chapter of careerChapters) {
    const ids = getChapterLevelIds(chapter)
    if (ids.includes(levelId)) return chapter
  }
  return null
}

export function findActiveChapter(completedLevelIds) {
  for (const chapter of careerChapters) {
    if (isChapterLocked(chapter, completedLevelIds)) continue
    const { done, total } = getChapterProgress(chapter, completedLevelIds)
    if (done < total) return chapter
  }
  return careerChapters[careerChapters.length - 1]
}

function beatLabelForLevel(beat, levelId) {
  if (beat.labels?.[levelId]) return beat.labels[levelId]
  const project = getProjectForLevel(levelId)
  const day = project ? getProjectDay(project, levelId) : null
  if (day?.label) return day.label
  const index = getBeatLevelIds(beat).indexOf(levelId)
  return index >= 0 ? `任务 ${index + 1}` : ''
}

export function getWorkBrief({ firstAvailableLevelId, completedLevelIds, getStatus }) {
  if (!firstAvailableLevelId) {
    return {
      complete: true,
      levelId: null,
      title: '第一季职场剧本已通关',
      chapterTitle: '',
      beatLabel: '',
      desc: '番外、每日特训或进阶 Lead 线等你回顾；也可打开下方章节重温任一天。',
      status: 'completed',
    }
  }

  const levelId = firstAvailableLevelId
  const level = getLevelById(levelId)
  const chapter = findChapterForLevel(levelId)
  let beatLabel = ''

  if (chapter) {
    for (const beat of chapter.beats) {
      const ids = getBeatLevelIds(beat)
      if (ids.includes(levelId)) {
        beatLabel = beatLabelForLevel(beat, levelId)
        break
      }
    }
  }

  return {
    complete: false,
    levelId,
    title: level?.title || `关卡 #${levelId}`,
    chapterTitle: chapter ? `第 ${chapter.chapter} 章 · ${chapter.title}` : '',
    beatLabel,
    desc: chapter?.scene || '',
    status: getStatus(levelId),
  }
}
