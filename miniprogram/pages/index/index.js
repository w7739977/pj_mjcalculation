var api = require('../../utils/api')
var storage = require('../../utils/storage')
var app = getApp()

Page({
  data: {
    nickname: '',
    joinRoomId: ''
  },

  onLoad: function () {
    var lastNick = storage.getLastNickname()
    if (lastNick) {
      this.setData({ nickname: lastNick })
    }
  },

  onShow: function () {
    var saved = storage.loadActiveSession()
    if (saved && saved.roomId && saved.sessionId) {
      this.checkAndRecover(saved)
    }
  },

  checkAndRecover: function (saved) {
    api.getRoom(saved.roomId).then(function () {
      return api.getSession(saved.sessionId)
    }).then(function () {
      app.globalData.sessionId = saved.sessionId
      app.globalData.roomId = saved.roomId
      app.globalData.myName = saved.myName
      wx.redirectTo({ url: '/pages/game/game' })
    }).catch(function () {
      storage.clearActiveSession()
    })
  },

  onNicknameInput: function (e) {
    this.setData({ nickname: e.detail.value })
  },

  onRoomIdInput: function (e) {
    this.setData({ joinRoomId: e.detail.value })
  },

  createRoom: function () {
    var name = this.data.nickname.trim()
    if (!name) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    wx.showLoading({ title: '创建房间...' })
    api.createRoom(name).then(function (res) {
      wx.hideLoading()
      if (res.success) {
        storage.saveRoomHost(res.room.id, name)
        storage.saveLastNickname(name)
        wx.navigateTo({ url: '/pages/room/room?id=' + res.room.id })
      }
    }).catch(function (err) {
      wx.hideLoading()
      wx.showToast({ title: '创建失败: ' + err.message, icon: 'none' })
    })
  },

  joinRoom: function () {
    var roomId = this.data.joinRoomId.trim()
    if (!roomId) {
      wx.showToast({ title: '请输入房间号', icon: 'none' })
      return
    }
    storage.saveLastNickname(this.data.nickname.trim())
    wx.navigateTo({ url: '/pages/join/join?id=' + roomId })
  },

  goTest: function () {
    wx.navigateTo({ url: '/pages/test/test' })
  }
})
