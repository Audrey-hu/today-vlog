// 数据文件使用紧凑字段，保证 580+ 张卡可以维护在一页一行的规模里：
//   id, t=标题, tp=卡类型, r=稀有度, c=分类, d=难度, min=分钟, xp,
//   mo=心情, we=天气, sc=场景, ti=可用时间, bo=无聊度, per=时段,
//   de=描述, ru=规则(|分隔), sh=镜头(标题:提示|标题:提示),
//   op=开头, en=结尾, hi=隐藏任务, ca=字幕建议, ta=标签

function splitArr(str) {
  if (!str) return []
  return String(str)
    .split(/[|,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function splitSpaces(str) {
  if (!str) return []
  if (String(str).trim() === 'all' || String(str).trim() === 'any') return ['all']
  return String(str)
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function normShots(str) {
  if (Array.isArray(str)) return str
  return splitArr(str).map((pair) => {
    const idx = pair.indexOf(':')
    if (idx === -1) return { title: pair, tip: '' }
    return { title: pair.slice(0, idx).trim(), tip: pair.slice(idx + 1).trim() }
  })
}

export function normTimes(str) {
  const list = splitSpaces(str)
  if (list.length === 0) return ['all']
  if (list.includes('all')) return ['all']
  return list.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
}

export function normalizeCard(raw, kind = 'theme') {
  const moods = splitSpaces(raw.mo)
  const weather = splitSpaces(raw.we)
  const scenes = splitSpaces(raw.sc)
  const times = normTimes(raw.ti)
  const boredom = splitSpaces(raw.bo)
  const periods = splitSpaces(raw.per)
  const shots = normShots(raw.sh)
  const rules = splitArr(raw.ru)
  return {
    id: raw.id,
    kind,
    title: raw.t,
    type: raw.tp || 'easy',
    rarity: raw.r || 'common',
    category: raw.c || 'daily',
    difficulty: raw.d ?? 1,
    minutes: raw.min ?? 10,
    xp: raw.xp ?? 20,
    moods,
    weather,
    scenes,
    times,
    boredom,
    periods,
    desc: raw.de || '',
    rules,
    shots,
    opening: raw.op || '',
    ending: raw.en || '',
    hidden: raw.hi || '',
    caption: raw.ca || '',
    tags: splitSpaces(raw.ta)
  }
}
