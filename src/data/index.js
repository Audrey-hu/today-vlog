import { normalizeCard } from './helpers.js'
import { RAW_THEMES } from './themes.js'
import { RAW_WEATHER_THEMES } from './weatherThemes.js'
import { RAW_CHALLENGES } from './challenges.js'
import { RAW_CRAZY_CARDS } from './crazyCards.js'
import { RAW_DIRECTORS } from './directors.js'
import { TREASURE_TARGETS, BINGO_POOL } from './treasures.js'
import { RANDOM_EVENTS } from './randomEvents.js'
import { ACHIEVEMENTS } from './achievements.js'
import { pickN } from '../utils/random.js'

export const THEMES = RAW_THEMES.map((r) => normalizeCard(r, 'theme'))
export const WEATHER_THEMES = RAW_WEATHER_THEMES.map((r) => normalizeCard(r, 'weather'))
export const CHALLENGES = RAW_CHALLENGES.map((r) => normalizeCard(r, 'challenge'))
export const CRAZY_CARDS = RAW_CRAZY_CARDS.map((r) => normalizeCard(r, 'crazy'))
export const DIRECTORS = RAW_DIRECTORS.map((r) => normalizeCard(r, 'director'))

// 普通抽卡牌池：主题 + 天气主题 + 导演人格
// （挑战卡走「挑战」入口，疯狂卡走「疯狂」入口，寻宝卡现场合成）
export const NORMAL_POOL = [...THEMES, ...WEATHER_THEMES, ...DIRECTORS]

export const ALL_CARDS = [...NORMAL_POOL, ...CHALLENGES, ...CRAZY_CARDS]
export const CARDS_BY_ID = new Map(ALL_CARDS.map((c) => [c.id, c]))

export function getCardById(id) {
  return CARDS_BY_ID.get(id) || null
}

// 寻宝卡：从 120 个目标里抽 5 个合成一张今天的寻宝卡
export function makeTreasureCard(seed = []) {
  const targets = seed.length ? seed : pickN(TREASURE_TARGETS, 5)
  const hiddenTarget = targets.length > 3 ? targets[3] : TREASURE_TARGETS[0]
  return {
    id: 'treasure_draw',
    kind: 'treasure',
    title: '今日生活寻宝',
    type: 'treasure',
    rarity: 'rare',
    category: 'treasure',
    difficulty: 2,
    minutes: 30,
    xp: 30,
    moods: [],
    weather: ['all'],
    scenes: ['all'],
    times: ['15', '30', '60'],
    boredom: ['some', 'normal'],
    periods: [],
    desc: '今天不找意义，只找 5 样东西。拍到一样，点掉一格。',
    rules: ['找到并拍到清单里的 5 样东西', '顺序随意，一天内完成'],
    shots: targets.map((t, i) => ({
      title: (i + 1) + '. ' + t.text,
      tip: i === 0 ? '先找到最容易的，建立信心' : i === 4 ? '最后一样可以慢慢找' : '拍清楚它为什么算数'
    })),
    opening: '第 1 样找到的东西',
    ending: '第 5 样找到后，拍一张“收获合影”',
    hidden: hiddenTarget.text + '——找到了记得告诉我（拍个特写）',
    caption: '今天找到了 5 样东西，也找到了 5 次抬头。',
    tags: ['treasure', 'game']
  }
}

// 无脑模式：跳过所有选项，直接给一份拍完即收工的清单
export function makeNoBrainCard() {
  return {
    id: 'nobrain',
    kind: 'theme',
    title: '今天只拍5个镜头',
    type: 'easy',
    rarity: 'common',
    category: 'micro',
    difficulty: 1,
    minutes: 5,
    xp: 15,
    moods: ['all'],
    weather: ['all'],
    scenes: ['all'],
    times: ['5', '15'],
    boredom: ['all'],
    periods: [],
    desc: '不用想。按下面的清单拍，拍完就算今天留下来了。',
    rules: ['每段不超过 10 秒', '顺序可以乱'],
    shots: [
      { title: '你的鞋', tip: '拍它今天走过的路' },
      { title: '电梯', tip: '楼层数字或门' },
      { title: '午饭', tip: '吃的第一口' },
      { title: '下班/放学时的天空', tip: '抬头拍 3 秒' },
      { title: '睡前房间', tip: '今天的最后一幕' }
    ],
    opening: '起床后的第一眼',
    ending: '睡前关灯',
    hidden: '拍一段今天最没意义的 10 秒',
    caption: '不用解释，拍完就算今天留下来了。',
    tags: ['micro', 'easy']
  }
}

export { TREASURE_TARGETS, BINGO_POOL, RANDOM_EVENTS, ACHIEVEMENTS }

export const CARD_POOLS = {
  normal: NORMAL_POOL,
  challenge: CHALLENGES,
  crazy: CRAZY_CARDS,
  director: DIRECTORS
}
