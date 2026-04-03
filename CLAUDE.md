# CLAUDE.md - 川麻记账小程序版

## Working Principles

- Think before acting. Read existing files before writing code.
- Be concise in output but thorough in reasoning.
- Prefer editing over rewriting whole files.
- Do not re-read files you have already read.
- No sycophantic openers or closing fluff.
- Keep solutions simple and direct.
- User instructions always override this file.

## Project Overview

川麻记账小程序版 — 基于微信小程序的川麻记账工具，通过语音输入完成记账。与 Web 版（~/pj_mjcalculation_web/）共享同一个 Express 后端。

## Architecture

### 小程序端 (`miniprogram/`)

- **原生微信小程序**框架（非 Taro/uni-app）
- 状态管理：`app.globalData`（替代 Web 版的 Pinia store）
- 7 个页面：index, room, join, game, settle, history, test
- 3 个组件：nav-bar, player-card, confirm-modal
- 6 个工具模块：api, storage, recorder, poll, format, constants

### 后端

- 与 Web 版共享 Express 服务器（~/pj_mjcalculation_web/server/）
- 通过 HTTP API 通信，不使用 wx.cloud
- 需配置 `app.globalData.baseUrl` 指向服务器地址

### 技术映射

| 功能 | Web 版 | 小程序版 |
|------|--------|---------|
| HTTP 请求 | axios | wx.request (utils/api.js) |
| 状态管理 | Pinia store | app.globalData |
| 实时同步 | SSE (EventSource) | 轮询 setInterval |
| 录音 | MediaRecorder + Web Audio API | wx.getRecorderManager() |
| 音频上传 | FormData | wx.uploadFile() |
| 本地存储 | localStorage | wx.setStorageSync |
| 路由 | Vue Router | wx.navigateTo/redirectTo |
| 页面可见性 | visibilitychange | onShow/onHide |

### API 端点

与 Web 版完全一致，参见 ~/pj_mjcalculation_web/CLAUDE.md 的 Server 部分。

### 关键文件

| 文件 | 说明 |
|------|------|
| `miniprogram/app.js` | 入口，globalData 含会话状态 |
| `miniprogram/utils/api.js` | HTTP 客户端，封装所有 API 调用 |
| `miniprogram/utils/storage.js` | 本地存储封装 |
| `miniprogram/utils/recorder.js` | 录音器封装 |
| `miniprogram/utils/poll.js` | 轮询工具（替代 SSE） |
| `miniprogram/pages/game/game.js` | 核心游戏逻辑 |
| `miniprogram/pages/room/room.js` | 房间大厅 |
| `miniprogram/components/confirm-modal/` | AI 结果确认弹窗 |

### 数据流

1. **录音**：按住按钮 -> wx.getRecorderManager() 录制 mp3 -> 松开获得 tempFilePath
2. **上传**：wx.uploadFile() 上传到 /api/voice/upload -> 获得 audioId
3. **识别**：POST /api/voice/recognize -> 腾讯云 ASR -> 文本
4. **解析**：POST /api/ai/parse -> GLM-4-flash -> 结构化分数
5. **确认**：用户在 confirm-modal 中调整分数（总和必须为 0）
6. **保存**：PUT /api/sessions/:id/round -> 更新分数

### 轮询机制

小程序不支持 SSE，使用 setInterval 轮询：
- 游戏页：每 3 秒 GET /api/sessions/:id
- 房间页：每 2 秒 GET /api/rooms/:id
- onHide 停止轮询，onShow 立即同步

### 与 Web 版的差异

- 无二维码显示（使用 onShareAppMessage 分享 + 复制房间 ID）
- 无 SSE（使用轮询）
- 录音直出 mp3（服务器无需 webm 转换）
- 无 Web Audio API 增益（服务器 loudnorm 补偿）

## Development

```
# 使用微信开发者工具打开此项目
# 1. 安装微信开发者工具
# 2. 导入项目，目录选择 ~/pj_mjcalculation/miniprogram
# 3. AppID 使用测试号或填入真实 AppID
# 4. 在 app.js 中修改 baseUrl 为你的服务器地址

# 开发时关闭域名校验
# 微信开发者工具 -> 详情 -> 本地设置 -> 勾选"不校验合法域名"
```

## 配置

1. `app.js` -> `globalData.baseUrl` -> 修改为服务器地址
2. `project.config.json` -> `appid` -> 填入小程序 AppID
3. `project.config.json` -> `urlCheck.rules` -> 添加服务器域名白名单

## 关联项目

- Web 版：~/pj_mjcalculation_web/
- 交叉参考文档：~/pj_mjcalculation/cross-reference.md

## Mahjong Rules (川麻)

- 自摸 (Self-draw): Winner +N, others each pay equally
- 点炮 (Discard win): Winner +N from discarder only
- Scores must sum to zero across all players
- Common phrases: "自摸" = "自己摸到" = "自", "点炮" = "放炮" = "出炮"
