// pages/settle/settle.js
const app = getApp()

Page({
  data: {
    sessionId: '',
    sortedPlayers: [],
    debts: []
  },

  onLoad(options) {
    this.setData({
      sessionId: options.sessionId || ''
    })
    this.loadSessionData()
  },

  // 加载对局数据
  async loadSessionData() {
    const db = wx.cloud.database()
    const res = await db.collection('sessions').doc(this.data.sessionId).get()
    
    if (res.data) {
      this.processData(res.data)
    }
  },

  // 处理数据
  processData(session) {
    const players = session.players.map(name => ({
      name,
      score: session.totalScores?.[name] || 0
    }))
    
    // 按分数排序
    const sortedPlayers = players.sort((a, b) => b.score - a.score)
    
    // 计算欠账
    const debts = this.calculateDebts(sortedPlayers)
    
    this.setData({ sortedPlayers, debts })
  },

  // 计算欠账清单
  calculateDebts(players) {
    const debts = []
    const winners = players.filter(p => p.score > 0)
    const losers = players.filter(p => p.score < 0)
    
    winners.forEach(winner => {
      losers.forEach(loser => {
        const amount = Math.min(winner.score, Math.abs(loser.score))
        if (amount > 0) {
          debts.push({
            from: loser.name,
            to: winner.name,
            amount
          })
        }
      })
    })
    
    return debts
  },

  // 保存记录
  async saveRecord() {
    wx.showLoading({ title: '保存中...' })
    
    try {
      const db = wx.cloud.database()
      await db.collection('sessions').doc(this.data.sessionId).update({
        settled: true,
        settledAt: new Date()
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '已保存',
        icon: 'success'
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 新开一局
  newGame() {
    wx.navigateBack()
    const pages = getCurrentPages()
    const indexPage = pages.find(p => p.route === 'pages/index/index')
    if (indexPage) {
      indexPage.newSession()
    }
  }
})
