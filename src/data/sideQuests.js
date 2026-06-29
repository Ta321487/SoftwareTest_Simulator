/** 番外关卡（ID 101+），不影响主线 levelOrder */
export const sideLevels = [
  {
    id: 101,
    sideArc: 'security',
    title: '评论框 XSS 怎么测',
    season: 'extra',
    isSideQuest: true,
    description:
      '【安全番外 · 解锁于 Bug 单之后】社区模块上线前，安全组扫了一轮。评论区支持富文本——圈出测试必须覆盖的安全项。',
    simType: 'checklist',
    content: '勾选评论区测试中【必须覆盖】的安全验证项：',
    checklistItems: [
      { id: 'a', label: '输入 <script> 标签是否被转义/过滤' },
      { id: 'b', label: '提交 onerror= 等事件属性是否被拦截' },
      { id: 'c', label: '评论列表页按钮 hover 颜色' },
      { id: 'd', label: "SQL 注入：评论内容含 ' OR 1=1--" },
      { id: 'e', label: '存储型 XSS：恶意脚本能否在其他用户页面执行' },
      { id: 'f', label: '评论字数统计字体大小' },
    ],
    correctChecks: ['a', 'b', 'd', 'e'],
    hint: '安全测试关注输入过滤、输出编码、存储与反射 XSS；UI 样式不是安全冒烟重点。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 3 },
  },
  {
    id: 102,
    sideArc: 'performance',
    title: '慢接口归因',
    season: 'extra',
    isSideQuest: true,
    description:
      '【性能番外 · 解锁于链路定位之后】订单详情页 P99 超 2s。APM 显示各段耗时，选出最该优先优化的环节。',
    simType: 'clickcard',
    content: '请点击【最应优先优化的瓶颈】：',
    clickVariant: 'trace',
    clickOptions: [
      { id: 'a', label: 'CDN 静态资源：80ms' },
      { id: 'b', label: 'Redis 缓存：30ms' },
      { id: 'c', label: 'Order-API：150ms' },
      { id: 'd', label: 'Elasticsearch 搜索：920ms' },
    ],
    correctClick: 'd',
    hint: '找占比最大、绝对耗时最高的环节；920ms 的 ES 通常是首要怀疑对象。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 12 },
  },
  {
    id: 103,
    sideArc: 'pipeline',
    title: 'CI 哪一步该拦 Bug',
    season: 'extra',
    isSideQuest: true,
    description:
      '【流水线番外 · 解锁于写日报之后】流水线有 4 个阶段，某次构建失败了——选出测试最该介入拦截的环节。',
    simType: 'clickcard',
    content: '点击【测试应重点保障质量门禁的环节】：',
    clickVariant: 'default',
    clickOptions: [
      { id: 'a', label: '代码提交 → 仅触发编译' },
      { id: 'b', label: '单元测试 → 开发自测' },
      { id: 'c', label: '集成测试 → 自动化回归 + 冒烟' },
      { id: 'd', label: '部署 staging → 运维发布' },
    ],
    correctClick: 'c',
    hint: '集成/回归阶段是测试门禁核心：自动化 + 冒烟应在进 staging 前拦住问题。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 10 },
  },
  {
    id: 104,
    sideArc: 'collab',
    title: 'Mock 还是连真环境',
    season: 'extra',
    isSideQuest: true,
    description:
      '【协作番外 · 解锁于企微排查之后】第三方支付沙箱不稳定，开发建议全 Mock。选出最合理的测试策略。',
    simType: 'clickcard',
    content: '请选择【最合理的测试策略】：',
    clickOptions: [
      { id: 'a', label: '全部 Mock，不再连沙箱，加快进度' },
      { id: 'b', label: '核心链路用沙箱抽测 + 非核心 Mock，不稳定时降级' },
      { id: 'c', label: '不管稳定性，坚持 100% 真实第三方' },
    ],
    correctClick: 'b',
    hint: '真实链路验证核心价值，Mock 保进度；不稳定时要有降级方案而非二选一极端。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 7 },
  },
  {
    id: 105,
    sideArc: 'compat',
    title: 'H5 兼容性矩阵',
    season: 'extra',
    isSideQuest: true,
    description:
      '【兼容番外 · 解锁于主线 15 关后】活动 H5 要在微信内打开。资源有限，圈出必测环境组合。',
    simType: 'checklist',
    content: '勾选【必须覆盖】的兼容性测试项：',
    checklistItems: [
      { id: 'a', label: 'iOS 微信内置浏览器（WKWebView）' },
      { id: 'b', label: 'Android 微信内置浏览器' },
      { id: 'c', label: 'IE6 浏览器' },
      { id: 'd', label: '弱网 3G 下首屏加载' },
      { id: 'e', label: '运营后台按钮配色' },
      { id: 'f', label: '微信分享卡片标题/缩略图显示' },
    ],
    correctChecks: ['a', 'b', 'd', 'f'],
    hint: 'H5 必测微信双端 + 分享链路 + 弱网；IE6 和后台配色通常不是 H5 首发重点。',
    xpReward: 20,
    unlock: { type: 'mainCount', min: 15 },
  },
  {
    id: 106,
    sideArc: 'strategy',
    title: '冒烟还是全量',
    season: 'extra',
    isSideQuest: true,
    description:
      '【策略番外 · 解锁于技术面之后】发版前只剩 3 小时，800 条用例跑不完。选出最合理的策略。',
    simType: 'clickcard',
    content: '请选择【最合理的测试策略】：',
    clickOptions: [
      { id: 'a', label: '全量 800 条跑完，跑不完就不签字' },
      { id: 'b', label: '按风险选冒烟集：本次改动 + 核心流程 + 历史高频 Bug 区' },
      { id: 'c', label: '开发说测过了，走流程签字' },
    ],
    correctClick: 'b',
    hint: '时间不够时按风险排序：改动点 + 核心路径 + 历史缺陷区，其余排期补测。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 19 },
  },
  {
    id: 107,
    sideArc: 'data',
    title: '支付造数：用沙箱还是 Mock',
    season: 'extra',
    isSideQuest: true,
    description:
      '【数据番外 · 解锁于支付 Bug 单之后】支付联调缺测试账号和订单。选出最可落地的造数策略。',
    simType: 'clickcard',
    content: '请选择【最合理的测试数据策略】：',
    clickOptions: [
      { id: 'a', label: '全部手工造单，不用文档，想到什么测什么' },
      { id: 'b', label: '按沙箱文档造标准账号/订单，异常场景用脚本批量生成' },
      { id: 'c', label: '等开发有空了再测，数据他们随便给' },
    ],
    correctClick: 'b',
    hint: '联调要有可复用的标准数据集 + 脚本造异常，别靠「随手试一下」。',
    xpReward: 18,
    unlock: { type: 'level', levelId: 8 },
  },
  {
    id: 108,
    sideArc: 'monitor',
    title: '告警升级：先看哪条',
    season: 'extra',
    isSideQuest: true,
    description:
      '【监控番外 · 解锁于 grep 日志之后】凌晨告警群刷了 4 条，你刚接手值班。选出最该先升级处理的一条。',
    simType: 'clickcard',
    content: '点击【应最优先升级】的告警：',
    clickOptions: [
      { id: 'a', label: 'CDN 静态资源 404（仅影响图标）' },
      { id: 'b', label: '登录成功率跌至 62%（持续 15 分钟）' },
      { id: 'c', label: '单用户反馈头像上传慢' },
      { id: 'd', label: '测试环境磁盘 85%（未影响服务）' },
    ],
    correctClick: 'b',
    hint: '优先看影响面大、持续、核心链路的指标；单用户反馈和测试环境磁盘通常靠后。',
    xpReward: 20,
    unlock: { type: 'level', levelId: 23 },
  },
  {
    id: 109,
    sideArc: 'automation',
    title: '自动化先测哪条',
    season: 'extra',
    isSideQuest: true,
    description:
      '【自动化番外 · 解锁于主线 20 关后】团队只能先自动化 20 条。从下面场景里选出最值得先做的。',
    simType: 'checklist',
    content: '勾选【最适合优先自动化】的场景（可多选）：',
    checklistItems: [
      { id: 'a', label: '登录主流程（高频 + 稳定 + 核心）' },
      { id: 'b', label: '后台报表导出（每月手动测 1 次）' },
      { id: 'c', label: '支付回调验签（高风险 + 重复执行）' },
      { id: 'd', label: '首页 Banner 动画帧率' },
      { id: 'e', label: '注册页 UI 像素对比' },
    ],
    correctChecks: ['a', 'c'],
    hint: '优先自动化：高频、稳定、高风险、重复劳动多的；低频 UI 像素对比 ROI 低。',
    xpReward: 22,
    unlock: { type: 'mainCount', min: 20 },
  },
  {
    id: 110,
    sideArc: 'security',
    title: 'API 越权怎么测',
    season: 'extra',
    isSideQuest: true,
    description:
      '【安全进阶 · 解锁于 XSS 番外之后】用户中心接口上线前，安全组要求补测越权场景——圈出必须覆盖的项。',
    simType: 'checklist',
    content: '勾选用户中心 API 测试中【必须覆盖】的鉴权/越权项：',
    checklistItems: [
      { id: 'a', label: '未登录访问 /api/user/profile 应返回 401' },
      { id: 'b', label: '用户 A 的 token 访问用户 B 的订单 ID 应拒绝' },
      { id: 'c', label: '个人中心头像圆角是否为 4px' },
      { id: 'd', label: '普通用户 token 调用 /api/admin/users 应 403' },
      { id: 'e', label: '修改他人 userId 的请求体参数应被服务端校验拦截' },
      { id: 'f', label: '接口响应 JSON 缩进是否美观' },
    ],
    correctChecks: ['a', 'b', 'd', 'e'],
    hint: 'API 安全测鉴权、水平/垂直越权、参数篡改；UI 样式不是接口安全冒烟重点。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 101 },
  },
  {
    id: 111,
    sideArc: 'data',
    title: '支付对账差异归因',
    season: 'extra',
    isSideQuest: true,
    description:
      '【数据进阶 · 解锁于造数番外之后】财务对账：支付网关 100 笔成功，业务库只有 97 笔。选出最该先查的方向。',
    simType: 'clickcard',
    content: '点击【最应优先排查】的原因：',
    clickOptions: [
      { id: 'a', label: '回调延迟：3 笔仍在重试队列，尚未落库' },
      { id: 'b', label: '报表导出按钮颜色不对' },
      { id: 'c', label: '测试同学手滑多点了 3 次刷新' },
      { id: 'd', label: '财务 Excel 公式写错' },
    ],
    correctClick: 'a',
    hint: '对账差异先看异步链路：回调延迟/丢单/幂等；UI 和 Excel 通常靠后。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 107 },
  },
  {
    id: 112,
    sideArc: 'compat',
    title: '刘海屏与安全区',
    season: 'extra',
    isSideQuest: true,
    description:
      '【兼容进阶 · 解锁于 H5 矩阵之后】活动页在 iPhone 刘海屏上底部按钮被遮挡。圈出必测兼容项。',
    simType: 'checklist',
    content: '勾选刘海屏/全面屏适配中【必须验证】的项：',
    checklistItems: [
      { id: 'a', label: '底部固定按钮是否被 Home Indicator 遮挡' },
      { id: 'b', label: 'safe-area-inset-bottom 是否生效' },
      { id: 'c', label: '后台运营位图片分辨率' },
      { id: 'd', label: '横屏模式下关键操作区是否可达' },
      { id: 'e', label: 'Android 异形屏（挖孔/瀑布屏）同类场景' },
      { id: 'f', label: '分享文案标点是否全角' },
    ],
    correctChecks: ['a', 'b', 'd', 'e'],
    hint: '全面屏适配看安全区、固定底栏、横屏与 Android 异形屏；运营素材和文案标点非首发重点。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 105 },
  },
  {
    id: 113,
    sideArc: 'collab',
    title: '抓包：回调发哪去了',
    season: 'extra',
    isSideQuest: true,
    description:
      '【抓包番外 · 解锁于主线 25 关后】测试环境支付成功但订单未更新。Charles 抓到以下请求，选出问题请求。',
    simType: 'packet',
    content: '点击【最可疑、应优先排查】的请求：',
    packetRequests: [
      {
        id: 'a',
        method: 'POST',
        url: 'https://api.test.com/order/create',
        status: 200,
        summary: '创建订单 200 · 45ms',
      },
      {
        id: 'b',
        method: 'POST',
        url: 'https://pay.prod.com/notify/callback',
        status: 404,
        summary: '支付回调 404 · Host 指向生产域名',
      },
      {
        id: 'c',
        method: 'GET',
        url: 'https://cdn.test.com/static/pay-icon.png',
        status: 200,
        summary: '静态资源 200 · 12ms',
      },
    ],
    correctClick: 'b',
    hint: '回调 404 且域名指向生产——测试环境配错 notify URL 是典型联调坑。',
    xpReward: 24,
    unlock: { type: 'mainCount', min: 25 },
  },
  {
    id: 114,
    sideArc: 'security',
    title: '上传漏洞 Bug 单',
    season: 'extra',
    isSideQuest: true,
    description:
      '【安全番外 · 解锁于越权番外之后】用户头像上传未校验扩展名，可上传 .html 执行脚本。按规范提交安全 Bug 单。',
    simType: 'jira',
    content: '请填写安全 Bug 工单所有字段：',
    jiraFields: {
      summary: {
        label: 'Bug标题',
        placeholder: '概括漏洞类型与影响（如：头像上传可执行 XSS）',
        required: true,
      },
      severity: {
        label: '严重程度',
        options: ['Blocker', 'Critical', 'Major', 'Trivial'],
        required: true,
      },
      module: {
        label: '所属模块',
        options: ['登录', '支付', '订单', '个人中心'],
        required: true,
      },
      steps: {
        label: '复现步骤',
        placeholder: '1. 登录账号\n2. 进入头像上传\n3. 上传 .html 文件…',
        required: true,
        rows: 4,
      },
      expected: {
        label: '预期结果',
        placeholder: '仅允许图片格式，恶意脚本不可执行',
        required: true,
        rows: 2,
      },
      actual: {
        label: '实际结果',
        placeholder: '描述实际上传成功及脚本执行情况',
        required: true,
        rows: 2,
      },
    },
    hint: '标题含上传/XSS/扩展名；模块选个人中心；步骤写清上传 .html 及脚本执行。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 110 },
  },
  {
    id: 115,
    sideArc: 'monitor',
    title: '带上下文 grep 日志',
    season: 'extra',
    isSideQuest: true,
    description:
      '【监控番外 · 解锁于告警升级之后】ERROR 前后需要看上下文。SSH 已连上，请 grep 并带上前后 3 行。',
    simType: 'terminal',
    content: '输入命令，从 error.log 筛选 ERROR 并显示前后 3 行上下文：',
    terminalHint: '提示：grep 的 -C 参数可输出匹配行上下文',
    correctCommand: 'grep -C 3 ERROR /var/log/app/error.log',
    terminalSuccessMsg: '已输出 ERROR 及前后上下文，便于定位根因。',
    storyLogs: [
      '[2026-06-29 03:10:58] INFO  AuthController - retry login attempt',
      '[2026-06-29 03:11:01] ERROR AuthController - login timeout after 8000ms',
      '[2026-06-29 03:11:02] ERROR Gateway - upstream slow auth-server:8080',
      '[2026-06-29 03:11:05] WARN  AuthController - circuit breaker open',
    ],
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 108 },
  },
  {
    id: 116,
    sideArc: 'collab',
    title: '向 DBA 要脱敏数据',
    season: 'extra',
    isSideQuest: true,
    description:
      '【协作番外 · 解锁于造数番外之后】订单压测需要 10 万条历史订单，生产数据不能直出。在企微里向 DBA 说明需求。',
    simType: 'chat',
    content: '在企微里 @DBA 老周：说明用途、数据量、脱敏要求及希望完成时间。',
    chatGroup: '数据支持群',
    chatKeywords: [
      '脱敏',
      '订单',
      '压测',
      '数据量',
      '用途',
      '时间',
      '字段',
      '隐私',
      '导出',
      '配合',
    ],
    chatMinKeywords: 2,
    chatMinLength: 24,
    chatStructure: 'collaboration',
    chatHint: '写清：用来做什么、要多少、哪些字段要脱敏、什么时候要。',
    chatPlaceholder: '例：压测需要 10 万条脱敏订单，手机号/身份证打码，周五前…',
    criteria: '说明数据用途、规模与脱敏要求，并提出合理的时间预期。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 107 },
  },
  {
    id: 117,
    sideArc: 'strategy',
    title: 'Hotfix 冒烟范围',
    season: 'extra',
    isSideQuest: true,
    description:
      '【策略番外 · 解锁于冒烟策略之后】支付 hotfix 只改了回调 URL，1 小时内需完成冒烟。写出必测范围说明。',
    simType: 'template',
    content: '填写 hotfix 冒烟测试范围说明（两项必填）：',
    templateMinLength: 12,
    templateFields: [
      {
        field: 'scope',
        label: '🎯 必测范围',
        placeholder: '说明本次改动影响面与必测场景…',
        rows: 2,
        fieldKeywords: ['回调', '支付', '改动', 'URL', '通知', '订单', '核心'],
      },
      {
        field: 'skip',
        label: '⏭️ 可暂缓项',
        placeholder: '说明可暂不测的模块及理由…',
        rows: 2,
        fieldKeywords: ['暂缓', '无关', 'UI', '登录', '排期', '补测', '低风险'],
      },
    ],
    hint: 'Hotfix 冒烟绑 diff：回调/支付必测；无关模块写清暂缓理由与补测计划。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 106 },
  },
  {
    id: 118,
    sideArc: 'data',
    title: '冒烟通过率计算',
    season: 'extra',
    isSideQuest: true,
    description:
      '【数据番外 · 解锁于对账番外之后】本轮冒烟执行 80 条用例，72 条通过。请计算通过率（%）。',
    simType: 'calculator',
    calculatorFormula: 'density',
    content: '根据已知条件计算通过率，在下方填写结果（%，保留两位小数）：',
    calculatorFields: [
      { field: 'totalCases', label: '执行用例总数', defaultValue: 80 },
      { field: 'bugsFound', label: '通过用例数', defaultValue: 72 },
    ],
    correctResult: '90.00',
    hint: '通过率 = 通过数 ÷ 总数 × 100%。本题用「通过用例数 ÷ 执行总数」。',
    xpReward: 18,
    unlock: { type: 'sideLevel', sideLevelId: 111 },
  },
  {
    id: 119,
    sideArc: 'pipeline',
    title: '修 staging 环境配置',
    season: 'extra',
    isSideQuest: true,
    description:
      '【流水线番外 · 解锁于 CI 门禁之后】集成测试一直 404——staging 的 API 地址仍指向 localhost。改对并测连通。',
    simType: 'config',
    content: '请修改 STAGING_API_BASE，保存后测试连接，通过再提交。',
    configContent:
      'STAGING_API_BASE=http://127.0.0.1:8080\nSTAGING_DB_HOST=10.0.2.8\nSTAGING_GATEWAY=https://gw.staging.example.com',
    configKey: 'STAGING_API_BASE',
    correctValue: 'https://api.staging.example.com',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 103 },
  },
  {
    id: 120,
    sideArc: 'api',
    title: '短信接口限流验证',
    season: 'extra',
    isSideQuest: true,
    description:
      '【接口番外 · 解锁于自动化番外之后】POST /api/sms/send 上线前需验证限流与异常响应。勾选必测项。',
    simType: 'apiclient',
    apiMethod: 'POST',
    apiUrl: '/api/sms/send',
    apiRequestBody: '{\n  "phone": "13800138000"\n}',
    content: '在 API 调试工具中，勾选短信接口【必须覆盖】的验证项：',
    checklistItems: [
      { id: 'a', label: '同一手机号 60 秒内重复请求应被限流（429 或业务码）' },
      { id: 'b', label: '手机号格式非法时返回 400 与明确错误信息' },
      { id: 'c', label: '响应体含 requestId 或 traceId 便于排查' },
      { id: 'd', label: '短信模板字体是否为宋体' },
      { id: 'e', label: '未登录调用是否拒绝（若接口需鉴权）' },
      { id: 'f', label: 'Content-Type 非 JSON 时的错误处理' },
    ],
    correctChecks: ['a', 'b', 'c', 'e', 'f'],
    hint: '限流接口测频率、参数校验、鉴权、Content-Type；字体与 UI 无关。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 109 },
  },
  {
    id: 121,
    sideArc: 'strategy',
    title: 'App 小版本回归',
    season: 'extra',
    isSideQuest: true,
    description:
      '【策略番外 · 解锁于主线 30 关后】App v2.3.1 只改了推送文案模板。自动化报告如下，1.5 小时手测，选必回归项。',
    simType: 'report',
    content: '请勾选【必须回归】的用例：',
    reportItems: [
      { id: 'a', title: '推送通知标题/正文展示', status: 'fail', risk: 'high' },
      { id: 'b', title: '推送点击跳转落地页', status: 'fail', risk: 'high' },
      { id: 'c', title: '修改昵称', status: 'pass', risk: 'medium' },
      { id: 'd', title: '关于页版本号显示', status: 'pass', risk: 'low' },
      { id: 'e', title: '登录主流程', status: 'pass', risk: 'high' },
    ],
    correctSelections: ['a', 'b', 'e'],
    hint: '改推送必回归 FAIL 项 + 同功能高风险 + 核心登录链路；版本号 low 可暂缓。',
    xpReward: 22,
    unlock: { type: 'mainCount', min: 30 },
  },
  {
    id: 122,
    sideArc: 'performance',
    title: '慢查询 Bug 单',
    season: 'extra',
    isSideQuest: true,
    description:
      '【性能番外 · 解锁于慢接口番外之后】订单列表接口 P99 3.2s，APM 指向 MySQL 慢查询。提交性能 Bug 单。',
    simType: 'jira',
    content: '请填写性能 Bug 工单所有字段：',
    jiraFields: {
      summary: {
        label: 'Bug标题',
        placeholder: '概括慢接口现象（如：订单列表 P99 超 3s）',
        required: true,
      },
      severity: {
        label: '严重程度',
        options: ['Blocker', 'Critical', 'Major', 'Trivial'],
        required: true,
      },
      module: {
        label: '所属模块',
        options: ['登录', '支付', '订单', '个人中心'],
        required: true,
      },
      steps: {
        label: '复现步骤',
        placeholder: '1. 登录测试账号\n2. 进入订单列表\n3. 观察加载时间…',
        required: true,
        rows: 4,
      },
      expected: {
        label: '预期结果',
        placeholder: '列表在可接受时间内加载（如 P99 < 500ms）',
        required: true,
        rows: 2,
      },
      actual: {
        label: '实际结果',
        placeholder: '描述实际 P99/等待时长及 APM 发现',
        required: true,
        rows: 2,
      },
    },
    hint: '标题含订单/慢/P99；模块选订单；实际写 3.2s 及 MySQL 慢查询线索。',
    xpReward: 22,
    unlock: { type: 'sideLevel', sideLevelId: 102 },
  },
  {
    id: 123,
    sideArc: 'compat',
    title: '系统字体缩放适配',
    season: 'extra',
    isSideQuest: true,
    description:
      '【兼容番外 · 解锁于刘海屏番外之后】Android 用户反馈「字体调大后结算按钮被裁切」。选出最该优先验证的场景。',
    simType: 'clickcard',
    content: '请点击【最应优先验证】的兼容场景：',
    clickOptions: [
      { id: 'a', label: '系统字体 200% 下结算页按钮是否完整可见可点' },
      { id: 'b', label: '深色模式下图标颜色是否更暗' },
      { id: 'c', label: 'iPhone 14 默认字体下首页轮播' },
      { id: 'd', label: '分享文案标点是否全角' },
    ],
    correctClick: 'a',
    hint: '用户反馈指向字体缩放 + 按钮裁切，应复现系统级大字体下的布局与可点击性。',
    xpReward: 20,
    unlock: { type: 'sideLevel', sideLevelId: 112 },
  },
]

export const sideArcs = [
  {
    id: 'security',
    name: '安全线',
    icon: '🛡️',
    tagline: 'XSS、注入——上线前的红线',
  },
  {
    id: 'performance',
    name: '性能线',
    icon: '⚡',
    tagline: '链路、瓶颈——别只会在日志里 grep',
  },
  {
    id: 'pipeline',
    name: '流水线',
    icon: '🔄',
    tagline: 'CI/CD 里测试站哪一步',
  },
  {
    id: 'collab',
    name: '协作进阶',
    icon: '🤝',
    tagline: 'Mock、沙箱、降级——真实项目的妥协',
  },
  {
    id: 'compat',
    name: '兼容性',
    icon: '📱',
    tagline: 'H5、微信、弱网——移动端测试常识',
  },
  {
    id: 'strategy',
    name: '策略线',
    icon: '🎯',
    tagline: '时间不够时怎么测——老手的取舍',
  },
  {
    id: 'data',
    name: '数据线',
    icon: '🧪',
    tagline: '造数、沙箱、脚本——联调不踩坑',
  },
  {
    id: 'monitor',
    name: '监控线',
    icon: '📡',
    tagline: '告警谁优先——值班第一课',
  },
  {
    id: 'automation',
    name: '自动化',
    icon: '🤖',
    tagline: 'ROI 思维：先自动哪条最值',
  },
  {
    id: 'api',
    name: '接口专项',
    icon: '🔌',
    tagline: '限流、鉴权、异常响应——接口层基本功',
  },
]

export const sideLevelIds = sideLevels.map((l) => l.id)

export function getSideLevel(id) {
  return sideLevels.find((l) => l.id === id) || null
}

export function isSideQuestId(id) {
  return id >= 101 && id <= 199
}

export function isSideQuestUnlocked(level, completedLevelIds) {
  const unlock = level.unlock
  if (!unlock) return true
  if (unlock.type === 'level') {
    return completedLevelIds.includes(unlock.levelId)
  }
  if (unlock.type === 'mainCount') {
    const mainDone = completedLevelIds.filter((id) => id >= 1 && id <= 99).length
    return mainDone >= unlock.min
  }
  if (unlock.type === 'sideLevel') {
    return completedLevelIds.includes(unlock.sideLevelId)
  }
  return false
}

export function getUnlockHint(level) {
  const unlock = level.unlock
  if (!unlock) return ''
  if (unlock.type === 'level') {
    return `完成主线第 ${unlock.levelId} 关后解锁`
  }
  if (unlock.type === 'mainCount') {
    return `主线通关 ${unlock.min} 关后解锁`
  }
  if (unlock.type === 'sideLevel') {
    return `完成番外 #${unlock.sideLevelId} 后解锁`
  }
  return '完成更多主线后解锁'
}

export function getSideArc(sideArcId) {
  return sideArcs.find((a) => a.id === sideArcId) || null
}
