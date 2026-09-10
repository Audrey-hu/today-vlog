import { useApp } from '../store.jsx'
import { getCardById } from '../data/index.js'
import { TypeBadge } from './Bits.jsx'
import { formatDateLong, dateKey } from '../utils/date.js'
import { weatherMeta } from '../utils/weather.js'
import { moodMeta, sceneMeta } from '../data/cardMeta.js'

function pseudoCard(record) {
  const card = record.card || {}
  return {
    id: card.id,
    kind: card.kind || 'theme',
    title: card.title || '今日 Vlog',
    type: card.type || 'easy',
    rarity: card.rarity || 'common',
    category: card.category || 'daily',
    difficulty: card.difficulty || 1,
    minutes: card.minutes || 15,
    xp: card.xp || 20,
    moods: [], weather: [], scenes: [], times: [], boredom: [], periods: [],
    desc: '把这一天再拍一次。',
    rules: [], shots: [], opening: '', ending: '', hidden: '', caption: '', tags: []
  }
}

export default function DayDetail({ record, onClose }) {
  const { useCard, setTab, db, toast } = useApp()
  const card = getCardById(record.card.id) || pseudoCard(record)
  const full = getCardById(record.card.id)
  const nowHasToday = db.today && db.today.dateKey === dateKey() && db.today.step !== 'shared'
  const cond = record.conditions || {}
  const wMeta = cond.weather ? weatherMeta(cond.weather === 'nice' ? 'nice' : cond.weather) : null
  const mMeta = moodMeta(record.mood) || moodMeta(cond.mood)
  const scenes = (cond.scenes || []).map((s) => (sceneMeta(s) || {}).label).filter(Boolean)

  const redo = () => {
    if (nowHasToday) {
      toast('今天已经有卡了，明天再来拍它吧', '🎴')
      return
    }
    useCard(card, 'normal')
    onClose && onClose()
    setTab('today')
  }

  return (
    <div className="sheet" style={{ paddingBottom: 'calc(22px + var(--safe-bottom))' }}>
      <div className="sheet-grip" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 17 }}>{formatDateLong(record.dateKey)}</h2>
        <button className="mini-link" onClick={onClose}>关闭</button>
      </div>

      <div className="section" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <TypeBadge type={record.card.type} />
          {full && <span className="tag">{full.minutes} 分钟</span>}
          {record.hiddenDone && <span className="tag">🥷 隐藏 ✓</span>}
          {record.auto && <span className="tag">隔天归档</span>}
        </div>
        <h1 style={{ fontSize: 22, margin: '10px 0 4px' }}>{record.card.title}</h1>
        {full && <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{full.desc}</p>}
      </div>

      <div className="section" style={{ marginTop: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
          <div>
            <div className="small muted">完成</div>
            <div style={{ fontWeight: 800 }}>{record.doneCount} / {record.totalCount}</div>
          </div>
          <div>
            <div className="small muted">XP</div>
            <div style={{ fontWeight: 800, color: 'var(--accent-deep)' }}>+{record.xp}</div>
          </div>
          <div>
            <div className="small muted">类型</div>
            <div style={{ fontWeight: 800 }}>{record.card.type === 'director' ? '导演' : record.card.type === 'easy' ? '轻松' : record.card.type === 'observe' ? '观察' : record.card.type === 'challenge' ? '挑战' : record.card.type === 'crazy' ? '疯狂' : record.card.type === 'treasure' ? '寻宝' : '神秘'}</div>
          </div>
        </div>
      </div>

      {(wMeta || mMeta || scenes.length > 0 || cond.boredom) && (
        <div className="section" style={{ marginTop: 10 }}>
          <div className="small muted" style={{ marginBottom: 6 }}>那天</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {mMeta && <span className="tag">{mMeta.emoji} {mMeta.label}</span>}
            {wMeta && <span className="tag">{cond.weather === 'nice' ? '🌈 天气很好' : wMeta.emoji + ' ' + wMeta.label}</span>}
            {scenes.map((s, i) => <span key={i} className="tag">{s}</span>)}
            {cond.boredom === 'dead' && <span className="tag">极度乏味日</span>}
            {cond.boredom === 'some' && <span className="tag">有点东西</span>}
          </div>
        </div>
      )}

      {full && full.shots && full.shots.length > 0 && (
        <div className="section" style={{ marginTop: 10 }}>
          <div className="section-title" style={{ marginBottom: 6 }}>当天镜头</div>
          {full.shots.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', alignItems: 'center' }}>
              <span style={{ color: i < record.doneCount ? 'var(--accent-deep)' : 'var(--muted)', fontWeight: 800 }}>{i < record.doneCount ? '✓' : '○'}</span>
              <span style={{ fontSize: 14 }}>{s.title}</span>
            </div>
          ))}
        </div>
      )}

      {record.text && (
        <div className="hidden-box" style={{ marginTop: 10 }}>
          “{record.text}”
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={redo}>🎴 我想再拍一次</button>
        <button className="btn btn-soft" style={{ flex: 1 }} onClick={onClose}>知道了</button>
      </div>
    </div>
  )
}
