Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    result: {
      type: Object,
      value: null
    }
  },
  data: {
    editableScores: {},
    scoreNames: [],
    isBalanced: false
  },
  observers: {
    'result': function (val) {
      if (val && val.scores) {
        var scores = JSON.parse(JSON.stringify(val.scores))
        var names = Object.keys(scores)
        this.setData({
          editableScores: scores,
          scoreNames: names,
          isBalanced: this.checkBalanced(scores)
        })
      }
    }
  },
  methods: {
    checkBalanced: function (scores) {
      var total = 0
      var keys = Object.keys(scores)
      for (var i = 0; i < keys.length; i++) {
        total += scores[keys[i]]
      }
      return total === 0
    },

    adjustScore: function (e) {
      var name = e.currentTarget.dataset.name
      var delta = Number(e.currentTarget.dataset.delta)
      var scores = JSON.parse(JSON.stringify(this.data.editableScores))
      scores[name] += delta
      this.setData({
        editableScores: scores,
        isBalanced: this.checkBalanced(scores)
      })
    },

    onConfirm: function () {
      if (!this.data.isBalanced) return
      var result = JSON.parse(JSON.stringify(this.properties.result))
      result.scores = JSON.parse(JSON.stringify(this.data.editableScores))
      this.triggerEvent('confirm', { result: result })
    },

    onCancel: function () {
      this.triggerEvent('cancel')
    }
  }
})
