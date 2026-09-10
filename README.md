# 《今天拍什么？》 What Should I Film Today?

每天抽一张“生活任务卡”的手机优先网页应用。不用想今天拍什么，选好心情/时间/天气/场景，抽卡、翻卡、开拍、勾镜头、晚上收尾，一天就留下来了。

## 运行

```bash
npm install
npm run dev
```

## 分享给朋友 / 部署到网上

- **最快**：把 `docs` 文件夹（已构建好的网站）里的内容拖到 https://app.netlify.com/drop ，几秒得到一个公开链接。
- **GitHub Pages（推荐长期用）**：详细步骤见 [部署到GitHub.md](./部署到GitHub.md) ，也可以直接双击 `上传到GitHub.command`。
- **单文件版**：`standalone/今天拍什么-单文件版.html` 可以直接发给朋友，双击就能用（不需要服务器）。
- 仓库里的 `docs/` 就是 GitHub Pages 用的构建产物（Pages 请选择 `main` + `/docs`）。

打开终端里显示的地址（默认 http://localhost:5173 ）。手机预览可以：

- 同一 Wi-Fi 下用手机访问 `http://<电脑局域网IP>:5173`
- 或 `npm run build && npm run preview` 后访问预览地址

> 使用 pnpm 的用户：第一次安装后如提示 build scripts 被忽略，执行一次 `pnpm approve-builds` 选择 esbuild 即可（本项目 `.npmrc` 已设置 `strict-dep-builds=false`，不影响开发）。

## 已实现功能

- **首页抽卡**：心情（10 选 1）/ 时间（5 档）/ 天气（自动识别失败可手动）/ 场景（16 项多选）/ 无聊度（3 档）
- **自动天气**：Browser Geolocation + Open-Meteo（免费、无 API Key），失败自动回落到手动，不阻塞抽卡；不保存精确位置
- **加权抽卡算法**：心情/天气/场景/时间/无聊度匹配 + 最近 7 天分类降权 + 30 天同卡不重复 + 收藏加成，同时保留随机感
- **抽卡动画**：卡堆微晃 → 点击 3D 翻卡（0.85s）→ 震动反馈（navigator.vibrate）→ 展开完整详情
- **今日 Vlog 卡**：主题、类型（轻松/观察/导演/寻宝/挑战/疯狂/神秘）、稀有度、难度、预计耗时、规则、必拍镜头、开头/结尾、隐藏任务（+10 XP）、字幕建议
- **镜头清单**：逐镜勾选、进度条、里程碑文案（“开始了。”→“已经有点像一条 Vlog 了。”→“今天已经被留下来了。”）；刷新不丢
- **完成今天**：一句“其实今天……”、收尾心情、XP 结算、保存进日历
- **日历**：月历小点/小星/小火苗（普通 • / 挑战 ★ / 特殊 ◆ / 疯狂 🔥 / 寻宝 🔍 / 导演 🎬），日期详情可回看并可“再拍一次”；很久没回来显示“欢迎回来”
- **生活档案**：按类型/天气/关键词筛选历史记录
- **以后想拍（收藏）**：抽卡时可收藏，随时可再拍
- **挑战页**：80 张挑战卡、50 张疯狂卡（可替换今日主卡或作为附加挑战）、今日 Bingo
- **无脑模式**：跳过所有选择直接拍 5 个镜头
- **疯狂模式**：隐藏入口“我今天想玩点大的”
- **导演模式**：30 位导演人格（游戏导演、监控录像导演、日剧导演……）
- **寻宝卡**：从 120+ 寻宝目标中随机合成 5 个目标
- **随机事件**：拍摄中可掷骰，每天最多 3 次
- **Bingo**：3×3 网格，连线 +10 XP
- **XP 与等级**：Lv.1–Lv.10（刚开始乱拍 → 传奇生活观察员），升级无压力
- **成就**：50 个自动检测解锁
- **分享卡**：保存为 PNG（可发朋友圈/小红书）
- **PWA**：manifest + service worker + 图标，可添加到主屏幕
- **localStorage**：今日卡、进度、历史、XP、收藏、设置全部本地保存；跨天自动进入新状态，未收尾但有镜头的昨日自动归档

## 内容库（真实数据，非 demo）

| 数据 | 数量 |
| --- | --- |
| 普通主题卡 | 150 |
| 天气主题卡 | 50 |
| 挑战卡 | 80 |
| 疯狂卡 | 50 |
| 导演人格 | 30 |
| 寻宝目标 | 128 |
| 随机事件 | 50 |
| 成就 | 50 |

## 项目结构

```text
src/
  pages/           Today / Challenge / Calendar / Profile
  components/      CardDraw / VlogCard / ConditionPanel / ShotChecklist /
                   ActiveTools / FinishSheet / ShareCard / DayDetail / BottomNav …
  data/            themes / weatherThemes / challenges / crazyCards /
                   directors / treasures / randomEvents / achievements
  utils/           random / storage / weather / date / levels /
                   recommendation / achievements
  store.jsx        localStorage 状态与所有操作（抽卡、勾镜、收尾、跨天）
public/            manifest.webmanifest / sw.js / icons
```

## 数据与隐私

- 无后端、无登录、无 AI 接口、无收费 API
- 所有日历/记录/收藏仅存于浏览器 localStorage，不上传照片/视频/位置历史
- 定位仅在抽卡前用于获取当前天气，只保留天气结果

## 手机适配

按 390×844 设计，验证过 375 / 390 / 430 / 桌面端；按钮 44–56px、底部导航含 safe-area、无横向滚动。

## 说明

主题推荐在浏览器本地运行（加权随机），每张卡都是完整可执行的生活观察任务。数据文件按分类拆分，方便后续继续扩充。
