// 云函数：aiParser
// AI解析川麻记账

const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  const { text, players, currentSpeaker } = event
  
  // AI Prompt
  const prompt = `你是一个川麻记分助手，负责从自然语言描述中解析麻将结果。

## 玩家信息
当前四位玩家：${players.join('、')}（分别是：东、南、西、北位）
当前说话的玩家是：${currentSpeaker}

## 川麻基本规则
- 胡牌方式：自摸 或 点炮
- 自摸：赢家赢3番（其他三人各出1番）
- 点炮：赢家赢2番（点炮者出2番，其他两人不出）
- 番数可以叠加（杠、花、特殊牌型等）
- 常见说法："自摸"="自己摸到"="自"
- 常见说法："点炮"="放炮"="出炮"="胡他的"

## 你的任务
从用户输入中提取：
1. 赢家是谁
2. 输家是谁（点炮是1人，自摸是3人）
3. 番数变化（正数=赢，负数=输）
4. 四人番数之和必须为0，否则报错

## 输出格式（只输出JSON，不要任何解释）
{
 "success": true,
 "type": "自摸|点炮",
 "winner": "玩家名",
 "loser": ["玩家名"],
 "scores": {
 "张三": +3,
 "李四": -1,
 "王五": -1,
 "你": -1
 },
 "confidence": 0.95,
 "raw_summary": "张三自摸，赢3番，其余各出1番"
}

若解析失败或信息不足：
{
 "success": false,
 "error": "无法确定点炮者是谁，请重新描述"
}

用户输入：${text}`

  try {
    // 调用Claude API（实际开发中需要配置）
    // const result = await callClaudeAPI(prompt)
    
    // 模拟返回结果
    const mockResult = {
      success: true,
      type: '自摸',
      winner: players[0],
      loser: players.filter(p => p !== players[0]),
      scores: {},
      confidence: 0.95,
      raw_summary: `${players[0]}自摸，赢3番`
    }
    
    // 生成scores
    players.forEach(player => {
      if (player === mockResult.winner) {
        mockResult.scores[player] = 3
      } else {
        mockResult.scores[player] = -1
      }
    })
    
    return mockResult
  } catch (err) {
    console.error('AI解析失败', err)
    return {
      success: false,
      error: '解析失败，请重试'
    }
  }
}

// 调用Claude API
async function callClaudeAPI(prompt) {
  const https = require('https')
  
  return new Promise((resolve, reject) => {
    // 实际开发中需要配置Claude API
    // 这里仅作示例
    resolve({
      success: true,
      type: '自摸',
      winner: '张三',
      scores: { '张三': 3, '李四': -1, '王五': -1, '你': -1 },
      confidence: 0.95
    })
  })
}
