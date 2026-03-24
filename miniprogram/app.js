// app.js
// 川麻记账小程序入口文件

App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true
      })
    }
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
  },

  globalData: {
    userInfo: null,
    currentSession: null,
    systemInfo: null
  }
})
