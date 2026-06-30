/** 与 package.json version 同步 */
export const APP_VERSION = '1.16.0'

/** 新版本条目放数组头部 */
export const WHATS_NEW_ENTRIES = [
  {
    version: APP_VERSION,
    title: '存档更可靠，学习路径更清晰',
    items: [
      '进度自动备份到 IndexedDB，localStorage 丢失时可恢复',
      '存储失败时会提示导出存档，通关 5 关后提醒备份',
      '「待加强」新增按题型特训与番外推荐',
      '提交失败时显示手札与番外学习建议',
    ],
  },
]
