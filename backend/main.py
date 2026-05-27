"""
AI Academic Chat - Backend
FastAPI + DeepSeek V4 + 用户认证 + 用量计费
"""

import json
import os
from typing import AsyncGenerator
from datetime import date

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from db import init_db, get_db
from auth import (
    hash_password, verify_password, make_token, decode_token,
    generate_verify_code, send_verify_email, FREE_QUOTA, PRICE_PER_PACKAGE,
)

load_dotenv()

app = FastAPI(title="Bioinfo Agent API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://bioinfo-agent.com", "http://www.bioinfo-agent.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-pro")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1/chat/completions"

security = HTTPBearer(auto_error=False)


# ── 启动初始化 ──
@app.on_event("startup")
async def startup():
    await init_db()


# ═══════════════════════════════════════════
#  Pydantic 模型
# ═══════════════════════════════════════════

class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
    nickname: str = Field("", max_length=50)


class VerifyRequest(BaseModel):
    email: str
    code: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    temperature: float = Field(0.7, ge=0, le=2.0)
    max_tokens: int = Field(4096, ge=1, le=8192)


# ═══════════════════════════════════════════
#  认证依赖
# ═══════════════════════════════════════════

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """从 JWT 解析当前用户，未登录抛 401"""
    if not credentials:
        raise HTTPException(status_code=401, detail="请先登录")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="登录已过期，请重新登录")
    return payload


async def check_usage(user: dict = Depends(get_current_user)) -> dict:
    """检查用户用量，返回 usage 行"""
    db = await get_db()
    try:
        row = await db.execute(
            "SELECT * FROM usage WHERE user_id = ?", (user["user_id"],)
        )
        usage = await row.fetchone()
        if not usage:
            await db.execute(
                "INSERT INTO usage (user_id, count, paid, reset_at) VALUES (?, 0, 0, ?)",
                (user["user_id"], str(date.today())),
            )
            await db.commit()
            return {"count": 0, "paid": 0, "reset_at": str(date.today())}

        # 每天重置免费额度
        today = str(date.today())
        usage_dict = dict(usage)
        if usage_dict["reset_at"] != today and usage_dict["paid"] == 0:
            usage_dict["count"] = 0
            usage_dict["reset_at"] = today
            await db.execute(
                "UPDATE usage SET count = 0, reset_at = ? WHERE user_id = ?",
                (today, user["user_id"]),
            )
            await db.commit()

        return usage_dict
    finally:
        await db.close()


# ═══════════════════════════════════════════
#  认证接口
# ═══════════════════════════════════════════

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    """注册：创建用户 + 发送验证码"""
    db = await get_db()
    try:
        # 检查邮箱是否已注册
        existing = await db.execute(
            "SELECT id FROM users WHERE email = ?", (req.email.strip().lower(),)
        )
        if await existing.fetchone():
            raise HTTPException(status_code=409, detail="该邮箱已注册")

        code = generate_verify_code()
        hashed = hash_password(req.password)

        cursor = await db.execute(
            "INSERT INTO users (email, password, nickname, verify_code) VALUES (?, ?, ?, ?)",
            (req.email.strip().lower(), hashed, req.nickname.strip(), code),
        )
        await db.commit()
        user_id = cursor.lastrowid

        # 初始化用量记录
        await db.execute(
            "INSERT INTO usage (user_id, count, paid, reset_at) VALUES (?, 0, 0, ?)",
            (user_id, str(date.today())),
        )
        await db.commit()

        send_verify_email(req.email.strip().lower(), code)

        return {
            "ok": True,
            "message": "注册成功，请查收验证码",
            "user_id": user_id,
            # 开发模式下返回验证码（SMTP 未配置时）
            "debug_code": code if not os.getenv("SMTP_HOST") else None,
        }
    finally:
        await db.close()


@app.post("/api/auth/verify")
async def verify_email(req: VerifyRequest):
    """验证邮箱"""
    db = await get_db()
    try:
        row = await db.execute(
            "SELECT id, verify_code, verified FROM users WHERE email = ?",
            (req.email.strip().lower(),),
        )
        user = await row.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="邮箱未注册")
        if user["verified"]:
            return {"ok": True, "message": "邮箱已验证（无需重复验证）"}
        if user["verify_code"] != req.code.strip():
            raise HTTPException(status_code=400, detail="验证码错误")

        await db.execute(
            "UPDATE users SET verified = 1, verify_code = NULL WHERE id = ?",
            (user["id"],),
        )
        await db.commit()

        token = make_token(user["id"], req.email.strip().lower())
        return {"ok": True, "message": "验证成功", "token": token}
    finally:
        await db.close()


@app.post("/api/auth/login")
async def login(req: LoginRequest):
    """登录"""
    db = await get_db()
    try:
        row = await db.execute(
            "SELECT id, email, password, verified, nickname FROM users WHERE email = ?",
            (req.email.strip().lower(),),
        )
        user = await row.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="邮箱或密码错误")
        if not verify_password(req.password, user["password"]):
            raise HTTPException(status_code=401, detail="邮箱或密码错误")
        if not user["verified"]:
            raise HTTPException(status_code=403, detail="请先验证邮箱")

        token = make_token(user["id"], user["email"])
        return {
            "ok": True,
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "nickname": user["nickname"],
            },
        }
    finally:
        await db.close()


@app.get("/api/auth/me")
async def me(user: dict = Depends(get_current_user)):
    """获取当前用户信息 + 用量"""
    db = await get_db()
    try:
        row = await db.execute(
            "SELECT id, email, nickname, verified, created_at FROM users WHERE id = ?",
            (user["user_id"],),
        )
        u = await row.fetchone()
        if not u:
            raise HTTPException(status_code=404)

        usage = await check_usage(user)
        return {
            "user": dict(u),
            "usage": {
                "count": usage["count"],
                "free_quota": FREE_QUOTA,
                "remaining": max(0, FREE_QUOTA - usage["count"]),
                "paid": bool(usage["paid"]),
            },
        }
    finally:
        await db.close()


# ═══════════════════════════════════════════
#  对话接口（需认证 + 用量检查）
# ═══════════════════════════════════════════

@app.get("/api/health")
async def health():
    return {"status": "ok", "model": DEEPSEEK_MODEL, "version": "2.0.0"}


@app.post("/api/chat")
async def chat(
    req: ChatRequest,
    user: dict = Depends(get_current_user),
):
    """流式对话 — 需登录 + 未超免费额度"""
    if not DEEPSEEK_API_KEY or DEEPSEEK_API_KEY == "your-deepseek-api-key-here":
        raise HTTPException(status_code=500, detail="请先设置 DEEPSEEK_API_KEY")

    usage = await check_usage(user)

    # 免费额度用完且未付费 → 拒绝
    if not usage["paid"] and usage["count"] >= FREE_QUOTA:
        raise HTTPException(
            status_code=402,
            detail=f"今日免费额度({FREE_QUOTA}条)已用完，请付费继续使用",
        )

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    # 消费一条额度
    db = await get_db()
    try:
        await db.execute(
            "UPDATE usage SET count = count + 1 WHERE user_id = ?",
            (user["user_id"],),
        )
        await db.commit()
    finally:
        await db.close()

    return StreamingResponse(
        _deepseek_stream(messages, req.temperature, req.max_tokens),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


async def _deepseek_stream(
    messages: list[dict], temperature: float, max_tokens: int
) -> AsyncGenerator[str, None]:
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", DEEPSEEK_BASE_URL, json=payload, headers=headers) as resp:
            if resp.status_code != 200:
                body = await resp.aread()
                raise HTTPException(status_code=resp.status_code, detail=body.decode())
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data.strip() == "[DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content")
                        if content:
                            yield f"data: {json.dumps({'content': content})}\n\n"
                    except json.JSONDecodeError:
                        continue


# ═══════════════════════════════════════════
#  支付接口
# ═══════════════════════════════════════════

@app.get("/api/payment/status")
async def payment_status(user: dict = Depends(get_current_user)):
    usage = await check_usage(user)
    return {
        "free_quota": FREE_QUOTA,
        "used": usage["count"],
        "remaining": max(0, FREE_QUOTA - usage["count"]),
        "paid": bool(usage["paid"]),
        "price": PRICE_PER_PACKAGE,
    }


@app.post("/api/payment/create")
async def create_payment(user: dict = Depends(get_current_user)):
    """创建支付订单 — 返回支付信息"""
    db = await get_db()
    try:
        cursor = await db.execute(
            "INSERT INTO payments (user_id, amount, status) VALUES (?, ?, 'pending')",
            (user["user_id"], PRICE_PER_PACKAGE),
        )
        await db.commit()
        order_id = cursor.lastrowid
        return {
            "ok": True,
            "order_id": order_id,
            "amount": PRICE_PER_PACKAGE,
            "message": f"订单已创建，金额 ¥{PRICE_PER_PACKAGE}，请完成支付",
        }
    finally:
        await db.close()


@app.post("/api/payment/confirm")
async def confirm_payment(order_id: int, user: dict = Depends(get_current_user)):
    """确认支付（管理员或支付回调使用）"""
    db = await get_db()
    try:
        row = await db.execute(
            "SELECT * FROM payments WHERE id = ? AND user_id = ?",
            (order_id, user["user_id"]),
        )
        payment = await row.fetchone()
        if not payment:
            raise HTTPException(status_code=404, detail="订单不存在")

        await db.execute(
            "UPDATE payments SET status = 'paid' WHERE id = ?", (order_id,)
        )
        await db.execute(
            "UPDATE usage SET paid = 1 WHERE user_id = ?", (user["user_id"],)
        )
        await db.commit()
        return {"ok": True, "message": "支付成功，无限量使用已开启"}
    finally:
        await db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
