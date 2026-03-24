# pj_mjcalculation - 川麻记账小程序

四川麻将语音记账小程序，通过语音输入自动记录对局分数。

## 功能特性

- 🎤 **语音输入**：说话自动识别，无需手动输入
- 🤖 **AI解析**：智能理解川麻规则，自动计算番数
- 📊 **实时记分**：对局中实时显示各玩家分数
- 💰 **结算追踪**：自动计算欠账，支持结清标记
- 📜 **历史记录**：查看历史对局，累计欠账统计

---

## 项目架构

```
pj_mjcalculation/
│
├── miniprogram/                    # 小程序前端
│   ├── pages/
│   │   ├── index/                 # 首页（记分页面）✅
│   │   │   ├── index.js           # 页面逻辑
│   │   │   ├── index.wxml         # 页面结构
│   │   │   ├── index.wxss         # 页面样式
│   │   │   └── index.json         # 页面配置
│   │   │
│   │   ├── confirm/               # 确认弹窗页 ✅
│   │   │   ├── confirm.js         # 确认逻辑
│   │   │   ├── confirm.wxml       # AI理解结果展示
│   │   │   ├── confirm.wxss       # 弹窗样式
│   │   │   └── confirm.json
│   │   │
│   │   ├── settle/                # 结算页 ✅
│   │   │   ├── settle.js          # 结算逻辑
│   │   │   ├── settle.wxml        # 排名+欠账展示
│   │   │   ├── settle.wxss
│   │   │   └── settle.json
│   │   │
│   │   └── history/               # 历史记录页 ✅
│   │       ├── history.js         # 历史查询逻辑
│   │       ├── history.wxml       # 对局列表+欠账清单
│   │       ├── history.wxss
│   │       └── history.json
│   │
│   ├── app.js                     # 小程序入口 ✅
│   ├── app.json                   # 全局配置 ✅
│   ├── app.wxss                   # 全局样式 ✅
│   ├── project.config.json        # 项目配置 ✅
│   ├── project.private.config.json # 私有配置 ✅
│   └── sitemap.json               # 站点地图 ✅
│
├── cloudfunctions/                 # 云函数
│   ├── voiceToText/               # 语音转文字 ⚠️ 待集成讯飞API
│   │   ├── index.js               # 云函数入口
│   │   └── package.json
│   │
│   └── aiParser/                  # AI解析 ⚠️ 待集成Claude API
│       ├── index.js               # 云函数入口
│       └── package.json
│
├── docs/                           # 项目文档
│   ├── ai_prompt.md               # AI解析Prompt设计 ✅
│   └── data_structure.md          # 数据库结构设计 ✅
│
├── .gitignore                      # Git忽略规则 ✅
└── README.md                       # 项目说明 ✅
```

**状态说明：**
- ✅ 已完成
- ⚠️ 待完善
- ❌ 未开始

---

## 技术栈

| 类别 | 技术 | 状态 |
|------|------|------|
| **前端框架** | 微信小程序原生 | ✅ |
| **UI组件** | 自定义组件 | ✅ |
| **后端服务** | 微信云开发 | ✅ |
| **语音识别** | 讯飞语音API | ⚠️ 待集成 |
| **AI解析** | Claude API | ⚠️ 待集成 |
| **数据库** | 云开发数据库 | ✅ |

---

## 数据流架构

```
┌─────────────┐
│  用户语音   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│  语音识别API    │  ← 讯飞语音
│  voiceToText    │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  文字："张三自摸"│
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  AI解析API      │  ← Claude
│  aiParser       │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  结构化数据     │
│  {winner,scores}│
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  确认弹窗       │
│  用户确认/重说   │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  云数据库       │
│  sessions/debts │
└─────────────────┘
```

---

## 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:w7739977/pj_mjcalculation.git
cd pj_mjcalculation
```

### 2. 导入微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram` 目录
3. 填入你的 AppID

### 3. 配置云开发环境

1. 开通云开发
2. 创建数据库集合：
   - `sessions` - 对局记录
   - `debts` - 欠账记录
   - `players` - 玩家信息
3. 部署云函数

### 4. 配置API密钥

- 在 `cloudfunctions/voiceToText/index.js` 中配置讯飞API密钥
- 在 `cloudfunctions/aiParser/index.js` 中配置Claude API密钥

---

## 川麻规则

| 类型 | 规则 | 番数变化 |
|------|------|----------|
| **自摸** | 赢家自己摸到 | 赢家+3，其他三人各-1 |
| **点炮** | 他人打出被胡 | 赢家+2，点炮者-2 |
| **叠加** | 杠、花、特殊牌型 | 番数累加 |

---

## 开发进度

### ✅ 已完成

- [x] **项目初始化** - Git仓库创建
- [x] **基础页面结构** - 4个核心页面
  - [x] index（记分页）
  - [x] confirm（确认页）
  - [x] settle（结算页）
  - [x] history（历史页）
- [x] **数据结构设计** - 数据库schema
- [x] **AI解析Prompt** - 语音理解逻辑
- [x] **全局样式** - app.wxss
- [x] **项目配置** - project.config.json

### ⚠️ 进行中

- [ ] **语音识别集成** - 接入讯飞API
- [ ] **AI解析集成** - 接入Claude API

### 📝 待开发

- [ ] **结算功能** - 欠账计算逻辑
- [ ] **历史记录** - 对局查询
- [ ] **欠账追踪** - 结清标记
- [ ] **UI优化** - 交互体验提升
- [ ] **测试** - 功能测试

---

## Git提交记录

| 提交ID | 类型 | 说明 |
|--------|------|------|
| `ea3b93d` | 🎉 init | Initial commit: 项目初始化 |
| `8edcf6f` | ✨ feat | 添加川麻记账小程序基础结构和文档 |
| `13f19e6` | 🔨 refactor | 调整为微信小程序标准目录结构 |

---

## 开发路线图

### 第1周：基础功能 ✅
- [x] 项目搭建
- [x] 页面结构
- [x] 数据设计

### 第2周：核心功能 🔄
- [ ] 语音识别
- [ ] AI解析
- [ ] 记分流程

### 第3周：完善功能 📋
- [ ] 结算逻辑
- [ ] 历史记录
- [ ] 欠账追踪

---

## License

MIT

---

**开发者：** w7739977  
**邮箱：** weiye36@gmail.com  
**GitHub：** https://github.com/w7739977/pj_mjcalculation
