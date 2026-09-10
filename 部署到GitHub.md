# 把《今天拍什么？》传到 GitHub，生成分享链接

最终你会得到一个这样的网址，直接发给朋友/发朋友圈就能打开：

```
https://你的用户名.github.io/仓库名/
```

---

## 方案 A：只上传网站（最省事，推荐）

不需要装任何软件，全程在网页上完成。

**1. 新建仓库**

1. 打开 https://github.com/new （没账号先免费注册）
2. **Repository name** 填一个英文名，例如 `today-vlog`（不要用中文）
3. 选 **Public**
4. 下面的 Add a README / .gitignore / license **都不要勾**
5. 点 **Create repository**

**2. 上传网站文件**

1. 在新仓库页面点 **uploading an existing file**（或 Add file → Upload files）
2. 在 Finder 里打开这个文件夹：

   ```
   你的项目文件夹 / docs
   ```

3. 选中 `docs` **里面的所有内容**（`index.html`、`assets` 文件夹、`icon-192.png`、`icon-512.png`、`icon-maskable-512.png`、`apple-touch-icon.png`、`manifest.webmanifest`、`sw.js`），全部拖进网页的上传框
   - 注意：拖的是 `docs` **里面的内容**，不是 `docs` 文件夹本身
4. 页面下方点 **Commit changes**

**3. 打开 GitHub Pages**

1. 仓库页面 → **Settings**（设置）
2. 左侧菜单 → **Pages**
3. **Source** 选 `Deploy from a branch`
4. **Branch** 选 `main`，文件夹选 `/(root)`，点 **Save**
5. 等 1～2 分钟，刷新这个页面，顶部会出现：

   ```
   Your site is live at https://你的用户名.github.io/today-vlog/
   ```

6. 这个网址就是分享链接，微信、朋友圈、群里直接发即可

**4. 以后更新版本**

重新进仓库 → Add file → Upload files → 把新版 `docs` 里的内容拖进去覆盖 → Commit。
旧的 `assets/index-xxxx.js` 可以删掉（也可以留着，不影响）。

---

## 方案 B：连源码一起上传（以后想自己改）

如果你希望仓库里也有源代码：

1. 把整个项目文件夹（除了 `node_modules`）上传到仓库
2. 项目里已经准备好了 **`docs` 文件夹**（就是构建好的网站）
3. Settings → Pages → Source: `Deploy from a branch` → Branch: `main` → 文件夹选 **`/docs`** → Save
4. 以后改了源代码，运行 `npm run build`，再把 `dist` 里的内容覆盖到 `docs` 即可

---

## 方案 C：用命令行上传（可选，快一点）

双击项目里的 **上传到GitHub.command**，按提示：

1. 先去 https://github.com/new 建一个**空仓库**（不要勾 README）
2. 复制仓库地址（形如 `https://github.com/你的名字/today-vlog.git`）
3. 运行脚本，粘贴地址回车
4. 上传完成后，去 Settings → Pages → `main` / `docs`

> 第一次推送会要求登录：GitHub 现在不能用密码，需要 Personal Access Token（Settings → Developer settings → Personal access tokens → Generate new token，勾选 `repo`），把 token 当作密码粘贴。

---

## 常见问题

| 现象 | 原因 | 解决 |
| --- | --- | --- |
| 打开显示 404 | 仓库根目录没有 `index.html` | 确认上传的是 `docs` **里面的内容** |
| 白屏 / 只有一片空白 | Pages 选了 `main /(root)`，但根目录是源码 | 改成 `main /docs`，或按方案 A 只传网站内容 |
| 页面能开但没样式 | `assets` 文件夹没传上去 | 重新上传整个 `assets` 文件夹 |
| 刚部署时打不开 | GitHub 还在构建 | 等 1～2 分钟再刷新 |
| 更新后还是旧版 | 浏览器/CDN 缓存 | 强制刷新（电脑 `Cmd+Shift+R`，手机清一下缓存） |
| 国内打开慢 | github.io 在国内不稳定 | 可以在 Cloudflare Pages 绑定自定义域名，或让朋友用梯子 |

---

## 小提示

- 部署好的网址在手机上打开后，可以用 Safari「分享 → 添加到主屏幕」，就会像一个 App 一样出现在桌面（已内置 PWA 支持）。
- 每个人的记录都只存在自己手机/电脑的浏览器里，不会互相看到，也不会上传你的数据。
