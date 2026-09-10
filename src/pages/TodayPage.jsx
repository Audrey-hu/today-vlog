import { useApp, cardChecklist } from '../store.jsx'
import { dateKey, formatDateLong, greeting, currentPeriod } from '../utils/date.js'
import { MoodPicker, TimePicker, ScenePicker, BoredomPicker, WeatherPicker, currentCondSummary } from '../components/ConditionPanel.jsx'
import CardDraw from '../components/CardDraw.jsx'
import { ShotChecklist, HiddenMissionCard, RandomEventButton, BingoBoard } from '../components/ActiveTools.jsx'
import FinishSheet from '../components/FinishSheet.jsx'
import ShareCard from '../components/ShareCard.jsx'
import { TypeBadge } from '../components/Bits.jsx'
import { makeNoBrainCard } from '../data/index.js'
import { useState } from 'react'

const HERO_COPY = [
  '今天也许没有剧情，但可以有镜头。',
  '普通的一天，也可以抽到隐藏任务。',
  '今天发生什么不重要，先抽张卡。',
  '生活没有脚本，那就抽一个。',
  '上班已经够难了，拍摄简单一点。',
  '今天没剧情？那就拍细节。',
  '不用等一个特别的日子，今天就行。',
  '拍三个就行，真的。',
  '如果生活是重复的，换个角度就是新的。',
  '今天只负责记录，不负责精彩。'
]

function copyOfTheDay() {
  const now = new Date()
  const dayNum = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  return HERO_COPY[dayNum % HERO_COPY.length]
}

function isTodayActive(today) {
  return today && today.dateKey === dateKey()
}

export default function TodayPage() {
  const app = useApp()
  const { db } = app
  const today = isTodayActive(db.today) ? db.today : null
  return (
    <div className="page">
      {!today && <Landing />}
      {today && today.step === 'active' && <ActiveDay />}
      {today && today.step === 'shared' && <SharedDay />}
      {today && today.step === 'card' && (
        <CardDraw card={today.card} inline />
      )}
      {today && today.step === 'finish' && (
        <>
          <div className="overlay" />
          <FinishSheet card={today.card} />
        </>
      )}
    </div>
  )
}

function Landing() {
  const { db, draw, haptic, useCard } = useApp()
  const cond = db.conditions
  const [madOpen, setMadOpen] = useState(false)

  const drawNoBrain = () => {
    const card = makeNoBrainCard()
    useCard(card, 'nobrain')
  }

  return (
    <div>
      <header style={{ padding: '8px 0 4px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-deep)' }}>{greeting()} · {currentPeriodLabel()}</div>
        <h1 className="h1">今天拍什么？</h1>
        <p className="subtitle">抽一张今天的生活任务。 <span style={{ color: 'var(--muted)' }}>What Should I Film Today?</span></p>
        <div style={{ marginTop: 10 }}>
          <div className="hero-date">{formatDateLong(dateKey())}</div>
          <div className="hero-copy">{copyOfTheDay()}</div>
        </div>
      </header>

      <div className="section" style={{ marginTop: 16 }}>
        <div className="section-head">
          <span className="section-title">今天的状态</span>
          {condSummary() && <span className="small muted" style={{ maxWidth: '55%', textAlign: 'right' }}>{condSummary()}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MoodPicker />
          <TimePicker />
          <WeatherPicker />
        </div>
        <div style={{ marginTop: 16 }}>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--ink-2)', padding: '2px 0 8px' }}>今天会做什么 / 有多无聊（选填）</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <ScenePicker />
              <BoredomPicker />
            </div>
          </details>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <button
          className="big-draw-btn"
          onClick={() => {
            haptic(16)
            draw('normal')
          }}
        >
          <span style={{ fontSize: 30 }}>🎴</span>
          抽取今日 Vlog
          <span className="small-copy">不用想，抽完直接拍</span>
        </button>
      </div>

      <div className="grid-2" style={{ marginTop: 12 }}>
        <button className="btn btn-soft" onClick={drawNoBrain}>🙈 我真的不知道拍什么</button>
        <button className="btn btn-ghost" onClick={() => setMadOpen((v) => !v)}>😈 今天想玩点大的</button>
      </div>
      {madOpen && (
        <div className="section" style={{ marginTop: 8, background: '#fdeee9', borderColor: '#f3d4c6' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13.5, fontWeight: 700, color: '#a53f2a' }}>疯狂模式 · 只抽不解释</p>
          <button className="btn btn-block" style={{ background: '#cf4f4f', color: '#fff', fontWeight: 800 }} onClick={() => draw('crazy')}>
            抽一张疯狂卡
          </button>
          <p className="small" style={{ margin: '8px 0 0', color: 'var(--red)' }}>今天的规则会完全不一样。</p>
        </div>
      )}

      <div className="fade-line" />
      <p className="small muted" style={{ textAlign: 'center', margin: '0 8px 12px' }}>
        📍 定位只用来识别天气，不保存位置 · 你的记录只存在这台设备
      </p>
    </div>
  )

  function condSummary() {
    if (!cond) return ''
    return currentCondSummary(cond)
  }
}

function currentPeriodLabel() {
  const map = { morning: '早晨', noon: '中午', afternoon: '下午', night: '晚上', lateNight: '深夜' }
  return map[currentPeriod()] || ''
}

function ActiveDay() {
  const { db, toggleShot, goFinish, resetDay, setTab, useRandomEvent, addExtraChallenge } = useApp()
  const today = db.today
  const card = today.card
  const list = cardChecklist(card)
  const done = today.done || []
  const allDone = done.length >= list.length

  return (
    <div>
      <header style={{ padding: '6px 0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
          <span className="small muted">今日 Vlog · {formatDateLong(today.dateKey)}</span>
          <button className="mini-link" onClick={() => { if (confirm('放弃今天，重新抽？')) resetDay() }}>重抽</button>
        </div>
        <h1 className="h2" style={{ marginTop: 6, fontSize: 22 }}>{card.title}</h1>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <TypeBadge type={card.type} />
          <span className="small muted">{card.minutes} 分钟 · 难度{'★'.repeat(Math.max(1, card.difficulty || 1))}</span>
        </div>
      </header>

      {today.extra && (
        <div className="section" style={{ background: '#fff3e8', borderColor: '#f0d6b8', marginTop: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>🔥 附加挑战：{today.extra.title}</div>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-2)' }}>{(today.extra.rules || []).join(' · ')}</p>
        </div>
      )}

      <ShotChecklist card={card} done={done} onToggle={toggleShot} />
      <HiddenMissionCard card={card} done={done.length >= list.length} />

      <div className="section">
        <div style={{ display: 'flex', gap: 10 }}>
          <RandomEventButton />
        </div>
        {done.length < list.length && (
          <p className="small muted" style={{ margin: '10px 0 0' }}>拍不完也没关系，完成今天的节奏比完成清单重要。</p>
        )}
        {allDone && (
          <p className="small" style={{ margin: '10px 0 0', color: 'var(--accent-deep)', fontWeight: 700 }}>
            你已经拍了 {list.length} 个镜头，可以收工了。
          </p>
        )}
      </div>

      <BingoBoard />

      <button className="btn btn-accent btn-lg" style={{ marginTop: 16 }} onClick={goFinish}>
        完成今天
      </button>
      <p className="small muted" style={{ textAlign: 'center', margin: '10px 0 0' }}>
        进度会自动保存，刷新页面也不会丢。
      </p>
    </div>
  )
}

function SharedDay() {
  const { db, setTab, toast } = useApp()
  const today = db.today
  const record = today.record
  return (
    <div>
      <header style={{ textAlign: 'center', padding: '10px 0 12px' }}>
        <div style={{ fontSize: 34 }}>🎉</div>
        <h1 className="h1" style={{ fontSize: 24 }}>今天已经被留下来了</h1>
        <p className="subtitle">去日历看看，明天会有新的卡。</p>
      </header>
      {record && <ShareCard record={record} />}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setTab('calendar')}>📅 打开日历</button>
        <button className="btn btn-soft" style={{ flex: 1 }} onClick={() => toast('明天会给你一张新卡', '🎴')}>明天再来</button>
      </div>
      {today.text && (
        <p className="small muted" style={{ textAlign: 'center', marginTop: 12 }}>“{today.text}”</p>
      )}
    </div>
  )
}
