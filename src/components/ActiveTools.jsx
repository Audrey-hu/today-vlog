import { cardChecklist, useApp } from '../store.jsx'
import { Progress } from './Bits.jsx'

export function ShotChecklist({ card, done, onToggle }) {
  const list = cardChecklist(card)
  const count = done.length
  const isOn = (i) => done.includes(i)
  return (
    <div className="section">
      <div className="section-head">
        <span className="section-title">镜头清单</span>
        <span className="mono-num" style={{ fontWeight: 800, fontSize: 16 }}>
          {count} / {list.length}
        </span>
      </div>
      <Progress value={count} max={list.length} />
      <div style={{ marginTop: 10 }}>
        {list.map((s, i) => (
          <button key={i} className={'shot-item' + (isOn(i) ? ' on' : '')} onClick={() => onToggle(i)}>
            <span className="check-box">{isOn(i) ? '✓' : ''}</span>
            <span>
              <span className="shot-title">{s.title}</span>
              {s.tip && <div className="shot-tip">{s.tip}</div>}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function HiddenMissionCard({ card, done }) {
  const { revealHidden, db, toast } = useApp()
  if (!card.hidden) return null
  const revealed = !!db.today?.hiddenDone
  return (
    <div className="section">
      <div className="section-head">
        <span className="section-title">🥷 隐藏任务</span>
        <span className="tag">+10 XP</span>
      </div>
      {revealed ? (
        <div className="hidden-box">{card.hidden}</div>
      ) : (
        <>
          <p className="small muted" style={{ margin: '0 0 8px' }}>每张卡都有一个藏起来的任务，揭开才算数。</p>
          <button
            className="btn btn-soft btn-block"
            onClick={() => {
              revealHidden()
              toast('隐藏任务已揭开', '🥷')
            }}
          >
            ??? 揭晓隐藏任务
          </button>
        </>
      )}
      {revealed && !done && <p className="small muted" style={{ marginTop: 8 }}>完成今天的隐藏任务后，收尾时 +10 XP。</p>}
      {revealed && done && <p className="small" style={{ marginTop: 8, color: 'var(--accent-deep)' }}>完成了！收尾时会带上 +10 XP。</p>}
    </div>
  )
}

export function RandomEventButton() {
  const { db, useRandomEvent } = useApp()
  const used = db.today?.events?.length || 0
  const left = Math.max(0, 3 - used)
  return (
    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={useRandomEvent}>
      🎲 随机事件{left > 0 ? `（剩${left}次）` : '（用完了）'}
    </button>
  )
}

export function BingoBoard({ compact }) {
  const { db, toggleBingo } = useApp()
  const b = db.bingo
  if (!b) return null
  const isOn = (i) => b.done.includes(i)
  return (
    <div className="section">
      <div className="section-head">
        <span className="section-title">🅱️ 今日 Bingo</span>
        <span className="tag">{b.lines ? '已连 ' + b.lines + ' 线' : '拍到一个点亮一格'}</span>
      </div>
      <p className="small muted" style={{ margin: '0 0 2px' }}>连成一线 +10 XP，横竖斜都算。</p>
      <div className="bingo-grid">
        {b.grid.map((cell, i) => (
          <button key={i} className={'bingo-cell' + (isOn(i) ? ' on' : '')} onClick={() => toggleBingo(i)}>
            {isOn(i) ? <span className="tick">✓</span> : <span style={{ fontSize: 20 }}>◻</span>}
            <span>{cell}</span>
          </button>
        ))}
      </div>
      {b.lines >= 1 && (
        <div style={{ marginTop: 10, textAlign: 'center', fontWeight: 800, color: 'var(--accent-deep)' }}>
          BINGO！今天已经足够剪一条了。
        </div>
      )}
    </div>
  )
}
