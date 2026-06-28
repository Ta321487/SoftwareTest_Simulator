# 测试人一生 · 软件测试闯关

备考 → 面试 → 笔试 → 入职。在 Jira、终端、企微、API 调试等模拟工具里完成 27 关主线，攒 XP 升职级。

**在线玩：** https://ta321487.github.io/SoftwareTest_Simulator/

## 玩法概览

| 模块 | 说明 |
|------|------|
| 主线 33 关 | 四阶段 + 进阶线：备考、面试、笔试、入职、Lead（27 关后解锁 6 关） |
| 番外 13 关 | 安全、性能、流水线、抓包等，按主线/番外进度解锁 |
| 每日特训 | 通关登录模块第 5 关后解锁，23 题按日期轮换 |
| 项目剧本 | 登录/支付/订单/值班四条线的 **上机实操**（独立入口，不影响通关） |
| 测试手札 | 通关复盘与参考写法，支持搜索 |

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
```

## 技术栈

Vue 3 · Vite · Pinia · Vue Router · Vitest
