const app = getApp()

function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {},
      timeout: options.timeout || 30000,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          const msg = (res.data && res.data.error) || '请求失败'
          reject(new Error(msg))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误'))
      }
    })
  })
}

function get(url, data) {
  return request({ url, method: 'GET', data })
}

function post(url, data) {
  return request({
    url,
    method: 'POST',
    data,
    header: { 'Content-Type': 'application/json' }
  })
}

function put(url, data) {
  return request({
    url,
    method: 'PUT',
    data,
    header: { 'Content-Type': 'application/json' }
  })
}

function del(url, data) {
  return request({
    url,
    method: 'DELETE',
    data,
    header: { 'Content-Type': 'application/json' }
  })
}

// ===== Room APIs =====
function createRoom(host) {
  return post('/rooms', { host })
}

function getRoom(id) {
  return get('/rooms/' + id)
}

function joinRoom(id, nickname) {
  return post('/rooms/' + id + '/join', { nickname })
}

function leaveRoom(id, nickname) {
  return post('/rooms/' + id + '/leave', { nickname })
}

function disbandRoom(id, host) {
  return del('/rooms/' + id, { host })
}

function startRoom(id, host) {
  return post('/rooms/' + id + '/start', { host })
}

function endRoom(id, host) {
  return post('/rooms/' + id + '/end', { host })
}

// ===== Session APIs =====
function createSession(players) {
  return post('/sessions', { players })
}

function getSession(id) {
  return get('/sessions/' + id)
}

function getSessions() {
  return get('/sessions')
}

function addRound(sessionId, round) {
  return put('/sessions/' + sessionId + '/round', { round })
}

function settleSession(sessionId) {
  return put('/sessions/' + sessionId + '/settle')
}

// ===== Voice APIs =====
function uploadAudio(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: app.globalData.baseUrl + '/voice/upload',
      filePath: filePath,
      name: 'audio',
      success(res) {
        const data = JSON.parse(res.data)
        resolve(data)
      },
      fail(err) {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })
  })
}

function recognizeAudio(audioId) {
  return post('/voice/recognize', { audioId })
}

// ===== AI APIs =====
function parseText(text, players, currentSpeaker) {
  return post('/ai/parse', {
    text: text,
    players: players,
    currentSpeaker: currentSpeaker || ''
  })
}

// ===== Debt APIs =====
function getDebts(settled) {
  const params = {}
  if (settled !== undefined) params.settled = String(settled)
  return get('/debts', params)
}

function createDebt(from, to, amount, sessionId) {
  return post('/debts', { from: from, to: to, amount: amount, sessionId: sessionId })
}

function settleDebts(from, to) {
  return put('/debts/settle', { from: from, to: to })
}

module.exports = {
  request, get, post, put, del,
  createRoom, getRoom, joinRoom, leaveRoom, disbandRoom, startRoom, endRoom,
  createSession, getSession, getSessions, addRound, settleSession,
  uploadAudio, recognizeAudio,
  parseText,
  getDebts, createDebt, settleDebts
}
