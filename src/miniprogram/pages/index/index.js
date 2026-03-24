Page({
  data: {
    players: [
      { name: '张三', score: 12, avatar: '' },
      { name: '李四', score: -3, avatar: '' },
      { name: '王五', score: -5, avatar: '' },
      { name: '你', score: -4, avatar: '' }
    ],
    roundCount: 8,
    recording: false,
    sessionId: ''
  },

  onLoad() {
    this.initSession()
  },

  // 初始化对局
  initSession() {
    const db = wx.cloud.database()
    // TODO: 创建新对局或加载进行中的对局
  },

  // 开始录音
  startRecord() {
    this.setData({ recording: true })
    
    wx.startRecord({
      success: (res) => {
        this.tempFilePath = res.tempFilePath
      },
      fail: (err) => {
        console.error('录音失败', err)
        this.setData({ recording: false })
      }
    })
  },

  // 停止录音
  stopRecord() {
    this.setData({ recording: false })
    wx.stopRecord()
    
    if (this.tempFilePath) {
      this.processVoice(this.tempFilePath)
    }
  },

  // 处理语音
  async processVoice(filePath) {
    wx.showLoading({ title: '识别中...' })
    
    try {
      // 1. 语音转文字（讯飞API）
      const text = await this.voiceToText(filePath)
      
      // 2. AI解析（Claude API）
      const result = await this.parseWithAI(text)
      
      wx.hideLoading()
      
      // 3. 弹出确认框
      if (result.success) {
        this.showConfirmModal(result)
      } else {
        wx.showToast({ 
          title: result.error || '识别失败', 
          icon: 'none' 
        })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '处理失败', icon: 'error' })
    }
  },

  // 语音转文字
  async voiceToText(filePath) {
    // TODO: 调用讯飞语音识别API
    return '张三自摸三番'
  },

  // AI解析
  async parseWithAI(text) {
    // TODO: 调用Claude API
    return {
      success: true,
      type: '自摸',
      winner: '张三',
      scores: { '张三': 3, '李四': -1, '王五': -1, '你': -1 },
      confidence: 0.95,
      raw_summary: '张三自摸，赢3番，其余各出1番'
    }
  },

  // 显示确认弹窗
  showConfirmModal(result) {
    wx.showModal({
      title: 'AI理解为：',
      content: result.raw_summary,
      confirmText: '确认记录',
      cancelText: '重说',
      success: (res) => {
        if (res.confirm) {
          this.saveRound(result)
        }
      }
    })
  },

  // 保存这一局
  saveRound(result) {
    const players = this.data.players.map(p => ({
      ...p,
      score: p.score + (result.scores[p.name] || 0)
    }))

    this.setData({ 
      players,
      roundCount: this.data.roundCount + 1 
    })

    // TODO: 保存到云数据库
    wx.showToast({ title: '已记录', icon: 'success' })
  },

  // 去结算页
  goSettle() {
    wx.navigateTo({ url: '/pages/settle/settle' })
  },

  // 去历史页
  goHistory() {
    wx.navigateTo({ url: '/pages/history/history' })
  }
})
