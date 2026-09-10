import { cardType, rarity } from '../data/cardMeta.js'

export function TypeBadge({ type, small }) {
  const meta = cardType(type)
  return (
    <span
      className={'type-badge type-' + type + (small ? '' : '')}
      style={{ fontSize: small ? 11 : 12 }}
    >
      <span>{meta.emoji}</span>
      {meta.label}
    </span>
  )
}

export function RarityTag({ rarityKey }) {
  const meta = rarity(rarityKey)
  return (
    <span className="rarity-tag">
      {meta.star} {meta.label}
    </span>
  )
}

export function Stars({ difficulty }) {
  const n = Math.max(1, Math.min(5, Number(difficulty) || 1))
  return (
    <span className="difficulty-stars">
      {'★'.repeat(n)}
      <span className="off">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export function DifficultyLabel({ difficulty }) {
  const map = ['', '几乎零门槛', '轻松', '有点挑战', '认真点', '硬核']
  return map[difficulty] || ''
}

export function Progress({ value, max }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: pct + '%' }} />
    </div>
  )
}
