// miniprogram/test_index.js
// 本地测试入口 - 无需云开发环境

Page({
  data: {
    testMode: true,  // 标记为测试模式
    testDataFile: '/test/test_data.json',
    mockVoiceResult: null,
    mockAIResult: null
  },

  onLoad() {
    console.log('=== 本地测试模式 ===')
    console.log('无需云开发环境，可直接测试UI和基础逻辑')
    console.log('================================')
    
    // 加载测试数据
    const testData = require('./test/test_data.json')
    console.log('测试数据:', testData)
  },

  // 模拟语音识别
  testVoiceToText(filePath) {
    return new Promise((resolve) => {
    setTimeout(() => {
      const mockText = this.data.mockVoiceResult || '张三自摸三番'
        console.log('模拟语音识别结果:', mockText)
        resolve({
          success: true,
          text: mockText
        })
      }, 500) // 模拟500ms延迟
    })
  },

  // 模拟AI解析
  testAIParser(text, players, currentSpeaker) {
    return new Promise((resolve) => {
    setTimeout(() => {
      const mockResult = this.data.mockAIResult || {
        success: true,
        type: '自摸',
        winner: '张三',
        loser: ['李四', '王五', '你'],
        scores: {
          '张三': 3,
          '李四': -1,
          '王五': -1,
          '你': -1
        },
        confidence: 0.95,
        raw_summary: `${text} - AI理解为：张三自摸，赢3番，      }
      }
      console.log('模拟AI解析结果:', mockResult)
      resolve(mockResult)
    }, 300) // 模拟300ms延迟
    })
  }
})
