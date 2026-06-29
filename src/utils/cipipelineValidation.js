export function validatePipelineSubmission(level, data) {
  if (level.correctStage) {
    const selected = data.selectedStage || ''
    if (!selected) {
      return { isPass: false, message: '请点击失败的流水线阶段查看日志，再确认提交。' }
    }
    if (selected !== level.correctStage) {
      return {
        isPass: false,
        message: '阶段不对。集成/回归失败通常是测试最该介入的环节。',
      }
    }
  }

  if (level.correctCause) {
    const selected = data.selectedCause || ''
    if (!selected) {
      return { isPass: false, message: '请根据日志片段选择最可能的失败原因。' }
    }
    const isPass = selected === level.correctCause
    return {
      isPass,
      message: isPass ? '判断正确！' : '请对照日志关键字与环境信息重新分析。',
    }
  }

  return { isPass: true, message: '定位正确！' }
}
