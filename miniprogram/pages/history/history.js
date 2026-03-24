// pages/history/history.js
const app = getApp()

Page({
  data: {
    activeTab: 'sessions',
    sessions: [],
    debtGroups: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 加载数据
  async loadData() {
    await Promise.all([
      this.loadSessions(),
      this.loadDebts()
    ])
  },

  // 切换标签
  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  // 加载历史对局
  async loadSessions() {
    const db = wx.cloud.database()
    const res = await db.collection('sessions')
      .orderBy('date', 'desc')
      .limit(50)
      .get()
    
    const sessions = res.data.map(session => ({
      ...session,
      date: this.formatDate(session.date),
      summary: this.calculateSummary(session)
    }))
    
    this.setData({ sessions })
  },

  // 加载欠账记录
  async loadDebts() {
    const db = wx.cloud.database()
    const res = await db.collection('debts')
      .where({ settled: false })
      .get()
    
    // 按欠账关系分组
    const debtMap = {}
    res.data.forEach(debt => {
      const key = `${debt.from}-${debt.to}`
      if (!debtMap[key]) {
        debtMap[key] = {
          from: debt.from,
          to: debt.to,
          total: 0,
          key
        }
      }
      debtMap[key].total += debt.amount
    })
    
    const debtGroups = Object.values(debtMap).sort((a, b) => b.total - a.total)
    this.setData({ debtGroups })
  },

  // 查看对局详情
  viewSession(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/settle/settle?sessionId=${id}`
    })
  },

  // 标记已结清
  async markSettled(e) {
    const key = e.currentTarget.dataset.key
    
    wx.showModal({
      title: '确认结清',
      content: '确定将此欠账标记为已结清？',
      success: async (res) => {
        if (res.confirm) {
          const [from, to] = key.split('-')
          const db = wx.cloud.database()
          
          await db.collection('debts')
            .where({
              from,
              to,
              settled: false
            })
            .update({ settled: true })
          
          wx.showToast({
            title: '已结清',
            icon: 'success'
          })
          
          this.loadDebts()
        }
      }
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  },

  // 计算对局摘要
  calculateSummary(session) {
    const totalScores = session.totalScores || {}
    return Object.entries(totalScores).map(([name, score]) => ({
      name,
      score
    }))
  }
})
