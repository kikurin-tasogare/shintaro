#!/bin/bash
# 心友 Bulk Log 起動スクリプト
cd "$(dirname "$0")"
PORT=${1:-8080}
echo ""
echo "  🌿 心友 Bulk Log — 増量トレーニング記録"
echo "  ─────────────────────────────────────"
echo "  ブラウザで開いてください:"
echo "  → http://localhost:$PORT"
echo ""
echo "  停止: Ctrl+C"
echo ""
python3 -m http.server "$PORT"
