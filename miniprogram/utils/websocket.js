var api = require('./api')
var poll = require('./poll')

var STATE = { DISCONNECTED: 0, CONNECTING: 1, CONNECTED: 2 }
var wsState = STATE.DISCONNECTED
var ws = null
var subscriptions = {} // channel -> callback
var pendingSubs = []   // 等待连接后发送的订阅
var reconnectTimer = null
var reconnectAttempts = 0
var MAX_RECONNECT = 5

function getWsUrl() {
  var baseUrl = getApp().globalData.baseUrl
  // https://host:port/api -> wss://host:port
  return baseUrl.replace('https://', 'wss://').replace('/api', '')
}

function connect() {
  if (wsState !== STATE.DISCONNECTED) return
  wsState = STATE.CONNECTING
  var url = getWsUrl()

  ws = wx.connectSocket({ url: url })

  wx.onSocketOpen(function () {
    wsState = STATE.CONNECTED
    reconnectAttempts = 0
    // 发送待处理的订阅
    for (var i = 0; i < pendingSubs.length; i++) {
      var ps = pendingSubs[i]
      send({ type: 'subscribe', channel: ps.channel })
    }
    pendingSubs = []
  })

  wx.onSocketMessage(function (res) {
    var msg
    try { msg = JSON.parse(res.data) } catch (e) { return }

    if (msg.type === 'ping') {
      send({ type: 'pong' })
      return
    }

    if (msg.type === 'event' && msg.channel) {
      var cb = subscriptions[msg.channel]
      if (!cb) return
      // 推送作为信号，拉取完整数据再回调
      if (msg.channel.indexOf('session:') === 0) {
        var sid = msg.channel.slice(8)
        api.getSession(sid).then(function (r) { cb(r) }).catch(function () {})
      } else if (msg.channel.indexOf('room:') === 0) {
        var rid = msg.channel.slice(5)
        api.getRoom(rid).then(function (r) { cb(r) }).catch(function () { cb(null) })
      }
    }
  })

  wx.onSocketError(function () {
    wsState = STATE.DISCONNECTED
    attemptReconnect()
  })

  wx.onSocketClose(function () {
    wsState = STATE.DISCONNECTED
    attemptReconnect()
  })
}

function send(msg) {
  if (wsState === STATE.CONNECTED) {
    wx.sendSocketMessage({ data: JSON.stringify(msg) })
  }
}

function attemptReconnect() {
  if (reconnectTimer) return
  if (reconnectAttempts >= MAX_RECONNECT) return
  reconnectAttempts++
  var delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 16000)
  reconnectTimer = setTimeout(function () {
    reconnectTimer = null
    if (wsState === STATE.DISCONNECTED && Object.keys(subscriptions).length > 0) {
      connect()
    }
  }, delay)
}

// ===== 公开 API（与 poll.js 兼容）=====

function startPolling(sessionId, interval, callback) {
  var channel = 'session:' + sessionId
  if (wsState === STATE.CONNECTED) {
    subscriptions[channel] = callback
    send({ type: 'subscribe', channel: channel })
    return { type: 'ws', channel: channel }
  }
  // 尝试连接，连接成功后会自动订阅
  if (wsState === STATE.DISCONNECTED) {
    subscriptions[channel] = callback
    pendingSubs.push({ channel: channel })
    connect()
  }
  // 同时启动轮询作为降级
  var timer = poll.startPolling(sessionId, interval, callback)
  return { type: 'poll', timer: timer, channel: channel }
}

function stopPolling(handle) {
  if (!handle) return
  if (handle.type === 'ws') {
    delete subscriptions[handle.channel]
    send({ type: 'unsubscribe', channel: handle.channel })
  } else if (handle.type === 'poll') {
    poll.stopPolling(handle.timer)
    delete subscriptions[handle.channel]
  }
}

function startRoomPolling(roomId, interval, callback) {
  var channel = 'room:' + roomId
  if (wsState === STATE.CONNECTED) {
    subscriptions[channel] = callback
    send({ type: 'subscribe', channel: channel })
    return { type: 'ws', channel: channel }
  }
  if (wsState === STATE.DISCONNECTED) {
    subscriptions[channel] = callback
    pendingSubs.push({ channel: channel })
    connect()
  }
  var timer = poll.startRoomPolling(roomId, interval, callback)
  return { type: 'poll', timer: timer, channel: channel }
}

function stopRoomPolling(handle) {
  if (!handle) return
  if (handle.type === 'ws') {
    delete subscriptions[handle.channel]
    send({ type: 'unsubscribe', channel: handle.channel })
  } else if (handle.type === 'poll') {
    poll.stopRoomPolling(handle.timer)
    delete subscriptions[handle.channel]
  }
}

module.exports = {
  startPolling: startPolling,
  stopPolling: stopPolling,
  startRoomPolling: startRoomPolling,
  stopRoomPolling: stopRoomPolling
}
