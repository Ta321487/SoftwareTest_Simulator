/** 通关后可对照的参考写法（开放题） */
export const referenceAnswers = {
  1: {
    label: '测试点参考',
    items: [
      {
        title: '必圈',
        text: '手机号/邮箱格式、密码 5 次锁定、记住密码加密存储、登录成功跳转。',
      },
      {
        title: '非首轮重点',
        text: '纯 UI 审美、多端互踢、Session 超时、OAuth 等 PRD 未写明项。',
      },
    ],
  },
  2: {
    label: '用例预期参考',
    items: [
      { title: '用户名空，密码正确', text: '不允许提交/登录；提示用户名必填或类似报错信息。' },
      {
        title: '用户名正确，密码 6 位纯数字',
        text: '允许登录；6 位字母数字符合规则，系统正常跳转或提示成功。',
      },
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
      {
        title: '预期 / 实际',
        text: '预期：支付成功回调后订单变为已支付；实际：用户已扣款但订单未更新',
      },
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
      {
        title: '必回归',
        text: 'TEST-1003 验证码倒计时（FAIL + 高风险）；密码错误 5 次锁定（FAIL + 高风险）。',
      },
      { title: '可暂缓', text: '正常登录 PASS、记住密码 medium、背景图 low 可在时间极紧时后补。' },
    ],
  },
  5: {
    label: '终端命令参考',
    items: [
      {
        title: '命令',
        text: 'tail -n 100 /var/log/app/error.log —— 查看 error.log 末尾 100 行。',
      },
      {
        title: '排查方向',
        text: '日志中 SMS countdown -1、NPE、成功率下跌等 ERROR 与验证码 Bug 相关。',
      },
    ],
  },
  6: {
    label: '环境配置参考',
    items: [
      {
        title: '应修改为',
        text: 'PAYMENT_DB_HOST=10.0.1.5（运维文档中的测试库地址，非 127.0.0.1 占位符）。',
      },
    ],
  },
  9: {
    label: '分支选择参考',
    items: [{ title: '答案', text: 'release/payment-2.3 —— 当前支付测试环境正在部署的发布分支。' }],
  },
  11: {
    label: '工时计算参考',
    items: [{ title: '公式', text: '5 模块 × 40 用例 ÷ 10 条/小时 ÷ 6 小时/天 = 3.33 天。' }],
  },
  12: {
    label: '性能决策参考',
    items: [
      {
        title: '答案',
        text: '优先定位慢 SQL / 连接池耗尽等瓶颈，而非盲目加机器或忽略告警。',
      },
    ],
  },
  13: {
    label: '框架选型参考',
    items: [
      {
        title: '答案',
        text: '结合团队技术栈、维护成本、用例类型（接口/UI）选型；优先可维护、团队熟悉的方案。',
      },
    ],
  },
  14: {
    label: '灰度监控参考',
    items: [
      {
        title: '应勾选',
        text: '核心接口成功率、错误率、P99 延迟、下单/支付转化率等业务指标。',
      },
      { title: '非重点', text: '按钮圆角、主题色等 UI 细节通常不是灰度监控首要项。' },
    ],
  },
  16: {
    label: '接口测试点参考',
    items: [
      {
        title: '必覆盖',
        text: 'HTTP 状态码、响应体字段（token/错误码）、响应头、错误密码与缺参场景。',
      },
      { title: '非接口层', text: '按钮圆角属于前端 UI，不是接口必测项。' },
    ],
  },
  19: {
    label: '测试策略参考',
    items: [
      {
        title: '答案',
        text: '优先测本次改动 + 核心高风险流程，其余排期补测——时间紧时聚焦风险面。',
      },
    ],
  },
  20: {
    label: '缺陷密度参考',
    items: [{ title: '计算', text: '6 ÷ 150 × 100% = 4.00%。' }],
  },
  21: {
    label: '分析题参考',
    items: [
      { title: '必回归', text: 'FAIL + 高风险项；与头像改动相关的失败用例优先。' },
      { title: '可暂缓', text: '无关模块 PASS 且低风险项可在 2 小时手测中后补。' },
    ],
  },
  22: {
    label: '线上 Bug 单参考',
    items: [
      { title: '标题', text: '【4G】App 登录耗时约 8 秒 / 移动端登录超时' },
      { title: '模块', text: '登录 · Major 或 Critical' },
      {
        title: '步骤 / 预期 / 实际',
        text: '4G 网络 → 输入账号密码 → 登录；预期 3 秒内完成；实际等待约 8 秒。',
      },
    ],
  },
  23: {
    label: 'grep 命令参考',
    items: [
      {
        title: '命令',
        text: 'grep ERROR /var/log/app/error.log —— 从 error.log 筛选含 ERROR 的行。',
      },
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
      {
        title: '必覆盖',
        text: '正常登录 200+token；密码错 401；缺 username/password；空密码；错误 Content-Type。',
      },
      { title: '非接口层', text: '登录按钮 hover 颜色属于 UI，不是接口用例。' },
    ],
  },
  15: {
    label: '复盘措施参考',
    items: [
      {
        title: '示例方向',
        text: '缓存：热点 key 永不过期 + 随机 TTL；限流/熔断保护 DB；连接池扩容与慢 SQL 治理；完善缓存击穿监控告警。',
      },
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
      {
        title: '本月成果',
        text: '完成登录、支付、订单等模块测试；提交并跟踪多条 Bug；参与线上问题排查。',
      },
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
  34: {
    label: '验证码测试点参考',
    items: [
      {
        title: '必圈',
        text: '验证码展示与 60 秒刷新、错误提示与计数、3 次锁定 15 分钟、大小写规则、过期不可复用、锁定期正确码也不行。',
      },
      { title: '非重点', text: '背景渐变色等品牌 UI 通常不是功能首轮重点。' },
    ],
  },
  35: {
    label: '锁定场景参考',
    items: [
      { title: '第 5 次错误', text: '立即锁定 30 分钟；提示账号已锁定。' },
      { title: '锁定期间', text: '正确密码仍被拒绝；提示需等待解锁。' },
      { title: '满 30 分钟后', text: '自动解锁；正确密码可正常登录。' },
    ],
  },
  36: {
    label: '手机号等价类参考',
    items: [
      { title: '为空', text: '不允许提交；提示手机号必填。' },
      { title: '10 位', text: '不允许；提示位数不足或格式错误。' },
      { title: '含字母', text: '不允许；提示只能输入数字。' },
    ],
  },
  37: {
    label: '状态码参考',
    items: [
      {
        title: '答案',
        text: '401 Unauthorized —— 认证失败（密码错误）的语义；404 是资源不存在，500 是服务端异常。',
      },
    ],
  },
  38: {
    label: '安全必测参考',
    items: [
      {
        title: '必覆盖',
        text: 'SQL 注入、暴力破解限流、HTTPS 传输、敏感错误信息泄露。',
      },
      { title: '非安全项', text: 'hover 动画、favicon 尺寸属于 UI，不是安全必测。' },
    ],
  },
  39: {
    label: '终面自我介绍参考',
    items: [
      {
        title: '示例',
        text: '我参加过测试培训，做过登录/接口练习，关注产品质量和用户视角，做事细致，希望从基础测试岗位做起持续学习。',
      },
    ],
  },
  40: {
    label: '黑盒白盒参考',
    items: [
      {
        title: '答案',
        text: '常规功能以黑盒为主；排查复杂缺陷或安全/性能场景时可结合白盒读代码。',
      },
    ],
  },
  41: {
    label: '冒烟策略参考',
    items: [
      {
        title: '答案',
        text: '优先核心主流程 + 本次改动相关模块，通过后再扩面——不是随机抽样。',
      },
    ],
  },
  42: {
    label: '支付回调参考',
    items: [
      {
        title: '必覆盖',
        text: '回调 URL 与环境、重试与幂等、验签、重复回调不重复变更、超时后终态。',
      },
      { title: '非相关', text: '支付按钮圆角与回调逻辑无关。' },
    ],
  },
  43: {
    label: '状态机参考',
    items: [
      {
        title: '不合理流转',
        text: '已支付 → 待支付（支付成功后不应回退）；取消仅允许在待支付态。',
      },
    ],
  },
  44: {
    label: '订单断言参考',
    items: [
      {
        title: '正常订单',
        text: 'HTTP 200；body 含 status=paid、amount=99.00、items 等关键字段。',
      },
      {
        title: '订单不存在',
        text: 'HTTP 404；body 含 code=404、message 指明 order not found。',
      },
    ],
  },
  45: {
    label: '告警响应参考',
    items: [
      {
        title: '首轮必做',
        text: '确认告警持续、查最近发布/配置变更、看错误日志与监控曲线、尝试测试环境复现。',
      },
      { title: '勿做', text: '别跳过诊断直接改代码；按钮颜色与告警无关。' },
    ],
  },
  46: {
    label: 'tail 命令参考',
    items: [
      {
        title: '命令',
        text: 'tail -f /var/log/app/error.log —— 实时跟踪 error.log 新增内容。',
      },
    ],
  },
  47: {
    label: '任务分派参考',
    items: [
      {
        title: '任务范围',
        text: '说明测哪些模块/场景：如登录回归、边界用例、验证码锁定等。',
      },
      {
        title: '交付标准',
        text: '用例执行记录、Bug 单、截止时间——别只写「去测登录」。',
      },
    ],
  },
  48: {
    label: '压测拍板参考',
    items: [
      {
        title: '建议决策',
        text: '支付网关超时率 1.8% 超标 → No-Go，修复并复测通过后再上线。',
      },
      {
        title: '理由',
        text: '支付是核心链路，超时率超标比 P99 略好更致命。',
      },
    ],
  },
}

export function getReferenceAnswer(levelId) {
  return referenceAnswers[levelId] || null
}
