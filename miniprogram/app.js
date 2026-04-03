App({
  onLaunch: function () {
    // 尝试从 storage 恢复会话状态
    try {
      var raw = wx.getStorageSync('mj_active_session')
      if (raw) {
        var saved = JSON.parse(raw)
        this.globalData.sessionId = saved.sessionId || null
        this.globalData.roomId = saved.roomId || null
        this.globalData.myName = saved.myName || ''
      }
    } catch (e) {
      console.error('restore session failed:', e)
    }
  },

  globalData: {
    // 服务器地址，开发时改为你的服务器 IP:端口
    baseUrl: 'https://119.91.53.223:3002/api',

    // 会话状态（替代 Pinia store）
    sessionId: null,
    roomId: null,
    myName: '',
    players: [],
    rounds: [],
    pendingResult: null,

    // 测试模式标记
    testMode: false
  },

  // 会话状态操作
  resetSession: function () {
    this.globalData.sessionId = null
    this.globalData.roomId = null
    this.globalData.myName = ''
    this.globalData.players = []
    this.globalData.rounds = []
    this.globalData.pendingResult = null
    this.globalData.testMode = false
    try { wx.removeStorageSync('mj_active_session') } catch (e) {}
  },

  saveSession: function () {
    var d = this.globalData
    if (d.sessionId && d.roomId) {
      wx.setStorageSync('mj_active_session', JSON.stringify({
        sessionId: d.sessionId,
        roomId: d.roomId,
        myName: d.myName
      }))
    }
  },

  syncFromServer: function (callback) {
    var that = this
    var sessionId = this.globalData.sessionId
    if (!sessionId) {
      if (callback) callback(false)
      return
    }
    var api = require('./utils/api')
    api.getSession(sessionId).then(function (res) {
      var s = res.session
      that.globalData.rounds = s.rounds || []
      var players = that.globalData.players
      for (var i = 0; i < players.length; i++) {
        players[i].score = (s.total_scores && s.total_scores[players[i].name]) || 0
      }
      if (callback) callback(true)
    }).catch(function () {
      if (callback) callback(false)
    })
  }
})
