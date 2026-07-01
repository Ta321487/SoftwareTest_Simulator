/** 灰度发布选修番外（3 关链式解锁，接主线 #51 灰度拍板） */
export const grayReleaseQuestLevels = [
  {
    id: 162,
    sideArc: 'grayrelease',
    title: '灰度版本 P99 飙了',
    season: 'extra',
    isSideQuest: true,
    description:
      '【灰度发布 · 解锁于主线 #51 之后】订单 v3.0 灰度 5% 放量，创建接口 P99 从 800ms 飙到 2.8s。从链路中点出最慢环节。',
    simType: 'apmtrace',
    content: '点击最慢/占比最高的链路节点：',
    apmMode: 'trace',
    traceTitle: 'POST /api/order/create · P99 = 2.8s（灰度 v3.0）',
    traceNodes: [
      { id: 'nginx', label: 'Nginx', latency: 60, pct: 5 },
      { id: 'gateway', label: 'Gateway', latency: 100, pct: 8 },
      { id: 'order', label: 'Order-API v3.0', latency: 180, pct: 12 },
      { id: 'mysql', label: 'MySQL', latency: 2100, pct: 75, bottleneck: true },
    ],
    correctClick: 'mysql',
    hint: '灰度错误率/P99 异常时先 APM 下钻找瓶颈；2100ms · 75% 的 MySQL 通常是首要怀疑对象。',
    xpReward: 22,
    unlock: { type: 'level', levelId: 51 },
  },
  {
    id: 163,
    sideArc: 'grayrelease',
    title: '灰度告警先看什么',
    season: 'extra',
    isSideQuest: true,
    description:
      '【灰度发布 · 解锁于 #162 之后】灰度第 2 小时监控大盘：创建接口错误率 2.4%（基线 0.2%），CPU 78%。选出最该优先关注的指标。',
    simType: 'clickcard',
    content: '点击【最应优先关注】的监控项：',
    clickOptions: [
      { id: 'a', label: '订单创建接口错误率 2.4%（基线 0.2%）' },
      { id: 'b', label: 'CPU 负载 78%' },
      { id: 'c', label: '按钮 hover 颜色差 1 个色阶' },
      { id: 'd', label: 'Loading 动画帧率' },
    ],
    correctClick: 'a',
    hint: '业务错误率超标比 CPU 正常更致命——和第 51 关一致，先止血再放量。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 162 },
  },
  {
    id: 164,
    sideArc: 'grayrelease',
    title: '回滚前必确认项',
    season: 'extra',
    isSideQuest: true,
    description:
      '【灰度发布 · 解锁于 #163 之后】错误率持续超标，决定暂停放量。圈出回滚/止血前必须确认的项。',
    simType: 'checklist',
    content: '勾选灰度回滚前【必须确认】的项：',
    checklistItems: [
      { id: 'a', label: '确认错误率/成功率指标仍在超阈值（非瞬时抖动）' },
      { id: 'b', label: '通知相关方（开发/运维/PM）并记录决策时间' },
      { id: 'c', label: '回滚后验证核心链路（下单/支付）恢复正常' },
      { id: 'd', label: '登录页按钮圆角是否为 4px' },
      { id: 'e', label: '保留灰度期间的日志与监控快照供复盘' },
      { id: 'f', label: '直接全量发布，大促不能等' },
    ],
    correctChecks: ['a', 'b', 'c', 'e'],
    hint: '回滚要确认指标、通知、验证恢复、留证据；UI 圆角和强行全量不是止血动作。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 163 },
  },
]

export const grayReleaseQuestArc = {
  id: 'grayrelease',
  name: '灰度发布 · 选修',
  icon: '🚦',
  tagline: 'APM 下钻、错误率优先、回滚确认——上线前三道门之一',
}
