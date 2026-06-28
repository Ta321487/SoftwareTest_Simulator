/** 阶段 1：后果链 —— 选错/失误留下 narrative 痕迹，不提高过关门槛 */

const MISTAKE_SIM_TYPES = new Set([
  'report',
  'checklist',
  'clickcard',
  'jira',
  'chat',
  'config',
  'template',
  'apiclient',
  'terminal',
])

export function shouldRecordMistake(simType) {
  return MISTAKE_SIM_TYPES.has(simType)
}

export function computeArtifactQuality(attempts, hintsUsed, mistakesOnLevel, jiraTier = null) {
  if (jiraTier === 'draft' || mistakesOnLevel > 0) return 'rough'
  if (jiraTier === 'excellent' && attempts === 1 && !hintsUsed) return 'excellent'
  if (mistakesOnLevel === 0 && attempts === 1 && !hintsUsed) return 'excellent'
  if (mistakesOnLevel === 0 && attempts <= 2) return 'good'
  return 'rough'
}

export function getArtifactQualityLabel(quality) {
  if (quality === 'excellent') return { text: '优秀存档', tone: 'ok' }
  if (quality === 'good') return { text: '合格存档', tone: 'neutral' }
  return { text: '待完善', tone: 'warn' }
}

function mistakes(progressStore, levelId) {
  return progressStore?.getLevelMistakes(levelId) || 0
}

function isRoughJiraArtifact(projectStore, projectId, levelId) {
  const art = projectStore?.getArtifact(projectId, levelId)
  return art?._meta?.jiraTier === 'draft' || art?._meta?.quality === 'rough'
}

function mergeEnvStatus(base, patches) {
  if (!patches?.length) return base
  const map = new Map(base.map((item) => [item.label, { ...item }]))
  for (const patch of patches) {
    map.set(patch.label, { ...map.get(patch.label), ...patch })
  }
  return [...map.values()]
}

function prependInbox(existing, extra) {
  if (!extra?.length) return existing
  const ids = new Set(existing.map((m) => m.id))
  const unique = extra.filter((m) => !ids.has(m.id))
  return [...unique, ...existing]
}

/**
 * 根据历史失误，为当前关卡注入 inbox / envStatus / 复盘旁白
 */
export function applyConsequences(levelId, { progressStore, projectStore }) {
  const inbox = []
  const envStatus = []

  const m1 = mistakes(progressStore, 1)
  const m2 = mistakes(progressStore, 2)
  const m3 = mistakes(progressStore, 3)
  const m4 = mistakes(progressStore, 4)
  const m6 = mistakes(progressStore, 6)
  const m7 = mistakes(progressStore, 7)
  const m8 = mistakes(progressStore, 8)
  const m9 = mistakes(progressStore, 9)
  const m21 = mistakes(progressStore, 21)

  // —— 登录模块 ——
  if (levelId === 2 && m1 > 0) {
    inbox.push({
      id: 'conseq-l2-prd',
      from: '产品经理林姐',
      avatar: '👩‍💼',
      time: '09:05',
      text: '测试点里好像漏了「记住密码」相关的安全项？补用例时对照 PRD 再核一遍，别只盯 happy path。',
      read: false,
    })
    envStatus.push({ label: 'PRD 评审', value: '需补安全维度', tone: 'warn' })
  }

  if (levelId === 3 && m2 > 0) {
    inbox.push({
      id: 'conseq-l3-case',
      from: '测试组长',
      avatar: '👩‍💼',
      time: '09:20',
      text: '用例表有两行预期写得偏笼统，执行时容易各测各的。今天提 Bug 前先把现象描述准。',
      read: false,
    })
  }

  if (levelId === 4 && (m3 > 0 || isRoughJiraArtifact(projectStore, 'login-module', 3))) {
    const bug = projectStore.getArtifact('login-module', 3)
    inbox.push({
      id: 'conseq-l4-jira',
      from: '王工',
      avatar: '👨‍💻',
      time: '08:50',
      text: `TEST-1003 我看了：${bug?.values?.summary || '验证码问题'}。预期/实际若能再具体点，回归会更快——今天手测窗口只有 2 小时。`,
      read: false,
    })
    envStatus.push({ label: 'TEST-1003', value: '描述待澄清', tone: 'warn' })
  }

  if (levelId === 5 && m4 > 0) {
    inbox.push({
      id: 'regression-miss',
      from: '运维告警',
      avatar: '🚨',
      time: '09:02',
      text: '昨晚灰度环境登录偶发异常——回归时漏掉了部分 FAIL 项。终面前务必 tail 日志确认 Auth 相关 ERROR。',
      read: false,
    })
    envStatus.push(
      { label: '登录成功率', value: '● 68%', tone: 'warn' },
      { label: '灰度版本', value: 'login-2.3.1', tone: 'warn' }
    )
  } else if (levelId === 5 && m4 === 0 && m3 === 0) {
    envStatus.push({ label: '登录成功率', value: '● 71% 回升中', tone: 'ok' })
  }

  // —— 支付模块 ——
  if (levelId === 7 && m6 > 0) {
    inbox.push({
      id: 'conseq-l7-config',
      from: '运维小陈',
      avatar: '🛠️',
      time: '10:05',
      text: '支付库地址昨天似乎改错过一次？今天排查到账通知时，顺手再确认 PAYMENT_DB_HOST 是否稳定。',
      read: false,
    })
    envStatus.push({ label: '支付沙箱', value: '● 偶发超时', tone: 'warn' })
  }

  if (levelId === 8 && m7 > 0) {
    inbox.push({
      id: 'conseq-l8-chat',
      from: '李工',
      avatar: '👨‍💻',
      time: '10:45',
      text: '昨天群里排查通知问题，你的回复里动作不够具体。今天补 TEST-1008 时，步骤写清楚「点什么、报什么错」。',
      read: false,
    })
  }

  if (levelId === 9 && (m8 > 0 || isRoughJiraArtifact(projectStore, 'payment-module', 8))) {
    inbox.push({
      id: 'conseq-l9-jira',
      from: '测试组长',
      avatar: '👩‍💼',
      time: '09:55',
      text: 'TEST-1008 信息补全后开发才合入。选发布分支前先看部署记录，别验到旧包。',
      read: false,
    })
    envStatus.push({ label: 'TEST-1008', value: '刚合入待验', tone: 'warn' })
  }

  if (levelId === 10 && m9 > 0) {
    inbox.push({
      id: 'conseq-l10-branch',
      from: '运维小陈',
      avatar: '🛠️',
      time: '17:10',
      text: '发布分支昨天核对有过偏差，日报里写清楚当前环境版本和 TEST-1008 关闭结论。',
      read: false,
    })
    envStatus.push({ label: '部署分支', value: '需二次确认', tone: 'warn' })
  }

  if (levelId === 10 && m21 > 0) {
    inbox.push({
      id: 'avatar-regression',
      from: '测试组长',
      avatar: '👩‍💼',
      time: '17:30',
      text: '个人中心小版本回归范围偏窄，头像 FAIL 项差点漏测。日报里记得突出高风险回归结论。',
      read: false,
    })
  }

  return { inbox, envStatus }
}

export function mergeStoryConsequences(levelId, story, { progressStore, projectStore }) {
  const { inbox, envStatus } = applyConsequences(levelId, {
    progressStore,
    projectStore,
  })

  return {
    ...story,
    inbox: prependInbox(story.inbox || [], inbox),
    envStatus: mergeEnvStatus(story.envStatus || [], envStatus),
  }
}

/** 通关复盘时的一句「职场余波」—— 纯叙事，不影响奖励 */
export function getPassDebriefNote(levelId, progressStore, projectStore = null) {
  const m4 = mistakes(progressStore, 4)
  const m9 = mistakes(progressStore, 9)
  const loginSut = projectStore?.getLoginSut?.('login-module') || {}

  if (levelId === 3) {
    if (loginSut.reproducedBug) {
      return '🔍 你先在 App 里复现了 -1 秒再写单——步骤和实际会好写很多。💼 工单已进 backlog；「合格」以上可少一轮来回。'
    }
    return '💼 工单已进 backlog。写「合格」以上可少一轮来回；草稿档也能过，但后面关卡的同事可能会催你补细节。'
  }
  if (levelId === 4 && loginSut.verifiedFix) {
    return '✅ App 上已确认倒计时恢复正常，回归勾选更有依据。💼 2 小时手测要聚焦「修了什么、哪里最容易连带出问题」。'
  }
  if (levelId === 7) {
    if (projectStore?.getPaymentSut?.('payment-module')?.callbackMiss) {
      return '🔍 你在 App 里复现了「支付成功但未收到通知」，企微回复会更有针对性。💼 协作排查先写清「查什么 + 请谁配合」。'
    }
    return '💼 到账通知问题往往出在回调地址或环境配置——回复里写具体动作，开发才跟得上。'
  }
  if (levelId === 8) {
    if (projectStore?.getPaymentSut?.('payment-module')?.payErrorReproduced) {
      return '🔍 先复现支付失败再补工单——步骤和实际会好写很多。💼 TEST-1008 补全后开发才能快速合入。'
    }
    if (mistakes(progressStore, 7) > 0) {
      return '💼 李工收工前回了个 👍。协作回复写清「查什么 + 请谁配合」，排查会快很多。'
    }
    return '🎫 TEST-1008 补全完毕。标题和步骤越具体，开发合入越快——也影响你能拿几颗星。'
  }
  if (levelId === 4 && mistakes(progressStore, 3) > 0) {
    return '💼 王工在群里点了赞，但提醒：下次 Bug 单把预期/实际写得更可复现，开发少问一轮。'
  }
  if (levelId === 5 && m4 > 0) {
    return '🧯 灰度有惊无险。组长说：回归范围漏项不扣进度，但线上值班时会放大——值得冲星重玩第 4 关。'
  }
  if (levelId === 5 && m4 === 0) {
    return '✨ 登录项目收官漂亮。Day 1–4 的档案会在后续剧本里继续派上用场。'
  }
  if (levelId === 12) {
    if (projectStore?.getOrderSut?.('order-module')?.bottleneckIdentified) {
      return '📈 你在 APM 里先锁定了 MySQL 800ms，再选瓶颈——这就是性能排查的日常节奏。'
    }
    return '💼 性能问题先看数据再下结论。P99 超时往往藏在最慢的那一段链路里。'
  }
  if (levelId === 22) {
    if (projectStore?.getOnboardSut?.('onboard-week2')?.prodSlowReproduced) {
      return '🔍 你在生产模拟器里复现了 4G 慢登录，TEST-1022 会好写很多。💼 线上 Bug 步骤要写网络环境。'
    }
    return '💼 线上 Bug 单别漏环境：4G/WiFi、预期响应时间、实际等待秒数都要写清。'
  }
  if (levelId === 23) {
    if (projectStore?.getOnboardSut?.('onboard-week2')?.logReviewed) {
      return '📋 先看摘要再 grep——值班时别对着整文件盲 tail。💼 ERROR 行与 TEST-1022 现象交叉验证。'
    }
    return '💼 grep 前先确认路径和关键字。AuthController timeout 可与用户 8 秒投诉对照。'
  }
  if (levelId === 9 && m8 > 0) {
    return '🎯 分支选对了吗？发布判断题错了不锁关，但验错分支等于白测——番外「CI 门禁」可练手感。'
  }
  if (levelId === 10 && m9 > 0) {
    return '📝 日报发出去了。运维备注：分支核对要养成习惯，笔试和入职都会考。'
  }
  return null
}

/** Jira backlog 随失误微调状态 */
export function patchJiraBacklog(levelId, base, { progressStore, projectStore }) {
  const list = base.map((item) => ({ ...item }))

  if (projectStore.hasArtifact('login-module', 3) && levelId === 4) {
    const rough =
      mistakes(progressStore, 3) > 0 || isRoughJiraArtifact(projectStore, 'login-module', 3)
    if (rough) {
      const item = list.find((i) => i.key === 'TEST-1003')
      if (item) item.status = 'Needs Info'
    }
  }

  if (levelId >= 8) {
    const item = list.find((i) => i.key === 'TEST-1008')
    if (item && levelId === 8) {
      const rough =
        mistakes(progressStore, 8) > 0 || isRoughJiraArtifact(projectStore, 'payment-module', 8)
      if (rough) {
        item.status = 'Needs Info'
        item.highlight = true
      }
    }
  }

  return list
}
