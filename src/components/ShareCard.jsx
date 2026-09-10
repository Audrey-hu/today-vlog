import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { cardType } from '../data/cardMeta.js'
import { dateStamp } from '../utils/date.js'

export default function ShareCard({ record }) {
  const ref = useRef(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const typeMeta = cardType(record.card.type)
  const weatherEmoji = { clear: '☀️', cloudy: '☁️', rain: '🌧', fog: '🌫', snow: '❄️', night: '🌙', nice: '🌈' }
  const moodEmoji = { tired: '😴', normal: '😐', happy: '🙂', sensitive: '🥹', annoyed: '😤', calm: '😌', excited: '🤩', messy: '🤯', barely: '🫠', observe: '👀' }

  const download = async () => {
    if (!ref.current || saving) return
    setSaving(true)
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'today-vlog-' + record.dateKey + '.png'
      a.click()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.warn('share export failed', err)
    } finally {
      setSaving(false)
    }
  }

  const share = async () => {
    if (!ref.current) return
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], 'today-vlog.png', { type: 'image/png' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '今天拍什么？' })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = 'today-vlog-' + record.dateKey + '.png'
        a.click()
      }
    } catch (err) {
      console.warn('share failed', err)
    }
  }

  return (
    <div>
      <div className="share-wrap">
        <div className="share-card" ref={ref}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.24em', opacity: 0.8 }}>
            <span>TODAY'S VLOG</span>
            <span>{dateStamp(record.dateKey)}</span>
          </div>
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{typeMeta.emoji} {typeMeta.label} · {record.card.title}</div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.35, margin: '14px 0 20px' }}>
            {record.card.title}
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 14, opacity: 0.92 }}>
            <span>完成 {record.doneCount} / {record.totalCount}</span>
            <span>XP +{record.xp}</span>
          </div>
          {record.text && (
            <div style={{ margin: '22px 0', fontSize: 15, fontStyle: 'italic', lineHeight: 1.7, opacity: 0.95, borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: 12 }}>
              “{record.text}”
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 26 }}>
            <div style={{ fontSize: 26, letterSpacing: 2 }}>
              {weatherEmoji[record.weather] || '🌤'} {moodEmoji[record.mood] || '🙂'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>今天拍什么？</div>
              <div style={{ fontSize: 10, opacity: 0.65 }}>WHAT SHOULD I FILM TODAY?</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 12 }}>
        <button className="btn btn-accent" onClick={download} disabled={saving}>
          {saving ? '生成中…' : saved ? '✓ 已保存' : '保存分享卡'}
        </button>
        <button className="btn btn-ghost" onClick={share} disabled={saving}>分享</button>
      </div>
      <p className="small muted" style={{ textAlign: 'center', margin: '8px 0 0' }}>
        适合发朋友圈 / 小红书的截图尺寸
      </p>
    </div>
  )
}
