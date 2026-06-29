import { simTypeLabels } from '../data/levels.js'

const simGuideContent = {
  checklist: {
    action: '勾选符合要求的项，然后点击「确认勾选」',
    steps: ['阅读背景与需求', '勾选需要验证/关注的条目', '点击底部「确认勾选」提交'],
  },
  template: {
    action: '在输入框中填写内容，然后点击「提交」',
    steps: ['阅读需求与每个场景说明', '在对应位置填写完整内容', '点击底部「提交」完成'],
  },
  apiclient: {
    action: '查看响应样本，填写断言后点击「提交断言」',
    steps: ['切换各响应样本 Tab', '对照 status 与 body 写断言要点', '两个样本都填完再提交'],
  },
  jira: {
    action: '填写所有带 * 的必填字段，然后点击「提交工单」',
    steps: ['阅读 Bug 背景', '逐项填写工单字段', '点击「提交工单」'],
  },
  report: {
    action: '勾选需要回归的用例，然后点击「确认回归范围」',
    steps: ['查看每条用例的执行状态与风险等级', '勾选应优先回归的用例', '点击「确认回归范围」'],
  },
  terminal: {
    action: '在终端输入命令，按 Enter 执行',
    steps: [
      '阅读故障背景与日志/配置路径',
      '输入 tail / grep / head / cat / curl / find / ls 等命令',
      '按 Enter 执行并确认输出符合任务',
    ],
  },
  config: {
    action: '保存配置 → 测试连接 → 确认环境就绪',
    steps: ['查看配置文件', '修改目标配置项并保存', '测试连接通过后确认提交'],
  },
  chat: {
    action: '输入回复并点击「发送」',
    steps: ['阅读群里在说什么', '按任务说明写回复（先查什么 + 请谁配合）', '点击「发送」'],
  },
  clickcard: {
    action: '点击选择一个选项，然后点击「确认选择」',
    steps: ['阅读场景与各选项', '点击选中一项（可再次点击取消）', '点击「确认选择」'],
  },
  calculator: {
    action: '按公式心算或笔算，填写结果后提交',
    steps: ['看清题目里的各项参数', '按提示公式自行计算', '在「你的计算结果」中填写（两位小数）'],
  },
  packet: {
    action: '点击最可疑的请求，然后确认提交',
    steps: [
      '查看每条请求的 method、URL、status',
      '对照业务链路找异常（如回调 404、Host 错环境）',
      '点击选中后确认',
    ],
  },
  sqlclient: {
    action: '编写 SELECT 查询并执行',
    steps: ['阅读表结构与业务现象', '写 SELECT … FROM … WHERE …', '执行查询核对落库数据'],
  },
  redis: {
    action: '输入 Redis 命令，按 Enter 执行',
    steps: ['确认要查的键名/场景', '输入 GET / TTL / KEYS 命令', '对照输出与接口/页面现象'],
  },
  cipipeline: {
    action: '查看流水线阶段与日志，确认判断',
    steps: ['点击各 CI 阶段查看状态', '失败阶段展开日志片段', '选择失败阶段或原因后提交'],
  },
  mockserver: {
    action: '配置 Mock 规则 → 测试 → 提交',
    steps: ['填写 path / status / body', '点击测试 Mock', '通过后保存提交'],
  },
  apmtrace: {
    action: '点击链路节点或告警指标，确认提交',
    steps: ['阅读 P99/告警背景', '点选最慢环节或优先指标', '确认选择'],
  },
  gitrelease: {
    action: '选择正确的分支或 commit',
    steps: ['阅读发布/hotfix 背景', '对照分支或 commit 信息', '确认选择'],
  },
  mqinbox: {
    action: '选中 MQ 消息或填写验证码',
    steps: ['阅读异步/短信场景', '在列表中定位目标消息或验证码', '确认提交'],
  },
}

export function getSimGuide(simType) {
  const content = simGuideContent[simType]
  return {
    label: simTypeLabels[simType] || '模拟工具',
    action: content?.action || '完成操作后点击提交',
    steps: content?.steps || [],
  }
}
