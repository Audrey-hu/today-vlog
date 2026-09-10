import { useApp } from '../store.jsx'

export default function Toasts() {
  const { toasts } = useApp()
  if (!toasts.length) return null
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.icon && <span style={{ marginRight: 6 }}>{t.icon}</span>}
          {t.msg}
        </div>
      ))}
    </div>
  )
}
