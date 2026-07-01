/** 接口契约变更选修番外（3 关，接主线 #26 接口断言） */
export const contractQuestLevels = [
  {
    id: 233,
    sideArc: 'contract',
    title: '字段下线先验什么',
    season: 'extra',
    isSideQuest: true,
    description:
      '【契约回归 · 解锁于主线 #26 之后】订单详情 v2 下线了 paidAt 字段，客户端仍强依赖。选出最合理的回归策略。',
    simType: 'clickcard',
    content: '请点击【最应优先执行】的契约回归动作：',
    clickOptions: [
      { id: 'a', label: '对照变更说明，跑接口契约/回归用例并检查旧客户端兼容' },
      { id: 'b', label: '只测 UI 颜色，接口不用管' },
      { id: 'c', label: '等用户投诉再说' },
      { id: 'd', label: '直接全量发布，文档以后补' },
    ],
    correctClick: 'a',
    hint: '破坏性变更：先对照契约文档跑回归，再评估旧端兼容——不是只测 UI。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 26 },
  },
  {
    id: 234,
    sideArc: 'contract',
    title: '写缺失字段断言',
    season: 'extra',
    isSideQuest: true,
    description:
      '【契约回归 · 解锁于 #233 之后】GET /api/order/8821 响应不再含 paidAt。根据样本填写测试断言要点。',
    simType: 'apiclient',
    apiMethod: 'GET',
    apiUrl: '/api/order/8821',
    apiRequestBody: '',
    content: '根据 v2 响应样本，填写契约回归应断言的内容：',
    requirement: 'v2 移除 paidAt；客户端需 graceful 降级或明确报错',
    fillHint: '写清字段缺失时的 status/body 或兼容行为',
    templateMinLength: 10,
    templateFields: [
      {
        field: 'case1',
        scenario: '样本 · v2 响应\n{"orderId":"8821","status":"PAID","amount":99.00}',
        placeholder: '应断言：paidAt 不存在时客户端/接口应…',
        validationHint: '契约测试要断言字段存在性或兼容降级，不能假设旧字段仍在。',
        fieldKeywords: ['paidAt', '不存在', '缺失', '兼容', '降级', 'status', 'PAID'],
      },
    ],
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 233 },
  },
  {
    id: 235,
    sideArc: 'contract',
    title: '同步破坏性变更',
    season: 'extra',
    isSideQuest: true,
    description:
      '【契约回归 · 解锁于 #234 之后】paidAt 下线影响 App 旧版本。在企微同步开发并说明测试侧发现。',
    simType: 'chat',
    content: '在企微 @后端：说明字段下线影响、你的回归结论及发布前需要对方确认的点。',
    chatGroup: '订单接口协作群',
    chatKeywords: ['paidAt', '契约', '兼容', '回归', 'v2', '旧版本', '字段', '发布'],
    chatMinKeywords: 2,
    chatMinLength: 24,
    chatStructure: 'collaboration',
    chatHint: '说清：删了什么字段、谁受影响、测试结论、发布前要确认什么。',
    chatPlaceholder: '例：v2 移除 paidAt，旧 App 会解析失败，建议灰度前确认兼容策略…',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 234 },
  },
]

export const contractQuestArc = {
  id: 'contract',
  name: '契约回归 · 选修',
  icon: '📜',
  tagline: '接口改字段，契约测得先红',
}
