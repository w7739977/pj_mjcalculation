// pages/confirm/confirm.js
const app = getApp()

Page({
  data: {
    result: {},
    players: []
  },

  onLoad(options) {
    const result = JSON.parse(decodeURIComponent(options.result || '{}'))
    this.setData({ 
      result,
      players: this.formatPlayers(result.scores || {})
    })
  },

  // 格式化玩家数据
  formatPlayers(scores) {
    return Object.entries(scores).map(([name, change]) => ({
      name,
      change
    }))
  },

  // 确认记录
  confirmRecord() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2] // 上一个页面
    
    // 调用上一页面的保存方法
    if (prevPage && typeof prevPage.saveRecord === 'function') {
      prevPage.saveRecord(this.data.result)
    }
    
    wx.showToast({
      title: '已记录',
      icon: 'success'
    })
    
    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  },

  // 取消记录
  cancelRecord() {
    wx.navigateBack()
  }
})
