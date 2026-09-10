import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store.jsx'
import { MOOD_OPTIONS, TIME_OPTIONS, SCENE_OPTIONS, BOREDOM_OPTIONS, moodMeta, timeMeta } from '../data/cardMeta.js'
import { WEATHER_OPTIONS, weatherMeta, fetchCurrentWeather, weatherKey } from '../utils/weather.js'
import { dateKey } from '../utils/date.js'

function Label({ text }) {
  return <div className="pick-label">{text}</div>
}

export function MoodPicker() {
  const { db, updateConditions } = useApp()
  return (
    <div>
      <Label>今天是什么心情？</Label>
      <div className="chip-row">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.key}
            className={'chip' + (db.conditions.mood === m.key ? ' on' : '')}
            onClick={() => updateConditions({ mood: m.key })}
          >
            <span className="emoji">{m.emoji}</span>{m.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TimePicker() {
  const { db, updateConditions } = useApp()
  return (
    <div>
      <Label>今天大概有多少时间拍？</Label>
      <div className="chip-row">
        {TIME_OPTIONS.map((t) => (
          <button
            key={t.key}
            className={'chip' + (String(db.conditions.time) === t.key ? ' on on-blue' : '')}
            onClick={() => updateConditions({ time: t.key })}
          >
            <span className="emoji">{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ScenePicker() {
  const { db, updateConditions } = useApp()
  const selected = db.conditions.scenes || []
  const toggle = (key) => {
    const next = selected.includes(key) ? selected.filter((s) => s !== key) : [...selected, key]
    updateConditions({ scenes: next })
  }
  return (
    <div>
      <Label>今天会做什么？（可多选）</Label>
      <div className="chip-row">
        {SCENE_OPTIONS.map((s) => (
          <button
            key={s.key}
            className={'chip' + (selected.includes(s.key) ? ' on' : '')}
            onClick={() => toggle(s.key)}
          >
            <span className="emoji">{s.emoji}</span>{s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function BoredomPicker() {
  const { db, updateConditions } = useApp()
  return (
    <div>
      <Label>今天有多无聊？</Label>
      <div className="chip-row">
        {BOREDOM_OPTIONS.map((b) => (
          <button
            key={b.key}
            className={'chip' + (db.conditions.boredom === b.key ? ' on' : '')}
            onClick={() => updateConditions({ boredom: b.key })}
          >
            <span className="emoji">{b.emoji}</span>{b.label}
          </button>
        ))}
      </div>
      {db.conditions.boredom === 'dead' && (
        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--accent-deep)' }}>
          很好，越普通越适合做观察题。
        </p>
      )}
    </div>
  )
}

export function WeatherPicker({ compact }) {
  const { db, updateConditions, toast } = useApp()
  const [status, setStatus] = useState('idle')
  const [manualOpen, setManualOpen] = useState(false)
  const [autoHint, setAutoHint] = useState(false)
  const value = db.conditions.weather
  const triedDate = db.conditions.weatherTried
  const meta = value ? weatherMeta(value) : null
  const startedRef = useRef(false)

  const attemptAuto = async (silent) => {
    if (!silent) setStatus('loading')
    try {
      const w = await fetchCurrentWeather()
      updateConditions({ weather: w.key, weatherSource: 'auto', weatherLabel: w.label, weatherTried: dateKey() })
      setStatus('done')
      toast('已自动识别天气：' + w.label, '📍')
    } catch (err) {
      setStatus('fail')
      updateConditions({ weatherTried: dateKey(), weatherSource: null })
      if (!silent) toast(err.message || '天气识别失败，可以手动选', '🌤')
    }
  }

  // 首次进入且开启自动天气时，尝试一次（每天一次）
  useEffect(() => {
    if (
      !value &&
      db.profile.settings.autoWeather !== false &&
      triedDate !== dateKey() &&
      !startedRef.current
    ) {
      startedRef.current = true
      // 只有已经授权过定位才自动识别，避免一打开就弹权限框导致“卡住”的感觉
      const check = async () => {
        try {
          if (!navigator.permissions || !navigator.permissions.query) {
            setAutoHint(true)
            return
          }
          const st = await navigator.permissions.query({ name: 'geolocation' })
          if (st.state === 'granted') {
            attemptAuto(true)
          } else {
            setAutoHint(true)
          }
        } catch (err) {
          setAutoHint(true)
        }
      }
      check()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (k) => {
    updateConditions({ weather: k, weatherSource: 'manual', weatherLabel: weatherMeta(k).label + (k === 'nice' ? '（心情也不错）' : ''), weatherTried: dateKey() })
    setManualOpen(false)
    setStatus('done')
  }

  if (compact && meta) {
    return (
      <button className="chip on" onClick={() => setManualOpen(true)} style={{ cursor: 'pointer' }}>
        <span className="emoji">{meta.emoji}</span>
        {value === 'nice' ? '天气很好' : meta.label}
        {db.conditions.weatherSource === 'auto' ? ' · 自动' : ''}
      </button>
    )
  }

  return (
    <div>
      <Label>今天天气怎么样？（只参与推荐，不卡人）</Label>
      {status === 'loading' && <p style={{ fontSize: 13, color: 'var(--muted)' }}>正在定位并读取天气…</p>}
      {status === 'fail' && !meta && (
        <p style={{ fontSize: 13, color: 'var(--red)' }}>
          自动识别失败（可能是没授权定位或网络问题）。手动选一个吧，不影响抽卡。
        </p>
      )}

      {meta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button className="chip on" onClick={() => setManualOpen((v) => !v)}>
            <span className="emoji">{meta.emoji}</span>
            {value === 'nice' ? '天气很好' : meta.label}
            {db.conditions.weatherLabel && db.conditions.weatherSource === 'auto' ? ' · ' + db.conditions.weatherLabel.replace(/^(晴|阴|下雨|雾|下雪|已经晚上了)/, '') : ''}
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>更改</span>
          </button>
          <button className="mini-link" onClick={() => attemptAuto(false)}>
            {status === 'loading' ? '识别中…' : '重新自动识别'}
          </button>
        </div>
      )}

      {!meta && (
        <>
          {autoHint && !status && (
            <p className="small muted" style={{ margin: '0 0 6px' }}>
              已授权定位时会自动识别；没授权也可以直接选，不影响抽卡。
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <button className="chip" onClick={() => attemptAuto(false)}>
              <span className="emoji">📍</span>
              {status === 'loading' ? '正在定位…' : '自动识别我的天气'}
            </button>
            <button className="chip" onClick={() => setManualOpen(true)}>
              <span className="emoji">☝️</span>手动选择
            </button>
          </div>
        </>
      )}

      {manualOpen && (
        <div className="chip-row" style={{ marginTop: 4 }}>
          {WEATHER_OPTIONS.map((w) => (
            <button
              key={w.key}
              className={'chip' + (value === w.key ? ' on' : '')}
              onClick={() => pick(w.key)}
            >
              <span className="emoji">{w.emoji}</span>{w.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function currentCondSummary(cond) {
  const parts = []
  const mood = moodMeta(cond.mood)
  const time = timeMeta(cond.time)
  if (mood) parts.push(mood.emoji + ' ' + mood.label)
  if (time) parts.push(time.emoji + ' ' + time.label)
  if (cond.weather) {
    const m = weatherMeta(weatherKey(cond.weather))
    parts.push((cond.weather === 'nice' ? '🌈' : m.emoji) + ' ' + (cond.weather === 'nice' ? '天气很好' : m.label))
  }
  if (cond.scenes && cond.scenes.length) parts.push(cond.scenes.map((s) => (SCENE_OPTIONS.find((x) => x.key === s) || {}).label).join('、'))
  return parts.join(' · ')
}
