#!/usr/bin/env bash
# ── Bioinfo Agent 一键部署脚本 ──
# 用法: chmod +x deploy.sh && ./deploy.sh
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║   生信助理 · Bioinfo Agent 部署       ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── 检查 Node.js ──
if ! command -v node &>/dev/null; then
  echo -e "${YELLOW}📦 安装 Node.js 22…${NC}"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo -e "${GREEN}✅ Node $(node -v)${NC}"

# ── 检查 Python ──
if ! command -v python3 &>/dev/null; then
  sudo apt-get install -y python3 python3-pip python3-venv
fi
echo -e "${GREEN}✅ Python $(python3 --version)${NC}"

# ── 后端 ──
echo -e "\n${CYAN}📦 配置后端…${NC}"
cd "$ROOT_DIR/backend"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠️  请编辑 backend/.env 填入 DEEPSEEK_API_KEY${NC}"
fi

python3 -m venv venv
source venv/bin/activate
pip install -q -r requirements.txt
echo -e "${GREEN}✅ 后端依赖安装完成${NC}"

# ── 前端 ──
echo -e "\n${CYAN}📦 配置前端…${NC}"
cd "$ROOT_DIR/frontend"
npm install --silent
echo -e "${GREEN}✅ 前端依赖安装完成${NC}"

# ── Nginx（可选） ──
echo -e "\n${CYAN}🔧 配置 Nginx（如已安装）…${NC}"
if command -v nginx &>/dev/null; then
  sudo tee /etc/nginx/sites-available/bioinfo-agent > /dev/null << 'NGINX'
server {
    listen 80;
    server_name bioinfo-agent.com www.bioinfo-agent.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
    }
}
NGINX
  sudo ln -sf /etc/nginx/sites-available/bioinfo-agent /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl restart nginx
  echo -e "${GREEN}✅ Nginx 已配置${NC}"
else
  echo -e "${YELLOW}⚠️  Nginx 未安装（可选），跳过。直接访问 http://IP:3000${NC}"
fi

# ── Systemd 服务（可选） ──
echo -e "\n${CYAN}🔧 配置开机自启（systemd）…${NC}"
cat << SYSTEMD | sudo tee /etc/systemd/system/bioinfo-backend.service > /dev/null
[Unit]
Description=Bioinfo Agent Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$ROOT_DIR/backend
ExecStart=$ROOT_DIR/backend/venv/bin/python main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SYSTEMD

cat << SYSTEMD | sudo tee /etc/systemd/system/bioinfo-frontend.service > /dev/null
[Unit]
Description=Bioinfo Agent Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$ROOT_DIR/frontend
ExecStart=$(which npx) next start -p 3000 -H 0.0.0.0
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SYSTEMD

sudo systemctl daemon-reload
echo -e "${GREEN}✅ Systemd 服务已创建${NC}"

# ── 完成 ──
echo ""
echo -e "${GREEN}═══════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ 部署完成！${NC}"
echo ""
echo "  启动方式："
echo "  ┌─────────────────────────────────────────┐"
echo "  │ 手动: cd backend && source venv/bin/activate && python main.py & │"
echo "  │       cd frontend && npm run dev &       │"
echo "  │                                         │"
echo "  │ 自启: sudo systemctl start bioinfo-backend  │"
echo "  │       sudo systemctl start bioinfo-frontend │"
echo "  │                                         │"
echo "  │ 前端: http://服务器IP:3000                │"
echo "  │ 后端: http://服务器IP:8000/docs           │"
echo "  └─────────────────────────────────────────┘"
echo ""
echo -e "${YELLOW}  ⚠️  别忘了编辑 backend/.env 填 API Key！${NC}"
echo -e "${GREEN}═══════════════════════════════════${NC}"
