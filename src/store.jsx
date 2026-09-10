import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { KEYS, load, save, clearAll } from './utils/storage.js'
import { dateKey } from './utils/date.js'
import { drawCard, defaultConditions } from './utils/recommendation.js'
import { BINGO_POOL, RANDOM_EVENTS, makeNoBrainCard } from './data/index.js'
import { pickN, pick, weightedPick } from './utils/random.js'
import { evaluateAchievements } from './utils/achievements.js'
import { levelFromXp, nextLevel } from './utils/levels.js'

const DEFAULT_PROFILE = () => ({
  xp: 0,
  draws: 0,
  achievements: [],
  favorites: [],
  eventsUsed: 0,
  settings: { haptics: true, autoWeather: true, sawWelcome: false }
})

function defaultBingo() {
  return { dateKey: dateKey(), grid: pickN(BINGO_POOL, 9), done: [], lines: 0 }
}

export function cardChecklist(card) {
  if (!card) return []
  if (card.shots && card.shots.length) return card.shots
  if (card.rules && card.rules.length) return card.rules.map((r) => ({ title: r, tip: '' }))
  return [
    { title: '打开相机', tip: '第一个镜头不用想太多' },
    { title: '拍一个画面', tip: '先拍下来再说' },
    { title: '拍第二个画面', tip: '找一个不同的角度' },
    { title: '拍一个声音', tip: '录一段环境声也可以' },
    { title: '今天的最后一镜', tip: '收工' }
  ]
}

function makeRecordFromToday(today, xp) {
  const card = today.card || {}
  return {
    dateKey: today.dateKey,
    createdAt: today.finishedAt || new Date().toISOString(),
    card: {
      id: card.id,
      title: card.title,
      type: card.type,
      rarity: card.rarity,
      category: card.category,
      kind: card.kind,
      minutes: card.minutes,
      xp: card.xp,
      difficulty: card.difficulty
    },
    conditions: { ...(today.conditions || {}) },
    doneCount: (today.done || []).length,
    totalCount: cardChecklist(card).length,
    xp,
    text: today.text || '',
    mood: today.mood || today.conditions?.mood || '',
    weather: today.conditions?.weather || null,
    bingoLines: today.bingoLines || 0,
    hiddenDone: !!today.hiddenDone,
    auto: !!today.auto
  }
}

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [tab, setTabRaw] = useState('today')
  const [db, setDb] = useState(() => {
    const profile = load(KEYS.profile, DEFAULT_PROFILE())
    const history = load(KEYS.history, [])
    const today = load(KEYS.today, null)
    const bingo = load(KEYS.bingo, defaultBingo())
    const conditions = load('wssit.conditions.v1', defaultConditions())
    const now = dateKey()
    // 跨天：有进度的昨日卡自动归档，没进度的直接清空
    if (today && today.dateKey !== now && today.done && today.done.length > 0 && today.step !== 'shared') {
      const rec = makeRecordFromToday({ ...today, auto: true }, today.xpGained || 0)
      history.unshift(rec)
      return { profile, history, today: null, bingo: defaultBingo(), conditions: defaultConditions() }
    }
    if (today && today.dateKey !== now) {
      return { profile, history, today: null, bingo: defaultBingo(), conditions: defaultConditions() }
    }
    if (bingo.dateKey !== now) {
      return { profile, history, today, bingo: defaultBingo(), conditions }
    }
    return { profile, history, today, bingo, conditions }
  })

  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)
  const lastLevel = useRef(levelFromXp(db.profile.xp))
  const achievementsChecked = useRef(JSON.stringify(db.profile.achievements))
  const pendingWrites = useRef({})
  const flushTimer = useRef(null)

  // 存储写入延迟合并：点击时只标记需要保存的键，避免同步写 5 个键拖住页面
  const flushWrites = () => {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current)
      flushTimer.current = null
    }
    const pending = pendingWrites.current
    pendingWrites.current = {}
    try {
      if (pending.profile) save(KEYS.profile, pending.profile)
      if (pending.history) save(KEYS.history, pending.history)
      if ('today' in pending) save(KEYS.today, pending.today)
      if (pending.bingo) save(KEYS.bingo, pending.bingo)
      if (pending.conditions) save('wssit.conditions.v1', pending.conditions)
    } catch (err) {
      console.warn('flush writes failed', err)
    }
  }

  const persist = (next, keys) => {
    const list = keys && keys.length ? keys : ['profile', 'history', 'today', 'bingo', 'conditions']
    for (const k of list) {
      pendingWrites.current[k] = k === 'conditions' ? next.conditions : next[k]
    }
    if (!flushTimer.current) flushTimer.current = setTimeout(flushWrites, 260)
  }

  function toast(msg, icon = '') {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, msg, icon }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }

  const haptic = (ms = 18) => {
    if (db.profile.settings.haptics !== false && navigator.vibrate) {
      try { navigator.vibrate(ms) } catch (err) { /* noop */ }
    }
  }

  function addXp(next, amount) {
    const before = lastLevel.current
    next.profile.xp += amount
    const after = levelFromXp(next.profile.xp)
    if (after.level > before.level) {
      toast(`升级了：Lv.${after.level} ${after.name}`, '⭐')
      haptic(40)
    }
    lastLevel.current = after
  }

  function mutate(fn, keys) {
    setDb((prev) => {
      const next = {
        profile: { ...prev.profile, settings: { ...(prev.profile.settings || {}) } },
        history: [...(prev.history || [])],
        today: prev.today ? JSON.parse(JSON.stringify(prev.today)) : null,
        bingo: prev.bingo ? { ...prev.bingo, grid: [...(prev.bingo.grid || [])], done: [...(prev.bingo.done || [])] } : defaultBingo(),
        conditions: { ...(prev.conditions || defaultConditions()) }
      }
      fn(next, prev)
      persist(next, keys)
      return next
    })
  }

  const setTab = (t) => {
    setTabRaw(t)
  }

  function updateConditions(patch) {
    mutate((next) => {
      next.conditions = { ...next.conditions, ...patch }
    }, ['conditions'])
  }

  function applyDrawnCard(card, mode = 'normal') {
    if (!card || !card.id || !card.title) {
      card = makeNoBrainCard()
      mode = 'nobrain'
    }
    mutate((next) => {
      const now = dateKey()
      const redraws = next.today && next.today.dateKey === now && next.today.step === 'card' ? (next.today.redraws || 0) + 1 : 0
      next.profile.draws = (next.profile.draws || 0) + 1
      next.today = {
        dateKey: now,
        step: 'card',
        mode,
        card,
        conditions: { ...(next.conditions || defaultConditions()) },
        done: [],
        events: [],
        hiddenDone: false,
        extra: null,
        redraws,
        drawnAt: new Date().toISOString(),
        bingoLines: 0,
        xpGained: 0
      }
      next.bingo = next.bingo && next.bingo.dateKey === now ? next.bingo : defaultBingo()
    }, ['today', 'profile', 'bingo'])
    haptic(20)
  }

  function draw(mode = 'normal') {
    try {
      const active = db.today && db.today.dateKey === dateKey() ? db.today : null
      let card = drawCard({
        conditions: db.conditions,
        history: db.history,
        favorites: db.profile.favorites,
        mode,
        activeCardId: active?.card?.id || null,
        prevCardId: active?.card?.id || null
      })
      if (!card) card = makeNoBrainCard()
      applyDrawnCard(card, mode)
    } catch (err) {
      console.error('draw failed, use fallback card', err)
      try {
        applyDrawnCard(makeNoBrainCard(), 'nobrain')
      } catch (err2) {
        console.error('fallback draw failed', err2)
        toast('抽卡出了点问题，再试一次', '😵')
      }
    }
  }

  function redraw() {
    draw('normal')
  }

  // 挑战页/收藏等直接指定一张卡（“我想再拍一次”）
  function useCard(card, mode = 'normal') {
    applyDrawnCard(card, mode)
  }

  function chooseCard() {
    mutate((next) => {
      if (next.today) {
        next.today.step = 'active'
        next.today.startedAt = next.today.startedAt || new Date().toISOString()
      }
    }, ['today'])
    haptic(24)
  }

  function toggleShot(index) {
    mutate((next) => {
      const t = next.today
      if (!t) return
      const list = cardChecklist(t.card)
      const cur = t.done || []
      if (index >= list.length) return
      const isDone = cur.includes(index)
      const nextDone = isDone ? cur.filter((i) => i !== index) : [...cur, index].sort((a, b) => a - b)
      t.done = nextDone
      if (!isDone) {
        const total = list.length
        const n = nextDone.length
        if (n === total) toast('今天已经被留下来了。', '🎬')
        else if (n === 1) toast('开始了。', '🎬')
        else if (n >= Math.ceil(total * 0.6)) toast('已经有点像一条 Vlog 了。', '🎬')
        haptic(12)
      }
    }, ['today'])
  }

  function revealHidden() {
    mutate((next) => {
      if (next.today) next.today.hiddenDone = true
    }, ['today'])
    toast('隐藏任务已揭开：完成 +10 XP', '🥷')
    haptic(20)
  }

  function toggleBingo(index) {
    let gained = false
    mutate((next) => {
      const b = next.bingo
      if (!b || b.dateKey !== dateKey()) return
      const isOn = b.done.includes(index)
      b.done = isOn ? b.done.filter((i) => i !== index) : [...b.done, index]
      const grid = b.grid
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ]
      const before = b.lines
      const hits = lines.filter((ln) => ln.every((i) => b.done.includes(i)))
      b.lines = hits.length
      if (b.lines > before) {
        gained = true
        addXp(next, 10)
        if (next.today) next.today.bingoLines = b.lines
      }
    }, ['bingo', 'profile', 'today'])
    if (gained) {
      toast('BINGO！今天已经足够剪一条了。+10 XP', '🅱️')
      haptic(60)
    }
  }

  function useRandomEvent() {
    let ok = false
    let text = ''
    mutate((next) => {
      const t = next.today
      const used = (t && t.events) || []
      if (used.length >= 3) return
      const usedTexts = new Set(used)
      const avail = RANDOM_EVENTS.filter((e) => !usedTexts.has(e.text))
      const ev = pick(avail.length ? avail : RANDOM_EVENTS)
      if (!ev) return
      ok = true
      text = ev.text
      if (t) t.events = [...used, ev.text]
      next.profile.eventsUsed = (next.profile.eventsUsed || 0) + 1
    }, ['today', 'profile'])
    if (ok) {
      toast(text, '🎲')
      haptic(18)
    } else {
      toast('今天的随机事件用完了，明天再来。', '🎲')
    }
  }

  function addFavorite(card) {
    let added = false
    mutate((next) => {
      const favs = next.profile.favorites || []
      const found = favs.find((f) => f.id === card.id)
      if (found) {
        next.profile.favorites = favs.filter((f) => f.id !== card.id)
      } else {
        next.profile.favorites = [
          { id: card.id, snapshot: JSON.parse(JSON.stringify(card)), savedAt: new Date().toISOString() },
          ...favs
        ]
        added = true
      }
    }, ['profile'])
    toast(added ? '已收进「以后想拍」' : '已取消收藏', added ? '❤️' : '💔')
    haptic(added ? 25 : 10)
  }

  function isFavorite(id) {
    return !!db.profile.favorites.find((f) => f.id === id)
  }

  function addExtraChallenge(card) {
    mutate((next) => {
      if (!next.today) return
      next.today.extra = card
      next.today.step = 'active'
    }, ['today'])
    toast('挑战已加入今天：' + (card.title || ''), '🔥')
    haptic(30)
  }

  function addRandomChallenge() {
    const card = drawCard({
      conditions: db.conditions,
      history: db.history,
      favorites: db.profile.favorites,
      mode: 'challenge',
      activeCardId: null,
      prevCardId: null
    })
    if (card) addExtraChallenge(card)
  }

  function goFinish() {
    mutate((next) => {
      if (next.today) next.today.step = 'finish'
    }, ['today'])
    haptic(20)
  }

  function saveDay({ text, mood }) {
    let saved = false
    let xp = 0
    mutate((next) => {
      const t = next.today
      if (!t || t.step === 'shared') return
      xp = (t.card?.xp || 20)
      if (t.hiddenDone) xp += 10
      if (t.extra && t.extra.xp) xp += Math.min(15, Math.round(t.extra.xp / 3))
      const todayWithMeta = { ...t, text: text || '', mood: mood || t.conditions?.mood || '', finishedAt: new Date().toISOString(), xpGained: xp, auto: false }
      const rec = makeRecordFromToday(todayWithMeta, xp)
      next.history = [rec, ...next.history]
      addXp(next, xp)
      next.today = { ...todayWithMeta, step: 'shared', record: rec }
      next.conditions = defaultConditions()
      saved = true
    }, ['history', 'profile', 'today', 'conditions'])
    if (saved) {
      toast(`已保存 +${xp} XP`, '🎬')
      haptic(50)
    }
    return saved
  }

  function resetDay() {
    mutate((next) => {
      next.today = null
      next.conditions = defaultConditions()
      next.bingo = defaultBingo()
    }, ['today', 'conditions', 'bingo'])
  }

  function clearEverything() {
    if (flushTimer.current) {
      clearTimeout(flushTimer.current)
      flushTimer.current = null
    }
    pendingWrites.current = {}
    clearAll()
    setDb({
      profile: DEFAULT_PROFILE(),
      history: [],
      today: null,
      bingo: defaultBingo(),
      conditions: defaultConditions()
    })
    lastLevel.current = levelFromXp(0)
    setTab('today')
  }

  function setSettings(patch) {
    mutate((next) => {
      next.profile.settings = { ...(next.profile.settings || {}), ...patch }
    }, ['profile'])
  }

  // 成就自动检查（幂等）
  useEffect(() => {
    const fresh = evaluateAchievements(db)
    if (fresh.length) {
      const ids = fresh.map((a) => a.id)
      fresh.forEach((a) => {
        setTimeout(() => toast(`成就解锁：${a.title}`, a.icon), 80)
      })
      mutate((next) => {
        next.profile.achievements = [...new Set([...(next.profile.achievements || []), ...ids])]
      }, ['profile'])
      haptic(60)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.profile.xp, db.history.length, db.profile.achievements, db.profile.draws, db.profile.favorites.length, db.profile.eventsUsed])

  // 跨天轮换（后台回来/定时）
  useEffect(() => {
    const rotate = () => {
      const now = dateKey()
      setDb((prev) => {
        let next = prev
        if (prev.today && prev.today.dateKey !== now) {
          let history = prev.history
          if (prev.today.done && prev.today.done.length > 0 && prev.today.step !== 'shared') {
            const rec = makeRecordFromToday({ ...prev.today, auto: true }, prev.today.xpGained || 0)
            history = [rec, ...history]
            toast('昨天没来得及收尾，已自动放进日历', '📅')
          }
          next = { ...prev, history, today: null, conditions: defaultConditions(), bingo: defaultBingo() }
          persist(next)
        } else if (prev.bingo && prev.bingo.dateKey !== now) {
          next = { ...prev, bingo: defaultBingo() }
          persist(next)
        }
        return next
      })
    }
    const iv = setInterval(rotate, 60 * 1000)
    const onHide = () => flushWrites()
    document.addEventListener('visibilitychange', rotate)
    window.addEventListener('focus', rotate)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      clearInterval(iv)
      document.removeEventListener('visibilitychange', rotate)
      window.removeEventListener('focus', rotate)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    }
  }, [])

  const value = useMemo(
    () => ({
      db,
      tab,
      setTab,
      toast,
      haptic,
      updateConditions,
      draw,
      redraw,
      useCard,
      chooseCard,
      toggleShot,
      revealHidden,
      toggleBingo,
      useRandomEvent,
      addFavorite,
      isFavorite,
      addExtraChallenge,
      addRandomChallenge,
      goFinish,
      saveDay,
      resetDay,
      clearEverything,
      setSettings,
      toasts
    }),
    [db, tab, toasts]
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  return useContext(AppCtx)
}
