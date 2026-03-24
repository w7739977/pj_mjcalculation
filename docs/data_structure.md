# 数据结构设计

## 对局 Session

```javascript
{
  sessionId: "xxx",           // 唯一ID
  date: "2026-03-19",         // 对局日期
  players: ["张三", "李四", "王五", "你"],  // 四位玩家
  baseScore: 1,               // 1番=1元
  rounds: [                   // 每一局记录
    {
      roundId: 1,
      type: "自摸",           // 自摸 | 点炮
      winner: "张三",
      scores: { 
        "张三": 3, 
        "李四": -1, 
        "王五": -1, 
        "你": -1 
      },
      voiceInput: "张三自摸三番",
      timestamp: "2026-03-19T14:30:00Z"
    }
  ],
  settled: false,             // 是否已结算
  createdAt: "2026-03-19T14:00:00Z",
  updatedAt: "2026-03-19T16:00:00Z"
}
```

## 欠账记录

```javascript
{
  debtId: "xxx",
  from: "你",                 // 欠债人
  to: "张三",                 // 债权人
  amount: 9,                  // 金额
  settled: false,             // 是否已结清
  sessions: ["sessionId1", "sessionId2"],  // 相关对局
  createdAt: "2026-03-19T16:00:00Z",
  settledAt: null
}
```

## 玩家信息

```javascript
{
  playerId: "xxx",
  nickname: "张三",
  avatar: "https://...",
  openid: "微信openid",
  createdAt: "2026-03-19T14:00:00Z"
}
```

## 索引设计

### sessions 集合
- `{ date: -1 }` - 按日期查询历史对局
- `{ players: 1, date: -1 }` - 查询某玩家参与的对局

### debts 集合
- `{ from: 1, to: 1, settled: 1 }` - 查询两人间未结清欠账
- `{ settled: 1 }` - 查询所有未结清欠账
