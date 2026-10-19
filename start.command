#!/bin/bash
# MOTIONFORGE 本地启动器（macOS 双击运行）
cd "$(dirname "$0")" || exit 1

PORT=8899

# 端口已被占用就直接打开，避免重复起服务
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  open "http://127.0.0.1:$PORT/"
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "未找到 python3。请先安装 Xcode 命令行工具：xcode-select --install"
  read -r -p "按回车关闭…"
  exit 1
fi

echo "MOTIONFORGE 启动中 → http://127.0.0.1:$PORT/"
echo "关闭此终端窗口即停止本地服务。"
python3 -m http.server $PORT &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT INT TERM

sleep 1
open "http://127.0.0.1:$PORT/"
wait $SERVER_PID
