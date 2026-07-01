# 测试人一生 · 软件测试闯关

备考 → 面试 → 笔试 → 入职 → 值班 → Lead。在 Jira、终端、企微、SQL、API 调试等 **20+ 种模拟工具**里完成闯关，攒 XP 升职级。

**在线玩：** https://ta321487.github.io/SoftwareTest_Simulator/

## 内容规模

| 类型     | 数量      | 说明                                                                          |
| -------- | --------- | ----------------------------------------------------------------------------- |
| 主线     | **51 关** | 按 `levelOrder` 推进，含备考、求职、笔试、入职、订单、值班、Lead 等完整职场线 |
| 番外     | **148 关** | #101 起，分三章（见下），按主线进度或番外链式解锁；单条选修链多为 **3 关** |
| 每日特训 | 1 题/日   | 完成登录模块第 5 关后解锁，按日期轮换                                         |
| 项目剧本 | 5 条线    | 登录 / 支付 / 订单 / 值班 / Lead，带 Day 进度与可选上机实操                   |

> 番外三章：**测试思维选修** 36 关 · **排查工具链** 34 关 · **业务场景选修** 78 关；单链多为 3 关。

## 玩法概览

### 主线 · 职业剧本

首页 **任务日志** 按章节串联 51 关主线：新人培训营 → 基本功加练 → 求职季 → 笔试与部门卷 → 正式入职 → 线上值班 → 测试 Lead。每关对应一种交付物（圈测试点、写用例、提 Bug、查日志、Go/No-Go 等）。

### 番外 · 三章选修

| 章节                  | 关数 | 侧重                                                                |
| --------------------- | ---- | ------------------------------------------------------------------- |
| 第一章 · 测试思维选修 | 36   | 安全、性能、协作、兼容、策略等场景判断（各 arc 3 关）              |
| 第二章 · 排查工具链   | 34   | Linux → SQL → Redis → CI → Mock → APM → Git → MQ（**推荐路线**）    |
| 第三章 · 业务场景选修 | 78   | UAT、退款、探索性、弱网、契约回归等（单链多为 3 关） |

### 项目线 · 上机实操

进入带 **项目剧本** 的主线关卡后，底部 Dock 可切换 Day，部分阶段提供 **上机实操**（不影响主线判题通关）：

| 项目      | 主线关联       | 实操模拟器                      |
| --------- | -------------- | ------------------------------- |
| 登录模块  | #1–#5、#34–#35 | 被测 App（复现 Bug / 验证修复） |
| 支付模块  | 笔试线         | 支付 App                        |
| 订单模块  | 订单组         | 监控 / APM                      |
| 线上值班  | On-call 线     | 值班面板                        |
| 测试 Lead | Lead 线        | Lead 看板                       |

### 其他系统

- **测试手札**：关卡复盘、套路卡、术语百科（含 SQL / Redis / Mock / CI 等），统一搜索
- **测试能力**：通关解锁技能成长线，可在手札查看
- **成就 · 职级 · 星级**：提交影响星级与 XP，支持弱项加练提示
- **进度备份**：导出 / 导入 JSON，支持分享成绩链接
- **移动端**：底栏 Tab + 关卡 Day 横滑条，适配手机浏览器与 GitHub Pages

## 模拟器一览

PRD 清单 · 用例模板 · Jira · 企微 · 测试报告 · API 调试 · SSH 终端 · SQL · Redis · CI 流水线 · Mock · APM · Git 发布 · 消息队列 · 抓包 · 值班 · Lead 看板 · 登录/支付 App 等（详见关卡内 `simType`）。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开终端显示的本地地址（默认 `http://localhost:5173`）。

## 构建与预览

```bash
npm run build
npm run preview
```

## 部署到 GitHub Pages

仓库 **Settings → Pages → Source** 选 **GitHub Actions**。推送 `main` 后 workflow 自动构建并发布。

若仓库名不是 `username.github.io`，构建会使用 `/repo-name/` 作为 base path（由 workflow 自动注入 `VITE_BASE`）。

## 存档说明

- 进度保存在浏览器 **localStorage**
- 首页 **档案** 可查看统计；**我的进度** 可分享成绩
- 底部 **导出存档** 下载 JSON；**导入存档** 会覆盖当前进度
- 换设备或清缓存前请先备份

## 测试

```bash
npm test
npm run lint
npm run format:check
```

端到端冒烟（**本地默认用本机 Chrome，无需下载浏览器**）：

```bash
npm run test:e2e
```

本机需已安装 [Google Chrome](https://www.google.com/chrome/)。若只有 Edge：

```powershell
$env:PLAYWRIGHT_CHANNEL="msedge"
npm run test:e2e
```

CI（GitHub Actions）会自动 `playwright install` 并使用自带 Chromium。

### 国内网络 · npm

```bash
copy .npmrc.example .npmrc
npm install
```

### 可选：下载 Playwright 自带 Chromium

一般只有 CI 或没有 Chrome 时才需要。国内镜像对 Chromium 经常 404/卡住，脚本已支持失败回退官方 CDN：

```bash
npm run playwright:install:cn
# 或强制官方 CDN（可能较慢）
npm run playwright:install
npm run test:e2e:bundled
```

若 `playwright install` 始终装不上，**直接用 `npm run test:e2e` 即可**，走本机 Chrome。

## 技术栈

Vue 3 · Vite · Pinia · Vue Router · Vitest · Playwright · ESLint · Prettier · PWA（vite-plugin-pwa）

## 仓库

https://github.com/Ta321487/SoftwareTest_Simulator
