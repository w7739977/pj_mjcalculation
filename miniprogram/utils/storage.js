const STORAGE_KEYS = {
  ACTIVE_SESSION: 'mj_active_session',
  ROOM_HOST: 'mj_room_host_',
  ROOM_NICK: 'mj_room_nick_',
  LAST_NICKNAME: 'mj_last_nickname'
}

function saveToStorage(key, data) {
  try {
    wx.setStorageSync(key, JSON.stringify(data))
  } catch (e) {
    console.error('storage save failed:', e)
  }
}

function loadFromStorage(key) {
  try {
    const raw = wx.getStorageSync(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function removeFromStorage(key) {
  try {
    wx.removeStorageSync(key)
  } catch (e) {
    console.error('storage remove failed:', e)
  }
}

function saveActiveSession(sessionId, roomId, myName) {
  saveToStorage(STORAGE_KEYS.ACTIVE_SESSION, { sessionId, roomId, myName })
}

function loadActiveSession() {
  return loadFromStorage(STORAGE_KEYS.ACTIVE_SESSION)
}

function clearActiveSession() {
  removeFromStorage(STORAGE_KEYS.ACTIVE_SESSION)
}

function saveRoomHost(roomId, name) {
  wx.setStorageSync(STORAGE_KEYS.ROOM_HOST + roomId, name)
}

function saveRoomNick(roomId, name) {
  wx.setStorageSync(STORAGE_KEYS.ROOM_NICK + roomId, name)
}

function getRoomIdentity(roomId) {
  return wx.getStorageSync(STORAGE_KEYS.ROOM_HOST + roomId) ||
         wx.getStorageSync(STORAGE_KEYS.ROOM_NICK + roomId) || ''
}

function saveLastNickname(name) {
  wx.setStorageSync(STORAGE_KEYS.LAST_NICKNAME, name)
}

function getLastNickname() {
  return wx.getStorageSync(STORAGE_KEYS.LAST_NICKNAME) || ''
}

module.exports = {
  STORAGE_KEYS,
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
  saveRoomHost,
  saveRoomNick,
  getRoomIdentity,
  saveLastNickname,
  getLastNickname
}
