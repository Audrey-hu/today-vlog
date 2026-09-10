const PREFIX = 'wssit.'

export const KEYS = {
  profile: PREFIX + 'profile.v1',
  history: PREFIX + 'history.v1',
  today: PREFIX + 'today.v1',
  bingo: PREFIX + 'bingo.v1'
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn('storage read failed, use fallback', key, err)
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn('storage write failed', key, err)
    return false
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.warn('storage remove failed', key, err)
  }
}

export function clearAll() {
  try {
    const all = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) all.push(k)
    }
    all.forEach((k) => localStorage.removeItem(k))
  } catch (err) {
    console.warn('clear failed', err)
  }
}
