#!/bin/zsh
cd "$(dirname "$0")"

BUNDLED_NODE="/Users/aoyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ -x "$BUNDLED_NODE" ]; then
  NODE="$BUNDLED_NODE"
else
  NODE="$(command -v node)"
fi

if [ -z "$NODE" ]; then
  echo "没有找到 Node.js，请改用「今天拍什么-单文件版.html」直接打开。"
  read -r "?按回车关闭…"
  exit 1
fi

echo "《今天拍什么？》启动中……"
echo "地址：http://localhost:5173/"
echo "关闭这个窗口即停止服务。"
(sleep 2; open "http://localhost:5173/") &
"$NODE" node_modules/vite/bin/vite.js --port 5173 --strictPort
