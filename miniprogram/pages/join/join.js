var api = require('../../utils/api')
var storage = require('../../utils/storage')

Page({
  data: {
    roomId: '',
    nickname: '',
    error: '',
    joined: false,
    joining: false
  },

  onLoad: function (options) {
    this.setData({ roomId: options.id || '' })
    this.checkRoom()
  },

  checkRoom: function () {
    var that = this
    var roomId = this.data.roomId
    api.getRoom(roomId).then(function (res) {
      if (res.room.status === 'playing') {
        wx.redirectTo({ url: '/pages/index/index' })
        return
      }
      var saved = wx.getStorageSync('mj_room_nick_' + roomId)
      if (saved && res.room.players.indexOf(saved) >= 0) {
        wx.redirectTo({ url: '/pages/room/room?id=' + roomId })
        return
      }
      if (saved) {
        that.setData({ nickname: saved })
      }
    }).catch(function () {
      that.setData({ error: '房间不存在或已关闭' })
    })
  },

  onNicknameInput: function (e) {
    this.setData({ nickname: e.detail.value })
  },

  joinRoom: function () {
    var that = this
    var nickname = this.data.nickname.trim()
    var roomId = this.data.roomId
    if (!nickname) return

    this.setData({ joining: true, error: '' })
    api.joinRoom(roomId, nickname).then(function (res) {
      if (res.success) {
        storage.saveRoomNick(roomId, nickname)
        storage.saveLastNickname(nickname)
        that.setData({ joined: true })
        setTimeout(function () {
          wx.redirectTo({ url: '/pages/room/room?id=' + roomId })
        }, 500)
      }
    }).catch(function (err) {
      that.setData({ error: err.message, joining: false })
    })
  }
})
