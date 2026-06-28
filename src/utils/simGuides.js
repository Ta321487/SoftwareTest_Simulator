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
    steps: ['阅读故障背景与日志路径', '在底部 $ 后输入 Linux 命令', '按 Enter 提交命令'],
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
}

export function getSimGuide(simType) {
  const content = simGuideContent[simType]
  return {
    label: simTypeLabels[simType] || '模拟工具',
    action: content?.action || '完成操作后点击提交',
    steps: content?.steps || [],
  }
}
