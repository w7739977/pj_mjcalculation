# pj_mjcalculation - 川麻记账小程序

四川麻将语音记账小程序，通过语音输入自动记录对局分数。

## 功能特性

- 语音输入：说话自动识别，无需手动输入
- AI解析：智能理解川麻规则，自动计算番数
- 实时记分：对局中实时显示各玩家分数
- 结算追踪：自动计算欠账，支持结清标记
- 历史记录：查看历史对局，累计欠账统计
- WebSocket 实时同步：房间/对局状态推送，自动降级到轮询

---

## 项目架构

```
pj_mjcalculation/
├── miniprogram/                    # 小程序前端
│   ├── pages/
│   │   ├── index/                 # 首页
│   │   ├── room/                  # 房间大厅
│   │   ├── join/                  # 加入房间
│   │   ├── game/                  # 游戏页（核心）
│   │   ├── settle/                # 结算页
│   │   ├── history/               # 历史记录页
│   │   └── test/                  # 自动测试页
│   │
│   ├── components/
│   │   ├── nav-bar/               # 导航栏
│   │   ├── player-card/           # 玩家卡片
│   │   └── confirm-modal/         # AI结果确认弹窗
│   │
│   ├── utils/
│   │   ├── api.js                 # HTTP客户端（wx.request）
│   │   ├── storage.js             # 本地存储封装
│   │   ├── recorder.js            # 录音器封装
│   │   ├── websocket.js           # WebSocket客户端（优先WS，降级轮询）
│   │   ├── poll.js                # 轮询工具（WS降级方案）
│   │   ├── format.js              # 格式化工具
│   │   └── constants.js           # 常量定义
│   │
│   ├── app.js                     # 小程序入口
│   ├── app.json                   # 全局配置
│   ├── app.wxss                   # 全局样式
│   └── project.config.json        # 项目配置
│
├── cross-reference.md             # Web/小程序功能交叉参考
├── CLAUDE.md                      # 开发指南
└── README.md
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | 微信小程序原生 |
| 后端服务 | Express/SQLite（与 Web 版共享） |
| 实时同步 | WebSocket（ws 库），降级到轮询 |
| 语音识别 | 腾讯云 ASR |
| AI解析 | GLM-4-flash |
| 通信方式 | HTTP API + WebSocket |

---

## 配置

1. **服务器地址** — `app.js` → `globalData.baseUrl` → 改为你的服务器地址
2. **AppID** — `project.config.json` → `appid` → 填入小程序 AppID
3. **域名校验** — 开发阶段 `urlCheck: false`，上线前改为 `true` 并配置白名单

---

## 开发进度

### 已完成

- [x] 项目初始化，原生微信小程序框架
- [x] 重写为 HTTP API 通信，去除 wx.cloud
- [x] 7 个页面 + 3 个组件 + 7 个工具模块
- [x] 完整游戏流程（创建房间→加入→开始→语音记账→结算）
- [x] 语音录音 → 上传 → ASR识别 → AI解析 → 确认 → 保存
- [x] WebSocket 实时同步（房间状态、对局分数推送）
- [x] WS 自动降级到轮询（指数退避重连）
- [x] 自动测试页（11项测试：API全链路 + WebSocket推送）
- [x] 快速开桌（测试模式，4人直接开始）
- [x] 会话恢复（localStorage 持久化）
- [x] 手动付款功能
- [x] 身份选择（测试模式弹窗）

### 进行中

- [ ] 微信开发者工具真机调试测试
- [ ] test 页面后续移除

### 待开发

- [ ] UI优化
- [ ] 上线部署（域名配置、HTTPS证书、域名校验白名单）

---

## 关联项目

- Web 版：~/pj_mjcalculation_web/
- 后端：~/pj_mjcalculation_web/server/
- 交叉参考：cross-reference.md
