import { useMemo, useState } from 'react'
import { useApp } from '../store.jsx'
import { monthWeeks, monthLabel, dateKey, parseDateKey, formatDateShort, weekdayZh } from '../utils/date.js'
import DayDetail from '../components/DayDetail.jsx'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

function recordDot(rec) {
  const t = rec.card && rec.card.type
  if (t === 'crazy') return '🔥'
  if (t === 'challenge') return '★'
  if (t === 'special' || rec.card?.rarity === 'special') return '◆'
  if (t === 'director') return '🎬'
  if (t === 'treasure') return '🔍'
  return '•'
}

export default function CalendarPage() {
  const { db, toast } = useApp()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(null)
  const history = db.history || []
  const byDate = useMemo(() => {
    const map = {}
    for (const r of history) {
      if (!map[r.dateKey]) map[r.dateKey] = []
      map[r.dateKey].push(r)
    }
    return map
  }, [history])

  const weeks = monthWeeks(year, month)
  const todayKey = dateKey()

  // 很久没回来欢迎
  const lastDate = history.length ? history[0].dateKey : null
  const daysAway = lastDate ? Math.floor((parseDateKey(todayKey) - parseDateKey(lastDate)) / 86400000) : null
  const showWelcome = history.length === 0 || daysAway >= 10

  const nav = (dir) => {
    let m = month + dir
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setMonth(m)
    setYear(y)
  }

  return (
    <div>
      <header style={{ padding: '6px 0 4px' }}>
        <div className="small" style={{ color: 'var(--accent-deep)', fontWeight: 800 }}>生活记录 · ARCHIVE</div>
        <h1 className="h1" style={{ fontSize: 24 }}>日历</h1>
        <p className="subtitle">拍过的日子会留下小点、小星和小火苗。空白只是那天没有记录。</p>
      </header>

      {showWelcome && (
        <div className="section" style={{ marginTop: 12, background: '#eef7ef', borderColor: '#cfe5d3' }}>
          <div style={{ fontWeight: 800 }}>欢迎回来。</div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-2)' }}>
            {history.length ? '日历还给你留着，随时可以补一颗点。' : '今天抽一张卡，让日历从今天开始长内容。'}
          </p>
        </div>
      )}

      <div className="section" style={{ marginTop: 14 }}>
        <div className="cal-head">
          <button className="btn btn-soft btn-sm" onClick={() => nav(-1)}>‹ 上月</button>
          <strong style={{ fontSize: 16 }}>{monthLabel(year, month)}</strong>
          <button className="btn btn-soft btn-sm" onClick={() => nav(1)}>下月 ›</button>
        </div>
        <div className="cal-weekdays">
          {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
        </div>
        {weeks.map((row, wi) => (
          <div className="cal-grid" key={wi} style={{ marginTop: 4 }}>
            {row.map((d) => {
              const recs = byDate[d.key]
              const isToday = d.key === todayKey
              return (
                <button
                  key={d.key}
                  className={
                    'cal-day' +
                    (!d.inMonth ? ' out' : '') +
                    (isToday ? ' today' : '') +
                    (recs && recs.length ? ' has-record' : '')
                  }
                  onClick={() => {
                    if (!recs || !recs.length) {
                      toast('那天没有记录。空白只是那天没有记录。', '📅')
                      return
                    }
                    setSelected({ date: d, recs })
                  }}
                >
                  <span>{d.inMonth ? d.day : ''}</span>
                  <span className="dot">{recs && recs.length ? (recs.length === 1 ? recordDot(recs[0]) : recs.slice(0, 3).map(recordDot).join('')) : ''}</span>
                </button>
              )
            })}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--muted)' }}>
          <span>• 普通任务</span><span>★ 挑战</span><span>◆ 特殊</span><span>🔥 疯狂</span><span>🔍 寻宝</span><span>🎬 导演</span>
        </div>
      </div>

      <div className="section" style={{ marginTop: 14 }}>
        <div className="section-head">
          <span className="section-title">最近的记录</span>
          <span className="tag">{history.length} 天</span>
        </div>
        {history.length === 0 && (
          <div className="no-record">还没有记录。明天早上抽一张卡，从这里开始。</div>
        )}
        {history.slice(0, 5).map((rec) => (
          <button key={rec.dateKey + rec.card?.id + rec.createdAt} className="record-card" style={{ width: '100%', textAlign: 'left' }} onClick={() => setSelected({ recs: [rec] })}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{rec.card.title}</span>
              <span className="dot" style={{ fontSize: 13 }}>{recordDot(rec)}</span>
            </div>
            <div className="small muted" style={{ marginTop: 3 }}>{formatDateShort(rec.dateKey)} · {weekdayZh(parseDateKey(rec.dateKey))} · {rec.doneCount}/{rec.totalCount} 镜头 · +{rec.xp} XP</div>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={() => setSelected(null)} />
          <DayDetail
            record={selected.recs[0]}
            onClose={() => setSelected(null)}
          />
        </>
      )}
    </div>
  )
}
