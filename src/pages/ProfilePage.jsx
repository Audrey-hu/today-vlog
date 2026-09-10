import { useMemo, useState } from 'react'
import { useApp } from '../store.jsx'
import { levelFromXp, nextLevel, progressToNext } from '../utils/levels.js'
import { ACHIEVEMENTS, getCardById } from '../data/index.js'
import { achievementProgress } from '../utils/achievements.js'
import { TypeBadge } from '../components/Bits.jsx'
import { CardInfo } from '../components/VlogCard.jsx'
import DayDetail from '../components/DayDetail.jsx'
import { weatherKey, weatherMeta } from '../utils/weather.js'
import { formatDateShort, parseDateKey, weekdayZh, dateKey } from '../utils/date.js'
import { MOOD_OPTIONS } from '../data/cardMeta.js'

function pseudoCardFromFav(fav) {
  return fav.snapshot || getCardById(fav.id) || null
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 50, height: 30, borderRadius: 99, padding: 0,
        background: on ? 'var(--accent)' : '#d8d0c2',
        position: 'relative', transition: 'background 0.15s ease', flex: '0 0 auto'
      }}
      aria-pressed={on}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 24, height: 24,
        borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.15s ease'
      }} />
    </button>
  )
}

export default function ProfilePage() {
  const { db, clearEverything, setSettings, toast, useCard, addFavorite, setTab } = useApp()
  const profile = db.profile
  const history = db.history || []
  const level = levelFromXp(profile.xp)
  const next = nextLevel(profile.xp)
  const progress = progressToNext(profile.xp)
  const totalShots = history.reduce((a, r) => a + (r.doneCount || 0), 0)
  const distinct = new Set(history.map((r) => r.card.id)).size
  const unlockedCount = profile.achievements.length

  const [showFavCard, setShowFavCard] = useState(null)
  const [archiveFilter, setArchiveFilter] = useState('all')
  const [weatherFilter, setWeatherFilter] = useState('all')
  const [moodFilter, setMoodFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [activeFavTab, setActiveFavTab] = useState(true)
  const [favHiddenOpen, setFavHiddenOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = history
    if (archiveFilter === 'theme') list = list.filter((r) => ['easy', 'observe', 'mystery'].includes(r.card.type))
    else if (archiveFilter !== 'all') list = list.filter((r) => r.card.type === archiveFilter || r.card.kind === archiveFilter)
    if (weatherFilter !== 'all') list = list.filter((r) => weatherKey(r.weather) === weatherFilter)
    if (moodFilter !== 'all') list = list.filter((r) => r.mood === moodFilter)
    if (search.trim()) {
      const q = search.trim()
      list = list.filter((r) => (r.card.title || '').includes(q) || (r.text || '').includes(q))
    }
    return list
  }, [history, archiveFilter, weatherFilter, moodFilter, search])

  const favs = profile.favorites || []

  const openFavorite = (fav) => {
    const card = pseudoCardFromFav(fav)
    if (!card) return
    setFavHiddenOpen(false)
    setShowFavCard(card)
  }

  const shootFavorite = (card) => {
    const todayBusy = db.today && db.today.dateKey === dateKey() && db.today.step !== 'shared'
    if (todayBusy) {
      toast('今天已经有卡了，明天再来拍', '🎴')
      return
    }
    useCard(card, 'normal')
    setShowFavCard(null)
    setTab('today')
  }

  return (
    <div>
      <header style={{ padding: '6px 0 2px' }}>
        <div className="small" style={{ color: 'var(--purple)', fontWeight: 800 }}>我的 · PROFILE</div>
        <h1 className="h1" style={{ fontSize: 24 }}>生活档案</h1>
        <p className="subtitle">XP 只是增加游戏感，不制造压力。</p>
      </header>

      <div className="section" style={{ marginTop: 14, background: 'linear-gradient(135deg,#262a30,#3b4049)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 18, background: 'var(--orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900
          }}>
            Lv.{level.level}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{level.name}</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
              共 {profile.xp} XP{next ? ` · 距离 Lv.${next.level} 还差 ${next.minXp - profile.xp} XP` : ' · 已满级'}
            </div>
          </div>
        </div>
        <div className="xp-bar" style={{ marginTop: 12, background: 'rgba(255,255,255,0.18)' }}>
          <div className="xp-fill" style={{ width: Math.round(progress * 100) + '%', background: 'linear-gradient(90deg,#f0b36b,#ffd9a8)' }} />
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-box"><div className="num">{history.length}</div><div className="lbl">记录天数</div></div>
        <div className="stat-box"><div className="num">{totalShots}</div><div className="lbl">完成镜头</div></div>
        <div className="stat-box"><div className="num">{distinct}</div><div className="lbl">不同主题</div></div>
      </div>

      <details className="section" open={activeFavTab} style={{ marginTop: 14 }} onToggle={(e) => setActiveFavTab(e.target.open)}>
        <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: 16 }}>❤️ 以后想拍 <span className="tag" style={{ marginLeft: 6 }}>{favs.length}</span></summary>
        <p className="small muted" style={{ margin: '6px 0 8px' }}>收藏的卡会留在这里，哪天想拍随时拿出来。</p>
        {favs.length === 0 && <div className="no-record">抽卡时点「♡ 收藏」，想拍的主题就会出现在这里。</div>}
        {favs.map((fav) => {
          const card = pseudoCardFromFav(fav)
          if (!card) return null
          return (
            <div key={fav.id} className="record-card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <TypeBadge type={card.type} />
              <button onClick={() => openFavorite(fav)} style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{card.title}</div>
                <div className="small muted">{card.minutes} 分钟 · {card.difficulty} 星</div>
              </button>
            </div>
          )
        })}
      </details>

      <details className="section" style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: 16 }}>🏆 成就 <span className="tag" style={{ marginLeft: 6 }}>{unlockedCount} / {ACHIEVEMENTS.length}</span></summary>
        <div style={{ marginTop: 10 }}>
          {ACHIEVEMENTS.map((a) => {
            const on = profile.achievements.includes(a.id)
            const prog = on ? null : achievementProgress(a.id, db)
            return (
              <div key={a.id} className={'ach-item' + (on ? '' : ' locked')}>
                <span className={'ach-ico' + (on ? '' : ' locked')}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ach-title">{a.title}</div>
                  <div className="ach-desc">{a.desc}</div>
                  {!on && prog && (
                    <div className="ach-progress">进度 {Math.min(prog.cur, prog.goal)}/{prog.goal}</div>
                  )}
                </div>
                <span style={{ fontSize: 18 }}>{on ? '✓' : '🔒'}</span>
              </div>
            )
          })}
        </div>
      </details>

      <details className="section" style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: 16 }}>🗂 生活档案 <span className="tag" style={{ marginLeft: 6 }}>{history.length}</span></summary>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索主题或一句话…"
          style={{ width: '100%', border: '1.5px solid var(--line)', borderRadius: 12, padding: '9px 11px', margin: '10px 0 8px', background: '#fffdf8' }}
        />
        <div className="chip-row" style={{ marginBottom: 8 }}>
          {[['all', '全部'], ['easy', '轻松/观察'], ['challenge', '挑战'], ['crazy', '疯狂'], ['director', '导演'], ['treasure', '寻宝']].map(([k, label]) => (
            <button key={k} className={'chip' + (archiveFilter === k ? ' on' : '')} onClick={() => setArchiveFilter(k)} style={{ minHeight: 36, padding: '5px 11px', fontSize: 13 }}>{label}</button>
          ))}
        </div>
        <div className="chip-row" style={{ marginBottom: 8 }}>
          {[['all', '任何天气'], ['rain', '🌧 雨'], ['clear', '☀️ 晴'], ['cloudy', '☁️ 阴'], ['night', '🌙 夜'], ['snow', '❄️ 雪'], ['fog', '🌫 雾']].map(([k, label]) => (
            <button key={k} className={'chip' + (weatherFilter === k ? ' on on-blue' : '')} onClick={() => setWeatherFilter(k)} style={{ minHeight: 36, padding: '5px 11px', fontSize: 13 }}>{label}</button>
          ))}
        </div>
        <div className="chip-row" style={{ marginBottom: 8 }}>
          <button className={'chip' + (moodFilter === 'all' ? ' on' : '')} onClick={() => setMoodFilter('all')} style={{ minHeight: 36, padding: '5px 11px', fontSize: 13 }}>任何心情</button>
          {MOOD_OPTIONS.map((m) => (
            <button key={m.key} className={'chip' + (moodFilter === m.key ? ' on' : '')} onClick={() => setMoodFilter(m.key)} style={{ minHeight: 36, padding: '5px 11px', fontSize: 13 }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
        {filtered.length === 0 && <div className="no-record" style={{ padding: '24px 8px' }}>这个筛选下还没有记录。空白只是那天没有记录。</div>}
        {filtered.slice(0, 100).map((rec) => (
          <button key={rec.dateKey + rec.card.id + rec.createdAt} className="record-card" style={{ width: '100%', textAlign: 'left', display: 'block' }} onClick={() => setDetail(rec)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, flex: 1 }}>{rec.card.title}</span>
              {rec.weather && <span>{weatherMeta(rec.weather === 'nice' ? 'nice' : rec.weather).emoji}</span>}
              <span style={{ fontSize: 12, color: 'var(--accent-deep)', fontWeight: 800 }}>+{rec.xp}</span>
            </div>
            <div className="small muted">{formatDateShort(rec.dateKey)} · {weekdayZh(parseDateKey(rec.dateKey))} · {rec.doneCount}/{rec.totalCount}</div>
          </button>
        ))}
      </details>

      <details className="section" style={{ marginTop: 10 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800, fontSize: 16 }}>⚙️ 设置</summary>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>震动反馈</div>
              <div className="small muted">抽卡和勾选镜头时的轻微震动</div>
            </div>
            <Toggle on={profile.settings.haptics !== false} onChange={() => setSettings({ haptics: profile.settings.haptics === false })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>自动识别天气</div>
              <div className="small muted">每天打开时尝试用定位获取天气（失败会自动回落到手动）</div>
            </div>
            <Toggle on={profile.settings.autoWeather !== false} onChange={() => setSettings({ autoWeather: profile.settings.autoWeather === false })} />
          </div>
          <button className="btn btn-danger btn-block" style={{ marginTop: 12 }} onClick={() => setConfirmClear(true)}>
            清空本机数据
          </button>
          <p className="small muted" style={{ margin: '10px 0 0' }}>
            所有记录、收藏、XP 只存在这台浏览器的 localStorage。不会上传照片、视频或位置历史。
          </p>
        </div>
      </details>

      {showFavCard && (
        <>
          <div className="overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={() => setShowFavCard(null)} />
          <div className="sheet" style={{ paddingTop: 8 }}>
            <div className="sheet-grip" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 800 }}>以后想拍</span>
              <button className="mini-link" onClick={() => setShowFavCard(null)}>关闭</button>
            </div>
            <CardInfo card={showFavCard} hiddenOpen={favHiddenOpen} onToggleHidden={() => setFavHiddenOpen((v) => !v)} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => shootFavorite(showFavCard)}>🎴 今天来拍</button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { addFavorite(showFavCard); setShowFavCard(null) }}>取消收藏</button>
            </div>
          </div>
        </>
      )}

      {detail && (
        <>
          <div className="overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={() => setDetail(null)} />
          <DayDetail record={detail} onClose={() => setDetail(null)} />
        </>
      )}

      {confirmClear && (
        <div className="modal-center" onClick={() => setConfirmClear(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>确定清空吗？</h2>
            <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>
              会删除本机所有记录、日历、XP、收藏和设置。清空后无法恢复。
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmClear(false)}>再想想</button>
              <button
                className="btn btn-danger"
                style={{ flex: 1, color: '#fff' }}
                onClick={() => {
                  clearEverything()
                  setConfirmClear(false)
                  toast('已清空。从今天开始重新记录吧。', '🧹')
                }}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
