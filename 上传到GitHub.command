#!/bin/zsh
cd "$(dirname "$0")"

BUNDLED_GIT="/Users/aoyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/git"
if [ -x "$BUNDLED_GIT" ]; then
  GIT="$BUNDLED_GIT"
else
  GIT="$(command -v git)"
fi

if [ -z "$GIT" ]; then
  echo "没有找到 git。可以改用「方案 A：只上传网站」的方式（见 部署到GitHub.md）。"
  read -r "?按回车关闭…"
  exit 1
fi

echo "=== 准备上传《今天拍什么？》到 GitHub ==="
echo

if [ ! -d .git ]; then
  "$GIT" init -b main 2>/dev/null || "$GIT" init
fi

"$GIT" add -A
"$GIT" -c user.name="$(whoami)" -c user.email="$(whoami)@local" commit -m "今天拍什么？" 2>/dev/null || echo "（没有新的改动需要提交）"

echo
echo "请先在 https://github.com/new 新建一个空仓库（Public，不要勾 README）"
echo "然后把仓库地址粘贴到这里，例如："
echo "  https://github.com/你的用户名/today-vlog.git"
echo
printf "仓库地址："
read -r REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "没有输入地址，已取消。"
  read -r "?按回车关闭…"
  exit 1
fi

"$GIT" remote remove origin 2>/dev/null
"$GIT" remote add origin "$REPO_URL"

echo
echo "正在上传……如果提示输入用户名/密码，密码请填 Personal Access Token（不是登录密码）。"
echo

if "$GIT" push -u origin main; then
  echo
  echo "✅ 上传完成！"
  echo "接下来：仓库页面 → Settings → Pages → Source 选 Deploy from a branch"
  echo "→ Branch 选 main，文件夹选 /docs → Save，等 1 分钟就有分享链接了。"
else
  echo
  echo "❌ 上传失败。常见原因：仓库地址不对、没有权限、或需要 Personal Access Token。"
  echo "也可以改用「方案 A：只上传网站」的方式（见 部署到GitHub.md）。"
fi

echo
read -r "?按回车关闭…"
