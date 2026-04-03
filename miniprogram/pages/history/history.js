var api = require('../../utils/api')
var fmt = require('../../utils/format')

Page({
  data: {
    activeTab: 'sessions',
    sessions: [],
    debtGroups: [],
    loading: false
  },

  onShow: function () {
    this.loadAll()
  },

  loadAll: function () {
    var that = this
    this.setData({ loading: true })
    Promise.all([
      api.getSessions(),
      api.getDebts(false)
    ]).then(function (results) {
      var sessions = results[0].sessions || []
      var debts = results[1].debts || []

      // Group debts
      var map = {}
      for (var i = 0; i < debts.length; i++) {
        var d = debts[i]
        var key = d.from_player + '-' + d.to_player
        if (!map[key]) {
          map[key] = { from: d.from_player, to: d.to_player, total: 0, key: key }
        }
        map[key].total += d.amount
      }
      var groups = []
      var keys = Object.keys(map)
      for (var j = 0; j < keys.length; j++) {
        groups.push(map[keys[j]])
      }
      groups.sort(function (a, b) { return b.total - a.total })

      that.setData({
        sessions: sessions.map(function (s) {
          s.dateFormatted = fmt.formatDate(s.date || s.created_at)
          return s
        }),
        debtGroups: groups,
        loading: false
      })
    }).catch(function () {
      that.setData({ loading: false })
    })
  },

  switchTab: function (e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  settleDebt: function (e) {
    var group = e.currentTarget.dataset.group
    var that = this
    wx.showModal({
      title: '确认结清',
      content: '确定将 ' + group.from + ' 欠 ' + group.to + ' 的账目标记为已结清？',
      success: function (res) {
        if (res.confirm) {
          api.settleDebts(group.from, group.to).then(function () {
            wx.showToast({ title: '已结清', icon: 'success' })
            that.loadAll()
          }).catch(function () {
            wx.showToast({ title: '操作失败', icon: 'none' })
          })
        }
      }
    })
  },

  goBack: function () {
    wx.navigateBack()
  }
})
