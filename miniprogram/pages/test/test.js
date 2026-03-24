// miniprogram/pages/test/test.js
// 本地测试页面 - 无需云环境

const testData = require('../../test/test_data.json')
const { LocalStorageManager } = require('../../test/test_utils.js')

Page({
  data: {
    testMode: true,
    cloudEnabled: false,
    mockVoiceText: '张三自摸三番',
    mockAIJson: JSON.stringify({
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
      raw_summary: '张三自摸，赢3番'
    }, null, 2),
    testResult: ''
  },

  onLoad() {
    console.log('=== 本地测试模式 ===')
    console.log('测试数据:', testData)
    
    // 初始化本地存储管理器
    this.storageManager = new LocalStorageManager()
    
    // 检查云开发环境
    this.checkCloudStatus()
  },

  // 检查云开发状态
  checkCloudStatus() {
    try {
      if (wx.cloud) {
        this.setData({ cloudEnabled: true })
        console.log('云开发环境可用')
      }
    } catch (err) {
      console.log('云开发环境不可用，使用本地模式')
    }
  },

  // 设置模拟语音文本
  setMockVoice(e) {
    this.setData({ mockVoiceText: e.detail.value })
  },

  // 设置模拟AI结果
  setMockAI(e) {
    this.setData({ mockAIJson: e.detail.value })
  },

  // 测试语音识别
  runVoiceTest() {
    wx.showLoading({ title: '测试中...' })
    
    setTimeout(() => {
      const mockResult = {
        success: true,
        text: this.data.mockVoiceText
      }
      
      this.setData({ 
        testResult: `✅ 语音识别测试成功\n识别结果: ${this.data.mockVoiceText}` 
      })
      wx.hideLoading()
    }, 500)
  },

  // 测试AI解析
  runAITest() {
    wx.showLoading({ title: '测试中...' })
    
    setTimeout(() => {
      try {
        const aiResult = JSON.parse(this.data.mockAIJson)
        
        this.setData({ 
          testResult: `✅ AI解析测试成功\n解析结果:\n${JSON.stringify(aiResult, null, 2)}` 
        })
      } catch (err) {
        this.setData({ 
          testResult: `❌ JSON格式错误\n错误: ${err.message}` 
        })
      }
      wx.hideLoading()
    }, 500)
  },

  // 完整流程测试
  runFullTest() {
    wx.showLoading({ title: '完整流程测试...' })
    
    setTimeout(() => {
      const voiceResult = {
        success: true,
        text: this.data.mockVoiceText
      }
      
      try {
        const aiResult = JSON.parse(this.data.mockAIJson)
        
        const fullResult = {
          语音识别: voiceResult,
          AI解析: aiResult,
          时间: new Date().toLocaleString()
        }
        
        this.setData({ 
          testResult: `✅ 完整流程测试成功\n\n流程详情:\n${JSON.stringify(fullResult, null, 2)}` 
        })
      } catch (err) {
        this.setData({ 
          testResult: `❌ 流程测试失败\n错误: ${err.message}` 
        })
      }
      wx.hideLoading()
    }, 1000)
  }
})
