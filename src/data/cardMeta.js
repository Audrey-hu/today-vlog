export const CARD_TYPES = {
  easy: { label: '轻松卡', emoji: '🌱', color: '#3e9b6e' },
  observe: { label: '观察卡', emoji: '👀', color: '#3f7fd0' },
  director: { label: '导演卡', emoji: '🎬', color: '#c98a1f' },
  treasure: { label: '寻宝卡', emoji: '🔍', color: '#8a63c9' },
  challenge: { label: '挑战卡', emoji: '🔥', color: '#dd6d36' },
  crazy: { label: '疯狂卡', emoji: '😈', color: '#cf4f4f' },
  mystery: { label: '神秘卡', emoji: '???', color: '#3d4352' }
}

export const RARITY = {
  common: { label: '普通', star: '◆' },
  rare: { label: '稀有', star: '★' },
  special: { label: '特殊', star: '◆★' },
  weird: { label: '奇怪', star: '★?' }
}

export const cardType = (t) => CARD_TYPES[t] || CARD_TYPES.easy
export const rarity = (r) => RARITY[r] || RARITY.common

export const MOOD_OPTIONS = [
  { key: 'tired', label: '没什么精神', emoji: '😴' },
  { key: 'normal', label: '普普通通', emoji: '😐' },
  { key: 'happy', label: '心情不错', emoji: '🙂' },
  { key: 'sensitive', label: '有点敏感', emoji: '🥹' },
  { key: 'annoyed', label: '有点烦', emoji: '😤' },
  { key: 'calm', label: '很平静', emoji: '😌' },
  { key: 'excited', label: '今天很开心', emoji: '🤩' },
  { key: 'messy', label: '脑子很乱', emoji: '🤯' },
  { key: 'barely', label: '今天只想活着', emoji: '🫠' },
  { key: 'observe', label: '想观察一下生活', emoji: '👀' }
]

export const TIME_OPTIONS = [
  { key: '5', label: '5分钟', emoji: '⚡' },
  { key: '15', label: '15分钟', emoji: '☕' },
  { key: '30', label: '30分钟', emoji: '🌤' },
  { key: '60', label: '1小时左右', emoji: '🎬' },
  { key: 'all', label: '今天随便拍', emoji: '🕰' }
]

export const SCENE_OPTIONS = [
  { key: 'work', label: '上班', emoji: '💼' },
  { key: 'commute', label: '通勤', emoji: '🚇' },
  { key: 'home', label: '在家', emoji: '🏠' },
  { key: 'study', label: '学习', emoji: '📚' },
  { key: 'gym', label: '健身', emoji: '🏋️' },
  { key: 'cook', label: '做饭', emoji: '🍳' },
  { key: 'coffee', label: '喝咖啡', emoji: '☕' },
  { key: 'walk', label: '散步', emoji: '🚶' },
  { key: 'shop', label: '逛街', emoji: '🛍' },
  { key: 'friends', label: '见朋友', emoji: '👯' },
  { key: 'eat', label: '出去吃饭', emoji: '🍜' },
  { key: 'stay', label: '宅家', emoji: '🛋' },
  { key: 'play', label: '娱乐', emoji: '🎮' },
  { key: 'travel', label: '出门旅行', emoji: '✈️' },
  { key: 'alone', label: '一个人', emoji: '🙋' },
  { key: 'unsure', label: '不确定', emoji: '🤷' }
]

export const BOREDOM_OPTIONS = [
  { key: 'some', label: '好像有点东西', emoji: '🙂' },
  { key: 'normal', label: '很普通', emoji: '😐' },
  { key: 'dead', label: '极度乏味', emoji: '🫠' }
]

export const moodMeta = (k) => MOOD_OPTIONS.find((m) => m.key === k)
export const sceneMeta = (k) => SCENE_OPTIONS.find((m) => m.key === k)
export const timeMeta = (k) => TIME_OPTIONS.find((m) => m.key === String(k))
