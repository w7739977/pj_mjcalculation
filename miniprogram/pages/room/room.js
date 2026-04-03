var api = require('../../utils/api')
var storage = require('../../utils/storage')
var ws = require('../../utils/websocket')
var app = getApp()

Page({
  data: {
    roomId: '',
    players: [],
    roomHost: '',
    roomStatus: 'waiting',
    myName: '',
    isHost: false
  },

  _subHandle: null,

  onLoad: function (options) {
    this.setData({ roomId: options.id || '' })
    var myName = storage.getRoomIdentity(this.data.roomId)
    this.setData({ myName: myName })
    this.refreshRoom()
  },

  onShow: function () {
    this.refreshRoom()
    var that = this
    this._subHandle = ws.startRoomPolling(this.data.roomId, 2000, function (res) {
      if (!res) {
        wx.redirectTo({ url: '/pages/index/index' })
        return
      }
      that.updateRoomData(res)
    })
  },

  onHide: function () {
    ws.stopRoomPolling(this._subHandle)
  },

  onUnload: function () {
    ws.stopRoomPolling(this._subHandle)
  },

  refreshRoom: function () {
    var that = this
    api.getRoom(this.data.roomId).then(function (res) {
      that.updateRoomData(res)
    }).catch(function () {
      wx.redirectTo({ url: '/pages/index/index' })
    })
  },

  updateRoomData: function (res) {
    if (!res || !res.room) return
    var room = res.room
    this.setData({
      players: room.players,
      roomHost: room.host,
      roomStatus: room.status,
      isHost: this.data.myName === room.host
    })

    if (room.status === 'playing' && room.session_id) {
      ws.stopRoomPolling(this._subHandle)
      app.globalData.sessionId = room.session_id
      app.globalData.roomId = this.data.roomId
      app.globalData.myName = this.data.myName
      app.globalData.players = room.players.map(function (n) { return { name: n, score: 0 } })
      app.globalData.rounds = []
      app.saveSession()
      wx.redirectTo({ url: '/pages/game/game' })
    }
  },

  startGame: function () {
    var that = this
    wx.showLoading({ title: '开始对局...' })
    api.startRoom(this.data.roomId, this.data.myName).then(function (res) {
      wx.hideLoading()
      if (res.success) {
        app.globalData.sessionId = res.sessionId
        app.globalData.roomId = that.data.roomId
        app.globalData.myName = that.data.myName
        app.globalData.players = res.room.players.map(function (n) { return { name: n, score: 0 } })
        app.globalData.rounds = []
        app.saveSession()
        wx.redirectTo({ url: '/pages/game/game' })
      }
    }).catch(function (err) {
      wx.hideLoading()
      wx.showToast({ title: '开始失败: ' + err.message, icon: 'none' })
    })
  },

  leaveRoom: function () {
    var that = this
    api.leaveRoom(this.data.roomId, this.data.myName).then(function () {
      wx.removeStorageSync('mj_room_nick_' + that.data.roomId)
      wx.redirectTo({ url: '/pages/index/index' })
    }).catch(function (err) {
      wx.showToast({ title: '离开失败: ' + err.message, icon: 'none' })
    })
  },

  disbandRoom: function () {
    var that = this
    wx.showModal({
      title: '确认解散',
      content: '确定解散房间？所有成员将被移出。',
      success: function (res) {
        if (res.confirm) {
          api.disbandRoom(that.data.roomId, that.data.myName).then(function () {
            wx.removeStorageSync('mj_room_host_' + that.data.roomId)
            wx.redirectTo({ url: '/pages/index/index' })
          }).catch(function (err) {
            wx.showToast({ title: '解散失败: ' + err.message, icon: 'none' })
          })
        }
      }
    })
  },

  copyRoomId: function () {
    wx.setClipboardData({
      data: this.data.roomId,
      success: function () {
        wx.showToast({ title: '已复制房间号', icon: 'success' })
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '加入川麻记账房间',
      path: '/pages/join/join?id=' + this.data.roomId
    }
  }
})
