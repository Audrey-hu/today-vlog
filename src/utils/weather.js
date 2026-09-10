export const WEATHER_OPTIONS = [
  { key: 'clear', label: '晴天', emoji: '☀️' },
  { key: 'cloudy', label: '阴天', emoji: '☁️' },
  { key: 'rain', label: '下雨', emoji: '🌧' },
  { key: 'fog', label: '雾', emoji: '🌫' },
  { key: 'snow', label: '下雪', emoji: '❄️' },
  { key: 'night', label: '已经晚上了', emoji: '🌙' },
  { key: 'nice', label: '天气很好', emoji: '🌈' }
]

export const weatherKey = (k) => (k === 'nice' ? 'clear' : k)

export const weatherMeta = (key) =>
  WEATHER_OPTIONS.find((w) => w.key === key) || { key: 'clear', label: '晴天', emoji: '☀️' }

export function weatherMetaOrKey(key) {
  const meta = weatherMeta(key)
  return { ...meta, matchKey: weatherKey(key) }
}

const CODE_DAY = new Set([0, 1])
const CODE_NIGHT = new Set([0, 1])
const CODE_FOG = new Set([45, 48])
const CODE_RAIN = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99])
const CODE_SNOW = new Set([71, 73, 75, 77, 85, 86])

function mapWmo(code, isDay) {
  if (CODE_SNOW.has(code)) return 'snow'
  if (CODE_RAIN.has(code)) return 'rain'
  if (CODE_FOG.has(code)) return 'fog'
  if (code === 3 || code === 2) return 'cloudy'
  if (code === 0 || code === 1) return isDay ? 'clear' : 'night'
  return 'cloudy'
}

function getPosition(timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('no-geo'))
      return
    }
    const timer = setTimeout(() => reject(new Error('geo-timeout')), timeoutMs)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        resolve(pos.coords)
      },
      (err) => {
        clearTimeout(timer)
        reject(err || new Error('geo-denied'))
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 10 * 60 * 1000 }
    )
  })
}

// 免费天气：Open-Meteo，不需要 API Key。
// 只保存天气结果，不保存经纬度历史。
export async function fetchCurrentWeather() {
  let coords
  try {
    coords = await getPosition()
  } catch (err) {
    throw new Error('定位失败或没有授权定位')
  }
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=' +
    coords.latitude.toFixed(3) +
    '&longitude=' +
    coords.longitude.toFixed(3) +
    '&current=temperature_2m,weather_code,is_day&timezone=auto'
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error('weather-api-' + res.status)
    const data = await res.json()
    const cur = data.current || {}
    const code = cur.weather_code ?? 3
    const isDay = cur.is_day !== 0
    const key = mapWmo(code, isDay)
    const temp = Math.round(cur.temperature_2m ?? 0)
    return { key, label: weatherMeta(key).label + (temp !== 0 ? ' · ' + temp + '°' : ''), temp, source: 'auto' }
  } finally {
    clearTimeout(timer)
  }
}
