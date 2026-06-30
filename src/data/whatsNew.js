/** 与 package.json version 同步 */
export const APP_VERSION = '1.17.1'

/** 新版本条目放数组头部 */
export const WHATS_NEW_ENTRIES = [
  {
    version: APP_VERSION,
    title: '手机关卡页可读完整任务说明',
    items: [
      '修复窄屏/手机任务条两行省略后无法看到 PRD 全文的问题',
      '展开任务面板时在内容区显示完整题干，收起时保留两行预览',
    ],
  },
  {
    version: '1.17.0',
    title: '存档更可靠，学习路径更清晰',
    items: [
      '进度自动备份到 IndexedDB，localStorage 丢失时可恢复',
      '存储失败时会提示导出存档，通关 5 关后提醒备份',
      '「待加强」新增按题型特训与番外推荐',
      '提交失败时显示手札与番外学习建议',
    ],
  },
]
