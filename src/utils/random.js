export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick(arr) {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickN(arr, n) {
  return shuffle(arr).slice(0, n)
}

// 加权随机：返回数组中的一项。weights 可以是函数或并行数组。
export function weightedPick(items, getWeight) {
  if (!items || items.length === 0) return null
  const weights = items.map((it, i) => {
    const w = typeof getWeight === 'function' ? getWeight(it, i) : getWeight[i]
    return Math.max(0.001, Number.isFinite(w) ? w : 1)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}
