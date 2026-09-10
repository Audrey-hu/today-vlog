import { NORMAL_POOL, CHALLENGES, CRAZY_CARDS, DIRECTORS, makeTreasureCard } from '../data/index.js'
import { weatherKey } from './weather.js'
import { currentPeriod, lastNDateKeys, dateKey } from './date.js'
import { weightedPick } from './random.js'

const TIME_RANK = { '5': 1, '15': 2, '30': 3, '60': 4, all: 5 }

export function defaultConditions() {
  return {
    mood: 'normal',
    time: '15',
    weather: null,
    scenes: [],
    boredom: 'normal',
    weatherSource: null
  }
}

function includesAny(list, candidates) {
  if (!list || list.length === 0) return false
  if (list.includes('all')) return true
  return candidates.some((x) => list.includes(x))
}

function inList(list, value) {
  if (!list || list.length === 0) return true
  if (list.includes('all')) return true
  return list.includes(value)
}

function weatherMatched(cardWeather, wCond) {
  if (!wCond || !cardWeather || cardWeather.length === 0) return false
  if (cardWeather.includes('all')) return false
  return cardWeather.includes(wCond)
}

export function recencyInfo(history) {
  const recentKeys = lastNDateKeys(7)
  const catCount = {}
  const recentTheme = new Set()
  const completedThemes = new Set()
  const nowKey = dateKey()
  for (const rec of history || []) {
    if (!rec || !rec.dateKey) continue
    const age = nowKey.localeCompare(rec.dateKey)
    completedThemes.add(rec.card?.id)
    if (recentKeys.includes(rec.dateKey)) {
      const cat = rec.card?.category || 'daily'
      catCount[cat] = (catCount[cat] || 0) + 1
      recentTheme.add(rec.card?.id)
    }
  }
  return { catCount, recentTheme, completedThemes }
}

// 综合评分 + 加权随机：保留随机感，但不是纯随机
export function scoreCard(card, cond, rec, favIds, period, activeId) {
  if (!cond) return 1
  let s = 1
  const wCond = weatherKey(cond.weather)

  // 心情 +3
  if (inList(card.moods, cond.mood)) s += 3
  // 天气 +3（天气只参与推荐，不卡死）
  if (weatherMatched(card.weather, wCond)) s += 3
  // 场景 +4
  if (cond.scenes && cond.scenes.length) {
    if (includesAny(card.scenes, cond.scenes)) s += 4
  }
  // 时间 +4
  if (cond.time && inList(card.times, String(cond.time))) s += 4
  // 无聊度 +2
  if (cond.boredom && inList(card.boredom, cond.boredom)) s += 2
  // 当前时段弱加分
  if (card.periods && card.periods.includes(period)) s += 2
  // 时间自动判断：晚上给夜晚/灯光主题一点推力，白天给晴光主题一点推力（不卡死）
  if (card.weather.includes('night') && (period === 'night' || period === 'lateNight')) s += 2
  if (card.weather.includes('clear') && ['morning', 'noon', 'afternoon'].includes(period)) s += 1
  // 最近 7 天同分类 -5/次
  const cat = card.category || 'daily'
  if (rec.catCount[cat]) s -= 5 * rec.catCount[cat]
  // 收藏但没拍过 +1
  if (favIds && favIds.includes(card.id) && !rec.completedThemes.has(card.id)) s += 1
  // 活跃中的卡不重复抽给自己
  if (activeId && card.id === activeId) return 0.001

  let w = Math.max(0.15, s)
  if (weatherMatched(card.weather, wCond)) w *= 1.7
  w = Math.pow(w, 2.6)

  // 类型与档位调节（保留随机惊喜，但方向要对）
  const time = String(cond.time || '15')
  if (card.type === 'challenge' && ['5', '15'].includes(time) && card.difficulty >= 4) w *= 0.25
  if (card.type === 'crazy' && ['5', '15'].includes(time)) w *= 0.2
  if (card.type === 'director') {
    w *= ['30', '60', 'all'].includes(time) ? 1 : 0.3
    if (cond.mood === 'barely' || cond.mood === 'tired') w *= 0.2
  }
  if (card.type === 'easy' && ['60', 'all'].includes(time)) w *= 0.5
  if (card.difficulty >= 4 && ['5', '15'].includes(time)) w *= 0.3
  // 时间完全不匹配时打折但保留：用户说 5 分钟仍可能抽到“想拍”的
  const wantRank = TIME_RANK[time] || 2
  const maxCardTime = Math.max(...card.times.map((t) => TIME_RANK[t] || 2))
  if (maxCardTime > wantRank + 1) w *= 0.45
  if (cond.weather === 'rain' && card.category === 'light' && card.type !== 'mystery') w *= 0.5
  if (cond.weather === 'clear' && card.weather.includes('rain') && card.category === 'rain') w *= 0.4
  // 天气只参与推荐，不卡死：指定了具体天气的卡，在“别的天气”里降低权重
  if (wCond && card.weather.length && !card.weather.includes('all') && !weatherMatched(card.weather, wCond)) w *= 0.55
  if (cond.boredom === 'dead' && card.difficulty >= 4 && card.type !== 'crazy') w *= 0.25

  // 别太无聊：稀有度高的卡、观察/故事/游戏类更常出现；
  // 时间够的时候，把“过于平淡的极简任务”降权
  if (card.rarity === 'rare') w *= 1.3
  else if (card.rarity === 'special') w *= 1.5
  else if (card.rarity === 'weird') w *= 1.4
  if (card.type === 'observe' || card.type === 'treasure') w *= 1.2
  if (['story', 'game', 'people', 'mood', 'color', 'light', 'sound', 'shadow'].includes(card.category)) w *= 1.15
  if (card.type === 'easy' && card.difficulty <= 1 && time !== '5') w *= 0.62
  if (card.category === 'micro' && time !== '5') w *= 0.8
  return w
}

function filterRecent30(history, cards) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  const key = dateKey(cutoff)
  const done = new Set()
  for (const rec of history || []) {
    if (rec && rec.dateKey && rec.dateKey >= key) done.add(rec.card?.id)
  }
  return cards.filter((c) => !done.has(c.id))
}

export function drawCard({ conditions, history, favorites, mode = 'normal', activeCardId = null, prevCardId = null }) {
  const favIds = (favorites || []).map((f) => f.id)
  const rec = recencyInfo(history)
  const period = currentPeriod()
  const cond = conditions || defaultConditions()

  let pool = []
  if (mode === 'challenge') pool = filterRecent30(history, CHALLENGES)
  else if (mode === 'crazy') pool = filterRecent30(history, CRAZY_CARDS)
  else if (mode === 'director') pool = filterRecent30(history, DIRECTORS)
  else pool = filterRecent30(history, NORMAL_POOL)

  if (pool.length < 8) {
    // 最近 30 天都抽遍了：放行，重新进入循环（用全量池）
    pool = mode === 'challenge' ? CHALLENGES : mode === 'crazy' ? CRAZY_CARDS : mode === 'director' ? DIRECTORS : NORMAL_POOL
  }

  // 普通池里塞一张新鲜合成寻宝卡
  let treasureCard = null
  if (mode === 'normal') {
    treasureCard = makeTreasureCard()
    pool = pool.concat(treasureCard)
  }

  const candidates = pool.filter((c) => c.id !== prevCardId)
  const card = weightedPick(candidates, (c) => scoreCard(c, cond, rec, favIds, period, activeCardId))
  if (card && card.id === 'treasure_draw') {
    // 重新合成避免上一次的固定内容
    return makeTreasureCard()
  }
  return card
}
