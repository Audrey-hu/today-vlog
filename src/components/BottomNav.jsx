import { useApp } from '../store.jsx'

const ITEMS = [
  { key: 'today', label: '今天', ico: '🎴' },
  { key: 'challenge', label: '挑战', ico: '🔥' },
  { key: 'calendar', label: '日历', ico: '📅' },
  { key: 'profile', label: '我的', ico: '👤' }
]

export default function BottomNav() {
  const { tab, setTab } = useApp()
  return (
    <nav className="bottom-nav">
      {ITEMS.map((it) => (
        <button
          key={it.key}
          className={'nav-item' + (tab === it.key ? ' on' : '')}
          onClick={() => setTab(it.key)}
        >
          <span className="nav-ico">{it.ico}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
