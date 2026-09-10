import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { CardVisual, CardInfo } from './VlogCard.jsx'

export default function CardDraw({ card, inline }) {
  const { chooseCard, redraw, addFavorite, isFavorite, resetDay, haptic, revealHidden, db } = useApp()
  const [flipped, setFlipped] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const resetTimer = useRef(null)

  useEffect(() => {
    setFlipped(false)
    setShowDetail(false)
    return () => clearTimeout(resetTimer.current)
  }, [card && card.id])

  if (!card || !card.title) {
    return (
      <div className={inline ? 'section' : 'sheet'}>
        {!inline && <div className="sheet-grip" />}
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <div style={{ fontSize: 40 }}>🎴</div>
          <p style={{ margin: '10px 0 14px' }}>这张卡还没准备好，试试「再抽一次」。</p>
          <button className="btn btn-ghost btn-block" onClick={redraw}>再抽一次</button>
        </div>
      </div>
    )
  }
  const fav = isFavorite(card.id)

  const handleFlip = () => {
    if (flipped) return
    setFlipped(true)
    haptic(30)
    resetTimer.current = setTimeout(() => setShowDetail(true), 900)
  }

  return (
    <div className={inline ? 'section' : 'sheet'} style={{ paddingTop: inline ? 0 : 8, display: 'flex', flexDirection: 'column' }}>
      {!inline && <div className="sheet-grip" />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <button className="mini-link" onClick={() => resetDay()}>‹ 先不抽了</button>
        <span style={{ fontWeight: 800, fontSize: 15 }}>{flipped ? '你抽到了' : '点击卡牌翻开'}</span>
        <span />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
        <CardVisual card={card} flipped={flipped} onTap={handleFlip} />
      </div>

      <div style={{ marginTop: 8 }}>
        {showDetail ? (
          <CardInfo
            card={card}
            hiddenOpen={!!(db.today && db.today.hiddenDone && db.today.card && db.today.card.id === card.id)}
            onToggleHidden={revealHidden}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '6px 0 2px' }}>
            {flipped ? '展开中…' : '卡牌会在你点击后翻开'}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-accent btn-lg" onClick={chooseCard} disabled={!showDetail}>
          就拍这个
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn btn-ghost" onClick={redraw} disabled={!showDetail}>🎴 再抽一次</button>
          <button className={'btn ' + (fav ? 'btn-soft' : 'btn-ghost')} onClick={() => addFavorite(card)}>
            {fav ? '❤️ 已收藏' : '♡ 收藏'}
          </button>
        </div>
      </div>
    </div>
  )
}
