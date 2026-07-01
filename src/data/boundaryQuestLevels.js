/** 等价类与边界值加深选修番外（3 关，接主线 #17） */
export const boundaryQuestLevels = [
  {
    id: 239,
    sideArc: 'boundary',
    title: '年龄上边界预期',
    season: 'extra',
    isSideQuest: true,
    description:
      '【边界值 · 解锁于主线 #17 之后】注册规则：年龄 1–120 整数。补写边界值 120 与 121 的预期结果。',
    simType: 'template',
    content: '填写以下边界场景的预期结果：',
    requirement: '年龄必填；合法范围 1–120（整数）',
    fillHint: '写清系统是否接受及用户可见提示',
    templateMinLength: 8,
    templateFields: [
      {
        field: 'case1',
        scenario: '年龄 = 120（上边界合法值）',
        placeholder: '系统应如何反应…',
        validationHint: '120 在范围内，应允许提交或正常保存。',
        fieldKeywords: ['允许', '成功', '通过', '120', '合法', '接受'],
      },
      {
        field: 'case2',
        scenario: '年龄 = 121（上边界外）',
        placeholder: '系统应如何反应…',
        validationHint: '121 超出上限，应拒绝并提示。',
        fieldKeywords: ['不允许', '拒绝', '121', '超出', '范围', '提示', '错误'],
      },
    ],
    hint: '边界值：max 合法与 max+1 非法都要写清系统反应。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 17 },
  },
  {
    id: 240,
    sideArc: 'boundary',
    title: '手机号等价类',
    season: 'extra',
    isSideQuest: true,
    description:
      '【边界值 · 解锁于 #239 之后】登录手机号：11 位大陆号。资源有限，圈出等价类中必须覆盖的代表值。',
    simType: 'checklist',
    content: '勾选【必须覆盖】的等价类代表值：',
    checklistItems: [
      { id: 'a', label: '11 位合法手机号（如 13800138000）' },
      { id: 'b', label: '空字符串' },
      { id: 'c', label: '10 位（少 1 位）' },
      { id: 'd', label: '含字母 abc13800138000' },
      { id: 'e', label: '按钮颜色是否为品牌色' },
      { id: 'f', label: '12 位（多 1 位）' },
    ],
    correctChecks: ['a', 'b', 'c', 'd', 'f'],
    hint: '等价类：合法 + 空 + 长度边界 + 非法字符；按钮颜色无关。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 239 },
  },
  {
    id: 241,
    sideArc: 'boundary',
    title: '优惠金额边界判断',
    season: 'extra',
    isSideQuest: true,
    description:
      '【边界值 · 解锁于 #240 之后】优惠券面额 0.01–500.00 元。选出最该优先验证的边界场景。',
    simType: 'clickcard',
    content: '请点击【最应优先验证】的边界场景：',
    clickOptions: [
      { id: 'a', label: '0.00 元（下边界外）与 0.01 元（下边界合法）' },
      { id: 'b', label: '优惠券字体是否加粗' },
      { id: 'c', label: '仅测 100 元中间值' },
      { id: 'd', label: '只测 UI 展示不动金额逻辑' },
    ],
    correctClick: 'a',
    hint: '金额边界：min-1 / min / max / max+1 优先于中间值和 UI 审美。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 240 },
  },
]

export const boundaryQuestArc = {
  id: 'boundary',
  name: '边界值 · 选修',
  icon: '📐',
  tagline: '120 能过、121 该拦，边界别凭感觉',
}
