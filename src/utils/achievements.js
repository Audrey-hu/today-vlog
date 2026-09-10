import { ACHIEVEMENTS } from '../data/index.js'
import { weatherKey } from './weather.js'

function buildStats(db) {
  const history = db.history || []
  const stats = {
    draw: db.profile?.draws || 0,
    records: history.length,
    xp: db.profile?.xp || 0,
    shots: 0,
    singleShots: 0,
    weather: {},
    cat: {},
    scene: {},
    mood: {},
    time: {},
    type: {},
    theme: {},
    bored: 0,
    distinct: new Set(),
    bingo: 0,
    events: db.profile?.eventsUsed || 0,
    favorites: db.profile?.favorites?.length || 0,
    hidden: 0
  }
  for (const r of history) {
    const card = r.card || {}
    stats.shots += r.doneCount || 0
    stats.singleShots = Math.max(stats.singleShots, r.doneCount || 0)
    stats.weather[weatherKey(r.conditions?.weather)] = (stats.weather[weatherKey(r.conditions?.weather)] || 0) + 1
    stats.cat[card.category] = (stats.cat[card.category] || 0) + 1
    for (const s of r.conditions?.scenes || []) stats.scene[s] = (stats.scene[s] || 0) + 1
    if (r.mood) stats.mood[r.mood] = (stats.mood[r.mood] || 0) + 1
    if (r.conditions?.time) stats.time[String(r.conditions.time)] = (stats.time[String(r.conditions.time)] || 0) + 1
    stats.type[card.type] = (stats.type[card.type] || 0) + 1
    stats.type[card.kind] = (stats.type[card.kind] || 0) + 1
    if (card.id) stats.theme[card.id] = (stats.theme[card.id] || 0) + 1
    stats.distinct.add(card.id)
    if (r.conditions?.boredom === 'dead') stats.bored += 1
    stats.bingo += r.bingoLines || 0
    stats.hidden += r.hiddenDone ? 1 : 0
  }
  stats.distinct = stats.distinct.size
  return stats
}

function checkOne(cond, s) {
  const n = cond.n || 1
  switch (cond.k) {
    case 'draw': return s.draw >= n
    case 'records': return s.records >= n
    case 'xp': return s.xp >= n
    case 'shots': return s.shots >= n
    case 'singleShots': return s.singleShots >= n
    case 'weather': return (s.weather[cond.v] || 0) >= n
    case 'cat': return (s.cat[cond.v] || 0) >= n
    case 'scene': return (s.scene[cond.v] || 0) >= n
    case 'mood': return (s.mood[cond.v] || 0) >= n
    case 'time': return (s.time[cond.v] || 0) >= n
    case 'type': return (s.type[cond.v] || 0) >= n
    case 'theme': return (s.theme[cond.v] || 0) >= n
    case 'bored': return s.bored >= n
    case 'distinct': return s.distinct >= n
    case 'bingo': return s.bingo >= n
    case 'events': return s.events >= n
    case 'favorites': return s.favorites >= n
    case 'hidden': return s.hidden >= n
    default: return false
  }
}

export function evaluateAchievements(db) {
  const stats = buildStats(db)
  const unlocked = new Set((db.profile && db.profile.achievements) || [])
  const fresh = []
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.id) && checkOne(a.cond, stats)) fresh.push(a)
  }
  return fresh
}

export function achievementProgress(id, db) {
  const a = ACHIEVEMENTS.find((x) => x.id === id)
  if (!a) return null
  const stats = buildStats(db)
  const cond = a.cond
  const get = () => {
    switch (cond.k) {
      case 'draw': return stats.draw
      case 'records': return stats.records
      case 'xp': return stats.xp
      case 'shots': return stats.shots
      case 'singleShots': return stats.singleShots
      case 'weather': return stats.weather[cond.v] || 0
      case 'cat': return stats.cat[cond.v] || 0
      case 'scene': return stats.scene[cond.v] || 0
      case 'mood': return stats.mood[cond.v] || 0
      case 'time': return stats.time[cond.v] || 0
      case 'type': return stats.type[cond.v] || 0
      case 'theme': return stats.theme[cond.v] || 0
      case 'bored': return stats.bored
      case 'distinct': return stats.distinct
      case 'bingo': return stats.bingo
      case 'events': return stats.events
      case 'favorites': return stats.favorites
      case 'hidden': return stats.hidden
      default: return 0
    }
  }
  return { cur: get(), goal: cond.n || 1 }
}
