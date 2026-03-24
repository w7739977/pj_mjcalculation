// miniprogram/pages/index/index.js
const app = getApp()
const recorderManager = wx.getRecorderManager()

Page({
  data: {
    players: [
      { name: '张三', score: 0, avatar: '' },
      { name: '李四', score: 0, avatar: '' },
      { name: '王五', score: 0, avatar: '' },
      { name: '你', score: 0, avatar: '' }
    ],
    roundCount: 0,
    recording: false,
    sessionId: ''
  },

  onLoad() {
    this.initSession()
    this.initRecorder()
  },

  // 初始化对局
  async initSession() {
    const db = wx.cloud.database()
    const res = await db.collection('sessions').add({
      data: {
        date: new Date(),
        players: this.data.players.map(p => p.name),
        rounds: [],
        totalScores: {},
        settled: false,
        createdAt: new Date()
      }
    })
    
    this.setData({ sessionId: res._id })
  },

  // 初始化录音器
  initRecorder() {
    recorderManager.onStart(() => {
      this.setData({ recording: true })
    })
    
    recorderManager.onStop((res) => {
      this.setData({ recording: false })
      this.processVoice(res.tempFilePath)
    })
    
    recorderManager.onError((err) => {
      console.error('录音失败', err)
      this.setData({ recording: false })
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      })
    })
  },

  // 开始录音
  startRecord() {
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        recorderManager.start({
          format: 'mp3',
          duration: 60000
        })
      },
      fail: () => {
        wx.showToast({
          title: '请授权录音',
          icon: 'none'
        })
      }
    })
  },

  // 停止录音
  stopRecord() {
    if (this.data.recording) {
      recorderManager.stop()
    }
  },

  // 处理语音
  async processVoice(filePath) {
    wx.showLoading({ title: '识别中...' })
    
    try {
      // 1. 上传到云存储
      const cloudPath = `voice/${this.data.sessionId}/${Date.now()}.mp3`
      await wx.cloud.uploadFile({
        cloudPath,
        filePath
      })
      
      // 2. 调用云函数转文字
      const textRes = await wx.cloud.callFunction({
        name: 'voiceToText',
        data: { audioUrl: cloudPath }
      })
      
      if (!textRes.result.success) {
        throw new Error(textRes.result.error)
      }
      
      // 3. 调用AI解析
      const aiRes = await wx.cloud.callFunction({
        name: 'aiParser',
        data: {
          text: textRes.result.text,
          players: this.data.players.map(p => p.name),
          currentSpeaker: '你'
        }
      })
      
      wx.hideLoading()
      
      // 4. 跳转确认页
      if (aiRes.result.success) {
        wx.navigateTo({
          url: `/pages/confirm/confirm?result=${encodeURIComponent(JSON.stringify(aiRes.result))}`
        })
      } else {
        wx.showToast({
          title: aiRes.result.error || '识别失败',
          icon: 'none'
        })
      }
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '处理失败',
        icon: 'none'
      })
    }
  },

  // 保存记录（从confirm页调用）
  saveRecord(result) {
    const players = this.data.players.map(p => ({
      ...p,
      score: p.score + (result.scores[p.name] || 0)
    }))
    
    this.setData({ 
      players,
      roundCount: this.data.roundCount + 1
    })
    
    // 保存到数据库
    const db = wx.cloud.database()
    db.collection('sessions').doc(this.data.sessionId).update({
      rounds: db.command.push({
        roundId: this.data.roundCount,
        ...result,
        timestamp: new Date()
      }),
      totalScores: this.calculateTotalScores(players)
    })
  },

  // 计算总分
  calculateTotalScores(players) {
    const scores = {}
    players.forEach(p => {
      scores[p.name] = p.score
    })
    return scores
  },

  // 去结算
  goSettle() {
    if (this.data.roundCount === 0) {
      wx.showToast({
        title: '还没有打牌',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/settle/settle?sessionId=${this.data.sessionId}`
    })
  },

  // 查看历史
  goHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  // 新开一局
  newSession() {
    this.setData({
      players: this.data.players.map(p => ({ ...p, score: 0 })),
      roundCount: 0
    })
    this.initSession()
  }
})
