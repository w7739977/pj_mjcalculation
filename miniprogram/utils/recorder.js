let recorderManager = null
let recording = false
let stopResolve = null

function getRecorder() {
  if (!recorderManager) {
    recorderManager = wx.getRecorderManager()
    recorderManager.onStart(function () {
      recording = true
    })
    recorderManager.onStop(function (res) {
      recording = false
      if (stopResolve) {
        stopResolve(res.tempFilePath)
        stopResolve = null
      }
    })
    recorderManager.onError(function (err) {
      recording = false
      if (stopResolve) {
        stopResolve(null)
        stopResolve = null
      }
      console.error('recorder error:', err)
    })
  }
  return recorderManager
}

function start() {
  return new Promise(function (resolve, reject) {
    wx.authorize({
      scope: 'scope.record',
      success: function () {
        const mgr = getRecorder()
        mgr.start({
          format: 'mp3',
          sampleRate: 16000,
          numberOfChannels: 1,
          duration: 60000
        })
        resolve()
      },
      fail: function () {
        reject(new Error('录音权限被拒绝，请在设置中开启'))
      }
    })
  })
}

function stop() {
  return new Promise(function (resolve) {
    if (!recording) {
      resolve(null)
      return
    }
    stopResolve = resolve
    getRecorder().stop()
  })
}

function isRecording() {
  return recording
}

module.exports = {
  start: start,
  stop: stop,
  isRecording: isRecording
}
