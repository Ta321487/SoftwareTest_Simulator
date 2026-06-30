/** 与 package.json version 同步 */
export const APP_VERSION = '1.18.0'

/** 新版本条目放数组头部 */
export const WHATS_NEW_ENTRIES = [
  {
    version: APP_VERSION,
    title: 'Lead 线接入上机实操',
    items: [
      '测试 Lead 线新增 Go/No-Go 看板、任务分派与压测报告三项实操',
      '与登录/支付/订单/值班并列，五条项目线均可选上机（不影响通关）',
      '完成任一项 Lead 实操解锁成就「Lead 看板上手」',
    ],
  },
  {
    version: '1.17.5',
    title: '清理死代码与 lint 警告',
    items: [
      '删除未引用的 CareerMap 与旧 Tab 样式',
      'ESLint 未使用变量清零，工程更易维护',
    ],
  },
  {
    version: '1.17.4',
    title: '手机关卡页可读完整任务说明',
    items: [
      '修复窄屏/手机任务条两行省略后无法看到 PRD 全文的问题',
      '展开任务面板时在内容区显示完整题干，收起时保留两行预览',
    ],
  },
  {
    version: '1.17.0',
    title: '统一导航与首页 RPG 式任务流',
    items: [
      '侧栏/底栏共用一套导航：首页、进关卡、番外、档案、成就、手札',
      '首页合并当前任务与章节路径，去掉重复 Tab 与窗口套窗口',
      '成就/任务日志/番外改为扁平列表与路径布局，PC 与手机均已适配',
      '修复横向拖拽与 Tab 点击冲突、备份提醒「稍后」无效',
    ],
  },
  {
    version: '1.16.0',
    title: '存档更可靠，学习路径更清晰',
    items: [
      '进度自动备份到 IndexedDB，localStorage 丢失时可恢复',
      '存储失败时会提示导出存档，通关 5 关后提醒备份',
      '「待加强」新增按题型特训与番外推荐',
      '提交失败时显示手札与番外学习建议',
    ],
  },
]
