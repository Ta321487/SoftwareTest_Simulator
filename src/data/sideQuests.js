/** 番外关卡（ID 101+），不影响主线 levelOrder */
export const sideLevels = [
  {
    id: 101,
    sideArc: 'security',
    title: '评论框 XSS 怎么测',
    season: 'extra',
    isSideQuest: true,
    description:
      '【安全番外 · 解锁于 Bug 单之后】社区模块上线前，安全组扫了一轮。评论区支持富文本——圈出测试必须覆盖的安全项。',
    simType: 'checklist',
    content: '勾选评论区测试中【必须覆盖】的安全验证项：',
    checklistItems: [
      { id: 'a', label: '输入 <script> 标签是否被转义/过滤' },
      { id: 'b', label: '提交 onerror= 等事件属性是否被拦截' },
      { id: 'c', label: '评论列表页按钮 hover 颜色' },
      { id: 'd', label: 'SQL 注入：评论内容含 \' OR 1=1--' },
      { id: 'e', label: '存储型 XSS：恶意脚本能否在其他用户页面执行' },
      { id: 'f', label: '评论字数统计字体大小' },
    ],
    correctChecks: ['a', 'b', 'd', 'e'],
    hint: '安全测试关注输入过滤、输出编码、存储与反射 XSS；UI 样式不是安全冒烟重点。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 3 },
  },
  {
    id: 102,
    sideArc: 'performance',
    title: '慢接口归因',
    season: 'extra',
    isSideQuest: true,
    description:
      '【性能番外 · 解锁于链路定位之后】订单详情页 P99 超 2s。APM 显示各段耗时，选出最该优先优化的环节。',
    simType: 'clickcard',
    content: '请点击【最应优先优化的瓶颈】：',
    clickVariant: 'trace',
    clickOptions: [
      { id: 'a', label: 'CDN 静态资源：80ms' },
      { id: 'b', label: 'Redis 缓存：30ms' },
      { id: 'c', label: 'Order-API：150ms' },
      { id: 'd', label: 'Elasticsearch 搜索：920ms' },
    ],
    correctClick: 'd',
    hint: '找占比最大、绝对耗时最高的环节；920ms 的 ES 通常是首要怀疑对象。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 12 },
  },
  {
    id: 103,
    sideArc: 'pipeline',
    title: 'CI 哪一步该拦 Bug',
    season: 'extra',
    isSideQuest: true,
    description:
      '【流水线番外 · 解锁于写日报之后】流水线有 4 个阶段，某次构建失败了——选出测试最该介入拦截的环节。',
    simType: 'clickcard',
    content: '点击【测试应重点保障质量门禁的环节】：',
    clickVariant: 'default',
    clickOptions: [
      { id: 'a', label: '代码提交 → 仅触发编译' },
      { id: 'b', label: '单元测试 → 开发自测' },
      { id: 'c', label: '集成测试 → 自动化回归 + 冒烟' },
      { id: 'd', label: '部署 staging → 运维发布' },
    ],
    correctClick: 'c',
    hint: '集成/回归阶段是测试门禁核心：自动化 + 冒烟应在进 staging 前拦住问题。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 10 },
  },
  {
    id: 104,
    sideArc: 'collab',
    title: 'Mock 还是连真环境',
    season: 'extra',
    isSideQuest: true,
    description:
      '【协作番外 · 解锁于企微排查之后】第三方支付沙箱不稳定，开发建议全 Mock。选出最合理的测试策略。',
    simType: 'clickcard',
    content: '请选择【最合理的测试策略】：',
    clickOptions: [
      { id: 'a', label: '全部 Mock，不再连沙箱，加快进度' },
      { id: 'b', label: '核心链路用沙箱抽测 + 非核心 Mock，不稳定时降级' },
      { id: 'c', label: '不管稳定性，坚持 100% 真实第三方' },
    ],
    correctClick: 'b',
    hint: '真实链路验证核心价值，Mock 保进度；不稳定时要有降级方案而非二选一极端。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 7 },
  },
  {
    id: 105,
    sideArc: 'compat',
    title: 'H5 兼容性矩阵',
    season: 'extra',
    isSideQuest: true,
    description:
      '【兼容番外 · 解锁于主线 15 关后】活动 H5 要在微信内打开。资源有限，圈出必测环境组合。',
    simType: 'checklist',
    content: '勾选【必须覆盖】的兼容性测试项：',
    checklistItems: [
      { id: 'a', label: 'iOS 微信内置浏览器（WKWebView）' },
      { id: 'b', label: 'Android 微信内置浏览器' },
      { id: 'c', label: 'IE6 浏览器' },
      { id: 'd', label: '弱网 3G 下首屏加载' },
      { id: 'e', label: '运营后台按钮配色' },
      { id: 'f', label: '微信分享卡片标题/缩略图显示' },
    ],
    correctChecks: ['a', 'b', 'd', 'f'],
    hint: 'H5 必测微信双端 + 分享链路 + 弱网；IE6 和后台配色通常不是 H5 首发重点。',
    xpReward: 20,
    unlock: { type: 'mainCount', min: 15 },
  },
  {
    id: 106,
    sideArc: 'strategy',
    title: '冒烟还是全量',
    season: 'extra',
    isSideQuest: true,
    description:
      '【策略番外 · 解锁于技术面之后】发版前只剩 3 小时，800 条用例跑不完。选出最合理的策略。',
    simType: 'clickcard',
    content: '请选择【最合理的测试策略】：',
    clickOptions: [
      { id: 'a', label: '全量 800 条跑完，跑不完就不签字' },
      { id: 'b', label: '按风险选冒烟集：本次改动 + 核心流程 + 历史高频 Bug 区' },
      { id: 'c', label: '开发说测过了，走流程签字' },
    ],
    correctClick: 'b',
    hint: '时间不够时按风险排序：改动点 + 核心路径 + 历史缺陷区，其余排期补测。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 19 },
  },
  {
    id: 107,
    sideArc: 'data',
    title: '支付造数：用沙箱还是 Mock',
    season: 'extra',
    isSideQuest: true,
    description:
      '【数据番外 · 解锁于支付 Bug 单之后】支付联调缺测试账号和订单。选出最可落地的造数策略。',
    simType: 'clickcard',
    content: '请选择【最合理的测试数据策略】：',
    clickOptions: [
      { id: 'a', label: '全部手工造单，不用文档，想到什么测什么' },
      { id: 'b', label: '按沙箱文档造标准账号/订单，异常场景用脚本批量生成' },
      { id: 'c', label: '等开发有空了再测，数据他们随便给' },
    ],
    correctClick: 'b',
    hint: '联调要有可复用的标准数据集 + 脚本造异常，别靠「随手试一下」。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 8 },
  },
  {
    id: 108,
    sideArc: 'monitor',
    title: '告警升级：先看哪条',
    season: 'extra',
    isSideQuest: true,
    description:
      '【监控番外 · 解锁于 grep 日志之后】凌晨告警群刷了 4 条，你刚接手值班。选出最该先升级处理的一条。',
    simType: 'clickcard',
    content: '点击【应最优先升级】的告警：',
    clickOptions: [
      { id: 'a', label: 'CDN 静态资源 404（仅影响图标）' },
      { id: 'b', label: '登录成功率跌至 62%（持续 15 分钟）' },
      { id: 'c', label: '单用户反馈头像上传慢' },
      { id: 'd', label: '测试环境磁盘 85%（未影响服务）' },
    ],
    correctClick: 'b',
    hint: '优先看影响面大、持续、核心链路的指标；单用户反馈和测试环境磁盘通常靠后。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 23 },
  },
  {
    id: 109,
    sideArc: 'automation',
    title: '自动化先测哪条',
    season: 'extra',
    isSideQuest: true,
    description:
      '【自动化番外 · 解锁于主线 20 关后】团队只能先自动化 20 条。从下面场景里选出最值得先做的。',
    simType: 'checklist',
    content: '勾选【最适合优先自动化】的场景（可多选）：',
    checklistItems: [
      { id: 'a', label: '登录主流程（高频 + 稳定 + 核心）' },
      { id: 'b', label: '后台报表导出（每月手动测 1 次）' },
      { id: 'c', label: '支付回调验签（高风险 + 重复执行）' },
      { id: 'd', label: '首页 Banner 动画帧率' },
      { id: 'e', label: '注册页 UI 像素对比' },
    ],
    correctChecks: ['a', 'c'],
    hint: '优先自动化：高频、稳定、高风险、重复劳动多的；低频 UI 像素对比 ROI 低。',
    xpReward: 22,
    unlock: { type: 'mainCount', min: 20 },
  },
]

export const sideArcs = [
  {
    id: 'security',
    name: '安全线',
    icon: '🛡️',
    tagline: 'XSS、注入——上线前的红线',
  },
  {
    id: 'performance',
    name: '性能线',
    icon: '⚡',
    tagline: '链路、瓶颈——别只会在日志里 grep',
  },
  {
    id: 'pipeline',
    name: '流水线',
    icon: '🔄',
    tagline: 'CI/CD 里测试站哪一步',
  },
  {
    id: 'collab',
    name: '协作进阶',
    icon: '🤝',
    tagline: 'Mock、沙箱、降级——真实项目的妥协',
  },
  {
    id: 'compat',
    name: '兼容性',
    icon: '📱',
    tagline: 'H5、微信、弱网——移动端测试常识',
  },
  {
    id: 'strategy',
    name: '策略线',
    icon: '🎯',
    tagline: '时间不够时怎么测——老手的取舍',
  },
  {
    id: 'data',
    name: '数据线',
    icon: '🧪',
    tagline: '造数、沙箱、脚本——联调不踩坑',
  },
  {
    id: 'monitor',
    name: '监控线',
    icon: '📡',
    tagline: '告警谁优先——值班第一课',
  },
  {
    id: 'automation',
    name: '自动化',
    icon: '🤖',
    tagline: 'ROI 思维：先自动哪条最值',
  },
]

export const sideLevelIds = sideLevels.map((l) => l.id)

export function getSideLevel(id) {
  return sideLevels.find((l) => l.id === id) || null
}

export function isSideQuestId(id) {
  return id >= 101 && id <= 199
}

export function isSideQuestUnlocked(level, completedLevelIds) {
  const unlock = level.unlock
  if (!unlock) return true
  if (unlock.type === 'level') {
    return completedLevelIds.includes(unlock.levelId)
  }
  if (unlock.type === 'mainCount') {
    const mainDone = completedLevelIds.filter((id) => id >= 1 && id <= 99).length
    return mainDone >= unlock.min
  }
  return false
}

export function getUnlockHint(level) {
  const unlock = level.unlock
  if (!unlock) return ''
  if (unlock.type === 'level') {
    return `完成主线第 ${unlock.levelId} 关后解锁`
  }
  if (unlock.type === 'mainCount') {
    return `主线通关 ${unlock.min} 关后解锁`
  }
  return '完成更多主线后解锁'
}

export function getSideArc(sideArcId) {
  return sideArcs.find((a) => a.id === sideArcId) || null
}
