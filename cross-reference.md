# 川麻记账 Web/小程序 功能交叉参考

> 本文档关联两个版本，便于联动更新。修改任一版功能时，对照此表确保另一版同步。

## 版本信息

| 项目 | 路径 | 框架 | 后端 |
|------|------|------|------|
| Web 版 | ~/pj_mjcalculation_web/ | Vue 3 + Vite | Express/SQLite (同一服务器) |
| 小程序版 | ~/pj_mjcalculation/ | 微信原生小程序 | Express/SQLite (共享) |

## 页面映射

| 功能 | Web 路由 | Web 文件 | 小程序页面 | 小程序文件 |
|------|----------|---------|-----------|-----------|
| 首页(房间入口) | `/` | `views/HomeView.vue` | `pages/index/index` | `pages/index/index.*` |
| 房间大厅 | `/room/:id` | `views/RoomView.vue` | `pages/room/room` | `pages/room/room.*` |
| 加入房间 | `/join/:id` | `views/JoinView.vue` | `pages/join/join` | `pages/join/join.*` |
| 游戏页 | `/game` | `views/GameView.vue` | `pages/game/game` | `pages/game/game.*` |
| 结算页 | `/settle` | `views/SettleView.vue` | `pages/settle/settle` | `pages/settle/settle.*` |
| 历史页 | `/history` | `views/HistoryView.vue` | `pages/history/history` | `pages/history/history.*` |
| 测试页 | `/test` | `views/TestView.vue` | `pages/test/test` | `pages/test/test.*` |

## 组件映射

| 功能 | Web 组件 | 小程序组件 |
|------|---------|-----------|
| 导航栏 | `components/NavBar.vue` | `components/nav-bar/` |
| 玩家卡片 | `components/PlayerCard.vue` | `components/player-card/` |
| AI确认弹窗 | `components/ConfirmModal.vue` | `components/confirm-modal/` |
| 二维码弹窗 | `components/QrModal.vue` | 内联在 room 页面 (复制房间号) |
| Tab切换 | `components/TabSwitch.vue` | 内联在 history 页面 |
| Toast/Loading | `stores/ui.js` + 自定义 | `wx.showToast/showLoading` 内置 |

## 工具模块映射

| 功能 | Web 文件 | 小程序文件 |
|------|---------|-----------|
| HTTP 客户端 | `api/index.js` (axios) | `utils/api.js` (wx.request) |
| 房间 API | `api/room.js` | `utils/api.js` 内 |
| 对局 API | `api/session.js` | `utils/api.js` 内 |
| 语音 API | `api/voice.js` | `utils/api.js` 内 |
| AI API | `api/ai.js` | `utils/api.js` 内 |
| 债务 API | `api/debt.js` | `utils/api.js` 内 |
| 录音器 | `composables/useRecorder.js` | `utils/recorder.js` |
| 实时同步 | SSE (EventSource) | `utils/websocket.js` (优先WS) + `utils/poll.js` (降级) |
| 格式化 | `utils/format.js` | `utils/format.js` |
| 常量 | `utils/constants.js` | `utils/constants.js` |
| 本地存储 | 直接用 localStorage | `utils/storage.js` |
| 状态管理 | `stores/session.js` (Pinia) | `app.js` globalData |
| 历史状态 | `stores/history.js` (Pinia) | history 页面 data |

## 实时同步映射

| 功能 | Web 版 | 小程序版 | 备注 |
|------|--------|---------|------|
| 传输方式 | SSE (单向推送) | WebSocket (双向) + 轮询 (降级) | 小程序用WS替代SSE |
| 连接管理 | EventSource 自动重连 | 指数退避重连(最多5次) | — |
| 频道订阅 | 无(SSE全量推送) | subscribe/unsubscribe | 小程序按频道订阅 |
| 心跳 | 无 | ping/pong | WS 特有 |
| 降级方案 | 无 | 自动降级到 setInterval 轮询 | 连接失败时触发 |
| 推送事件 | — | player_joined, game_started, round_added | 后端 wsManager 广播 |

## 功能差异

| 功能 | Web 版 | 小程序版 | 备注 |
|------|--------|---------|------|
| 实时同步 | SSE (推送) | WebSocket (推送，降级轮询) | 小程序体验更好 |
| 分享房间 | 二维码 + URL | onShareAppMessage + 复制 ID | 平台差异 |
| 录音格式 | webm | mp3 | 服务器均支持 |
| 音频增益 | Web Audio API 3x | 无（服务器 loudnorm 补偿） | 效果一致 |
| 浏览器恢复 | localStorage + loadFromStorage | storage + tryRecover | 逻辑一致 |
| 身份选择 | 测试模式弹窗 | 游戏页弹窗 | 逻辑一致 |
| 测试套件 | 22项自动测试 | 11项自动测试 + WS推送测试 | Web 更完整 |
| 手动付款 | + 按钮弹窗 | + 按钮弹窗 | 逻辑一致 |
| 测试页 | 有 | 有（开发阶段保留，上线前移除） | — |

## 服务器 API (共享)

修改任一版前端功能时，检查是否涉及 API 变更：

| 端点 | 用到的页面 |
|------|-----------|
| `POST /api/rooms` | 首页/创建房间 |
| `GET /api/rooms/:id` | 房间页/游戏页/恢复 |
| `POST /api/rooms/:id/join` | 加入页 |
| `POST /api/rooms/:id/leave` | 房间页 |
| `POST /api/rooms/:id/start` | 房间页 |
| `DELETE /api/rooms/:id` | 房间页(解散) |
| `POST /api/rooms/:id/end` | 结算页 |
| `POST /api/sessions` | 游戏页(测试模式) |
| `GET /api/sessions/:id` | 游戏页/轮询 |
| `PUT /api/sessions/:id/round` | 游戏页(确认/手动) |
| `PUT /api/sessions/:id/settle` | 结算页 |
| `GET /api/sessions` | 历史页 |
| `POST /api/voice/upload` | 游戏页(录音后) |
| `POST /api/voice/recognize` | 游戏页(上传后) |
| `POST /api/ai/parse` | 游戏页(识别后) |
| `GET /api/debts` | 历史页 |
| `POST /api/debts` | 结算页 |
| `PUT /api/debts/settle` | 历史页 |

## WebSocket 频道（小程序端使用）

| 频道 | 触发事件 | 后端广播位置 |
|------|---------|-------------|
| `room:{roomId}` | player_joined | rooms.js POST /:id/join |
| `room:{roomId}` | game_started | rooms.js POST /:id/start |
| `session:{sessionId}` | round_added | sessions.js PUT /:id/round |

## 联动更新检查清单

修改功能时，逐项检查：

1. [ ] Web 前端页面/组件是否更新
2. [ ] 小程序页面/组件是否更新
3. [ ] 服务器 API 是否需要变更
4. [ ] WebSocket 推送事件是否需要新增/修改
5. [ ] 本交叉参考表是否需要更新
6. [ ] 两侧 CLAUDE.md 是否需要更新
