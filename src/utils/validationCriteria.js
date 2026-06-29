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
      return '每个响应样本都要写清 HTTP 状态码与 body 关键字段（code、message、token 等），不要只写「失败」。'
    case 'jira':
      return '所有带 * 的字段必填；标题要点明现象，步骤分步写，预期/实际分开且能让他人独立复现。'
    case 'report':
      return '勾选应优先回归的用例——重点关注「失败 + 高风险」项。'
    case 'terminal':
      return '输入 Linux 命令后按 Enter；按任务要求查看日志、配置文件或探活接口。'
    case 'config':
      return '将占位符改为测试环境可用地址；保存后须测试连接通过再提交。'
    case 'chat':
      return '回复需专业、可协作，提供可验证信息并推动排查。'
    case 'clickcard':
      return '结合场景数据与团队/环境背景，选择最合理的一项。'
    case 'calculator':
      return '按公式自行计算，在结果框填写数字（建议两位小数），参数无需修改。'
    case 'packet':
      return '点击最可疑的 HTTP 请求（关注 status、Host/URL 是否与测试环境一致），然后确认提交。'
    case 'sqlclient':
      return '编写 SELECT 只读查询，WHERE 条件需包含题目要求的表名与关键字。'
    case 'redis':
      return '输入 GET / TTL / KEYS 命令，键名与题目一致后按 Enter。'
    case 'cipipeline':
      return '点击失败阶段查看日志；若有归因题，结合日志关键字选择原因。'
    case 'mockserver':
      return '配置 path、status、body（及 delay），测试 Mock 通过后再提交。'
    case 'apmtrace':
    case 'gitrelease':
      return '结合场景数据与环境背景，选择最合理的一项。'
    case 'mqinbox':
      return '选中目标 MQ 消息，或从短信列表填写正确验证码。'
    default:
      return '完成操作后提交。'
  }
}
