Component({
  properties: {
    player: {
      type: Object,
      value: { name: '', score: 0 }
    },
    myName: {
      type: String,
      value: ''
    }
  },
  methods: {
    onPayTap: function () {
      this.triggerEvent('pay', { name: this.properties.player.name })
    }
  }
})
