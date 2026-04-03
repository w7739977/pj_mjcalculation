var api = require('./api')

function startPolling(sessionId, interval, callback) {
  var timer = setInterval(function () {
    api.getSession(sessionId).then(function (res) {
      if (callback) callback(res)
    }).catch(function () {})
  }, interval || 3000)
  return timer
}

function stopPolling(timer) {
  if (timer) clearInterval(timer)
}

function startRoomPolling(roomId, interval, callback) {
  var timer = setInterval(function () {
    api.getRoom(roomId).then(function (res) {
      if (callback) callback(res)
    }).catch(function () {
      if (callback) callback(null)
    })
  }, interval || 2000)
  return timer
}

function stopRoomPolling(timer) {
  if (timer) clearInterval(timer)
}

module.exports = {
  startPolling: startPolling,
  stopPolling: stopPolling,
  startRoomPolling: startRoomPolling,
  stopRoomPolling: stopRoomPolling
}
