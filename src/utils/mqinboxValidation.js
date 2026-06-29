export function validateMqInbox(level, data) {
  if (level.correctMessageId) {
    const selected = data.selectedMessageId || ''
    if (!selected) {
      return { isPass: false, message: '请点击选中目标消息后再提交。' }
    }
    const isPass = selected === level.correctMessageId
    return {
      isPass,
      message: isPass ? '定位正确！' : '消息不对。对照业务单号/时间与 payload 重新找。',
    }
  }

  if (level.correctCode) {
    const code = String(data.code || '').trim()
    if (!code) {
      return { isPass: false, message: '请从收件箱中找到验证码并填写。' }
    }
    const isPass = code === level.correctCode
    return {
      isPass,
      message: isPass ? '验证码正确！' : '验证码不对，请核对最新一条短信。',
    }
  }

  return { isPass: false, message: '题目配置不完整。' }
}
