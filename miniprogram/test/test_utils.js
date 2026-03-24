// miniprogram/test/test_utils.js
// 测试工具函数 - 本地存储管理

class LocalStorageManager {
  constructor() {
    this.storageKey = 'mj_local_storage'
  }

  // 保存数据
  save(key, data) {
    try {
      wx.setStorageSync(this.storageKey + '_' + key, JSON.stringify(data))
      return { success: true }
    } catch (err) {
      console.error('保存失败:', err)
      return { success: false, error: err }
    }
  }

  // 读取数据
  load(key) {
    try {
      const data = wx.getStorageSync(this.storageKey + '_' + key)
      return data ? JSON.parse(data) : null
    } catch (err) {
      console.error('读取失败:', err)
      return null
    }
  }

  // 删除数据
  remove(key) {
    try {
      wx.removeStorageSync(this.storageKey + '_' + key)
      return { success: true }
    } catch (err) {
      console.error('删除失败:', err)
      return { success: false, error: err }
    }
  }

  // 清空所有数据
  clear() {
    try {
      const res = wx.getStorageInfoSync()
      res.keys.forEach(key => {
        if (key.startsWith(this.storageKey)) {
          wx.removeStorageSync(key)
        }
      })
      return { success: true }
    } catch (err) {
      console.error('清空失败:', err)
      return { success: false, error: err }
    }
  }
}

// 测试助手函数
const TestHelper = {
  // 模拟延迟
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  // 生成随机分数
  randomScore() {
    return Math.floor(Math.random() * 10) - 5
  },

  // 验证分数总和为0
  validateScores(scores) {
    const total = Object.values(scores).reduce((a, b) => a + b, 0)
    return total === 0
  },

  // 生成测试会话ID
  generateSessionId() {
    return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  // 打印测试报告
  printReport(testName, passed, details = {}) {
    console.log('========== 测试报告 ==========')
    console.log('测试名称:', testName)
    console.log('测试结果:', passed ? '✅ 通过' : '❌ 失败')
    if (Object.keys(details).length > 0) {
      console.log('详细信息:', details)
    }
    console.log('==============================')
  }
}

module.exports = {
  LocalStorageManager,
  TestHelper
}
