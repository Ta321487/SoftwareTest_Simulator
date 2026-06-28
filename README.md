# 测试人一生 · 软件测试闯关

备考 → 面试 → 笔试 → 入职 → 进阶 Lead。在 Jira、终端、企微、API 调试等模拟工具里完成 33 关主线（第一季 27 + 进阶 6），攒 XP 升职级。

**在线玩：** https://ta321487.github.io/SoftwareTest_Simulator/

## 玩法概览

| 模块            | 说明                                                              |
| --------------- | ----------------------------------------------------------------- |
| 主线 33 关      | 四阶段 + 进阶线：备考、面试、笔试、入职、Lead（27 关后解锁 6 关） |
| 番外 13 关      | 安全、性能、流水线、抓包等，按主线/番外进度解锁                   |
| 每日特训        | 通关登录模块第 5 关后解锁，23 题按日期轮换                        |
| 项目剧本        | 登录/支付/订单/值班四条线的 **上机实操**（独立入口，不影响通关）  |
| 测试手札 · 百科 | 关卡复盘笔记 + 软测术语（Blocker、回归、P99 等），统一搜索        |

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

仓库 Settings → Pages → Source 选 **GitHub Actions**。推送 `main` 分支后 workflow 会自动构建并发布。

若仓库名不是 `username.github.io`，构建会使用 `/repo-name/` 作为 base path（由 workflow 自动注入）。

## 存档说明

- 进度保存在浏览器 **localStorage**
- 首页 **我的进度** 可分享成绩；底部 **导出存档** 可下载 JSON
- 换设备或清缓存前请先备份；**导入存档** 会覆盖当前进度

## 测试

```bash
npm test
npm run lint
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

CI（GitHub Actions）会自动 `playwright install` 下载自带 Chromium。

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

Vue 3 · Vite · Pinia · Vue Router · Vitest
