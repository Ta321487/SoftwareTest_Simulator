export function getValidationCriteria(level) {
  if (level.criteria) return level.criteria

  switch (level.simType) {
    case 'checklist':
      return '勾选所有符合任务要求的项（不多不少），然后确认提交。'
    case 'template':
      return '每一项均需完整描述；对照需求或场景规则判断，写清系统反应，不要只写一个字。'
    case 'apiclient':
      if (level.checklistItems?.length) {
        return '勾选所有符合任务要求的项（不多不少），然后确认提交。'
      }
      return '每个响应都要写清：状态码是多少、返回里哪些字段要对（如 code、message、token），别只写「失败」。'
    case 'jira':
      return '所有带 * 的字段必填；标题要点明现象，步骤分步写，预期/实际分开且能让他人独立复现。'
    case 'report':
      return '勾选应优先回归的用例——重点关注「失败 + 高风险」项。'
    case 'terminal':
      return '输入 Linux 命令后按 Enter；按任务要求查看日志、配置文件或探活接口。'
    case 'config':
      return '将占位符改为测试环境可用地址；保存后须测试连接通过再提交。'
    case 'chat':
      return '回复要具体、能协作：说清楚你会查什么，并请同事配合。'
    case 'clickcard':
      return '结合场景数据与团队/环境背景，选择最合理的一项。'
    case 'calculator':
      return '按公式计算结果并填写；上方参数无需修改。'
    case 'packet':
      return '点击最可疑的请求（看状态码、域名/地址是否和测试环境一致），然后确认提交。'
    case 'sqlclient':
      return '写一条只读的 SELECT 查询，WHERE 里要带上题目要求的表和条件。'
    case 'redis':
      return '输入 GET / TTL / KEYS 命令，键名与题目一致后按 Enter。'
    case 'cipipeline':
      return '点击失败阶段查看日志；若有归因题，结合日志关键字选择原因。'
    case 'mockserver':
      return '设置接口路径、状态码、返回内容（如需还可设延迟），测试通过后再提交。'
    case 'apmtrace':
    case 'gitrelease':
      return '结合场景数据与环境背景，选择最合理的一项。'
    case 'mqinbox':
      return '选中目标 MQ 消息，或从短信列表填写正确验证码。'
    default:
      return '完成操作后提交。'
  }
}
