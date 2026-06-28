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

  const jiraBacklog = patchJiraBacklog(
    levelId,
    buildJiraBacklog(levelId, projectStore),
    { progressStore, projectStore }
  )

  const merged = mergeStoryConsequences(
    levelId,
    {
      inbox,
      envStatus: ctx.envStatus || [],
      chatHistory: ctx.chatHistory || [],
      chatReply: ctx.chatReply || '',
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
    { key: 'TEST-1001', summary: '登录页偶发 502', status: 'Done', module: '登录', assignee: '王工' },
    { key: 'TEST-1002', summary: '记住密码明文存储风险', status: 'Open', module: '登录', assignee: '待分配' },
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
    envStatus: [
      { label: '待处理工单', value: 'TEST-1008', tone: 'warn' },
    ],
  },
  9: {
    clickVariant: 'git',
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
    envStatus: [{ label: '技术栈', value: 'Java + Spring Boot', tone: 'neutral' }],
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
    envStatus: [{ label: '备考进度', value: '接口专项', tone: 'neutral' }],
  },
  17: {
    envStatus: [{ label: '备考进度', value: '边界值专项', tone: 'neutral' }],
  },
  26: {
    envStatus: [
      { label: '接口', value: 'POST /api/login', tone: 'neutral' },
      { label: '工具', value: 'Postman / 脚本', tone: 'neutral' },
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
    envStatus: [{ label: '笔试', value: '接口设计题', tone: 'neutral' }],
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
    envStatus: [{ label: '面试进度', value: 'HR 面进行中', tone: 'warn' }],
  },
  19: {
    envStatus: [{ label: '面试进度', value: '技术面 · 策略题', tone: 'warn' }],
  },
  20: {
    envStatus: [{ label: '笔试', value: '计算题', tone: 'neutral' }],
  },
  21: {
    envStatus: [
      { label: '笔试', value: '分析题', tone: 'neutral' },
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
    ],
    envStatus: [{ label: '带教任务', value: 'Review 用例', tone: 'neutral' }],
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
    envStatus: [{ label: '订单 8821', value: 'pending', tone: 'warn' }],
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
}

export function getUnreadCount(inbox) {
  return inbox.filter((m) => !m.read).length
}
