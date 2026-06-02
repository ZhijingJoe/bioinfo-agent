# AI Academic Chat

基于 **DeepSeek V4** 的学术AI 助手，前端 Next.js + 后端 FastAPI。


| 色名 | 色值 | 用途 |
|------|------|------|
| 藏蓝 Navy | `#1B3A5C` | 导航栏、主按钮、用户消息 |
| 暗红 Red | `#8C1B2E` | 警告/删除按钮 |
| 墨绿 Teal | `#2E5A5C` | 辅助强调 |
| 金棕 Gold | `#8B6914` | 图标高亮 |
| 纸白 Paper | `#FAFAF8` | AI 消息背景 |
| 米黄 Cream | `#F5F3EE` | 页面底色 |
| 墨色 Ink | `#2C2C2C` | 主文字 |

## 快速开始

### 1. 配置 API Key

```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入你的 DEEPSEEK_API_KEY
```

### 2. 一键启动

```bash
chmod +x start.sh
./start.sh
```

### 3. 手动启动

```bash
# 终端 1: 后端
cd backend
pip install -r requirements.txt
python main.py

# 终端 2: 前端
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## API 文档

后端 Swagger: http://localhost:8000/docs

## 项目结构

```
ai-academic-chat/
├── backend/
│   ├── main.py           # FastAPI 后端
│   ├── requirements.txt  # Python 依赖
│   └── .env              # API Key 配置
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx
│   │       ├── page.tsx      # 主页面 + 对话组件
│   │       └── globals.css   # 样式
│   ├── tailwind.config.ts    # 色彩
│   ├── next.config.js        # API 代理
│   └── package.json
└── start.sh              # 一键启动脚本
```
