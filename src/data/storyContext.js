import { levels } from './levels'
import { mergeStoryConsequences, patchJiraBacklog } from './consequences'

export function getStoryContext(levelId, projectStore, progressStore = null) {
  const level = levels.find((l) => l.id === levelId)
  if (!level) return { inbox: [], envStatus: [], chatHistory: [] }

  const ctx = STORY_BY_LEVEL[levelId] || {}
  const inbox = [...(ctx.inbox || [])]

  if (level.projectId && level.projectDay > 1) {
    const prevArtifacts = levels
      .filter(
        (l) =>
          l.projectId === level.projectId &&
          l.projectDay < level.projectDay &&
          projectStore.hasArtifact(level.projectId, l.id)
      )
      .map((l) => l.projectDay)

    if (prevArtifacts.length && ctx.inbox) {
      inbox.unshift({
        id: 'sys-context',
        from: '系统',
        avatar: '📎',
        time: '刚刚',
        text: `项目档案已同步：Day ${prevArtifacts.join('、')} 产出可在左侧 Dock 查看。`,
        read: true,
      })
    }
  }

  if (levelId === 4 && projectStore.hasArtifact('login-module', 3)) {
    const bug = projectStore.getArtifact('login-module', 3)
    inbox.unshift({
      id: 'dev-fix',
      from: '王工',
      avatar: '👨‍💻',
      time: '08:45',
      text: `TEST-1003 已修复并合入：${bug.values?.summary || '验证码倒计时问题'}。请安排回归。`,
      read: false,
    })
  }

  if (levelId === 9 && projectStore.hasArtifact('payment-module', 8)) {
    inbox.unshift({
      id: 'ops-deploy',
      from: '运维小陈',
      avatar: '🛠️',
      time: '10:12',
      text: '支付测试环境昨晚完成部署，请对照发布计划确认当前运行分支是否正确。',
      read: false,
    })
  }

  if (levelId === 19 && progressStore?.completedLevelIds?.includes(18)) {
    inbox.unshift({
      id: 'hr-pass',
      from: 'HR 张女士',
      avatar: '👩‍💼',
      time: '14:25',
      text: 'HR 面过了，技术面试官马上接入——策略题别慌，讲优先级和取舍。',
      read: true,
    })
  }

  if (levelId === 21 && progressStore?.completedLevelIds?.includes(20)) {
    inbox.unshift({
      id: 'written-next',
      from: '用人经理 · 张工',
      avatar: '👨‍💻',
      time: '15:45',
      text: '计算题提交了。下一道分析题：小版本只改头像上传，2 小时手测怎么圈回归？',
      read: true,
    })
  }

  if (levelId === 26 && progressStore?.completedLevelIds?.includes(16)) {
    inbox.unshift({
      id: 'drill-assert',
      from: '导师 · 老王',
      avatar: '🧑‍💼',
      time: '19:30',
      text: '加练 2 接上：上次圈了接口维度，这次对着李工发的两份响应样本写断言。',
      read: true,
    })
  }

  if (levelId === 35 && projectStore.hasArtifact('login-module', 34)) {
    inbox.unshift({
      id: 'captcha-done',
      from: '带教 · 小陈',
      avatar: '👩‍🏫',
      time: '09:28',
      text: '验证码测试点收到了。Day 7 把锁定/解锁场景预期补全，别和图形验证码规则搞混。',
      read: true,
    })
  }

  if (levelId === 44 && progressStore?.completedLevelIds?.includes(49)) {
    inbox.unshift({
      id: 'refund-done',
      from: '组长 · 阿Ken',
      avatar: '🧑‍🔧',
      time: '11:28',
      text: '退款状态机过了。接口断言是最后一题：200/404 两场景都要写清楚。',
      read: true,
    })
  } else if (levelId === 44 && projectStore.hasArtifact('order-module', 43)) {
    inbox.unshift({
      id: 'fsm-done',
      from: '组长 · 阿Ken',
      avatar: '🧑‍🔧',
      time: '11:25',
      text: '状态机题对了。接口断言是 Day 10 交付，200/404 两场景都要写清楚。',
      read: true,
    })
  }

  if (levelId === 46 && progressStore?.completedLevelIds?.includes(23)) {
    inbox.unshift({
      id: 'grep-done',
      from: '测试组长',
      avatar: '👩‍💼',
      time: '03:15',
      text: 'grep 结果看到了。用户还在复现，切 tail -f 实时盯 error.log。',
      read: true,
    })
  }

  if (levelId === 51 && progressStore?.completedLevelIds?.includes(14)) {
    inbox.unshift({
      id: 'gray-spike',
      from: '运维小陈',
      avatar: '🛠️',
      time: '22:40',
      text: '灰度 5% 第 2 小时创建接口错误率 2.4%，你 Day 4 定的监控清单里这项超阈值了——拍板要不要继续放量。',
      read: false,
    })
  }

  if (levelId === 50 && progressStore?.completedLevelIds?.includes(15)) {
    inbox.unshift({
      id: 'sms-p0',
      from: '组长 · 阿Ken',
      avatar: '🧑‍🔧',
      time: '14:10',
      text: '短信网关超时 5 分钟，比上周缓存 P0 轻，但复盘格式一样——3 条可落地改进，别写「加强测试」。',
      read: true,
    })
  }

  if (levelId === 49 && progressStore?.completedLevelIds?.includes(43)) {
    inbox.unshift({
      id: 'refund-fsm',
      from: '产品经理',
      avatar: '📋',
      time: '10:35',
      text: '退款需求评审过了：已支付→退款中→已退款。接着练一题——哪些流转不合法。',
      read: true,
    })
  }

  if (levelId === 28 && progressStore?.completedLevelIds?.includes(35)) {
    inbox.unshift({
      id: 'review-spiral',
      from: '测试总监 · 周总',
      avatar: '🚀',
      time: '09:02',
      text: '小赵的用例缺锁定/边界——对照你培训营 Day 7 的锁定场景，指出缺口并给可写进用例表的建议。',
      read: true,
    })
  }

  const jiraBacklog = patchJiraBacklog(levelId, buildJiraBacklog(levelId, projectStore), {
    progressStore,
    projectStore,
  })

  const merged = mergeStoryConsequences(
    levelId,
    {
      inbox,
      envStatus: ctx.envStatus || [],
      chatHistory: ctx.chatHistory || [],
      chatReply: ctx.chatReply || '',
      chatManagerReply: ctx.chatManagerReply || '',
      prdContent: ctx.prdContent || '',
      jiraMode: ctx.jiraMode || 'create',
      jiraDraft: ctx.jiraDraft || null,
      jiraBacklog,
      clickVariant: ctx.clickVariant || 'default',
      configCorrectValue: level.correctValue,
    },
    { progressStore, projectStore }
  )

  return merged
}

function buildJiraBacklog(levelId, projectStore) {
  const base = [
    {
      key: 'TEST-1001',
      summary: '登录页偶发 502',
      status: 'Done',
      module: '登录',
      assignee: '王工',
    },
    {
      key: 'TEST-1002',
      summary: '记住密码明文存储风险',
      status: 'Open',
      module: '登录',
      assignee: '待分配',
    },
  ]

  if (projectStore.hasArtifact('login-module', 3)) {
    const v = projectStore.getArtifact('login-module', 3).values
    base.unshift({
      key: 'TEST-1003',
      summary: v?.summary || '验证码倒计时显示 -1 秒',
      status: levelId >= 4 ? 'Ready for QA' : 'In Progress',
      module: '登录',
      assignee: '王工',
    })
  }

  if (levelId >= 8) {
    base.unshift({
      key: 'TEST-1008',
      summary: '支付失败了',
      status: 'Needs Info',
      module: '支付',
      assignee: '你',
      highlight: levelId === 8,
    })
  }

  if (projectStore.hasArtifact('payment-module', 8) && levelId > 8) {
    const v = projectStore.getArtifact('payment-module', 8).values
    const item = base.find((i) => i.key === 'TEST-1008')
    if (item) {
      item.summary = v?.summary || item.summary
      item.status = levelId >= 10 ? 'Done' : 'Ready for QA'
    }
  }

  return base
}

const STORY_BY_LEVEL = {
  1: {
    prdContent: `【登录模块 PRD v0.3 · 产品：林姐】

用户可通过手机号或邮箱登录。
- 密码错误 5 次锁定账号
- 支持「记住密码」
- 登录成功后跳转首页

⚠️ 未提供原型图，细节待确认。`,
    inbox: [
      {
        id: 'pm-prd',
        from: '产品经理林姐',
        avatar: '👩‍💼',
        time: '09:00',
        text: '登录 PRD 发你了，今天下班前圈一下测试点，有疑问企微找我。',
        read: false,
      },
    ],
    envStatus: [{ label: '需求文档', value: 'PRD v0.3', tone: 'neutral' }],
  },
  2: {
    inbox: [
      {
        id: 'pm-cases',
        from: '产品经理林姐',
        avatar: '👩‍💼',
        time: '09:15',
        text: '测试点收到了。用例表里缺的几行麻烦今天补完，规则就按 PRD 来。',
        read: false,
      },
    ],
    envStatus: [
      { label: '用例库', value: '登录模块 v2', tone: 'neutral' },
      { label: '待补行数', value: '4 行', tone: 'warn' },
    ],
  },
  3: {
    inbox: [
      {
        id: 'qa-bug',
        from: '测试系统',
        avatar: '🔔',
        time: '14:20',
        text: '自动化用例失败：获取验证码倒计时显示 -1 秒。请提交 Jira。',
        read: false,
      },
    ],
    envStatus: [
      { label: '测试环境', value: '● 在线', tone: 'ok' },
      { label: '当前模块', value: '登录', tone: 'neutral' },
    ],
    jiraMode: 'create',
  },
  4: {
    inbox: [
      {
        id: 'regression-report',
        from: '带教 · 小陈',
        avatar: '👩‍🏫',
        time: '09:00',
        text: 'TEST-1003 修完 CI 报告出来了。你只有 2 小时手测，勾选必须回归的高风险用例。',
        read: false,
      },
    ],
    envStatus: [
      { label: 'CI 流水线', value: '#428 已完成', tone: 'ok' },
      { label: '手测窗口', value: '2 小时', tone: 'warn' },
    ],
  },
  5: {
    inbox: [
      {
        id: 'alert',
        from: '监控告警',
        avatar: '🚨',
        time: '09:05',
        text: 'auth-server 登录接口成功率 < 70%，请 SSH 上机查 /var/log/app/error.log。',
        read: false,
      },
    ],
    envStatus: [
      { label: 'auth-server', value: '● SSH 已连接', tone: 'ok' },
      { label: '灰度版本', value: 'login-2.3.1', tone: 'neutral' },
    ],
  },
  6: {
    inbox: [
      {
        id: 'ops-config',
        from: '运维小陈',
        avatar: '🛠️',
        time: '09:30',
        text: '支付沙箱接入说明：PAYMENT_DB_HOST 勿用文档占位符 127.0.0.1，测试库填 10.0.1.5。改完保存，再点「测试连接」验证。',
        read: false,
      },
    ],
    envStatus: [
      { label: '支付沙箱', value: '○ 未连通', tone: 'error' },
      { label: '网关', value: 'sandbox.pay.example.com', tone: 'neutral' },
    ],
  },
  7: {
    chatHistory: [
      {
        sender: '李工',
        avatar: '👨‍💻',
        role: 'other',
        text: '你们测试环境付完款后收不到到账通知吧？我本地试是能收到的，估计是测试环境的通知地址没配对。',
        time: '10:18',
      },
      {
        sender: '测试组长',
        avatar: '👩‍💼',
        role: 'other',
        text: '@你 帮忙跟一下，测试环境付完款收不到通知，进度卡在这了。',
        time: '10:19',
      },
    ],
    chatReply: '行，你先对一下测试环境的回调地址，有需要我配合抓包或看日志。',
    chatManagerReply: '好，跟李工把方案对齐，有进展群里同步。',
    inbox: [
      {
        id: 'chat-mention',
        from: '测试组长',
        avatar: '👩‍💼',
        time: '10:19',
        text: '企微群 @你了：测试环境付完款收不到通知，李工说本地正常，请你回复并推动一起排查。',
        read: false,
      },
    ],
    envStatus: [
      { label: '支付沙箱', value: '● 已连通', tone: 'ok' },
      { label: '到账通知', value: '× 测试环境未收到', tone: 'error' },
    ],
  },
  8: {
    jiraMode: 'edit',
    jiraDraft: {
      summary: '支付失败了',
      severity: '',
      module: '',
      steps: '点支付就报错',
      expected: '',
      actual: '报错',
    },
    inbox: [
      {
        id: 'newbie-bug',
        from: '新人小刘',
        avatar: '🧑‍🎓',
        time: '11:00',
        text: '我提了个 Bug TEST-1008，但李工说信息不够，麻烦帮忙补全 🙏',
        read: false,
      },
    ],
    envStatus: [{ label: '待处理工单', value: 'TEST-1008', tone: 'warn' }],
  },
  9: {
    clickVariant: 'git',
    inbox: [
      {
        id: 'release-branch',
        from: '测试组长',
        avatar: '👩‍💼',
        time: '10:00',
        text: '支付测试环境昨晚部署了，对照发布计划确认当前运行分支是否正确。',
        read: false,
      },
    ],
    envStatus: [
      { label: '部署环境', value: 'payment-test', tone: 'neutral' },
      { label: '上次部署', value: '昨天 23:40', tone: 'neutral' },
    ],
  },
  10: {
    inbox: [
      {
        id: 'daily',
        from: '测试组长',
        avatar: '👩‍💼',
        time: '17:30',
        text: '支付模块日报发飞书，TEST-1008 状态写清楚。',
        read: false,
      },
    ],
    envStatus: [
      { label: '本周用例', value: '80/80 执行', tone: 'ok' },
      { label: 'TEST-1008', value: '已关闭', tone: 'ok' },
    ],
  },
  11: {
    inbox: [
      {
        id: 'pm-estimate',
        from: '项目经理',
        avatar: '👩‍💼',
        time: '09:00',
        text: '订单模块下周提测，今天给个测试工时评估，用数据说话。',
        read: false,
      },
    ],
    envStatus: [
      { label: '订单模块', value: '待排期', tone: 'warn' },
      { label: '用例规模', value: '5×40 条', tone: 'neutral' },
    ],
  },
  12: {
    inbox: [
      {
        id: 'apm-alert',
        from: '监控告警',
        avatar: '🚨',
        time: '11:20',
        text: '订单创建接口 P99 > 3s，APM 链路数据已就绪，请定位瓶颈。',
        read: false,
      },
    ],
    envStatus: [
      { label: 'APM', value: '● 采集中', tone: 'ok' },
      { label: 'P99', value: '3.2s', tone: 'error' },
    ],
    clickVariant: 'trace',
  },
  13: {
    inbox: [
      {
        id: 'auto-plan',
        from: '测试组长',
        avatar: '👩‍💼',
        time: '14:00',
        text: '订单自动化方案今天定一下，考虑团队 Java 栈和学习成本。',
        read: false,
      },
    ],
    envStatus: [
      { label: '技术栈', value: 'Java + Spring Boot', tone: 'neutral' },
      { label: '候选方案', value: '3 套待选', tone: 'warn' },
    ],
  },
  14: {
    inbox: [
      {
        id: 'gray',
        from: '运维小陈',
        avatar: '🛠️',
        time: '16:00',
        text: '订单 v3.0 今晚灰度 5%，请确认监控指标清单。',
        read: false,
      },
    ],
    envStatus: [
      { label: '灰度比例', value: '5%', tone: 'warn' },
      { label: 'QPS', value: '1000', tone: 'neutral' },
    ],
  },
  15: {
    inbox: [
      {
        id: 'p0',
        from: 'CTO',
        avatar: '👔',
        time: '18:00',
        text: '订单 P0 复盘材料今晚提交，3 条可落地的改进措施。',
        read: false,
      },
    ],
    envStatus: [
      { label: '事故等级', value: 'P0', tone: 'error' },
      { label: '宕机时长', value: '30 min', tone: 'error' },
    ],
  },
  16: {
    prdContent: `【接口说明 · POST /api/login · 开发：李工】

URL: https://test.example.com/api/login
Content-Type: application/json

请求体：username、password 必填
响应：200 含 token；401 密码错；400 缺参/非法`,
    inbox: [
      {
        id: 'drill-api',
        from: '导师 · 老王',
        avatar: '🧑‍💼',
        time: '19:00',
        text: '加练 1：登录接口调通了不算完——状态码、响应体、异常场景，勾选必验项。',
        read: false,
      },
    ],
    envStatus: [
      { label: '备考进度', value: '接口专项', tone: 'neutral' },
      { label: '接口', value: 'POST /api/login', tone: 'neutral' },
    ],
  },
  17: {
    inbox: [
      {
        id: 'drill-boundary',
        from: '导师 · 老王',
        avatar: '🧑‍💼',
        time: '19:10',
        text: '加练 3：年龄 1–120，空值、0、121 各写一条预期——边界值笔试必考。',
        read: false,
      },
    ],
    envStatus: [
      { label: '备考进度', value: '边界值专项', tone: 'neutral' },
      { label: '合法范围', value: '1–120 整数', tone: 'neutral' },
    ],
  },
  26: {
    inbox: [
      {
        id: 'dev-samples',
        from: '李工',
        avatar: '👨‍💻',
        time: '19:30',
        text: '两份真实响应样本发你了：成功 200 和密码错 401。写清楚测试应断言的 status 和 body 要点。',
        read: false,
      },
    ],
    envStatus: [
      { label: '接口', value: 'POST /api/login', tone: 'neutral' },
      { label: '样本', value: '200 / 401 各一份', tone: 'neutral' },
    ],
  },
  27: {
    prdContent: `【接口说明 · POST /api/login】

URL: https://test.example.com/api/login
Content-Type: application/json

请求体：
{
  "username": "string，必填",
  "password": "string，必填"
}

响应约定：
· 成功：HTTP 200，body 含 token
· 密码错误：HTTP 401，body 含 code / message
· 缺参/非法：HTTP 400，message 说明原因`,
    inbox: [
      {
        id: 'written-api',
        from: '用人经理 · 张工',
        avatar: '👨‍💻',
        time: '15:00',
        text: '笔试接口设计题：左侧是说明，勾选登录接口必须覆盖的用例场景——接口层，不是 UI。',
        read: false,
      },
    ],
    envStatus: [
      { label: '笔试', value: '接口设计题', tone: 'neutral' },
      { label: '时限', value: '25 分钟', tone: 'warn' },
    ],
  },
  18: {
    chatHistory: [
      {
        sender: 'HR 张女士',
        avatar: '👩‍💼',
        role: 'other',
        text: '你好，欢迎参加我们公司的测试岗位终面。先聊聊：你为什么想做软件测试？',
        time: '14:00',
      },
    ],
    chatReply: '表达挺清晰的，有关注质量的用户视角，这是测试需要的。',
    inbox: [
      {
        id: 'hr-welcome',
        from: '就业顾问 · Lily',
        avatar: '💼',
        time: '13:50',
        text: '终面 HR 环节开始了，别背标准答案，结合你登录模块练习经历说真心话。',
        read: false,
      },
    ],
    envStatus: [{ label: '面试进度', value: 'HR 面进行中', tone: 'warn' }],
  },
  19: {
    inbox: [
      {
        id: 'tech-strategy',
        from: '技术面试官 · 赵工',
        avatar: '👨‍💻',
        time: '14:30',
        text: '策略题：明天就要上线，只给 4 小时测试——你怎么安排？考的是优先级，不是胆量。',
        read: false,
      },
    ],
    envStatus: [
      { label: '面试进度', value: '技术面 · 策略题', tone: 'warn' },
      { label: '剩余时间', value: '4 小时', tone: 'error' },
    ],
  },
  20: {
    inbox: [
      {
        id: 'written-calc',
        from: '用人经理 · 张工',
        avatar: '👨‍💻',
        time: '15:00',
        text: '笔试计算题：150 条用例发现 6 个有效 Bug，算缺陷密度（Bug 数 ÷ 用例数 × 100%）。',
        read: false,
      },
    ],
    envStatus: [
      { label: '笔试', value: '缺陷密度计算', tone: 'neutral' },
      { label: '数据', value: '150 用例 · 6 Bug', tone: 'neutral' },
    ],
  },
  21: {
    inbox: [
      {
        id: 'written-regression',
        from: '用人经理 · 张工',
        avatar: '👨‍💻',
        time: '15:40',
        text: '分析题：个人中心 v2.1 只改了头像上传，自动化报告如下——2 小时手测，圈必须回归项。',
        read: false,
      },
    ],
    envStatus: [
      { label: '笔试', value: '回归范围分析', tone: 'neutral' },
      { label: '手测时限', value: '2 小时', tone: 'warn' },
    ],
  },
  22: {
    inbox: [
      {
        id: 'cs-escalate',
        from: '客服小美',
        avatar: '🎧',
        time: '11:20',
        text: '用户反馈 4G 下登录要等 8 秒，已录工单，请测试跟进 TEST-1022。',
        read: false,
      },
      {
        id: 'oncall-start',
        from: 'On-call 手册',
        avatar: '📋',
        time: '11:22',
        text: '值班周开始了：线上用户反馈优先，先提 Bug 单再 SSH 排查，别跳过记录。',
        read: false,
      },
    ],
    envStatus: [
      { label: '环境', value: '生产', tone: 'error' },
      { label: 'TEST-1022', value: '待提交', tone: 'warn' },
    ],
  },
  23: {
    inbox: [
      {
        id: 'dev-log',
        from: '李工',
        avatar: '👨‍💻',
        time: '15:40',
        text: 'TEST-1022 你看下 auth error.log，ERROR 不少，grep 筛一下先。',
        read: false,
      },
    ],
    envStatus: [
      { label: 'auth-server', value: '● SSH 已连接', tone: 'ok' },
      { label: 'TEST-1022', value: '排查中', tone: 'warn' },
    ],
  },
  24: {
    chatHistory: [
      {
        sender: '测试组长',
        avatar: '👩‍💼',
        role: 'other',
        text: '支付 Bug 还没关，周五上线有风险。你直接在发布群跟 PM 说清楚阻塞。',
        time: '16:05',
      },
    ],
    chatReply: '收到，我去协调开发优先级，今晚前给结论。',
    inbox: [
      {
        id: 'release-risk',
        from: '测试组长',
        avatar: '👩‍💼',
        time: '16:05',
        text: '发布群等你升级支付阻塞，@PM 林姐说明风险。',
        read: false,
      },
    ],
    envStatus: [
      { label: '距上线', value: '2 天', tone: 'error' },
      { label: '支付 Bug', value: '未关闭', tone: 'error' },
    ],
  },
  25: {
    inbox: [
      {
        id: 'month-review',
        from: '测试组长',
        avatar: '👩‍💼',
        time: '17:00',
        text: '满月了，写份简短总结发我：成果、踩坑、下月计划。不用长，说重点。',
        read: false,
      },
    ],
    envStatus: [
      { label: '入职天数', value: '30 天', tone: 'ok' },
      { label: '职级', value: '随 XP 成长', tone: 'neutral' },
    ],
  },
  28: {
    inbox: [
      {
        id: 'intern-cases',
        from: '实习生小赵',
        avatar: '🧑‍🎓',
        time: '09:00',
        text: '姐/哥，我交了登录用例初稿，麻烦帮忙 Review 一下，边界场景我可能漏了…',
        read: false,
      },
      {
        id: 'lead-brief',
        from: '测试总监 · 周总',
        avatar: '🚀',
        time: '09:05',
        text: 'Lead 线第一周：带新人从 Review 用例开始。指出缺什么、建议补什么，别只写「不合格」。',
        read: false,
      },
    ],
    envStatus: [
      { label: '带教任务', value: 'Review 用例', tone: 'neutral' },
      { label: '新人稿件', value: '登录用例 v0.1', tone: 'warn' },
    ],
  },
  29: {
    inbox: [
      {
        id: 'intern-bug',
        from: '实习生小赵',
        avatar: '🧑‍🎓',
        time: '10:15',
        text: 'Bug 单我提交了，标题可能写得不太清楚…您能帮我把关一下吗？',
        read: false,
      },
    ],
    envStatus: [
      { label: '带教任务', value: '批改 Bug 单', tone: 'neutral' },
      { label: '当前标题', value: '「页面有问题」', tone: 'error' },
    ],
  },
  30: {
    inbox: [
      {
        id: 'pm-schedule',
        from: '项目经理',
        avatar: '📋',
        time: '11:00',
        text: '订单大改版下周提测，6 个模块各 50 条用例。帮算一下需要几人日，周五前要排期。',
        read: false,
      },
    ],
    envStatus: [
      { label: '用例总量', value: '6×50 = 300 条', tone: 'neutral' },
      { label: '效率假设', value: '8h/天 · 12 条/h', tone: 'neutral' },
    ],
  },
  31: {
    inbox: [
      {
        id: 'pay-callback',
        from: '李工',
        avatar: '👨‍💻',
        time: '14:30',
        text: '测试环境支付成功但订单 pending，我怀疑回调。Charles 会话导出了，帮看哪条请求有问题。',
        read: false,
      },
    ],
    envStatus: [
      { label: '订单 8821', value: 'pending', tone: 'warn' },
      { label: '抓包工具', value: 'Charles 已导出', tone: 'ok' },
    ],
  },
  32: {
    inbox: [
      {
        id: 'sec-audit',
        from: '安全组',
        avatar: '🛡️',
        time: '09:30',
        text: '用户中心联合审计下午开始。测试侧请准备鉴权、脱敏、导出审计相关用例清单。',
        read: false,
      },
    ],
    envStatus: [
      { label: '审计类型', value: '联合安全审计', tone: 'warn' },
      { label: '测试代表', value: '你', tone: 'neutral' },
    ],
  },
  33: {
    inbox: [
      {
        id: 'promo-go',
        from: 'SRE',
        avatar: '📡',
        time: '15:00',
        text: '压测报告出来了：P99 480ms，但库存服务错误率 2.1%。需要你给 Go/No-Go 建议，抄送 PM。',
        read: false,
      },
    ],
    envStatus: [
      { label: '下单 P99', value: '480ms ✓', tone: 'ok' },
      { label: '库存错误率', value: '2.1% ✗', tone: 'error' },
    ],
  },
  34: {
    prdContent: `【登录模块 PRD 补充 v0.4 · 产品：林姐】

登录页新增图形验证码：
- 4 位字母数字，60 秒自动刷新
- 连续输错 3 次，锁定 15 分钟
- 区分大小写；过期后旧码不可复用
- 锁定期间即使验证码正确也不可登录

⚠️ 开发已开始联调，测试点今天圈出来。`,
    inbox: [
      {
        id: 'pm-captcha',
        from: '产品经理林姐',
        avatar: '👩‍💼',
        time: '09:20',
        text: '验证码需求补进 PRD 了，Day 6 作业：圈首轮必测点，别漏锁定和过期逻辑。',
        read: false,
      },
    ],
    envStatus: [
      { label: '需求文档', value: 'PRD v0.4 补充', tone: 'neutral' },
      { label: '联调进度', value: '开发 60%', tone: 'warn' },
    ],
  },
  35: {
    inbox: [
      {
        id: 'mentor-lock',
        from: '带教 · 小陈',
        avatar: '👩‍🏫',
        time: '09:30',
        text: '锁定规则用例表还有 3 行空着，按「5 次锁 30 分钟」把预期补全，下班前发我。',
        read: false,
      },
    ],
    envStatus: [
      { label: '用例库', value: '登录锁定 v1', tone: 'neutral' },
      { label: '待补场景', value: '3 行', tone: 'warn' },
    ],
  },
  36: {
    inbox: [
      {
        id: 'drill-equiv',
        from: '导师 · 老王',
        avatar: '🧑‍💼',
        time: '19:00',
        text: '加练 4：注册页手机号等价类，把空值、位数、非法字符的预期写清楚——笔试常考。',
        read: false,
      },
    ],
    envStatus: [
      { label: '备考进度', value: '等价类专项', tone: 'neutral' },
      { label: '规则', value: '11 位 · 1 开头', tone: 'neutral' },
    ],
  },
  37: {
    inbox: [
      {
        id: 'drill-http',
        from: '导师 · 老王',
        avatar: '🧑‍💼',
        time: '19:15',
        text: '加练 5：接口返回码别只会记数字——密码错该 401 还是 200+body？选最合理的。',
        read: false,
      },
    ],
    envStatus: [
      { label: '备考进度', value: 'HTTP 状态码', tone: 'neutral' },
      { label: '接口', value: 'POST /api/login', tone: 'neutral' },
    ],
  },
  38: {
    inbox: [
      {
        id: 'sec-checklist',
        from: '安全组',
        avatar: '🛡️',
        time: '10:00',
        text: '登录接口上线前安全清单发你了：注入、限流、HTTPS、信息泄露——勾选必测项提交。',
        read: false,
      },
    ],
    envStatus: [
      { label: '安全评审', value: '待提交清单', tone: 'warn' },
      { label: '目标接口', value: 'POST /api/login', tone: 'neutral' },
    ],
  },
  39: {
    chatHistory: [
      {
        sender: '技术总监 · 周总',
        avatar: '🚀',
        role: 'other',
        text: '你好，欢迎终面。先用一分钟介绍一下你自己，以及为什么适合测试岗位。',
        time: '14:00',
      },
    ],
    chatReply: '嗯，这样清楚多了。继续下一题。',
    inbox: [
      {
        id: 'final-intro',
        from: 'HR 张女士',
        avatar: '👩‍💼',
        time: '13:55',
        text: '周总在线了，开场自我介绍别背稿，结合你登录模块练习经历说。',
        read: false,
      },
    ],
    envStatus: [{ label: '面试进度', value: '终面 · 自我介绍', tone: 'warn' }],
  },
  40: {
    inbox: [
      {
        id: 'interview-box',
        from: '技术总监 · 周总',
        avatar: '🚀',
        time: '14:05',
        text: '概念题：给你一段代码，你会优先黑盒还是白盒？什么情况下必须看代码？',
        read: false,
      },
    ],
    envStatus: [{ label: '面试进度', value: '技术面 · 方法论', tone: 'warn' }],
  },
  41: {
    inbox: [
      {
        id: 'interview-smoke',
        from: '技术总监 · 周总',
        avatar: '🚀',
        time: '14:12',
        text: '策略题：新版本首次进测试环境，只有 2 小时，800 条用例跑不完——你怎么安排冒烟？',
        read: false,
      },
    ],
    envStatus: [
      { label: '面试进度', value: '技术面 · 策略题', tone: 'warn' },
      { label: '用例规模', value: '800 条 / 2h', tone: 'neutral' },
    ],
  },
  42: {
    prdContent: `【支付回调说明 · 架构组】

支付成功后异步通知商户：
- 回调 URL 按环境配置（测试 / 生产不可混用）
- 请求带签名，商户侧需验签
- 失败重试最多 3 次，间隔指数退避
- 同一笔订单重复回调需幂等，状态不可重复变更
- 超时未收到回调时，订单终态以查单接口为准

⚠️ 笔试加试：除「能收到通知」外，圈出必测维度。`,
    inbox: [
      {
        id: 'written-callback',
        from: '用人经理 · 张工',
        avatar: '👨‍💻',
        time: '15:30',
        text: '笔试加试 4：支付回调不是测个 200 就完事，把环境、重试、验签、幂等都圈出来。',
        read: false,
      },
    ],
    envStatus: [
      { label: '笔试', value: '支付回调设计题', tone: 'neutral' },
      { label: '时限', value: '30 分钟', tone: 'warn' },
    ],
  },
  43: {
    prdContent: `【订单状态机 v2.1 · 订单组】

合法状态：待支付 → 已支付 → 已发货 → 已完成
· 待支付可取消 → 已取消
· 已支付不可回退待支付
· 取消仅允许在待支付态`,
    inbox: [
      {
        id: 'order-fsm',
        from: '组长 · 阿Ken',
        avatar: '🧑‍🔧',
        time: '10:00',
        text: '订单状态机文档更新了，Day 6 加练：找出不符合规则的流转，别放过「已支付回退待支付」这种。',
        read: false,
      },
    ],
    envStatus: [
      { label: '订单模块', value: '状态机 v2.1', tone: 'neutral' },
      { label: '合法路径', value: '待支付→已支付→…', tone: 'ok' },
    ],
    clickVariant: 'trace',
  },
  44: {
    prdContent: `【接口说明 · GET /api/order/{id} · 李工】

正常：HTTP 200，body 含 id、status、amount、items
不存在：HTTP 404，body 含 code、message`,
    inbox: [
      {
        id: 'order-api',
        from: '李工',
        avatar: '👨‍💻',
        time: '11:30',
        text: 'GET /api/order/{id} 联调好了，样本在 API 调试里。把 200 和 404 两场景的断言要点写清楚。',
        read: false,
      },
    ],
    envStatus: [
      { label: '接口', value: 'GET /api/order/8821', tone: 'neutral' },
      { label: '联调环境', value: 'order-test', tone: 'ok' },
    ],
  },
  45: {
    inbox: [
      {
        id: 'pager',
        from: 'PagerDuty',
        avatar: '🚨',
        time: '03:02',
        text: '【P1】登录成功率 < 85% 持续 5 分钟。你是 tonight on-call，勾选首轮必做排查项。',
        read: false,
      },
      {
        id: 'oncall-handbook',
        from: 'On-call 手册',
        avatar: '📋',
        time: '03:03',
        text: '顺序：确认告警仍在 → 查最近发布 → 看日志/监控 → 尝试复现。别跳过诊断直接改代码。',
        read: false,
      },
    ],
    envStatus: [
      { label: 'on-call', value: '● 值班中', tone: 'error' },
      { label: '登录成功率', value: '82%', tone: 'error' },
    ],
  },
  46: {
    inbox: [
      {
        id: 'dev-tailf',
        from: '李工',
        avatar: '👨‍💻',
        time: '03:18',
        text: 'TEST-1022 用户还在复现，grep 过了。你 tail -f error.log 守着，有新 ERROR 截图发群。',
        read: false,
      },
    ],
    envStatus: [
      { label: 'auth-server', value: '● SSH 已连接', tone: 'ok' },
      { label: 'TEST-1022', value: '实时跟踪中', tone: 'warn' },
    ],
  },
  47: {
    inbox: [
      {
        id: 'intern-assign',
        from: '实习生小赵',
        avatar: '🧑‍🎓',
        time: '09:00',
        text: '哥/姐，大版本登录回归任务怎么分？我怕漏场景，您写个范围我照着做。',
        read: false,
      },
      {
        id: 'pm-deadline',
        from: '项目经理',
        avatar: '📋',
        time: '09:05',
        text: '周五提测前登录回归必须闭环，任务说明写清楚范围和交付标准再分给小赵。',
        read: false,
      },
    ],
    envStatus: [
      { label: '带教任务', value: '分派回归', tone: 'neutral' },
      { label: '截止', value: '周五 18:00', tone: 'warn' },
    ],
  },
  48: {
    inbox: [
      {
        id: 'loadtest-pay',
        from: 'SRE',
        avatar: '📡',
        time: '16:30',
        text: '大促压测报告：下单 P99 420ms 达标，但支付网关超时率 1.8%（目标 <0.3%）。需要你拍板 Go/No-Go。',
        read: false,
      },
    ],
    envStatus: [
      { label: '下单 P99', value: '420ms ✓', tone: 'ok' },
      { label: '支付超时率', value: '1.8% ✗', tone: 'error' },
    ],
  },
  49: {
    inbox: [
      {
        id: 'refund-prd',
        from: '产品经理',
        avatar: '📋',
        time: '10:30',
        text: '退款需求：已支付→退款中→已退款；已发货要先退货。帮圈一下不合理的状态跳转。',
        read: false,
      },
    ],
    envStatus: [
      { label: '新需求', value: '退款状态机', tone: 'warn' },
      { label: '关联', value: 'Day 8 订单状态', tone: 'neutral' },
    ],
  },
  50: {
    inbox: [
      {
        id: 'sms-incident',
        from: 'On-call 群',
        avatar: '🚨',
        time: '13:55',
        text: '短信网关超时 5 分钟已恢复，影响登录约 800 人。CTO 要小复盘：3 条改进，格式同 Day 6 P0。',
        read: false,
      },
    ],
    envStatus: [
      { label: '事故等级', value: 'P2', tone: 'warn' },
      { label: '影响时长', value: '5 min', tone: 'warn' },
    ],
  },
  51: {
    inbox: [
      {
        id: 'gray-alert',
        from: '运维小陈',
        avatar: '🛠️',
        time: '22:35',
        text: '灰度 5% 第 2 小时：创建接口错误率 2.4%（基线 0.2%），CPU 正常。等你拍板是否暂停放量。',
        read: false,
      },
    ],
    envStatus: [
      { label: '灰度比例', value: '5%', tone: 'warn' },
      { label: '创建错误率', value: '2.4% ✗', tone: 'error' },
      { label: 'CPU', value: '正常', tone: 'ok' },
    ],
  },
}

export function getUnreadCount(inbox) {
  return inbox.filter((m) => !m.read).length
}
