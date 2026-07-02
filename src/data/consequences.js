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
  'packet',
  'sqlclient',
  'redis',
  'cipipeline',
  'mockserver',
  'apmtrace',
  'gitrelease',
  'mqinbox',
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
  const m11 = mistakes(progressStore, 11)
  const m12 = mistakes(progressStore, 12)
  const m13 = mistakes(progressStore, 13)
  const m14 = mistakes(progressStore, 14)
  const m15 = mistakes(progressStore, 15)
  const m21 = mistakes(progressStore, 21)
  const m22 = mistakes(progressStore, 22)
  const m23 = mistakes(progressStore, 23)
  const m24 = mistakes(progressStore, 24)
  const m28 = mistakes(progressStore, 28)

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

  // —— 订单模块 ——
  if (levelId === 12 && m11 > 0) {
    inbox.push({
      id: 'conseq-l12-schedule',
      from: '项目经理',
      avatar: '📋',
      time: '10:00',
      text: '上次工时估算偏乐观，今天定位性能瓶颈时别把 Nginx 当首嫌——先看数据最大的那段。',
      read: false,
    })
    envStatus.push({ label: '订单 P99', value: '● 2.1s', tone: 'warn' })
  }

  if (levelId === 13 && m12 > 0) {
    inbox.push({
      id: 'conseq-l13-perf',
      from: '架构师老周',
      avatar: '🧑‍💻',
      time: '11:15',
      text: '链路里 MySQL 800ms 才是大头。框架选型别被「社区最火」带跑，看团队栈。',
      read: false,
    })
  }

  if (levelId === 14 && m13 > 0) {
    inbox.push({
      id: 'conseq-l14-framework',
      from: '测试组长',
      avatar: '👩‍💼',
      time: '09:40',
      text: '自动化框架选型和灰度监控是两件事——今天放量前务必盯支付成功率，别选 UI 像素当监控项。',
      read: false,
    })
  }

  if (levelId === 15 && m14 > 0) {
    inbox.push({
      id: 'conseq-l15-gray',
      from: 'SRE',
      avatar: '📡',
      time: '15:20',
      text: '灰度监控漏看支付成功率的话，P0 复盘写再漂亮也是事后诸葛亮。改进措施要具体、能执行。',
      read: false,
    })
  }

  if (levelId === 22 && m15 > 0) {
    inbox.push({
      id: 'conseq-l22-p0',
      from: '测试组长',
      avatar: '👩‍💼',
      time: '08:30',
      text: '上次 P0 复盘措施写太虚。今天线上 Bug 单步骤要写清 4G 环境，别又来「加强测试」。',
      read: false,
    })
    envStatus.push({ label: '线上登录 P99', value: '● 8s 投诉中', tone: 'warn' })
  }

  // —— 值班线 ——
  if (levelId === 23 && m22 > 0) {
    inbox.push({
      id: 'conseq-l23-jira',
      from: '王工',
      avatar: '👨‍💻',
      time: '09:10',
      text: 'TEST-1022 步骤里网络环境不够具体，grep 前先确认 error.log 路径，别 tail 错文件。',
      read: false,
    })
  }

  if (levelId === 24 && m23 > 0) {
    inbox.push({
      id: 'conseq-l24-grep',
      from: '运维',
      avatar: '🛠️',
      time: '10:25',
      text: '日志关键字 grep 偏了。升级 PM 前把 AuthController timeout 和 TEST-1022 现象对齐。',
      read: false,
    })
  }

  if (levelId === 25 && m24 > 0) {
    inbox.push({
      id: 'conseq-l25-escalate',
      from: 'PM',
      avatar: '👔',
      time: '16:00',
      text: '升级邮件缺影响面和 Blocker 状态。满月总结别流水账，写成果 + 踩坑 + 下月可交付目标。',
      read: false,
    })
  }

  if (levelId === 25 && m4 > 0 && m15 === 0) {
    inbox.push({
      id: 'conseq-l25-regression-echo',
      from: '系统提醒',
      avatar: '📎',
      time: '刚刚',
      text: '档案备注：备考阶段回归曾漏 FAIL 项——满月总结可反思「风险驱动回归」的实践。',
      read: true,
    })
  }

  // —— 进阶线 ——
  if (levelId === 29 && m28 > 0) {
    inbox.push({
      id: 'conseq-l29-review',
      from: '实习生小赵',
      avatar: '🧑‍🎓',
      time: '09:30',
      text: '谢谢 Review！我按您说的补了边界用例。今天 Bug 单您再帮我把标题改具体一点？',
      read: false,
    })
  }

  if (levelId === 31 && mistakes(progressStore, 7) > 0) {
    inbox.push({
      id: 'conseq-l31-callback-echo',
      from: '李工',
      avatar: '👨‍💻',
      time: '10:00',
      text: '又是回调地址问题？抓包先看 notify Host 是不是 prod——支付 Day 2 那关练过类似的。',
      read: false,
    })
  }

  if (levelId === 33 && (m15 > 0 || mistakes(progressStore, 12) > 0)) {
    inbox.push({
      id: 'conseq-l33-promo',
      from: 'SRE',
      avatar: '📡',
      time: '14:00',
      text: '大促 Go/No-Go：错误率比 P99 更要命。上次性能/复盘关有失误的话，今天决策务必看库存服务。',
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
  const m8 = mistakes(progressStore, 8)
  const m9 = mistakes(progressStore, 9)
  const loginSut = projectStore?.getLoginSut?.('login-module') || {}

  if (levelId === 3) {
    if (loginSut.reproducedBug) {
      return '先在 App 里复现问题，写工单会容易很多。工单已进入待办，信息越完整，开发来回越少。'
    }
    return '工单已进入待办。信息写全可以减少来回；草稿质量也能过关，但后面同事可能会催你补细节。'
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
    return '灰度有惊无险。组长说：回归范围漏项不扣进度，但线上值班时会放大——值得重玩第 4 关冲三星。'
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
  if (levelId === 28) {
    return '👩‍🏫 小赵去补用例了。带人时指出缺口 + 给示范场景，比代写更能涨战力。'
  }
  if (levelId === 31) {
    return '🔍 回调 Host 指向 prod——经典坑。抓包 + 配置中心双核对，比猜代码快十倍。'
  }
  if (levelId === 33) {
    return '🎯 Go/No-Go 写进邮件存档。错误率超 SLO 时 No-Go 不是怂，是对用户负责。'
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
