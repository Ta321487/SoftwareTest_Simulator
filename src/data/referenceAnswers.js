/** 通关后可对照的参考写法（开放题） */
export const referenceAnswers = {
  2: {
    label: '用例预期参考',
    items: [
      { title: '用户名空，密码正确', text: '不允许提交/登录；提示用户名必填或类似报错信息。' },
      { title: '用户名正确，密码 6 位纯数字', text: '允许登录；6 位字母数字符合规则，系统正常跳转或提示成功。' },
      { title: '用户名正确，密码 13 位', text: '不允许；提示密码长度超出 6–12 位限制。' },
      { title: '用户名正确，密码含 @', text: '不允许；提示密码只能包含字母和数字。' },
    ],
  },
  3: {
    label: 'Bug 单参考',
    items: [
      { title: '标题', text: '登录页获取验证码后倒计时显示 -1 秒' },
      { title: '模块 / 严重程度', text: '登录 · Major 或 Critical' },
      { title: '预期 / 实际', text: '预期：倒计时从 60 递减至 0；实际：显示 -1 秒' },
    ],
  },
  7: {
    label: '协作回复参考',
    items: [
      {
        title: '示例',
        text: '李工，我先核对测试环境的回调/通知地址是否和配置中心一致，麻烦配合一起看支付网关日志或抓包确认请求有没有发出来。',
      },
    ],
  },
  8: {
    label: '支付 Bug 单参考',
    items: [
      { title: '标题', text: '微信支付成功后订单状态仍为待支付' },
      { title: '预期 / 实际', text: '预期：支付成功回调后订单变为已支付；实际：用户已扣款但订单未更新' },
      { title: '复现步骤', text: '登录 → 下单 → 选择微信支付 → 完成支付 → 查看订单详情' },
    ],
  },
  10: {
    label: '日报参考',
    items: [
      { title: '今日进展', text: '支付模块用例执行完成，冒烟通过；回归进行中。' },
      { title: '遇到的问题', text: 'TEST-1008 支付回调 Bug 未修复，阻塞回归，可能影响周五上线。' },
      { title: '明日计划', text: '跟进 Bug 修复，完成支付回归与上线检查。' },
    ],
  },
  4: {
    label: '回归范围参考',
    items: [
      { title: '必回归', text: 'TEST-1003 验证码倒计时（FAIL + 高风险）；密码错误 5 次锁定（FAIL + 高风险）。' },
      { title: '可暂缓', text: '正常登录 PASS、记住密码 medium、背景图 low 可在时间极紧时后补。' },
    ],
  },
  6: {
    label: '环境配置参考',
    items: [
      { title: '应修改为', text: 'PAYMENT_DB_HOST=10.0.1.5（运维文档中的测试库地址，非 127.0.0.1 占位符）。' },
    ],
  },
  9: {
    label: '分支选择参考',
    items: [
      { title: '答案', text: 'release/payment-2.3 —— 当前支付测试环境正在部署的发布分支。' },
    ],
  },
  11: {
    label: '工时计算参考',
    items: [
      { title: '公式', text: '5 模块 × 40 用例 ÷ 10 条/小时 ÷ 6 小时/天 = 3.33 天。' },
    ],
  },
  21: {
    label: '分析题参考',
    items: [
      { title: '必回归', text: 'FAIL + 高风险项；与头像改动相关的失败用例优先。' },
      { title: '可暂缓', text: '无关模块 PASS 且低风险项可在 2 小时手测中后补。' },
    ],
  },
  24: {
    label: '升级 PM 参考',
    items: [
      {
        title: '示例',
        text: 'TEST-1022 支付 Blocker 仍未修复，阻塞回归，可能影响周五上线，请协调开发优先处理并评估是否调整发布计划。',
      },
    ],
  },
  27: {
    label: '接口用例参考',
    items: [
      { title: '必覆盖', text: '正常登录 200+token；密码错 401；缺 username/password；空密码；错误 Content-Type。' },
      { title: '非接口层', text: '登录按钮 hover 颜色属于 UI，不是接口用例。' },
    ],
  },
  15: {
    label: '复盘措施参考',
    items: [
      { title: '示例方向', text: '缓存：热点 key 永不过期 + 随机 TTL；限流/熔断保护 DB；连接池扩容与慢 SQL 治理；完善缓存击穿监控告警。' },
    ],
  },
  17: {
    label: '边界值参考',
    items: [
      { title: '年龄为空', text: '不允许提交；提示年龄必填。' },
      { title: '年龄 = 0', text: '不允许；提示超出合法范围 1–120。' },
      { title: '年龄 = 121', text: '不允许；提示超出合法范围 1–120。' },
    ],
  },
  18: {
    label: 'HR 面参考',
    items: [
      {
        title: '示例',
        text: '我关注产品质量和用户体验，测试能在上线前帮用户发现缺陷、降低风险。我做事比较细致，也在系统学习测试方法，希望从基础做起。',
      },
    ],
  },
  25: {
    label: '满月总结参考',
    items: [
      { title: '本月成果', text: '完成登录、支付、订单等模块测试；提交并跟踪多条 Bug；参与线上问题排查。' },
      { title: '踩坑与收获', text: '学会了先看日志和配置再报 Bug；协作排查支付回调问题印象很深。' },
      { title: '下月计划', text: '推进订单自动化脚本；加强接口与性能测试学习。' },
    ],
  },
  26: {
    label: '接口断言参考',
    items: [
      {
        title: '样本 A · 密码错误',
        text: '断言 HTTP 401；body 含 code=401、message 提示密码无效（invalid password）。',
      },
      {
        title: '样本 B · 缺少 username',
        text: '断言 HTTP 400；body 含 code=400、message 指明 username is required。',
      },
    ],
  },
  28: {
    label: '用例评审参考',
    items: [
      {
        title: '缺失维度',
        text: '未覆盖密码长度 6–12、特殊字符、空用户名、超长密码、第 5 次错误锁定等边界。',
      },
      {
        title: '建议补充场景',
        text: '如：密码 5 位拒绝、13 位拒绝、含 @ 拒绝、连续 5 次错误后锁定提示等。',
      },
    ],
  },
  29: {
    label: 'Bug 批改参考',
    items: [
      {
        title: '标题示例',
        text: '【4G】登录页点击登录后 8 秒无响应 / 订单列表页点击支付按钮无反应',
      },
      {
        title: '步骤需补充',
        text: '分步操作路径、测试/生产环境、账号与网络、预期结果 vs 实际现象。',
      },
    ],
  },
  30: {
    label: '排期计算参考',
    items: [
      {
        title: '公式',
        text: '人日 = 6 × 50 ÷ 12 ÷ 8 ≈ 3.13 人日',
      },
      {
        title: 'Lead 备注',
        text: '若窗口不足 3.13 天，需申请加人或砍 scope，并写清风险。',
      },
    ],
  },
  31: {
    label: '抓包排查参考',
    items: [
      {
        title: '可疑请求',
        text: '回调 POST 指向 notify.prod.example.com 返回 404——测试环境不应调生产 notify 域名。',
      },
      {
        title: '排查顺序',
        text: '先看回调 Host/status → 对配置中心 PAY_CALLBACK_URL → 查网关日志。',
      },
    ],
  },
  32: {
    label: '安全审计参考',
    items: [
      {
        title: '应覆盖',
        text: '敏感字段脱敏、导出权限审计、验证码/短信限流、越权访问接口。',
      },
      {
        title: '非审计范围',
        text: '按钮圆角、主题色等 UI 规范通常不在安全联合审计范围。',
      },
    ],
  },
  33: {
    label: 'Go/No-Go 参考',
    items: [
      {
        title: '建议决策',
        text: '库存链路错误率 2% 超标 → No-Go，需复测达标后再上线。',
      },
      {
        title: '复测标准',
        text: '写清哪项指标、目标阈值、负责人与复测时间窗口。',
      },
    ],
  },
}

export function getReferenceAnswer(levelId) {
  return referenceAnswers[levelId] || null
}
