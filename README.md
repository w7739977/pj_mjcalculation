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
│   │   ├── settle/                # 结算页 ✅
│   │   ├── history/               # 历史记录页 ✅
│   │   └── test/                  # 本地测试页 ✅
│   │
│   ├── test/                      # 测试工具
│   │   ├── test_data.json         # 测试数据
│   │   └── test_utils.js          # 测试工具类
│   │
│   ├── app.js                     # 小程序入口 ✅
│   ├── app.json                   # 全局配置 ✅
│   ├── app.wxss                   # 全局样式 ✅
│   └── project.config.json        # 项目配置 ✅
│
├── cloudfunctions/                 # 云函数
│   ├── voiceToText/               # 语音转文字 ⚠️
│   └── aiParser/                  # AI解析 ⚠️
│
├── docs/                           # 项目文档
│   ├── ai_prompt.md               # AI解析Prompt ✅
│   ├── data_structure.md          # 数据结构设计 ✅
│   └── 测试指南.md                # 详细测试说明 ✅
│
└── README.md
```

**状态说明：**
- ✅ 已完成
- ⚠️ 待完善
- ❌ 未开始

---

## 🧪 快速测试（本地模式）

### 步骤1：下载工具

https://developers.weixin.qq.com/miniprogram/devtools/download.html

### 步骤2：导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 目录选择: `pj_mjcalculation/miniprogram`
4. AppID填写: `test123` (测试号)

### 步骤3：启用测试页

修改 `app.json`:
```json
"pages": [
  "pages/test/test",  // 添加这行
  "pages/index/index",
  "pages/confirm/confirm",
  "pages/settle/settle",
  "pages/history/history"
]
```

### 步骤4：开始测试

- ✅ 测试语音识别（模拟）
- ✅ 测试AI解析（模拟）
- ✅ 测试完整流程

**优点：**
- 无需云开发环境
- 无需API密钥
- 可快速验证UI和逻辑

---

## 📋 开发进度

### ✅ 已完成

- [x] **项目初始化** - Git仓库创建
- [x] **基础页面结构** - 4个核心页面
- [x] **数据结构设计** - 数据库schema
- [x] **AI解析Prompt** - 语音理解逻辑
- [x] **全局样式** - app.wxss
- [x] **项目配置** - project.config.json
- [x] **测试功能** - 本地测试页面

### ⚠️ 进行中

- [ ] **语音识别集成** - 接入讯飞API
- [ ] **AI解析集成** - 接入Claude API

### 📝 待开发

- [ ] **结算功能** - 欠账计算逻辑
- [ ] **历史记录** - 对局查询
- [ ] **欠账追踪** - 结清标记
- [ ] **UI优化** - 交互体验提升
- [ ] **部署** - 云函数部署

---

## 🔧 技术栈

| 类别 | 技术 | 状态 |
|------|------|------|
| **前端框架** | 微信小程序原生 | ✅ |
| **UI组件** | 自定义组件 | ✅ |
| **后端服务** | 微信云开发 | ✅ |
| **语音识别** | 讯飞语音API | ⚠️ |
| **AI解析** | Claude API | ⚠️ |
| **数据库** | 云开发数据库 | ✅ |

---

## 📖 详细文档

- [测试指南](docs/测试指南.md) - 完整测试说明
- [AI Prompt](docs/ai_prompt.md) - AI解析逻辑
- [数据结构](docs/data_structure.md) - 数据库设计

---

## 📝 Git提交记录

| 提交ID | 类型 | 说明 |
|--------|------|------|
| `ea3b93d` | 🎉 init | Initial commit: 项目初始化 |
| `8edcf6f` | ✨ feat | 添加川麻记账小程序基础结构和文档 |
| `13f19e6` | 🔨 refactor | 调整为微信小程序标准目录结构 |
| `0428a35` | 📝 docs | 更新README，添加详细项目架构和开发进度 |
| `d69ec3a` | 🧪 test | 添加本地测试功能 |

---

## 🚀 开发路线图

### 第1周：基础功能 ✅
- [x] 项目搭建
- [x] 页面结构
- [x] 数据设计
- [x] 测试功能

### 第2周：核心功能 🔄
- [ ] 语音识别
- [ ] AI解析
- [ ] 记分流程

### 第3周：完善功能 📋
- [ ] 结算逻辑
- [ ] 历史记录
- [ ] 欠账追踪

---

## 📱 预览

**本地测试：** 无需任何配置，直接可用

**云环境测试：** 需要配置：
1. 微信小程序AppID
2. 云开发环境
3. 讯飞API密钥（可选）
4. Claude API密钥（可选）

---

## 📄 License

MIT

---

**开发者：** w7739977  
**邮箱：** weiye36@gmail.com  
**GitHub：** https://github.com/w7739977/pj_mjcalculation
