import { useState } from 'react'
import { useApp, cardChecklist } from '../store.jsx'
import { TypeBadge } from './Bits.jsx'
import { MOOD_OPTIONS } from '../data/cardMeta.js'

export default function FinishSheet({ card }) {
  const { db, saveDay, setTab } = useApp()
  const [text, setText] = useState('')
  const [mood, setMood] = useState(db.today?.conditions?.mood || 'normal')
  const list = cardChecklist(card)
  const doneCount = db.today?.done?.length || 0
  const hidden = db.today?.hiddenDone
  const extra = db.today?.extra
  let xp = card.xp || 20
  if (hidden) xp += 10
  if (extra && extra.xp) xp += Math.min(15, Math.round(extra.xp / 3))

  return (
    <div className="sheet">
      <div className="sheet-grip" />
      <h2 className="h2" style={{ textAlign: 'center' }}>今日收尾</h2>

      <div className="section" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TypeBadge type={card.type} />
          <div>
            <div style={{ fontWeight: 800 }}>{card.title}</div>
            <div className="small muted">今天拍了 {doneCount} / {list.length} 个镜头</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 14, alignItems: 'center' }}>
          <span className="tag">挑战 {doneCount >= list.length ? '完成' : '进行中'}</span>
          {hidden && <span className="tag">隐藏任务 ✓</span>}
          {db.today?.bingoLines ? <span className="tag">Bingo {db.today.bingoLines} 线</span> : null}
          <span style={{ fontWeight: 800, color: 'var(--accent-deep)', marginLeft: 'auto' }}>+{xp} XP</span>
        </div>
      </div>

      <div className="section" style={{ marginTop: 10 }}>
        <div className="pick-label">今天有什么想留下的一句话？</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 80))}
          placeholder="其实今天…… 例：下班的时候风特别舒服。"
          rows={3}
          style={{
            width: '100%', border: '1.5px solid var(--line)', borderRadius: 14,
            padding: '11px 12px', resize: 'none', background: '#fffdf8', lineHeight: 1.6
          }}
        />
        <div className="small muted" style={{ textAlign: 'right', marginTop: 3 }}>{text.length}/80</div>
      </div>

      <div className="section" style={{ marginTop: 10 }}>
        <div className="pick-label">今天的心情是？（会写进日历）</div>
        <div className="chip-row">
          {MOOD_OPTIONS.map((m) => (
            <button key={m.key} className={'chip' + (mood === m.key ? ' on' : '')} onClick={() => setMood(m.key)}>
              <span className="emoji">{m.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-accent btn-lg"
        style={{ marginTop: 16 }}
        onClick={() => {
          saveDay({ text: text.trim(), mood })
          setTab('today')
        }}
      >
        保存今天
      </button>
      <p className="small muted" style={{ textAlign: 'center', margin: '10px 0 0' }}>
        保存后今天会出现在日历里，也攒下 {xp} XP。
      </p>
    </div>
  )
}
