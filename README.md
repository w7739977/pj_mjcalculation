# pj_mjcalculation - 川麻记账小程序

四川麻将语音记账小程序，通过语音输入自动记录对局分数。

## 功能特性

- 🎤 **语音输入**：说话自动识别，无需手动输入
- 🤖 **AI解析**：智能理解川麻规则，自动计算番数
- 📊 **实时记分**：对局中实时显示各玩家分数
- 💰 **结算追踪**：自动计算欠账，支持结清标记
- 📜 **历史记录**：查看历史对局，累计欠账统计

## 项目结构

```
pj_mjcalculation/
├── miniprogram/              # 小程序前端
│   ├── pages/
│   │   ├── index/           # 首页（记分）
│   │   ├── confirm/         # 确认弹窗
│   │   ├── settle/          # 结算页
│   │   └── history/         # 历史记录
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── project.config.json
│   └── sitemap.json
├── cloudfunctions/          # 云函数
│   ├── voiceToText/         # 语音转文字（讯飞）
│   └── aiParser/            # AI解析（Claude）
├── docs/                    # 文档
│   ├── ai_prompt.md        # AI解析Prompt
│   └── data_structure.md   # 数据结构设计
└── README.md
```

## 技术栈

- **前端**：微信小程序原生框架
- **后端**：微信云开发
- **语音识别**：讯飞语音API
- **AI解析**：Claude API
- **数据库**：云开发数据库

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

## 川麻规则

- **自摸**：赢家+3番，其他三人各-1番
- **点炮**：赢家+2番，点炮者-2番，其他两人不变
- 番数可叠加（杠、花、特殊牌型等）

## 开发进度

- [x] 项目初始化
- [x] 基础页面结构
- [x] 数据结构设计
- [x] AI解析Prompt设计
- [ ] 语音识别集成
- [ ] AI解析集成
- [ ] 结算功能
- [ ] 历史记录
- [ ] 欠账追踪

## Git提交记录

- `ea3b93d` Initial commit: 项目初始化
- `8edcf6f` feat: 添加川麻记账小程序基础结构和文档
- `feat: 调整为微信小程序标准目录结构`

## License

MIT
