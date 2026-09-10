// 成就：50 个。条件说明：
// {k:'draw',n:1} 累计抽卡 {k:'records'} 完成记录 {k:'xp'} {k:'shots'}
// {k:'singleShots',n:5} 单日完成镜头 {k:'weather',v:'rain',n:5} 按天气
// {k:'cat',v:'sound'} 按主题分类 {k:'scene',v:'commute'} 按场景
// {k:'mood',v:'calm'} 按收尾心情 {k:'time',v:'5'} 按时间档 {k:'type',v:'crazy'} 按卡类型
// {k:'theme',v:'t123'} 完成指定卡 {k:'distinct',n:50} 不同主题数
// {k:'bingo',n:1} 连成线数 {k:'events',n:3} 随机事件 {k:'favorites',n:5} {k:'hidden',n:3} 隐藏任务
export const RAW_ACHIEVEMENTS = [
  { id:'a001', icon:'🎴', t:'第一张卡', de:'第一次抽卡。', c:{ k:'draw', n:1 } },
  { id:'a002', icon:'📸', t:'第一天记录', de:'完成第一次“保存今天”。', c:{ k:'records', n:1 } },
  { id:'a003', icon:'🎞', t:'三连拍', de:'完成 3 次记录。', c:{ k:'records', n:3 } },
  { id:'a004', icon:'📖', t:'生活档案 7 页', de:'完成 7 次记录。', c:{ k:'records', n:7 } },
  { id:'a005', icon:'💯', t:'第一个 100 XP', de:'累计获得 100 XP。', c:{ k:'xp', n:100 } },
  { id:'a006', icon:'🌟', t:'500 XP', de:'累计获得 500 XP。', c:{ k:'xp', n:500 } },
  { id:'a007', icon:'🚀', t:'1000 XP', de:'累计获得 1000 XP。', c:{ k:'xp', n:1000 } },
  { id:'a008', icon:'🧘', t:'平静的日子', de:'以“很平静”收尾 3 次。', c:{ k:'mood', v:'calm', n:3 } },
  { id:'a009', icon:'😤', t:'烦躁成片', de:'在“有点烦”的日子里完成 3 次记录。', c:{ k:'mood', v:'annoyed', n:3 } },
  { id:'a010', icon:'🫠', t:'今天真的很普通', de:'在“极度乏味”模式下完成一次记录。', c:{ k:'bored', n:1 } },
  { id:'a011', icon:'🫥', t:'极度乏味观察员', de:'在“极度乏味”模式下完成 5 次记录。', c:{ k:'bored', n:5 } },
  { id:'a012', icon:'🌧', t:'雨天观察员', de:'完成 5 次雨天主题记录。', c:{ k:'weather', v:'rain', n:5 } },
  { id:'a013', icon:'☀️', t:'晴天收集者', de:'完成 5 次晴天记录。', c:{ k:'weather', v:'clear', n:5 } },
  { id:'a014', icon:'🌙', t:'夜猫镜头', de:'完成 5 次夜晚记录。', c:{ k:'weather', v:'night', n:5 } },
  { id:'a015', icon:'🌫', t:'雾里看花', de:'完成 3 次雾天记录。', c:{ k:'weather', v:'fog', n:3 } },
  { id:'a016', icon:'❄️', t:'雪日记录', de:'完成 2 次雪天记录。', c:{ k:'weather', v:'snow', n:2 } },
  { id:'a017', icon:'🚇', t:'城市观察员', de:'完成 10 次含通勤的记录。', c:{ k:'scene', v:'commute', n:10 } },
  { id:'a018', icon:'🏠', t:'宅家导演', de:'完成 10 次含宅家/在家的记录。', c:{ k:'scene', v:'home', n:10 } },
  { id:'a019', icon:'💼', t:'打工人纪录片', de:'完成 10 次含上班的记录。', c:{ k:'scene', v:'work', n:10 } },
  { id:'a020', icon:'🎶', t:'听见生活', de:'完成 5 次声音主题。', c:{ k:'cat', v:'sound', n:5 } },
  { id:'a021', icon:'🔴', t:'颜色猎人', de:'完成 5 次颜色主题。', c:{ k:'cat', v:'color', n:5 } },
  { id:'a022', icon:'🌆', t:'夜色收藏家', de:'完成 5 次夜景主题。', c:{ k:'cat', v:'night', n:5 } },
  { id:'a023', icon:'😈', t:'疯狂一次', de:'完成一次疯狂卡记录。', c:{ k:'type', v:'crazy', n:1 } },
  { id:'a024', icon:'🔥', t:'挑战者', de:'完成 3 次挑战卡记录。', c:{ k:'type', v:'challenge', n:3 } },
  { id:'a025', icon:'🎬', t:'导演的选择', de:'跟随一位导演人格完成记录。', c:{ k:'type', v:'director', n:1 } },
  { id:'a026', icon:'🔍', t:'寻宝猎人', de:'完成 3 次寻宝卡记录。', c:{ k:'type', v:'treasure', n:3 } },
  { id:'a027', icon:'🎲', t:'随机人生', de:'累计使用 3 次随机事件。', c:{ k:'events', n:3 } },
  { id:'a028', icon:'🎲🎲', t:'骰子大师', de:'累计使用 10 次随机事件。', c:{ k:'events', n:10 } },
  { id:'a029', icon:'🅱️', t:'BINGO！', de:'连成第一条 Bingo 线。', c:{ k:'bingo', n:1 } },
  { id:'a030', icon:'🧩', t:'宾果常客', de:'累计连成 3 条 Bingo 线。', c:{ k:'bingo', n:3 } },
  { id:'a031', icon:'❤️', t:'心动收藏', de:'收藏 5 张卡。', c:{ k:'favorites', n:5 } },
  { id:'a032', icon:'📚', t:'以后想拍清单', de:'收藏 20 张卡。', c:{ k:'favorites', n:20 } },
  { id:'a033', icon:'🤫', t:'没有脸也可以', de:'完成《今天不能拍脸》。', c:{ k:'theme', v:'t123', n:1 } },
  { id:'a034', icon:'✋', t:'手语者', de:'完成《今天只拍手》。', c:{ k:'theme', v:'t122', n:1 } },
  { id:'a035', icon:'🎯', t:'五镜头导演', de:'单日用 5 个镜头完成一条记录。', c:{ k:'singleShots', n:5 } },
  { id:'a036', icon:'🎞️', t:'素材大户', de:'单日勾满 10 个镜头任务。', c:{ k:'singleShots', n:10 } },
  { id:'a037', icon:'🗂', t:'生活档案', de:'完成 30 次记录。', c:{ k:'records', n:30 } },
  { id:'a038', icon:'🌈', t:'什么都能拍', de:'完成 50 个不同主题。', c:{ k:'distinct', n:50 } },
  { id:'a039', icon:'🎨', t:'百变生活', de:'完成 20 个不同主题。', c:{ k:'distinct', n:20 } },
  { id:'a040', icon:'⚡', t:'五分钟导演', de:'在“5分钟”时间档完成 5 次记录。', c:{ k:'time', v:'5', n:5 } },
  { id:'a041', icon:'🕰', t:'随便拍的一天', de:'在“今天随便拍”时间档完成 5 次记录。', c:{ k:'time', v:'all', n:5 } },
  { id:'a042', icon:'💤', t:'躺着也能拍', de:'完成《今天只需要躺着拍》。', c:{ k:'theme', v:'t103', n:1 } },
  { id:'a043', icon:'🥷', t:'隐藏任务专家', de:'揭开并完成 3 次隐藏任务。', c:{ k:'hidden', n:3 } },
  { id:'a044', icon:'🕵️', t:'宝藏猎人', de:'揭开并完成 10 次隐藏任务。', c:{ k:'hidden', n:10 } },
  { id:'a045', icon:'☕', t:'咖啡时刻', de:'完成 5 次含喝咖啡的记录。', c:{ k:'scene', v:'coffee', n:5 } },
  { id:'a046', icon:'🍜', t:'好好吃饭', de:'完成 10 次含吃饭的记录。', c:{ k:'scene', v:'eat', n:10 } },
  { id:'a047', icon:'🚶', t:'散步的人', de:'完成 10 次含散步的记录。', c:{ k:'scene', v:'walk', n:10 } },
  { id:'a048', icon:'👯', t:'和朋友一起', de:'完成 3 次含见朋友的记录。', c:{ k:'scene', v:'friends', n:3 } },
  { id:'a049', icon:'🌱', t:'第一次挑战', de:'完成 1 次挑战卡记录。', c:{ k:'type', v:'challenge', n:1 } },
  { id:'a050', icon:'🏅', t:'生活纪录片导演', de:'完成 60 次记录，把普通日子拍成了纪录片。', c:{ k:'records', n:60 } }
]

export const ACHIEVEMENTS = RAW_ACHIEVEMENTS.map((a) => ({
  id: a.id,
  icon: a.icon,
  title: a.t,
  desc: a.de,
  cond: a.c
}))
