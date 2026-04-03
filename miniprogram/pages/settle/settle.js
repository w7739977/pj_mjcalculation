var api = require('../../utils/api')
var app = getApp()

function calcDebts(players) {
  var debts = []
  var winners = []
  var losers = []
  for (var i = 0; i < players.length; i++) {
    if (players[i].score > 0) winners.push({ name: players[i].name, remaining: players[i].score })
    else if (players[i].score < 0) losers.push({ name: players[i].name, remaining: Math.abs(players[i].score) })
  }
  for (var w = 0; w < winners.length; w++) {
    for (var l = 0; l < losers.length; l++) {
      if (winners[w].remaining <= 0 || losers[l].remaining <= 0) continue
      var amount = Math.min(winners[w].remaining, losers[l].remaining)
      if (amount > 0) {
        debts.push({ from: losers[l].name, to: winners[w].name, amount: amount })
        winners[w].remaining -= amount
        losers[l].remaining -= amount
      }
    }
  }
  return debts
}

Page({
  data: {
    sortedPlayers: [],
    debts: [],
    roomId: ''
  },

  onLoad: function () {
    var g = app.globalData
    var sorted = g.players.slice().sort(function (a, b) { return b.score - a.score })
    var debts = calcDebts(g.players)
    this.setData({
      sortedPlayers: sorted,
      debts: debts,
      roomId: g.roomId
    })
  },

  saveRecord: function () {
    var that = this
    var g = app.globalData
    wx.showLoading({ title: '保存中...' })
    api.settleSession(g.sessionId).then(function () {
      var promises = that.data.debts.map(function (d) {
        return api.createDebt(d.from, d.to, d.amount, g.sessionId)
      })
      return Promise.all(promises)
    }).then(function () {
      wx.hideLoading()
      wx.showToast({ title: '已保存', icon: 'success' })
    }).catch(function (err) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败: ' + err.message, icon: 'none' })
    })
  },

  newGame: function () {
    app.resetSession()
    wx.redirectTo({ url: '/pages/index/index' })
  },

  backToRoom: function () {
    var g = app.globalData
    var rid = g.roomId
    var hostName = wx.getStorageSync('mj_room_host_' + rid)
    if (hostName) {
      api.endRoom(rid, hostName).catch(function () {})
    }
    app.resetSession()
    wx.redirectTo({ url: '/pages/room/room?id=' + rid })
  },

  goBack: function () {
    wx.navigateBack()
  }
})
