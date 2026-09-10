#!/bin/zsh
# 一条命令完成：构建 → 提交 → 推送到 GitHub → 开启/更新 GitHub Pages
#
# 用法：
#   zsh scripts/publish-github.sh 用户名/仓库名
# 凭证（二选一，二选一即可，推荐第一种）：
#   1) 把 Personal Access Token 存到 ~/.config/today-vlog/github-token（内容只放 token 一行）
#   2) 设置环境变量 GITHUB_TOKEN
# 可选：把仓库名存到 ~/.config/today-vlog/repo，以后就不用每次传参数

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TOKEN_FILE="${GITHUB_TOKEN_FILE:-$HOME/.config/today-vlog/github-token}"
REPO_FILE="$HOME/.config/today-vlog/repo"
# 备用位置：项目外层的 .secrets 文件夹（方便用文本编辑器粘贴，不用进终端）
ALT_TOKEN_FILE="$PROJECT_DIR/../.secrets/github-token.txt"
ALT_REPO_FILE="$PROJECT_DIR/../.secrets/repo.txt"

REPO="${1:-}"
if [ -z "$REPO" ] && [ -f "$REPO_FILE" ]; then REPO="$(tr -d ' \n\r' < "$REPO_FILE")"; fi
if [ -z "$REPO" ] && [ -f "$ALT_REPO_FILE" ]; then REPO="$(tr -d ' \n\r' < "$ALT_REPO_FILE")"; fi
if [ -z "$REPO" ]; then
  echo "缺少仓库名。用法：zsh scripts/publish-github.sh 用户名/仓库名"
  exit 1
fi

TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f "$TOKEN_FILE" ]; then TOKEN="$(tr -d ' \n\r' < "$TOKEN_FILE")"; fi
if [ -z "$TOKEN" ] && [ -f "$ALT_TOKEN_FILE" ]; then TOKEN="$(tr -d ' \n\r' < "$ALT_TOKEN_FILE")"; fi
if [ -z "$TOKEN" ]; then
  echo "缺少访问凭证。请把 GitHub Personal Access Token 保存到："
  echo "  $TOKEN_FILE"
  echo "或：$ALT_TOKEN_FILE"
  exit 1
fi

case "$TOKEN" in
  ghp_*|github_pat_*|gho_*|ghs_*|ghu_*) ;;
  *) echo "读到的内容不像 GitHub Token（应以 ghp_ 或 github_pat_ 开头），请检查文件内容"; exit 1 ;;
esac

OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
API="https://api.github.com"

echo "==> 仓库：$REPO"

# 0. 找到可用的 node
BUNDLED_NODE="/Users/aoyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ -x "$BUNDLED_NODE" ]; then NODE="$BUNDLED_NODE"; else NODE="$(command -v node)"; fi
if [ -z "$NODE" ]; then echo "找不到 node，无法构建"; exit 1; fi

# 1. 确保仓库存在（不存在就创建）
CODE=$(curl -s -o /private/tmp/gh-repo.json -w '%{http_code}' \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "$API/repos/$REPO")
if [ "$CODE" = "404" ]; then
  echo "==> 仓库不存在，正在创建…"
  CREATE_CODE=$(curl -s -o /private/tmp/gh-create.json -w '%{http_code}' -X POST \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
    "$API/user/repos" \
    -d "{\"name\":\"$NAME\",\"private\":false,\"auto_init\":false,\"description\":\"今天拍什么？每天抽一张生活 Vlog 任务卡\"}")
  if [ "$CREATE_CODE" != "201" ]; then
    echo "创建仓库失败（HTTP $CREATE_CODE）："
    cat /private/tmp/gh-create.json
    exit 1
  fi
  echo "==> 仓库已创建"
fi

# 2. 构建最新网站到 docs/
echo "==> 构建网站…"
cd "$PROJECT_DIR"
"$NODE" node_modules/vite/bin/vite.js build >/dev/null
rm -rf "$PROJECT_DIR/docs"
mkdir -p "$PROJECT_DIR/docs"
cd "$PROJECT_DIR/dist"
for f in *; do
  case "$f" in
    probe.html|standalone.html) ;;
    *) cp -R "$f" "$PROJECT_DIR/docs/" ;;
  esac
done

# 3. 提交
cd "$PROJECT_DIR"
if [ ! -d .git ]; then git init -b main >/dev/null 2>&1 || git init >/dev/null; fi
git add -A
git -c user.name="$(whoami)" -c user.email="$(whoami)@local" commit -m "更新《今天拍什么？》 $(date '+%Y-%m-%d %H:%M')" >/dev/null 2>&1 || echo "（没有新改动，跳过提交）"

# 4. 推送（token 只出现在这一次命令里，不写进 .git/config）
echo "==> 推送到 GitHub…"
FORCE_FLAG=""
if [ "$PUSH_FORCE" = "1" ]; then FORCE_FLAG="--force"; fi
# 国内网络直连 GitHub 时 HTTP/2 容易报 "HTTP2 framing layer" 错误，强制走 HTTP/1.1
git -c http.version=HTTP/1.1 -c http.postBuffer=524288000 push --quiet $FORCE_FLAG \
  "https://x-access-token:${TOKEN}@github.com/${REPO}.git" HEAD:main

# 5. 开启或更新 GitHub Pages（main 分支 /docs 目录）
echo "==> 配置 GitHub Pages…"
PAGES_CODE=$(curl -s -o /private/tmp/gh-pages.json -w '%{http_code}' -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "$API/repos/$REPO/pages" \
  -d '{"source":{"branch":"main","path":"/docs"}}')
if [ "$PAGES_CODE" != "201" ]; then
  curl -s -o /private/tmp/gh-pages.json -X PUT \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
    "$API/repos/$REPO/pages" \
    -d '{"source":{"branch":"main","path":"/docs"}}' >/dev/null
fi

echo
echo "✅ 发布完成"
echo "网址（首次部署等 1～2 分钟生效）："
echo "   https://${OWNER}.github.io/${NAME}/"
