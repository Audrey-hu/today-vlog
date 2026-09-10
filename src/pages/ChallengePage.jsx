import { useApp } from '../store.jsx'
import { BingoBoard } from '../components/ActiveTools.jsx'
import { CHALLENGES, CRAZY_CARDS } from '../data/index.js'
import { dateKey } from '../utils/date.js'
import { TypeBadge } from '../components/Bits.jsx'

export default function ChallengePage() {
  const { db, setTab, draw, addRandomChallenge, toast } = useApp()
  const today = db.today && db.today.dateKey === dateKey() ? db.today : null
  const activeToday = today && (today.step === 'active' || today.step === 'finish' || today.step === 'card')

  const samples = [CHALLENGES[4], CHALLENGES[21], CHALLENGES[70], CRAZY_CARDS[0]]

  const drawChallenge = () => {
    if (activeToday && today.done.length > 0) {
      toast('今天已经有任务卡了，建议用“附加挑战”', '🎴')
      return
    }
    draw('challenge')
    setTab('today')
  }

  const drawCrazy = () => {
    draw('crazy')
    setTab('today')
  }

  const goBingo = () => {
    setTab('today')
    toast('Bingo 在今日任务页也能玩', '🅱️')
  }

  return (
    <div>
      <header style={{ padding: '6px 0 2px' }}>
        <div className="small" style={{ color: 'var(--orange)', fontWeight: 800 }}>挑战区 · CHALLENGE</div>
        <h1 className="h1" style={{ fontSize: 24 }}>给今天加点规则</h1>
        <p className="subtitle">生活太平淡？规则越怪，拍得越有意思。</p>
      </header>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <button className="card" style={{ padding: 14, minHeight: 108, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, textAlign: 'left' }} onClick={drawChallenge}>
          <span style={{ fontSize: 26 }}>🔥</span>
          <span style={{ fontWeight: 800 }}>抽挑战卡</span>
          <span className="small muted">给自己设一条今天的规则</span>
        </button>
        <button className="card" style={{ padding: 14, minHeight: 108, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, textAlign: 'left', borderColor: '#f0cdc4' }} onClick={drawCrazy}>
          <span style={{ fontSize: 26 }}>😈</span>
          <span style={{ fontWeight: 800, color: 'var(--red)' }}>抽疯狂卡</span>
          <span className="small muted">把今天拍成另一种片子</span>
        </button>
      </div>

      {activeToday && (
        <button className="btn btn-soft btn-block" style={{ marginTop: 12 }} onClick={addRandomChallenge}>
          ＋ 把一张挑战卡附加到今天（不替换主卡）
        </button>
      )}

      <div className="section" style={{ marginTop: 16 }}>
        <div className="section-head">
          <span className="section-title">牌堆预览</span>
          <span className="tag">挑战 {CHALLENGES.length} 张 · 疯狂 {CRAZY_CARDS.length} 张</span>
        </div>
        {samples.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line-2)' }}>
            <TypeBadge type={c.type} />
            <div style={{ fontWeight: 700, fontSize: 14 }}>{c.title}</div>
            <span className="small muted" style={{ marginLeft: 'auto' }}>{c.minutes}′</span>
          </div>
        ))}
        <p className="small muted" style={{ margin: '10px 0 0' }}>抽卡时仍会参考今天的心情、时间和场景，不会完全乱来。</p>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="section-head">
          <span className="section-title">🅱️ 今日 Bingo</span>
          <button className="mini-link" onClick={goBingo}>去今日页</button>
        </div>
      </div>
      <BingoBoard />
    </div>
  )
}
