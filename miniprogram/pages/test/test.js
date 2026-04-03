var api = require('../../utils/api')
var app = getApp()

Page({
  data: {
    mockVoiceText: '张三自摸三番',
    mockAIJson: '',
    testResult: '',
    presets: ['张三自摸三番', '李四点炮给王五', '赵六自摸加杠', '王五放炮给张三']
  },

  onLoad: function () {
    this.setData({
      mockAIJson: JSON.stringify({
        success: true,
        type: '自摸',
        winner: '张三',
        loser: ['李四', '王五', '赵六'],
        scores: { '张三': 3, '李四': -1, '王五': -1, '赵六': -1 },
        confidence: 0.95,
        raw_summary: '张三自摸，赢3番'
      }, null, 2)
    })
  },

  onVoiceInput: function (e) {
    this.setData({ mockVoiceText: e.detail.value })
  },

  setPreset: function (e) {
    this.setData({ mockVoiceText: e.currentTarget.dataset.text })
  },

  onAIInput: function (e) {
    this.setData({ mockAIJson: e.detail.value })
  },

  testVoice: function () {
    this.setData({
      testResult: '语音识别测试成功\n识别结果: ' + this.data.mockVoiceText + '\n(模拟模式 - 跳过实际ASR调用)'
    })
  },

  testAI: function () {
    try {
      var result = JSON.parse(this.data.mockAIJson)
      var total = 0
      var keys = Object.keys(result.scores)
      for (var i = 0; i < keys.length; i++) total += result.scores[keys[i]]
      this.setData({
        testResult: 'AI解析测试成功\n\n解析结果:\n' + JSON.stringify(result, null, 2) + '\n\n分数总和验证: ' + (total === 0 ? '通过 (总和=0)' : '失败 (总和=' + total + ')')
      })
    } catch (err) {
      this.setData({ testResult: 'JSON格式错误: ' + err.message })
    }
  },

  testFull: function () {
    try {
      var voiceResult = { success: true, text: this.data.mockVoiceText }
      var aiResult = JSON.parse(this.data.mockAIJson)
      var total = 0
      var keys = Object.keys(aiResult.scores)
      for (var i = 0; i < keys.length; i++) total += aiResult.scores[keys[i]]
      this.setData({
        testResult: '完整流程测试成功\n\n1. 语音识别: ' + voiceResult.text + '\n2. AI解析: ' + aiResult.raw_summary + '\n3. 分数验证: ' + (total === 0 ? '通过' : '失败(总和' + total + ')') + '\n4. 赢家: ' + aiResult.winner + '\n5. 类型: ' + aiResult.type + '\n\n' + JSON.stringify(aiResult, null, 2)
      })
    } catch (err) {
      this.setData({ testResult: '流程测试失败: ' + err.message })
    }
  },

  testBackend: function () {
    var that = this
    api.getSessions().then(function (res) {
      that.setData({
        testResult: '后端连接成功!\n\n对局数量: ' + (res.sessions ? res.sessions.length : 0) + '\n响应: ' + JSON.stringify(res, null, 2).substring(0, 500)
      })
    }).catch(function (err) {
      that.setData({
        testResult: '后端连接失败: ' + err.message + '\n请确保后端服务已启动 (cd server && npm start)'
      })
    })
  },

  quickStart: function () {
    var defaults = ['张三', '李四', '王五', '赵六']
    var that = this
    wx.showLoading({ title: '初始化...' })
    api.createSession(defaults).then(function (res) {
      wx.hideLoading()
      app.globalData.sessionId = res.session.id
      app.globalData.players = defaults.map(function (n) { return { name: n, score: 0 } })
      app.globalData.rounds = []
      app.globalData.myName = ''
      app.globalData.testMode = true
      wx.navigateTo({ url: '/pages/game/game?test=1' })
    }).catch(function (err) {
      wx.hideLoading()
      that.setData({ testResult: '快速开桌失败: ' + err.message })
    })
  }
})
