function formatDate(dateStr) {
  const d = new Date(dateStr)
  return (d.getMonth() + 1) + '月' + d.getDate() + '日'
}

function formatScore(score) {
  if (score > 0) return '+' + score
  return '' + score
}

function formatMoney(score, baseScore) {
  baseScore = baseScore || 1
  const amount = score * baseScore
  if (amount > 0) return '+¥' + amount
  if (amount < 0) return '-¥' + Math.abs(amount)
  return '¥0'
}

module.exports = {
  formatDate,
  formatScore,
  formatMoney
}
