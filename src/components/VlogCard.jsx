import { TypeBadge, RarityTag, Stars, DifficultyLabel } from './Bits.jsx'

export function CardVisual({ card, flipped, onTap }) {
  const rule = (card.rules && card.rules[0]) || card.desc || '今天按这张卡拍。'
  return (
    <div className="flip-scene" onClick={onTap} style={{ cursor: 'pointer' }}>
      <div className="flip-inner">
        <div className={'card-face face-back' + (flipped ? ' face-hidden' : '')}>
          <div className="back-brand">TODAY'S</div>
          <div className="back-title">VLOG</div>
          <div className="back-sub">生活任务卡</div>
        </div>
        <div className={'card-face face-front' + (flipped ? ' face-shown' : '')}>
          <div className="face-top">
            <span className="brand">TODAY'S VLOG</span>
            <RarityTag rarityKey={card.rarity} />
          </div>
          <div className="face-body">
            <div className="face-type">
              <TypeBadge type={card.type} />
            </div>
            <div className="face-title">{card.title}</div>
            <div className="face-rule">“{rule}”</div>
            <div className="face-meta">
              <span>{card.minutes} 分钟</span>
              <span>难度 <Stars difficulty={card.difficulty} /></span>
            </div>
          </div>
          <div className="face-foot">
            <span className="foot-label">DRAW FOR TODAY</span>
            <span style={{ fontSize: 18 }}>{cardTypeEmoji(card.type)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function cardTypeEmoji(type) {
  const map = { easy: '🌱', observe: '👀', director: '🎬', treasure: '🔍', challenge: '🔥', crazy: '😈', mystery: '???', }
  return map[type] || '🌱'
}

export function CardInfo({ card, hiddenOpen, onToggleHidden }) {
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <TypeBadge type={card.type} />
        <RarityTag rarityKey={card.rarity} />
        <span className="tag">{card.category ? categoryName(card.category) : ''}</span>
      </div>

      <p style={{ margin: '12px 0 0', color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.7 }}>{card.desc}</p>

      <div className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>类型</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{card.type === 'director' ? '导演人格' : cardTypeName(card.type)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>难度</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}><Stars difficulty={card.difficulty} /></div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>预计耗时</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{card.minutes} 分钟</div>
        </div>
      </div>

      {card.rules && card.rules.length > 0 && (
        <>
          <h4 style={{ margin: '16px 0 6px' }}>今天的规则</h4>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.8 }}>
            {card.rules.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </>
      )}

      {card.opening && (
        <p className="hidden-box" style={{ marginTop: 14 }}>
          <b>开头镜头：</b>{card.opening}
        </p>
      )}

      {card.shots && card.shots.length > 0 && (
        <>
          <h4 style={{ margin: '16px 0 4px' }}>必拍镜头 {card.shots.length} 个</h4>
          {card.shots.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line-2)', alignItems: 'flex-start' }}>
              <span className="mono-num" style={{ color: 'var(--muted)', fontWeight: 800, minWidth: 22, paddingTop: 1 }}>{i + 1}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
                {s.tip && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 1 }}>{s.tip}</div>}
              </div>
            </div>
          ))}
        </>
      )}

      {(card.opening || card.ending) && (
        <div className="grid-2" style={{ marginTop: 14 }}>
          {card.opening && (
            <div className="hidden-box" style={{ margin: 0 }}>
              <b style={{ fontSize: 12 }}>🎬 开头</b>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{card.opening}</div>
            </div>
          )}
          {card.ending && (
            <div className="hidden-box" style={{ margin: 0 }}>
              <b style={{ fontSize: 12 }}>🌙 结尾</b>
              <div style={{ fontSize: 13.5, marginTop: 2 }}>{card.ending}</div>
            </div>
          )}
        </div>
      )}

      {card.hidden && (
        <div style={{ marginTop: 14 }}>
          {hiddenOpen ? (
            <div className="hidden-box">
              <b>🥷 隐藏任务：</b>{card.hidden}
              <div style={{ color: 'var(--accent-deep)', fontWeight: 700, marginTop: 4 }}>+10 XP</div>
            </div>
          ) : (
            <button className="btn btn-soft btn-block" onClick={onToggleHidden}>??? 显示隐藏任务</button>
          )}
        </div>
      )}

      {card.caption && (
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--muted)', margin: '16px 4px 2px', fontSize: 13.5 }}>
          “{card.caption}”
        </p>
      )}
    </div>
  )
}

export function cardTypeName(type) {
  const map = { easy: '轻松卡', observe: '观察卡', director: '导演卡', treasure: '寻宝卡', challenge: '挑战卡', crazy: '疯狂卡', mystery: '神秘卡' }
  return map[type] || '任务卡'
}

export function categoryName(cat) {
  const map = {
    sound: '声音', light: '光', color: '颜色', shadow: '影子', object: '物件', micro: '微小任务',
    home: '宅家', office: '上班', commute: '通勤', street: '街道', city: '城市', people: '人',
    food: '吃饭', mood: '心情', night: '夜晚', sky: '天空', animal: '小动物', shop: '逛街',
    rain: '雨天', fog: '雾', snow: '雪', weather: '天气', game: '游戏', story: '故事', challenge: '挑战',
    mystery: '神秘', treasure: '寻宝', director: '导演', waiting: '等待', daily: '日常', art: '影像'
  }
  return map[cat] || cat || ''
}
