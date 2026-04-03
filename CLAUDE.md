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
- 7 个工具模块：api, storage, recorder, websocket, poll, format, constants

### 后端

- 与 Web 版共享 Express 服务器（~/pj_mjcalculation_web/server/）
- 通过 HTTP API 通信，不使用 wx.cloud
- WebSocket 服务（ws 库），用于实时推送
- 需配置 `app.globalData.baseUrl` 指向服务器地址

### 技术映射

| 功能 | Web 版 | 小程序版 |
|------|--------|---------|
| HTTP 请求 | axios | wx.request (utils/api.js) |
| 状态管理 | Pinia store | app.globalData |
| 实时同步 | SSE (EventSource) | WebSocket (优先) / 轮询 (降级) |
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
| `miniprogram/utils/websocket.js` | WebSocket 客户端（优先WS，降级轮询） |
| `miniprogram/utils/poll.js` | 轮询工具（WS 降级方案） |
| `miniprogram/pages/game/game.js` | 核心游戏逻辑 |
| `miniprogram/pages/room/room.js` | 房间大厅 |
| `miniprogram/pages/test/test.js` | 自动测试页（11项测试） |
| `miniprogram/components/confirm-modal/` | AI 结果确认弹窗 |

### 数据流

1. **录音**：按住按钮 -> wx.getRecorderManager() 录制 mp3 -> 松开获得 tempFilePath
2. **上传**：wx.uploadFile() 上传到 /api/voice/upload -> 获得 audioId
3. **识别**：POST /api/voice/recognize -> 腾讯云 ASR -> 文本
4. **解析**：POST /api/ai/parse -> GLM-4-flash -> 结构化分数
5. **确认**：用户在 confirm-modal 中调整分数（总和必须为 0）
6. **保存**：PUT /api/sessions/:id/round -> 更新分数

### 实时同步机制

小程序使用 WebSocket 优先，自动降级到轮询：

**WebSocket（websocket.js）**
- 连接 wss://host:port，订阅频道（session:xxx / room:xxx）
- 收到推送作为信号，再拉取完整数据回调（保证一致性）
- 指数退避重连（最多 5 次，最大 16s）
- 推送事件：player_joined, game_started, round_added
- ping/pong 心跳

**降级到轮询（poll.js）**
- WS 连接失败时自动启动 setInterval 轮询
- 游戏页：每 3 秒 GET /api/sessions/:id
- 房间页：每 2 秒 GET /api/rooms/:id

**页面生命周期**
- onHide/onUnload 停止订阅
- onShow 立即同步 + 重启订阅

### 自动测试（test 页面）

11 项串行测试，覆盖全链路：
1. 后端 API 连接
2. 创建房间
3. 加入房间
4. 开始对局
5. 添加一局（自摸）
6. 添加第二局（点炮）
7. 查询对局
8. 结算
9. 结束对局
10. WebSocket 连接
11. WebSocket 推送（player_joined, game_started, round_added）

另有：模拟测试（testVoice/testAI/testFull）、WebSocket 单项测试（testWS/testWSPush）、快速开桌（quickStart）

### 与 Web 版的差异

- 无二维码显示（使用 onShareAppMessage 分享 + 复制房间 ID）
- 无 SSE（使用 WebSocket，降级到轮询）
- 录音直出 mp3（服务器无需 webm 转换）
- 无 Web Audio API 增益（服务器 loudnorm 补偿）
- test 页面（开发阶段保留，上线前移除）

## Development

```
# 使用微信开发者工具打开此项目
# 1. 安装微信开发者工具
# 2. 导入项目，目录选择 ~/pj_mjcalculation/miniprogram
# 3. AppID: wxbafe523acebebd37
# 4. 在 app.js 中修改 baseUrl 为你的服务器地址

# 开发时关闭域名校验
# project.config.json 中 urlCheck: false
```

## Configuration

| 配置项 | 文件 | 字段 | 当前值 |
|--------|------|------|--------|
| AppID | project.config.json | appid | wxbafe523acebebd37 |
| 服务器地址 | app.js | globalData.baseUrl | https://119.91.53.223:3002/api |
| 域名校验 | project.config.json | setting.urlCheck | false（开发模式） |
| test 页面 | app.json | pages | 保留（上线前移除） |

## 关联项目

- Web 版：~/pj_mjcalculation_web/
- 交叉参考文档：~/pj_mjcalculation/cross-reference.md

## Mahjong Rules (川麻)

- 自摸 (Self-draw): Winner +N, others each pay equally
- 点炮 (Discard win): Winner +N from discarder only
- Scores must sum to zero across all players
- Common phrases: "自摸" = "自己摸到" = "自", "点炮" = "放炮" = "出炮"
