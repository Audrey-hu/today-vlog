const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const WEEK_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function pad(n) {
  return String(n).padStart(2, '0')
}

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayObj() {
  return new Date()
}

export function weekdayZh(d = new Date()) {
  return WEEK[d.getDay()]
}

export function formatDateLong(key) {
  const d = parseDateKey(key)
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${WEEK[d.getDay()]}`
}

export function formatDateShort(key) {
  const d = parseDateKey(key)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function monthLabel(year, monthIdx) {
  return `${year}年${monthIdx + 1}月`
}

// 返回从周一开始的 6 行周数组（含前后月补位），每项 { key, day, inMonth }
export function monthWeeks(year, monthIdx) {
  const first = new Date(year, monthIdx, 1)
  const startDow = (first.getDay() + 6) % 7 // 周一=0
  const start = new Date(year, monthIdx, 1 - startDow)
  const weeks = []
  for (let w = 0; w < 6; w++) {
    const row = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i)
      row.push({
        key: dateKey(d),
        day: d.getDate(),
        inMonth: d.getMonth() === monthIdx
      })
    }
    weeks.push(row)
  }
  return weeks
}

export function isSameDay(key) {
  return key === dateKey()
}

export function lastNDateKeys(n) {
  const out = []
  const now = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    out.push(dateKey(d))
  }
  return out
}

// 时间段：用于“现在适合什么主题”的弱提示
export function currentPeriod(d = new Date()) {
  const h = d.getHours()
  if (h >= 6 && h < 10) return 'morning'
  if (h >= 10 && h < 14) return 'noon'
  if (h >= 14 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'night'
  return 'lateNight'
}

export const PERIOD_LABEL = {
  morning: '现在是早晨',
  noon: '现在是中午',
  afternoon: '现在是下午',
  night: '现在是晚上',
  lateNight: '现在很晚了'
}

export function greeting() {
  const p = currentPeriod()
  if (p === 'morning') return '早上好'
  if (p === 'noon') return '中午好'
  if (p === 'afternoon') return '下午好'
  if (p === 'night') return '晚上好'
  return '还没睡的话'
}

export function dateStamp(key) {
  return key ? key.replaceAll('-', '.') : dateKey().replaceAll('-', '.')
}
