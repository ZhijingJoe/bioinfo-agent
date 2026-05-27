#!/usr/bin/env bash
# ── AI Academic Chat 启动脚本 ──
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  AI Academic Chat — 学术对话助手"
echo "  DeepSeek V4 · CNS 学术配色"
echo "============================================"

# ── 检查 .env ──
if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  echo ""
  echo "⚠️  未找到 backend/.env，从 .env.example 创建…"
  cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
  echo "📝 请编辑 backend/.env 填入你的 DEEPSEEK_API_KEY"
  echo ""
fi

# ── 安装后端依赖 ──
echo "📦 安装 Python 后端依赖…"
cd "$ROOT_DIR/backend"
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt 2>/dev/null

# ── 安装前端依赖 ──
echo "📦 安装前端依赖…"
cd "$ROOT_DIR/frontend"
npm install --silent 2>/dev/null || true

# ── 启动后端 ──
echo "🚀 启动后端 (FastAPI :8000)…"
cd "$ROOT_DIR/backend"
source venv/bin/activate
python main.py &
BACKEND_PID=$!

# ── 启动前端 ──
echo "🚀 启动前端 (Next.js :3000)…"
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  ✅ 服务已启动"
echo "  🌐 前端: http://localhost:3000"
echo "  🔌 后端: http://localhost:8000"
echo "  📋 API:  http://localhost:8000/docs"
echo "============================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

# ── 优雅退出 ──
trap "echo ''; echo '🛑 正在停止服务…'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
