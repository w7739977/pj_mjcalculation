var api = require('../../utils/api')
var recorder = require('../../utils/recorder')
var ws = require('../../utils/websocket')
var storage = require('../../utils/storage')
var app = getApp()

Page({
  data: {
    players: [],
    roundCount: 0,
    listening: false,
    pendingResult: null,
    isTestMode: false,
    // Manual pay dialog
    showPayDialog: false,
    payTarget: '',
    payAmount: '',
    // Identity picker
    showIdentityPicker: false
  },

  _subHandle: null,

  onLoad: function (options) {
    if (options.test === '1') {
      this.setData({ isTestMode: true })
      app.globalData.testMode = true
      this.initTestMode()
      return
    }

    var g = app.globalData
    if (!g.sessionId) {
      this.tryRecover()
    } else {
      this.loadGameData()
    }
  },

  onShow: function () {
    var g = app.globalData
    if (g.sessionId) {
      this.syncFromServer()
      this.startPolling()
    }
  },

  onHide: function () {
    this.stopPolling()
  },

  onUnload: function () {
    this.stopPolling()
  },

  // ===== Test Mode =====
  initTestMode: function () {
    var g = app.globalData
    if (!g.sessionId) {
      var defaults = ['张三', '李四', '王五', '赵六']
      var that = this
      api.createSession(defaults).then(function (res) {
        g.sessionId = res.session.id
        g.players = defaults.map(function (n) { return { name: n, score: 0 } })
        g.rounds = []
        that.setData({
          players: g.players,
          roundCount: 0
        })
        if (!g.myName) {
          that.setData({ showIdentityPicker: true })
        }
      }).catch(function (err) {
        wx.showToast({ title: '初始化失败: ' + err.message, icon: 'none' })
      })
    } else {
      this.setData({
        players: g.players,
        roundCount: (g.rounds && g.rounds.length) || 0
      })
      if (!g.myName) {
        this.setData({ showIdentityPicker: true })
      }
    }
  },

  // ===== Recovery =====
  tryRecover: function () {
    var saved = storage.loadActiveSession()
    if (saved && saved.sessionId && saved.roomId) {
      var that = this
      app.globalData.sessionId = saved.sessionId
      app.globalData.roomId = saved.roomId
      app.globalData.myName = saved.myName
      this.loadGameData()
    } else {
      wx.redirectTo({ url: '/pages/index/index' })
    }
  },

  // ===== Load Data =====
  loadGameData: function () {
    var g = app.globalData
    var that = this
    if (!g.sessionId) return

    api.getSession(g.sessionId).then(function (res) {
      var s = res.session
      g.rounds = s.rounds || []
      var names = g.players.length > 0
        ? g.players.map(function (p) { return p.name })
        : (s.players || [])
      g.players = names.map(function (n) {
        return { name: n, score: (s.total_scores && s.total_scores[n]) || 0 }
      })
      that.setData({
        players: g.players,
        roundCount: g.rounds.length
      })
    }).catch(function () {
      wx.redirectTo({ url: '/pages/index/index' })
    })
  },

  syncFromServer: function () {
    var g = app.globalData
    var that = this
    if (!g.sessionId) return

    api.getSession(g.sessionId).then(function (res) {
      var s = res.session
      var newRounds = s.rounds || []
      if (newRounds.length > g.rounds.length) {
        g.rounds = newRounds
        g.players = g.players.map(function (p) {
          return { name: p.name, score: (s.total_scores && s.total_scores[p.name]) || 0 }
        })
        that.setData({
          players: g.players,
          roundCount: g.rounds.length
        })
      }
    }).catch(function () {})
  },

  startPolling: function () {
    if (this._subHandle) return
    var that = this
    var g = app.globalData
    this._subHandle = ws.startPolling(g.sessionId, 3000, function (res) {
      if (!res) return
      var s = res.session
      var newRounds = s.rounds || []
      if (newRounds.length > g.rounds.length) {
        g.rounds = newRounds
        g.players = g.players.map(function (p) {
          return { name: p.name, score: (s.total_scores && s.total_scores[p.name]) || 0 }
        })
        that.setData({
          players: g.players,
          roundCount: g.rounds.length
        })
      }
    })
  },

  stopPolling: function () {
    if (this._subHandle) {
      ws.stopPolling(this._subHandle)
      this._subHandle = null
    }
  },

  // ===== Identity Picker =====
  pickIdentity: function (e) {
    var name = e.currentTarget.dataset.name
    app.globalData.myName = name
    this.setData({ showIdentityPicker: false })
  },

  // ===== Voice =====
  startVoice: function () {
    if (this.data.listening) return
    var that = this
    recorder.start().then(function () {
      that.setData({ listening: true })
    }).catch(function (err) {
      wx.showToast({ title: err.message || '录音失败', icon: 'none' })
    })
  },

  stopVoice: function () {
    if (!this.data.listening) return
    this.setData({ listening: false })
    var that = this
    var g = app.globalData
    recorder.stop().then(function (filePath) {
      if (!filePath) return
      wx.showLoading({ title: '识别中...' })
      return api.uploadAudio(filePath)
    }).then(function (uploadRes) {
      if (!uploadRes || !uploadRes.success) throw new Error('上传失败')
      return api.recognizeAudio(uploadRes.audioId)
    }).then(function (asrRes) {
      if (!asrRes.success) throw new Error(asrRes.error || '识别失败')
      if (!asrRes.text || asrRes.text.trim().length < 2) {
        wx.hideLoading()
        wx.showToast({ title: '未识别到有效语音', icon: 'none' })
        return
      }
      wx.showLoading({ title: '解析中...' })
      var names = g.players.map(function (p) { return p.name })
      return api.parseText(asrRes.text, names, g.myName)
    }).then(function (aiRes) {
      wx.hideLoading()
      if (aiRes && aiRes.success) {
        that.setData({ pendingResult: aiRes })
      } else if (aiRes) {
        wx.showToast({ title: aiRes.error || '解析失败', icon: 'none' })
      }
    }).catch(function (err) {
      wx.hideLoading()
      wx.showToast({ title: err.message || '处理失败', icon: 'none' })
    })
  },

  // ===== Confirm Modal =====
  onConfirmResult: function (e) {
    var result = e.detail.result
    var that = this
    this.addRound(result).then(function () {
      that.setData({ pendingResult: null })
      wx.showToast({ title: '已记录', icon: 'success' })
      that.syncFromServer()
    }).catch(function (err) {
      wx.showToast({ title: '保存失败: ' + err.message, icon: 'none' })
    })
  },

  onCancelResult: function () {
    this.setData({ pendingResult: null })
  },

  // ===== Add Round =====
  addRound: function (result) {
    var g = app.globalData
    var players = g.players.map(function (p) {
      return { name: p.name, score: p.score + (result.scores[p.name] || 0) }
    })
    g.players = players
    g.rounds.push(result)
    this.setData({ players: players, roundCount: g.rounds.length })

    return api.addRound(g.sessionId, {
      type: result.type,
      winner: result.winner,
      loser: result.loser,
      scores: result.scores,
      voiceInput: result.raw_summary || '',
      confidence: result.confidence,
      raw_summary: result.raw_summary
    })
  },

  // ===== Manual Pay =====
  onPay: function (e) {
    var name = e.detail.name
    this.setData({
      showPayDialog: true,
      payTarget: name,
      payAmount: ''
    })
  },

  onPayAmountInput: function (e) {
    this.setData({ payAmount: e.detail.value })
  },

  confirmPay: function () {
    var amount = Number(this.data.payAmount)
    if (!amount || amount <= 0) return

    var g = app.globalData
    var target = this.data.payTarget
    var myName = g.myName
    var players = g.players
    var scores = {}

    scores[target] = amount
    if (myName && players.some(function (p) { return p.name === myName })) {
      scores[myName] = -amount
      players.forEach(function (p) {
        if (!scores.hasOwnProperty(p.name)) scores[p.name] = 0
      })
    } else {
      var payer = players.find(function (p) { return p.name !== target })
      if (payer) scores[payer.name] = -amount
      players.forEach(function (p) {
        if (!scores.hasOwnProperty(p.name)) scores[p.name] = 0
      })
    }

    this.setData({ showPayDialog: false })

    var payerName = myName && players.some(function (p) { return p.name === myName })
      ? myName
      : (players.find(function (p) { return p.name !== target }) || {}).name || ''

    var that = this
    this.addRound({
      success: true,
      type: '手动',
      winner: target,
      loser: [payerName],
      scores: scores,
      raw_summary: payerName + '手动付给' + target + ' ' + amount + '番'
    }).then(function () {
      wx.showToast({ title: '已记录', icon: 'success' })
      that.syncFromServer()
    }).catch(function (err) {
      wx.showToast({ title: '保存失败: ' + err.message, icon: 'none' })
    })
  },

  cancelPay: function () {
    this.setData({ showPayDialog: false })
  },

  // ===== Navigation =====
  goSettle: function () {
    if (this.data.roundCount === 0) {
      wx.showToast({ title: '还没有打牌', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/settle/settle' })
  },

  goHistory: function () {
    wx.navigateTo({ url: '/pages/history/history' })
  },

  goBack: function () {
    if (this.data.isTestMode) {
      wx.navigateBack()
    } else {
      wx.redirectTo({ url: '/pages/index/index' })
    }
  }
})
