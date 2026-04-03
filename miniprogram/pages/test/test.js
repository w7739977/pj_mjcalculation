var api = require('../../utils/api')
var app = getApp()

Page({
  data: {
    mockVoiceText: '张三自摸三番',
    mockAIJson: '',
    testResult: '',
    testRunning: false,
    allTestResult: '',
    presets: ['张三自摸三番', '李四点炮给王五', '赵六自摸加杠', '王五放炮给张三']
  },

  onLoad: function () {
    this.setData({
      mockAIJson: JSON.stringify({
        success: true,
        type: '自摸',
        winner: '张三',
        loser: ['李四', '王五', '赵六'],
        scores: { '张三': 3, '李四': -1, '王五': -1, '赵六': -1 },
        confidence: 0.95,
        raw_summary: '张三自摸，赢3番'
      }, null, 2)
    })
  },

  onVoiceInput: function (e) {
    this.setData({ mockVoiceText: e.detail.value })
  },

  setPreset: function (e) {
    this.setData({ mockVoiceText: e.currentTarget.dataset.text })
  },

  onAIInput: function (e) {
    this.setData({ mockAIJson: e.detail.value })
  },

  testVoice: function () {
    this.setData({
      testResult: '语音识别测试成功\n识别结果: ' + this.data.mockVoiceText + '\n(模拟模式 - 跳过实际ASR调用)'
    })
  },

  testAI: function () {
    try {
      var result = JSON.parse(this.data.mockAIJson)
      var total = 0
      var keys = Object.keys(result.scores)
      for (var i = 0; i < keys.length; i++) total += result.scores[keys[i]]
      this.setData({
        testResult: 'AI解析测试成功\n\n解析结果:\n' + JSON.stringify(result, null, 2) + '\n\n分数总和验证: ' + (total === 0 ? '通过 (总和=0)' : '失败 (总和=' + total + ')')
      })
    } catch (err) {
      this.setData({ testResult: 'JSON格式错误: ' + err.message })
    }
  },

  testFull: function () {
    try {
      var voiceResult = { success: true, text: this.data.mockVoiceText }
      var aiResult = JSON.parse(this.data.mockAIJson)
      var total = 0
      var keys = Object.keys(aiResult.scores)
      for (var i = 0; i < keys.length; i++) total += aiResult.scores[keys[i]]
      this.setData({
        testResult: '完整流程测试成功\n\n1. 语音识别: ' + voiceResult.text + '\n2. AI解析: ' + aiResult.raw_summary + '\n3. 分数验证: ' + (total === 0 ? '通过' : '失败(总和' + total + ')') + '\n4. 赢家: ' + aiResult.winner + '\n5. 类型: ' + aiResult.type + '\n\n' + JSON.stringify(aiResult, null, 2)
      })
    } catch (err) {
      this.setData({ testResult: '流程测试失败: ' + err.message })
    }
  },

  testBackend: function () {
    var that = this
    api.getSessions().then(function (res) {
      that.setData({
        testResult: '后端连接成功!\n\n对局数量: ' + (res.sessions ? res.sessions.length : 0) + '\n响应: ' + JSON.stringify(res, null, 2).substring(0, 500)
      })
    }).catch(function (err) {
      that.setData({
        testResult: '后端连接失败: ' + err.message + '\n请确保后端服务已启动 (cd server && npm start)'
      })
    })
  },

  // ===== WebSocket Tests =====

  testWS: function () {
    var that = this
    var baseUrl = app.globalData.baseUrl
    var wsUrl = baseUrl.replace('https://', 'wss://').replace('/api', '')

    this.setData({ testResult: '正在连接 WebSocket...\n' + wsUrl })

    var socketTask = wx.connectSocket({ url: wsUrl })
    var done = false

    socketTask.onOpen(function () {
      if (done) return
      done = true
      that.setData({
        testResult: that.data.testResult + '\n\n✓ WebSocket 连接成功!'
      })
      socketTask.close({})
    })

    socketTask.onError(function (err) {
      if (done) return
      done = true
      that.setData({
        testResult: that.data.testResult + '\n\n✗ WebSocket 连接失败: ' + (err.errMsg || '未知错误')
      })
    })

    socketTask.onClose(function () {
      if (!done) {
        done = true
        that.setData({
          testResult: that.data.testResult + '\n\n✗ WebSocket 连接已关闭'
        })
      }
    })

    setTimeout(function () {
      if (!done) {
        done = true
        that.setData({
          testResult: that.data.testResult + '\n\n✗ 连接超时 (5秒)'
        })
        socketTask.close({})
      }
    }, 5000)
  },

  testWSPush: function () {
    var that = this
    this.setData({ testResult: '正在测试 WebSocket 推送...\n' })

    var baseUrl = app.globalData.baseUrl
    var wsUrl = baseUrl.replace('https://', 'wss://').replace('/api', '')
    var results = []

    function log(msg) {
      results.push(msg)
      that.setData({ testResult: results.join('\n') })
    }

    // Step 1: 创建房间
    log('1. 创建房间...')
    api.createRoom('测试A').then(function (res) {
      if (!res.success) { log('✗ 创建房间失败'); return }
      var roomId = res.room.id
      log('✓ 房间创建成功: ' + roomId)

      // Step 2: 连接 WebSocket 并订阅
      log('2. 连接 WebSocket...')
      var socketTask = wx.connectSocket({ url: wsUrl })
      var gotEvent = false

      socketTask.onOpen(function () {
        log('✓ WebSocket 连接成功')

        // 订阅房间频道
        socketTask.send({
          data: JSON.stringify({ type: 'subscribe', channel: 'room:' + roomId })
        })
        log('3. 订阅房间频道 room:' + roomId)

        // 等订阅确认后再加入
        socketTask.onMessage(function (raw) {
          var msg
          try { msg = JSON.parse(raw.data) } catch (e) { return }

          if (msg.type === 'subscribed') {
            log('✓ 订阅确认')
            // Step 3: 加入房间触发广播
            log('4. 另一玩家加入房间...')
            api.joinRoom(roomId, '测试B').catch(function () {})
          }

          if (msg.type === 'event' && msg.event === 'player_joined' && !gotEvent) {
            gotEvent = true
            log('✓ 收到 player_joined 推送!')
            log('  玩家: ' + msg.data.nickname)
            log('  在线人数: ' + msg.data.players.length)

            // Step 4: 测试开始对局推送
            log('5. 开始对局...')
            api.startRoom(roomId, '测试A').then(function (startRes) {
              if (!startRes.success) { log('✗ 开始失败'); socketTask.close(); return }
              log('✓ 对局开始, sessionId: ' + startRes.sessionId)
            }).catch(function (e) { log('✗ 开始失败: ' + e.message); socketTask.close() })
          }

          if (msg.type === 'event' && msg.event === 'game_started') {
            log('✓ 收到 game_started 推送!')
            var sid = msg.data.sessionId

            // Step 5: 订阅对局频道，测试 round_added
            log('6. 订阅对局频道...')
            socketTask.send({
              data: JSON.stringify({ type: 'subscribe', channel: 'session:' + sid })
            })

            // 加入成功后添加一局
            setTimeout(function () {
              log('7. 添加一局...')
              var scores = {}
              msg.data.players.forEach(function (p, i) {
                scores[p] = i === 0 ? 3 : -1
              })
              api.addRound(sid, {
                type: '自摸', winner: msg.data.players[0],
                loser: msg.data.players.slice(1), scores: scores
              }).catch(function (e) { log('✗ 添加失败: ' + e.message) })
            }, 500)
          }

          if (msg.type === 'event' && msg.event === 'round_added') {
            log('✓ 收到 round_added 推送!')
            log('  分数: ' + JSON.stringify(msg.data.scores))

            log('\n========== 测试结果 ==========')
            log('✓ WebSocket 连接: 通过')
            log('✓ 频道订阅: 通过')
            log('✓ 房间推送(player_joined): 通过')
            log('✓ 房间推送(game_started): 通过')
            log('✓ 对局推送(round_added): 通过')
            log('\n全部推送测试通过!')
            socketTask.close({})
          }
        })
      })

      socketTask.onError(function (err) {
        log('✗ WebSocket 错误: ' + (err.errMsg || ''))
      })

      setTimeout(function () {
        if (!gotEvent) {
          log('\n✗ 超时: 未收到推送事件')
          socketTask.close({})
        }
      }, 15000)
    }).catch(function (err) {
      log('✗ 创建房间失败: ' + err.message)
    })
  },

  // ===== 一键全部测试 =====

  testAll: function () {
    var that = this
    var results = []
    var passed = 0
    var failed = 0

    this.setData({ testRunning: true, allTestResult: '正在运行测试...\n' })

    function log(msg) {
      results.push(msg)
      that.setData({ allTestResult: results.join('\n') })
    }

    function assert(cond, name) {
      if (cond) { passed++; log('  ✓ ' + name) }
      else { failed++; log('  ✗ ' + name) }
    }

    function delay(ms) {
      return new Promise(function (r) { setTimeout(r, ms) })
    }

    Promise.resolve().then(function () {
      // Test 1: 后端连接
      log('--- 测试1: 后端API连接 ---')
      return api.getSessions().then(function (res) {
        assert(res.success, 'GET /api/sessions 响应正常')
        assert(Array.isArray(res.sessions), '返回 sessions 数组')
      }).catch(function (e) {
        assert(false, '后端连接: ' + e.message)
      })
    }).then(function () {
      // Test 2: 创建房间
      log('\n--- 测试2: 房间API ---')
      return api.createRoom('测试用户A').then(function (res) {
        assert(res.success, '创建房间成功')
        assert(res.room && res.room.id, '返回 roomId')
        return res.room
      })
    }).then(function (room) {
      // Test 3: 加入房间
      log('\n--- 测试3: 加入房间 ---')
      that._testRoomId = room.id
      return api.joinRoom(room.id, '测试用户B').then(function (res) {
        assert(res.success, '加入房间成功')
        assert(res.room.players.length === 2, '玩家数 = 2')
        return room
      })
    }).then(function (room) {
      // Test 4: 开始对局
      log('\n--- 测试4: 开始对局 ---')
      return api.startRoom(room.id, '测试用户A').then(function (res) {
        assert(res.success, '开始对局成功')
        assert(res.sessionId, '返回 sessionId')
        that._testSessionId = res.sessionId
        return { room: room, sessionId: res.sessionId, players: res.room.players }
      })
    }).then(function (ctx) {
      // Test 5: 添加一局
      log('\n--- 测试5: 添加一局(自摸) ---')
      var scores = {}
      ctx.players.forEach(function (p, i) { scores[p] = i === 0 ? 3 : -1 })
      return api.addRound(ctx.sessionId, {
        type: '自摸', winner: ctx.players[0],
        loser: ctx.players.slice(1), scores: scores
      }).then(function (res) {
        assert(res.success, '添加一局成功')
        var s = res.session
        assert(s.total_scores[ctx.players[0]] === 3, '赢家总分 = 3')
        return ctx
      })
    }).then(function (ctx) {
      // Test 6: 添加第二局
      log('\n--- 测试6: 添加第二局(点炮) ---')
      var scores = {}
      ctx.players.forEach(function (p) { scores[p] = 0 })
      scores[ctx.players[1]] = 5
      scores[ctx.players[0]] = -5
      return api.addRound(ctx.sessionId, {
        type: '点炮', winner: ctx.players[1],
        loser: [ctx.players[0]], scores: scores
      }).then(function (res) {
        assert(res.success, '添加第二局成功')
        assert(res.session.total_scores[ctx.players[0]] === -2, '玩家A总分 = -2')
        assert(res.session.total_scores[ctx.players[1]] === 4, '玩家B总分 = 4')
        return ctx
      })
    }).then(function (ctx) {
      // Test 7: 查询对局
      log('\n--- 测试7: 查询对局 ---')
      return api.getSession(ctx.sessionId).then(function (res) {
        assert(res.success, '查询对局成功')
        assert(res.session.rounds.length === 2, '共 2 局')
        return ctx
      })
    }).then(function (ctx) {
      // Test 8: 结算
      log('\n--- 测试8: 结算 ---')
      return api.settleSession(ctx.sessionId).then(function (res) {
        assert(res.success, '结算成功')
        return ctx
      })
    }).then(function (ctx) {
      // Test 9: 结束对局
      log('\n--- 测试9: 结束对局 ---')
      return api.endRoom(ctx.room.id, '测试用户A').then(function (res) {
        assert(res.success, '结束对局成功')
        return ctx
      })
    }).then(function (ctx) {
      // Test 10: WebSocket 连接
      log('\n--- 测试10: WebSocket连接 ---')
      return new Promise(function (resolve) {
        var wsUrl = app.globalData.baseUrl.replace('https://', 'wss://').replace('/api', '')
        var socketTask = wx.connectSocket({ url: wsUrl })
        var done = false

        socketTask.onOpen(function () {
          if (done) return
          done = true
          assert(true, 'WebSocket 连接成功')
          socketTask.close({})
          resolve(ctx)
        })

        socketTask.onError(function () {
          if (done) return
          done = true
          assert(false, 'WebSocket 连接失败')
          resolve(ctx)
        })

        setTimeout(function () {
          if (!done) {
            done = true
            assert(false, 'WebSocket 连接超时')
            socketTask.close({})
            resolve(ctx)
          }
        }, 5000)
      })
    }).then(function (ctx) {
      // Test 11: WebSocket 推送
      log('\n--- 测试11: WebSocket推送 ---')
      return new Promise(function (resolve) {
        var wsUrl = app.globalData.baseUrl.replace('https://', 'wss://').replace('/api', '')

        // 创建新房间用于推送测试
        api.createRoom('WS测试A').then(function (roomRes) {
          var roomId = roomRes.room.id
          var socketTask = wx.connectSocket({ url: wsUrl })
          var done = false

          socketTask.onOpen(function () {
            socketTask.send({
              data: JSON.stringify({ type: 'subscribe', channel: 'room:' + roomId })
            })

            // 加入房间触发广播
            delay(300).then(function () {
              return api.joinRoom(roomId, 'WS测试B')
            }).catch(function () {})
          })

          socketTask.onMessage(function (raw) {
            var msg
            try { msg = JSON.parse(raw.data) } catch (e) { return }

            if (msg.type === 'event' && msg.event === 'player_joined' && !done) {
              done = true
              assert(true, '收到 player_joined 推送')
              assert(msg.data.nickname === 'WS测试B', '推送数据正确')
              socketTask.close({})
              resolve(ctx)
            }
          })

          socketTask.onError(function () {
            if (!done) { done = true; assert(false, 'WS推送测试连接失败'); resolve(ctx) }
          })

          setTimeout(function () {
            if (!done) {
              done = true
              assert(false, 'WS推送测试超时')
              socketTask.close({})
              resolve(ctx)
            }
          }, 8000)
        }).catch(function () {
          assert(false, 'WS推送测试: 创建房间失败')
          resolve(ctx)
        })
      })
    }).then(function () {
      // 汇总
      log('\n========== 汇总 ==========')
      log('通过: ' + passed + '  失败: ' + failed)
      if (failed === 0) {
        log('\n全部测试通过!')
      }
      that.setData({ testRunning: false })
    }).catch(function (e) {
      log('\n测试异常: ' + e.message)
      that.setData({ testRunning: false })
    })
  },

  quickStart: function () {
    var defaults = ['张三', '李四', '王五', '赵六']
    var that = this
    wx.showLoading({ title: '初始化...' })
    api.createSession(defaults).then(function (res) {
      wx.hideLoading()
      app.globalData.sessionId = res.session.id
      app.globalData.players = defaults.map(function (n) { return { name: n, score: 0 } })
      app.globalData.rounds = []
      app.globalData.myName = ''
      app.globalData.testMode = true
      wx.navigateTo({ url: '/pages/game/game?test=1' })
    }).catch(function (err) {
      wx.hideLoading()
      that.setData({ testResult: '快速开桌失败: ' + err.message })
    })
  }
})
