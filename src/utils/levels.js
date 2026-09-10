// 等级不施压：只是名字随着 XP 变化
export const LEVELS = [
  { level: 1, minXp: 0, name: '刚开始乱拍' },
  { level: 2, minXp: 60, name: '偶尔会记录' },
  { level: 3, minXp: 160, name: '开始会观察' },
  { level: 4, minXp: 320, name: '生活观察员' },
  { level: 5, minXp: 560, name: '日常捕手' },
  { level: 6, minXp: 900, name: '镜头收集者' },
  { level: 7, minXp: 1400, name: '普通生活导演' },
  { level: 8, minXp: 2100, name: '生活纪录片导演' },
  { level: 9, minXp: 3200, name: '什么都能拍的人' },
  { level: 10, minXp: 5000, name: '传奇生活观察员' }
]

export function levelFromXp(xp) {
  let cur = LEVELS[0]
  for (const lv of LEVELS) {
    if (xp >= lv.minXp) cur = lv
  }
  return cur
}

export function nextLevel(xp) {
  return LEVELS.find((l) => l.minXp > xp) || null
}

export function progressToNext(xp) {
  const cur = levelFromXp(xp)
  const next = nextLevel(xp)
  if (!next) return 1
  return (xp - cur.minXp) / (next.minXp - cur.minXp)
}
